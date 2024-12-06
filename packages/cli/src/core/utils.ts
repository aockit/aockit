import fsp from 'node:fs/promises'
import consola from 'consola'
import type { Config } from './types'
import { extname, join } from 'pathe'
import { colors as c } from 'consola/utils'

export const log = consola.create({ defaults: { tag: '🎄' } })
export const toFixed = (value: number, precision: number = 3) =>
  Number(value.toFixed(precision))

export function generateConfig(year: string): string {
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
      ),
      builder: null
    } satisfies Config,
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

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
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
