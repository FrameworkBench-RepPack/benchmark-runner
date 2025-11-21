import { BuilderOptions } from "../utilities/browser-utilities/driver-builder";
import { ProfilerOptions } from "../utilities/browser-utilities/profiler-helper";

type BenchmarkInput = {
  framework: string;
  repetition: number;
  resultsPath: string;
  link: string;
  profilerOptions: ProfilerOptions;
  driverOptions?: BuilderOptions;
};

export default BenchmarkInput;
