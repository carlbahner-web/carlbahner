/* What a click opens, everywhere in the room as it opens: "Can you show me the clickable heat map?" (Carl, 8 Nov 2026).
   Every spot on the room's card is asked what a click there would open (window.__nav.at for a thing, .word for a word on
   the wall), each page gets a colour laid over the room, and each area is labelled with its page.
   Run from the repo root: node tests/clickmap.mjs [out.png] [width] [height] */
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const out = process.argv[2] || "tests/out/clickmap.png",
  width = +(process.argv[3] || 1440),
  height = +(process.argv[4] || 900);
const { server, url } = serve();
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1 })).newPage();
await page.goto(url + "?intro=1");
await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 240000 });
await page.waitForTimeout(6000);
await page.mouse.move(width * 0.55, height * 0.7); // the chair, which opens nothing, and away from the edges, which lean the view
await page.waitForTimeout(3000);
await page.evaluate(() => {
  const NAMES = { portfolio: "LISTEN (the player)", artists: "QUOTES", contact: "CONTACT", bio: "ABOUT", "my-people": "YOU + ME", studioland: "STUDIOLAND" };
  const COL = { portfolio: "#e8553b", artists: "#2f8fd8", contact: "#9b4dd6", bio: "#e8a21c", "my-people": "#1fae6e", studioland: "#d63c8f" };
  const st = document.querySelector("#stage"),
    r = st.getBoundingClientRect(),
    cv = document.createElement("canvas");
  cv.width = r.width;
  cv.height = r.height;
  Object.assign(cv.style, { position: "absolute", left: "0", top: "0", width: r.width + "px", height: r.height + "px", zIndex: 50, pointerEvents: "none" });
  const g = cv.getContext("2d"),
    S = 6,
    sums = {};
  for (let y = 0; y < r.height; y += S)
    for (let x = 0; x < r.width; x += S) {
      // a thing before a word, as the room's own hover and click weigh them (src/nav.mjs)
      const k = window.__nav.at(x, y) || window.__nav.word(x, y) || window.__nav.zone(x, y);
      if (!k || !COL[k]) continue;
      g.fillStyle = COL[k] + "8c";
      g.fillRect(x, y, S, S);
      const s = (sums[k] ||= { x: 0, y: 0, n: 0 });
      s.x += x;
      s.y += y;
      s.n++;
    }
  g.font = "700 18px system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const [k, s] of Object.entries(sums)) {
    const t = NAMES[k] || k,
      cx = s.x / s.n,
      cy = s.y / s.n,
      w = g.measureText(t).width + 16;
    g.fillStyle = "#2c2c2a";
    g.beginPath();
    g.roundRect(cx - w / 2, cy - 14, w, 28, 8);
    g.fill();
    g.fillStyle = "#fff";
    g.fillText(t, cx, cy);
  }
  g.fillStyle = "#2c2c2a";
  g.beginPath();
  g.roundRect(12, 12, 520, 34, 8);
  g.fill();
  g.fillStyle = "#fff";
  g.textAlign = "left";
  g.fillText("What a click opens, from the room as it opens (laptop)", 24, 29);
  st.append(cv);
});
await page.waitForTimeout(500);
await page.screenshot({ path: out });
console.log("written", out);
await browser.close();
server.close();
