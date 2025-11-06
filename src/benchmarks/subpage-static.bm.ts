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

const BENCHMARK_NAME = "subpage-static" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link + "/static-1/", async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    // Scroll to footer and open second static page
    await scrollToElement(driver, "footer");
    const firstFooterLink = await driver.findElement(
      By.css(`footer a[href*="/static-2"]`)
    );
    await simulateClick(driver, firstFooterLink);

    // Wait for second page to load and scroll to bottom
    const title = await driver.findElement(By.css("main h1"));
    await driver.wait(until.elementIsVisible(title));
    await scrollToElement(driver, "footer");
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
