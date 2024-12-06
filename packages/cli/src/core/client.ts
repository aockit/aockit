import { Client } from 'aocjs'
import { log } from './utils'

export const client = new Client({
  session: process.env.AOC_SESSION!,
  logger: log.error
})
