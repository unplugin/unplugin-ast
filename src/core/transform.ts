import MagicString from 'magic-string'
import generate from '@babel/generator'
import { parseCode, walkAst } from './ast'
import { useNodeRef } from './utils'
import type { Transformer, TransformerParsed } from './types'
import type { SourceMap } from 'rollup'
import type { Node } from '@babel/types'
import type { OptionsResolved } from './options'

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
  const { getNodeRef } = useNodeRef()

  const transformers = await getTransformersByFile(options.transformer, id)
  if (transformers.length === 0) return

  const program = parseCode(code, id, options.parserOptions)

  await walkAst(program, async (node, parent, index) => {
    for (const { transformer, nodes } of transformers) {
      if (transformer.onNode) {
        const bool = await transformer.onNode?.(node, parent, index)
        if (!bool) continue
      }
      nodes.push({
        node: getNodeRef(node),
      })
    }
  })

  const s = new MagicString(code)
  for (const { transformer, nodes } of transformers) {
    for (const { node } of nodes) {
      const value = node.value
      if (!value) continue
      const result = await transformer.transform(value, code, { id })

      if (result) {
        let newAST: Node
        if (typeof result === 'string') {
          s.overwrite(value.start!, value.end!, result)
          newAST = parseCode(result, id, options.parserOptions).body[0]
          if (newAST.type === 'ExpressionStatement') {
            newAST = newAST.expression
          }
          newAST.start = value.start!
          newAST.end = value.end!
        } else {
          const generated = generate(result)
          let code = generated.code
          if (result.type.endsWith('Expression')) code = `(${code})`
          s.overwrite(value.start!, value.end!, code)
          newAST = result
        }

        node.set(newAST)
      } else if (result === false) {
        // removes node
        node.set(undefined)
        s.remove(value.start!, value.end!)
      }
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
