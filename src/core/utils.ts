import { type Node } from '@babel/types'
import { type NodeRef } from './types'

export function useNodeRef() {
  const nodeRefs: Map<Node, NodeRef<Node | undefined>> = new Map()

  const getNodeRef = (node: Node) => {
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

  return {
    nodeRefs,
    getNodeRef,
  }
}
