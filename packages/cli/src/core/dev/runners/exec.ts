import { debounce } from 'perfect-debounce'
import type { RunnerContext } from './core'
import { spinner } from '../ui/spinner'
import { resolve } from 'pathe'
import { parseResults } from '../parse-results'
import { type NonZeroExitError, x } from 'tinyexec'
import * as log from '../ui/logger'
import c from 'tinyrainbow'

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function createExecContext(
  dir: string,
  runner: string
): Promise<RunnerContext> {
  const [cmd, ...cmdArgs] = runner.split(' ')
  const reload = debounce(async () => {
    try {
      // Start a spinner
      const s = spinner('stars')
      s.start(`Running your solution using ${c.bold(runner)}`)
      const proc = await x(cmd, cmdArgs, {
        nodeOptions: { cwd: resolve(dir) }
      })

      s.stop()

      if (proc.exitCode !== 0) {
        log.error(`The command failed. stderr: ${proc.stderr}`)
      } else {
        const stdout = proc.stdout.trim()
        // Try parsing the results
        const contents = parseResults(stdout)

        if (contents.ok) {
          log.log(
            `Part ${c.cyan('1')} ${c.gray('(')}${c.magenta(`${contents.value.part1.time.toFixed()}ms`)}${c.gray(')')}: ${contents.value.part1.result}`
          )
          log.log(
            `Part ${c.cyan('2')} ${c.gray('(')}${c.magenta(`${contents.value.part2.time.toFixed()}ms`)}${c.gray(')')}: ${contents.value.part2.result}`
          )
        } else {
          log.log(stdout !== '' ? proc.stdout : '[No output]')
        }

        log.log(`Run completed with exit code ${proc.exitCode}`)
        log.newline()
      }
    } catch (_error) {
      const errno = _error as NonZeroExitError
      log.error(
        `The command failed. stderr: ${errno.result} (${errno.exitCode})`
      )
    }
  }, 100)

  const dispose = async () => {
    /** Future API */
  }

  return {
    reload,
    dispose,
    exec: true
  }
}
