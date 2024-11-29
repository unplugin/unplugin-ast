/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import { AST } from './index'

/**
 * Rspack plugin
 *
 * @example
 * ```ts
 * // rspack.config.js
 * module.exports = {
 *  plugins: [require('unplugin-ast/rspack')()],
 * }
 * ```
 */
export default AST.rspack as typeof AST.rspack
