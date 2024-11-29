/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { AST } from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import AST from 'unplugin-ast/rolldown'
 *
 * export default {
 *   plugins: [AST()],
 * }
 * ```
 */
export default AST.rolldown as typeof AST.rolldown
