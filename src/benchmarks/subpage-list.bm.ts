import { By, until, Select } from "selenium-webdriver";
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

const BENCHMARK_NAME = "subpage-list" as const;

export default async function benchmark(options: BenchmarkInput) {
  const prepareTest = async (driver: Driver) => {
    await prepareBrowser(driver);
  };

  const performTest = async (driver: Driver) => {
    await openPageAndWait(driver, options.link + "/list/", async () => {
      await driver.wait(until.titleIs("Test site"), 10000);
    });

    // Scroll to list
    await scrollToElement(driver, "#list");

    // Change sorting strategy
    const selectElement = await driver.findElement(By.css(".controls select"));
    const selectOptionsCount = (await selectElement.findElements(By.css("*")))
      .length;

    const selectInstance = new Select(selectElement);
    for (let i = 0; i > selectOptionsCount; i++) {
      await selectInstance.selectByIndex(i % selectOptionsCount); // Restore initial category
      await promisifiedTimeout(1000);
    }

    /** Age Input Field */
    const ageToElement = await driver.findElement(
      By.css(`input[name="age-to"]`)
    );

    for (let maxAge = 100; maxAge > 0; maxAge -= 10) {
      await ageToElement.clear();
      await ageToElement.sendKeys(maxAge);
      await promisifiedTimeout(1000);
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
      await simulateClick(
        driver,
        element,
        async () => await promisifiedTimeout(1000)
      );
    }

    // Enable every category one by one
    for (let i = 0; i < categoryInputElements.length; i++) {
      const checkbox = await categoryInputElements[i];
      if (!checkbox) continue;

      // Enable the category
      await simulateClick(
        driver,
        checkbox,
        async () => await promisifiedTimeout(500)
      );

      // Disable the category
      await simulateClick(
        driver,
        checkbox,
        async () => await promisifiedTimeout(500)
      );
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
