import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  scrollToElement,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";
import { testDetails } from "./elements/details";

const BENCHMARK_NAME = "subpage-faq" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/faq/");

    const selector = ".details";
    const summaryButtons = await driver.findElements(By.css(selector));
    for (const [index, detailsElement] of summaryButtons.entries()) {
      await scrollToElement(driver, selector, index);
      await testDetails(driver, detailsElement);
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
