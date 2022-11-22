import { expect, test } from 'vitest'
import { transform } from '../src/core/transform'
import { RemoveWrapperFunction } from '../src/transformers'
import type {
  Identifier,
  NumericLiteral,
  Statement,
  StringLiteral,
} from '@babel/types'
import type { OptionsResolved } from '../src/core/options'
import type { Transformer } from '../src/core/types'

const changeString: Transformer<StringLiteral> = {
  onNode: (node): node is StringLiteral => node.type === 'StringLiteral',
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
  onNode: (node): node is NumericLiteral => node.type === 'NumericLiteral',
  transform(node) {
    return `${node.value * 10}`
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

test.skip('overwrite part', async () => {
  const source = `const str = fn(foo + bar)`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [RemoveWrapperFunction('fn'), changeVarName],
    parserOptions: {},
  }
  expect(
    (await transform(source, 'foo.js', options))?.code
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
