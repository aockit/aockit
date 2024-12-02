import type { InputOptions, OutputOptions } from 'rolldown'
import { rolldown } from 'rolldown'
import { join } from 'pathe'
import { colors } from 'consola/utils'
import type { BuilderContext } from '../types'
import { log } from '../utils'
import { createWorkerContext } from './core'

export async function createRolldownContext(
  dir: string
): Promise<BuilderContext> {
  log.info(
    `Building with Rolldown... ${colors.yellow('This is experimental and may not work.')}`
  )
  const inputConfig: InputOptions = {
    input: join(dir, 'index.ts'),
    treeshake: true,
    onwarn() {
      /* no-op */
    },
    platform: 'node'
  }

  const outputOptions: OutputOptions = {
    format: 'esm',
    name: 'index',
    dir: join(dir, 'dist')
  }

  const build = await rolldown(inputConfig)

  const reload = async (): Promise<void> =>
    // eslint-disable-next-line no-return-await
    await build
      .write(outputOptions)
      .then(() => createWorker())
      .catch((error) => log.error(error))

  const { createWorker, reloadWorker, deleteWorker } =
    await createWorkerContext(join(dir, 'dist', 'index.js'), reload)

  return {
    dispose: deleteWorker,
    reload: reloadWorker
  }
}
