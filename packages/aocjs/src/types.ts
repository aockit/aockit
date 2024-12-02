export interface Leaderboard {
  members: Record<
    string,
    {
      id: number;
      name: string;
      stars: number;
      global_score: number;
      local_score: number;
      last_star_ts: number;
    }
  >;
}

export interface ClientOptions {
  /** Browser session key.*/
  session: string;
  /** User-Agent for requests, not recommended to change. */
  "user-agent"?: string;
}
