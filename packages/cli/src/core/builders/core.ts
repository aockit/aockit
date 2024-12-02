import { Worker } from 'node:worker_threads'
import { resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { log } from '../utils'

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
    if (worker) {
      return
    }

    worker = new Worker(resolve(outfile), {
      execArgv: ['--enable-source-maps'],
      workerData: {},
      stderr: true
    })

    worker.on('error', (error) => {
      // Handle errors in the worker
      const newErr = new Error(`[dev:worker:error] ${error.message}`)
      newErr.stack = error.stack
      log.error(newErr)
    })

    worker.stderr.on('error', (error) => {
      // Handle errors in stderr
      const newErr = new Error(`[dev:stderr:error] ${error.message}`)
      newErr.stack = error.stack
      newErr.cause = error.cause
      log.error(newErr)
    })

    worker.once('exit', () => {
      worker = null
    })

    log.debug('Worker created.')
  }

  function deleteWorker(): void {
    if (worker) {
      worker.removeAllListeners()
      worker.terminate()
      worker = null
    } else null
  }

  const reloadWorker = debounce(async () => {
    deleteWorker()
    await reloadFn()
  })

  return { createWorker, reloadWorker, deleteWorker }
}
