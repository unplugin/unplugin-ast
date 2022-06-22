import { parse } from '@babel/parser'
import type { Node } from '@babel/types'
import type { ParserOptions, ParserPlugin } from '@babel/parser'

export const parseCode = (
  code: string,
  id: string,
  parserOptions: ParserOptions
): Node[] => {
  const plugins: ParserPlugin[] = []
  if (/\.[jt]sx$/.test(id)) {
    plugins.push('jsx')
  }
  if (/\.tsx?$/.test(id)) {
    plugins.push('typescript')
  }
  const ast = parse(code, {
    sourceType: 'module',
    plugins,
    ...parserOptions,
  })
  return ast.program.body
}
