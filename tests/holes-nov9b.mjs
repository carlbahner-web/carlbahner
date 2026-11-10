/* The four holes the 9 Nov 2026 Godzilla round found that came to this repo (ss-frontend docs/godzilla-2026-11-09/H.md:
   H8, H9, H12, H13), each made to happen again on the real page, Carl's "Fix it" on each (9 Nov 2026,
   https://claude.ai/artifact/V2xFo5xiRmMP921aiQJ9GP) and "Yes, a test with every fix" (8 Nov 2026). Fails on any hole that
   comes back. Nothing is sent: the form is never submitted here.
   Run from the repo root:
     node tests/holes-nov9b.mjs [side|turn|next|stall|back] */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { root } from "./serve.mjs";

/* the room served as tests/serve.mjs serves it, but a song can be made to stop part way: while `stall` is on, a track
   sends its first STALL_BYTES and then nothing more, the connection left open, as a phone's signal dipping mid-song does */
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".jpg": "image/jpeg", ".png": "image/png" };
const STALL_BYTES = 160000;
let stall = false;
const hung = new Set();
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    p = join(root, p);
    const whole = await readFile(p);
    const track = p.includes("/assets/tracks/");
    // a part of a file asked for (a song skipped into), as Netlify serves one
    const range = track && /bytes=(\d+)-(\d*)/.exec(req.headers.range || "");
    const from = range ? +range[1] : 0,
      to = range && range[2] ? +range[2] + 1 : whole.length;
    const b = whole.subarray(from, to);
    const head = { "content-type": TYPES[extname(p)] || "application/octet-stream", "content-length": b.length };
    if (track) Object.assign(head, { "cache-control": "no-store", "accept-ranges": "bytes" });
    if (range) head["content-range"] = `bytes ${from}-${to - 1}/${whole.length}`;
    res.writeHead(range ? 206 : 200, head);
    if (stall && track) {
      res.write(b.subarray(0, Math.max(0, STALL_BYTES - from)));
      hung.add(res);
      res.on("close", () => hung.delete(res));
      return;
    }
    res.end(b);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const problems = [];
const expect = (ok, what) => ok || problems.push(what);
const only = process.argv[2];
const PHONE_UP = { width: 390, height: 844 },
  PHONE_SIDE = { width: 844, height: 390 };
const LINE = "Ugh, that one didn’t load. Tap it to try again.";

async function page({ viewport = { width: 1440, height: 900 }, phone = false } = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "reduce", ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {}) });
  await ctx.route(/formsubmit\.co|api\.netlify|\/__forms/, (r) => r.abort()); // nothing is ever sent
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  return { p, ctx, errors };
}
const loaded = (p) => p.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 240000 });
const open = async (p, hash) => {
  await p.evaluate((h) => (location.hash = h), hash);
  await p.waitForFunction(() => !document.querySelector("#win").hidden, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
};
const close = async (p) => {
  await p.keyboard.press("Escape");
  await p.waitForFunction(() => document.querySelector("#win").hidden, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
};
const playFirst = async (p) => {
  await open(p, "portfolio");
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[0].click());
  await p.waitForFunction(() => [...document.querySelectorAll("#win audio")].some((a) => !a.paused && a.currentTime > 1), null, { timeout: 60000 });
};
const npState = (p) =>
  p.evaluate(() => {
    const np = document.querySelector(".now-playing");
    if (!np) return null;
    const a = np.querySelector("audio");
    return { text: np.querySelector(".np-words").textContent, label: np.querySelector(".np-main").getAttribute("aria-label"), paused: a.paused, t: a.currentTime, err: !!a.error };
  });

// H8. a phone on its side (and a narrow laptop) with a song playing: NOW PLAYING never covers the contact card's boxes or SUBMIT
if (!only || only === "side") {
  for (const [name, opts] of [
    ["a phone on its side", { viewport: PHONE_SIDE, phone: true }],
    ["a laptop window 900 wide", { viewport: { width: 900, height: 560 } }],
  ]) {
    const { p, ctx, errors } = await page(opts);
    await p.goto(url);
    await loaded(p);
    await playFirst(p);
    await close(p);
    expect(!!(await npState(p)), `H8. on ${name} NOW PLAYING did not show after the player closed`);
    await open(p, "contact");
    await p.evaluate(() => {
      for (const b of [document.querySelector("#win .body"), ...document.querySelectorAll("#win .body *")]) b.scrollTop = b.scrollHeight;
    });
    await p.waitForTimeout(800);
    const hits = await p.evaluate(() => {
      const np = document.querySelector(".now-playing")?.getBoundingClientRect();
      if (!np) return ["no NOW PLAYING"];
      const body = document.querySelector("#win .body").getBoundingClientRect();
      const out = [];
      for (const e of document.querySelectorAll("#win input:not([type=hidden]), #win textarea, #win button")) {
        const r = e.getBoundingClientRect();
        // the part of it the card's scrolling boxes show
        let l = Math.max(r.left, body.left),
          rt = Math.min(r.right, body.right),
          t = Math.max(r.top, body.top),
          b = Math.min(r.bottom, body.bottom);
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement)
          if (/auto|scroll|hidden/.test(getComputedStyle(a).overflowY)) {
            const c = a.getBoundingClientRect();
            (l = Math.max(l, c.left)), (rt = Math.min(rt, c.right)), (t = Math.max(t, c.top)), (b = Math.min(b, c.bottom));
          }
        if (rt <= l || b <= t || r.width === 0) continue;
        if (rt > np.left && l < np.right && b > np.top && t < np.bottom) out.push((e.name || e.textContent || e.className).trim().slice(0, 20));
      }
      return out;
    });
    expect(!hits.length, `H8. on ${name}, scrolled to its end, NOW PLAYING lies over the contact card's ${hits.join(", ")}`);
    expect(!errors.length, "H8. page errors: " + errors.join(" | "));
    await ctx.close();
  }
}

// H9. turning the phone while typing the message refits the room, and the box being typed in is on screen; the keyboard
//     alone (the window shorter, as wide) still holds the room still (TYPING ON A PHONE HOLDS THE ROOM STILL)
if (!only || only === "turn") {
  const { p, ctx, errors } = await page({ viewport: PHONE_UP, phone: true });
  await p.goto(url);
  await loaded(p);
  await open(p, "contact");
  await p.evaluate(() => document.querySelector("#win [name=message]").focus());
  await p.keyboard.type("My song is called");
  await p.waitForTimeout(1500);
  const up = await p.evaluate(() => document.querySelector("#stage").getBoundingClientRect().toJSON());
  // the keyboard comes up: shorter, as wide
  await p.setViewportSize({ width: 390, height: 480 });
  await p.waitForTimeout(1500);
  const kb = await p.evaluate(() => document.querySelector("#stage").getBoundingClientRect().toJSON());
  expect(Math.abs(kb.height - up.height) < 2 && Math.abs(kb.width - up.width) < 2, `H9. the keyboard coming up refitted the room: ${up.width}x${up.height} to ${kb.width}x${kb.height}`);
  await p.setViewportSize(PHONE_UP);
  await p.waitForTimeout(800);
  // turned on its side, still typing
  await p.setViewportSize(PHONE_SIDE);
  await p.waitForTimeout(2500);
  await p.keyboard.type(" Night Swim");
  await p.waitForTimeout(800);
  const side = await p.evaluate(() => {
    const s = document.querySelector("#stage").getBoundingClientRect();
    const m = document.querySelector("#win [name=message]");
    const r = m.getBoundingClientRect();
    return { w: s.width, h: s.height, upright: document.body.classList.contains("upright"), focused: document.activeElement === m, value: m.value, top: r.top, bottom: r.bottom, vh: innerHeight };
  });
  expect(side.w > 700 && side.h <= 390 && !side.upright, `H9. turned on its side while typing, the room stayed the upright phone's shape: ${side.w.toFixed(0)}x${side.h.toFixed(0)}, upright ${side.upright}`);
  expect(side.top < side.vh && side.bottom > 0 && side.top >= 0, `H9. the message box is off the screen after the turn: y ${side.top.toFixed(0)} to ${side.bottom.toFixed(0)} of ${side.vh}`);
  expect(side.focused && side.value === "My song is called Night Swim", "H9. the message lost its words or its cursor in the turn: " + JSON.stringify(side.value));
  // and back upright, still typing
  await p.setViewportSize(PHONE_UP);
  await p.waitForTimeout(2500);
  const back = await p.evaluate(() => ({ w: document.querySelector("#stage").getBoundingClientRect().width, upright: document.body.classList.contains("upright") }));
  expect(back.upright && back.w < 400, "H9. turned upright again while typing, the room did not refit: " + JSON.stringify(back));
  expect(!errors.length, "H9. page errors: " + errors.join(" | "));
  await ctx.close();
}

// H12a. a song that won't load from NOW PLAYING's Next says so on NOW PLAYING, shows Play, and a tap tries it again
if (!only || only === "next") {
  const { p, ctx, errors } = await page();
  await p.goto(url);
  await loaded(p);
  await playFirst(p);
  await close(p);
  const drop = (r) => r.abort("internetdisconnected");
  await ctx.route(/assets\/tracks\//, drop);
  await p.evaluate(() => document.querySelector(".now-playing [aria-label='Next song']").click());
  await p.waitForTimeout(5000);
  const failed = await npState(p);
  expect(failed?.text.includes(LINE), "H12. NOW PLAYING said nothing when the next song didn't load: " + JSON.stringify(failed?.text));
  expect(failed?.label === "Play", "H12. NOW PLAYING shows Pause on a song that didn't load: " + failed?.label);
  await ctx.unroute(/assets\/tracks\//, drop);
  await p.evaluate(() => document.querySelector(".now-playing .np-main").click());
  await p.waitForFunction(() => document.querySelector(".now-playing audio")?.currentTime > 0.5, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(500);
  const again = await npState(p);
  expect(again && !again.paused && again.t > 0 && !again.err, "H12. a tap on NOW PLAYING's play once back online did not play it: " + JSON.stringify(again));
  expect(again && !again.text.includes(LINE) && again.label === "Pause", "H12. NOW PLAYING still says it didn't load once it plays: " + JSON.stringify(again));
  expect(!errors.length, "H12. page errors: " + errors.join(" | "));
  await ctx.close();
}

// H12b. a song that stops part way (the signal gone mid-song, no error) says so, in the card and on NOW PLAYING, and a
//       tap carries on from where it stopped
if (!only || only === "stall") {
  const { p, ctx, errors } = await page();
  await p.goto(url);
  await loaded(p);
  stall = true;
  await playFirst(p);
  // it plays what came, then waits for the rest, which never comes
  await p.waitForFunction(() => document.querySelector("#win audio").readyState < 3, null, { timeout: 60000 });
  await p.waitForTimeout(9000);
  const card = await p.evaluate(() => ({
    note: [...document.querySelectorAll("#win .song-note")].filter((n) => !n.hidden).map((n) => n.textContent).join(""),
    deck: window.__nav.deck().playing,
    t: document.querySelector("#win audio").currentTime,
  }));
  expect(card.note === LINE, "H12. a song stopped mid-way said nothing in the card: " + JSON.stringify(card.note));
  expect(!card.deck, "H12. the deck still turns on a song stopped mid-way");
  stall = false;
  for (const r of hung) r.destroy();
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[0].click());
  await p.waitForFunction((t) => document.querySelector("#win audio").currentTime > t + 0.5, card.t, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(500);
  const on = await p.evaluate(() => {
    const a = document.querySelector("#win audio");
    return { paused: a.paused, t: a.currentTime, deck: window.__nav.deck().playing, note: [...document.querySelectorAll("#win .song-note")].some((n) => !n.hidden) };
  });
  expect(!on.paused && on.t > card.t && on.deck && !on.note, `H12. a tap on its sleeve did not carry the stopped song on (stopped at ${card.t.toFixed(1)} s): ` + JSON.stringify(on));
  // and the same in the room, on NOW PLAYING
  stall = true;
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[1].click());
  await p.waitForFunction(() => [...document.querySelectorAll("#win audio")].some((a) => !a.paused && a.currentTime > 1), null, { timeout: 60000 });
  await close(p);
  await p.waitForFunction(() => document.querySelector(".now-playing audio")?.readyState < 3, null, { timeout: 60000 });
  await p.waitForTimeout(9000);
  const np = await npState(p);
  expect(np?.text.includes(LINE) && np?.label === "Play", "H12. a song stopped mid-way in the room left NOW PLAYING looking as if it plays: " + JSON.stringify(np));
  stall = false;
  for (const r of hung) r.destroy();
  await p.evaluate(() => document.querySelector(".now-playing .np-main").click());
  await p.waitForFunction((t) => document.querySelector(".now-playing audio")?.currentTime > t + 0.5, np.t, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(500);
  const np2 = await npState(p);
  expect(np2 && !np2.paused && np2.t > np.t && !np2.text.includes(LINE), "H12. a tap on NOW PLAYING's play did not carry the stopped song on: " + JSON.stringify({ np, np2 }));
  expect(!errors.length, "H12. page errors: " + errors.join(" | "));
  await ctx.close();
}

// H13. Back from CONTACT, opened by a card's HOLY MOLY button, shows that card again: from a link to the card (never leaving
//      the site), and from the room. The X still closes to the room, as it did.
if (!only || only === "back") {
  const where = (p) => p.evaluate(() => ({ href: location.href, hash: location.hash, open: !!document.querySelector("#win") && !document.querySelector("#win").hidden, title: document.querySelector("#win h2")?.textContent || "" }));
  const holyMoly = async (p) => {
    await p.evaluate(() => document.querySelector("#win .words-button.act").click());
    await p.waitForFunction(() => location.hash === "#contact" && !!document.querySelector("#win [name=email]"), null, { timeout: 30000 });
    await p.waitForTimeout(1500);
  };
  const back = async (p) => {
    await p.evaluate(() => history.back()).catch(() => {}); // it may leave the site, which is the hole
    await p.waitForTimeout(4000);
  };
  for (const [name, opts] of [
    ["a laptop", {}],
    ["a phone", { viewport: PHONE_UP, phone: true }],
  ]) {
    // by a link, from another page
    for (const hash of ["artists", "my-people"]) {
      const { p, ctx, errors } = await page(opts);
      await p.goto("about:blank");
      await p.goto(url + "#" + hash);
      await loaded(p);
      await p.waitForFunction(() => !document.querySelector("#win").hidden, null, { timeout: 30000 });
      await p.waitForTimeout(1500);
      const first = (await where(p)).title;
      await holyMoly(p);
      await back(p);
      const at = await where(p);
      expect(at.href.startsWith(url) && at.hash === "#" + hash && at.open && at.title === first, `H13. on ${name}, Back from Contact after a link to #${hash} went to ${JSON.stringify(at)}`);
      // and the card closed with its X goes to the room, still on the site
      if (at.open) {
        await p.evaluate(() => document.querySelector("#win .close").click());
        await p.waitForTimeout(4000);
        const shut = await where(p);
        expect(shut.href.startsWith(url) && !shut.hash && !shut.open, `H13. on ${name}, closing #${hash} after Back went to ${JSON.stringify(shut)}`);
      }
      expect(!errors.length, "H13. page errors: " + errors.join(" | "));
      await ctx.close();
    }
    // from the room
    {
      const { p, ctx, errors } = await page(opts);
      await p.goto("about:blank");
      await p.goto(url + "?open=none");
      await loaded(p);
      await p.evaluate(() => {
        const i = Object.values(window.__nav.ids).indexOf("artists");
        document.querySelectorAll("#things .thing")[i].click();
      });
      await p.waitForFunction(() => !document.querySelector("#win").hidden, null, { timeout: 30000 });
      await p.waitForTimeout(1500);
      const first = (await where(p)).title;
      await holyMoly(p);
      await back(p);
      const at = await where(p);
      expect(at.hash === "#artists" && at.open && at.title === first, `H13. on ${name}, Back from Contact opened from the room's QUOTES went to ${JSON.stringify(at)}`);
      await back(p);
      const room = await where(p);
      expect(room.href.startsWith(url) && !room.hash && !room.open, `H13. on ${name}, Back again went to ${JSON.stringify(room)}, not the room`);
      // and the X on Contact goes straight to the room ("closing never walks back through the windows before it")
      await p.evaluate(() => {
        const i = Object.values(window.__nav.ids).indexOf("artists");
        document.querySelectorAll("#things .thing")[i].click();
      });
      await p.waitForFunction(() => !document.querySelector("#win").hidden && location.hash === "#artists", null, { timeout: 30000 });
      await p.waitForTimeout(1500);
      await holyMoly(p);
      await p.evaluate(() => document.querySelector("#win .close").click());
      await p.waitForTimeout(4000);
      const shut = await where(p);
      expect(shut.href.startsWith(url) && !shut.hash && !shut.open, `H13. on ${name}, the X on Contact went to ${JSON.stringify(shut)}, not the room`);
      expect(!errors.length, "H13. page errors: " + errors.join(" | "));
      await ctx.close();
    }
  }
}

await browser.close();
for (const r of hung) r.destroy();
server.close();
if (problems.length) {
  console.error("HOLES BACK:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("holes of 9 Nov (H8, H9, H12, H13): all closed");
