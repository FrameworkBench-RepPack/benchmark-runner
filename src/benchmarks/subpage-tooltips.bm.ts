import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  scrollToElement,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";
import { testTooltip } from "./elements/tooltip";

const BENCHMARK_NAME = "subpage-tooltips" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/tooltips/");

    const selector = ".tooltip";
    const tooltips = await driver.findElements(By.css(selector));
    for (const [index, tooltip] of tooltips.entries()) {
      await scrollToElement(driver, selector, index);
      await testTooltip(driver, tooltip);
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
