import { expect, test } from 'vitest'
import { transform } from '../src/core/transform'
import { RemoveWrapperFunction } from '../src/transformers'
import type { OptionsResolved } from '../src/core/options'

test('remove wrapper function', async () => {
  const source = `const comp = defineComponent({
    render() {
      return []
    }
  })
  console.log(mutable({} as const))
  console.log(() => mutable({} as const))
  `
  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [
      RemoveWrapperFunction(['defineComponent', 'mutable', 'definePropType']),
    ],
    parserOptions: {},
  }
  const code = (await transform(source, 'foo.ts', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const comp = ({
        render() {
          return []
        }
      })
      console.log(({} as const))
      console.log(() => ({} as const))
      "
  `)
})
