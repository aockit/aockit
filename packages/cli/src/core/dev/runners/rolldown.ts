import type { InputOptions, OutputOptions } from 'rolldown'
import { join } from 'pathe'
import * as log from '../ui/logger'
import { createWorkerContext, type RunnerContext } from './core'
import { peerDependencies } from '../../../../package.json'

export async function createRolldownContext(
  dir: string
): Promise<RunnerContext> {
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

  const { rolldown } = await import('rolldown').catch(() =>
    log.crash(
      `Couldn't find Rolldown. Please install it with: $pm install rolldown@${peerDependencies.rolldown}`
    )
  )

  const build = await rolldown(inputConfig)

  const reloadFn = async (task?: 'test' | 'bench'): Promise<void> =>
    await build
      .write(outputOptions)
      .then(() => createWorker(task))
      .catch((err) => log.error(err))

  const { createWorker, reloadWorker, deleteWorker } =
    await createWorkerContext(dir, join(dir, 'dist', 'index.js'), reloadFn)

  const disposeFn = async () => {
    deleteWorker()
    await build.close()
  }

  return {
    dispose: disposeFn,
    reload: reloadWorker
  }
}
