export interface Input {
  /**
   * Your puzzle's raw input.
   * @returns string
   */
  raw: string
  /**
   * Reads your input file into "lines" (\n) or "groups" (\n\n).
   * @returns string[]
   */
  read: (mode: 'lines' | 'groups') => string[]
}

export type SolutionResult = string | number | bigint
export type Solution = (input: Input) => SolutionResult

export type MaybePromise<T> = T | Promise<T>

export type MitataCallback = (
  mitata: typeof import('mitata'),
  input: Input
) => MaybePromise<void>
export type TinybenchCallback = (
  tinybench: typeof import('tinybench'),
  input: Input
) => MaybePromise<void>

export interface MitataContext {
  tool: 'mitata'
  bench: MitataCallback
}

export interface TinybenchContext {
  tool: 'tinybench'
  bench: TinybenchCallback
}

export type BenchContext = MitataContext | TinybenchContext

export interface TestContext {
  /** Test case result.*/
  name: string
  /** Input string, could be the example. */
  input: string
  /** Expected output. */
  expected: SolutionResult
  /** Solution function. */
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
  bench?: BenchContext
  /** Options, used to configure the behavior of the runner. */
  options?: {
    /** Trim whitespace from input. */
    trim?: boolean
  }
}
