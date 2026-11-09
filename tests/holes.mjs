/* The holes the chief hole-poker found (docs/GODZILLA-2026-11-08.md), each made to happen again on the real page.
   Carl, on its quiz: Fix it, every one, and "a test with every fix". Fails on any hole that comes back.
   Run from the repo root:
     node tests/holes.mjs */
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const { server, url } = serve();
const browser = await chromium.launch();
const problems = [];
const expect = (ok, what) => ok || problems.push(what);

async function page({ reduced = true, viewport = { width: 1440, height: 900 } } = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? "reduce" : "no-preference" });
  const sent = [];
  const errors = [];
  // nothing is really sent: a form's POST is caught here and answered as FormSubmit would
  await ctx.route(/formsubmit\.co/, (r) => (sent.push(r.request().postData()), r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' })));
  await ctx.route(/^http:\/\/[^/]+\/$/, (r) => (r.request().method() === "POST" ? (sent.push(r.request().postData()), r.fulfill({ status: 200, body: "" })) : r.continue()));
  // the page a visitor came from
  await ctx.route("https://before.example/**", (r) => r.fulfill({ contentType: "text/html", body: "<p>the page before</p>" }));
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errors.push(m.text()));
  return { p, ctx, sent, errors };
}
const loaded = (p) => p.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 240000 });
const winOpen = (p) => p.evaluate(() => !document.querySelector("#win").hidden);

// 1. Back pressed while the camera flies to the console: no card opens, and the visitor stays on the site
{
  const { p, ctx } = await page({ reduced: false });
  await p.goto("https://before.example/");
  await p.goto(url + "?open=none");
  await loaded(p);
  await p.waitForTimeout(2500);
  const at = await p.evaluate(() => {
    const r = document.querySelector("#stage").getBoundingClientRect();
    const q = window.__nav.where("console");
    return { x: r.left + ((q[0] + 1) / 2) * r.width, y: r.top + ((1 - q[1]) / 2) * r.height };
  });
  await p.mouse.click(at.x, at.y);
  await p.waitForTimeout(400);
  await p.goBack({ waitUntil: "commit" });
  await p.waitForTimeout(9000);
  expect(p.url().startsWith(url), "1. Back mid-flight left the site: " + p.url());
  if (p.url().startsWith(url)) {
    expect(!(await winOpen(p)), "1. Back mid-flight to the console, and its card opened anyway");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(6000);
    expect(p.url().startsWith(url), "1. closing after Back mid-flight left the site: " + p.url());
  }
  await ctx.close();
}

// 2. a contact message of nothing but spaces does not send
{
  const { p, ctx, sent } = await page();
  await p.goto(url + "#contact");
  await loaded(p);
  await p.waitForTimeout(2000);
  await p.evaluate(() => {
    const set = (n, v) => (document.querySelector(`#win [name=${n}]`).value = v);
    set("first", "   ");
    set("last", "   ");
    set("message", "      ");
    set("email", "someone@example.com");
    document.querySelector("#win button[type=submit]").click();
  });
  await p.waitForTimeout(3000);
  expect(sent.length === 0, "2. a message of only spaces was sent: " + JSON.stringify(sent));
  // and a real one still goes
  await p.evaluate(() => {
    const set = (n, v) => (document.querySelector(`#win [name=${n}]`).value = v);
    set("first", "Pat");
    set("last", "O'Brien");
    set("message", "Hi Carl");
    document.querySelector("#win button[type=submit]").click();
  });
  await p.waitForTimeout(3000);
  expect(sent.length === 1, "2. a real message did not send");
  await ctx.close();
}

// 3. the address in capitals opens its page, and songs changed fast leave no errors behind
{
  const { p, ctx, errors } = await page();
  await p.goto(url + "#PORTFOLIO");
  await loaded(p);
  await p.waitForTimeout(3000);
  const player = () => p.evaluate(() => !document.querySelector("#win").hidden && document.querySelector("#win").dataset.kind === "player");
  expect(await player(), "3. #PORTFOLIO did not open the player");
  if (!(await player())) {
    await p.goto(url + "#portfolio");
    await loaded(p);
    await p.waitForTimeout(3000);
  }
  for (let i = 0; i < 8; i++) {
    await p.evaluate((i) => document.querySelectorAll(".sleeve-pick")[i % 4].click(), i);
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(5000);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(3000);
  for (let i = 0; i < 9; i++) await p.evaluate(() => document.querySelector(".now-playing [aria-label='Next song']")?.click());
  await p.waitForTimeout(2000);
  const played = errors.filter((e) => /play\(\)|interrupted/.test(e));
  expect(played.length === 0, "3. changing songs fast left errors: " + played[0]);
  await ctx.close();
}

// 4. a tap with the small roll a fingertip makes opens its page, and doesn't turn the room under the finger ("it latches
//    to my finger and grabs", Carl, 9 Nov 2026); a real drag still turns it. A phone held upright, where a drag can turn.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(url + "?open=none");
  await loaded(p);
  await p.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const at = await p.evaluate(() => {
    const r = document.querySelector("#stage").getBoundingClientRect();
    const q = window.__nav.where("map");
    return { x: r.left + ((q[0] + 1) / 2) * r.width, y: r.top + ((1 - q[1]) / 2) * r.height };
  });
  const yaw = () => p.evaluate(() => window.__studio.cam.tyaw);
  const y0 = await yaw();
  await touch("touchStart", at.x, at.y);
  for (const d of [3, 6, 10]) await touch("touchMove", at.x + d, at.y + d / 2);
  expect(Math.abs((await yaw()) - y0) < 1e-6, "4. a fingertip's roll on a tap turned the room under it");
  await touch("touchEnd");
  await p.waitForTimeout(7000);
  expect(await p.evaluate(() => location.hash === "#artists" && !document.querySelector("#win").hidden), "4. a tap with a fingertip's roll did not open the map's page");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(4000);
  const y1 = await yaw();
  await touch("touchStart", 300, 600);
  for (let i = 1; i <= 8; i++) await touch("touchMove", 300 - i * 15, 600);
  expect(Math.abs((await yaw()) - y1) > 1e-3, "4. a real drag no longer turns the room");
  await touch("touchEnd");
  await p.waitForTimeout(800);
  expect(await p.evaluate(() => document.querySelector("#win").hidden), "4. a drag opened a page");
  await ctx.close();
}

await browser.close();
server.close();
if (problems.length) {
  console.error("HOLES BACK:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("holes: all closed");
