import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { parseCode } from './parse'
import type { TransformResult } from 'unplugin'
import type { Node } from '@babel/types'
import type { OptionsResolved, Transformer } from './options'

export const transform = async (
  code: string,
  id: string,
  options: Pick<OptionsResolved, 'parserOptions' | 'transformer'>
): Promise<TransformResult> => {
  interface TransformerParsed {
    transformer: Transformer
    nodes: Node[]
  }

  const transformers = (
    await Promise.all(
      options.transformer.map(
        async (t): Promise<TransformerParsed | undefined> => {
          if (t.filterFile && !(await t.filterFile(id))) return undefined
          return {
            transformer: t,
            nodes: [],
          }
        }
      )
    )
  ).filter((t): t is TransformerParsed => !!t)
  if (transformers.length === 0) return

  const nodes = parseCode(code, id, options.parserOptions)

  const promises: Promise<void>[] = []
  walk(nodes, {
    enter(node: Node, parent: Node) {
      if (!node.type) return
      const p = (async () => {
        for (const { transformer, nodes } of transformers) {
          if (transformer.filterNode) {
            const bool = await transformer.filterNode?.(node, parent)
            if (!bool) continue
          }
          nodes.push(node)
        }
      })()
      promises.push(p)
    },
  })

  await Promise.all(promises)

  const s = new MagicString(code)
  for (const { transformer, nodes } of transformers) {
    for (const node of nodes) {
      await transformer.transform(node, s, { id })
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
