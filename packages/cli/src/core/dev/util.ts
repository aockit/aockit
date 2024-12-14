function sleep(ms = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

function hms(ms: number) {
  let hrs = Math.floor(ms / 1000 / 60 / 60)
  ms -= hrs * 60 * 60 * 1000
  let mins = Math.floor(ms / 1000 / 60)
  ms -= mins * 60 * 1000
  let secs = Math.floor(ms / 1000)
  return `${hrs.toFixed(0).padStart(2, '0')}:${mins.toFixed(0).padStart(2, '0')}:${secs.toFixed(0).padStart(2, '0')}`
}

export async function countdown(until: Date): Promise<void> {
  let remaining = until.getTime() - Date.now()
  if (remaining > 0) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log()
    while (remaining > 0) {
      process.stdout.write(`\rWaiting \x1b[101m${hms(remaining)}\x1b[0m... `)
      await sleep(remaining > 1000 ? 1000 : remaining)
      remaining = until.getTime() - Date.now()
    }
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('\rWaiting \x1b[102m00:00:00\x1b[0m... Done')
  }
}
