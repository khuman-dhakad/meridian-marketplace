import { spawn } from "child_process";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;

const viewports = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Starting headless Edge on port", PORT);
  const browser = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-extensions",
    "about:blank",
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    console.log("Pages available:", pages.length);
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

    console.log("Navigating to http://localhost:3000/");
    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(2000);

    const titleEval = await send("Runtime.evaluate", {
      expression: "document.title",
      returnByValue: true,
    });
    console.log("Page Title:", titleEval.result?.value);

    // Test horizontal overflow at every breakpoint
    console.log("\n--- VIEWPORT OVERFLOW AUDIT ---");
    let allPassed = true;

    for (const width of viewports) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: width,
        height: 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(300);

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
      if (!passed) allPassed = false;

      console.log(
        `Viewport ${width}px: scrollWidth=${data?.scrollWidth}px, clientWidth=${data?.clientWidth}px -> ${
          passed ? "PASS (No Horizontal Overflow)" : "FAIL (Overflow detected!)"
        }`
      );
    }

    console.log("\n--- CONSOLE ERRORS AUDIT ---");
    console.log("Console errors recorded:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err) => console.error("Console Error:", err));
    } else {
      console.log("Zero console errors observed during page rendering!");
    }

    // Test Search Page
    console.log("\n--- NAVIGATING TO /search?q=Tesla ---");
    await send("Page.navigate", { url: "http://localhost:3000/search?q=Tesla" });
    await sleep(1500);

    const searchCountEval = await send("Runtime.evaluate", {
      expression: `document.querySelectorAll('article').length`,
      returnByValue: true,
    });
    console.log("Search results rendered (article elements):", searchCountEval.result?.value);

    ws.close();
  } finally {
    browser.kill();
    console.log("Browser closed successfully.");
  }
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
