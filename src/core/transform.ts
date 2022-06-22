import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { parseCode } from './parse'
import type { NodeRef, Transformer, TransformerParsed } from './types'
import type { SourceMap } from 'rollup'
import type { ExpressionStatement, Node } from '@babel/types'
import type { OptionsResolved } from './options'

const nodeRefs: Map<Node, NodeRef> = new Map()
function getNodeRef(node: Node) {
  if (nodeRefs.has(node)) return nodeRefs.get(node)!
  const ref: NodeRef = {
    value: node,
    set(node: Node) {
      this.value = node
    },
  }
  nodeRefs.set(node, ref)
  return ref
}

async function getTransformersByFile(transformer: Transformer[], id: string) {
  const transformers = (
    await Promise.all(
      transformer.map(async (t): Promise<TransformerParsed | undefined> => {
        if (t.transformInclude && !(await t.transformInclude(id)))
          return undefined
        return {
          transformer: t,
          nodes: [],
        }
      })
    )
  ).filter((t): t is TransformerParsed => !!t)
  return transformers
}

export const transform = async (
  code: string,
  id: string,
  options: Pick<OptionsResolved, 'parserOptions' | 'transformer'>
): Promise<{ code: string; map: SourceMap } | undefined> => {
  const transformers = await getTransformersByFile(options.transformer, id)
  if (transformers.length === 0) return

  const nodes = parseCode(code, id, options.parserOptions)

  const promises: Promise<void>[] = []
  walk(nodes, {
    enter(node: Node, parent: Node) {
      if (!node.type) return
      const p = (async () => {
        for (const { transformer, nodes } of transformers) {
          if (transformer.onNode) {
            const bool = await transformer.onNode?.(node, parent)
            if (!bool) continue
          }
          nodes.push(getNodeRef(node))
        }
      })()
      promises.push(p)
    },
  })

  await Promise.all(promises)

  const s = new MagicString(code)
  for (const { transformer, nodes } of transformers) {
    for (const node of nodes) {
      const value = node.value
      const result = await transformer.transform(value, code, { id })
      if (!result) continue

      let newAST: Node
      if (typeof result === 'string') {
        s.overwrite(value.start!, value.end!, result)
        newAST = (
          parseCode(
            `(${result})`,
            id,
            options.parserOptions
          )[0] as ExpressionStatement
        ).expression
        newAST.start = value.start!
        newAST.end = value.end!
      } else {
        s.overwrite(
          value.start!,
          value.end!,
          s.slice(result.start!, result.end!)
        )
        newAST = result
      }

      node.set(newAST)
    }
  }
  if (!s.hasChanged()) return undefined

  return {
    code: s.toString(),
    get map() {
      return s.generateMap({
        source: id,
        includeContent: true,
      })
    },
  }
}
