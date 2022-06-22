import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { resolveOption } from './core/options'
import { transform } from './core/transform'
import type { Options } from './core/options'

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

    async transform(code, id) {
      return transform(code, id, opt)
    },
  }
})
