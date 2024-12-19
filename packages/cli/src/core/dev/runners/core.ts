import { Worker } from 'node:worker_threads'
import { resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import * as log from '../ui/logger'

export interface RunnerContext {
  reload: (task?: 'test' | 'bench') => Promise<void>
  dispose?: () => Promise<void> | void
  exec?: boolean
}

export async function createWorkerContext(
  dir: string,
  outfile: string,
  reloadFn: (task?: 'test' | 'bench') => Promise<void>
) {
  let worker: Worker | null = null
  const inputFile = resolve(dir, 'input.txt')

  function createWorker(task?: 'test' | 'bench'): void {
    if (worker) deleteWorker()

    try {
      const argv = [`--input=${inputFile}`]
      // Add --bench or --test flag if either is true or add nothing
      if (task) argv.push(`--${task}`)

      worker = new Worker(resolve(outfile), {
        execArgv: ['--enable-source-maps', '--'],
        argv,
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

  const reload = debounce(async (task?: 'test' | 'bench') => {
    deleteWorker()
    await reloadFn(task)
    createWorker(task)
  }, 100)

  return { createWorker, reloadWorker: reload, deleteWorker }
}
