#!/usr/bin/env node
/* eslint-disable unicorn/prefer-top-level-await */
import { defineCommand, runMain, type CommandDef } from "citty";
import { name, description, version } from "../package.json";

const _def = (r: any) => (r.default || r) as Promise<CommandDef>;

const main = defineCommand({
  meta: {
    name,
    description,
    version,
  },
  subCommands: {
    start: import("./cli/start").then(_def),
    init: import("./cli/init").then(_def),
    readme: import("./cli/readme").then(_def),
  },
});

runMain(main);
