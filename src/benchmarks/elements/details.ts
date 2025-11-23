import { By, WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import { simulateClick } from "../../utilities/benchmark-utilities";

const contentSelector = ".details .contents";

/**
 * Returns the number of detail elements that are currently open.
 *
 * @param driver The driver to control the browser instance.
 */
async function detailsCurrentlyOpen(driver: Driver): Promise<number> {
  const elements = await driver.findElements(By.css(contentSelector));
  let openDetails = 0;
  for (const element of elements) {
    if (await element.isDisplayed()) {
      openDetails++;
    }
  }
  return openDetails;
}

/**
 * Waits until the specified number of detail elements are open.
 *
 * @param driver The driver to control the browser instance.
 * @param amount How many detail elements should be open.
 */
async function detailsShouldBeOpen(
  driver: Driver,
  amount: number,
): Promise<boolean> {
  return await driver.wait(async () => {
    return (await detailsCurrentlyOpen(driver)) === amount;
  }, 5000);
}

export async function testDetails(driver: Driver, detailsElement: WebElement) {
  const detailsOpen = await detailsCurrentlyOpen(driver);

  const summaryElement = await detailsElement.findElement(By.css(".summary"));
  await simulateClick(driver, summaryElement);

  await detailsShouldBeOpen(driver, detailsOpen + 1);
}
