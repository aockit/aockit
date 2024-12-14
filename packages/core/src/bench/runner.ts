import type { Context, Input } from '../types'

export async function createBenchRunner(context: Context, input: Input) {
  // Decide which benchmarking library to use
  if (context.bench) {
    if (context.bench.tool === 'mitata') {
      // Use mitata
      const mitataContext = await import('mitata').catch(() => {
        throw new Error('mitata not found')
      })

      await context.bench.bench(mitataContext, input)
    } else if (context.bench.tool === 'tinybench') {
      // Use tinybench
      const tinybenchContext = await import('tinybench').catch(() => {
        throw new Error('tinybench not found')
      })

      await context.bench.bench(tinybenchContext, input)
    } else {
      throw new Error(
        'Invalid bench context, please install mitata or tinybench'
      )
    }
  }
}
