# 🌆🎄 aockit

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href] [![jsdocs][jsdocs-src]][jsdocs-href]

aockit is a elegant CLI for [Advent of Code](https://adventofcode.com).

- Scaffolds a minimal setup for Advent of Cose with the folder structure: `<root>/<year>/<day>`
- Downloads your input file and saves it locally
- [Template support for other languages](#templates)
- [Testing support](#testing)
- Supports both JavaScript and TypeScript, powered by ESBuild (or experimentally, [Rolldown](#rolldown-support))
- Provides an elegant `run()` function and utlities

🚧 This project is under heavy development.

## Usage

Setup:

```sh
[pnpm|npm|yarn|bun] init
[pnpm|npm|yarn|bun] install aockit
```

Then run `pnpm aoc init` (you may have to checkout for other package managers, or just add aoc as a
package.json script.)

This will scaffold a year folder for your current year by default.

At this point, you'll have to add your Advent of Code browser session key, this requires a few more
steps.

1. Open [adventofcode.com](https://adventofcode.com) and log in.
2. Open your Chrome or Firefox Devtools (F12).
3. Go to Application tab.
4. On the sidebar, under Storage section, expand Cookies and click on https://adventofcode.com.
5. Now you're seeing 3 cookies, one of them must be named session. Copy it's value.
6. Save this in a `.env` file with the name `AOC_SESSION` in the root. You could also save this into
   your shell's rc, as this session lasts a very long time.

Now, to start a day, run: `pnpm aoc start <day>`.

This will scaffold your day folder, downloads your input and instructions and saves them locally,
generates a minimal TypeScript file and starts the development server.

## Utils

### `run()`

Runs your solutions with utils and pretty formatting. It will also measure your performance with
`node:perf_hooks`.

The ones you'll use the most are `part1` and `part2`.

You can destructure context to use utlities like `readInput`, `sum`, `product`, `asc`, `desc`, `by`.

#### `readInput()`

This is just a fancy abstraction for reading your input file as we execute built files directly in a
worker thread from dist.

It takes a single parameter, `lines` or `groups` and returns a list.

- `lines` splits your input by newlines. (`\n`)
- `groups` splits your input by groups. (`\n\n`)

#### `input`

This is the raw input file, nothing else.

#### `sum()` and `product()`

Adds/Multiplies two numbers.

#### `asc` and `desc`

These are `compareFn`s for `Array.sort()`.

- `asc` sorts your list by ascending order.
- `desc` sorts your list by decending order.

## Testing

We also have a minimal testing framework for testing your solutions. You can add as much as you want. It's pretty much the same as your logic for `part1` or `part2` but you have to provide your own input, most likely the example inputs.

This also includes a pretty logger similar to Vitest or Jest for pass and fail tests.

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

You can make custom templates for different languages, by placing them in the `templates/` folder at
the root.

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

Your `.aockit.json`'s contents are important:

```json
{
  "runner": "cargo run"
}
```

This gets removed in the end and the runner script is added to your year's runner.

Now, you can start with `pnpm aoc start -d 1 -t rust`, where `-t`/`--template` is the name of your
template folder.

The next time, it will remember and will run your runner command on file changes.

## Rolldown support

Rolldown is an upcoming reimplementation of rollup, written in Rust, by the same team of Vite.

It's still experimental and may not work.

To use it, install the `rolldown` package and set the builder to `rolldown` in your `.aockit.json`.

```json
{
  "builder": "rolldown"
}
```
Or add the builder flag to your `aoc start` command.

```sh
pnpm aoc start -d 1 -b rolldown
```

## License

Copyright (c) 2024 taskylizard. MIT Licensed.

<!-- Badges -->

[npm-version-src]:
  https://img.shields.io/npm/v/aockit?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-version-href]: https://npmjs.com/package/aockit
[npm-downloads-src]:
  https://img.shields.io/npm/dm/aockit?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-downloads-href]: https://npmjs.com/package/aockit
[jsdocs-src]:
  https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[jsdocs-href]: https://www.jsdocs.io/package/aockit
