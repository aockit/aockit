import readline from 'node:readline'
import { log } from '../../utils'
import { onKeyPress } from './keypress'
import { colorize, type ColorName, colors as c } from 'consola/utils'
import { x } from 'tinyexec'

type TaskHandlerContext = {
  year: number
  day: number
  x: typeof x
}

export interface Task {
  keys: string[]
  label: string
  color: ColorName
  disabled?: boolean
  handler: (context: TaskHandlerContext) => void | Promise<void>
}

export function registerTasks(options: Task[], year: number, day: number) {
  function formatInstructions() {
    const instructions = options
      .filter(({ disabled }) => !disabled)
      .map(
        ({ keys, label, color }) =>
          `${colorize(color, keys[0])} to ${colorize('bold', label)}`
      )

    const DEER_PREFIX = `🦌 Press${c.gray(':')} `
    const SEPERATOR = c.gray('•')
    let stringifiedInstructions = instructions.join(` ${SEPERATOR} `)

    const textLength = DEER_PREFIX.length + stringifiedInstructions.length
    // NOTE: I wasn't multiplying with 3 before but it just seems process.stdout.columns is not accurate
    const willWrap = textLength > process.stdout.columns * 3

    if (willWrap) {
      stringifiedInstructions = [
        DEER_PREFIX,
        ...instructions.map((inst) => ` ${SEPERATOR} ${inst}`)
      ].join('\n')
    } else {
      stringifiedInstructions = DEER_PREFIX + stringifiedInstructions
    }

    return stringifiedInstructions
  }

  const unregisterKeyPress = onKeyPress(async (key) => {
    let char = key.name.toLowerCase()

    if (key?.meta) {
      char = `meta+${char}`
    }
    if (key?.ctrl) {
      char = `ctrl+${char}`
    }
    if (key?.shift) {
      char = `shift+${char}`
    }

    for (const { keys, handler } of options) {
      if (keys.includes(char)) {
        try {
          const context: TaskHandlerContext = {
            year,
            day,
            x
          }
          await handler(context)
        } catch (error) {
          log.error(`Error while handling hotkey [${char}]`, error)
        }
      }
    }
  })

  let previousInstructionsLineCount = 0
  function clearPreviousInstructions() {
    if (previousInstructionsLineCount) {
      readline.moveCursor(process.stdout, 0, -previousInstructionsLineCount)
      readline.clearScreenDown(process.stdout)
    }
  }

  function printInstructions() {
    const bottomFloat = formatInstructions()
    console.info(bottomFloat)
    previousInstructionsLineCount = bottomFloat.split('\n').length
  }

  printInstructions()

  return () => {
    unregisterKeyPress()
    clearPreviousInstructions()
  }
}
