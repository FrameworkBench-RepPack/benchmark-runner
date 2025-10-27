import {
  ProfilerFeatures,
  ProfilerOptions,
  ProfilerThreads,
} from "./utilities/profiler-helper";
import { benchmarkStatic } from "./benchmarks/static-site";

const profilerOptions: ProfilerOptions = {
  entries: 10000000,
  interval: 100,
  features: [ProfilerFeatures["Power Use"]],
  threads: [ProfilerThreads.GeckoMain],
} as const;

(async () => {
  await benchmarkStatic("Bing", "https://localhost:5000", profilerOptions);
})();
