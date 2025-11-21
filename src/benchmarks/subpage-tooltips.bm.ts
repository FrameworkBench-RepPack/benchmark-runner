import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
  scrollToElement,
  simulateClick,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "subpage-tooltips" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/tooltips/");
    const tooltips = await driver.findElements(By.css(".tooltip"));

    for (const [index, tooltip] of tooltips.entries()) {
      await scrollToElement(driver, `.tooltip`, index);
      await simulateClick(driver, tooltip);

      await promisifiedTimeout(500);

      // Click away the tooltip
      await driver
        .actions({ async: true })
        .move({ x: 0, y: 0 })
        .click()
        .perform();
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
