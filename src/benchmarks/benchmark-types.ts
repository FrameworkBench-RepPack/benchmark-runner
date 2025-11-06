import { ProfilerOptions } from "../utilities/browser-utilities/profiler-helper";

type BenchmarkInput = {
  framework: string;
  repetition: number;
  link: string;
  profilerOptions: ProfilerOptions;
};

export default BenchmarkInput;
