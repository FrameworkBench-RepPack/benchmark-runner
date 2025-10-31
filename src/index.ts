import { exec } from "child_process";
import { Command } from "commander";

import {
  ProfilerFeatures,
  ProfilerOptions,
  ProfilerThreads,
} from "./utilities/browser-utilities/profiler-helper";
import startBenchmark from "./utilities/benchmark-runner";

const TEST_SITES_PATH = "./node_modules/test-sites/" as const;

let serverPort = 1337;
const profilerOptions: ProfilerOptions = {
  entries: 10000000,
  interval: 100,
  features: [ProfilerFeatures["Power Use"]],
  threads: [ProfilerThreads.GeckoMain],
};

const program = new Command();

program
  .name("Benchmark Runner")
  .description(
    "A CLI for running performance focused benchmarks in the Firefox browser, using selenium"
  )
  .version("1.0.0")
  .option("-p, --port", "specify port used for serving the websites", "1337")
  .option(
    "--setEntries <entries>",
    "specify the buffer size used in the profiler",
    "20000000"
  )
  .option(
    "--setInterval <interval>",
    "specify the logging interval (ms)",
    "100"
  )
  .option(
    "--setFeatures <features...>",
    `specify the logged features. Available features: ${Object.values(
      ProfilerFeatures
    ).join(", ")}`,
    ["power"]
  )
  .option(
    "--setThreads <threads...>",
    `specify the logged threads. Available threads: ${Object.values(
      ProfilerThreads
    ).join(", ")}`,
    ["GeckoMain"]
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

  serverPort = port;
}

/** Handle entries flag */
if (options.setEntries) {
  const entries = Number.parseInt(options.setEntries);

  if (Number.isNaN(entries))
    throw new Error(
      `"${options.setEntries}" is not a valid buffer size - is not an integer`
    );

  if (entries <= 0)
    throw new Error(
      `"${options.setEntries}" is not a valid buffer size - must be larger than 0`
    );

  profilerOptions.entries = entries;
}

/** Handle interval flag */
if (options.setInterval) {
  const interval = Number.parseInt(options.setInterval);

  if (Number.isNaN(interval)) {
    throw new Error(
      `"${options.setInterval}" is not a valid interval - is not an integer`
    );
  }

  if (interval <= 0)
    throw new Error(
      `"${options.setInterval}" is not a valid interval - must be larger than 0`
    );

  profilerOptions.interval = interval;
}

function isFeature(input: string): input is ProfilerFeatures {
  return (Object.values(ProfilerFeatures) as string[]).includes(input);
}

/** Handle features flag */
if (options.setFeatures) {
  const features = options.setFeatures;
  if (!Array.isArray(features)) {
    throw new Error(`"${features}" is not an array`);
  }

  if (!features.every((f) => typeof f === "string" && isFeature(f))) {
    throw new Error(`"${features} contain an invalid feature"`);
  }

  profilerOptions.features = features;
}

function isThread(input: string): input is ProfilerThreads {
  return (Object.values(ProfilerThreads) as string[]).includes(input);
}

/** Handle threads flag */
if (options.setThreads) {
  const threads = options.setThreads;
  if (!Array.isArray(threads)) {
    throw new Error(`"${threads}" is not an array`);
  }

  if (!threads.every((f) => typeof f === "string" && isThread(f))) {
    throw new Error(`"${threads} contain an invalid feature"`);
  }

  profilerOptions.threads = threads;
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
    exec("npm run build", { cwd: TEST_SITES_PATH }, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve();
    });
  });
}

console.log("Successfully parsed input parameters");

(async () => {
  console.log("Installing dependencies");
  await installDependencies();

  console.log("Building static sites");
  await buildSites();

  await console.log("Starting benchmark");
  await startBenchmark(profilerOptions, serverPort);
})();
