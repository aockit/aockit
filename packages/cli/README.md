# 🎄 aockit

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href] [![jsDocs][jsdocs-src]][jsdocs-href]

aockit is an polyglot CLI for [Advent of Code](https://adventofcode.com).

- Scaffolds a minimal setup for Advent of Code with the folder structure: `<root>/<year>/<day>`
- Downloads your input file and saves it locally
- [Template support for other languages](#templates)
- [Testing support](#testing)
- Supports both JavaScript and TypeScript, powered by ESBuild (or experimentally other [builders](#builders))
- Provides an elegant `run()` function and utilities

🚧 This project is under heavy development.

## Usage

Setup:

```sh
[pnpm|npm|yarn|bun] init
[pnpm|npm|yarn|bun] install -D @aockit/cli @aockit/core esbuild@0.24.0
```

Then run `pnpm aoc init` (you may have to check the specifics for other package managers, or just add `aoc` as a package.json script.)

This will scaffold a year folder for your current year by default.

At this point, you'll need to add your Advent of Code browser session key, which requires a few more steps:

1. Open [adventofcode.com](https://adventofcode.com) and log in.
2. Open your Chrome or Firefox DevTools (F12).
3. Go to the Application tab.
4. On the sidebar, under the Storage section, expand Cookies and click on https://adventofcode.com.
5. Find the cookie named "session" and copy its value.
6. Export this value in your shell's config file with the name `AOC_SESSION`.
   e.g. `export AOC_SESSION="your_session_key"`

Now, to start a day, run: `pnpm aoc start <day>`.

This will scaffold your day folder, download your input and instructions, save them locally, generate a minimal TypeScript file, and start the development server.

## Utilities

### `run()`

Runs your solutions with utilities and pretty formatting. It will also measure your performance using `node:perf_hooks`.

The most commonly used functions are `part1` and `part2`.

You can destructure context to use utilities like `readInput`, `sum`, `product`, `asc`, `desc`, `by`.

#### `readInput()`

This is a convenient abstraction for reading your input file as we execute built files directly in a worker thread from dist.

It takes a single parameter, `lines` or `groups`, and returns a list.

- `lines` splits your input by newlines. (`\n`)
- `groups` splits your input by groups. (`\n\n`)

#### `input`

This is the raw input file, unmodified.

#### `sum()` and `product()`

Adds or multiplies two numbers.

#### `asc` and `desc`

These are `compareFn`s for `Array.sort()`.

- `asc` sorts your list in ascending order.
- `desc` sorts your list in descending order.

## Testing

We also provide a minimal testing framework for testing your solutions. You can add as many tests as you want. It works similarly to your logic for `part1` or `part2`, but you must provide your own input, most likely the example inputs.

This includes a pretty logger similar to Vitest or Jest for pass and fail tests.

Example:

```ts
const exampleInput = `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`;

run({
  part1({ input }) {
    return part1(_(input));
  },
  part2({ input }) {
    return part2(_(input));
  },
  tests: [
    {
      name: "Part 1 example",
      input: exampleInput,
      expected: 46,
      solution({ input }) {
        return part1(parseInput(input));
      },
    },
    {
      name: "Part 2 example",
      input: exampleInput,
      expected: 52,
      solution({ input }) {
        return part2(parseInput(input));
      },
    },
  ],
});
```

## Templates

You can create custom templates for different languages by placing them in the `templates/` folder at the root.

For example, a Rust template could look like this:

```sh
.
├── 2023
└── templates
    └── rust
        ├── .aockit.json
        ├── Cargo.toml
        └── src
            └── main.rs
```

The contents of your `.aockit.json` are important:

```json
{
  "runner": "cargo run"
}
```

This gets removed in the end, and the runner script is added to your year's runner.

Now, you can start with `pnpm aoc start -d 1 -t rust`, where `-t`/`--template` is the name of your template folder.

The next time, it will remember and run your runner command on file changes.

## Builders

### Rolldown

Rolldown is an upcoming reimplementation of Rollup, written in Rust, by the same team behind Vite.

It's still experimental and may not work perfectly.

To use it, install the `rolldown@0.14.0` package and set the builder to `rolldown` in your `.aockit.json`.

```json
{
  "builder": "rolldown"
}
```

Or add the builder flag to your `aoc start` command:

```sh
pnpm aoc start -d 1 -b rolldown
```

### jiti

Uses [unjs/jiti](https;//github.com/unjs/jiti).

To use it, install the `jiti@2.4.1` package and set the builder to `jiti` in your `.aockit.json`.

```json
{
  "builder": "jiti"
}
```

Or add the builder flag to your `aoc start` command:

```sh
pnpm aoc start -d 1 -b jiti
```

## License

Copyright (c) 2024 taskylizard. MIT Licensed.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/aockit?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-version-href]: https://npmjs.com/package/aockit
[npm-downloads-src]: https://img.shields.io/npm/dm/aockit?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-downloads-href]: https://npmjs.com/package/aockit
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[jsdocs-href]: https://www.jsdocs.io/package/aockit
```
