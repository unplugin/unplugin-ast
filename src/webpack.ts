/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { AST } from './index'

/**
 * Webpack plugin
 *
 * @example
 * ```ts
 * // webpack.config.js
 * module.exports = {
 *  plugins: [require('unplugin-ast/webpack')()],
 * }
 * ```
 */
export default AST.webpack as typeof AST.webpack
