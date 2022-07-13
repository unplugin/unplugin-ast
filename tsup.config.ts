import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src'],
  format: ['cjs', 'esm'],
  target: 'node14',
  splitting: true,
  clean: true,
  dts: true,
})
