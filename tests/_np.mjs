import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { serve } from "./serve.mjs";
const D = "/tmp/claude-0/-home-user/4e0467e9-9961-5b44-a7bf-80314e4c07a9/scratchpad/aw";
const { server, url } = serve();
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const [name, opts] of [["laptop", { viewport: { width: 1440, height: 900 } }], ["phone", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }]]) {
  const page = await (await browser.newContext({ ...opts, reducedMotion: "reduce" })).newPage();
  page.on("pageerror", (e) => console.log(name, "ERR", e.message));
  await page.goto(url + "#portfolio", { timeout: 120000 });
  await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 180000 });
  await page.waitForTimeout(4000);
  await page.click(".sleeve-pick >> nth=1");
  await page.waitForTimeout(8000);
  console.log(name, "playing?", await page.evaluate(() => { const a = document.querySelector("#win audio"); return a && !a.paused; }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(6000);
  console.log(name, "hud:", await page.evaluate(() => document.querySelector(".now-playing")?.innerText));
  await page.screenshot({ path: `${D}/np-${name}.png` });
  await page.click(".now-playing .np-button >> nth=1");
  await page.waitForTimeout(1000);
  console.log(name, "after stop hud:", await page.evaluate(() => !!document.querySelector(".now-playing")));
  await page.context().close();
}
await browser.close(); server.close();
