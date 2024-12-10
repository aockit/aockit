import type { BenchOptions } from 'tinybench'

export interface Input {
  /**
   * Your puzzle's raw input.
   * @returns string
   */
  raw: string
  /**
   * Reads your input file into "lines" or "groups".
   * @returns string[]
   */
  read: (mode: 'lines' | 'groups') => string[]
}

type SolutionResult = string | number | bigint | void
export type Solution = (input: Input) => SolutionResult

export interface TestContext {
  /** Test case result.*/
  name: string
  /** Input string, could be the example. */
  input: string
  /** Expected output. */
  expected: string | number
  /** Solution function. */
  solution: Solution
}

export interface BenchContext {
  /** Benchmark name. */
  name: string
  /** Benchmark function. */
  solution: Solution
}

export interface Context {
  /** Part 1 solution.*/
  part1?: Solution
  /** Part 2 solution.*/
  part2?: Solution
  /** Test cases for your solutions.*/
  tests?: TestContext[]
  /** Benchmark your solutions.*/
  bench?: BenchContext[]
  /** Options, used to configure the behavior of the runner. */
  options?: {
    /** Trim whitespace from input. */
    trim?: boolean
    benchOptions?: BenchOptions
  }
}
