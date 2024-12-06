import { join, resolve } from 'pathe'
import { colors } from 'consola/utils'
import type { BuilderContext } from '../types'
import { log } from '../utils'

export async function createJitiContext(dir: string): Promise<BuilderContext> {
  const { createJiti } = await import('jiti').catch((error) => {
    log.error(
      "Couldn't find Jiti. Please install it with `npm install jiti@2.4.1`"
    )
    throw error
  })
  const path = resolve(dir)
  log.info(
    `Running with Jiti... ${colors.yellow('This is experimental and may not work.')}`
  )
  const jiti = createJiti(path, {
    fsCache: false,
    moduleCache: false
  })
  const resolved = jiti.esmResolve(resolve(join(path, 'index.ts')))

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
