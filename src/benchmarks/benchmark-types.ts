import { ProfilerOptions } from "../utilities/browser-utilities/profiler-helper";

type BenchmarkInput = {
  framework: string;
  link: string;
  profilerOptions: ProfilerOptions;
};

export default BenchmarkInput;
