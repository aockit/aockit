import type { ClientOptions, Leaderboard } from './types'
import defu from 'defu'
import {
  ClientError,
  AuthenticationError,
  NetworkError,
  LeaderboardError,
  SubmissionError
} from './errors'
export {
  ClientError,
  AuthenticationError,
  NetworkError,
  LeaderboardError,
  SubmissionError,
  ClientOptions,
  Leaderboard
}

export class Client {
  private session: string
  private 'user-agent'?: string = 'aocjs (https://npmjs.com/package/aocjs)'
  private logger: (message: string) => void

  constructor(options: ClientOptions & { logger?: (message: string) => void }) {
    this.session = options.session
    if (options['user-agent']) this['user-agent'] = options['user-agent']
    this.logger = options.logger || console.error
  }

  /**
   * Internal fetcher with improved error handling
   */
  public async fetcher(
    path: string,
    _options?: RequestInit
  ): Promise<Response> {
    if (!this.session) {
      throw new AuthenticationError('Session cookie is required')
    }

    const options = defu(_options, {
      headers: {
        Cookie: `session=${this.session}`,
        'User-Agent': this['user-agent']!
      }
    })

    try {
      const request = await fetch(`https://adventofcode.com/${path}`, options)

      if (!request.ok) {
        const errorMessage = `Network request failed: ${request.status} ${request.statusText}`
        this.logger(errorMessage)
        throw new NetworkError(errorMessage, request.status, request.statusText)
      }

      return request
    } catch (error) {
      if (error instanceof NetworkError) throw error

      this.logger(
        `Fetch error: ${error instanceof Error ? error.message : String(error)}`
      )
      throw new NetworkError(
        'Network request failed',
        undefined,
        error instanceof Error ? error.message : undefined
      )
    }
  }

  /**
   * Get a puzzle's input.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   */
  public async getInput(year: number, day: number): Promise<string> {
    try {
      return await (await this.fetcher(`${year}/day/${day}/input`)).text()
    } catch (error) {
      this.logger(
        `Failed to get input for year ${year}, day ${day}: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  /**
   * Gets your specified private leaderboard.
   * @param year Advent of Code year.
   * @param id Your leaderboard id.
   * @param [sorted=false] If true, returns a sorted array of leaderboard members by stars.
   */
  public async getLeaderboard<const T extends boolean = false>(
    year: number,
    id: number,
    sorted?: T
  ): Promise<
    T extends true ? Array<Leaderboard['members'][string]> : Leaderboard
  > {
    try {
      const request = await this.fetcher(
        `${year}/leaderboard/private/view/${id}.json`
      )

      if (request.status === 302) {
        throw new LeaderboardError(
          `Cannot access leaderboard: Year ${year}, ID ${id}. Does the leaderboard exist or do you have access?`
        )
      }

      const data = (await request.json()) as Leaderboard

      if (sorted) {
        return Object.values(data.members).sort(
          (a, b) =>
            b.stars - a.stars ||
            b.local_score - a.local_score ||
            b.global_score - a.global_score
        ) as T extends true
          ? Array<Leaderboard['members'][string]>
          : Leaderboard
      }
      return data as T extends true
        ? Array<Leaderboard['members'][string]>
        : Leaderboard
    } catch (error) {
      this.logger(
        `Leaderboard retrieval failed: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  /**
   * Get a puzzle's problem.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   * @param raw If true, returns the raw HTML of the problem.
   */
  public async getProblem(year: number, day: number, raw?: boolean) {
    try {
      const request = await this.fetcher(`${year}/day/${day}`)
      const html = await request.text()

      if (raw) {
        return html
      }

      return this.getMainElementHtml(html)
    } catch (error) {
      this.logger(
        `Failed to get problem for year ${year}, day ${day}: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  /**
   * Get the main element HTML from a response.
   *
   * @param html Response HTML.
   */
  public getMainElementHtml(html: string): string {
    const match = /<main\b[^>]*>(.*)<\/main>/s.exec(html)
    if (!match) {
      throw new ClientError('Could not find main element in response')
    }
    return match[1]
  }

  /**
   * Submits a solution to the server.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   * @param part Part of the puzzle to submit.
   * @param solution Solution to the puzzle.
   */
  public async submit(
    year: number,
    day: number,
    part: number,
    solution: string
  ): Promise<boolean> {
    try {
      const request = await this.fetcher(`${year}/day/${day}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          level: String(part),
          answer: String(solution)
        })
      })

      const response = this.getMainElementHtml(await request.text())

      if (response.includes("That's the right answer!")) {
        return true
      }

      if (response.includes("That's not the right answer")) {
        return false
      }

      if (response.includes("You don't seem to be solving the right level.")) {
        const problem = await this.getProblem(year, day)
        const problemSplitByPart = problem.split('</article>')
        let relevantProblemPart = problemSplitByPart[part]

        if (!relevantProblemPart) {
          throw new SubmissionError('Could not find correct answer in page')
        }

        relevantProblemPart = relevantProblemPart.split('<article')[0]
        const match = /Your puzzle answer was <code>([^<]+)<\/code>/.exec(
          relevantProblemPart
        )

        if (!match) {
          throw new SubmissionError('Could not find correct answer in page')
        }

        const correctAnswer = match[1]
        return String(correctAnswer) === solution
      }

      if (response.includes('To play, please identify yourself')) {
        throw new AuthenticationError('Session cookie is invalid or not set')
      }

      this.logger(`Unexpected submission response: ${JSON.stringify(response)}`)
      throw new SubmissionError('Could not parse submission response')
    } catch (error) {
      this.logger(
        `Submission failed for year ${year}, day ${day}, part ${part}: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }
}

export default Client
