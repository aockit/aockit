import { error, ok, type Result } from '../types'

type ParsedResult = {
  part1: {
    result: string
    time: number
  }
  part2: {
    result: string
    time: number
  }
}

export function parseResults(input: string): Result<ParsedResult> {
  const regex = /Part (\d+): (\d+|\w+) \(took ([\d.]+)ms\)/g
  const parts: Partial<ParsedResult> = {}
  let match

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = regex.exec(input)) !== null) {
    const [, part, result, timeTaken] = match
    const time = Number.parseFloat(timeTaken)

    if (part === '1') {
      parts.part1 = { result, time }
    } else if (part === '2') {
      parts.part2 = { result, time }
    }
  }

  if (!(parts.part1 && parts.part2)) {
    return error('Input is missing part 1 or part 2 results')
  }

  return ok(parts as ParsedResult)
}
