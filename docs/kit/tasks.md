---
title: Tasks API
---

# Tasks API <Badge text="experimental" type="warning"/>

aockit provides a simple API for defining tasks, and running them using hotkeys.

Let's say you want to add a task to your project, that meows when you press `m`.

You can do this by adding a `kit.config.ts` file to your project, and adding the following:

```ts
import { defineConfig } from "aockit";

export default defineConfig({
  tasks: [
    {
      keys: ["m"],
      color: "yellow",
      label: "Meow",
      handler: (ctx) => {
        console.log("meow");
      },
    },
  ],
});
```

We'll come back to the `ctx` object later, but for now, let's just run the task by pressing `m`. It prints meow!

Now, obviously, that isn't very useful, so what if we want to run a linting task using `eslint`?

The `ctx` object exposes the following properties:

- `year`: The year number.
- `day`: The day number.
- `x`: Re-export of `tinyexec`, [repo](https://github.com/tinylibs/tinyexec).

We only need the `x` function, but you can use the rest if you want.

For example, if you want to run `eslint` on your project, you can do this:

```ts
import { defineConfig } from "aockit";

export default defineConfig({
  tasks: [
    {
      keys: ["l"],
      color: "yellow",
      label: "Run eslint",
      handler: async (ctx) => {
        await ctx.x`eslint .`; // Do whatever you want with the result
      },
    },
  ],
});
```

This will run `eslint .` on your project. Notice that we're calling `eslint` as if its a regular binary, `tinyexec` allows you to call any installed binary from `node_modules`.
