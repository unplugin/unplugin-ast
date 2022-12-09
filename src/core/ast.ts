import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import type { Awaitable } from '@antfu/utils'
import type { Node, Program } from '@babel/types'
import type { ParserOptions, ParserPlugin } from '@babel/parser'

export const parseCode = (
  code: string,
  id: string,
  parserOptions: ParserOptions
): Program => {
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
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
  })
  return ast.program
}

export const walkAst = async (
  node: Node,
  callback: (node: Node, parent: Node, index: number) => Awaitable<void>
) => {
  const promises: Promise<void>[] = []
  // @ts-expect-error
  walk(node, {
    enter(node: Node, parent: Node, key, index) {
      if (!node.type) return
      promises.push(Promise.resolve(callback(node, parent, index)))
    },
  })
  await Promise.all(promises)
}
