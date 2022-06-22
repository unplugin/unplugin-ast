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


## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
