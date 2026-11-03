/* The arc lamp from every angle the camera can reach, alone in the room, for finding what breaks where its pieces
   meet. Carl, 6 Oct 2026: "There are still some weird issues with the lamp next, depending on which angle you are
   looking at it from... It would need to look at the lamp from all of the possible different positions to isolate
   where the issue was coming from".
   Every other decoration is hidden; the room stays behind it. The camera stands where each turn and tilt of
   Carl's free camera puts it (FREE in src/studio.mjs: turn ±1.5, tilt ±0.7, lens 4 to 80) and is pointed at the
   lamp, since the lamp's look depends only on where the camera stands (the stand and shades turn to it). Written,
   each panel labelled on the picture with its turn, tilt and lens:
     <label>-1-whole-lamp-height-<h>.png    9 turns x 3 tilts, the whole lamp at the opening lens
     <label>-2-necks-and-collar-height-<h>.png  the same at Carl's closest lens (4), framed on the necks and collar
     <label>-3-joins-enlarged.png           the joins enlarged: where the necks cross, where they go into the
                                            collar, where each shade meets its sleeve (closest lens, saved Height)
     <label>-4-visitors-furthest-views.png  the same places as far as a visitor's camera goes each way
     <label>-film-*.mp4                     the camera swept slowly through the full turn range
   at the lamp's Height (`raise`) as saved and at 0, 1440x900, the boil held (reduced motion) and the clock frozen.
   Run from the repo root:
     node studio/tests/lamp.mjs [outdir] [--root <a copy of studio/>] [--label after] [--only 1|2|3|film]
   A panel marked "Carl only" is a place a visitor's camera cannot stand (their limits, LIMITS in src/studio.mjs).
   --root renders another copy of the room (say, the lamp before a change) with the same rig. */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { serve, root } from "./serve.mjs";

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const out = args[0] && !args[0].startsWith("--") ? args[0] : join(root, "tests", "out", "lamp");
const dir = opt("--root", root);
const label = opt("--label", "lamp");
const only = opt("--only", "");
const W = 1440,
  H = 900;
const raw = join(out, "raw-" + label);
await mkdir(raw, { recursive: true });

// the free camera's reach (FREE in src/studio.mjs)
const TURNS = [-1.5, -1.125, -0.75, -0.375, 0, 0.375, 0.75, 1.125, 1.5];
// tilted up past about 0.62 the walk puts the camera under the floor (AIM is 1.33 m up, 6 m off), where the floor
// hides everything, so the highest row is 0.6
const TILTS = [0.6, 0, -0.7];
const OPENING = 17.831, // START.fov: the opening lens, his widest
  CLOSEST = 4; // FREE.close
const SAVED = 0.34; // the lamp's Height as saved (`raise` in src/props.mjs)
// places on the lamp's canvas (pixels of art/lamp-source.png, as tools/cut_lamp.py reads it), on neck `on`
const BOX = [358, 26, 810, 955]; // the canvas the cut writes: its left, top, width, height in the drawing
const SPOTS = {
  middle: ["neck1", 860, 500], // the lamp's middle, for the whole-lamp views
  bunch: ["neck1", 985, 255], // where the three necks run together, for the close views
  cross: ["neck1", 1000, 268], // where the necks cross each other
  collar: ["neck1", 1030, 345], // where they go into the collar
  sleeve1: ["neck1", 452, 84], // where each shade meets its sleeve
  sleeve2: ["neck2", 620, 132],
  sleeve3: ["neck3", 774, 184],
};
const deg = (r) => Math.round((r * 180) / Math.PI);
const words = (turn, tilt, lens) =>
  `turn ${Math.abs(turn) < 0.01 ? "0" : deg(Math.abs(turn)) + "° " + (turn < 0 ? "left" : "right")}, tilt ${
    Math.abs(tilt) < 0.01 ? "level" : deg(Math.abs(tilt)) + "° " + (tilt > 0 ? "up" : "down")
  }\nlens ${lens}`;
// the furthest a visitor's camera turns and tilts from the opening view (their limits, LIMITS in src/studio.mjs),
// found by tests/lamp.mjs's own search on 7 Oct 2026; the opening view is turn -0.0726, tilt 0.0398
const VISITOR_EDGES = [
  [0.62, 0.0398, "a visitor's furthest right"],
  [-0.64, 0.0398, "a visitor's furthest left"],
  [-0.0726, 0.377, "a visitor's highest"],
  [-0.0726, -0.632, "a visitor's lowest"],
];

const { server, url } = serve(dir);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
// the film's clock (tests/film.mjs): time moves only when a picture is taken
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
await page.goto(url);
for (let i = 0; i < 600 && !(await page.evaluate(() => document.body.classList.contains("ready"))); i++) {
  await page.evaluate(() => window.__advance(100));
  await page.waitForTimeout(100);
}
for (let i = 0; i < 4; i++) await page.evaluate(() => window.__advance(50));
// the lamp alone: every other decoration hidden, the room kept
await page.evaluate(
  ({ BOX, SPOTS }) => {
    const S = window.__studio,
      LAMP = ["lamp", "neck1", "neck2", "neck3", "shade1", "shade2", "shade3"];
    for (const m of S.props) m.visible = LAMP.includes(m.userData.prop.id);
    document.querySelectorAll("body > *:not(canvas)").forEach((e) => (e.style.visibility = "hidden"));
    const V = S.camera.position.constructor,
      mesh = (id) => S.props.find((m) => m.userData.prop.id === id);
    // a spot on a piece's canvas, in the room
    const at = ([id, px, py]) => {
      const m = mesh(id);
      m.updateMatrixWorld(true);
      return new V((px - BOX[0]) / BOX[2] - 0.5, 0.5 - (py - BOX[1]) / BOX[3], 0).applyMatrix4(m.matrixWorld);
    };
    window.__lamp = {
      // the camera where a turn and tilt stand it, pointed at a spot, at a lens; the lamp at a Height
      shoot(turn, tilt, lens, spot, raise) {
        mesh("lamp").userData.prop.raise = raise;
        for (let k = 0; k < 2; k++) {
          S.aim = at(SPOTS[spot]);
          Object.assign(S.cam, { yaw: turn + 1e-6, tyaw: turn, pitch: tilt + 1e-6, tpitch: tilt, fov: lens + 1e-6, tfov: lens });
          window.__advance(20);
        }
      },
      // where the lamp is on the screen, for cropping round it
      box() {
        let x0 = 1e9,
          y0 = 1e9,
          x1 = -1e9,
          y1 = -1e9;
        for (const id of LAMP) {
          const m = mesh(id);
          m.updateMatrixWorld(true);
          for (const [u, v] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
            const p = new V(u, v, 0).applyMatrix4(m.matrixWorld).project(S.camera);
            x0 = Math.min(x0, ((p.x + 1) / 2) * innerWidth);
            x1 = Math.max(x1, ((p.x + 1) / 2) * innerWidth);
            y0 = Math.min(y0, ((1 - p.y) / 2) * innerHeight);
            y1 = Math.max(y1, ((1 - p.y) / 2) * innerHeight);
          }
        }
        return [x0, y0, x1, y1];
      },
    };
  },
  { BOX, SPOTS },
);

// --eval: run in the page before any shot, to switch a piece off or change one thing and see what it does
// (window.__studio.props); --views "turn,tilt,spot,lens;...": only those shots, written to raw-<label>/v-*.png
if (opt("--eval")) await page.evaluate(opt("--eval"));
const shots = [];
async function shot(name, turn, tilt, lens, spot, raise, crop) {
  await page.evaluate((a) => window.__lamp.shoot(...a), [turn, tilt, lens, spot, raise]);
  let clip;
  if (crop === "lamp") {
    const [x0, y0, x1, y1] = await page.evaluate(() => window.__lamp.box());
    clip = { x: Math.max(0, x0 - 10), y: Math.max(0, y0 - 10), width: 0, height: 0 };
    clip.width = Math.min(W, x1 + 10) - clip.x;
    clip.height = Math.min(H, y1 + 10) - clip.y;
  } else clip = { x: (W - crop) / 2, y: (H - crop) / 2, width: crop, height: crop };
  const path = join(raw, name + ".png");
  await page.screenshot({ path, clip });
  const visitors = await page.evaluate((a) => window.__studio.visitors?.(...a) ?? true, [turn, tilt]);
  shots.push({ name, path, text: words(turn, tilt, lens) + (visitors ? "" : ", Carl only") });
  return path;
}

// a contact sheet: rows of panels, each labelled on the picture; a title across the top
function sheet(file, title, panels, cols, scale = 1) {
  execFileSync("python3", ["-I", "-c", `
import sys, json
from PIL import Image, ImageDraw, ImageFont
title, cols, scale, out = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
panels = json.loads(sys.argv[5])
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
T = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
ims = [Image.open(p['path']).convert('RGB') for p in panels]
ims = [im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS) if scale != 1 else im for im in ims]
cw = max(max(im.width for im in ims), 330); ch = max(im.height for im in ims) + 54
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (cw + 8) + 8, 64 + rows * (ch + 8)), '#2c2c2a')
d = ImageDraw.Draw(S)
d.text((12, 14), title, font=T, fill='#ede6da')
for i, (im, p) in enumerate(zip(ims, panels)):
    x, y = 8 + (i % cols) * (cw + 8), 64 + (i // cols) * (ch + 8)
    S.paste(im, (x + (cw - im.width) // 2, y + 54))
    for k, line in enumerate((str(i + 1) + '.  ' + p['text']).split('\\n')):
        d.text((x + 4, y + 4 + 24 * k), line, font=F, fill='#ede6da')
S.save(out)
`, title, String(cols), String(scale), file, JSON.stringify(panels)]);
  console.log("written", file);
}

if (only === "views") {
  for (const v of opt("--views", "").split(";").filter(Boolean)) {
    const [turn, tilt, spot, lens] = v.split(",");
    await shot(`v-${turn}_${tilt}_${spot}_${lens}`, +turn, +tilt, +lens, spot, SAVED, spot === "middle" ? "lamp" : 720);
  }
}
const heights = [
  [SAVED, "saved"],
  [0, "0"],
];
if (!only || only === "1")
  for (const [r, h] of heights) {
    const ps = [];
    for (const tilt of TILTS)
      for (const turn of TURNS) {
        await shot(`1-h${h}-${turn}-${tilt}`, turn, tilt, OPENING, "middle", r, "lamp");
        ps.push(shots.at(-1));
      }
    sheet(join(out, `${label}-1-whole-lamp-height-${h}.png`), `${label}: the lamp alone, every turn and tilt, opening lens, Height ${h === "saved" ? "as saved" : "at 0"}`, ps, 9, 0.5);
  }
if (!only || only === "2")
  for (const [r, h] of heights) {
    const ps = [];
    for (const tilt of TILTS)
      for (const turn of TURNS) {
        await shot(`2-h${h}-${turn}-${tilt}`, turn, tilt, CLOSEST, "bunch", r, 720);
        ps.push(shots.at(-1));
      }
    sheet(join(out, `${label}-2-necks-and-collar-height-${h}.png`), `${label}: the necks and collar, every turn and tilt, closest lens, Height ${h === "saved" ? "as saved" : "at 0"}`, ps, 9, 0.5);
  }
if (!only || only === "3") {
  const ps = [];
  for (const [spot, what] of [
    ["cross", "where the necks cross"],
    ["collar", "where the necks go into the collar"],
    ["sleeve1", "shade 1 on its sleeve"],
    ["sleeve2", "shade 2 on its sleeve"],
    ["sleeve3", "shade 3 on its sleeve"],
  ])
    for (const tilt of TILTS)
      for (const turn of TURNS) {
        await shot(`3-${spot}-${turn}-${tilt}`, turn, tilt, CLOSEST, spot, SAVED, 240);
        shots.at(-1).text = what + "\n" + shots.at(-1).text.replace("\nlens 4", "");
        ps.push(shots.at(-1));
      }
  sheet(join(out, `${label}-3-joins-enlarged.png`), `${label}: the joins, enlarged twice, closest lens, Height as saved (rows of nine turns: tilted up, level, down)`, ps, 9, 1.5);
}
if (!only || only === "4") {
  const ps = [];
  for (const [turn, tilt, edge] of VISITOR_EDGES)
    for (const [spot, what] of [
      ["middle", "the whole lamp"],
      ["bunch", "the necks"],
      ["collar", "the collar"],
      ["sleeve1", "shade 1 on its sleeve"],
      ["sleeve2", "shade 2 on its sleeve"],
      ["sleeve3", "shade 3 on its sleeve"],
    ]) {
      await shot(`4-${spot}-${turn}-${tilt}`, turn, tilt, spot === "middle" ? OPENING : CLOSEST, spot, SAVED, spot === "middle" ? "lamp" : 360);
      shots.at(-1).text = edge + "\n" + what;
      ps.push(shots.at(-1));
    }
  sheet(join(out, `${label}-4-visitors-furthest-views.png`), `${label}: as far as a visitor's camera goes each way, Height as saved (whole lamp at the opening lens, the rest at the closest)`, ps, 6, 0.8);
}
if (!only || only === "film") {
  // the turn swept slowly from furthest left to furthest right and back, level, at two lenses
  for (const [name, lens, spot, crop] of [
    ["whole-lamp", OPENING, "middle", "lamp"],
    ["necks-and-collar", CLOSEST, "bunch", 720],
  ]) {
    const fd = join(raw, "film-" + name);
    await rm(fd, { recursive: true, force: true });
    await mkdir(fd, { recursive: true });
    // one crop for the whole film, the widest the lamp needs over the sweep
    let clip = { x: (W - 720) / 2, y: (H - 720) / 2, width: 720, height: 720 };
    if (crop === "lamp") {
      let b = [1e9, 1e9, -1e9, -1e9];
      for (const turn of TURNS) {
        await page.evaluate((a) => window.__lamp.shoot(...a), [turn, 0, lens, spot, SAVED]);
        const [x0, y0, x1, y1] = await page.evaluate(() => window.__lamp.box());
        b = [Math.min(b[0], x0), Math.min(b[1], y0), Math.max(b[2], x1), Math.max(b[3], y1)];
      }
      clip = { x: Math.max(0, b[0] - 10), y: Math.max(0, b[1] - 10) };
      clip.width = Math.round((Math.min(W, b[2] + 10) - clip.x) / 2) * 2;
      clip.height = Math.round((Math.min(H, b[3] + 10) - clip.y) / 2) * 2;
    }
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        turn = -1.5 + 3 * (t < 0.5 ? t * 2 : 2 - t * 2);
      await page.evaluate((a) => window.__lamp.shoot(...a), [turn, 0, lens, spot, SAVED]);
      await page.screenshot({ path: join(fd, String(i).padStart(4, "0") + ".png"), clip });
    }
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "20", "-i", join(fd, "%04d.png"), "-vf",
      `drawbox=x=0:y=0:w=iw:h=34:color=0x2c2c2a:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=18:fontcolor=0xede6da:x=8:y=8:text='${label}\\: ${name.replace(/-/g, " ")}, turn swept left to right and back, level'`,
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", join(out, `${label}-film-${name}.mp4`)]);
    console.log("written", join(out, `${label}-film-${name}.mp4`));
  }
}
await browser.close();
server.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
