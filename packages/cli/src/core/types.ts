export type Runner = 'esbuild' | 'rolldown' | 'jiti' | (string & {})

interface Part {
  solved: boolean
  result: any // seems to be string, number blah
  time: null | number
}

interface Day {
  config?: {
    runner?: Runner
  }
  part1: Part
  part2: Part
}

export interface Data {
  year: number
  days: {
    [day: number]: Day
  }
  config?: {
    runner?: Runner
  }
}

export type Ok<T> = {
  readonly ok: true
  readonly errors?: undefined
  readonly value: T
}

export type Error = {
  readonly ok: false
  readonly errors: readonly string[]
  readonly value?: undefined
}

export type Result<T> = Ok<T> | Error

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function error(reason: string, ...other: string[]): Error
export function error(...errors: readonly [string, ...string[]]): Error {
  return { ok: false, errors }
}
