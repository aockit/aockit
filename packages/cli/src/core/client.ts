import { Client } from '../../../aocjs/src'

export const client = new Client({
  session: process.env.AOC_SESSION!
})
