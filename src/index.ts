import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { resolveOptions, type Options } from './core/options.ts'
import { transform } from './core/transform.ts'

export const AST: UnpluginInstance<Options, false> = createUnplugin(
  (userOptions = {}) => {
    const { include, exclude, enforce, ...options } =
      resolveOptions(userOptions)

    const name = 'unplugin-ast'
    return {
      name,
      enforce,
      transform: {
        filter: { id: { include, exclude } },
        handler(code, id) {
          return transform(code, id, options)
        },
      },
    }
  },
)

export * from './core/options.ts'
export * from './core/transform.ts'
export * from './core/types.ts'
