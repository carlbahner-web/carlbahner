import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { serve } from "./serve.mjs";
const D = "/tmp/claude-0/-home-user/4e0467e9-9961-5b44-a7bf-80314e4c07a9/scratchpad/aw";
await (await import("node:fs/promises")).mkdir(D, { recursive: true });
const { server, url } = serve();
const browser = await chromium.launch();
for (const [name, opts] of [["laptop", { viewport: { width: 1440, height: 900 } }], ["phone", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }]]) {
  const page = await (await browser.newContext({ ...opts, reducedMotion: "reduce" })).newPage();
  page.on("pageerror", (e) => console.log(name, "ERR", e.message));
  await page.goto(url + "?intro=600000", { timeout: 120000 });
  await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 180000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${D}/${name}.png` });
  console.log(name, "ok"); await page.context().close();
}
await browser.close(); server.close();
