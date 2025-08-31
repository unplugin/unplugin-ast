import { babelParse, getLang, walkASTAsync } from 'ast-kit'
import {
  generateTransform,
  MagicStringAST,
  type CodeTransform,
} from 'magic-string-ast'
import { useNodeRef } from './utils'
import type { OptionsResolved } from './options'
import type { Transformer, TransformerParsed } from './types'
import type { BlockStatement, Node } from '@babel/types'

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
      }),
    )
  ).filter((t): t is TransformerParsed => !!t)
  return transformers
}

export async function transform(
  code: string,
  id: string,
  options: Pick<OptionsResolved, 'parserOptions' | 'transformer'>,
): Promise<CodeTransform | undefined> {
  const { getNodeRef } = useNodeRef()

  const transformers = await getTransformersByFile(options.transformer, id)
  if (transformers.length === 0) return

  const program = babelParse(code, getLang(id), options.parserOptions)

  await walkASTAsync(program, {
    async enter(node, parent, key, index) {
      for (const { transformer, nodes } of transformers) {
        if (transformer.onNode) {
          const bool = await transformer.onNode?.(node, parent, index)
          if (!bool) continue
        }
        nodes.push(getNodeRef(node))
      }
    },
  })

  const s = new MagicStringAST(code)
  for (const { transformer, nodes } of transformers) {
    for (const node of nodes) {
      const value = node.value
      if (!value) continue
      const result = await transformer.transform(value, code, { id })

      if (result) {
        let newAST: Node
        if (typeof result === 'string') {
          s.overwriteNode(value, result)
          newAST = (
            babelParse(`{${result}}`, getLang(id), options.parserOptions)
              .body[0] as BlockStatement
          ).body[0]
          if (newAST.type === 'ExpressionStatement') {
            newAST = newAST.expression
          }
          newAST.start = value.start!
          newAST.end = value.end!
        } else {
          let { default: generate } = await import('@babel/generator')
          // @ts-expect-error interop default
          generate = (generate.default as undefined) || generate
          const generated = generate(result)
          let code = generated.code
          if (result.type.endsWith('Expression')) code = `(${code})`
          s.overwriteNode(value, code)
          newAST = result
        }

        node.set(newAST)
      } else if (result === false) {
        // removes node
        node.set(undefined)
        s.removeNode(value)
      }
    }
  }

  for (const { transformer } of transformers) {
    await transformer.finalize?.(s)
  }

  return generateTransform(s, id)
}
