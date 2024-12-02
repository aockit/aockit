import fsp from 'node:fs/promises'
import { join } from 'pathe'
import consola from 'consola'
import type { Config } from './types'
import { config } from './io'

export const log = consola.create({ defaults: { tag: '🎄' } })
export const dedent = (str: string) =>
  str.replaceAll(new RegExp(`^${(/^(\t| )+/.exec(str) || '')[0]}`, 'gm'), '')
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
      )
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

export async function setRunner(
  year: string,
  day: string,
  template: string,
  dir: string
): Promise<void> {
  const tmpl = join('templates', template)
  const file = join(tmpl, '.aockit.json')

  // 1. Copy the template to our day
  await fsp.cp(tmpl, dir, { recursive: true })

  // 2. Exit early if template does not have an config file
  if (await accessible(file)) {
    // 3. Read our template config and the root config
    const tmpconf = JSON.parse(await fsp.readFile(file, { encoding: 'utf-8' }))
    const conf = await config.load(year)

    // 4. Write to our year root config
    if (tmpconf.runner !== undefined)
      conf.days[Number(day)].runner = tmpconf.runner
    await config.save(year, conf)

    // 5. Remove the temporary file
    await fsp.rm(join(year, day, '.aockit.json'))
  }
}
