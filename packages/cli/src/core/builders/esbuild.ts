import type { BuildOptions } from 'esbuild'
import { join } from 'pathe'
import { log } from '../utils'
import type { BuilderContext } from '../types'
import { createWorkerContext } from './core'

export async function createESBuildContext(
  dir: string
): Promise<BuilderContext> {
  const buildConfig: BuildOptions = {
    entryPoints: [join(dir, 'index.ts')],
    format: 'esm',
    platform: 'node',
    bundle: true,
    outfile: join(dir, 'dist', 'index.mjs')
  }

  const { context } = await import('esbuild').catch((error) => {
    log.error(
      "Couldn't find esbuild. Please install it with `npm install esbuild@0.24.0`"
    )
    throw error
  })
  const build = await context(buildConfig)

  const reload = async (): Promise<void> =>
    // eslint-disable-next-line no-return-await
    await build
      .rebuild()
      .then(() => createWorker())
      .catch((error) => log.error(error))

  const { createWorker, reloadWorker } = await createWorkerContext(
    buildConfig.outfile!,
    reload
  )

  return {
    dispose: build.dispose,
    reload: reloadWorker
  }
}
