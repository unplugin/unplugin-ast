import type { Node } from '@babel/types'
import type { NodeRef } from './types'

export function useNodeRef() {
  const nodeRefs: Map<Node, NodeRef> = new Map()
  function getNodeRef(node: Node) {
    if (nodeRefs.has(node)) return nodeRefs.get(node)!
    const ref: NodeRef = {
      value: node,
      set(node: Node) {
        this.value = node
      },
    }
    nodeRefs.set(node, ref)
    return ref
  }
  return { nodeRefs, getNodeRef }
}
