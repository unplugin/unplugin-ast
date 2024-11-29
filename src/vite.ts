/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { AST } from './index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import AST from 'unplugin-ast/vite'
 *
 * export default defineConfig({
 *   plugins: [AST()],
 * })
 * ```
 */
export default AST.vite as typeof AST.vite
