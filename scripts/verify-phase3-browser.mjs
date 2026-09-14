import { spawn } from "child_process";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CDP_PORT = 9223;
const APP_PORT = process.env.PORT || 3007;

const viewports = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`Starting headless Edge for Phase 3 Browser Audit against port ${APP_PORT}...`);
  const browser = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-extensions",
    "about:blank",
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === "page") || pages[0];
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error("No webSocketDebuggerUrl found");
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();
    const consoleErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
        consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
      }
      if (msg.id && callbacks.has(msg.id)) {
        const resolve = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    };

    await send("Runtime.enable");
    await send("Page.enable");
    await send("DOM.enable");

    // Audit 1: Homepage
    console.log(`\n=== AUDITING HOMEPAGE (http://localhost:${APP_PORT}/) ===`);
    await send("Page.navigate", { url: `http://localhost:${APP_PORT}/` });
    await sleep(2000);

    for (const width of viewports) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(200);

      const res = await send("Runtime.evaluate", {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      });

      const data = res.result?.value;
      const passed = data && !data.hasOverflow;
      console.log(`  [Home] ${width}px: scrollWidth=${data?.scrollWidth}px -> ${passed ? "PASS" : "FAIL"}`);
      if (!passed) throw new Error(`Horizontal overflow on homepage at ${width}px`);
    }

    // Audit 2: Listing Detail Page
    console.log(`\n=== AUDITING LISTING DETAIL PAGE (http://localhost:${APP_PORT}/listing/2023-tesla-model-3-long-range-awd) ===`);
    await send("Page.navigate", { url: `http://localhost:${APP_PORT}/listing/2023-tesla-model-3-long-range-awd` });
    await sleep(2000);

    const listingTitle = await send("Runtime.evaluate", {
      expression: "document.title",
      returnByValue: true,
    });
    console.log("  Listing Page Title:", listingTitle.result?.value);

    for (const width of viewports) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(200);

      const res = await send("Runtime.evaluate", {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      });

      const data = res.result?.value;
      const passed = data && !data.hasOverflow;
      console.log(`  [Listing Detail] ${width}px: scrollWidth=${data?.scrollWidth}px -> ${passed ? "PASS" : "FAIL"}`);
      if (!passed) throw new Error(`Horizontal overflow on listing detail at ${width}px`);
    }

    // Audit 3: Search Page with condition & pagination
    console.log(`\n=== AUDITING SEARCH PAGE WITH CONDITION & PAGINATION ===`);
    await send("Page.navigate", { url: `http://localhost:${APP_PORT}/search?condition=EXCELLENT&page=1` });
    await sleep(2000);

    for (const width of viewports) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(200);

      const res = await send("Runtime.evaluate", {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      });

      const data = res.result?.value;
      const passed = data && !data.hasOverflow;
      console.log(`  [Search] ${width}px: scrollWidth=${data?.scrollWidth}px -> ${passed ? "PASS" : "FAIL"}`);
      if (!passed) throw new Error(`Horizontal overflow on search page at ${width}px`);
    }

    // Audit 4: Category Page
    console.log(`\n=== AUDITING CATEGORY PAGE ===`);
    await send("Page.navigate", { url: `http://localhost:${APP_PORT}/category/vehicles-automotive` });
    await sleep(1500);

    for (const width of viewports) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(150);

      const res = await send("Runtime.evaluate", {
        expression: `({
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      });

      const passed = res.result?.value && !res.result?.value.hasOverflow;
      if (!passed) throw new Error(`Horizontal overflow on category page at ${width}px`);
    }
    console.log("  All 9 breakpoints PASS on category page.");

    console.log("\n--- CONSOLE ERRORS AUDIT ---");
    console.log("Recorded console errors:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e) => console.error("Console Error:", e));
    } else {
      console.log("Zero console errors during browser navigation.");
    }

    ws.close();
    console.log("\nALL BROWSER AUDITS PASSED SUCCESSFULLY!");
  } finally {
    browser.kill();
  }
}

run().catch((err) => {
  console.error("Browser Audit Failed:", err);
  process.exit(1);
});
