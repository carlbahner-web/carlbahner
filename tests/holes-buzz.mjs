/* Buzz on a phone: "It glitched out when I clicked buzz on my phone" (Carl, 10 Nov 2026). A tap on a touch screen squashes
   the thing it opens (THE PRESS in src/nav.mjs), and Buzz had no squash of his own, so every frame after the tap threw.
   This tilts a phone up to him, taps him, and fails on any page error or if his card does not open. Also checks his tap
   area is gone while he is off the top of the screen, as he is where the room opens.
   Run from the repo root: node tests/holes-buzz.mjs */
import { chromium, devices } from "playwright";
import { serve } from "./serve.mjs";

const { server, url } = serve();
const browser = await chromium.launch();
const page = await (await browser.newContext({ ...devices["iPhone 15 Pro Max"] })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(url + "?open=none", { timeout: 120000 });
await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 240000 });
await page.waitForTimeout(4000);
const box = () =>
  page.evaluate(() => {
    let X = [], Y = [];
    for (let y = 0; y < 300; y += 2) for (let x = 0; x < 300; x += 2) if (window.__nav.egg(x, y)) X.push(x), Y.push(y);
    return X.length ? [(Math.min(...X) + Math.max(...X)) / 2, (Math.min(...Y) + Math.max(...Y)) / 2] : null;
  });
const fails = [];
if (await box()) fails.push("Buzz answers a tap while he is off the screen");
// tilt up, as a thumb dragging down does
const cdp = await page.context().newCDPSession(page);
const t = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
await t("touchStart", 200, 150);
for (let i = 1; i <= 40; i++) {
  await t("touchMove", 200, 150 + i * 12.5);
  await page.waitForTimeout(30);
}
await t("touchEnd");
await page.waitForTimeout(5000);
const at = await box();
if (!at) fails.push("Buzz not on screen with the phone tilted up");
else {
  const st = await page.evaluate(() => { const r = document.querySelector("#stage").getBoundingClientRect(); return [r.x, r.y]; });
  // the tap in one go: headless frames are slow enough that a real touch's down and up land over 700 ms apart
  await page.evaluate(([X, Y]) => {
    const cv = document.querySelector("canvas");
    cv.setPointerCapture = () => {};
    cv.releasePointerCapture = () => {};
    const o = { clientX: X, clientY: Y, bubbles: true, pointerId: 77, pointerType: "touch", isPrimary: true, button: 0 };
    cv.dispatchEvent(new PointerEvent("pointerdown", o));
    cv.dispatchEvent(new PointerEvent("pointerup", o));
  }, [st[0] + at[0], st[1] + at[1]]);
  await page.waitForTimeout(6000);
  const open = await page.evaluate(() => [location.hash, document.querySelector("#win.in h2, #win.in h1")?.textContent]);
  if (open[0] !== "#wild-ride" || !/Wild Ride/.test(open[1] || "")) fails.push("his card did not open: " + JSON.stringify(open));
}
if (errors.length) fails.push(errors.length + " page errors, the first: " + errors[0]);
await browser.close();
server.close();
if (fails.length) {
  console.log("FAILED\n" + fails.join("\n"));
  process.exit(1);
}
console.log("Buzz's holes held");
