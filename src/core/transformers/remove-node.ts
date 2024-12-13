import type { Transformer } from '../types'
import type { Awaitable } from '@antfu/utils'
import type { Node } from '@babel/types'

/**
 * Removes arbitrary nodes.
 * @returns Transformer
 */
export function RemoveNode(
  onNode: (
    node: Node,
    parent: Node | null | undefined,
    index: number | null | undefined,
  ) => Awaitable<boolean>,
): Transformer {
  return {
    onNode,
    transform: () => false,
  }
}
