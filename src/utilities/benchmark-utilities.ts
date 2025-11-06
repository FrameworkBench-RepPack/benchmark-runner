import { WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  BuilderOptions,
  buildWebDriver,
} from "./browser-utilities/driver-builder";
import ProfilerHandler, {
  ProfilerOptions,
} from "./browser-utilities/profiler-helper";
import { runScript } from "./browser-utilities/script-runners";

interface ProfilerWrapperOptions {
  /** Name of the benchmark */
  benchmarkName: string;

  /** Framework to be tested */
  framework: string;

  /** Current repetition */
  repetition: number;

  /** Results path */
  resultsPath: string;

  /** options for the profiler */
  profilerOptions: ProfilerOptions;

  /** Options for the driver builder */
  driverOptions?: BuilderOptions;

  /**
   * Browser automation function to be benchmarked
   * @param driver Webdriver instance for the automation
   * @returns A Promise<void>
   */
  performBM: (driver: Driver) => Promise<void>;

  /**
   * Browser automation function to prepare the browser for benchmarking
   * @param driver Webdriver instance for the automation
   * @returns A Promise<void>
   */
  beforeBM?: (driver: Driver) => Promise<void>;

  /**
   * Browser automation function to clean up browser after benchmark
   * @param driver Webdriver instance for the automation
   * @returns A Promise<void>
   */
  afterBM?: (driver: Driver) => Promise<void>;
}

/**
 * Benchmark helper function that facilitates preparing browser, performing benchmark and cleaning up after benchmark.
 * @param {ProfilerWrapperOptions} input See {@link ProfilerWrapperOptions} for details
 */
export async function profilerWrapper(input: ProfilerWrapperOptions) {
  const driver = await buildWebDriver(input.driverOptions);

  if (!driver) {
    throw new Error("Failed to initialize Driver");
  }

  try {
    // Before benchmark
    if (input.beforeBM) await input.beforeBM(driver);

    // Configure and start profiler
    const profilerHandler = new ProfilerHandler(driver);
    await profilerHandler.start(input.profilerOptions);

    // Run benchmark
    await input.performBM(driver);

    // Stop profiler and store data
    await profilerHandler.end(
      `${input.resultsPath}/${input.framework}-${input.benchmarkName}-${input.repetition}.json`
    );

    // Clean up after the test
    if (input.afterBM) await input.afterBM(driver);
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

/**
 * Function that promisify timeouts
 * @param timeout Timeout in milliseconds
 */
export async function promisifiedTimeout(timeout: number): Promise<void> {
  await new Promise<void>((resolve, _) => setTimeout(resolve, timeout));
}

/**
 * Prepare the browser for testing by fullscreening and deleting cookies
 * @param driver The driver to control the browser instance
 */
export async function prepareBrowser(driver: Driver) {
  await driver.manage().window().fullscreen();
  await driver.manage().deleteAllCookies();
}

interface openPageAndWaitInput {
  driver: Driver;
  link: string;
  waitFunc: () => Promise<void>;
}

/**
 * Navigate to page and wait for it bo be loaded
 * @param driver The driver to control the browser instance
 * @param link The link that should be navigated to
 * @param title The expected title of the page
 */
export async function openPageAndWait(
  driver: Driver,
  link: string,
  waitFunc: () => Promise<void>
) {
  await driver.navigate().to(link);
  await waitFunc();
}

/**
 * Scroll to the first element matching the given query selector
 * @param driver The driver to control the browser instance
 * @param querySelector query selector
 */
export async function scrollToElement(
  driver: Driver,
  querySelector: string,
  elementIndex?: number
) {
  const script = `
    const elem = ${elementIndex ? `document.querySelectorAll(arguments[0])[${elementIndex}];` : `document.querySelector(arguments[0]);`}
    if (elem) { 
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      throw new Error("Selector did not match any element: " + arguments[0]);
    }`;
  await runScript("SCROLL-TO-ELEMENT", driver, script, querySelector);
  await promisifiedTimeout(1000); // Wait for the scroll to complete
}

/**
 * Simulate a real click by hovering over the button before clicking.
 * @param driver The driver to control the browser instance
 * @param element Clickable element to be clicked
 * @param waitFunc If provided, await its execution before returning
 */
export async function simulateClick(
  driver: Driver,
  element: WebElement,
  waitFunc?: () => Promise<void>
) {
  // Hover over element before clicking
  await driver
    .actions({ async: true })
    .move({ origin: element, duration: 500 })
    .perform();
  await promisifiedTimeout(300);
  await element.click();

  // Await the wait function
  if (waitFunc) await waitFunc();
}
