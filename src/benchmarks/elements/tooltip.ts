import { By, WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  promisifiedTimeout,
  simulateClick,
} from "../../utilities/benchmark-utilities";

const contentSelector = ".tooltip + .contents";

/**
 * Waits until the specified number of tooltips are open.
 *
 * @param driver The driver to control the browser instance.
 * @param amount How many tooltips should be open.
 */
async function tooltipsOpen(driver: Driver, amount: number) {
  return await driver.wait(async () => {
    const elements = await driver.findElements(By.css(contentSelector));
    let openTooltips = 0;
    for (const el of elements) {
      if (await el.isDisplayed()) {
        openTooltips++;
      }
    }
    return openTooltips === amount;
  }, 5000);
}

export async function testTooltip(driver: Driver, tooltipElement: WebElement) {
  await simulateClick(driver, tooltipElement);

  await tooltipsOpen(driver, 1);
  await promisifiedTimeout(200);

  // Dismiss the tooltip
  await driver.actions({ async: true }).move({ x: 0, y: 0 }).click().perform();
  await tooltipsOpen(driver, 0);
}
