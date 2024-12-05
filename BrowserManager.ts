import { Browser, chromium } from "playwright-chromium";
import { browserConfig } from "./config";

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;

  private constructor() {}

  private async initBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (e) {
          console.log("Error closing disconnected browser:", e);
        }
      }
      this.browser = await chromium.launch(browserConfig);
    }
    return this.browser;
  }

  public async getBrowser(): Promise<Browser> {
    return this.initBrowser();
  }

  public static async getInstance(): Promise<BrowserManager> {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
      await BrowserManager.instance.initBrowser();
    }
    return BrowserManager.instance;
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
