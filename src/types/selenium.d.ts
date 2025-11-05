import type { WebElement } from "selenium-webdriver";

declare module "selenium-webdriver" {
  class Select {
    constructor(element: WebElement);
    selectByIndex(index: number): Promise<void>;
    selectByValue(value: string): Promise<void>;
    selectByVisibleText(text: string | number): Promise<void>;
    isMultiple(): Promise<boolean>;
    getOptions(): Promise<WebElement[]>;
    getAllSelectedOptions(): Promise<WebElement[]>;
    getFirstSelectedOption(): Promise<WebElement>;
    deselectAll(): Promise<void>;
    deselectByVisibleText(text: string | number): Promise<void>;
    deselectByIndex(index: number): Promise<void>;
    deselectByValue(value: string): Promise<void>;
    setSelected(option: WebElement): Promise<void>;
  }
}
