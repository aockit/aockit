import { Worker } from 'node:worker_threads'
import { resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { log } from '../utils'
import { existsSync } from 'node:fs'

export async function createWorkerContext(
  outfile: string,
  reloadFn: () => Promise<void>
): Promise<{
  createWorker: () => void
  reloadWorker: () => Promise<void>
  deleteWorker: () => void
}> {
  let worker: Worker | null = null

  function createWorker(): void {
    if (!existsSync(outfile)) {
      log.error(`[dev:worker:error] Output file does not exist: ${outfile}`)
      return
    }

    if (worker) {
      deleteWorker() // Ensure previous worker is cleaned up
    }

    try {
      worker = new Worker(resolve(outfile), {
        execArgv: ['--enable-source-maps'],
        workerData: {},
        stderr: true
      })

      worker.on('error', (error) => {
        log.error(
          `[dev:worker:error] Worker initialization failed: ${error.message}`
        )
        console.error(error.stack)
        worker = null
      })

      worker.stderr.on('data', (data) => {
        log.error(`[dev:worker:stderr] ${data.toString().trim()}`)
      })

      log.debug(`Worker created successfully: ${outfile}`)
    } catch (error) {
      log.error(
        `[dev:worker:error] Failed to create worker: ${error instanceof Error ? error.message : error}`
      )
      throw error
    }
  }

  function deleteWorker(): void {
    if (worker) {
      try {
        worker.removeAllListeners()
        worker.terminate()
      } catch (error) {
        log.error(
          `[dev:worker:terminate:error] ${error instanceof Error ? error.message : error}`
        )
      }
      worker = null
    }
  }

  const reloadWorker = debounce(async () => {
    deleteWorker()
    await reloadFn()
    createWorker()
  }, 100)

  // Automatically create worker on initialization
  createWorker()

  return { createWorker, reloadWorker, deleteWorker }
}
