import type { ClientOptions, Leaderboard } from "./types";

export class Client {
  session: string;
  "user-agent"?: string = "aocjs (https://npmjs.com/package/aocjs)";

  constructor(options: ClientOptions) {
    this.session = options.session;
    if (options["user-agent"]) this["user-agent"] = options["user-agent"];
  }

  /**
   * Internal fetcher, not  recommended to use.
   */
  public async fetcher(path: string, options?: HeadersInit): Promise<Response> {
    const request = await fetch(`https://adventofcode.com/${path}`, {
      headers: {
        Cookie: `session=${this.session}`,
        "User-Agent": this["user-agent"]!,
      },
      ...options,
    });
    if (!request.ok) throw new Error(`${request.status} ${request.statusText}`);
    return request;
  }

  /**
   * Get a puzzle's input.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   */
  public async getInput(year: number, day: number): Promise<string> {
    return await (await this.fetcher(`${year}/day/${day}/input`)).text();
  }

  /**
   * Gets your specified private leaderboard.
   * @param year Advent of Code year.
   * @param id Your leaderboard id.
   * @param [sorted=false] If true, returns a sorted object of leaderboard members by stars, just like the site.
   */
  public async getLeaderboard(
    year: number,
    id: number,
    sorted: boolean = false,
  ): Promise<Leaderboard | Omit<Leaderboard, "members">> {
    const request = await this.fetcher(`${year}/leaderboard/private/view/${id}.json`);

    if (request.status === 302) {
      return new Error(
        "Cannot find that leaderboard, maybe it doesn't exist or you don't have access?",
      );
    }

    const data = (await request.json()) as Leaderboard;

    if (sorted) {
      return Object.values(data.members).sort(
        (a, b) =>
          b.stars - a.stars || b.local_score - a.local_score || b.global_score - a.global_score,
      );
    }
    return data;
  }

  // public async submit(day: number, year: number, part: 1 | 2, solution: string) {
  //   const request = await this.fetcher(`${year}/day/${day}/answer`);
  // }
}
