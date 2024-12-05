// Browser-level configurations
export const browserConfig = {
  args: [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-software-rasterizer",
    "--disable-extensions",
    "--no-sandbox",
    "--single-process",
  ],
  slowMo: 50,
};

// Page/Context-level configurations
export const pageConfig = {
  viewport: {
    width: 1000,
    height: 1000,
  },
  screenshotOptions: {
    type: "jpeg",
    quality: 80,
  },
  waitForInitialPage: true,
  bypassCSP: true,
  javaScriptEnabled: true,
  defaultTimeout: 30000,
} as const;
