import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  scrollToElement,
  simulateClick,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "subpage-faq" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/faq/");

    const summaryButtons = await driver.findElements(By.css(".summary"));

    for (const [index, button] of summaryButtons.entries()) {
      await scrollToElement(driver, `.summary`, index);
      await simulateClick(driver, button);
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
