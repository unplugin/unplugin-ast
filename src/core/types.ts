import type { Awaitable } from '@antfu/utils'
import type { Node } from '@babel/types'

export interface TransformerParsed {
  transformer: Transformer
  nodes: {
    node: NodeRef<Node | undefined>
  }[]
}

export interface NodeRef<T = Node> {
  value: T
  set: (node: T) => void
}

export interface Transformer<T extends Node = Node> {
  transformInclude?: (id: string) => Awaitable<boolean>
  onNode?:
    | ((
        node: Node,
        parent: Node | undefined,
        index: number | null
      ) => Awaitable<boolean>)
    | ((
        node: Node,
        parent: Node | undefined,
        index: number | null
      ) => node is T)
  transform: (
    node: T,
    code: string,
    context: {
      id: string
    }
  ) => Awaitable<string | Node | false | undefined | null | void>
}
