import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import type { Context, Input, Solution, TestContext } from './types'
import { c, log } from './util'
import { createBenchRunner } from './bench/runner'
import { parseArgs } from 'node:util'

export { Context, Solution }
export * from './utils'

const args = parseArgs({
  options: {
    input: {
      type: 'string'
    },
    test: {
      type: 'boolean',
      default: false
    },
    bench: {
      type: 'boolean',
      default: false
    }
  }
})
const isTestMode = args.values.test
const isBenchMode = args.values.bench
const inputPath = args.values.input

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
 * The main entry point for the runner. Supports solving, testing, and benchmarking.
 * @param ctx The context object. See {@link Context}.
 * @returns void
 */
export async function run(ctx: Context): Promise<void> {
  let contents = readFileSync(
    inputPath || new URL('../input.txt', import.meta.url),
    'utf8'
  )
  if (ctx.options?.trim) contents = contents.trim()

  const input: Input = {
    raw: contents,
    read(mode) {
      const filter = mode === 'groups' ? '\n\n' : '\n'
      return contents.split(filter).filter(Boolean)
    }
  }

  if (isTestMode) {
    if (!ctx.tests || ctx.tests.length === 0)
      throw new Error('No tests found to run.')
    runTests(ctx.tests)
  } else if (isBenchMode) {
    if (!ctx.bench) throw new Error('No benchmarks found to run.')
    // Wait until benchmarking is done, then exit
    // This is to prevent the process from exiting before the benchmarking is done
    await createBenchRunner(ctx, input).then(() => process.exit(0))
  } else {
    if (ctx.part1) runSolution(ctx.part1, input, 1)
    if (ctx.part2) runSolution(ctx.part2, input, 2)
  }
}

function runSolution(solution: Solution, context: Input, part: 1 | 2): void {
  const startTime = performance.now()
  const result = solution(context)
  const time = performance.now() - startTime

  log.info(
    `Part ${c.cyan(String(part))} ${c.gray('(')}${c.magenta(`${time.toFixed()}ms`)}${c.gray(
      ')'
    )}: ${result}`
  )
}

function runTests(tests: TestContext[]) {
  for (const [i, { name, input, expected, solution }] of tests.entries()) {
    const inp: Input = {
      raw: input,
      read(mode) {
        const filter = mode === 'groups' ? '\n\n' : '\n'
        return input.split(filter).filter(Boolean)
      }
    }
    const result = solution(inp)

    if (result === expected) {
      testPass(name, i, `Result: ${result}`)
    } else {
      testFail(name, i, expected.toString(), String(result))
    }
  }
}

export default run
