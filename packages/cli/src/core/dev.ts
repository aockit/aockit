import { existsSync, readFileSync } from 'node:fs'
import { colors as c } from 'consola/utils'
import { join, relative, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { x, type NonZeroExitError } from 'tinyexec'
import { createESBuildContext } from './builders/esbuild'
import { createJitiContext } from './builders/jiti'
import { createRolldownContext } from './builders/rolldown'
import type { Builder, Config } from './types'
import { confirm, text, select } from '@clack/prompts'
import { client } from './client'
import { registerTasks } from './ui/tasks'
import { parseResults } from './dev/parse-results'
import { spinner } from './ui/spinner'
import { crash, error, log, newline } from './ui/logger'
import { loadConfig } from './config'

const gitignore = existsSync(join('.gitignore'))
  ? readFileSync(join('.gitignore'), { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
  : []

// Warn if .gitignore doesnt have input.txt
if (
  gitignore.length > 0 &&
  !(gitignore.includes('**/input.txt') || gitignore.includes('input.txt'))
) {
  log(
    'input.txt is not in your .gitignore file. Add the following: **/input.txt'
  )
}

const createWatcher = async (
  year: string,
  day: string,
  dir: string,
  reload: () => Promise<void>,
  dispose?: () => Promise<void> | void
): Promise<void> => {
  const watcher = await import('@parcel/watcher').catch((error) =>
    crash(`[dev:watcher:error] Failed to load @parcel/watcher ${error}`)
  )

  const _watcher = await watcher.subscribe(
    dir,
    (error, events) => {
      if (error) {
        crash(`[dev:watcher:error] ${error}`)
      }
      events.forEach(async (event) => {
        if (event.type === 'update') {
          log(`[dev:watcher:change]: ${relative(process.cwd(), event.path)}`)
          await reload()
        }
      })
    },
    {
      ignore: [
        // Hidden directories like .git
        '**/.*/**',
        // Hidden files (e.g. logs or temp files)
        '**/.*',
        // Built files
        '**/dist/**',
        // 3rd party packages
        '**/{node_modules,bower_components,vendor,target}/**',
        // .gitignore
        ...gitignore
      ]
    }
  )

  const { config } = await loadConfig({
    tasks: [
      {
        keys: ['q'],
        label: 'Quit',
        color: 'red',
        handler: async () => {
          log('Exiting.')
          unregisterTasks()
          _watcher.unsubscribe()
          await dispose?.()
          process.exit(0)
        }
      },
      {
        keys: ['r'],
        label: 'Reload',
        color: 'green',
        handler: async () => {
          log('Reloading.')
          await reload()
        }
      },
      {
        keys: ['s'],
        label: 'Submit',
        color: 'magenta',
        handler: async () => {
          const part = await select({
            message: 'Select a part to submit',
            options: [
              { label: 'Part 1', value: 1 },
              { label: 'Part 2', value: 2 }
            ]
          })
          if (typeof part === 'symbol') return

          const solution = await text({
            message: `Enter your solution for part ${part}`,
            placeholder: 'Type your solution here...',
            validate(value) {
              if (!value) return 'Solution cannot be empty!'
              if (value.length > 100)
                return 'Solution cannot be longer than 100 characters!'
            }
          })
          if (typeof solution === 'symbol') return

          if (solution) {
            const shouldSubmit = await confirm({
              message: `Submit "${c.dim(solution)}" for part ${part}?`
            })

            if (shouldSubmit) {
              const s = spinner()
              s.start('Submitting solution...')
              const request = await client.submit(year, day, part, solution)

              if (!request.ok) {
                s.stop()
                log(`Couldn't submit solution: ${request.errors}`)
                return
              }

              s.stop('Solution submitted successfully!')
            } else {
              log('Submission cancelled.')
            }
          }
        }
      }
    ]
  })
  log('Started server, listening for changes...')

  const unregisterTasks = registerTasks(config.tasks)
}

interface Context {
  config: Config
  dir: string
  year: string
  day: string
  builder: string
}

export async function createDevContext(ctx: Context): Promise<void> {
  if (ctx.config.days[Number(ctx.day)].runner !== null) {
    const [cmd, ...cmdArgs] = ctx.config.days[Number(ctx.day)]
      .runner!.trim()
      .split(' ')
    const reload = debounce(async () => {
      try {
        // Start a spinner
        const s = spinner('stars')
        s.start('Running your solution')
        const proc = await x(cmd, cmdArgs, {
          nodeOptions: { cwd: resolve(ctx.dir) }
        })

        s.stop()

        if (proc.exitCode !== 0) {
          error(`The command failed. stderr: ${proc.stderr}`)
        } else {
          const stdout = proc.stdout.trim()
          // Try parsing the results
          const contents = parseResults(stdout)

          if (contents.ok) {
            log(
              `Part ${c.cyan('1')} ${c.gray('(')}${c.magenta(`${contents.value.part1.time.toFixed()}ms`)}${c.gray(')')}: ${contents.value.part1.result}`
            )
            log(
              `Part ${c.cyan('2')} ${c.gray('(')}${c.magenta(`${contents.value.part2.time.toFixed()}ms`)}${c.gray(')')}: ${contents.value.part2.result}`
            )
          } else {
            log(stdout !== '' ? proc.stdout : '[No output]')
          }

          log(`Run completed with exit code ${proc.exitCode}`)
          newline()
        }
      } catch (_error) {
        const errno = _error as NonZeroExitError
        error(`The command failed. stderr: ${errno.result} (${errno.exitCode})`)
        throw error
      }
    }, 100)
    await createWatcher(ctx.year, ctx.day, ctx.dir, reload)
  } else {
    const builder = (ctx.config.builder || ctx.builder) as Builder
    if (builder === 'jiti') {
      const { reload, dispose } = await createJitiContext(ctx.dir)
      await createWatcher(ctx.year, ctx.day, ctx.dir, reload, dispose)
    } else if (builder === 'rolldown') {
      const { reload, dispose } = await createRolldownContext(ctx.dir)
      await createWatcher(ctx.year, ctx.day, ctx.dir, reload, dispose)
    } else {
      const { reload, dispose } = await createESBuildContext(ctx.dir)
      await createWatcher(ctx.year, ctx.day, ctx.dir, reload, dispose)
    }
  }
}
