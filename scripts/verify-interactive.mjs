import { spawn } from "child_process";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9223;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Starting headless Edge for interactive testing on port", PORT);
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
    const page = pages.find((p) => p.type === "page") || pages[0];
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error("No webSocketDebuggerUrl found");
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
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

    // 1. Load Homepage
    console.log("Loading homepage...");
    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(1500);

    // 2. Test Location Modal Trigger
    console.log("Testing Location Modal trigger...");
    const openModalEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('All Regions'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true,
    });
    await sleep(400);

    const isModalOpen = await send("Runtime.evaluate", {
      expression: `!!document.querySelector('[role="dialog"]')`,
      returnByValue: true,
    });
    console.log("Location modal rendered after click:", isModalOpen.result?.value ? "PASS" : "FAIL");

    // 3. Test Escape key closes modal
    console.log("Testing Escape key dismissal...");
    await send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      key: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await sleep(400);

    const isModalClosed = await send("Runtime.evaluate", {
      expression: `!document.querySelector('[role="dialog"]')`,
      returnByValue: true,
    });
    console.log("Modal closed upon pressing Escape:", isModalClosed.result?.value ? "PASS" : "FAIL");

    // 4. Test Mobile Viewport and Hamburger Menu
    console.log("Testing Mobile Viewport (390px) & Mobile Drawer...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await sleep(400);

    const openMenuEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const menuBtn = document.querySelector('button[aria-label="Open mobile menu"]');
        if (menuBtn) {
          menuBtn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true,
    });
    await sleep(400);

    const isDrawerOpen = await send("Runtime.evaluate", {
      expression: `!!document.querySelector('[aria-label="Mobile Navigation Menu"]')`,
      returnByValue: true,
    });
    console.log("Mobile drawer navigation opened:", isDrawerOpen.result?.value ? "PASS" : "FAIL");

    // Close Mobile Drawer
    await send("Runtime.evaluate", {
      expression: `(() => {
        const closeBtn = document.querySelector('button[aria-label="Close menu"]');
        if (closeBtn) closeBtn.click();
      })()`,
    });
    await sleep(400);

    // 5. Test Keyboard Tab Focus
    console.log("Testing keyboard Tab focus cycle...");
    await send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      key: "Tab",
      windowsVirtualKeyCode: 9,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Tab",
      windowsVirtualKeyCode: 9,
    });
    await sleep(200);

    const focusedTag = await send("Runtime.evaluate", {
      expression: `document.activeElement?.tagName`,
      returnByValue: true,
    });
    console.log("Active element after Tab press:", focusedTag.result?.value);

    // 6. Test Hero Search Form Execution
    console.log("Testing Hero Search submission...");
    await send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(1500);

    await send("Runtime.evaluate", {
      expression: `(() => {
        const input = document.querySelector('input[aria-label="Search keywords"]');
        if (input) {
          input.value = "MacBook";
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const form = input.closest('form');
          if (form) form.requestSubmit();
        }
      })()`,
    });
    await sleep(1500);

    const currentUrl = await send("Runtime.evaluate", {
      expression: "window.location.href",
      returnByValue: true,
    });
    console.log("URL after submitting search:", currentUrl.result?.value);
    const searchRouted = currentUrl.result?.value.includes("search?q=MacBook");
    console.log("Search query routing verification:", searchRouted ? "PASS" : "FAIL");

    ws.close();
  } finally {
    browser.kill();
    console.log("Browser closed.");
  }
}

run().catch((err) => {
  console.error("Interactive test failed:", err);
  process.exit(1);
});
