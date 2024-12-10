import { defineCommand } from 'citty'
import { updateReadme } from '../core/generators/readme'

export default defineCommand({
  meta: { name: 'readme' },
  args: {
    year: {
      type: 'positional',
      required: true,
      description: 'The advent year.'
    }
  },
  async run({ args }) {
    const { year } = args
    return await updateReadme(year)
  }
})
