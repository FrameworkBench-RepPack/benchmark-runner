import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  scrollToElement,
  traverseElements,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";
import { testTooltip } from "./elements/tooltip";
import { testList } from "./elements/list";
import { testDetails } from "./elements/details";

const BENCHMARK_NAME = "subpage-home" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link);

    const selector = ":is(#list, .tooltip, .details)";
    for await (const [index, element] of traverseElements(driver, selector)) {
      const id = await element.getAttribute("id");
      const className = await element.getAttribute("class");
      if (id === "list") {
        await testList(driver, element);
      } else if (className.includes("tooltip")) {
        await testTooltip(driver, element);
      } else if (className.includes("details")) {
        await testDetails(driver, element);
      } else {
        throw new Error("Unexpected error: Found unknown element for testing");
      }
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
