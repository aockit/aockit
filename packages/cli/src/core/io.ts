import fsp from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'pathe'
import type { Data } from './types'

class FileOperationError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'FileOperationError'
  }
}

export const data = {
  /**
   * Load configuration from .aockit.json
   * @param year - The year directory to load config from
   * @returns Parsed configuration object
   * @throws {FileOperationError} If file reading or parsing fails
   */
  load: async (year: string): Promise<Data> => {
    try {
      const filePath = join(year, '.aockit.json')
      const rawData = await fsp.readFile(filePath, { encoding: 'utf-8' })

      try {
        const parsedConfigData = JSON.parse(rawData)

        return parsedConfigData as Data
      } catch (parseError) {
        throw new FileOperationError('Invalid JSON configuration', parseError)
      }
    } catch (readError) {
      throw new FileOperationError(
        `Failed to read configuration for year ${year}`,
        readError
      )
    }
  },

  /**
   * Save configuration to .aockit.json
   * @param year - The year directory to save config to
   * @param _config - Configuration object to save
   * @throws {FileOperationError} If file writing fails
   */
  save: async (year: string, _config: Data): Promise<void> => {
    try {
      const filePath = join(year, '.aockit.json')
      const data = JSON.stringify(_config, null, 2)

      await fsp.writeFile(filePath, data, {
        encoding: 'utf-8',
        flag: 'w' // Explicitly overwrite
      })
    } catch (error) {
      throw new FileOperationError(
        `Failed to save configuration for year ${year}`,
        error
      )
    }
  }
}

export const readme = {
  /**
   * Load README.md contents
   * @param year - The year directory to load README from
   * @returns README contents as a string
   * @throws {FileOperationError} If file reading fails
   */
  load: async (year: string): Promise<string> => {
    try {
      const filePath = join(year, 'README.md')
      return await fsp.readFile(filePath, { encoding: 'utf-8' })
    } catch (error) {
      throw new FileOperationError(
        `Failed to read README for year ${year}`,
        error
      )
    }
  },

  /**
   * Save README.md contents
   * @param year - The year directory to save README to
   * @param contents - Contents to write to README
   * @throws {FileOperationError} If file writing fails
   */
  save: async (year: string, contents: string): Promise<void> => {
    try {
      const filePath = join(year, 'README.md')
      await fsp.writeFile(filePath, contents, {
        encoding: 'utf-8',
        flag: 'w' // Explicitly overwrite
      })
    } catch (error) {
      throw new FileOperationError(
        `Failed to save README for year ${year}`,
        error
      )
    }
  }
}

const homeDir = homedir()
const CACHE_DIR =
  process.platform === 'darwin'
    ? join(homeDir, 'Library', 'Caches', 'aockit')
    : process.platform === 'win32'
      ? join(homeDir, 'AppData', 'Local', 'aockit')
      : process.platform === 'linux'
        ? join(homeDir, '.cache', 'aockit')
        : join(homeDir, '.aockit')

async function read(year: string, day: string) {
  const filePath = join(year, day)
  const pathname = join(CACHE_DIR, filePath)
  return await fsp.readFile(pathname, { encoding: 'utf-8' })
}

async function write(year: string, day: string, data: string) {
  const filePath = join(year, day)
  const pathname = join(CACHE_DIR, filePath)
  await fsp.mkdir(dirname(pathname), { recursive: true })
  return await fsp.writeFile(pathname, data)
}

export const cache = {
  read,
  write
}
