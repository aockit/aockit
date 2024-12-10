# 🦌 aocjs

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href] [![jsdocs][jsdocs-src]][jsdocs-href]

Library for the Advent of Code API.

- Adds a User-Agent to identify as automated requests
- Written in TypeScript

🚧 This project is under heavy development.

## Setup

Install:

```sh
[pnpm|npm|yarn|bun] install aocjs
```

## Getting Started

```js
// ESM
import { Client } from "aocjs";

// CommonJS
const { Client } = require("aocjs");

const client = new Client({ session: "53727...." });

const input = await client.getInput(2023, 7);
console.log(input); // Your input
```

## Implementation matrix

- [x] Fetching input (`{year}/day/{day}/input`)
- [x] Submitting answers
- [x] Fetching private/global leaderboard
- [ ] Rate-limits to reduce load on the site

## License

Copyright (c) 2023 taskylizard. MIT Licensed.

<!-- Badges -->

[npm-version-src]:
  https://img.shields.io/npm/v/aocjs?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-version-href]: https://npmjs.com/package/aocjs
[npm-downloads-src]:
  https://img.shields.io/npm/dm/aocjs?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-downloads-href]: https://npmjs.com/package/aocjs
[jsdocs-src]:
  https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[jsdocs-href]: https://www.jsdocs.io/package/aocjs
