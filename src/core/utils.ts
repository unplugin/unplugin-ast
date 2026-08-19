import type { NodeRef } from './types.ts'
import type { Node } from 'yuku-parser'

export function useNodeRef(): (node: Node) => NodeRef<Node | undefined> {
  const nodeRefs: Map<Node, NodeRef<Node | undefined>> = new Map()

  function getNodeRef(node: Node): NodeRef<Node | undefined> {
    if (nodeRefs.has(node)) return nodeRefs.get(node)!
    const ref: NodeRef<Node | undefined> = {
      value: node,
      set(node) {
        this.value = node
      },
    }
    nodeRefs.set(node, ref)
    return ref
  }

  return getNodeRef
}
