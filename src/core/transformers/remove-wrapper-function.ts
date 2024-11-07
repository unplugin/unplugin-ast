import { type Arrayable, toArray } from '@antfu/utils'
import { isCallOf, isTaggedFunctionCallOf } from 'ast-kit'
import type { CallExpression, TaggedTemplateExpression } from '@babel/types'
import type { Transformer } from '../types'

/**
 * Removes wrapper function. e.g `defineComponent`, `defineConfig`...
 * @param functionNames - function names to remove
 * @returns Transformer
 */
export const RemoveWrapperFunction = (
  functionNames: Arrayable<string>,
): Transformer<CallExpression | TaggedTemplateExpression> => ({
  onNode: (node) =>
    isCallOf(node, toArray(functionNames)) ||
    isTaggedFunctionCallOf(node, toArray(functionNames)),

  transform(node) {
    if (node.type === 'TaggedTemplateExpression') return node.quasi
    return node.arguments[0]
  },
})
