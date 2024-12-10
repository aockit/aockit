import readline from 'node:readline'
import { log } from '../utils'
import { onKeyPress } from './keypress'
import { colorize, type ColorName, colors as c } from 'consola/utils'
import { x } from 'tinyexec'

type HandlerContext = {
  year: number
  day: number
  x: typeof x
}

export interface Task {
  keys: string[]
  label: string
  color: ColorName
  disabled?: boolean
  handler: (context: HandlerContext) => void | Promise<void>
}

export function registerTasks(options: Task[]) {
  function formatInstructions() {
    const instructions = options
      .filter(({ disabled }) => !disabled)
      .map(
        ({ keys, label, color }) => `${colorize(color, keys[0])} to ${label}`
      )

    const DEER_PREFIX = `🦌 Press${c.gray(':')} `
    const SEPERATOR = c.gray('•')
    let stringifiedInstructions = instructions.join(` ${SEPERATOR} `)

    const textLength = stringifiedInstructions.length
    const willWrap = textLength > process.stdout.columns

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
          const context: HandlerContext = {
            year: new Date().getFullYear(),
            day: new Date().getDate(),
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
