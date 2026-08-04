import { expect, test } from 'vitest'
import { transform } from '../src/core/transform.ts'
import { RemoveWrapperFunction } from '../src/transformers.ts'
import {
  ast,
  type Identifier,
  type NumericLiteral,
  type Program,
  type Statement,
  type StringLiteral,
} from '../src/yuku.ts'
import type { OptionsResolved } from '../src/core/options.ts'
import type { Transformer } from '../src/core/types.ts'

const changeString: Transformer<StringLiteral> = {
  onNode: (node): node is StringLiteral => ast.is.StringLiteral(node),
  transform() {
    return "'Hello'"
  },
}

const changeVarName: Transformer<Identifier> = {
  onNode: (node): node is Identifier =>
    node.type === 'Identifier' && node.name === 'foo',
  transform() {
    return 'newName'
  },
}

const overwriteVarName: Transformer<Identifier> = {
  onNode: (node): node is Identifier => node.type === 'Identifier',
  transform(node) {
    return `overwrite_${node.name}`
  },
}
const removeFirstStatement: Transformer<Statement> = {
  onNode: (node, parent, index): node is Statement =>
    (parent?.type === 'Program' || parent?.type === 'BlockStatement') &&
    index === 0,
  transform() {
    return false
  },
}

const timesTen: Transformer<NumericLiteral> = {
  onNode: (node): node is NumericLiteral => ast.is.NumericLiteral(node),
  transform(node) {
    return String(node.value * 10)
  },
}

test('basic', async () => {
  const source = `const foo = 'string'\nlet i = 10`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  let code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot('undefined')

  options.transformer = [changeString]
  code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const foo = 'Hello'
    let i = 10"
  `)

  options.transformer = [changeVarName]
  code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const newName = 'string'
    let i = 10"
  `)

  options.transformer = [changeString, changeVarName]
  code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const newName = 'Hello'
    let i = 10"
  `)
})

test('change twice', async () => {
  const source = `const foo = 'string'\nlet i = 10`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  options.transformer = [changeString, changeVarName, overwriteVarName]
  let code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const overwrite_newName = 'Hello'
    let overwrite_i = 10"
  `)

  options.transformer = [timesTen, timesTen, timesTen]
  code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const foo = 'string'
    let i = 10000"
  `)
})

test('remove node', async () => {
  const source = `const foo = 'string'\nlet i = 10;{i++}`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  options.transformer = [removeFirstStatement]
  const code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "
    let i = 10;{}"
  `)
})

test('get Program', async () => {
  expect.assertions(1)

  const source = `123`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  options.transformer = [
    {
      onNode: (node) => node.type === 'Program',
      transform(node: Program): undefined {
        expect(node.type).toBe('Program')
      },
    },
  ]
  await transform(source, 'foo.js', options)
})

test('transform with Yuku AST', async () => {
  const source = `const foo = 1`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [
      {
        onNode: (node): node is Identifier =>
          node.type === 'Identifier' && node.name === 'foo',
        transform: () => ast.b.Identifier({ name: 'renamed' }),
      },
      overwriteVarName,
    ],
    parserOptions: {},
  }
  const code = (await transform(source, 'foo.js', options))?.code
  expect(code).toBe('const overwrite_renamed = 1')
})

test('handles Unicode offsets', async () => {
  const source = `const 文 = '值'\nconst foo = 'string'`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [changeVarName],
    parserOptions: {},
  }
  const code = (await transform(source, 'foo.js', options))?.code
  expect(code).toBe(`const 文 = '值'\nconst newName = 'string'`)
})

test('detects language through query parameters', async () => {
  const source = `const foo: string = 'value'`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [changeString],
    parserOptions: {},
  }
  for (const id of ['foo.ts?raw', 'foo.vue?vue&type=script&lang.ts']) {
    const code = (await transform(source, id, options))?.code
    expect(code).toBe(`const foo: string = 'Hello'`)
  }
})

test('reports Yuku parser diagnostics', async () => {
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [changeVarName],
    parserOptions: {},
  }
  await expect(transform('const =', 'foo.js', options)).rejects.toThrow(
    "Unexpected token '=' in binding pattern",
  )
})

test.fails('overwrite part', async () => {
  const source = `const str = fn(foo + bar)`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [RemoveWrapperFunction('fn'), changeVarName],
    parserOptions: {},
  }
  expect(
    (await transform(source, 'foo.js', options))?.code,
  ).toMatchInlineSnapshot('undefined')
})

test('rewrite statement', async () => {
  const source = `const foo = 'string'\nlet i = 10;{i++}`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  options.transformer = [
    {
      onNode: (node, _, index) =>
        node.type === 'VariableDeclaration' && index === 0,
      transform() {
        return `const foo = 'bar'; const bar = 'foo'`
      },
    },
  ]
  const code = (await transform(source, 'foo.js', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const foo = 'bar'; const bar = 'foo'
    let i = 10;{i++}"
  `)
})
