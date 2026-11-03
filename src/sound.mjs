/* THE ROOM'S SOUNDS. Carl's brief for the site, 5 Oct 2026 (brief/BRIEF.md): "Sound is the signature. I run a music
   business, so objects should make real sounds. Sound must be opt-in with a visible mute toggle, and nothing autoplays
   with audio." And, 2 Nov 2026, of where he puts his sounds to the room's moments: "Personal site's room", on its own
   page beside the garden's sound studio (the admin app's /admin/room-sounds).

   - EVERY SOUND IS HIS. Nothing here makes a sound: no oscillator, no noise, no tone. Each moment plays files he
     uploaded and shaped on that page ("No don't generate any sounds please", Carl, 22 Sept 2026). They arrive as
     `{ moments: { "<moment id>": { plays: [{ key, url or data, at }], ambient } } }`: from `sounds.json` beside
     index.html when the site carries one (each a `url` in the folder), or handed in by the admin page that shows the
     room (a `room-sounds` message, each file's bytes as `data`: the live site's rules let a page fetch from its own
     address only, never a blob: one). `key` names the file, so one file is decoded once. `at` is how
     many ms after its moment a file starts (his delay, and a layer's own); his trim, fades, gain, speed and pitch are
     in the file already, rendered by that page.
   - OFF UNTIL A VISITOR TURNS IT ON, with the garden's sound button (its speaker drawings, components/SoundSetting.tsx
     and GardenEmbed.tsx's corner card, copied into assets/icon-sound-*.webp) in the bottom right corner of the room's card,
     where Carl put it on the room sound quiz ("Bottom right", 2 Nov 2026), over the window's sheet when one is open
     (it was top left, clear of the sheet, until he answered). No sound is made, and no audio is even started, before that
     tap. It shows only when there is a sound to turn on.
   - THE MOMENTS are src/cues.mjs's, each said where it happens (nav.mjs, props.mjs). An ambient one (the candle) runs
     under the room for as long as sound is on.
   - REPEAT THIS MOMENT, for Carl on his page (`room-repeat`, with a moment's id, or none to stop): the camera flies to
     the moment's thing and the room does it again and again, so he hears his sound land on it. While it repeats, the
     room's own player is quiet and the page plays what he is shaping, on each cue the room sends up (`room-cue`). */
import { cue, onCue } from "./cues.mjs";
import { setLid } from "./props.mjs";
import { drawBox } from "./nav.mjs";

const AMBIENT_GAP = 0; // an ambient moment's file runs straight into itself

export function startSound({ nav, props, reduced }) {
  const framed = window.parent !== window;
  const tell = (msg) => framed && window.parent.postMessage(msg, location.origin);
  let moments = {};
  let on = false;
  let ctx = null;
  const buffers = new Map(); // url -> Promise<AudioBuffer|null>
  const beds = new Map(); // moment id -> AudioBufferSourceNode
  let repeating = null;
  // for the tests (studio/tests/nav.mjs, the room sound page's walk): what the room's own player played, as __nav is
  const played = [];
  window.__roomSound = { played, on: () => on, moments: () => Object.keys(moments) };

  /* ---------- the button: the garden's speaker, on a Homegrown card ---------- */
  const stage = document.querySelector("#stage");
  const button = Object.assign(document.createElement("button"), { type: "button", id: "sound", hidden: true });
  // the garden's own name for its sound button (GardenEmbed.tsx, SoundSetting.tsx)
  button.setAttribute("aria-label", "Sounds");
  button.setAttribute("aria-pressed", "false");
  const img = Object.assign(document.createElement("img"), { alt: "", src: "assets/icon-sound-off.webp" });
  img.setAttribute("aria-hidden", "true");
  button.append(img);
  stage?.append(button);
  drawBox(button);
  button.addEventListener("click", () => turn(!on));
  const has = () => Object.values(moments).some((m) => m.plays?.length);
  const showButton = () => (button.hidden = !has());

  function turn(next) {
    on = next;
    button.setAttribute("aria-pressed", String(on));
    img.src = on ? "assets/icon-sound-on.webp" : "assets/icon-sound-off.webp";
    if (on) {
      // the AudioContext is made on the tap itself, never before: nothing starts audio until a visitor asks
      ctx ||= new AudioContext();
      void ctx.resume();
      for (const m of Object.values(moments)) for (const p of m.plays || []) load(p);
    }
    beds_();
  }

  /* ---------- the files ---------- */
  function load(p) {
    const key = p.key || p.url;
    if (!buffers.has(key))
      buffers.set(
        key,
        (p.data ? Promise.resolve(p.data.slice(0)) : fetch(p.url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status)))))
          .then((b) => ctx.decodeAudioData(b))
          .catch(() => null),
      );
    return buffers.get(key);
  }
  async function play(p, when, loop = false) {
    const buf = await load(p);
    if (!buf || !ctx) return null;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = loop;
    if (loop) s.loopEnd = buf.duration + AMBIENT_GAP;
    s.connect(ctx.destination);
    s.start(Math.max(ctx.currentTime, when));
    return s;
  }
  function hear(id) {
    const m = moments[id];
    if (!on || repeating || !ctx || !m?.plays?.length || m.ambient) return;
    const t0 = ctx.currentTime;
    for (const p of m.plays) void play(p, t0 + Math.max(0, p.at || 0) / 1000);
    played.push({ id, at: performance.now() });
  }
  // the ambient moments run while sound is on and nothing is repeating
  function beds_() {
    for (const [id, m] of Object.entries(moments)) {
      const want = on && !repeating && m.ambient && m.plays?.length;
      const had = beds.get(id);
      if (want && !had) {
        beds.set(id, "starting");
        void play(m.plays[0], 0, true).then((s) => {
          if (beds.get(id) === "starting" && s) beds.set(id, s);
          else s?.stop();
        });
      } else if (!want && had) {
        if (had !== "starting") had.stop();
        beds.delete(id);
      }
    }
  }
  function useSounds(next) {
    for (const s of beds.values()) if (s !== "starting") s.stop();
    beds.clear();
    moments = next?.moments || {};
    // a file handed in again under the same key is a new shape of it: decoded afresh
    buffers.clear();
    showButton();
    if (on) turn(true);
  }

  onCue((id, at) => {
    hear(id);
    tell({ type: "room-cue", id, at, repeating: repeating?.id ?? null });
  });

  /* ---------- REPEAT THIS MOMENT ---------- */
  // a thing opened by its click; the mug is a link out, and the Spotify button and the socials are not things at all
  const thingOf = (id) => (id.startsWith("click:") && !["click:mug", "click:spotify", "click:social"].includes(id) ? id.slice(6) : null);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const FLY = reduced ? 300 : 1900;
  const dog = () => props.find((m) => m.userData.prop.id === "dog");
  async function repeat(id) {
    const run = (repeating = id ? { id } : null);
    beds_();
    // what the last one left: a window open, the console open, a light under the pointer
    nav.cueing.hoverOn(null);
    setLid(false);
    // under reduced motion a window opening is a short fade (nav.mjs fly), not a flight a new one replaces: let it land
    if (reduced) await wait(220);
    if (repeating !== run) return;
    if (nav.cueing.isOpen()) {
      nav.cueing.close();
      await wait(FLY);
    }
    if (repeating !== run) return;
    if (!run) return nav.cueing.home();
    const alive = () => repeating === run;
    const thing = thingOf(id);
    if (thing === "book") {
      // a link out: repeated, it would open a tab every time round, so the moment is said without the click
      nav.cueing.look("book");
      await wait(FLY);
      while (alive()) {
        cue("click:book");
        await wait(2400);
      }
    } else if (thing || ["fly-in", "fly-back", "window-open", "window-close"].includes(id)) {
      // a thing opened and closed as a click does: the drum for the flight and the window
      while (alive()) {
        nav.cueing.open(thing || "drum"); // the drum: the frame opens nothing since 3 Nov 2026
        await wait(FLY + 2600);
        if (!alive()) break;
        nav.cueing.close();
        await wait(FLY + 1400);
      }
    } else if (["lift", "panel-open", "panel-close"].includes(id)) {
      nav.cueing.look("console");
      await wait(FLY);
      while (alive()) {
        setLid(true);
        await wait(4200);
        if (!alive()) break;
        setLid(false);
        await wait(4200);
      }
      setLid(false);
    } else if (["record-out", "record-drop", "motor-on", "arm-over", "needle-down", "arm-home", "record-fade", "key:play", "key:stop", "knob-drag"].includes(id)) {
      /* THE TURNTABLE (2 Nov 2026): the portfolio window open over the console, its songs silent, and the moment done
         again and again: a record put on, then the next (which fades the last away), or the keys and the knob worked */
      nav.cueing.open("console");
      await wait(FLY + 2600);
      const P = () => nav.cueing.player();
      P()?.quiet(true);
      let n = 0;
      if (["key:play", "key:stop", "knob-drag"].includes(id) && alive()) {
        P()?.pick(0);
        await wait(9000);
      }
      while (alive()) {
        if (id === "key:play") nav.cueing.key("play");
        else if (id === "key:stop") {
          nav.cueing.key("stop");
          await wait(1800);
          if (!alive()) break;
          nav.cueing.key("play");
        } else if (id === "knob-drag") nav.cueing.scrub([0.25, 0.6, 0.1][n % 3]);
        else P()?.pick(++n % 4);
        await wait(id === "key:play" || id === "knob-drag" ? 2400 : id === "key:stop" ? 6000 : 9000);
      }
      P()?.quiet(false);
    } else if (id === "map-lights") {
      // the map's window opened and closed: its countries light up each time
      while (alive()) {
        nav.cueing.open("map");
        await wait(FLY + 3200);
        if (!alive()) break;
        nav.cueing.close();
        await wait(FLY + 1400);
      }
    } else if (["form-send", "click:spotify", "click:social"].includes(id)) {
      // a button in a window that sends or leaves: its window open, the moment said without pressing it
      nav.cueing.open(id === "click:spotify" ? "console" : "dog");
      await wait(FLY + 2600);
      while (alive()) {
        cue(id);
        await wait(2400);
      }
    } else if (id === "click:mug") {
      // a link out, as the book's
      nav.cueing.look("mug");
      await wait(FLY);
      while (alive()) {
        cue("click:mug");
        await wait(2400);
      }
    } else if (id.startsWith("hover:")) {
      // the light under the pointer, on that thing: each has its own sound (Carl, 2 Nov 2026)
      const on = id.slice(6);
      nav.cueing.look(on);
      await wait(FLY);
      while (alive()) {
        nav.cueing.hoverOn(on);
        await wait(1400);
        nav.cueing.hoverOn(null);
        await wait(1400);
      }
    } else if (id === "blink") {
      nav.cueing.look("dog");
      await wait(FLY);
      while (alive()) {
        const d = dog();
        if (d) d.userData.nextBlink = performance.now();
        await wait(2200);
      }
    } else {
      // the ones that happen on their own: the clock's tick, the candle
      nav.cueing.look({ tick: "clock", candle: "candle" }[id] || "console");
    }
  }

  addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || typeof e.data !== "object") return;
    if (e.data.type === "room-sounds") useSounds(e.data.sounds);
    if (e.data.type === "room-repeat") void repeat(e.data.id || null);
    if (e.data.type === "room-sound-on") turn(!!e.data.on);
  });
  // the site's own sounds, when it carries them; none is no button
  fetch("sounds.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((s) => s && !Object.keys(moments).length && useSounds(s))
    .catch(() => {});

  return {
    // once the room has drawn: the page that shows it may send its sounds and its repeat now
    ready: () => tell({ type: "room-ready" }),
  };
}
