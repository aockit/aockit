import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import type { Solutions, SolutionContext, Solution, Test } from './types'
import { colors as c } from 'consola/utils'
import { createConsola } from 'consola'

const log = createConsola({ defaults: { tag: 'solution' } })

function testFail(
  name: string,
  num: number,
  expected: string,
  recieved: string
) {
  return log.info(
    `${c.red(c.bold(c.inverse(' FAIL ')))} ${c.cyan(name)} ${c.gray(`#${num}`)}\n`,
    c.green(`+ Expected: ${c.bold(expected)}\n`),
    c.red(`- Recieved: ${c.bold(recieved)}\n`)
  )
}

function testPass(name: string, num: number, message: string) {
  return log.info(
    `${c.green(c.bold(c.inverse(' PASS ')))} ${c.cyan(name)} ${c.gray(`#${num}`)} >`,
    c.dim(c.bold(message))
  )
}

/**
 * Runs your solutions with utils, tests and formatting.
 */
export function run(solutions: Solutions): void {
  const context: SolutionContext = {
    input: readFileSync(new URL('../input.txt', import.meta.url), 'utf8'),
    readInput(mode) {
      const filter = mode === 'groups' ? '\n\n' : '\n'
      return readFileSync(new URL('../input.txt', import.meta.url), 'utf8')
        .split(filter)
        .filter(Boolean)
    },
    asc: (a: number, b: number) => {
      if (a < b) return -1
      if (a === b) return 0
      return +1
    },
    desc: (a: number, b: number) => {
      if (a > b) return -1
      if (a === b) return 0
      return +1
    },

    by: <O, K extends keyof O>(
      key: K,
      compareFn: (a: O[K], b: O[K]) => number
    ) => {
      return (a: O, b: O) => compareFn(a[key], b[key])
    }
  }
  // Must run first as tests have smaller input to compute on.
  if (solutions.tests) runTests(solutions.tests, context)
  if (solutions.part1) runSolution(solutions.part1, context, 1)
  if (solutions.part2) runSolution(solutions.part2, context, 2)
}

function runSolution(
  solution: Solution,
  context: SolutionContext,
  part: 1 | 2
): void {
  const startTime = performance.now()
  const result = solution(context)
  const time = performance.now() - startTime

  log.info(
    `Part ${c.cyan(String(part))} ${c.gray('(')}${c.magenta(`${time.toFixed()}ms`)}${c.gray(
      ')'
    )}: ${result}`
  )
}

function runTests(tests: Test[], context: Omit<SolutionContext, 'input'>) {
  for (const [i, { name, input, expected, solution }] of tests.entries()) {
    const result = solution({ ...context, input })

    if (result === expected) {
      testPass(name, i, `Result: ${result}`)
    } else {
      testFail(name, i, expected.toString(), String(result))
    }
  }
}

export default run
