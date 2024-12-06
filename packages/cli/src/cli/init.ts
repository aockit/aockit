import { existsSync } from 'node:fs'
import { defineCommand } from 'citty'
import * as p from '@clack/prompts'
import { scaffoldYear } from '../core/generators/year'
import { colors as c } from 'consola/utils'

function onCancel() {
  p.cancel('Operation cancelled.')
  process.exit(0)
}

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Scaffold a Advent of Code year.'
  },
  async run() {
    const firstYear = 2015
    const currentYear = new Date().getFullYear()

    const years = Array.from({ length: currentYear - firstYear + 1 })
      .fill(firstYear)
      .map((val: any, i) => val + i)
      .reverse()

    console.clear()
    setTimeout(() => {
      /** no-op */
    }, 1000)

    p.intro(c.bgGreenBright(c.black(' aockit ')))
    const k = await p.group(
      {
        year: () =>
          p.select({
            message: 'What calendar year do you want to do?',
            options: years.map((year) => ({ label: year, value: year }))
          }),
        builder: () =>
          p.select({
            message: 'Builder to use.',
            options: [
              { value: 'esbuild', label: 'esbuild' },
              { value: 'jiti', label: 'jiti' },
              { value: 'rolldown', label: 'rolldown' }
            ]
          })
      },
      { onCancel }
    )

    const year = String(k.year!)

    if (existsSync(year)) {
      p.log.error(`${year} already exists, aborting.`)
      process.exit(1)
    }

    await scaffoldYear(year)

    p.outro(`Successfully scaffolded workspace for ${year}.`)
  }
})
