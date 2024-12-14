import fsp from 'node:fs/promises'
import consola from 'consola'
import type { Data } from './types'
import { extname, join } from 'pathe'
import { colors as c } from 'consola/utils'

export const log = consola.create({ defaults: { tag: '🎄' } })
export const toFixed = (value: number, precision: number = 3) =>
  Number(value.toFixed(precision))

export function generateData(year: string): string {
  return JSON.stringify(
    {
      year: Number(year),
      days: Object.fromEntries(
        Array.from({ length: 25 }, (_, index) => [
          index + 1,
          {
            runner: null,
            part1: { solved: false, result: null, time: null },
            part2: { solved: false, result: null, time: null }
          }
        ])
      )
    } satisfies Data,
    null,
    2
  )
}

export function accessible(path: string): Promise<boolean> {
  return fsp.access(path).then(
    () => true,
    () => false
  )
}

export async function generateFileTree(
  dirPath: string,
  depth: number = Number.POSITIVE_INFINITY,
  prefix: string = ''
) {
  // Validate input path
  if (!(await accessible(dirPath))) {
    throw new Error(`Directory does not exist: ${dirPath}`)
  }

  let tree = ''

  // Read directory contents
  const files = await fsp.readdir(dirPath, { recursive: true })

  files.forEach(async (file, index) => {
    const fullPath = join(dirPath, file)
    const stats = await fsp.stat(fullPath)
    const isLast = index === files.length - 1

    // Determine tree prefix
    const connector = isLast ? '└── ' : '├── '
    const newPrefix = prefix + (isLast ? '    ' : '│   ')

    // Color and style different file types
    let displayName = file
    if (stats.isDirectory()) {
      displayName = c.blue(file)
    } else if (stats.isSymbolicLink()) {
      displayName = c.magenta(file)
    } else if (stats.isFile()) {
      const ext = extname(file)
      switch (ext) {
        case '.js':
        case '.ts':
          displayName = c.yellow(file)
          break
        case '.json':
          displayName = c.green(file)
          break
        case '.md':
          displayName = c.cyan(file)
          break
        default:
          displayName = c.white(file)
      }
    }

    // Add current file/directory to tree
    tree += `${prefix}${connector}${displayName}\n`

    // Recursively add subdirectories if depth allows
    if (stats.isDirectory() && depth > 1) {
      tree += generateFileTree(fullPath, depth - 1, newPrefix)
    }
  })

  return tree
}

export function dedent(
  templ: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  let strings = Array.from(typeof templ === 'string' ? [templ] : templ)

  strings[strings.length - 1] = strings[strings.length - 1].replace(
    /\r?\n([\t ]*)$/,
    ''
  )
  const indentLengths = strings.reduce(
    (arr, str) => {
      const matches = str.match(/\n([\t ]+|(?!\s).)/g)
      if (matches) {
        return arr.concat(
          matches.map((match) => match.match(/[\t ]/g)?.length ?? 0)
        )
      }
      return arr
    },
    <number[]>[]
  )

  if (indentLengths.length) {
    const pattern = new RegExp(`\n[\t ]{${Math.min(...indentLengths)}}`, 'g')

    strings = strings.map((str) => str.replace(pattern, '\n'))
  }

  strings[0] = strings[0].replace(/^\r?\n/, '')

  let string = strings[0]

  values.forEach((value, i) => {
    const endentations = string.match(/(?:^|\n)( *)$/)
    const endentation = endentations ? endentations[1] : ''
    let indentedValue = value
    if (typeof value === 'string' && value.includes('\n')) {
      indentedValue = String(value)
        .split('\n')
        .map((str, i) => {
          return i === 0 ? str : `${endentation}${str}`
        })
        .join('\n')
    }

    string += indentedValue + strings[i + 1]
  })

  return string
}
