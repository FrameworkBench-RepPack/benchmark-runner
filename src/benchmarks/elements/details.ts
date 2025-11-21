import { By, WebElement } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import { simulateClick } from "../../utilities/benchmark-utilities";

export async function testDetails(driver: Driver, detailsElement: WebElement) {
  const summaryElement = await detailsElement.findElement(By.css(".summary"));
  await simulateClick(driver, summaryElement);
}
