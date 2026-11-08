/* Walks the way round the site (studio/NAVIGATION.md) on the real page, at a laptop window and a phone held
   upright, under reduced motion so each step lands at once. Writes a labelled screenshot of each step and
   fails on a page error or a step that did not happen.
   Run from the repo root:
     node studio/tests/nav.mjs [outdir] */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { serve, root } from "./serve.mjs";

const out = process.argv[2] || join(root, "tests", "out", "nav");
await mkdir(out, { recursive: true });
const { server, url } = serve();
const browser = await chromium.launch();
const problems = [];
const expect = (ok, what) => ok || problems.push(what + " " + JSON.stringify(last));
let last = null;

async function walk(name, { width, height, phone = false, query = "" }, steps) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: phone, isMobile: phone, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => problems.push(`${name}: ${e.message}`));
  await page.goto(url + query);
  await page.waitForFunction(() => document.body.classList.contains("loaded"), null, { timeout: 180000 });
  await page.waitForTimeout(800);
  const state = async () => (last = await page.evaluate(() => ({ hash: location.hash, open: !document.querySelector("#win").hidden, kind: document.querySelector("#win").dataset.kind, cursor: document.querySelector("#room").style.cursor, focus: document.activeElement?.getAttribute("aria-label") })));
  let n = 0;
  const shot = async (label) => {
    await page.evaluate((text) => {
      let d = document.querySelector("#test-label");
      if (!d) {
        d = Object.assign(document.createElement("div"), { id: "test-label" });
        Object.assign(d.style, { position: "fixed", left: "12px", bottom: "12px", zIndex: 9, padding: "6px 12px", background: "#2c2c2a", color: "#ede6da", font: "700 16px/1.2 system-ui, sans-serif", borderRadius: "8px", pointerEvents: "none", maxWidth: "calc(100% - 48px)" });
        document.body.append(d);
      }
      d.textContent = text;
    }, `${width}x${height} - ${label}`);
    await page.screenshot({ path: join(out, `${name}-${++n}.png`), timeout: 180000 });
  };
  // a fixed wait, then until the room is still: in the test's software browser a frame can take a second, and a flight
  // that has not quite landed takes no clicks (src/nav.mjs busy)
  const settle = async () => {
    await page.waitForTimeout(4500);
    await page.waitForFunction(() => !window.__nav?.busy?.() || !!document.querySelector("#win:not([hidden])"), null, { timeout: 30000 }).catch(() => {});
  };
  await steps({ page, state, shot, settle });
  await ctx.close();
}

await walk("laptop", { width: 1440, height: 900 }, async ({ page, state, shot, settle }) => {
  await shot("as it opens");
  await page.mouse.move(250, 780);
  await settle();
  expect((await state()).cursor === "pointer", "laptop: the pointer over the console is not a hand");
  await shot("the pointer on the record console");
  await page.mouse.click(250, 780);
  await settle();
  let s = await state();
  expect(s.hash === "#portfolio" && s.kind === "player", "laptop: clicking the console did not open the player");
  await shot("clicked: the portfolio player");
  await page.keyboard.press("Escape");
  await settle();
  s = await state();
  expect(!s.open && s.hash === "", "laptop: Esc did not close the window");
  await shot("Esc: back where it was");
  // where the picture frame stood, the snow globe since 3 Nov 2026: its StudioLand card, and Esc closes it
  await page.mouse.click(292, 505); // the snow globe, in the home angle of 8 Nov 2026
  await settle();
  s = await state();
  expect(s.hash === "#studioland" && s.kind === "page", "laptop: clicking the snow globe did not open StudioLand's card");
  await page.keyboard.press("Escape");
  await settle();
  expect(!(await state()).open, "laptop: Esc did not close StudioLand's card");
  await page.mouse.click(1000, 120);
  await settle();
  expect(!(await state()).open, "laptop: clicking the soffit opened something");
  // the drum opens the bio since 3 Nov 2026 (src/nav.mjs THINGS), and Back closes it
  await page.mouse.click(1080, 790);
  await settle();
  s = await state();
  expect(s.hash === "#bio" && s.kind === "bio", "laptop: clicking the bass drum did not open the bio");
  await shot("clicked the bass drum: the bio");
  await page.goBack();
  await settle();
  expect(!(await state()).open, "laptop: Back did not close the window");
  await page.mouse.click(1080, 790);
  await settle();
  await page.keyboard.press("Escape");
  await settle();
  await page.mouse.click(420, 440); // the dog, in the home angle of 8 Nov 2026
  await settle();
  expect((await state()).hash === "#contact", "laptop: clicking the dog did not open the contact window");
  await shot("clicked the dog: contact");
  await page.keyboard.press("Escape");
  await settle();
  // Tab along the things, left to right as they open, until the console (where it falls depends on his placings)
  for (let i = 0; i < 9 && (await state()).focus !== "Listen"; i++) {
    await page.keyboard.press("Tab");
    await settle();
  }
  s = await state();
  expect(s.focus === "Listen", "laptop: Tab never reached the console (named Listen, his wall word, since 7 Nov 2026)");
  await shot("Tab to the console: its outline in rust");
  await page.keyboard.press("Enter");
  await settle();
  expect((await state()).kind === "player", "laptop: Enter did not open the console's window");
  await page.mouse.click(1300, 150); // the room above the deck: the player's card is on the left
  await settle();
  s = await state();
  expect(!s.open && s.focus === "Listen", "laptop: a click outside did not close, or the focus did not come back");
});

await walk("laptop-link", { width: 1440, height: 900, query: "#bio" }, async ({ state, shot }) => {
  expect((await state()).kind === "bio", "a link to #bio did not open the bio");
  await shot("opened from a link to #bio");
});

await walk("phone-upright", { width: 390, height: 844, phone: true }, async ({ page, state, shot, settle }) => {
  // its own layout since 2 Nov 2026 (src/stage.mjs upright): the room fills the phone, the card's top comes up to the
  // middle, and the card stays there, its words scrolling inside it
  expect(await page.evaluate(() => document.querySelector("#turn").hidden), "phone upright: the turn card is still up");
  await shot("a phone held upright, as it opens");
  // any spot on screen as it opens where a thing can be tapped (the gong, the one wholly on screen, opens nothing since
  // 3 Nov 2026; the drum and the map come in from the sides)
  const pick = await page.evaluate(() => {
    const r = document.querySelector("#stage").getBoundingClientRect();
    for (let y = 0.15; y < 0.85; y += 0.04)
      for (let x = 0.1; x < 0.9; x += 0.04) {
        const hash = window.__nav.at(x * r.width, y * r.height);
        if (hash && !["mug", "book"].includes(hash)) return { hash, x: r.left + x * r.width, y: r.top + y * r.height };
      }
    return null;
  });
  expect(!!pick, "phone upright: no thing to tap is on screen as it opens");
  if (pick) await page.touchscreen.tap(pick.x, pick.y);
  await settle();
  expect(pick && (await state()).hash === "#" + pick.hash, "phone upright: tapping a thing did not open its window");
  await shot("tapped a thing: its window's top at the middle");
  await page.keyboard.press("Escape");
  await settle();
  await page.evaluate(() => (location.hash = "#bio")); // the bio, the longest, from a link
  await settle();
  expect((await state()).kind === "bio", "phone upright: a link to #bio did not open the bio");
  const top = await page.evaluate(() => document.querySelector("#win").getBoundingClientRect().top);
  expect(Math.abs(top - 844 * 0.35) < 30, "phone upright: the card does not start 35% down (it takes the bottom 65%, src/stage.mjs UPRIGHT_CARD)");
  await shot("the bio, its top at the middle");
  // pinned since 3 Nov 2026: the card stays where it is and its words scroll inside it, the room above in sight
  const r0 = await page.evaluate(() => document.querySelector("#win").getBoundingClientRect());
  await page.mouse.move(195, 700);
  await page.mouse.wheel(0, 300);
  await settle();
  const after = await page.evaluate(() => ({ top: document.querySelector("#win").getBoundingClientRect().top, scrolled: document.querySelector("#win .body").scrollTop }));
  expect(Math.abs(after.top - r0.top) < 2, "phone upright: scrolling moved the card instead of its words");
  expect(after.scrolled > 100, "phone upright: the card's words did not scroll");
  await shot("scrolled: the card's words, the card where it was");
});

await walk("phone-sideways", { width: 844, height: 390, phone: true }, async ({ page, state, shot, settle }) => {
  expect(await page.evaluate(() => document.querySelector("#turn").hidden), "phone on its side: the turn card is still up");
  await shot("the phone on its side, as it opens");
  const at = await page.evaluate(() => {
    const s = window.__nav.where("console");
    const r = document.querySelector("#stage").getBoundingClientRect(); // the room's card (src/stage.mjs)
    return [r.left + ((s[0] + 1) / 2) * r.width, r.top + ((1 - s[1]) / 2) * r.height];
  });
  await page.touchscreen.tap(Math.max(20, at[0]), Math.min(370, at[1]));
  await settle();
  expect((await state()).hash === "#portfolio", "phone on its side: tapping the console did not open the player");
  await shot("tapped the console: the player down the right half");
  // the close button where it is: inside the room's 16:9 card since 1 Nov 2026 (src/stage.mjs)
  const shut = await page.evaluate(() => { const r = document.querySelector("#win .close").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await page.touchscreen.tap(shut[0], shut[1]);
  await settle();
  expect(!(await state()).open, "phone on its side: the close button did not close");
});

await browser.close();
server.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("all steps held; written to", out);
