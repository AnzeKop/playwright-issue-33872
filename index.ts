// Import the framework and instantiate it
import Fastify from "fastify";
import { BrowserManager } from "./BrowserManager";
const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get("/", async function handler(request, reply) {
  const browserManager = await BrowserManager.getInstance();
  const randomId = crypto.randomUUID();
  const browser = await browserManager.getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a website
    await page.goto("https://example.com");

    // Wait for some time to simulate processing
    await page.waitForTimeout(2000);

    // Perform some actions
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Get some data
    const title = await page.title();
    const url = page.url();

    // Cleanup
    await context.close();

    return {
      id: randomId,
      title,
      url,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error:", error);
    // Make sure to clean up even if there's an error
    await context.close();
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    console.error(err);
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
