export interface SolutionContext {
  /**
   * Your puzzle's raw input.
   * @returns string
   */
  input: string
  /**
   * Reads your input file into "lines" or "groups".
   * @returns string
   */
  readInput: (mode: 'lines' | 'groups') => string[]
  /**
   * compareFn to sort two numbers by ascending order.
   * @example [8,7,6,5,4].sort(asc) => [4,5,6,7,8]
   * @returns number
   */
  asc: (a: number, b: number) => number
  /**
   * compareFn to sort two numbers by descending order.
   * @example [4,5,6,78].sort(asc) => [8,7,6,5,4]
   * @returns number
   */
  desc: (a: number, b: number) => number
  /**
   * Compares a key by a provided compareFn.
   * @returns void
   */
  by: <T, K extends keyof T>(
    key: K,
    compareFn: (a: T[K], b: T[K]) => number
  ) => void
}

export type Solution = (
  context: SolutionContext
) => string | number | bigint | void

export interface Test {
  /** Test case result.*/
  name: string
  /** Input string, could be the example. */
  input: string
  /** Expected output. */
  expected: string | number
  solution: Solution
}

export interface Solutions {
  /** Part 1 solution.*/
  part1?: Solution
  /** Part 2 solution.*/
  part2?: Solution
  /** Test cases for your solutions.*/
  tests?: Test[]
}
