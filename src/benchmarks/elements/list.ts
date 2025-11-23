import { By, Select, WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  promisifiedTimeout,
  simulateClick,
} from "../../utilities/benchmark-utilities";

/**
 * A map corresponding each sort method to the first name in the list if it is sorted correctly.
 */
const sortingToFirstNameMap: string[][] = [
  ["Accumorbi Temparis", "Aliquam luctus"],
  ["Aenean Leo", "Natoque Magnis"],
  ["Ut Elementum", "Vestibaro Lethi", "Donec Erat"],
];

/**
 * Waits until the first entry in the list matches one of the specified names.
 *
 * @param driver The driver to control the browser instance.
 * @param names An array of accepted names.
 */
async function firstNameIs(driver: Driver, names: string[]) {
  return await driver.wait(async () => {
    const element = await driver.findElement(
      By.css("#list .data tbody > tr:first-of-type > td:first-of-type"),
    );
    return names.includes(await element.getText());
  }, 5000);
}

/**
 * Waits until none of the entries in the list are older than the specified max age.
 *
 * @param driver The driver to control the browser instance.
 * @param maxAge The maximum age permitted.
 */
async function maxAgeIs(driver: Driver, maxAge: number) {
  return await driver.wait(async () => {
    const elements = await driver.findElements(
      By.css("#list .data tbody > tr:not([hidden]) > td:nth-of-type(2)"),
    );
    let maxFoundAge = 0;
    for (const element of elements) {
      const age = Number(await element.getText());
      if (Number.isNaN(age)) {
        throw new Error(
          "Found list entry that did not contain a numerical age entry.",
        );
      }
      maxFoundAge = Math.max(maxFoundAge, age);
    }
    return maxFoundAge <= maxAge;
  }, 5000);
}

/**
 * Waits until the number of unique categories present in the list matches the specified amount.
 *
 * @param driver The driver to control the browser instance.
 * @param amount The number of categories that should be present.
 */
async function categoriesPresent(driver: Driver, amount: number) {
  return await driver.wait(async () => {
    const elements = await driver.findElements(
      By.css("#list .data tbody > tr:not([hidden]) > td:nth-of-type(3)"),
    );
    const categories = new Set();
    for (const element of elements) {
      const category = await element.getText();
      categories.add(category);
    }
    return categories.size === amount;
  }, 5000);
}

export async function testList(driver: Driver, listElement: WebElement) {
  await promisifiedTimeout(800);

  // Change sorting strategy
  const selectElement = await listElement.findElement(
    By.css(".controls select"),
  );
  const selectInstance = new Select(selectElement);
  for (const index of [1, 2, 0]) {
    await selectInstance.selectByIndex(index);
    await promisifiedTimeout(800);
    await firstNameIs(driver, sortingToFirstNameMap[index]!);
  }

  /** Age Input Field */
  const ageToElement = await listElement.findElement(
    By.css(`input[name="age-to"]`),
  );

  for (const maxAge of [70, 60, 50, 40, 30, 20, 10, 30, 40, 50, 60, 70]) {
    await ageToElement.clear();
    await ageToElement.sendKeys(maxAge);
    await promisifiedTimeout(700);
    await maxAgeIs(driver, maxAge);
  }

  // Reset input
  await ageToElement.clear();
  await ageToElement.sendKeys(100);

  /** Category Input Fields */
  const categoryInputElements = await listElement.findElements(
    By.css(`input[name="category"]`),
  );

  let categories = 4;

  // Disable all categories
  for (const element of categoryInputElements) {
    await simulateClick(driver, element);
    categories--;
    await promisifiedTimeout(200);
    await categoriesPresent(driver, categories);
  }

  // Enable all categories
  for (const element of categoryInputElements) {
    await simulateClick(driver, element);
    categories++;
    await promisifiedTimeout(200);
    await categoriesPresent(driver, categories);
  }
}
