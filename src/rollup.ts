/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { AST } from './index'

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import AST from 'unplugin-ast/rollup'
 *
 * export default {
 *   plugins: [AST()],
 * }
 * ```
 */
export default AST.rollup as typeof AST.rollup
