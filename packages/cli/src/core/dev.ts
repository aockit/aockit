import { existsSync, readFileSync } from 'node:fs'
import { colors as c } from 'consola/utils'
import { join, relative, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { x, type NonZeroExitError } from 'tinyexec'
import { createESBuildContext } from './builders/esbuild'
import { createJitiContext } from './builders/jiti'
import { createRolldownContext } from './builders/rolldown'
import type { Builder, Config } from './types'
import { log } from './utils'
import { confirm, text, select } from '@clack/prompts'
import { client } from './client'

const gitignore = existsSync(join('.gitignore'))
  ? readFileSync(join('.gitignore'), { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
  : []

// Warn if .gitignore doesnt have input.txt
if (gitignore.length > 0 && !gitignore.includes('**/input.txt')) {
  log.warn(
    '**/input.txt is not in your .gitignore file. Add the following: **/input.txt'
  )
}

const createWatcher = async (
  year: number,
  day: number,
  dir: string,
  reload: () => Promise<void>,
  // Reset prompting flag
  dispose?: () => Promise<void> | void
): Promise<void> => {
  const watcher = await import('@parcel/watcher').catch((error) => {
    log.error('[dev:watcher:error] Failed to load @parcel/watcher', error)
    return process.exit(1)
  })

  const _watcher = await watcher.subscribe(
    dir,
    (error, events) => {
      if (error) {
        log.error('[dev:watcher:error]', error)
        return process.exit(1)
      }
      events.forEach(async (event) => {
        if (event.type === 'update') {
          log.info(
            `[dev:watcher:change]: ${relative(process.cwd(), event.path)}`
          )
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

  let isPrompting = false

  process.stdin
    .setRawMode(true)
    .resume()
    .setEncoding('utf-8')
    .on('data', async (key: string) => {
      if (isPrompting) return

      switch (key) {
        case '\u0071':
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: blah blah
        case '\u0003': // 'q' key for quit
          log.info('Exiting.')
          await _watcher.unsubscribe()
          await dispose?.()
          process.exit(0)
        case '\u0072': // 'r' key for reload
          log.info('Reloading.')
          await reload()
          break
        case '\u0073': // 's' key for submit
          try {
            isPrompting = true

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
                message: `Submit "${solution}" for part ${part}?`
              })

              if (shouldSubmit) {
                const request = await client.submit(year, day, part, solution)
                if (!request) {
                  log.fail("Couldn't submit solution")
                  return
                }
                log.success('Solution submitted successfully!')
              } else {
                log.info('Submission cancelled.')
              }
            }
          } catch (error) {
            log.fail('Submission error:', error)
          } finally {
            isPrompting = false
            process.stdin.setRawMode(true).resume()
          }
          break
        default:
          break
      }
    })

  log.info('Started server, listening for changes...')
  log.info(
    `🦌 Press: ${c.green(c.bold('r'))} to reload • ${c.red(c.bold('q'))} to quit • ${c.magenta(c.bold('s'))} to submit`
  )
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
        const result = await x(cmd, cmdArgs, {
          nodeOptions: { cwd: resolve(ctx.dir) }
        })
        if (result.exitCode !== 0) {
          log.error(`The command failed. stderr: ${result.stderr}`)
        } else {
          const contents =
            result.stdout.trim() !== '' ? result.stdout : '[No output]'

          log.log(contents)
          log.info(`Run completed with exit code ${result.exitCode}`)
        }
      } catch (_error) {
        const error = _error as NonZeroExitError
        log.error(
          `The command failed. stderr: ${error.result} (${error.exitCode})`
        )
        throw error
      }
    })
    await createWatcher(Number(ctx.year), Number(ctx.day), ctx.dir, reload)
  } else {
    const builder = (ctx.config.builder || ctx.builder) as Builder
    if (builder === 'jiti') {
      const { reload, dispose } = await createJitiContext(ctx.dir)
      await createWatcher(
        Number(ctx.year),
        Number(ctx.day),
        ctx.dir,
        reload,
        dispose
      )
    } else if (builder === 'rolldown') {
      const { reload, dispose } = await createRolldownContext(ctx.dir)
      await createWatcher(
        Number(ctx.year),
        Number(ctx.day),
        ctx.dir,
        reload,
        dispose
      )
    } else {
      const { reload, dispose } = await createESBuildContext(ctx.dir)
      await createWatcher(
        Number(ctx.year),
        Number(ctx.day),
        ctx.dir,
        reload,
        dispose
      )
    }
  }
}
