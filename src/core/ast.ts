import { type Awaitable } from '@antfu/utils'
import { type Node } from '@babel/types'
import { walkAST } from 'ast-kit'

export async function walkAst(
  node: Node,
  callback: (
    node: Node,
    parent: Node | null | undefined,
    index: number | null | undefined
  ) => Awaitable<void>
) {
  const promises: Promise<void>[] = []

  walkAST<Node>(node, {
    enter(node, parent, key, index) {
      if (!node.type) return
      promises.push(Promise.resolve(callback(node, parent, index)))
    },
  })
  await Promise.all(promises)
}
