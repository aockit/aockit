import { existsSync, readFileSync } from 'node:fs'
import { confirm, select, text } from '@clack/prompts'
import { colors as c } from 'consola/utils'
import { join, relative } from 'pathe'
import { client } from './client'
import { loadConfig } from './config'
import type { RunnerContext } from './dev/runners/core'
import { createESBuildContext } from './dev/runners/esbuild'
import { createJitiContext } from './dev/runners/jiti'
import { createRolldownContext } from './dev/runners/rolldown'
import * as log from './dev/ui/logger'
import { spinner } from './dev/ui/spinner'
import { registerTasks } from './dev/ui/tasks'
import { updateReadme } from './generators/readme'
import { data as conf } from './io'
import type { Data, Runner } from './types'
import { createExecContext } from './dev/runners/exec'

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
  log.warn(
    'input.txt is not in your .gitignore file. Add the following: **/input.txt'
  )
}

async function createWatcher(
  year: string,
  day: string,
  dir: string,
  _runner:
    | ((dir: string) => Promise<RunnerContext>)
    | (() => Promise<RunnerContext>)
) {
  const watcher = await import('@parcel/watcher').catch((error) =>
    log.crash(`[dev:watcher:error] Failed to load @parcel/watcher ${error}`)
  )

  const runner = await _runner(dir)

  const _watcher = await watcher.subscribe(
    dir,
    (error, events) => {
      if (error) log.error(`[dev:watcher:error] ${error}`)

      events.forEach(async (event) => {
        if (event.type === 'update') {
          log.log(
            `[dev:watcher:change]: ${relative(process.cwd(), event.path)}`
          )
          await runner.reload()
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
          log.log('Exiting.')
          unregisterTasks()
          _watcher.unsubscribe()
          await runner.dispose?.()
          process.exit(0)
        }
      },
      {
        keys: ['r'],
        label: 'Reload',
        color: 'green',
        handler: async () => {
          log.log('Reloading.')
          await runner.reload()
        }
      },
      {
        keys: ['t'],
        label: 'Test',
        color: 'redBright',
        disabled: runner.exec,
        handler: async () => {
          log.log('Reloading.')
          await runner.reload('test')
        }
      },
      {
        keys: ['b'],
        label: 'Bench',
        color: 'greenBright',
        disabled: runner.exec,
        handler: async () => {
          log.log('Reloading.')
          await runner.reload('bench')
        }
      },
      {
        keys: ['s'],
        label: 'Submit',
        color: 'magenta',
        handler: async () => {
          await runner.dispose?.()

          process.stdin.setRawMode(true)
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
                log.error(`Couldn't submit solution: ${request.errors}`)
                return
              }

              const c = await conf.load(year)
              c.days[Number(day) - 1][part === 1 ? 'part1' : 'part2'].solved =
                true
              await conf.save(year, c)

              await updateReadme(year)
              s.stop('Solution submitted successfully!')
            } else {
              log.log('Submission cancelled.')
            }
          }
        }
      }
    ]
  })
  log.log('Started server, listening for changes...')

  const unregisterTasks = registerTasks(config.tasks)

  return () => {
    unregisterTasks()
    _watcher.unsubscribe()
    runner.dispose?.()
  }
}

interface Context {
  data: Data
  cli: {
    dir: string
    year: string
    day: string
    runner: Runner
  }
}

export async function createDevContext(ctx: Context): Promise<void> {
  const runner =
    // Resolve from: cli args -> day config -> year config -> default
    ctx.cli.runner ??
    ctx.data.days[Number(ctx.cli.day)].config?.runner ??
    ctx.data.config?.runner
  const year = ctx.cli.year
  const day = ctx.cli.day
  const dir = ctx.cli.dir

  const isExperimenralRunner = runner === 'jiti' || runner === 'rolldown'
  if (isExperimenralRunner)
    log.log(
      `Running with ${c.red(runner)} runner, this is an experimental feature and may not work as expected.`
    )
  else log.log(`Runner: ${c.green(runner)}`)

  if (runner === 'jiti') await createWatcher(year, day, dir, createJitiContext)
  else if (runner === 'rolldown')
    await createWatcher(year, day, dir, createRolldownContext)
  else if (runner === 'esbuild')
    await createWatcher(year, day, dir, createESBuildContext)
  else if (runner) {
    const runner = ctx.data.days[Number(day)].config!.runner!.trim()
    await createWatcher(year, day, dir, () => createExecContext(dir, runner))
  } else {
    log.crash(`[dev:watcher:error] Runner '${runner}' not found`)
  }
}
