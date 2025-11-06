import { By, until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  openPageAndWait,
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
    await openPageAndWait(driver, options.link + "/faq/", async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    const summaryButtons = await driver.findElements(By.css(".summary"));

    for (const [index, button] of summaryButtons.entries()) {
      await scrollToElement(driver, `.summary`, index);
      await simulateClick(driver, button);
    }
  };

  await profilerWrapper({
    benchmarkName: BENCHMARK_NAME,
    framework: options.framework,
    repetition: options.repetition,
    profilerOptions: options.profilerOptions,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
