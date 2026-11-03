/* THREE TEXT SIZES ON THE CARDS (index.html, --fs-heading, --fs-body, --fs-small): Homegrown's rule, taken on Carl's
   "yes", 3 Nov 2026. Opens every card at his laptop's window and fails on any words drawn at another size, so a new
   card, or a size written into one, cannot drift the way Homegrown's sixteen sizes once did.
   Run from the repo root: node studio/tests/sizes.mjs */
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const { server, url } = serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const problems = [];
page.on("pageerror", (e) => problems.push(e.message));
await page.goto(url, { waitUntil: "commit" });
await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 180000 });
const allowed = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const px = (v) => parseFloat(v) * (v.trim().endsWith("rem") ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 1);
  return ["--fs-heading", "--fs-body", "--fs-small"].map((k) => px(cs.getPropertyValue(k)));
});
for (const hash of ["portfolio", "bio", "artists", "tour", "my-people", "contact"]) {
  await page.evaluate((h) => (location.hash = h), hash);
  await page.waitForFunction(() => !document.querySelector("#win").hidden, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  // the songs' lengths come once each song's details have loaded
  if (hash === "portfolio") await page.waitForFunction(() => [...document.querySelectorAll("#win .len")].every((e) => e.textContent.trim()), null, { timeout: 30000 }).catch(() => problems.push("portfolio: the songs' lengths never came"));
  const sizes = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("#win .body *")) {
      const text = [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (!text) continue;
      out.push([parseFloat(getComputedStyle(e).fontSize), text.textContent.trim().slice(0, 30)]);
    }
    return out;
  });
  for (const [size, words] of sizes)
    if (!allowed.some((a) => Math.abs(a - size) < 0.2)) problems.push(`${hash}: "${words}" is ${size}px, not one of the three sizes (${allowed.map((a) => a.toFixed(1)).join(", ")})`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);
}
await browser.close();
server.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("every card's words are at one of the three sizes");
