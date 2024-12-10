import { generateResults, generateDayBadges } from '../generators/year'
import { config, readme } from '../io'
import { log } from '../utils'

export async function updateReadme(year: string) {
  const conf = await config.load(year)
  const badges = generateDayBadges(conf)
  const results = generateResults(conf)

  const contents = await readme
    .load(year)
    .then((data) =>
      data
        .replace(
          /<!--SOLUTIONS-->(?<badges>.|\n|\r)+<!--\/SOLUTIONS-->/,
          `<!--SOLUTIONS-->\n\n${badges}\n\n<!--/SOLUTIONS-->`
        )
        .replace(
          /<!--RESULTS-->(?<results>.|\n|\r)+<!--\/RESULTS-->/,
          `<!--RESULTS-->\n\n${results}\n\n<!--/RESULTS-->`
        )
    )

  await readme.save(year, contents).catch((error) => console.error(error))
  log.success(`Successfully updated README for year ${year}.`)
}
