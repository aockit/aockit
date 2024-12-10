import colors from 'tinyrainbow'

export const status = {
  error: colors.bgRed(' ERROR '),
  warning: colors.bgYellow(' WARNING '),
  info: colors.bgBlue(' INFO '),
  success: colors.bgGreen(' SUCCESS '),
  cancel: colors.bgRed(colors.white(' X '))
}

export const shapes = {
  diamond: '◇',
  dash: '─',
  radioInactive: '○',
  radioActive: '●',

  backActive: '◀',
  backInactive: '◁',

  bar: '│',
  leftT: '├',
  rigthT: '┤',

  arrows: {
    left: '‹',
    right: '›'
  },

  corners: {
    tl: '╭',
    bl: '╰',
    tr: '╮',
    br: '╯'
  }
}
export const grayBar = colors.gray('│')
export const log = (msg: string) => {
  const lines = msg
    .split('\n')
    .map((ln) => `${grayBar}${ln.length > 0 ? ` ${colors.white(ln)}` : ''}`)

  logRaw(lines.join('\n'))
}

export const newline = () => log('')
export const logRaw = (msg: string) => process.stdout.write(`${msg}\n`)

export const space = (n = 1) => {
  return colors.hidden('\u200A'.repeat(n))
}
type FormatOptions = {
  linePrefix?: string
  firstLinePrefix?: string
  newlineBefore?: boolean
  newlineAfter?: boolean
  formatLine?: (line: string) => string
  multiline?: boolean
}
export const format = (
  msg: string,
  {
    linePrefix = colors.gray(shapes.bar),
    firstLinePrefix = linePrefix,
    newlineBefore = false,
    newlineAfter = false,
    formatLine = (line: string) => colors.white(line),
    multiline = true
  }: FormatOptions = {}
) => {
  const lines = multiline ? msg.split('\n') : [msg]
  const formattedLines = lines.map(
    (line, i) =>
      (i === 0 ? firstLinePrefix : linePrefix) + space() + formatLine(line)
  )

  if (newlineBefore) {
    formattedLines.unshift(linePrefix)
  }
  if (newlineAfter) {
    formattedLines.push(linePrefix)
  }

  return formattedLines.join('\n')
}

// Log a simple status update with a style similar to the clack spinner
export const updateStatus = (msg: string, printNewLine = true) => {
  logRaw(
    format(msg, {
      firstLinePrefix: colors.gray(shapes.leftT),
      linePrefix: colors.gray(shapes.bar),
      newlineAfter: printNewLine
    })
  )
}

export const startSection = (
  heading: string,
  subheading?: string,
  printNewLine = true
) => {
  logRaw(
    `${colors.gray(shapes.corners.tl)} ${colors.cyan(heading)} ${
      subheading ? colors.dim(subheading) : ''
    }`
  )
  if (printNewLine) {
    newline()
  }
}

export const endSection = (heading: string, subheading?: string) => {
  logRaw(
    `${colors.gray(shapes.corners.bl)} ${colors.cyan(heading)} ${
      subheading ? colors.dim(subheading) : ''
    }\n`
  )
}

export const cancel = (
  msg: string,
  { shape = shapes.corners.bl, multiline = true } = {}
) => {
  logRaw(
    format(msg, {
      firstLinePrefix: `${colors.gray(shape)} ${status.cancel}`,
      linePrefix: colors.gray(shapes.bar),
      newlineBefore: true,
      formatLine: (line) => colors.dim(line), // for backcompat but it's not ideal for this to be "dim"
      multiline
    })
  )
}

export const warn = (
  msg: string,
  { shape = shapes.bar, multiline = true, newlineBefore = true } = {}
) => {
  logRaw(
    format(msg, {
      firstLinePrefix: colors.gray(shape) + space() + status.warning,
      linePrefix: colors.gray(shapes.bar),
      formatLine: (line) => colors.dim(line), // for backcompat but it's not ideal for this to be "dim"
      multiline,
      newlineBefore
    })
  )
}

export const success = (
  msg: string,
  { shape = shapes.bar, multiline = true } = {}
) => {
  logRaw(
    format(msg, {
      firstLinePrefix: colors.gray(shape) + space() + status.success,
      linePrefix: colors.gray(shapes.bar),
      newlineBefore: true,
      formatLine: (line) => colors.dim(line), // for backcompat but it's not ideal for this to be "dim"
      multiline
    })
  )
}

// Strip the ansi color characters out of the line when calculating
// line length, otherwise the padding will be thrown off
// Used from https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts
export const stripAnsi = (str: string) => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
  ].join('|')
  const regex = new RegExp(pattern, 'g')

  return str.replace(linkRegex, '$2').replace(regex, '')
}

// Regular Expression that matches a hyperlink
// e.g. `\u001B]8;;http://example.com/\u001B\\This is a link\u001B]8;;\u001B\`
export const linkRegex =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  /\u001B\]8;;(?<url>.+)\u001B\\(?<label>.+)\u001B\]8;;\u001B\\/g

// Create a hyperlink in terminal
// It works in iTerm2 and VSCode's terminal, but not macOS built-in terminal app
export const hyperlink = (url: string, label = url) => {
  return `\u001B]8;;${url}\u001B\\${label}\u001B]8;;\u001B\\`
}

export const crash: (msg?: string, extra?: string) => never = (msg, extra) => {
  error(msg, extra)
  process.exit(1)
}

export const error = (
  msg?: string,
  extra?: string,
  corner = shapes.corners.bl
) => {
  if (msg) {
    process.stderr.write(
      `${colors.gray(corner)} ${status.error} ${colors.dim(msg)}\n${
        extra ? `${space() + extra}\n` : ''
      }`
    )
  }
}
