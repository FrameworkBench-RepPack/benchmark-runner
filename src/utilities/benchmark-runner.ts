import fs from "node:fs";
import path from "node:path";
import { Worker } from "worker_threads";
import { InputOptions } from "../index";
import { MessageType, WorkerData } from "./server-worker/worker-types";
import BenchmarkInput from "../benchmarks/benchmark-types";

import { listSites as getFrameworks } from "test-sites/listSites.ts";
import { loadBenchmarks } from "./benchmark-file-helper";

const SERVER_WORKER_PATH = path.resolve(
  import.meta.dirname,
  "./server-worker/worker.ts"
);

const RESULTS_PATH = path.resolve(process.cwd(), "profiler-results");

/**
 * Function to perform the benchmark on each framework
 * @param options Profiler options for the firefox profiler
 * @param port The port to be used to host each framework
 */
export default async function startBenchmark(options: InputOptions) {
  /** Make sure the results folder exists */
  if (!fs.existsSync(RESULTS_PATH)) fs.mkdirSync(RESULTS_PATH);

  /** Determine frameworks to be benchmarked */
  const frameworks = options.chosenFrameworks || (await getFrameworks());

  /** Loop through every repetitions */
  for (let repetition = 1; repetition <= options.repetitions; repetition++) {
    /** Loop through every framework and perform the benchmark */
    for (const [frameworkIndex, framework] of frameworks.entries()) {
      const workerData: WorkerData = {
        port: options.serverPort,
        framework,
      };

      const worker = new Worker(SERVER_WORKER_PATH, {
        workerData: workerData,
      });

      // Register an error listener to quit the benchmark if an error occurs on the server
      worker.on("error", (error) => {
        console.error("Server worker thread threw an error - Stopping");
        console.log(error);
        throw error;
      });

      // Wait for the server to be ready
      await new Promise<void>((resolve, _) => {
        worker.on("message", (message) => {
          if (message?.type === MessageType.Ready) {
            console.log(message.payload);
            resolve();
          }
        });
      });

      const benchmarkInput: BenchmarkInput = {
        framework,
        repetition,
        resultsPath: RESULTS_PATH,
        link: `http://localhost:${options.serverPort}`,
        profilerOptions: options.profilerOptions,
      };

      // Perform select benchmark
      const benchmarks = await loadBenchmarks(
        options.benchmarksPath,
        options.chosenBenchmarks
      );
      for (const [benchmarkIndex, [benchmarkName, benchmark]] of benchmarks.entries()) {
        console.log(`Benchmarking ${framework} with ${benchmarkName}.. (benchmark ${benchmarkIndex+1}/${benchmarks.length}) (framework ${frameworkIndex+1}/${frameworks.length}) (repetition ${repetition}/${options.repetitions})`);
        await benchmark(benchmarkInput);
      }

      console.log("Finished testing and quit browser instance");

      // Terminate server
      await worker.terminate();
    }
  }
}
