import { isCallOf } from 'ast-kit'
import { expect, test } from 'vitest'
import { transform } from '../src/core/transform'
import { RemoveNode } from '../src/transformers'
import type { OptionsResolved } from '../src/core/options'

test('remove node', async () => {
  const source = `const comp = defineComponent({
    render() {
      return []
    }
  })
  console.log(mutable({} as const))
  `

  const options: Pick<OptionsResolved, 'parserOptions' | 'transformer'> = {
    transformer: [
      RemoveNode(
        (node) => node.type === 'ReturnStatement' || isCallOf(node, 'mutable'),
      ),
    ],
    parserOptions: {},
  }
  const code = (await transform(source, 'foo.ts', options))?.code
  expect(code).toMatchInlineSnapshot(`
    "const comp = defineComponent({
        render() {
          
        }
      })
      console.log()
      "
  `)
})
