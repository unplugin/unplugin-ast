import { toArray } from '@antfu/utils'
import type MagicString from 'magic-string'
import type { ParserOptions } from '@babel/parser'
import type { Arrayable, Awaitable } from '@antfu/utils'
import type { Node } from '@babel/types'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  enforce?: 'post' | 'pre' | undefined
  parserOptions?: ParserOptions
  transformer?: Arrayable<Transformer<any>>
}

export interface Transformer<T extends Node = Node> {
  filterFile?: (id: string) => Awaitable<boolean>
  filterNode?:
    | ((node: Node, parent: Node) => Awaitable<boolean>)
    | ((node: Node, parent: Node) => node is T)
  transform: (
    node: T,
    code: MagicString,
    context: {
      id: string
    }
  ) => Awaitable<string | undefined | null | void>
}

export type OptionsResolved = Omit<Required<Options>, 'transformer'> & {
  transformer: Transformer<any>[]
}

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[jt]sx?$/],
    exclude: options.exclude || undefined,
    enforce: options.enforce || undefined,
    parserOptions: options.parserOptions || {},
    transformer: options.transformer ? toArray(options.transformer) : [],
  }
}
