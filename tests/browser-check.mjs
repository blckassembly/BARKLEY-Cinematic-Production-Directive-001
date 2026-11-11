import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const base = process.env.DEMO_URL || "http://localhost:3000";
const failures = [];
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(base);
  await page.getByLabel("Your name").fill("Judge Alex");
  await page.getByRole("button", { name: "Continue to demo lobby" }).click();
  await page.screenshot({ path: "/tmp/barkley-lobby.png", fullPage: true });
  await page.getByRole("button", { name: /Launch desktop demo/ }).click();
  for (const scenario of ["minor", "mismatch"]) {
    await page.getByLabel("Judge’s test scenario").selectOption(scenario);
    await page
      .getByRole("button", { name: "Run eligibility scenario" })
      .click();
    assert.match(await page.getByRole("alert").innerText(), /blocked/);
    assert.equal(
      await page.getByRole("heading", { name: "Verify eligibility" }).count(),
      1,
    );
  }
  await page.getByLabel("Store location").selectOption("NY");
  await page.getByLabel("Judge’s test scenario").selectOption("adult");
  await page.getByRole("button", { name: "Run eligibility scenario" }).click();
  await page
    .getByRole("button", { name: "Continue to Sandbox checkout" })
    .click();
  assert.match(await page.getByRole("alert").innerText(), /acknowledge/);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Continue to Sandbox checkout" })
    .click();
  await page.getByText("Sandbox is not connected.", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("Sandbox payment captured", { exact: true }).count(),
    0,
  );
  results.push(
    "Underage and mismatch blocked; product acknowledgment enforced; missing credentials fail closed.",
  );
  await page.getByRole("button", { name: "Demo lobby" }).click();
  await page.getByRole("button", { name: /Launch vr demo/ }).click();
  await page.locator(".vr-viewport canvas").waitFor();
  await page.waitForFunction(
    () => document.querySelector(".vr-viewport canvas")?.width > 0,
  );
  await page.screenshot({ path: "/tmp/barkley-vr.png", fullPage: true });
  results.push(
    "Immersive scene renders in Chromium software WebGL; headset not tested.",
  );
  await page.getByRole("button", { name: "Demo lobby" }).click();
  // A deliberately mocked SDK tests approval/cancel handling without invoking a real PayPal transaction.
  let creates = 0;
  await page.route("**/api/paypal/*", async (route) => {
    const action = route.request().url().split("/").pop();
    const body = route.request().postDataJSON();
    const data =
      action === "config"
        ? { clientId: "mock-client" }
        : action === "create"
          ? { id: `MOCK${++creates}`, ticket: body.mode }
          : {
              id: `MOCK${creates}`,
              mode: body.ticket,
              captureId: `CAP${creates}`,
              amount: "1.00",
              currency: "USD",
              status: "COMPLETED",
            };
    await route.fulfill({ json: data });
  });
  await page.route("https://www.paypal.com/sdk/js?*", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.paypal={FUNDING:{PAYPAL:'paypal'},Buttons(options){let el;return {async render(host){el=document.createElement('button');el.textContent='Mock PayPal approve';el.onclick=async()=>{await options.createOrder();await options.onApprove();};host.appendChild(el);const cancel=document.createElement('button');cancel.textContent='Mock PayPal cancel';cancel.onclick=()=>options.onCancel();host.appendChild(cancel);},close(){el?.parentElement?.replaceChildren();}};}};`,
    }),
  );
  for (const mode of ["desktop", "vr"]) {
    await page
      .getByRole("button", { name: new RegExp(`Launch ${mode} demo`) })
      .click();
    await page
      .getByRole("button", { name: "Run eligibility scenario" })
      .click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Continue to Sandbox checkout" })
      .click();
    await page.getByRole("button", { name: "Mock PayPal cancel" }).click();
    assert.equal(
      await page.getByRole("heading", { name: "Your test receipt" }).count(),
      0,
    );
    await page.getByRole("button", { name: "Mock PayPal approve" }).click();
    await page
      .getByRole("heading", { name: "Sandbox payment captured" })
      .waitFor();
    await page.getByRole("button", { name: "Return to lobby" }).click();
  }
  assert.equal(creates, 2);
  assert.match(await page.getByRole("status").innerText(), /2 completed/);
  results.push(
    "Mocked SDK: desktop and VR create two distinct orders; cancel never produces a receipt.",
  );
  // Repeat user navigation to expose stale state and mount/unmount failures.
  for (let i = 0; i < 30; i++) {
    await page.getByRole("button", { name: /Launch desktop demo/ }).click();
    assert.equal(
      await page.getByRole("heading", { name: "Verify eligibility" }).count(),
      1,
    );
    await page.getByRole("button", { name: "Demo lobby" }).click();
  }
  results.push("30 repeated checkout navigation cycles reset state.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/barkley-mobile.png", fullPage: true });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  results.push("390px mobile lobby has no horizontal overflow.");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Enter the demo" }).waitFor();
  const concurrent = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const p = await browser.newPage();
      const start = Date.now();
      await p.goto(base);
      await p.getByLabel("Your name").fill(`Concurrent ${i}`);
      await p.getByRole("button", { name: "Continue to demo lobby" }).click();
      await p.getByRole("button", { name: /Launch desktop demo/ }).click();
      await p.getByRole("heading", { name: "Verify eligibility" }).waitFor();
      await p.close();
      return Date.now() - start;
    }),
  );
  results.push(
    `10 simultaneous browser sessions reached checkout; slowest ${Math.max(...concurrent)}ms on this machine.`,
  );
  assert.deepEqual(failures, []);
  console.log(
    JSON.stringify(
      {
        results,
        pageErrors: failures,
        paymentProvider: "mocked; no actual PayPal payment performed",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
