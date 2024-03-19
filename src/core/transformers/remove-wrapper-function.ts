import { type Arrayable, toArray } from '@antfu/utils'
import type { CallExpression } from '@babel/types'
import type { Transformer } from '../types'

/**
 * Removes wrapper function. e.g `defineComponent`, `defineConfig`...
 * @param functionNames - function names to remove
 * @returns Transformer
 */
export const RemoveWrapperFunction = (
  functionNames: Arrayable<string>,
): Transformer<CallExpression> => ({
  onNode: (node) =>
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    toArray(functionNames).includes(node.callee.name),

  transform(node) {
    return node.arguments[0]
  },
})
