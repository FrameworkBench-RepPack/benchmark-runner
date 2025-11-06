import { until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  openPageAndWait,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "subpage-live" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link + "/live/", async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    // The the page run for 60 seconds then end the test
    await promisifiedTimeout(60000);
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
