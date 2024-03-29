import { type Arrayable, toArray } from '@antfu/utils'
import type { ParserOptions } from '@babel/parser'
import type { FilterPattern } from '@rollup/pluginutils'
import type { Transformer } from './types'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  enforce?: 'post' | 'pre' | undefined
  parserOptions?: ParserOptions
  transformer?: Arrayable<Transformer<any>>
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  {
    exclude: Options['exclude']
    enforce: Options['enforce']
    transformer: Transformer<any>[]
  }
>

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[jt]sx?$/],
    exclude: options.exclude || undefined,
    enforce: options.enforce || undefined,
    parserOptions: options.parserOptions || {},
    transformer: options.transformer ? toArray(options.transformer) : [],
  }
}
