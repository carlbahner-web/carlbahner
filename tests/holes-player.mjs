/* The player's holes Carl met, 9 Nov 2026: "it was glitching when i left the player page while the audio was still going
   and i was clicking into other pages. also, when i clicked back into the player, it stopped the audio and reset the
   player instead of having the record still playing visually and sonically". Each made to happen again on the real
   page; fails on any that comes back.
   Run from the repo root:
     node tests/holes-player.mjs [again|backmid] */
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const { server, url } = serve();
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const problems = [];
const expect = (ok, what) => ok || problems.push(what);
const only = process.argv[2];

async function page(reduced = true) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
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
// every song on the page, wherever it is: [paused, seconds in]
const songs = (p) => p.evaluate(() => [...document.querySelectorAll("audio")].filter((a) => a.src).map((a) => [a.paused, a.currentTime]));
const playSong = async (p) => {
  await open(p, "portfolio");
  await p.evaluate(() => document.querySelectorAll(".sleeve-pick")[1].click());
  await p.waitForFunction(() => [...document.querySelectorAll("#win audio")].some((a) => !a.paused && a.currentTime > 1), null, { timeout: 30000 });
};

// 1. the player opened again while its song plays on in the room: the song carries on, and its record is on the deck, turning
if (!only || only === "again") {
  const { p, ctx, errors } = await page();
  await p.goto(url);
  await loaded(p);
  await playSong(p);
  await close(p);
  const before = await songs(p);
  expect(before.some(([paused]) => !paused), "1. the song stopped when the player closed: " + JSON.stringify(before));
  await open(p, "portfolio");
  await p.waitForTimeout(1500);
  const after = await songs(p);
  const on = after.filter(([paused]) => !paused);
  expect(on.length === 1, "1. opening the player again did not keep exactly one song playing: " + JSON.stringify(after));
  expect(on[0] && on[0][1] > Math.max(...before.map((s) => s[1])), "1. opening the player again started the song over: " + JSON.stringify({ before, after }));
  const deck = await p.evaluate(() => window.__nav.deck());
  expect(deck.on && deck.playing && deck.armTo === "play", "1. the record is not on the deck, turning: " + JSON.stringify({ on: deck.on, playing: deck.playing, arm: deck.armTo }));
  const state = await p.evaluate(() => [...document.querySelectorAll(".sleeve-pick")].map((b) => b.dataset.state || ""));
  expect(state[1] === "deck", "1. its sleeve does not show its record on the deck: " + JSON.stringify(state));
  const np = await p.evaluate(() => !!document.querySelector(".now-playing"));
  expect(!np, "1. NOW PLAYING is still up with the player open");
  // and the card's own buttons have it: pause pauses it
  await p.evaluate(() => window.__nav.player().play());
  await p.waitForTimeout(500);
  const paused = await songs(p);
  expect(paused.every(([x]) => x), "1. the player's pause did not reach the song it took back: " + JSON.stringify(paused));
  expect(!errors.length, "1. page errors: " + errors.join(" | "));
  await ctx.close();
}

// 2. out of the player with its song going, into another thing and Back while the camera is still flying: the song plays on
if (!only || only === "backmid") {
  const { p, ctx, errors } = await page(false);
  await p.goto(url + "?open=none");
  await loaded(p);
  await playSong(p);
  await close(p);
  await p.waitForTimeout(3000);
  await p.evaluate(() => (location.hash = "bio"));
  await p.waitForTimeout(400);
  await p.evaluate(() => history.back());
  await p.waitForTimeout(4000);
  const after = await songs(p);
  expect(after.some(([paused]) => !paused), "2. Back mid-flight stopped the song playing in the room: " + JSON.stringify(after));
  const np = await p.evaluate(() => document.querySelector(".now-playing .np-main")?.getAttribute("aria-label"));
  expect(np === "Pause", "2. NOW PLAYING does not show the song playing: " + np);
  expect(!errors.length, "2. page errors: " + errors.join(" | "));
  await ctx.close();
}

await browser.close();
server.close();
if (problems.length) {
  console.error("HOLES BACK:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("the player's holes held");
