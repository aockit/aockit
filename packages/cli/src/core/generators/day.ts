import fsp from 'node:fs/promises'
import { colors as c } from 'consola/utils'
import { join } from 'pathe'
import { generateFileTree, log } from '../utils'
import { processTemplate } from '../templates'
import { client } from '../client'

export function generateCode(): string {
  return `import { run } from "@aockit/core";

run({});
`
}

export function generateDayReadme(year: number, day: number): string {
  return `
# 🎄 Advent of Code ${year} • day ${day} 🎄

Task description: [link](https://adventofcode.com/${year}/day/${day})
`
}

export async function scaffoldDay(
  year: string,
  day: string,
  template?: string
): Promise<void> {
  // exit early if not present
  if (!process.env.AOC_SESSION) {
    log.error(
      `The ${c.magenta(
        'AOC_SESSION'
      )} enviornment variable is not set. You can set it by exporting AOC_SESSION in your shellrc.`
    )
    process.exit(1)
  }

  const dir = join(year, day) // 2023/2
  await fsp.mkdir(dir, { recursive: true })

  if (template)
    await processTemplate(year, day, template, dir, {
      year: Number(year),
      day: Number(day)
    })
  else await fsp.writeFile(join(dir, 'index.ts'), generateCode())

  log.info('Downloading input...')
  const input = await client.getInput(Number(year), Number(day))
  await fsp.writeFile(join(dir, 'input.txt'), input)
  log.success('Downloaded input!')

  const readme = generateDayReadme(Number(year), Number(day))
  await fsp.writeFile(join(dir, 'README.md'), readme)

  const tree = await generateFileTree(dir)

  log.success(`Successfully scaffolded project for day ${day}, year ${year}.`)
  log.info('Your file tree should look like this:')

  console.info(tree)
}
