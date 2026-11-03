/* A heatmap of what boils: the room drawn at each of the boil's three drawings, every pixel that moves between them
   marked in heat over the room in grey, labelled on the picture. Carl, 6 Oct 2026: "can you draw like, a "heatmap"
   of the room and what lines are currently set to be boiled?"
   Run from the repo root: node studio/tests/heat.mjs [outdir] [width] [height] [#window]
   (with a window's address, the camera is where the click on it flies to) */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { serve, root } from "./serve.mjs";

const out = process.argv[2] || join(root, "tests", "out", "heat");
const width = +(process.argv[3] || 1440),
  height = +(process.argv[4] || 900),
  hash = process.argv[5] || "";
const name = `heat-${width}${hash.replace("#", "-")}`;
await mkdir(out, { recursive: true });
const { server, url } = serve();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
// the film's clock (tests/film.mjs): time moves only when a picture is taken
await page.addInitScript(() => {
  let T = 0,
    q = [];
  const day = new Date("2026-10-06T15:10:00Z").getTime();
  performance.now = () => T;
  Date.now = () => day + T;
  window.requestAnimationFrame = (f) => (q.push(f), q.length);
  window.__advance = (ms) => {
    T += ms;
    const run = q;
    q = [];
    for (const f of run) f(T);
  };
});
await page.goto(url + hash);
for (let i = 0; i < 600 && !(await page.evaluate(() => document.body.classList.contains("ready"))); i++) await page.waitForTimeout(100);
for (let i = 0; i < 6; i++) await page.evaluate(() => window.__advance(50));
// the boil's drawings are 0,1,2,1 every 130 ms: step to the start of each, a hair past the dog's blink window
const shots = [];
for (let k = 0; k < 3; k++) {
  await page.evaluate(() => window.__advance(130));
  const p = join(out, `${name}-phase-${k}.png`);
  await page.screenshot({ path: p });
  shots.push(p);
}
await browser.close();
server.close();
execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter
a,b,c,o,w = sys.argv[1:6]
A,B,C = [Image.open(p).convert('RGB') for p in (a,b,c)]
d = ImageChops.lighter(ImageChops.difference(A,B), ImageChops.difference(B,C)).convert('L')
m = d.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(5))
grey = A.convert('L').convert('RGB').point(lambda v: int(v*0.55+100))
heat = Image.new('RGB', A.size, (226, 58, 30))
img = Image.composite(heat, grey, m)
dr = ImageDraw.Draw(img)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', max(16, int(img.width/60)))
t = 'What boils right now' + (' (flown in to ' + sys.argv[6] + ')' if len(sys.argv) > 6 and sys.argv[6] else '') + ': red is every line that moves'
dr.rounded_rectangle((10,10,20+dr.textlength(t,font=F),20+F.size*1.4), 8, fill='#2c2c2a')
dr.text((16,14), t, font=F, fill='#ede6da')
img.save(o)
`, ...shots, join(out, name + ".png"), String(width), hash]);
console.log("written", join(out, name + ".png"));
