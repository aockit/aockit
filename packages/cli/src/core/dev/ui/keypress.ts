import readline from 'node:readline'
import { PassThrough } from 'node:stream'
/**
 * Test whether the process is "interactive".
 */
export function isInteractive(): boolean {
  try {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY)
  } catch {
    return false
  }
}

export type KeypressEvent = {
  name: string
  sequence: string
  ctrl: boolean
  meta: boolean
  shift: boolean
}

export function onKeyPress(callback: (key: KeypressEvent) => void) {
  // Listening for events on process.stdin (eg .on('keypress')) causes it to go into 'old mode'
  // which keeps this nodejs process alive even after calling .off('keypress')
  // WORKAROUND: piping stdin via a transform stream allows us to call stream.destroy()
  // which then allows this nodejs process to close cleanly
  // https://nodejs.org/api/process.html#signal-events:~:text=be%20used%20in-,%22old%22%20mode,-that%20is%20compatible
  const stream = new PassThrough()
  process.stdin.pipe(stream)

  if (isInteractive()) {
    readline.emitKeypressEvents(stream)
    process.stdin.setRawMode(true)
  }

  // biome-ignore lint/suspicious/useAwait: <explanation>
  const handler = async (_char: string, key: KeypressEvent) => {
    if (key) {
      callback(key)
    }
  }

  stream.on('keypress', handler)

  return () => {
    if (isInteractive()) {
      process.stdin.setRawMode(false)
    }
    stream.off('keypress', handler)
    stream.destroy()
  }
}
