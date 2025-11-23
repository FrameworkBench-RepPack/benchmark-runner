import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "subpage-live" as const;

const dataSelector = "#live-data td";

/**
 * Waits until the specified datapoints are shown.
 *
 * @param driver The driver to control the browser instance.
 * @param data The data that should be shown.
 */
async function showsData(driver: Driver, data: [number, number, number]) {
  return await driver.wait(async () => {
    const elements = await driver.findElements(By.css(dataSelector));
    for (let i = 0; i < 3; i++) {
      if ((await elements[i]?.getText()) !== String(data[i])) {
        return false;
      }
    }
    return true;
  }, 4000);
}

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/live/");

    // Let the page run for 14-18 seconds, depending on when the last data point is shown. It should be shown after 16 seconds.
    await promisifiedTimeout(14000);
    await showsData(driver, [51, 35, 72]);
    await promisifiedTimeout(100);
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
