import { join } from 'pathe'
import { defineCommand } from 'citty'
import { createDevContext } from '../core/dev'
import { data as conf } from '../core/io'
import { checkDay } from '../core/generators/day'
import type { Runner } from '../core/types'
import { log } from '../core/dev/ui/logger'

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
    runner: {
      type: 'string',
      description: 'Builder to use.',
      alias: 'r',
      valueHint: 'esbuild|rolldown|jiti|<any custom command>'
    },
    builder: {
      required: false,
      type: 'string',
      description: 'DEPRECATED: use --runner instead.',
      alias: 'b',
      valueHint: 'esbuild|rolldown|jiti'
    }
  },
  async run({ args }) {
    const { year, day, template, runner: _runner, builder } = args
    if (builder)
      log('DEPRECATED: --builder is deprecated, use --runner instead.')

    const runner = (_runner ?? builder) as Runner
    const dir = join(year, day)

    await checkDay(year, day, template)

    const data = await conf.load(year)
    return createDevContext({
      cli: {
        dir,
        day,
        runner,
        year
      },
      data
    })
  }
})
