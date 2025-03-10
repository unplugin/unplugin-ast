import { toArray, type Arrayable } from '@antfu/utils'
import { isCallOf, isTaggedFunctionCallOf } from 'ast-kit'
import type { Transformer } from '../types'
import type { CallExpression, TaggedTemplateExpression } from '@babel/types'

/**
 * Removes wrapper function. e.g `defineComponent`, `defineConfig`...
 * @param functionNames - function names to remove
 * @returns Transformer
 */
export function RemoveWrapperFunction(
  functionNames: Arrayable<string>,
): Transformer<CallExpression | TaggedTemplateExpression> {
  return {
    onNode: (node) =>
      isCallOf(node, toArray(functionNames)) ||
      isTaggedFunctionCallOf(node, toArray(functionNames)),

    transform(node) {
      if (node.type === 'TaggedTemplateExpression') return node.quasi
      return node.arguments[0]
    },
  }
}
