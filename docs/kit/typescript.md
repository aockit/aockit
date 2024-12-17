---
title: JavaScript Support
---

# JavaScript Support

aockit supports JavaScript and TypeScript out of the box with [esbuild](https://esbuild.github.io/) and [@parcel/watcher](https://npmjs.com/package/@parcel/watcher).

The `@aockit/core` package provides a `run()` function that you can use to run your solutions, and also write tests for your solutions.

## `run()`

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
.-.-/..|..l
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
