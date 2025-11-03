import path from "path";
import { until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import { buildWebDriver } from "./browser-utilities/driver-builder";
import ProfilerHandler, {
  ProfilerOptions,
} from "./browser-utilities/profiler-helper";

const RESULTS_PATH = path.resolve(process.cwd(), "profiler-results");

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
    // Always quit safely
    try {
      await driver.quit();
    } catch (quitErr) {
      // Ignore session errors on quit
      if (
        quitErr instanceof Error &&
        !quitErr.message.includes("NoSuchSessionError")
      ) {
        console.error("Error quitting driver:", quitErr);
      }
    }
  }
}

export async function prepareBrowser(driver: Driver) {
  await driver.manage().window().fullscreen();
}

export async function openPageAndWait(
  driver: Driver,
  link: string,
  title: string
) {
  await driver.navigate().to(link);
  await driver.wait(until.titleIs(title), 10000);
  console.log(`Expected: ${title}, Actual: ${await driver.getTitle()}`);
}
