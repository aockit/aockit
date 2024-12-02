import fsp from "node:fs/promises";
import { colors as c } from "consola/utils";
import { Client } from "aocjs";
import { join } from "pathe";
import { dedent, log, setRunner } from "../utils";

export function generateBoilerplate(): string {
  return `import { run } from "@aockit/core";

run({});
`;
}

export function generateFileTree(year: string, day: string): string {
  return c.gray(
    dedent(`
    └── ${c.bold(c.blue(year))}/
       ├── ${c.bold(c.blue(day))}/
       │   ├── ${c.bold(c.blue("index.ts"))}
       │   ├── ${c.bold(c.blue("input.txt"))}
       │   └── ${c.bold(c.blue("README.md"))}
       └── ${c.bold(c.blue(".aockit.json"))}
  `),
  );
}

export function generateDayReadme(year: number, day: number): string {
  return dedent(`
    # 🎄 Advent of Code ${year} • day ${day} 🎄

    ## Info

    Task description: [link](https://adventofcode.com/${year}/day/${day})

    ## Notes

    ...
  `);
}

export async function scaffoldDay(
  year: string,
  day: string,
  template?: string,
): Promise<void> {
  // exit early if not present
  if (!process.env.AOC_SESSION) {
    log.error(
      `The ${c.magenta(
        "AOC_SESSION",
      )} enviornment variable is not set. You can set it by exporting AOC_SESSION in your shellrc.`,
    );
    process.exit(1);
  }

  const client = new Client({ session: process.env.AOC_SESSION! });

  const dir = join(year, day); // 2023/2
  await fsp.mkdir(dir, { recursive: true });

  if (template) await setRunner(year, day, template, dir);
  else await fsp.writeFile(join(dir, "index.ts"), generateBoilerplate());

  log.info("Downloading input...");
  const input = await client.getInput(Number(year), Number(day));
  await fsp.writeFile(join(dir, "input.txt"), input);
  log.success("Downloaded input!");

  const readme = generateDayReadme(Number(year), Number(day));
  await fsp.writeFile(join(dir, "README.md"), readme);

  log.success(`Successfully scaffolded project for day ${day}, year ${year}.`);
  log.info(
    "Your file tree should look like this:",
    generateFileTree(year, day),
  );
}
