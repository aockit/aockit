import { existsSync, readFileSync } from 'node:fs'
import type { ExecaError } from 'execa'
import { watch } from 'chokidar'
import { join, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { colors as c } from 'consola/utils'
import type { Builder, Config } from './types'
import { createESBuildContext } from './builders/esbuild'
import { createRolldownContext } from './builders/rolldown'
import { createJitiContext } from './builders/jiti'
import { log } from './utils'
import { x } from 'tinyexec'

const ignored = existsSync(join('.gitignore'))
  ? readFileSync(join('.gitignore'), { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
  : undefined

const watcher = async (
  dir: string,
  reload: () => Promise<void>,
  dispose?: () => Promise<void> | void
): Promise<void> => {
  const w = watch(dir, {
    cwd: process.cwd(),
    ignoreInitial: true,
    ignored: [
      // Hidden directories like .git
      '**/.*/**',
      // Hidden files (e.g. logs or temp files)
      '**/.*',
      // Built files
      '**/dist/**',
      // 3rd party packages
      '**/{node_modules,bower_components,vendor,target}/**',
      // .gitignore
      ...ignored!
    ]
  })
    .on('ready', async () => {
      log.start(`Started server, listening for changes...`)
      log.ready(
        `🦌 Press: ${c.green(c.bold('r'))} to reload • ${c.red(c.bold('q'))} to quit`
      )
      await reload()
    })
    .on('change', async (path) => {
      log.info(`[dev:watcher:change]: ${path}`)
      await reload()
    })
    .on('error', (error) => log.error('[dev:watcher:error]', error))

  process.stdin
    .setRawMode(true)
    .resume()
    .setEncoding('utf-8')
    .on('data', async (key: string) => {
      switch (key) {
        case '\u0071':
        case '\u0003':
          log.info('Exiting.')
          await w.close()
          await dispose?.()
          process.exit(0)
        case '\u0072':
          log.info('Reloading.')
          await reload()
          break
        default:
          break
      }
      process.stdout.write(key)
    })
}

interface BuildContext {
  config: Config
  dir: string
  day: string
  builder: string
}

export async function createBuildContext(ctx: BuildContext): Promise<void> {
  if (ctx.config.days[Number(ctx.day)].runner !== null) {
    const [cmd, ...cmdArgs] =
      ctx.config.days[Number(ctx.day)].runner!.split(' ')
    const reload = debounce(async () => {
      try {
        const { stdout } = await x(cmd, cmdArgs, {
          nodeOptions: { cwd: resolve(ctx.dir) }
        })
        console.log(stdout)
      } catch (_error) {
        const error = _error as ExecaError
        log.error(
          `The command failed. stderr: ${error.stderr} (${error.exitCode})`
        )
      }
    })
    await watcher(ctx.dir, reload)
  } else {
    const builder = (ctx.config.builder || ctx.builder) as Builder
    if (builder === 'jiti') {
      const { reload, dispose } = await createJitiContext(ctx.dir)
      await watcher(ctx.dir, reload, dispose)
    } else if (builder === 'rolldown') {
      const { reload, dispose } = await createRolldownContext(ctx.dir)
      await watcher(ctx.dir, reload, dispose)
    } else {
      const { reload, dispose } = await createESBuildContext(ctx.dir)
      await watcher(ctx.dir, reload, dispose)
    }
  }
}
