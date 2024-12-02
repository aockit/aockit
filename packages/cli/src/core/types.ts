export type Builder = "esbuild" | "rolldown" | "jiti";

interface Day {
  solved: boolean;
  result: any; // seems to be string, number blah
  time: null | number;
  builder?: Builder;
}

export interface Config {
  year: number;
  days: {
    [day: number]: {
      runner: null | string;
      part1: Day;
      part2: Day;
    };
  };
  builder?: Builder;
}

export interface BuilderContext {
  reload: () => Promise<void>;
  dispose: () => Promise<void> | void;
}
