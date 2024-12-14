import type { BuildOptions } from 'esbuild'
import { join } from 'pathe'
import { createWorkerContext, type RunnerContext } from './core'
import * as log from '../ui/logger'
import { peerDependencies } from '../../../../package.json'

export async function createESBuildContext(
  dir: string
): Promise<RunnerContext> {
  const buildConfig: BuildOptions = {
    entryPoints: [join(dir, 'index.ts')],
    format: 'esm',
    platform: 'node',
    bundle: true,
    sourcemap: 'inline',
    outfile: join(dir, 'dist', 'index.mjs')
  }

  const { context } = await import('esbuild').catch(() =>
    log.crash(
      `Couldn't find esbuild. Please install it with: $pm install esbuild@${peerDependencies.esbuild}`
    )
  )
  const build = await context(buildConfig)

  const reloadFn = async (task?: 'test' | 'bench'): Promise<void> =>
    await build
      .rebuild()
      .then(() => createWorker(task))
      .catch((error) => log.error(error))

  const { createWorker, reloadWorker, deleteWorker } =
    await createWorkerContext(dir, buildConfig.outfile!, reloadFn)

  const disposeFn = async () => {
    deleteWorker()
    await build.dispose()
  }

  return {
    dispose: disposeFn,
    reload: reloadWorker
  }
}
