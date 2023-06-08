import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { type Options, resolveOption } from './core/options'
import { transform } from './core/transform'

export default createUnplugin<Options>((options = {}) => {
  const opt = resolveOption(options)
  const filter = createFilter(opt.include, opt.exclude)

  const name = 'unplugin-ast'
  return {
    name,
    enforce: options.enforce,

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      return transform(code, id, opt)
    },
  }
})

export * from './core/options'
export * from './core/ast'
export * from './core/transform'
export * from './core/types'
