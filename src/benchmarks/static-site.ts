import { until } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/firefox";
import { profilerWrapper } from "../utilities/benchmark-utilities";
import BenchmarkInput from "./benchmark-types";

const BENCHMARK_NAME = "static-site" as const;

export async function benchmarkStatic(options: BenchmarkInput) {
  const openExampleSite = async (driver: Driver) => {
    await driver.navigate().to("https://google.com");
    await driver.wait(until.titleIs("Google"), 10000);
  };

  const changeSite = async (driver: Driver) => {
    await driver.navigate().to("https://qwant.com");
    await driver.wait(
      until.titleIs(
        "Qwant - The search engine that values you as a user, not as a product"
      ),
      10000
    );
  };

  const closeTab = async (driver: Driver) => {
    //Open new tab
    await driver.switchTo().newWindow("tab");

    await driver.navigate().to("https://profiler.firefox.com");

    //Wait for the new tab to finish loading content
    await driver.wait(until.titleIs("Firefox Profiler"), 10000);

    await new Promise((resolve) => setTimeout(resolve, 500000));
  };

  await profilerWrapper(
    BENCHMARK_NAME,
    options.framework,
    options.profilerOptions,
    changeSite,
    openExampleSite,
    closeTab
  );
}
