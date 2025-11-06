import { By, until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  openPageAndWait,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
  scrollToElement,
  simulateClick,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "benchmark-types" as const;

async function scrollAndNavigate(driver: Driver, hrefSelector: string) {
  // Wait for header to be visible
  const title = await driver.findElement(By.css("main h1"));
  await driver.wait(until.elementIsVisible(title));

  // Scroll to footer and open second static page
  await scrollToElement(driver, "footer");
  const firstFooterLink = await driver.findElement(
    By.css(`footer a[href*="${hrefSelector}"]`)
  );
  await simulateClick(
    driver,
    firstFooterLink,
    async () => await promisifiedTimeout(1000)
  );
}

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link, async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    // Scroll to footer and open second static page
    for (const hrefSelector of [
      "/static-1",
      "/static-2",
      "/live",
      "/tooltips",
      "/faq",
      "/list",
    ]) {
      await scrollAndNavigate(driver, hrefSelector);
    }
    await scrollToElement(driver, "footer");
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
