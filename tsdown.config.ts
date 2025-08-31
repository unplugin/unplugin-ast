import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/*.ts',
  dts: { resolve: ['@antfu/utils'] },
  exports: true,
})
