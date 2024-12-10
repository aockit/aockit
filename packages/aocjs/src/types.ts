export interface Leaderboard {
  members: Record<
    string,
    {
      id: number
      name: string
      stars: number
      global_score: number
      local_score: number
      last_star_ts: number
    }
  >
}

export interface ClientOptions {
  /** Browser session key.*/
  session: string
  /** User-Agent for requests, not recommended to change. */
  'user-agent'?: string
}

export type Ok<T> = {
  readonly ok: true
  readonly errors?: undefined
  readonly value: T
}

export type Error = {
  readonly ok: false
  readonly errors: readonly string[]
  readonly value?: undefined
}

export type Result<T> = Ok<T> | Error

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function error(reason: string, ...other: string[]): Error
export function error(...errors: readonly [string, ...string[]]): Error {
  return { ok: false, errors }
}

export const ClientErrors = {
  SessionCookieRequired: 'Session cookie is required',
  SubmissionError: 'Could not submit answer',
  MainElementError: 'Could not get main element'
} as const

export const SubmitErrors = {
  Unidentified: 'To play, please identify yourself',
  IncorrectAnswer: "That's not the right answer",
  NotSolvingTheRightLevel: 'Not solving the right level'
} as const
