import { isInteractive } from './keypress'
import { createLogUpdate } from 'log-update'
import { grayBar, logRaw, newline } from './logger'
import colors from 'tinyrainbow'

const logUpdate = createLogUpdate(process.stdout)

export type SpinnerStyle = keyof typeof spinnerFrames
export const spinnerFrames = {
  clockwise: ['┤', '┘', '┴', '└', '├', '┌', '┬', '┐'],
  vertical: ['▁', '▃', '▄', '▅', '▆', '▇', '▆', '▅', '▄', '▃'],
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  stars: ['✶', '✸', '✹', '✺', '✹', '✷']
}

const ellipsisFrames = ['', '.', '..', '...', ' ..', '  .', '']
const leftT = colors.gray('├')

export const spinner = (style: SpinnerStyle = 'clockwise') => {
  const frameRate = 120
  let loop: ReturnType<typeof setTimeout> | null = null
  let startMsg: string
  let currentMsg: string

  const frames = spinnerFrames[style]

  function clearLoop() {
    if (loop) {
      clearTimeout(loop)
    }
    loop = null
  }

  return {
    start(msg: string, helpText?: string) {
      // biome-ignore lint/style/noParameterAssign: <explanation>
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      helpText ||= ``
      currentMsg = msg
      startMsg = currentMsg
      if (helpText !== undefined && helpText.length > 0) {
        startMsg += ` ${colors.dim(helpText)}`
      }

      if (isInteractive()) {
        let index = 0

        clearLoop()
        loop = setInterval(() => {
          index++
          const spinnerFrame = frames[index % frames.length]
          const ellipsisFrame = ellipsisFrames[index % ellipsisFrames.length]

          if (msg) {
            logUpdate(
              `${colors.magenta(spinnerFrame)} ${currentMsg} ${ellipsisFrame}`
            )
          }
        }, frameRate)
      } else {
        logRaw(`${leftT} ${startMsg}`)
      }
    },
    update(msg: string) {
      currentMsg = msg
    },
    stop(msg?: string) {
      if (isInteractive()) {
        // Write the final message and clear the loop
        logUpdate.clear()
        if (msg) {
          logUpdate(`${leftT} ${startMsg}\n${grayBar} ${msg}`)
          logUpdate.done()
          newline()
        }
        clearLoop()
      } else {
        if (msg !== undefined) {
          logRaw(`${grayBar} ${msg}`)
        }
        newline()
      }
    }
  }
}
