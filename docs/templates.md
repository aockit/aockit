---
title: Templates
description: Language templates support
---

# Templates <Badge text="experimental" type="warning"/>

You can easily make language templates in your repository by:

1. Create a folder named `templates` in your repository root.
2. Create the folder with the name of the language you want to add, this will be the name of the template.
3. Add your files ending in `.tmpl` to the template folder.
4. Specify the runner command in the `runner` file.

For example, if you want to add a template for Rust, you can create a folder named `templates/rust` and add your files ending in `.tmpl` to it.

```sh
rust
├── Cargo.toml
├── runner
└── src
    └── main.rs
```

Then, you can use the template by running `aoc start <day> -t <template_name>` where `--template` (alias: `-t`) is the name of the template you want to use.

### Variables

You can use the following variables in your template files:

- `day`: The day number.
- `year`: The year number.

Example:

```rust
//! Day {day} Solution
//!
//! Solution to AoC {year} Day {day}
//! https://adventofcode.com/{year}/day/{day}

fn main() {
    // let input = include_str!("../input.txt");
    // println!("{input}");
}
```

This will be replaced with:

```rust
//! Day 1 Solution
//!
//! Solution to AoC 2023 Day 1
//! https://adventofcode.com/2023/day/1

fn main() {
    // let input = include_str!("../input.txt");
    // println!("{input}");
}
```

:::warning
The `{input}` formatting above may also be replaced, with just `input` without the curly braces.
This will be fixed in the future.
:::
