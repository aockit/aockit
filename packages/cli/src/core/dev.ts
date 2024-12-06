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
import { confirm, text } from '@clack/prompts'
const gitignore = existsSync(join('.gitignore'))
  ? readFileSync(join('.gitignore'), { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
  : []

const _createRenderer = () => {
  const renderFooter = () => {
    log.info(
      `🦌 Press: ${c.green(c.bold('r'))} to reload • ${c.red(c.bold('q'))} to quit • ${c.magenta(c.bold('s'))} to submit`
    )
  }

  const logWithClear = (...args: any[]) => {
    console.clear()
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(...args)
    renderFooter()
  }

  return {
    renderFooter,
    logWithClear
  }
}

const createWatcher = async (
  dir: string,
  reload: () => Promise<void>,
  dispose?: () => Promise<void> | void
): Promise<void> => {
  // const ui = createRenderer()
  // console.clear()

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

  process.stdin
    .setRawMode(true)
    .resume()
    .setEncoding('utf-8')
    .on('data', async (key: string) => {
      switch (key) {
        case '\u0071':
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: blah blah
        case '\u0003':
          log.info('Exiting.')
          await _watcher.unsubscribe()
          await dispose?.()
          process.exit(0)
        case '\u0072':
          log.info('Reloading.')
          await reload()
          break
        case '\u0073': // 's' key for submit
          try {
            process.stdin.setRawMode(false)

            // Prompt for solution text
            const solution = await text({
              message: 'Enter your solution text:',
              placeholder: 'Type your solution here...',
              validate(value) {
                if (!value) return 'Solution cannot be empty!'
              }
            })

            if (solution) {
              // Confirm submission
              const shouldSubmit = await confirm({
                message: 'Are you sure you want to submit this solution?'
              })

              if (shouldSubmit) {
                log.success('Solution submitted successfully!')
                // Add your actual submission logic here
                // For example, you might want to call an API, write to a file, etc.
              } else {
                log.info('Submission cancelled.')
              }
            }
          } catch (error) {
            log.error('Submission error:', error)
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

  // ui.renderFooter()
}

interface Context {
  config: Config
  dir: string
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
    await createWatcher(ctx.dir, reload)
  } else {
    const builder = (ctx.config.builder || ctx.builder) as Builder
    if (builder === 'jiti') {
      const { reload, dispose } = await createJitiContext(ctx.dir)
      await createWatcher(ctx.dir, reload, dispose)
    } else if (builder === 'rolldown') {
      const { reload, dispose } = await createRolldownContext(ctx.dir)
      await createWatcher(ctx.dir, reload, dispose)
    } else {
      const { reload, dispose } = await createESBuildContext(ctx.dir)
      await createWatcher(ctx.dir, reload, dispose)
    }
  }
}
