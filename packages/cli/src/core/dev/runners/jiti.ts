import { resolve } from 'pathe'
import type { RunnerContext } from './core'
import * as log from '../ui/logger'

export async function createJitiContext(dir: string): Promise<RunnerContext> {
  const { createJiti } = await import('jiti').catch((error) => {
    log.error(
      "Couldn't find Jiti. Please install it with `npm install jiti@2.4.1`"
    )
    throw error
  })
  const path = resolve(dir)
  const jiti = createJiti(path, {
    fsCache: false,
    moduleCache: false,
    sourceMaps: true
  })
  const resolved = jiti.esmResolve(resolve(path, 'index.ts'))

  return {
    reload: async () => {
      await jiti.import(resolved).catch((error) => log.error(error))
    },
    // biome-ignore lint/suspicious/useAwait: <explanation>
    dispose: async () => {
      jiti.cache = Object.create(null)
    }
  }
}
