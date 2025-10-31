import path from "node:path";
import { Worker } from "worker_threads";
import { ProfilerOptions } from "./browser-utilities/profiler-helper";
import { listSites as getFrameworks } from "test-sites/listSites.ts";

import { MessageType, WorkerData } from "./server-worker/worker-types";
import { benchmarkStatic } from "../benchmarks/static-site";
import BenchmarkInput from "../benchmarks/benchmark-types";

const serverWorkerPath = path.resolve(
  import.meta.dirname,
  "./server-worker/worker.ts"
);

/**
 * Function to perform the benchmark on each framework
 * @param options Profiler options for the firefox profiler
 * @param port The port to be used to host each framework
 */
export default async function startBenchmark(
  profilerOptions: ProfilerOptions,
  port: number
) {
  const frameworks = await getFrameworks();

  /** Loop through every framework and perform the benchmark */
  for (const framework of frameworks) {
    const workerData: WorkerData = {
      port,
      framework,
    };

    const worker = new Worker(serverWorkerPath, {
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
      link: `http://localhost:${port}`,
      profilerOptions,
    };

    // await benchmarkStatic(benchmarkInput);
  }
}
