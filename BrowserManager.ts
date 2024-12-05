import { Browser, BrowserContext, chromium } from "playwright-chromium";
import { browserConfig } from "./config";

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private contexts: Map<
    string,
    {
      context: BrowserContext;
      lastUsed: number;
      isActive: boolean;
    }
  > = new Map();

  private readonly CONTEXT_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private readonly CONTEXT_MAX_IDLE_TIME = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    setInterval(() => this.cleanupIdleContexts(), this.CONTEXT_CLEANUP_INTERVAL);
  }

  public async init() {
    console.log("Initializing BrowserManager");
    this.browser = await chromium.launch(browserConfig);
  }

  public static async getInstance(): Promise<BrowserManager> {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
      await BrowserManager.instance.init();
    }
    return BrowserManager.instance;
  }

  private async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch(browserConfig);
    }
    return this.browser;
  }

  async createContext(id: string): Promise<BrowserContext> {
    try {
      const browser = await this.ensureBrowser();
      const context = await browser.newContext();
      this.contexts.set(id, {
        context,
        lastUsed: Date.now(),
        isActive: true,
      });
      return context;
    } catch (error) {
      console.error("Error creating context:", error);
      // If browser creation fails, clear the browser instance and try again
      this.browser = null;
      const browser = await this.ensureBrowser();
      const context = await browser.newContext();
      console.log("Reestablished browser and created context");
      this.contexts.set(id, {
        context,
        lastUsed: Date.now(),
        isActive: true,
      });
      return context;
    }
  }

  async getContext(id: string): Promise<BrowserContext> {
    const existing = this.contexts.get(id);
    if (existing && existing.isActive) {
      existing.lastUsed = Date.now();
      return existing.context;
    }
    return this.createContext(id);
  }

  async releaseContext(id: string) {
    const contextData = this.contexts.get(id);
    if (contextData) {
      await contextData.context.close();
      this.contexts.delete(id);
      contextData.isActive = false;
      contextData.lastUsed = Date.now();
    }
  }

  private async cleanupIdleContexts() {
    console.log("Cleaning up idle contexts");
    const now = Date.now();

    for (const [id, { context, lastUsed, isActive }] of this.contexts.entries()) {
      if (!isActive && now - lastUsed > this.CONTEXT_MAX_IDLE_TIME) {
        await context.close();
        this.contexts.delete(id);
      }
    }
  }

  async shutdown() {
    console.log("Shutting down BrowserManager");
    // Close all contexts
    for (const { context } of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export async function getBrowserManager(): Promise<BrowserManager> {
  return await BrowserManager.getInstance();
}
