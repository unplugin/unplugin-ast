import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { resolveOptions, type Options } from './core/options'
import { transform } from './core/transform'

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

export * from './core/options'
export * from './core/transform'
export * from './core/types'
