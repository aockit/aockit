import fsp from "node:fs/promises";
import { join } from "pathe";
import type { Config } from "./types";

export const config = {
  load: async (year: string) =>
    JSON.parse(await fsp.readFile(join(year, ".aockit.json"), { encoding: "utf-8" })),
  save: async (year: string, _config: Config) => {
    const data = JSON.stringify(_config, null, 2);
    await fsp.writeFile(join(year, ".aockit.json"), data);
  },
};

export const readme = {
  load: async (year: string) =>
    fsp.readFile(join(year, "README.md"), { encoding: "utf-8" }).then((data) => data.toString()),
  save: async (year: string, contents: string) => {
    await fsp.writeFile(join(year, "README.md"), contents);
  },
};
