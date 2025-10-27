import path from "path";
import { Driver } from "selenium-webdriver/firefox";
import { buildWebDriver } from "./driver-builder";
import ProfilerHandler, { ProfilerOptions } from "./profiler-helper";

// Configure service builder - Geckodriver handler
const RESULTS_PATH = path.resolve(__dirname, "../profiler-results/");

export async function profilerWrapper(
  benchmarkName: string,
  framework: string,
  profilerOptions: ProfilerOptions,
  performBM: (driver: Driver) => Promise<void>,
  beforeBM?: (driver: Driver) => Promise<void>,
  afterBM?: (driver: Driver) => Promise<void>
) {
  const driver = await buildWebDriver();

  if (!driver) {
    throw new Error("Failed to initialize Driver");
  }

  try {
    // Before benchmark
    if (beforeBM) await beforeBM(driver);

    // Configure and start profiler
    const profilerHandler = new ProfilerHandler(driver);
    await profilerHandler.start(profilerOptions);

    // Run benchmark
    await performBM(driver);

    // Stop profiler and store data
    await profilerHandler.end(
      `${RESULTS_PATH}/${framework}-${benchmarkName}.json`
    );

    // Clean up after the test
    if (afterBM) await afterBM(driver);
  } finally {
    await driver.quit();
  }
}
