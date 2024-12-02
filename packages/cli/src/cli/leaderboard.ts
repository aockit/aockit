import { defineCommand } from "citty";

export default defineCommand({
  meta: {
    name: "leaderboard",
    description: "See your private leaderboard.",
  },
  args: {
    id: {
      required: true,
      alias: "i",
      valueHint: "7373882",
      type: "positional",
    },
  },

  async run({ args }) {},
});
