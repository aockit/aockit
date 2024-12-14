import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import type { Context, Input, Solution, TestContext } from './types'
import { colors as c } from 'consola/utils'
import { createConsola } from 'consola'
import { Bench } from 'tinybench'

export { Context }
export * from './utils'

const log = createConsola({ defaults: { tag: 'solution' } })
const args = process.argv.slice(2)
const isTestMode = args.includes('--test')
const isBenchMode = args.includes('--bench')

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
export function run(ctx: Context): void {
  let contents = readFileSync(new URL('../input.txt', import.meta.url), 'utf8')
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
    runTests(ctx.tests, input)
  } else if (isBenchMode) {
    if (!ctx.bench || ctx.bench.length === 0)
      throw new Error('No benchmarks found to run.')
    runBench(ctx, input)
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

function runTests(tests: TestContext[], context: Omit<Input, 'input'>) {
  for (const [i, { name, input, expected, solution }] of tests.entries()) {
    const result = solution({ ...context, raw: input })

    if (result === expected) {
      testPass(name, i, `Result: ${result}`)
    } else {
      testFail(name, i, expected.toString(), String(result))
    }
  }
}

function runBench(context: Context, input: Input) {
  const bench = new Bench(context.options?.benchOptions)

  for (const { name, solution } of context.bench!)
    bench.add(name, () => {
      solution(input)
    })

  log.info('Running benchmarks...', c.gray('(this may take a while)'))
  bench.run().then(() => {
    for (const task of bench.tasks) {
      log.info(
        `${c.green(c.bold(c.inverse(' BENCH ')))} ${c.cyan(task.name)}: Mean time: ${c.magenta(
          `${task.result?.latency.mean.toFixed(3)}ms`
        )} (${task.result?.latency.samples.length} samples)`
      )
    }
  })
  console.table(bench.table())
}

export default run
