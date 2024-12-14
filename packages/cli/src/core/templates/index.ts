import fsp from 'node:fs/promises'
import path from 'node:path'
import { template } from './lib'
import { basename } from 'pathe'
import { data } from '../io'
import type { Runner } from '../types'

export async function processTemplate(
  year: string,
  day: string,
  templateName: string,
  destination: string,
  variables: Record<string, any>
): Promise<void> {
  const templateDir = path.join('templates')
  const templatePath = path.join(templateDir, templateName)
  await fsp.mkdir(destination, { recursive: true })

  // Check if template exists
  try {
    await fsp.access(templatePath)
  } catch (_err) {
    throw new Error(`Template '${templateName}' not found in ${templateDir}`)
  }

  async function process(sourcePath: string, destPath: string): Promise<void> {
    const stats = await fsp.stat(sourcePath)

    if (stats.isDirectory()) {
      await fsp.mkdir(destPath, { recursive: true })

      const items = await fsp.readdir(sourcePath)
      await Promise.all(
        items.map(async (item) => {
          const currentSourcePath = path.join(sourcePath, item)
          const currentDestPath = path.join(
            destPath,
            // Remove .tmpl extension for destination
            item.endsWith('.tmpl') ? item.slice(0, -5) : item
          )

          await process(currentSourcePath, currentDestPath)
        })
      )
    } else if (stats.isFile()) {
      const content = await fsp.readFile(sourcePath, 'utf8')

      if (basename(sourcePath) === 'runner') {
        const conf = await data.load(year)
        conf.days[Number(day)].config!.runner = content as Runner
        await data.save(year, conf)
        return
      }

      const templatedContent = template(content, variables)

      const finalDestPath = destPath.endsWith('.tmpl')
        ? destPath.slice(0, -5)
        : destPath

      await fsp.writeFile(finalDestPath, templatedContent)
    }
  }

  await process(templatePath, destination)
}
