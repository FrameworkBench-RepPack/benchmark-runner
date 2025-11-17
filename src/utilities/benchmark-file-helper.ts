import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";

// The postfix used for benchmark files
const BENCHMARK_FILE_POSTFIX = ".bm.ts";

function postfixBenchmarkPath(path: string): string {
  return `${path}${BENCHMARK_FILE_POSTFIX}`;
}
function unpostfixBenchmarkPath(path: string): string {
  return path.replace(BENCHMARK_FILE_POSTFIX, "");
}

async function loadAndMapFiles<T>(
  dir: string,
  mappingFunc: (_: [fileName: string, file: any]) => T,
  fileFilter?: (fileName: string) => boolean
) {
  let files = fs.readdirSync(dir).filter((f) => f.endsWith(BENCHMARK_FILE_POSTFIX));

  // Filter files if relevant
  if (fileFilter) files = files.filter(fileFilter);

  // Import and process all benchmark files
  const mappedFiles = await Promise.all(
    files.map(async (file) => {
      const fileUrl = pathToFileURL(path.join(dir, file)).href;
      const importedFile = await import(fileUrl);
      return mappingFunc([file, importedFile]);
    })
  );

  return mappedFiles;
}

/**
 * Function to import all benchmarks from a given directory
 * @param dir Path to the benchmark directory
 * @param benchmarks Optional list of benchmarks to import
 * @returns Default functions exported by the given benchmarks
 */
export async function loadBenchmarks(dir: string, benchmarks?: string[]): Promise<[string, Function][]> {
  // Create filter function if necessary
  const filterFunction = benchmarks
    ? (bmName: string) => benchmarks.includes(unpostfixBenchmarkPath(bmName))
    : undefined;

  // Import filtered benchmarks and make sure they export a default function
  const importedBenchmarks = await loadAndMapFiles(
    dir,
    ([path, importedFile]) => [unpostfixBenchmarkPath(path), importedFile.default ?? null],
    filterFunction
  );

  // Return the functions
  return importedBenchmarks.filter(
    (bm): bm is [string, Function] => typeof bm[1] === "function"
  );
}

/**
 * Function to get the names of the valid benchmarks in the given directory
 * @param dir Path to the benchmark directory
 * @returns Names of the valid benchmarks in the given directory
 */
export async function getBenchmarkNames(dir: string) {
  // Get names of benchmarks
  const benchmarks = await loadAndMapFiles(dir, ([file, importedFile]) =>
    typeof importedFile.default === "function"
      ? unpostfixBenchmarkPath(file)
      : null
  );

  // Return non-null entries
  return benchmarks.filter((f) => f !== null);
}

/**
 * Function to get the names of the valid benchmarks in the given directory
 * @param dir Path to the benchmark directory
 * @returns Names of the valid benchmarks in the given directory
 */
export async function validateBenchmarks(dir: string, benchmarks: string[]) {
  // Import and process all benchmarks
  const benchmarkChecks = await Promise.all(
    benchmarks.map(async (bm) => {
      const fileUrl = pathToFileURL(path.join(dir, postfixBenchmarkPath(bm))).href;
      const importedFile = await import(fileUrl);
      return typeof importedFile.default === "function" ? true : false;
    })
  );

  return !benchmarkChecks.includes(false);
}
