import { existsSync } from 'node:fs'
import { join } from 'pathe'
import { defineCommand } from 'citty'
import { createDevContext } from '../core/dev'
import { config as conf } from '../core/io'
import { checkDay, scaffoldDay } from '../core/generators/day'
import { scaffoldYear } from '../core/generators/year'

export default defineCommand({
  meta: {
    name: 'start',
    description: 'Start a new challenge.'
  },
  args: {
    day: {
      type: 'positional',
      description: 'The Advent of Code calendar day.',
      required: true
    },
    year: {
      type: 'string',
      description: 'The Advent of Code calendar year.',
      default: new Date().getFullYear().toString(),
      alias: 'y',
      valueHint: '2023'
    },
    template: {
      type: 'string',
      description:
        'Template to use from the name of folder in templates/ folder.',
      alias: 't'
    },
    builder: {
      type: 'string',
      description: 'Builder to use.',
      alias: 'b',
      default: 'esbuild',
      valueHint: 'esbuild|rolldown|jiti'
    }
  },
  async run({ args }) {
    const { year, day, template, builder } = args
    const dir = join(year, day)

    await checkDay(year, day, template)

    const config = await conf.load(year)
    return createDevContext({ dir, config, day, builder, year })
  }
})
