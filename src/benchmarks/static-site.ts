import { until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  openPageAndWait,
  prepareBrowser,
  profilerWrapper,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "static-site" as const;

export async function benchmarkStatic(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link, "Test site");
    console.log(await driver.getTitle());
  };

  const cleanTest = async (driver: Driver) => {};

  await profilerWrapper(
    BENCHMARK_NAME,
    options.framework,
    options.profilerOptions,
    performTest,
    prepareTest,
    cleanTest
  );
}
