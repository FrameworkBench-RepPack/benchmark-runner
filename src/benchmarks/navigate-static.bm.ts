import { until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  openPageAndWait,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "navigate-static" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link + "/static-1/", async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    // Wait for the page to fully load
    await promisifiedTimeout(2000);
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
