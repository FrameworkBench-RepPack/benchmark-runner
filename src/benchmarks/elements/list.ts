import { By, Select, WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  promisifiedTimeout,
  simulateClick,
} from "../../utilities/benchmark-utilities";

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
  }

  /** Age Input Field */
  const ageToElement = await listElement.findElement(
    By.css(`input[name="age-to"]`),
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
  const categoryInputElements = await listElement.findElements(
    By.css(`input[name="category"]`),
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
}
