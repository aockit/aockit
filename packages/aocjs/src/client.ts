import {
  ClientErrors,
  error,
  ok,
  SubmitErrors,
  type ClientOptions,
  type Leaderboard,
  type Result
} from './types'
import defu from 'defu'

export class Client {
  private session: string
  private 'user-agent'?: string = 'aocjs (https://npmjs.com/package/aocjs)'

  constructor(options: ClientOptions & { logger?: (message: string) => void }) {
    this.session = options.session
    if (options['user-agent']) this['user-agent'] = options['user-agent']
  }

  /**
   * Internal fetcher with improved error handling
   */
  public async fetcher(
    path: string,
    _options?: RequestInit
  ): Promise<Result<Response>> {
    if (!this.session) {
      return error('Session cookie is required')
    }

    const options = defu(_options, {
      headers: {
        Cookie: `session=${this.session}`,
        'User-Agent': this['user-agent']!
      }
    })

    const request = await fetch(`https://adventofcode.com/${path}`, options)

    if (!request.ok) {
      const errorMessage = `Network request failed: ${request.status} ${request.statusText}`
      return error(errorMessage)
    }

    return ok(request)
  }

  /**
   * Get a puzzle's input.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   */
  public async getInput(year: string, day: string) {
    const request = await this.fetcher(`${year}/day/${day}/input`)

    if (!request.ok) {
      return error("Couldn't get input", ...request.errors)
    }

    return ok(await request.value.text())
  }

  /**
   * Gets your specified private leaderboard.
   * @param year Advent of Code year.
   * @param id Your leaderboard id.
   * @param [sorted=false] If true, returns a sorted array of leaderboard members by stars.
   */
  public async getLeaderboard<const T extends boolean = false>(
    year: string,
    id: string,
    sorted?: T
  ): Promise<
    Result<T extends true ? Array<Leaderboard['members'][string]> : Leaderboard>
  > {
    const request = await this.fetcher(
      `${year}/leaderboard/private/view/${id}.json`
    )

    if (!request.ok) {
      return error("Couldn't get leaderboard", ...request.errors)
    }

    if (request.value.status === 302) {
      const errorMessage = `Cannot access leaderboard: Year ${year}, ID ${id}. Does the leaderboard exist or do you have access?`
      return error(errorMessage)
    }

    const data = (await request.value.json()) as Leaderboard

    if (sorted) {
      return ok(
        Object.values(data.members).sort(
          (a, b) =>
            b.stars - a.stars ||
            b.local_score - a.local_score ||
            b.global_score - a.global_score
        )
      ) as Result<
        T extends true ? Array<Leaderboard['members'][string]> : Leaderboard
      >
    }

    return ok(data) as Result<
      T extends true ? Array<Leaderboard['members'][string]> : Leaderboard
    >
  }

  /**
   * Get a puzzle's problem.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   * @param raw If true, returns the raw HTML of the problem.
   */
  public async getProblem(
    year: string,
    day: string,
    raw?: boolean
  ): Promise<Result<string>> {
    const request = await this.fetcher(`${year}/day/${day}`)

    if (!request.ok) {
      return error("Couldn't get problem", ...request.errors)
    }

    const html = await request.value.text()

    if (raw) {
      return ok(html)
    }

    const mainElement = this.getMainElementHtml(html)

    if (!mainElement.ok) {
      return error(ClientErrors.MainElementError, ...mainElement.errors)
    }

    return ok(mainElement.value)
  }

  /**
   * Get the main element HTML from a response.
   *
   * @param html Response HTML.
   */
  public getMainElementHtml(html: string): Result<string> {
    const match = /<main\b[^>]*>(.*)<\/main>/s.exec(html)
    if (!match) {
      return error(ClientErrors.MainElementError)
    }
    return ok(match[1])
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
    year: string,
    day: string,
    part: 1 | 2,
    solution: string
  ): Promise<Result<typeof SubmitErrors | typeof ClientErrors | true>> {
    const request = await this.fetcher(`${year}/day/${day}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        level: part.toString(),
        answer: solution
      })
    })

    if (!request.ok) {
      return error(ClientErrors.SubmissionError, ...request.errors)
    }

    const text = await request.value.text()
    const response = this.getMainElementHtml(text)

    if (!response.ok) {
      return error(ClientErrors.MainElementError, ...response.errors)
    }

    const responseText = response.value

    if (responseText.includes("That's the right answer!")) return ok(true)

    if (responseText.includes("That's not the right answer"))
      return error(SubmitErrors.IncorrectAnswer)

    if (responseText.includes("You don't seem to be solving the right level."))
      return error(SubmitErrors.NotSolvingTheRightLevel)

    if (responseText.includes('To play, please identify yourself'))
      return error(SubmitErrors.Unidentified)

    return error(ClientErrors.SubmissionError)
  }
}

export default Client
