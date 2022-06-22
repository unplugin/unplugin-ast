import { defineConfig } from 'vitest/config'
import JsxString from './src/vite'

export default defineConfig({
  plugins: [JsxString({ debug: true })],
})
