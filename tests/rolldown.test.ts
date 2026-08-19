import path from 'node:path'
import { rolldownBuild } from '@sxzz/test-utils'
import { expect, test } from 'vitest'
import AST from '../src/rolldown.ts'
import { RemoveWrapperFunction } from '../src/transformers.ts'

test('rolldown build', async () => {
  const { snapshot } = await rolldownBuild(
    path.resolve(import.meta.dirname, 'fixtures/basic.ts'),
    AST({
      transformer: [RemoveWrapperFunction('defineConfig')],
    }),
  )
  expect(snapshot).toMatchSnapshot()
})
