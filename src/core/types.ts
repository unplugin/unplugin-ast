import type { Awaitable } from '@antfu/utils'
import type { Node } from '@babel/types'
import type { MagicStringAST } from 'magic-string-ast'

export interface TransformerParsed {
  transformer: Transformer
  nodes: NodeRef<Node | undefined>[]
}

export interface NodeRef<T = Node> {
  value: T
  set: (node: T) => void
}

export interface Transformer<T extends Node = Node> {
  /**
   * Filter files to transform
   * @param id - filename
   * @returns whether to include the file
   */
  transformInclude?: (id: string) => Awaitable<boolean>
  /**
   * Filter nodes to transform
   */
  onNode?:
    | ((
        node: Node,
        parent: Node | null | undefined,
        index: number | null | undefined,
      ) => Awaitable<boolean>)
    | ((
        node: Node,
        parent: Node | null | undefined,
        index: number | null | undefined,
      ) => node is T)
  /**
   * Transform the node to a new node or string
   *
   * @returns the new node or string, or `false` to remove the node
   */
  transform: (
    node: T,
    code: string,
    context: {
      id: string
    },
  ) => Awaitable<string | Node | false | undefined | null>
  /**
   * It will be called after all nodes are transformed
   */
  finalize?: (s: MagicStringAST) => Awaitable<void>
}
