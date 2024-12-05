export class ClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AOCClientError'
  }
}

export class AuthenticationError extends ClientError {
  constructor(message: string = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class NetworkError extends ClientError {
  status?: number
  statusText?: string

  constructor(message: string, status?: number, statusText?: string) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
    this.statusText = statusText
  }
}

export class LeaderboardError extends ClientError {
  constructor(message: string) {
    super(message)
    this.name = 'LeaderboardError'
  }
}

export class SubmissionError extends ClientError {
  constructor(message: string) {
    super(message)
    this.name = 'SubmissionError'
  }
}
