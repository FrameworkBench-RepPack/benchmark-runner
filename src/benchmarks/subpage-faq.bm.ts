import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  traverseElements,
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
    for await (const [index, element] of traverseElements(driver, selector)) {
      await testDetails(driver, element);
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
