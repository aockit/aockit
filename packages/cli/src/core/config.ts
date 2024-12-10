import type { Task } from './ui/tasks'
import { loadConfig as _loadConfig } from 'c12'

interface Config {
  tasks: Task[]
}

export function defineConfig(config: Config) {
  return config
}

export function loadConfig(defaults: Config) {
  const config = _loadConfig<Config>({
    cwd: process.cwd(),
    name: 'kit',
    defaults
  })

  return config
}
