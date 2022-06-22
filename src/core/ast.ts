import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import type { Awaitable } from '@antfu/utils'
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

export const walkAst = async (
  nodes: Node[],
  callback: (node: Node, parent: Node) => Awaitable<void>
) => {
  const promises: Promise<void>[] = []
  walk(nodes, {
    enter(node: Node, parent: Node) {
      if (!node.type) return
      promises.push(Promise.resolve(callback(node, parent)))
    },
  })
  await Promise.all(promises)
}
