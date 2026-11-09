/* The four holes the student Godzilla officer found (8 Nov 2026), each made to happen again on the real page, and Carl's
   answers on the merged officers' quiz (https://claude.ai/artifact/L3wsezeEBG1PJnkq35QotX, 9 Nov 2026): "Keep it until
   it's sent", "Catch it", "Fix it: "Ugh, that one didn't load. Tap it to try again."" and "Stop shrinking below a height,
   scroll instead". Fails on any hole that comes back. Nothing is really sent: the form's POST is caught here.
   Run from the repo root:
     node tests/holes-nov9.mjs */
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const { server, url } = serve();
const browser = await chromium.launch();
const problems = [];
const expect = (ok, what) => ok || problems.push(what);
const only = process.argv[2]; // run one: lost, email, song, short

async function page({ viewport = { width: 1440, height: 900 }, phone = false, scale = 1 } = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "reduce", deviceScaleFactor: scale, ...(phone ? { isMobile: true, hasTouch: true } : {}) });
  const sent = [];
  await ctx.route(/formsubmit\.co/, (r) => (sent.push(r.request().postData()), r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' })));
  const p = await ctx.newPage();
  return { p, ctx, sent };
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
const fill = (p, v) =>
  p.evaluate((v) => {
    for (const [n, x] of Object.entries(v)) {
      const f = document.querySelector(`#win [name=${n}]`);
      f.value = x;
      f.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, v);

// 1. a half-written message survives the card closing (the X, Escape, Back), and goes once it is sent
if (!only || only === "lost") {
  const { p, ctx, sent } = await page();
  await p.goto(url);
  await loaded(p);
  await open(p, "contact");
  await fill(p, { first: "Maya", last: "Reyes", email: "maya@example.com", message: "My song is called Night Swim and" });
  await close(p);
  await open(p, "contact");
  const kept = await p.evaluate(() => ["first", "last", "email", "message"].map((n) => document.querySelector(`#win [name=${n}]`).value));
  expect(kept.join("|") === "Maya|Reyes|maya@example.com|My song is called Night Swim and", "1. closing Contact wiped what was typed: " + JSON.stringify(kept));
  // sent, and the next opening starts clean
  await p.evaluate(() => document.querySelector("#win button[type=submit]").click());
  await p.waitForTimeout(3000);
  expect(sent.length === 1, "1. the kept message did not send");
  await close(p);
  await open(p, "contact");
  const after = await p.evaluate(() => document.querySelector("#win [name=message]").value);
  expect(after === "", "1. a sent message came back when Contact opened again: " + after);
  await ctx.close();
}

// 2. an email that can't be replied to is caught, in his words
if (!only || only === "email") {
  const { p, ctx, sent } = await page();
  await p.goto(url);
  await loaded(p);
  await open(p, "contact");
  for (const bad of ["maya@gmail", "maya@gmail.con", "maya@gmail.cmo"]) {
    await fill(p, { first: "Maya", last: "Reyes", email: bad, message: "Hi Carl" });
    await p.evaluate(() => document.querySelector("#win button[type=submit]").click());
    await p.waitForTimeout(1500);
    const msg = await p.evaluate(() => document.querySelector("#win [name=email]").validationMessage);
    expect(msg === "Almost there! Just need your email so I can reply.", `2. "${bad}" was not caught in his words: "${msg}"`);
  }
  expect(sent.length === 0, "2. an email that can't be replied to was sent: " + sent.length);
  await fill(p, { email: "maya@gmail.com" });
  await p.evaluate(() => document.querySelector("#win button[type=submit]").click());
  await p.waitForTimeout(3000);
  expect(sent.length === 1, "2. a good email did not send");
  await ctx.close();
}

// 3. a song tapped while the signal drops plays when tapped again once it is back, and says so meanwhile
if (!only || only === "song") {
  const { p, ctx } = await page();
  await p.goto(url);
  await loaded(p);
  await open(p, "portfolio");
  const drop = (r) => r.abort("internetdisconnected");
  await ctx.route(/assets\/tracks\//, drop);
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[0].click());
  await p.waitForTimeout(6000);
  const said = await p.evaluate(() => [...document.querySelectorAll("#win .song-note")].filter((n) => !n.hidden).map((n) => n.textContent).join(""));
  expect(said === "Ugh, that one didn’t load. Tap it to try again.", "3. nothing said the song didn't load: " + JSON.stringify(said));
  await ctx.unroute(/assets\/tracks\//, drop);
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[0].click());
  await p.waitForTimeout(8000);
  const playing = await p.evaluate(() => {
    const a = document.querySelector("#win audio");
    return { paused: a.paused, t: a.currentTime, err: !!a.error };
  });
  expect(!playing.paused && playing.t > 0 && !playing.err, "3. a second tap once back online did not play: " + JSON.stringify(playing));
  await ctx.close();
}

// 4. the card's words keep a readable size on short screens: a phone on its side, and a laptop zoomed to 200%
if (!only || only === "short") {
  const sizeAt = async (opts) => {
    const { p, ctx } = await page(opts);
    await p.goto(url);
    await loaded(p);
    await open(p, "contact");
    const m = await p.evaluate(() => {
      const label = document.querySelector("#win .form label > span").getBoundingClientRect();
      const x = document.querySelector("#win .close").getBoundingClientRect();
      const win = document.querySelector("#win").getBoundingClientRect();
      return { label: label.height, x: Math.min(x.width, x.height), right: win.right, vw: innerWidth };
    });
    await ctx.close();
    return m;
  };
  const laptop = await sizeAt({});
  const side = await sizeAt({ viewport: { width: 844, height: 390 }, phone: true, scale: 3 });
  const zoomed = await sizeAt({ viewport: { width: 720, height: 450 }, scale: 2 });
  for (const [name, m] of [["a phone on its side", side], ["a laptop at 200%", zoomed]]) {
    expect(m.label >= laptop.label * 0.7, `4. on ${name} the card's words shrink to ${(m.label / laptop.label).toFixed(2)} of a laptop's`);
    expect(m.x >= 40, `4. on ${name} the close X is ${m.x.toFixed(0)}px, too small for a finger`);
    expect(m.right <= m.vw, `4. on ${name} the card runs off the screen`);
  }
}

await browser.close();
server.close();
if (problems.length) {
  console.error("HOLES BACK:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("holes of 8 Nov (second round): all closed");
