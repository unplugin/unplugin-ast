import { expect, test } from 'vitest'
import { transform } from '../src/core/transform'
import type { Identifier, StringLiteral } from '@babel/types'
import type { OptionsResolved, Transformer } from '../src/core/options'

test('basic', async () => {
  const source = `const foo = 'string'`
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [],
    parserOptions: {},
  }
  let code = await transform(source, 'foo.js', options)
  expect(code).toMatchInlineSnapshot('undefined')

  const transformer: Transformer<StringLiteral> = {
    filterNode: (node): node is StringLiteral => node.type === 'StringLiteral',
    transform(node, code) {
      code.overwrite(node.start!, node.end!, '"Hello"')
    },
  }
  options.transformer.push(transformer)
  code = await transform(source, 'foo.js', options)
  expect(code).toMatchInlineSnapshot('"const foo = \\"Hello\\""')

  const transformer2: Transformer<Identifier> = {
    filterNode: (node): node is Identifier => node.type === 'Identifier',
    transform(node, code) {
      code.overwrite(node.start!, node.end!, 'newName')
    },
  }
  options.transformer.push(transformer2)
  code = await transform(source, 'foo.js', options)
  expect(code).toMatchInlineSnapshot('"const newName = \\"Hello\\""')

  options.transformer.splice(0, 1)
  code = await transform(source, 'foo.js', options)
  expect(code).toMatchInlineSnapshot('"const newName = \'string\'"')
})
