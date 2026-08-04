import {
  generateTransform,
  MagicStringAST,
  type CodeTransform,
} from 'magic-string-ast'
import { walkAsync } from 'yuku-ast'
import {
  langFromPath,
  parse,
  sourceTypeFromPath,
  type Node,
  type ParseOptions,
  type Program,
} from 'yuku-parser'
import { useNodeRef } from './utils.ts'
import type { OptionsResolved } from './options.ts'
import type { Transformer, TransformerParsed } from './types.ts'

function parseProgram(code: string, id: string, parserOptions: ParseOptions) {
  const path = id.replace(/[?#].*$/, '')
  const langFromId = langFromPath(id)
  const sourceTypeFromId = sourceTypeFromPath(id)
  const result = parse(code, {
    lang: langFromId === 'js' ? langFromPath(path) : langFromId,
    sourceType:
      sourceTypeFromId === 'module'
        ? sourceTypeFromPath(path)
        : sourceTypeFromId,
    ...parserOptions,
  })
  const error = result.diagnostics.find(
    (diagnostic) => diagnostic.severity === 'error',
  )
  if (error) {
    throw new SyntaxError(`${error.message} (${id}:${error.start})`)
  }
  return result.program
}

function parseReplacement(
  code: string,
  id: string,
  parserOptions: ParseOptions,
): Node {
  const block = parseProgram(`{${code}}`, id, parserOptions).body[0]
  if (block?.type !== 'BlockStatement' || !block.body[0]) {
    throw new SyntaxError('Transformer returned an empty replacement')
  }
  return block.body[0]
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
  if (!transformers.length) return

  const program = parseProgram(code, id, options.parserOptions)

  await walkAsync(program, {
    async enter(node, context) {
      for (const { transformer, nodes } of transformers) {
        if (transformer.onNode) {
          const bool = await transformer.onNode(
            node,
            context.parent,
            context.index,
          )
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
          newAST = parseReplacement(result, id, options.parserOptions)
          if (newAST.type === 'ExpressionStatement') {
            newAST = newAST.expression
          }
          newAST.start = value.start
          newAST.end = value.end
        } else {
          const { generate } = await import('yuku-codegen')
          const generated = generate(result as Program)
          let code = generated.code
          if (result.type.endsWith('Expression')) code = `(${code})`
          s.overwriteNode(value, code)
          newAST = {
            ...result,
            start: value.start,
            end: value.end,
          }
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
