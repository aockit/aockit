import { existsSync } from "node:fs";
import { join } from "pathe";
import { defineCommand } from "citty";
import { createBuildContext } from "../core/build";
import { config as conf } from "../core/io";
import { scaffoldDay } from "../core/generators/day";

export default defineCommand({
  meta: {
    name: "start",
    description: "Start a new challenge.",
  },
  args: {
    day: {
      type: "positional",
      description: "The Advent of Code calendar day.",
      required: true,
    },
    year: {
      type: "string",
      description: "The Advent of Code calendar year.",
      default: new Date().getFullYear().toString(),
      alias: "y",
      valueHint: "2023",
    },
    template: {
      type: "string",
      description:
        "Template to use from the name of folder in templates/ folder.",
      alias: "t",
    },
    builder: {
      type: "string",
      description: "Builder to use.",
      alias: "b",
      default: "esbuild",
      valueHint: "esbuild|rolldown|jiti",
    },
  },
  async run({ args }) {
    const { year, day, template, builder } = args;
    const dir = join(year, day);

    if (!existsSync(dir)) {
      await scaffoldDay(year, day, template);
    }

    const config = await conf.load(year);
    return createBuildContext({ dir, config, day, builder });
  },
});