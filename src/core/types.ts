import type { Awaitable } from '@antfu/utils'
import type { Node } from '@babel/types'

export interface TransformerParsed {
  transformer: Transformer
  nodes: NodeRef[]
}

export interface NodeRef {
  value: Node
  set: (node: Node) => void
}

export interface Transformer<T extends Node = Node> {
  transformInclude?: (id: string) => Awaitable<boolean>
  onNode?:
    | ((node: Node, parent: Node) => Awaitable<boolean>)
    | ((node: Node, parent: Node) => node is T)
  transform: (
    node: T,
    code: string,
    context: {
      id: string
    }
  ) => Awaitable<string | Node | undefined | null | void>
}
