# unplugin-ast [![npm](https://img.shields.io/npm/v/unplugin-ast.svg)](https://npmjs.com/package/unplugin-ast)

[![Unit Test](https://github.com/sxzz/unplugin-ast/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-ast/actions/workflows/unit-test.yml)

Manipulate the AST to transform your code.

## Installation

```bash
npm i unplugin-ast
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import AST from 'unplugin-ast/vite'

export default defineConfig({
  plugins: [AST()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import AST from 'unplugin-ast/rollup'

export default {
  plugins: [AST()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-ast/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-ast/webpack')()],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-ast/webpack')()],
  },
}
```

<br></details>

## Configuration

The following show the default values of the configuration

```ts
AST({
  // filters for transforming targets
  include: [/\.[jt]sx?$/],
  exclude: undefined,

  // Rollup and esbuild do not support using enforce to control the order of plugins. Users need to maintain the order manually.
  enforce: undefined,

  // https://babeljs.io/docs/en/babel-parser#options
  parserOptions: {},

  // Refer to Custom Transformers belows
  transformer: [],
})
```

## Transformers

### Built-in Transformers

```ts
import { RemoveWrapperFunction } from 'unplugin-ast/transformers'

/**
 * Removes wrapper function. e.g `defineComponent`, `defineConfig`...
 * @param functionNames - function names to remove
 */
declare const RemoveWrapperFunction: (
  functionNames: Arrayable<string>
) => Transformer<CallExpression>
```

### Custom Transformers

```ts
import type { CallExpression } from '@babel/types'
import type { Transformer } from 'unplugin-ast'

export const RemoveWrapperFunction = (
  functionNames: string[]
): Transformer<CallExpression> => ({
  onNode: (node) =>
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    functionNames.includes(node.callee.name),

  transform(node) {
    return node.arguments[0]
  },
})
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
