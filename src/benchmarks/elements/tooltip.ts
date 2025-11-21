import { WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import {
  promisifiedTimeout,
  simulateClick,
} from "../../utilities/benchmark-utilities";

export async function testTooltip(driver: Driver, tooltipElement: WebElement) {
  await simulateClick(driver, tooltipElement);

  await promisifiedTimeout(500);

  // Click away the tooltip
  await driver.actions({ async: true }).move({ x: 0, y: 0 }).click().perform();
}
