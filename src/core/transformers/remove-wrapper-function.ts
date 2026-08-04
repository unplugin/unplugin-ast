import { toArray, type Arrayable } from '@antfu/utils'
import { unwrap } from 'yuku-ast'
import type { Transformer } from '../types.ts'
import type {
  CallExpression,
  Expression,
  Node,
  TaggedTemplateExpression,
} from 'yuku-parser'

function isCallOf(
  node: Node,
  functionNames: readonly string[],
): node is CallExpression | TaggedTemplateExpression {
  let name: Expression
  if (node.type === 'CallExpression') {
    name = unwrap(node.callee)
  } else if (node.type === 'TaggedTemplateExpression') {
    name = unwrap(node.tag)
  } else {
    return false
  }
  return name.type === 'Identifier' && functionNames.includes(name.name)
}

/**
 * Removes wrapper function. e.g `defineComponent`, `defineConfig`...
 * @param functionNames - function names to remove
 * @returns Transformer
 */
export function RemoveWrapperFunction(
  functionNames: Arrayable<string>,
): Transformer<CallExpression | TaggedTemplateExpression> {
  const names = toArray(functionNames)
  return {
    onNode: (node) => isCallOf(node, names),
    transform(node) {
      if (node.type === 'TaggedTemplateExpression') return node.quasi
      return node.arguments[0]
    },
  }
}
