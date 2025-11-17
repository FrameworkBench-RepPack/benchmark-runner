import path from "path";
import { exec } from "child_process";
import { Command } from "commander";

import {
  ProfilerFeatures,
  ProfilerOptions,
  ProfilerThreads,
} from "./utilities/browser-utilities/profiler-helper";
import startBenchmark from "./utilities/benchmark-runner";

import {
  getBenchmarkNames,
  validateBenchmarks,
} from "./utilities/benchmark-file-helper";
import { listSites as getFrameworks } from "test-sites/listSites.ts";

const TEST_SITES_PATH = "./test-sites/" as const;
const BENCHMARKS_PATH = path.resolve(import.meta.dirname, "./benchmarks/");

export type InputOptions = {
  serverPort: number;
  profilerOptions: ProfilerOptions;
  repetitions: number;
  chosenBenchmarks: string[] | undefined;
  chosenFrameworks: string[] | undefined;
  benchmarksPath: string;
};

const inputOptions: InputOptions = {
  serverPort: 0,
  profilerOptions: {
    entries: 0,
    interval: 0,
    features: [],
    threads: [],
  },
  repetitions: 0,
  chosenBenchmarks: undefined,
  chosenFrameworks: undefined,
  benchmarksPath: BENCHMARKS_PATH,
};

const program = new Command();

(async () => {
  program
    .name("Benchmark Runner")
    .description(
      "A CLI for running performance focused benchmarks in the Firefox browser, using selenium",
    )
    .version("1.0.0")
    .option("-p, --port", "specify port used for serving the websites", "1337")
    .option(
      "--entries <entries>",
      "specify the buffer size used in the profiler",
      "20000000",
    )
    .option(
      "--interval <interval>",
      "specify the profiler logging interval (ms)",
      "100",
    )
    .option(
      "--features <features...>",
      `specify the logged features. Available features: ${Object.values(
        ProfilerFeatures,
      ).join(", ")}`,
      ["power"],
    )
    .option(
      "--threads <threads...>",
      `specify the logged threads. Available threads: ${Object.values(
        ProfilerThreads,
      ).join(", ")}`,
      ["GeckoMain"],
    )
    .option(
      "--repetitions <repetitions...>",
      `specify the number of test repetitions`,
      "1",
    )
    .option(
      "--benchmarks <benchmarks...>",
      `specify the benchmarks. Available benchmarks: ${(await getBenchmarkNames(BENCHMARKS_PATH)).join(", ")}`,
    )
    .option(
      "--frameworks <frameworks...>",
      `specify the frameworks. Available frameworks: ${(await getFrameworks()).join(", ")}`,
    );

  // Parse program and extract options
  program.parse();
  const options = program.opts();

  /** Handle port flag */
  if (options.port) {
    const port = Number.parseInt(options.port);

    if (Number.isNaN(port))
      throw new Error(`"${options.port}" in not an integer`);

    if (port < 0 || port > 65535)
      throw new Error(`The port must be within 0-65535`);

    inputOptions.serverPort = port;
  }

  /** Handle entries flag */
  if (options.entries) {
    const entries = Number.parseInt(options.entries);

    if (Number.isNaN(entries))
      throw new Error(
        `"${options.entries}" is not a valid buffer size - is not an integer`,
      );

    if (entries <= 0)
      throw new Error(
        `"${options.entries}" is not a valid buffer size - must be larger than 0`,
      );

    inputOptions.profilerOptions.entries = entries;
  }

  /** Handle interval flag */
  if (options.interval) {
    const interval = Number.parseInt(options.interval);

    if (Number.isNaN(interval)) {
      throw new Error(
        `"${options.interval}" is not a valid interval - is not an integer`,
      );
    }

    if (interval <= 0)
      throw new Error(
        `"${options.interval}" is not a valid interval - must be larger than 0`,
      );

    inputOptions.profilerOptions.interval = interval;
  }

  function isFeature(input: string): input is ProfilerFeatures {
    return (Object.values(ProfilerFeatures) as string[]).includes(input);
  }

  /** Handle features flag */
  if (options.features) {
    const features = options.features;
    if (!Array.isArray(features)) {
      throw new Error(`"${features}" is not an array`);
    }

    if (!features.every((f) => typeof f === "string" && isFeature(f))) {
      throw new Error(`"${features} contain an invalid feature"`);
    }

    inputOptions.profilerOptions.features = features;
  }

  function isThread(input: string): input is ProfilerThreads {
    return (Object.values(ProfilerThreads) as string[]).includes(input);
  }

  /** Handle threads flag */
  if (options.threads) {
    const threads = options.threads;
    if (!Array.isArray(threads)) {
      throw new Error(`"${threads}" is not an array`);
    }

    if (!threads.every((f) => typeof f === "string" && isThread(f))) {
      throw new Error(`"${threads} contain an invalid feature"`);
    }

    inputOptions.profilerOptions.threads = threads;
  }

  /** Handle repetitions flag */
  if (options.repetitions) {
    const repetitions = Number.parseInt(options.repetitions);

    if (Number.isNaN(repetitions)) {
      throw new Error(
        `"${options.repetitions}" is not a valid repetition count - is not an integer`,
      );
    }

    if (repetitions <= 0)
      throw new Error(
        `"${options.repetitions}" is not a valid repetition count - must be larger than 0`,
      );

    inputOptions.repetitions = repetitions;
  }

  /** Handle benchmarks flag */
  if (options.benchmarks) {
    const benchmarks = options.benchmarks;
    if (!Array.isArray(benchmarks)) {
      throw new Error(`"${benchmarks}" is not an array`);
    }

    if (
      !benchmarks.every((f) => typeof f === "string") ||
      !validateBenchmarks(BENCHMARKS_PATH, benchmarks)
    ) {
      throw new Error(`"${benchmarks} contain an invalid benchmark"`);
    }

    inputOptions.chosenBenchmarks = benchmarks;
  }

  /** Handle framework flag */
  if (options.frameworks) {
    const frameworks = options.frameworks;
    if (!Array.isArray(frameworks)) {
      throw new Error(`"${frameworks}" is not an array`);
    }

    const validFrameworks = await getFrameworks();

    if (
      !frameworks.every(
        (f) => typeof f === "string" && validFrameworks.includes(f),
      )
    ) {
      throw new Error(`"${frameworks} contain an invalid framework"`);
    }

    inputOptions.chosenFrameworks = frameworks;
  }

  async function installDependencies() {
    await new Promise<void>((resolve, reject) => {
      exec("npm i", { cwd: TEST_SITES_PATH }, (error, stdout, stderr) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  async function buildSites() {
    await new Promise<void>((resolve, reject) => {
      exec(
        "npm run build",
        { cwd: TEST_SITES_PATH },
        (error, stdout, stderr) => {
          if (error) reject(error);
          resolve();
        },
      );
    });
  }

  console.log("Successfully parsed input parameters");

  console.log("Installing dependencies");
  await installDependencies();

  console.log("Building static sites");
  await buildSites();

  console.log("Starting benchmark");
  await startBenchmark(inputOptions);
})();
