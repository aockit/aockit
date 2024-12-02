import { join, resolve } from "pathe";
import { colors } from "consola/utils";
import type { BuilderContext } from "../types";
import { log } from "../utils";

export async function createJitiContext(dir: string): Promise<BuilderContext> {
  const { createJiti } = await import("jiti");
  const path = resolve(dir);
  log.info(`Running with Jiti... ${colors.yellow("This is experimental and may not work.")}`);
  const jiti = createJiti(path, {
    fsCache: false,
    moduleCache: false,
  });
  const resolved = jiti.esmResolve(resolve(join(path, "index.ts")));

  return {
    reload: async () => {
      await jiti.import(resolved).catch((error) => log.error(error));
    },
    dispose: async () => {
      jiti.cache = Object.create(null);
    },
  };
}
