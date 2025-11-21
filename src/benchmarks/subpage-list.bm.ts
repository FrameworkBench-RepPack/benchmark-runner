import { By, Select } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  loadPage,
  prepareBrowser,
  profilerWrapper,
  promisifiedTimeout,
  simulateClick,
} from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "subpage-list" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await loadPage(driver, options.link + "/list/");

    // Change sorting strategy
    const selectElement = await driver.findElement(By.css(".controls select"));
    const selectInstance = new Select(selectElement);
    for (const index of [1, 2, 0]) {
      await selectInstance.selectByIndex(index);
      await promisifiedTimeout(800);
    }

    /** Age Input Field */
    const ageToElement = await driver.findElement(
      By.css(`input[name="age-to"]`)
    );

    for (const maxAge of [70, 60, 50, 40, 30, 20, 10, 30, 40, 50, 60, 70]) {
      await ageToElement.clear();
      await ageToElement.sendKeys(maxAge);
      await promisifiedTimeout(700);
    }

    // Reset input
    await ageToElement.clear();
    await ageToElement.sendKeys(100);

    /** Category Input Fields */
    const categoryInputElements = await driver.findElements(
      By.css(`input[name="category"]`)
    );

    // Disable all categories
    for (const element of categoryInputElements) {
      await simulateClick(driver, element);
      await promisifiedTimeout(200);
    }

    // Enable all categories
    for (const element of categoryInputElements) {
      await simulateClick(driver, element);
      await promisifiedTimeout(200);
    }
  };

  await profilerWrapper({
    ...options,
    benchmarkName: BENCHMARK_NAME,
    performBM: performTest,
    beforeBM: prepareTest,
  });
}
