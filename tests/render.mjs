/* Renders the studio at a laptop window: as it opens, turned by a drag, at the near and far zoom, and
   pinched in a little.
   Run from the repo root:
     node studio/tests/render.mjs [outdir]
   It serves studio/ itself, so nothing else needs to be running. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || join(root, "tests", "out");
await mkdir(out, { recursive: true });
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".mjs": "text/javascript",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    p = join(root, p);
    const b = await readFile(p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(b);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch();
const errors = [];
async function shot(name, { width, height, mobile = false, hash = "", theme, act }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: "reduce",
    colorScheme: theme || "light",
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  await page.goto(url + hash);
  await page.waitForFunction(() => document.body.classList.contains("ready"));
  await page.evaluate(() => document.fonts.ready);
  if (act) await act(page);
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(out, name + ".png") });
  await ctx.close();
}

const mid = async (p) => p.mouse.move(720, 450);
await shot("1-laptop", { width: 1440, height: 900 });
await shot("2-dragged-to-turn", {
  width: 1440,
  height: 900,
  act: async (p) => {
    await mid(p);
    await p.mouse.down();
    await p.mouse.move(420, 300, { steps: 8 });
    await p.mouse.up();
  },
});
await shot("3-wheel-in-to-near", {
  width: 1440,
  height: 900,
  act: async (p) => {
    await mid(p);
    await p.mouse.wheel(0, -120);
  },
});
await shot("4-wheel-out-to-far", {
  width: 1440,
  height: 900,
  act: async (p) => {
    await mid(p);
    await p.mouse.wheel(0, 120);
  },
});
await shot("5-pinched-in", {
  width: 1440,
  height: 900,
  act: async (p) => {
    await mid(p);
    await p.keyboard.down("Control");
    await p.mouse.wheel(0, -40);
    await p.keyboard.up("Control");
  },
});

await browser.close();
server.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("written to", out);
