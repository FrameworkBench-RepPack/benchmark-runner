import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";

async function loadAndMapFiles<T>(
  dir: string,
  mappingFunc: (_: [fileName: string, file: any]) => T,
  fileFilter?: (fileName: string) => boolean
) {
  let files = fs.readdirSync(dir).filter((f) => f.endsWith(".bm.ts"));

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
export async function loadBenchmarks(dir: string, benchmarks?: string[]) {
  // Create filter function if necessary
  const filterFunction = benchmarks
    ? (bmName: string) => benchmarks.includes(bmName.replace(".bm.ts", ""))
    : undefined;

  // Import filtered benchmarks and make sure they export a default function
  const importedBenchmarks = await loadAndMapFiles(
    dir,
    ([_, importedFile]) => importedFile.default ?? null,
    filterFunction
  );

  // Return the functions
  return importedBenchmarks.filter(
    (bm): bm is Function => typeof bm === "function"
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
      ? file.replace(".bm.ts", "")
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
      const fileUrl = pathToFileURL(path.join(dir, `${bm}.bm.ts`)).href;
      const importedFile = await import(fileUrl);
      return typeof importedFile.default === "function" ? true : false;
    })
  );

  return !benchmarkChecks.includes(false);
}
