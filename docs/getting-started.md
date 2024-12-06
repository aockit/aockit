---
title: Getting Started
description: Getting Started with aockit
---

# Getting Started

## Installation

```sh
[pnpm|npm|yarn|bun] init
[pnpm|npm|yarn|bun] install -D @aockit/cli @aockit/core esbuild@0.24.0
```

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
