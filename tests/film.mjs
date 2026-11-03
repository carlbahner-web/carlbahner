/* Films the way round the site off the real page, frame by frame, for Carl's quiz (studio/NAVIGATION.md).
   Headless software WebGL takes about a second a frame, so a film cannot be recorded in real time: the
   page's clock is Playwright's fake one, stepped 40 ms a frame, and its CSS transitions are paused and
   stepped with it. Every film carries its own label, drawn on it (CLAUDE.md, "Every render carries its
   own label").
   Run from the repo root:
     node studio/tests/film.mjs [outdir] [only]
   writes one .mp4 a film (and a .png of its last frame) into outdir, studio/tests/out/film by default. */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { serve, root } from "./serve.mjs";

const out = process.argv[2] || join(root, "tests", "out", "film");
const only = process.argv[3] || "";
await mkdir(out, { recursive: true });
const { server, url } = serve();
const browser = await chromium.launch();
const STEP = 40; // ms a frame: 25 a second
const errors = [];

async function film(name, label, { width = 1440, height = 900, query = "", phone = false, reduced = false }, act) {
  if (only && !new RegExp(only).test(name)) return;
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: phone,
    isMobile: phone,
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  /* THE FILM'S CLOCK: the page's own time stands still and moves only when a frame is taken, each frame
     drawn once. The time of day is frozen too, so the clock on the wall holds still. */
  await page.addInitScript(() => {
    let T = 0,
      q = [];
    const day = new Date("2026-10-06T15:10:00Z").getTime();
    performance.now = () => T;
    Date.now = () => day + T;
    const D = Date;
    window.Date = class extends D {
      constructor(...a) {
        super(...(a.length ? a : [day + T]));
      }
      static now() {
        return day + T;
      }
    };
    window.requestAnimationFrame = (f) => (q.push(f), q.length);
    window.__advance = (ms) => {
      T += ms;
      const run = q;
      q = [];
      for (const f of run) f(T);
    };
  });
  await page.goto(url + query);
  for (let i = 0; i < 600 && !(await page.evaluate(() => document.body.classList.contains("ready"))); i++) {
    await page.evaluate(() => window.__advance(100));
    await page.waitForTimeout(100);
  }
  for (let i = 0; i < 4; i++) await page.evaluate(() => window.__advance(50));
  // the label, ON the film
  await page.evaluate((text) => {
    const d = document.createElement("div");
    d.textContent = text;
    Object.assign(d.style, {
      position: "fixed",
      left: "12px",
      top: "12px",
      zIndex: 9,
      padding: "6px 12px",
      background: "#2c2c2a",
      color: "#ede6da",
      font: "700 " + (innerWidth < 600 ? 15 : 22) + "px/1.2 system-ui, sans-serif",
      borderRadius: "8px",
      maxWidth: "calc(100% - 48px)",
      pointerEvents: "none",
    });
    document.body.append(d);
  }, label);
  const dir = join(out, name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  let n = 0;
  const frame = async () => {
    await page.evaluate((ms) => window.__advance(ms), STEP);
    // CSS transitions run on the real clock: hold them and move them on with the fake one
    await page.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        if (a.playState !== "paused") a.pause();
        a.currentTime = (a.currentTime || 0) + ms;
      }
    }, STEP);
    await page.screenshot({ path: join(dir, String(n++).padStart(4, "0") + ".png"), timeout: 180000 });
  };
  const api = {
    page,
    frames: async (ms) => {
      for (let t = 0; t < ms; t += STEP) await frame();
    },
    // a mouse moved from one place to another over ms, filmed
    glide: async (x0, y0, x1, y1, ms) => {
      const k = Math.max(1, Math.round(ms / STEP));
      for (let i = 0; i <= k; i++) {
        await page.mouse.move(x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k);
        await frame();
      }
    },
    // a finger dragged across the screen over ms, filmed
    drag: async (x0, y0, x1, y1, ms) => {
      const c = await ctx.newCDPSession(page);
      const k = Math.max(2, Math.round(ms / STEP));
      await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
      for (let i = 1; i <= k; i++) {
        await c.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / k, y: y0 + ((y1 - y0) * i) / k }] });
        await frame();
      }
      await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    },
  };
  await act(api);
  await ctx.close();
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(1000 / STEP), "-i", join(dir, "%04d.png"),
    "-vf", `scale=${width > 900 ? 960 : width}:-2`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart", join(out, name + ".mp4")]);
  execFileSync("cp", [join(dir, String(n - 1).padStart(4, "0") + ".png"), join(out, name + ".png")]);
  console.log("filmed", name, n, "frames");
}

// where things are at the opening view, 1440x900
const CONSOLE = [250, 780],
  GONG = [720, 360],
  FRAME = [40, 640];

/* The quiz's first round (6 Oct 2026) filmed every option behind page settings; Carl's picks are the only
   behaviour now, so these film the room as it is. */
await film("fly-in", "Click the record console, then close (the room as it is now)", {}, async (f) => {
  await f.page.mouse.move(...CONSOLE);
  await f.frames(400);
  await f.page.mouse.click(...CONSOLE);
  await f.frames(3000);
  await f.page.keyboard.press("Escape");
  await f.frames(2600);
});
/* THE CONSOLE'S LEAN (src/studio.mjs THE LEAN), Carl's pick of 2 Nov 2026, filmed for him to see it smooth. */
await film("console-lean", "Click the record console: the camera leans in over it, then close", {}, async (f) => {
  await f.page.mouse.move(...CONSOLE);
  await f.frames(300);
  await f.page.mouse.click(...CONSOLE);
  await f.frames(3800);
  await f.page.keyboard.press("Escape");
  await f.frames(3000);
});
await film("touches-frame", "The small touches, bigger: click the picture frame", {}, async (f) => {
  await f.page.mouse.move(...FRAME);
  await f.frames(400);
  await f.page.mouse.click(...FRAME);
  await f.frames(3000);
  await f.page.keyboard.press("Escape");
  await f.frames(2600);
});
for (const [name, at, text] of [
  ["press-console", CONSOLE, "The press on the record console"],
  ["press-gong", GONG, "The press on the gong"],
])
  await film(name, text, {}, async (f) => {
    await f.page.mouse.move(...at);
    await f.frames(200);
    await f.page.mouse.click(...at);
    await f.frames(700);
  });
await film("phone-turn", "A phone held upright: turn it", { width: 390, height: 844, phone: true }, (f) => f.frames(3600));

await browser.close();
server.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("written to", out);
