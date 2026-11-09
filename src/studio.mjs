/* The studio: the corner in 3D (src/room.mjs), with the paper garden's camera habits
   (Carl, 5 Oct 2026, asked how he wanted to move round it: "like the garden").

   - DRAG moves you through the room, the drawing under the pointer staying under it, as dragging
     the garden does.
   - THE WHEEL (or a trackpad pinch, or + and -) steps between three distances, near, close and
     far, and the camera travels there: the garden's zoom is "a toggle not a free variable
     control" (Carl, 30 Sept 2026, garden/src/template.html PAPER_FAR_W). The arrow keys move.
   - THE CAMERA eases at the garden's 3.2 a second (1 - e^(-3.2 dt)), with the garden's 26 degree
     lens (PAPER_FOV), and jumps rather than travels under reduced motion.
   - THE BOIL is the garden's clock: the edges' three wobbles shown 0,1,2,1 every 130 ms, the
     middle one held under reduced motion.

   Laptop only for now (Carl, 5 Oct 2026: "dont do phone yet"). */
import { view, fitStage, upright } from "./stage.mjs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  CanvasTexture,
  NoColorSpace,
  LinearMipmapLinearFilter,
} from "../vendor/three-garden.js";
import {
  buildRoom,
  ROOM,
  LINE,
  GRAIN_M,
  GRAIN_K,
  EDGES,
  inkColor,
  PAINT,
  setPaint,
} from "./room.mjs";
import { hashN, BOIL_ORDER, BOIL_MS } from "./garden-bits.mjs";
import { buildProps, setProp, faceProps, setLeanBack, tickProps, colorProp, follows, followers, lampLights, lidAt, picturesIn, phoneProps, buildHoverWords, buildAllWords, consoleFront, setWordsAnisotropy } from "./props.mjs";
import { LIGHTS, lightUniforms, setLights } from "./light.mjs";
import { startNav, SAYS } from "./nav.mjs";
import { startViews, stepViews, editViews, cameraFor } from "./viewtune.mjs";
import { editWords } from "./wordtune.mjs";
import { startSound } from "./sound.mjs";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FOV = 26;
const STOPS = { near: 6.5, close: 11.2, far: 18 }; // what each zoom frames, as a distance from the corner in metres
const ORDER = ["near", "close", "far"];
const EYE = { y: ROOM.h / 2 };

const cv = document.querySelector("#room");
const renderer = new WebGLRenderer({ canvas: cv, antialias: true });
// a phone upright draws at 1.5 of its pixels at most, a whole screen of the room's shaders being a lot for a phone
renderer.setPixelRatio(Math.min(innerHeight > innerWidth ? 1.5 : 2, devicePixelRatio || 1));
setWordsAnisotropy(renderer.capabilities.getMaxAnisotropy()); // the words sharp at a slant (props.mjs)
const scene = new Scene();
const camera = new PerspectiveCamera(FOV, 1, 0.1, 200);

// the grain: flat middle grey (no grain) until the tile arrives, then the tile, repeated mirrored
const grey = Object.assign(document.createElement("canvas"), { width: 1, height: 1 });
grey.getContext("2d").fillStyle = "#808080";
grey.getContext("2d").fillRect(0, 0, 1, 1);
const tex = (src) => {
  const t = new CanvasTexture(src);
  t.colorSpace = NoColorSpace;
  t.wrapS = t.wrapT = 1002; // three.js's MirroredRepeatWrapping, as the garden uses it
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy(); // the floor and ceiling are seen edge-on: without it their grain smears
  return t;
};
const ph = new Array(EDGES * 3).fill(0);
let linePx = LINE.px; // the room's lines, in screen px; his panel's Room lines slider changes it
const shared = {
  grain: { value: tex(grey) },
  grainM: { value: GRAIN_M },
  grainK: { value: GRAIN_K },
  ink: { value: inkColor() },
  ph: { value: ph },
  boil: { value: 1 }, // which of the boil's three drawings is showing, for the decorations
  /* how strongly the decorations boil, 1 the garden's strength. Half: "It's a little too much tbh but
     I can't find any boil controls" (Carl, 5 Oct 2026), so it is also his panel's Boil slider. */
  boilK: { value: 0 }, // then he set it to none and saved (5 Oct 2026)
  waves: { value: LINE.waves },
  wander: { value: LINE.wander },
  linePx: { value: 0 }, // set every frame from linePx, in this screen's own pixels
  dark: { value: LINE.dark },
  navRest: { value: 0 }, // how much the things you can open boil at rest (src/nav.mjs)
  navLook: { value: 0 }, // how the one under the pointer shows it: 0 boil, 1 light, 2 ink
  ...lightUniforms(),
};
for (const m of buildRoom(shared)) scene.add(m);
/* NOTHING TAKES A CLICK UNDER THE LOADING SCREEN: "it accepts clicks during the loading screen, which makes it glitch out"
   (Carl, 8 Nov 2026). Until the screen lifts (body.loaded), every press, wheel, key and touch is stopped before the room,
   its cards or its buttons hear it. */
for (const type of ["pointerdown", "pointerup", "pointermove", "click", "dblclick", "contextmenu", "wheel", "keydown", "keyup", "touchstart", "touchmove", "gesturestart", "gesturechange"])
  addEventListener(
    type,
    (e) => {
      // and once the flyover is nearly home, not only when it is still (NEARLY HOME IS HOME)
      if (document.body.classList.contains("loaded") && OPENING.k <= 1 - NEARLY_HOME) return;
      e.stopImmediatePropagation();
      if (e.cancelable && type !== "pointermove" && type !== "keyup") e.preventDefault();
    },
    { capture: true, passive: false },
  );
// the page is ready once the grain and every decoration have arrived (or failed to)
let waiting = 1;
function loaded() {
  dirty = true;
  if (--waiting === 0) {
    document.body.classList.add("ready");
    // one drawing of the room first, so every decoration stands where it is before a window may open
    requestAnimationFrame(() => requestAnimationFrame(() => (nav.whenReady(), sound.ready())));
    // and the loading screen lifts once the rest is in too: the fonts, the turntable's and the clock's pieces (index.html
    // THE LOADING SCREEN), or after 8 s whatever has not come
    const rest = [document.fonts?.ready, picturesIn(), ...[...document.querySelectorAll("img")].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))];
    Promise.race([Promise.all(rest), new Promise((r) => setTimeout(r, 8000))]).then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => (document.body.classList.add("loaded"), startOpening()))),
    );
  }
}
const grainImg = new Image();
grainImg.onload = () => {
  const was = shared.grain.value;
  shared.grain.value = tex(grainImg);
  was.dispose();
  dirty = true;
  loaded();
};
grainImg.onerror = loaded;
grainImg.src = "assets/paper-grain.webp";

// each edge's three bends get their own phase in each of the three drawings
/* The Boil slider moves the room's lines too ("Room boil all the way down seems to only stop the items
   not the wall etc", Carl, 5 Oct 2026): each drawing's phases are drawn toward the middle drawing's by
   how far the slider is below where the room boils as built (0.5), so at 0 the lines hold still in
   their ripple, and above 0.5 they move as built. */
function boilPhases(frame) {
  const k = Math.min(1, shared.boilK.value / 0.5);
  for (let e = 0; e < EDGES; e++)
    for (let j = 0; j < 3; j++) {
      const still = hashN(e * 7 + j, 31 + 13) * Math.PI * 2,
        moving = hashN(e * 7 + j, 31 + frame * 13) * Math.PI * 2;
      ph[e * 3 + j] = still + (moving - still) * k;
    }
}

/* ---------- the camera ---------- */
/* THE CAMERA STANDS STILL AND TURNS (Carl, 5 Oct 2026: "the camera should be fixed, so dragging
   moves the angle it's looking not moving the camera itself"). It stands where the opening view
   puts it, at eye height on the room's diagonal, STAND metres from the corner. Dragging turns its
   head, the wall under the pointer staying under it; the zoom stops change the lens instead of the
   distance, framing what the near, close and far distances framed. */
const STAND = STOPS.close;
const lensFor = (d) =>
  (2 * Math.atan(Math.tan(((FOV / 2) * Math.PI) / 180) * (d / STAND)) * 180) / Math.PI;
const LENS = { near: lensFor(STOPS.near), close: FOV, far: lensFor(STOPS.far) };
const HEADING = Math.atan2(-1, -1); // facing the corner along the diagonal
const TURN = { yaw: 0.6, pitch: 0.35 }; // how far it turns each way, in radians: the corner stays in reach
/* THE OPENING VIEW is the one Carl chose and saved with the panel's Save, his phone turned sideways
   (5 Oct 2026, Sway picked): "This is what the opening laptop view should be." The chair in the
   middle, the soffit across the top, a strip of floor. Earlier: one framed on the phone held upright,
   tilted down onto the chair, and before that a hair down and right at 15.7 degrees with Turn.
   `fov` is what it frames from STAND; Sway's camera stands closer and widens to match (lensAt). */
// then zoomed to his widest, his saved widest shot: "let's use the saved widest shot as the new opening shot. that
// makes it way easier" (Carl, 6 Oct 2026)
const ARRANGING = false; // the arranging panel, switched off (THE ARRANGING PANEL, below)
/* then turned left to his screenshot, the clock and the whole map in, the drum at the right edge: "can we try to make
   this the new "home" angle?" (Carl, 8 Nov 2026). Matched by rendering against his picture; yaw was -0.0726. The left
   limit moved out with it (LIMITS.left), so the view can rest there. */
const START = { yaw: 0.135, pitch: 0.0398, fov: 17.831 };
const cam = { ...START, tyaw: START.yaw, tpitch: START.pitch, tfov: START.fov };
// where the camera stands for the opening view, and the point that view looks at, STAND metres on
const EYE0 = { x: STAND * Math.SQRT1_2, y: EYE.y, z: STAND * Math.SQRT1_2 };
const lookDir = (yaw, pitch) => [
  Math.sin(HEADING + yaw) * Math.cos(pitch),
  Math.sin(pitch),
  Math.cos(HEADING + yaw) * Math.cos(pitch),
];
/* The point the camera walks round, from the first opening view (a hair down and right), not from
   START: worked out from START it moved whenever the opening view did, and his view tilted down onto
   the chair put it under the floor. */
const REF = { yaw: -0.016, pitch: -0.015 };
const D0 = lookDir(REF.yaw, REF.pitch);
const AIM = { x: EYE0.x + D0[0] * STAND, y: EYE0.y + D0[1] * STAND, z: EYE0.z + D0[2] * STAND };

/* THREE WAYS TO MOVE, TO TRY (Carl, 5 Oct 2026, of the camera that only turns: "i feel like we don't
   get the 2.5d perspective when i move the camera. it feels like a flat painted surface instead of a
   three.js room"; shown why - a camera that only turns moves nothing near against anything far - and
   offered two ways for it to move: "id like to see it"). A drag turns the view the same in all three;
   what differs is how much of that turn the camera makes by walking round the corner instead of
   turning its head (`walk`, 0 to 1), and how far from the corner it stands (`stand`, metres). Turn was
   his earlier ruling ("the camera should be fixed, so dragging moves the angle it's looking not moving
   the camera itself"); he picked Sway and saved it. Sway and Swing stand closer with a wider lens. */
const MODES = {
  turn: { walk: 0, stand: STAND },
  sway: { walk: 0.35, stand: 6 },
  swing: { walk: 1, stand: 6 },
};
// Sway is what Carl picked and saved ("Try now", 5 Oct 2026); the other two stay on his panel to try
let mode = "sway";
// the lens that frames, from `stand` metres, what `fov` frames from STAND
const lensAt = (fov, stand) =>
  (2 * Math.atan((Math.tan((fov * Math.PI) / 360) * STAND) / stand) * 180) / Math.PI;
camera.position.set(EYE0.x, EYE0.y, EYE0.z);
const props = buildProps(shared, { ...EYE0 }, loaded);
waiting +=
  props.length +
  props.filter((m) => m.userData.prop.parts).length +
  props.filter((m) => m.userData.prop.rearLeg).length;
for (const m of props) scene.add(m);
scene.add(buildHoverWords()); // the words on the teal wall under the pointer (props.mjs WORDS ON THE TEAL WALL)

/* THE ARRANGING PANEL, a tool for Carl while the room is arranged, not part of the site (Carl, 5 Oct
   2026: "Can you give me the ability to resize it?", then "it's too far back"). Two sliders a
   decoration, its size and how far forward it stands; Save keeps both in the page's database at
   props/<id>, where the session reads them back and writes them into PROPS. Until then the page
   opens with what was saved, so a setting he has kept stays. Shown only to someone who can edit. */
(async () => {
  /* GONE, 1 Nov 2026: "I need the notes/editor modal thing removed" (Carl). Everything he had saved on it was
     written into PROPS, LIGHTS and PAINT the same day, so the room he sees is the room every visitor sees. The panel's
     code stays below, unrun, should a decoration ever need arranging again. */
  if (!ARRANGING) return;
  const [db, user] = await Promise.all(
    [window.claude?.use?.("db"), window.claude?.use?.("user")].map((p) =>
      Promise.resolve(p).catch(() => null),
    ),
  );
  if (!db || !(user?.canEdit() ?? false)) return;
  document.body.classList.add("slot-names"); // the windows' empty spaces show their names to him alone
  const panel = document.querySelector("#arrange");
  // his camera limits as saved, and off while he sets them (THE CAMERA'S LIMITS)
  try {
    const c = await db.doc("settings/camera").get();
    const d = c.exists ? c.data() : null;
    // `places`; the earlier saves (`limits`, `edges`) held turns, not places, and are not read
    const pl = d && d.places;
    for (const k of ["left", "right", "top", "bottom"]) if (pl && Array.isArray(pl[k]) && pl[k].length === 3) LIMITS[k] = pl[k];
    for (const k of ["close", "wide"]) if (pl && typeof pl[k] === "number") LIMITS[k] = pl[k];
    if (pl && typeof pl.wide === "number" && lensK !== 1) LIMITS.wide = scaleLens(LIMITS.wide, lensK); // a saved one is for 16:9
  } catch {
    /* nothing saved: keep LIMITS */
  }
  limitsOn = false;
  /* ONE ELEMENT AT A TIME (Carl, 5 Oct 2026: "can we hide those settings so I'm only working on one
     element at a time?"). Every row belongs to a group, and a menu at the top of the panel shows one
     group: the newest decoration to begin with, then whatever he picked last on that device. */
  let group = "";
  const groups = [];
  let groupLabel = "";
  const startGroup = (id, label) => {
    group = id;
    groupLabel = label;
    groups.push([id, label]);
  };
  const addRow = (row) => {
    row.dataset.group = group;
    // the menu already says which element: each row is named by its control alone ("Size", not "Lamp size")
    const t = row.firstChild;
    if (t && t.nodeType === 3 && groupLabel && t.textContent.startsWith(groupLabel + " ")) {
      const rest = t.textContent.slice(groupLabel.length + 1);
      t.textContent = rest[0].toUpperCase() + rest.slice(1);
    }
    panel.insertBefore(row, panel.lastElementChild);
  };
  const slider = (id, label, min, max, value, set, step = 0.05) => {
    const row = document.createElement("label");
    row.textContent = label;
    const input = Object.assign(document.createElement("input"), {
      type: "range",
      min,
      max,
      step,
      value,
      id,
    });
    input.addEventListener("input", () => {
      set(+input.value);
      dirty = true;
    });
    row.append(input);
    addRow(row);
  };
  /* The camera is no longer saved or read here. Save kept the view the camera happened to be at, so
     saving the pillow on his phone replaced the laptop opening view he had chosen ("This is what the
     opening laptop view should be"). The opening view is START, in this file. */
  try {
    const l = await db.doc("settings/look").get();
    const d = l.exists ? l.data() : null;
    if (d && typeof d.grain === "number") shared.grainK.value = d.grain;
    if (d && typeof d.line === "number") linePx = d.line;
    if (d && typeof d.boil === "number") shared.boilK.value = d.boil;
  } catch {
    /* nothing saved: keep GRAIN_K */
  }
  startGroup("room", "Room");
  slider("grain", "Grain", 0, 1, shared.grainK.value, (v) => (shared.grainK.value = v));
  slider("line", "Room lines", 1, 8, linePx, (v) => (linePx = v), 0.25);
  slider(
    "boil",
    "Boil",
    0,
    2,
    shared.boilK.value,
    (v) => {
      shared.boilK.value = v;
      shown = -1; // redraw the room's lines at the new strength
    },
    0.05,
  );
  // the lights (LIGHT, light.mjs): the room's own, with its switch and dimmer, the lamp's, and the corner's glow
  try {
    const l = await db.doc("settings/light").get();
    const d = l.exists ? l.data() : null;
    for (const k of ["lamp", "glow"])
      for (const f of ["strength", "size", "warmth"])
        if (d && d[k] && typeof d[k][f] === "number") LIGHTS[k][f] = d[k][f];
    if (d && typeof d.ambient === "number") LIGHTS.ambient = d.ambient;
    if (d && typeof d.roomOn === "boolean") LIGHTS.roomOn = d.roomOn;
    if (d && typeof d.roomWarmth === "number") LIGHTS.roomWarmth = d.roomWarmth;
    if (d && typeof d.bulbs === "number") LIGHTS.bulbs = d.bulbs;
    if (d && typeof d.bulbSize === "number") LIGHTS.bulbSize = d.bulbSize;
    if (d && typeof d.bulbFace === "number") LIGHTS.bulbFace = d.bulbFace;
    if (d && typeof d.bulbColor === "string") LIGHTS.bulbColor = d.bulbColor;
    if (d && typeof d.lampLift === "number") LIGHTS.lampLift = d.lampLift;
  } catch {
    /* nothing saved: keep LIGHTS */
  }
  startGroup("light", "Light");
  // the room's lights: a switch, and a dimmer for when they are on
  const sw = document.createElement("div");
  sw.className = "modes";
  sw.textContent = "Room lights";
  const swBtn = Object.assign(document.createElement("button"), { type: "button", id: "room-switch" });
  const showSwitch = () => {
    swBtn.textContent = LIGHTS.roomOn ? "On" : "Off";
    swBtn.setAttribute("aria-pressed", String(LIGHTS.roomOn));
  };
  showSwitch();
  swBtn.addEventListener("click", () => {
    LIGHTS.roomOn = !LIGHTS.roomOn;
    showSwitch();
    dirty = true;
  });
  sw.append(swBtn);
  addRow(sw);
  slider("room-warmth", "Warmth", 0, 1, LIGHTS.roomWarmth, (v) => (LIGHTS.roomWarmth = v));
  slider("ambient", "Dimmer", 0.15, 1, LIGHTS.ambient, (v) => {
    LIGHTS.ambient = v;
    LIGHTS.roomOn = true; // a dimmer turned turns the lights on
    showSwitch();
  });
  for (const [k, name] of [
    ["lamp", "Lamp"],
    ["glow", "Corner glow"],
  ]) {
    slider(k + "-strength", name + " strength", 0, 5, LIGHTS[k].strength, (v) => (LIGHTS[k].strength = v));
    slider(k + "-size", name + " size", 0.2, 5, LIGHTS[k].size, (v) => (LIGHTS[k].size = v));
    slider(k + "-warmth", name + " warmth", 0, 1, LIGHTS[k].warmth, (v) => (LIGHTS[k].warmth = v));
    if (k === "lamp") {
      slider("bulbs", "Bulbs", 0, 1, LIGHTS.bulbs, (v) => (LIGHTS.bulbs = v));
      slider("bulb-size", "Bulb size", 0.1, 2, LIGHTS.bulbSize, (v) => (LIGHTS.bulbSize = v));
      // the inside of each shade, its own colour and brightness ("a separate control please")
      slider("lamp-lift", "Lamp light height", -0.3, 0.6, LIGHTS.lampLift, (v) => (LIGHTS.lampLift = v), 0.01);
      slider("bulb-face", "Bulb brightness", 0, 2, LIGHTS.bulbFace, (v) => (LIGHTS.bulbFace = v), 0.01);
      const row = document.createElement("label");
      row.textContent = "Bulb colour";
      const pick = Object.assign(document.createElement("input"), { type: "color", value: LIGHTS.bulbColor, id: "bulb-color" });
      pick.addEventListener("input", () => {
        LIGHTS.bulbColor = pick.value;
        dirty = true;
      });
      row.append(pick);
      addRow(row);
    }
  }
  // the arch and the panel on the cream wall: width, height and left/right, in metres
  try {
    const w = await db.doc("settings/paint").get();
    const d = w.exists ? w.data() : null;
    for (const k of ["arch", "panel"])
      if (d && d[k]) {
        const keep = {};
        for (const f of ["x", "w", "top"]) if (typeof d[k][f] === "number") keep[f] = d[k][f];
        setPaint(k, keep);
      }
  } catch {
    /* nothing saved: keep PAINT */
  }
  startGroup("wall", "Wall shapes");
  for (const [k, label] of [
    ["arch", "Arch"],
    ["panel", "Panel"],
  ]) {
    const set = (f) => (v) => setPaint(k, { [f]: v });
    slider(k + "-w", label + " width", 0.2, 2, PAINT[k].w, set("w"), 0.01);
    slider(k + "-top", label + " height", 0.3, ROOM.h, PAINT[k].top, set("top"), 0.01);
    slider(k + "-x", label + " left / right", 0, 4, PAINT[k].x, set("x"), 0.01);
  }
  // each decoration's controls: size and forward for one on the floor, place and tilt for one riding on another
  const NUMS = [
    "w",
    "fwd",
    "side",
    "up",
    "tilt",
    "depth",
    "x",
    "y",
    "along",
    "lift",
    "lean",
    "alongTeal",
    "wide",
    "neck",
    "spin",
    "follow",
    "z",
    "turn",
    "long",
    "soft",
    "inset",
    "titleSize",
    "titleAlong",
    "titleUp",
    "titleOpacity",
    "raise",
    "slide",
    "taper",
    "glass",
    "flame",
    ...["hour", "minute", "second"].flatMap((h) => [h + "X", h + "Y", h + "K"]),
  ];
  for (const mesh of props) {
    const p = mesh.userData.prop;
    if (follows(p)) continue; // a lamp shade or the gong's strings: placed and painted by its parent
    try {
      const snap = await db.doc("props/" + p.id).get();
      const d = snap.exists ? snap.data() : null;
      if (d) {
        const keep = {};
        for (const k of NUMS) if (typeof d[k] === "number" && k in p) keep[k] = d[k];
        if (typeof d.flip === "boolean") keep.flip = d.flip;
        setProp(mesh, keep);
        // colours saved by swatch; the chair's first save kept one colour, which is its fabric
        const saved = d.colors || (typeof d.color === "string" ? { fabric: d.color } : {});
        for (const [id, hex] of Object.entries(saved))
          if (typeof hex === "string") colorProp(mesh, id, hex);
      }
    } catch {
      /* nothing saved, or not readable: keep what PROPS says */
    }
    startGroup(p.id, p.label);
    const set = (k) => (v) => setProp(mesh, { [k]: v });
    if (p.neck == null)
      slider("size-" + p.id, p.label + (p.floor ? " width" : " size"), 0.1, p.floor ? 5 : 4, p.w, set("w"), 0.01);
    /* THE CLOCK'S HANDS, each nudged and sized on its own, and a button that turns the camera onto the clock
       and zooms right in to see them: "Can you let me zoom in on it and fine tune each hand?" (Carl, 6 Oct 2026) */
    if ("hourK" in p) {
      const zr = document.createElement("div");
      zr.className = "modes";
      const zb = Object.assign(document.createElement("button"), { type: "button", textContent: "Zoom in", id: "zoom-" + p.id });
      zb.addEventListener("click", () => lookClosely(mesh));
      const ob = Object.assign(document.createElement("button"), { type: "button", textContent: "Zoom out", id: "unzoom-" + p.id });
      ob.addEventListener("click", () => {
        Object.assign(cam, { tyaw: START.yaw, tpitch: START.pitch, tfov: START.fov });
        dirty = true;
      });
      zr.append(zb, ob);
      addRow(zr);
      for (const h of ["hour", "minute", "second"]) {
        slider(h + "X-" + p.id, h + " hand left / right", -0.06, 0.06, p[h + "X"], set(h + "X"), 0.001);
        slider(h + "Y-" + p.id, h + " hand up / down", -0.06, 0.06, p[h + "Y"], set(h + "Y"), 0.001);
        slider(h + "K-" + p.id, h + " hand size", 0.5, 1.5, p[h + "K"], set(h + "K"), 0.01);
      }
    }
    if ("flame" in p) slider("flame-" + p.id, p.label + " flame size", 0.05, 0.6, p.flame, set("flame"), 0.01);
    if ("glass" in p) slider("glass-" + p.id, p.label + " glass", 0, 1, p.glass, set("glass"), 0.01);
    if (p.neck != null) {
      slider("neck-" + p.id, p.label + " turn", -60, 60, p.neck, set("neck"), 1);
    } else if (p.floor) {
      slider("long-" + p.id, p.label + " length", 0.4, 2.5, p.long, set("long"), 0.01);
      slider("x-" + p.id, p.label + " left / right", 0, 5, p.x, set("x"), 0.01);
      slider("z-" + p.id, p.label + " forward / back", 0, 5, p.z, set("z"), 0.01);
      slider("depth-" + p.id, p.label + " depth", 0.002, 0.1, p.depth, set("depth"), 0.001);
      slider("soft-" + p.id, p.label + " soften", 0, 1, p.soft, set("soft"), 0.01);
      // square to the walls always: a quarter turn at a time
      const rot = document.createElement("div");
      rot.className = "modes";
      const rb = Object.assign(document.createElement("button"), { type: "button", textContent: "Rotate 90°", id: "rotate-" + p.id });
      rb.addEventListener("click", () => {
        setProp(mesh, { turn: (p.turn + 90) % 180 });
        dirty = true;
      });
      rot.append(rb);
      addRow(rot);
    } else if (p.wall) {
      if (p.wall === "teal")
        // dragged right moves it right as you look, toward the corner, as the console's does
        slider("x-" + p.id, p.label + " left / right", 0, 4, 4 - p.x, (v) => setProp(mesh, { x: 4 - v }), 0.01);
      else slider("x-" + p.id, p.label + " left / right", 0, 4, p.x, set("x"), 0.01);
      slider("y-" + p.id, p.label + " up / down", -0.6, ROOM.h, p.y, set("y"), 0.01);
      if (p.disc || p.outline || p.layers)
        slider("depth-" + p.id, p.label + " depth", 0.005, p.layers ? 0.15 : 0.25, p.depth, set("depth"), 0.005);
    } else if (p.box || p.atop) {
      /* THE BOOK AND THE DOG, each on its own ("Ok fully unlink the book and dog please", Carl, 5 Oct
         2026): each stands on the console's top, Left / right the way it is dragged and end to end on it
         ("I can't go far enough right"), Front / back across it. */
      const C = props.find((m) => m.userData.prop.id === p.on).userData.prop,
        len = Math.round(C.w * (C.wide ?? 1) * 100) / 100,
        half = Math.round(((p.box ? p.w : p.w * 0.6) / 2) * 100) / 100;
      slider("along-" + p.id, p.label + " left / right", -(len - half), -half, -p.along, (v) => setProp(mesh, { along: -v }), 0.01);
      slider("inset-" + p.id, p.label + " front / back", 0, Math.round((C.depth || 0.5) * 100) / 100, p.inset, set("inset"), 0.01);
      if (p.box) {
        slider("spin-" + p.id, p.label + " spin", -90, 90, p.spin, set("spin"), 1);
        // the title on its spine: how big, where along and up it, how strong
        slider("title-size", "Title size", 0.1, 1, p.titleSize, set("titleSize"), 0.01);
        slider("title-along", "Title left / right", -0.5, 0.5, p.titleAlong, set("titleAlong"), 0.01);
        slider("title-up", "Title up / down", -0.5, 0.5, p.titleUp, set("titleUp"), 0.01);
        slider("title-opacity", "Title opacity", 0, 1, p.titleOpacity, set("titleOpacity"), 0.01);
      } else {
        slider("up-" + p.id, p.label + " up / down", -0.1, 0.5, p.up, set("up"), 0.005);
        slider("tilt-" + p.id, p.label + " tilt", -45, 45, p.tilt, set("tilt"), 1);
        slider("follow-" + p.id, p.label + " turns to you", 0, 1, p.follow, set("follow"), 0.05);
      }
    } else if (p.on) {
      slider("side-" + p.id, p.label + " left / right", -1, 1, p.side, set("side"), 0.01);
      slider("up-" + p.id, p.label + " up / down", 0, 1.5, p.up, set("up"), 0.01);
      slider("tilt-" + p.id, p.label + " tilt", -45, 45, p.tilt, set("tilt"), 1);
      slider("depth-" + p.id, p.label + " depth", 0.01, 0.8, p.depth, set("depth"), 0.01);
      if ("follow" in p)
        slider("follow-" + p.id, p.label + " turns to you", 0, 1, p.follow, set("follow"), 0.05);
    } else if ("lean" in p) {
      if (p.leanWall === "teal")
        // dragged right moves it right as you look, toward the corner, as the console's does
        slider("along-" + p.id, p.label + " left / right", 0, 5, 5 - p.along, (v) => setProp(mesh, { along: 5 - v }), 0.01);
      else slider("along-" + p.id, p.label + " left / right", 0, 4, p.along, set("along"), 0.01);
      slider("lean-" + p.id, p.label + " lean", 0, 35, p.lean, set("lean"), 1);
      if (p.depth)
        slider("depth-" + p.id, p.label + " depth", 0.02, 0.3, p.depth, set("depth"), 0.01);
    } else {
      if ("fwd" in p) slider("fwd-" + p.id, p.label + " forward", 0, 5, p.fwd, set("fwd"));
      if ("slide" in p) slider("slide-" + p.id, p.label + " left / right", -2, 2, p.slide, set("slide"), 0.01);
      if (p.layers) slider("depth-" + p.id, p.label + " depth", 0, 0.4, p.depth, set("depth"), 0.01);
      if ("taper" in p) slider("taper-" + p.id, p.label + " taper", 0, 0.6, p.taper, set("taper"), 0.01);
      if ("follow" in p)
        slider("follow-" + p.id, p.label + " turns to you", 0, 1, p.follow, set("follow"), 0.05);
      if ("spin" in p) slider("spin-" + p.id, p.label + " spin", -180, 180, p.spin, set("spin"), 1);
      if ("raise" in p) slider("raise-" + p.id, p.label + " height", 0, 1.5, p.raise, set("raise"), 0.01);
      if ("wide" in p)
        slider("wide-" + p.id, p.label + " width", 0.5, 1.5, p.wide, set("wide"), 0.01);
      if (p.against && p.depth)
        slider("depth-" + p.id, p.label + " depth", 0.1, 1, p.depth, set("depth"), 0.01);
      if ("alongTeal" in p)
        // dragged right moves it right as you look, toward the corner: the slider runs the other way
        // to `alongTeal` ("Console left right is backwards", Carl, 5 Oct 2026)
        slider(
          "teal-" + p.id,
          p.label + " left / right",
          0,
          4,
          4 - p.alongTeal,
          (v) => setProp(mesh, { alongTeal: 4 - v }),
          0.01,
        );
      if ("along" in p)
        slider("along-" + p.id, p.label + " left / right", 0, 4, p.along, set("along"), 0.01);
      if ("lift" in p)
        slider("lift-" + p.id, p.label + " up / down", -0.6, 1, p.lift, set("lift"), 0.01);
    }
    // flip. The corner dots that stood beside it are gone: "remove the corner controls" (Carl, 5 Oct 2026)
    const tools = document.createElement("div");
    tools.className = "modes";
    const flipBtn = Object.assign(document.createElement("button"), {
      type: "button",
      textContent: "Flip",
      id: "flip-" + p.id,
    });
    flipBtn.setAttribute("aria-pressed", String(!!p.flip));
    flipBtn.addEventListener("click", () => {
      setProp(mesh, { flip: !p.flip });
      flipBtn.setAttribute("aria-pressed", String(!!p.flip));
      dirty = true;
    });
    tools.append(flipBtn);
    addRow(tools);
    // its own colours, then any of its followers' it does not have (the gong's rope)
    const own = new Set((p.colors || []).map((w) => w.id));
    const extra = followers(p)
      .flatMap((m) => m.userData.prop.colors || [])
      .filter((w) => !own.has(w.id) && own.add(w.id));
    for (const w of [...(p.colors || []), ...extra]) {
      const row = document.createElement("label");
      row.textContent = p.label + " " + w.label;
      const pick = Object.assign(document.createElement("input"), {
        type: "color",
        value: w.color || w.base,
        id: "color-" + p.id + "-" + w.id,
      });
      pick.addEventListener("input", () => {
        colorProp(mesh, w.id, pick.value);
        dirty = true;
      });
      row.append(pick);
      addRow(row);
    }
  }
  const modes = document.createElement("div");
  modes.className = "modes";
  modes.textContent = "Camera";
  for (const m of Object.keys(MODES)) {
    const b = Object.assign(document.createElement("button"), {
      type: "button",
      textContent: m[0].toUpperCase() + m.slice(1),
    });
    b.setAttribute("aria-pressed", String(m === mode));
    b.addEventListener("click", () => {
      mode = m;
      for (const o of modes.querySelectorAll("button"))
        o.setAttribute("aria-pressed", String(o === b));
      clamp();
      dirty = true;
    });
    modes.append(b);
  }
  // the up and down switch (UP AND DOWN, below)
  const tilt = Object.assign(document.createElement("button"), { type: "button", id: "camera-tilt" });
  const showTilt = () => {
    tilt.textContent = "Up/down " + (level ? "off" : "on");
    tilt.setAttribute("aria-pressed", String(!level));
  };
  showTilt();
  tilt.addEventListener("click", () => {
    level = !level;
    showTilt();
    clamp();
    dirty = true;
  });
  modes.append(tilt);
  modes.dataset.group = "camera";
  panel.insertBefore(modes, panel.firstChild);
  /* the camera's limits: each button takes the view as it is now as that limit, and Try limits turns them on */
  const limitRows = [];
  const lim = document.createElement("div");
  lim.className = "modes";
  lim.dataset.group = "camera";
  lim.textContent = "Limits";
  const tryBtn = Object.assign(document.createElement("button"), { type: "button", id: "limits-try" });
  const showTry = () => {
    tryBtn.textContent = "Try limits " + (limitsOn ? "on" : "off");
    tryBtn.setAttribute("aria-pressed", String(limitsOn));
  };
  showTry();
  tryBtn.addEventListener("click", () => {
    limitsOn = !limitsOn;
    showTry();
    clamp();
    dirty = true;
  });
  lim.append(tryBtn);
  limitRows.push(lim);
  // each takes the spot in the room at that edge of the screen as it is now (THE CAMERA'S LIMITS)
  const edge = (x, y) => () => inRoom(pose(cam.yaw, cam.pitch, cam.fov), x, y);
  for (const pair of [
    [
      ["left", "Furthest left", edge(-1, 0)],
      ["right", "Furthest right", edge(1, 0)],
    ],
    [
      ["top", "Highest", edge(0, 1)],
      ["bottom", "Lowest", edge(0, -1)],
    ],
    [
      ["close", "Closest zoom", () => cam.fov],
      ["wide", "Widest zoom", () => cam.fov],
    ],
  ]) {
    const row = document.createElement("div");
    row.className = "modes";
    row.dataset.group = "camera";
    for (const [k, label, now] of pair) {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: label, id: "limit-" + k });
      b.addEventListener("click", () => {
        LIMITS[k] = now();
        b.textContent = label + " ✓";
        setTimeout(() => (b.textContent = label), 1500);
      });
      row.append(b);
    }
    limitRows.push(row);
  }
  modes.after(...limitRows);
  groups.unshift(["camera", "Camera"]);
  // the menu: which element's controls show
  const pick = document.createElement("label");
  pick.className = "editing";
  pick.textContent = "Editing";
  const menu = Object.assign(document.createElement("select"), { id: "editing" });
  /* ONLY THESE, for now: "Let's hide the current controls for the time being and try to add one more
     decoration" (Carl, 5 Oct 2026). Empty, every group shows again. */
  // the decorations' own controls put away for now, the room's left: "ok so let's remove the item controls for now
  // and talk about how to define the camera limitations" (Carl, 6 Oct 2026)
  const ONLY = ["camera", "room", "light", "wall"];
  const shown = ONLY.length ? groups.filter(([id]) => ONLY.includes(id)) : groups;
  groups.length = 0;
  groups.push(...shown);
  for (const [id, label] of groups)
    menu.append(Object.assign(document.createElement("option"), { value: id, textContent: label }));
  // the newest decoration (`newest` in PROPS), so a new drawing's controls are the first he sees
  let chosen =
    props.find((m) => m.userData.prop.newest)?.userData.prop.id || groups[groups.length - 1][0];
  if (!groups.some(([id]) => id === chosen)) chosen = groups[0][0];
  try {
    const was = localStorage.getItem("studio-editing");
    if (groups.some(([id]) => id === was)) chosen = was;
  } catch {
    /* no storage here: start on the newest */
  }
  const show = (id) => {
    menu.value = id;
    for (const el of panel.querySelectorAll("[data-group]")) el.hidden = el.dataset.group !== id;
    dirty = true;
  };
  menu.addEventListener("change", () => {
    show(menu.value);
    try {
      localStorage.setItem("studio-editing", menu.value);
    } catch {
      /* not remembered on this device: fine */
    }
  });
  /* COMPACT AND MOVABLE (Carl, 5 Oct 2026: "Can you make the control box way less clunky and oversized,
     and movable? It covers the whole lamp on mobile"). A grip to drag it anywhere, a button to fold it
     to its top line, both remembered on that device. */
  const grip = Object.assign(document.createElement("button"), {
    type: "button",
    className: "grip",
    textContent: "⠿",
  });
  grip.setAttribute("aria-label", "Move the panel");
  const fold = Object.assign(document.createElement("button"), {
    type: "button",
    className: "fold",
    textContent: "–",
  });
  fold.setAttribute("aria-label", "Fold the panel");
  pick.textContent = "";
  pick.append(grip, menu, fold);
  panel.insertBefore(pick, panel.firstChild);
  const remember = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* not remembered on this device: fine */
    }
  };
  const recall = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const setFolded = (f) => {
    panel.classList.toggle("folded", f);
    fold.textContent = f ? "+" : "–";
    fold.setAttribute("aria-label", f ? "Open the panel" : "Fold the panel");
    remember("studio-panel-folded", f ? "1" : "");
  };
  fold.addEventListener("click", () => setFolded(!panel.classList.contains("folded")));
  setFolded(recall("studio-panel-folded") === "1");
  /* Always wholly on screen: it shrinks and scrolls inside rather than running off the bottom, and it
     comes back in when the window shrinks. Dragged where it ran off, it could not be reached: "can you
     reset the hud to be lower? It renders in a place I can't reach" (Carl, 5 Oct 2026). So the spot it
     was dragged to then is forgotten (a new key), and it starts in the bottom right corner again. */
  const moveTo = (x, y) => {
    const r = panel.getBoundingClientRect();
    x = Math.max(4, Math.min(innerWidth - r.width - 4, x));
    y = Math.max(4, Math.min(innerHeight - 120, y));
    Object.assign(panel.style, {
      left: x + "px",
      top: y + "px",
      right: "auto",
      bottom: "auto",
      maxHeight: innerHeight - y - 8 + "px",
    });
    return [x, y];
  };
  addEventListener("resize", () => {
    if (panel.style.left) moveTo(parseFloat(panel.style.left), parseFloat(panel.style.top));
  });
  let grab = null;
  grip.addEventListener("pointerdown", (e) => {
    const r = panel.getBoundingClientRect();
    grab = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    grip.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  grip.addEventListener("pointermove", (e) => {
    if (grab) moveTo(e.clientX - grab.dx, e.clientY - grab.dy);
  });
  grip.addEventListener("pointerup", () => {
    if (!grab) return;
    grab = null;
    remember(
      "studio-panel-at-2",
      JSON.stringify([parseFloat(panel.style.left), parseFloat(panel.style.top)]),
    );
  });
  show(chosen);
  const save = panel.lastElementChild;
  save.addEventListener("click", async () => {
    save.disabled = true;
    save.textContent = "Saving";
    const savedAt = new Date().toISOString();
    try {
      for (const mesh of props) {
        const p = mesh.userData.prop;
        if (follows(p)) continue;
        const d = {
          // its own colours and its followers' (the gong's rope)
          colors: Object.fromEntries(
            [...followers(p).flatMap((m) => m.userData.prop.colors || []), ...(p.colors || [])].map(
              (w) => [w.id, w.color],
            ),
          ),
          savedAt,
        };
        for (const k of NUMS) if (k in p) d[k] = p[k];
        d.flip = !!p.flip;
        await db.doc("props/" + p.id).set(d);
      }
      await db
        .doc("settings/look")
        .set({ grain: shared.grainK.value, line: linePx, boil: shared.boilK.value, savedAt });
      await db.doc("settings/light").set({
        lamp: { ...LIGHTS.lamp },
        glow: { ...LIGHTS.glow },
        ambient: LIGHTS.ambient,
        roomOn: LIGHTS.roomOn,
        roomWarmth: LIGHTS.roomWarmth,
        bulbs: LIGHTS.bulbs,
        bulbSize: LIGHTS.bulbSize,
        bulbFace: LIGHTS.bulbFace,
        bulbColor: LIGHTS.bulbColor,
        lampLift: LIGHTS.lampLift,
        savedAt,
      });
      await db
        .doc("settings/paint")
        .set({ arch: { ...PAINT.arch }, panel: { ...PAINT.panel }, savedAt });
      await db.doc("settings/camera").set({ places: { ...LIMITS }, savedAt });
      save.textContent = "Saved";
      setTimeout(() => (save.textContent = "Save"), 2500);
    } catch (err) {
      /* Stays on the button until the next tap: the first version cleared it after 2.5 s, and a save
         that failed on Carl's phone left no trace he could see ("I tried saving it, but it wouldn't
         let me. I don't think", 5 Oct 2026). */
      save.textContent = "Not saved: " + (err?.code || err?.message || "try again");
    }
    save.disabled = false;
  });
  panel.hidden = false;
  try {
    const at = JSON.parse(recall("studio-panel-at-2") || "null");
    if (Array.isArray(at)) moveTo(at[0], at[1]);
  } catch {
    /* nowhere remembered: it stays in the corner */
  }
  dirty = true;
})();
/* UP AND DOWN. Held level for a while (Carl, 5 Oct 2026: "Can it sway left and right like you have it but
   not up and down?"): the tilt kept at the opening view's. Then let go again: "can I have up/down control
   again for the camera?" (Carl, 5 Oct 2026). His panel's Up/down switch holds it level or lets it tilt. */
let level = false;
/* THE CAMERA'S LIMITS, set by looking: "i do really like your idea for noting the camera limits" (Carl, 6 Oct
   2026), the idea being a button for each way the camera may go (furthest left and right, highest and lowest,
   closest and widest zoom) that takes the view as it is as that limit. Visitors always have them. While he sets
   them they are off (limitsOn), the camera free to go further, until he turns them on to try.
   Each side is a PLACE IN THE ROOM: the spot on a wall, the floor or the ceiling at that edge of his screen when he
   tapped it (the middle of the left edge for Furthest left, of the top for Highest...). The camera may turn and
   zoom anywhere that keeps those spots at or beyond the screen's edges, so it shows no more of the room than he
   chose, however close it is zoomed: "instead of a POV direction/percentage, what if we used the top/bottom/left/
   right limit's edge pixel to set the boundary" (Carl, 6 Oct 2026). They were turns first, the view's middle, then
   its edges ("when i zoom in, i can't look to the left or right"); a turn never pinned a place, since Sway walks
   the camera as it turns. The zooms are lenses (degrees). */
// his, set and saved the same day as turns, turned into the spots at the edges of those views at his widest zoom:
// metres, x along the cream wall from the corner, y up, z along the teal wall
const LIMITS = {
  left: [0, 1.475, 3.25], // 3.093 until the new home angle, 8 Nov 2026, whose left edge falls at 3.19
  right: [3.308, 1.468, 0],
  top: [1.124, 3, 0.689],
  bottom: [2.128, 0, 1.852],
  close: 5.901,
  wide: 17.831,
};
const FREE = { yaw: 1.5, pitch: 0.7, close: 4, wide: 80 }; // how far it may go with the limits off
let limitsOn = true;
const between = (v, a, b) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v));
// where the camera stands and how it looks, for a turn and a lens (as place() puts it)
function pose(yaw, pitch, fov, aspect = camera.aspect || 1.6) {
  const { walk, stand } = MODES[mode];
  const back = lookDir(REF.yaw + walk * (yaw - REF.yaw), REF.pitch + walk * (pitch - REF.pitch));
  const c = [AIM.x - back[0] * stand, AIM.y - back[1] * stand, AIM.z - back[2] * stand];
  const d = lookDir(yaw, pitch);
  // as three's lookAt with up straight up: right is d across up, level; the screen's up is right across d
  const n = Math.hypot(d[0], d[2]);
  const R = [-d[2] / n, 0, d[0] / n];
  const U = [R[1] * d[2] - R[2] * d[1], R[2] * d[0] - R[0] * d[2], R[0] * d[1] - R[1] * d[0]];
  const tv = Math.tan((lensAt(fov, stand) * Math.PI) / 360);
  return { c, d, R, U, tv, ta: tv * aspect };
}
// a point in the room on the screen: x and y, -1 to 1 edge to edge, left to right and bottom to top
function onScreen(P, pt) {
  const v = [pt[0] - P.c[0], pt[1] - P.c[1], pt[2] - P.c[2]];
  const z = v[0] * P.d[0] + v[1] * P.d[1] + v[2] * P.d[2];
  if (z <= 0) return null;
  return [(v[0] * P.R[0] + v[2] * P.R[2]) / z / P.ta, (v[0] * P.U[0] + v[1] * P.U[1] + v[2] * P.U[2]) / z / P.tv];
}
// the spot in the room at screen x, y: where that line of sight meets a wall, the floor or the ceiling
function inRoom(P, x, y) {
  const dir = [0, 1, 2].map((i) => P.d[i] + P.R[i] * x * P.ta + P.U[i] * y * P.tv);
  let best = null;
  for (const [axis, at] of [[0, 0], [2, 0], [1, 0], [1, ROOM.h]]) {
    if (Math.abs(dir[axis]) < 1e-6) continue;
    const t = (at - P.c[axis]) / dir[axis];
    if (t > 0 && (best === null || t < best)) best = t;
  }
  return best === null ? null : P.c.map((v, i) => v + dir[i] * best);
}
// whether a view shows nothing past his limits: each limit's spot at or beyond its edge of the screen
function within(yaw, pitch, fov) {
  const P = pose(yaw, pitch, fov);
  // a phone upright shows more top to bottom than his limits, so only the sides hold it (THE PHONE UPRIGHT, below)
  const sides = upright() ? [["left", 0, -1], ["right", 0, 1]] : [["left", 0, -1], ["right", 0, 1], ["bottom", 1, -1], ["top", 1, 1]];
  for (const [k, i, side] of sides) {
    if (!LIMITS[k]) continue;
    const s = onScreen(P, LIMITS[k]);
    if (!s || s[i] * side < 1 - 1e-4) return false;
  }
  return true;
}
// the furthest along from a view that is within to the one asked for that is still within
function furthest(from, to, ok) {
  if (ok(to)) return to;
  if (!ok(from)) return from;
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 18; i++) {
    const m = (lo + hi) / 2;
    if (ok(from + (to - from) * m)) lo = m;
    else hi = m;
  }
  return from + (to - from) * lo;
}
/* THE OPENING VIEW TILTS DOWN ONTO THE RUG: asked "Should the opening view tilt down a little so the rug shows?", "yes"
   (Carl, 2 Nov 2026). His opening view is his widest zoom with his Highest and Lowest spots on its top and bottom edges,
   so it could not tilt at all; it is tilted down TILT (radians), and those two spots are moved to the new view's top and
   bottom edges (in the middle, at his 16:9), so the room still shows exactly as much as it opens on. `?tilt=` tries
   another. */
// he picked the most of four, "4" (Carl, 2 Nov 2026)
const TILT = +(new URLSearchParams(location.search).get("tilt") ?? 0.15);
// his Highest spot before the tilt: an upright phone may still tilt up to it (clamp)
const TOP0 = LIMITS.top.slice();
if (TILT) {
  START.pitch -= TILT;
  Object.assign(cam, { pitch: START.pitch, tpitch: START.pitch });
  const P = pose(START.yaw, START.pitch, START.fov, 16 / 9);
  LIMITS.top = inRoom(P, 0, 1);
  LIMITS.bottom = inRoom(P, 0, -1);
}
/* THE OPENING VIEW ON A MACBOOK-SHAPED WINDOW (Carl, 12 Oct 2026, visual sweep, asked whether the opening view
   should show the whole picture frame on a 16:10 window: "Widen it a touch"). His opening view was framed on a 16:9
   window; on 16:10 the same height of lens shows less across, and the picture frame's left edge was cut off. So a
   window narrower than 16:9 opens with the lens widened by 16:9 over its own shape (in the tangent), which keeps the
   same width across and shows a strip more ceiling and floor. The widest zoom (LIMITS.wide) widens the same, or the
   first drag would snap back. A window 16:9 or wider is exactly his view. */
let lensK = 1;
/* THE PHONE UPRIGHT (src/stage.mjs upright), 2 Nov 2026: "it can open a bit more zoomed out than the laptop landscape
   version does" (Carl). Its lens is his opening lens widened PORTRAIT_ZOOM times top to bottom (in the tangent), so it
   shows a little more height of the room than a laptop does and a slice of its width, swiped left and right within his
   side limits, tilted by a thumb between his Highest and Lowest spots (clamp), and never zooms out past where it opens. */
// its tilt: his Highest spot (LIMITS.top) on the screen's top edge, so the room shows no more above than a laptop's
// does and the extra height is floor
function uprightPitch(yaw, fov, top = LIMITS.top, cap = START.pitch) {
  let lo = -0.7,
    hi = 0.5;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2,
      s = onScreen(pose(yaw, m, fov), top);
    if (s && s[1] < 1) hi = m; // the spot is on screen: tilt down
    else lo = m;
  }
  return Math.min(cap, lo);
}
/* THE PHONE'S OPENING VIEW, his to set on the view editor's phone sliders: "i'll want to re-position the "landing camera
   view" for them. MOBILE ONLY", then, offered sliders, "yes" (Carl, 3 Nov 2026). `turn` is radians from the laptop's
   opening turn, `tilt` how far up from as low as it goes (0) to the soffit (1, as a thumb may tilt it), `zoom` how much of
   the phone's widest lens (1) it opens on. Saved at phone/opening. */
/* turned onto the console, LISTEN and all: "Open on the console and the row of words" (Carl, 9 Nov 2026, the officers'
   fixes quiz; four officers found it opening with LISTEN cut to "EN"). 0.42 puts the console in the middle of a phone;
   `?pturn=` tries another. */
export const PHONE = { turn: +(new URLSearchParams(location.search).get("pturn") || 0.42), tilt: 0, zoom: 1 };
function phoneOpening() {
  const yaw = START.yaw + PHONE.turn,
    fov = scaleLens(START.fov, PHONE.zoom),
    lo = uprightPitch(yaw, fov),
    hi = Math.max(lo, uprightPitch(yaw, fov, TOP0, START.pitch + TILT));
  return { yaw, pitch: lo + (hi - lo) * PHONE.tilt, fov };
}
// the editor's sliders: the phone's opening, laid on at once
function setPhone(p) {
  Object.assign(PHONE, p);
  if (!upright()) return;
  const o = phoneOpening();
  Object.assign(cam, { tyaw: o.yaw, tpitch: o.pitch, tfov: o.fov });
  clamp();
  dirty = true;
}
const PORTRAIT_ZOOM = +(new URLSearchParams(location.search).get("pz") || 1.6);
const scaleLens = (fov, r) => (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * r) * 180) / Math.PI;
function widenForAspect(aspect) {
  const k = upright() ? PORTRAIT_ZOOM : Math.max(1, 16 / 9 / aspect);
  if (Math.abs(k - lensK) < 1e-6) return;
  const r = k / lensK;
  const atOpening = Math.abs(cam.tfov - START.fov) < 1e-3;
  START.fov = scaleLens(START.fov, r);
  LIMITS.wide = scaleLens(LIMITS.wide, r);
  lensK = k;
  if (atOpening) {
    cam.fov = cam.tfov = START.fov;
    cam.pitch = cam.tpitch = upright() ? uprightPitch(cam.tyaw, START.fov) : START.pitch;
    // a phone opens on his phone view (THE PHONE'S OPENING VIEW)
    if (upright()) {
      const o = phoneOpening();
      Object.assign(cam, { yaw: o.yaw, tyaw: o.yaw, pitch: o.pitch, tpitch: o.pitch, fov: o.fov, tfov: o.fov });
    } else Object.assign(cam, { yaw: START.yaw, tyaw: START.yaw }); // and a window dragged back from phone-narrow, his laptop turn

  }
}
function clamp() {
  if (!limitsOn) {
    cam.tfov = between(cam.tfov, FREE.close, FREE.wide);
    cam.tyaw = between(cam.tyaw, -FREE.yaw, FREE.yaw);
    cam.tpitch = level ? START.pitch : between(cam.tpitch, -FREE.pitch, FREE.pitch);
    return;
  }
  if (upright()) {
    cam.tfov = between(cam.tfov, LIMITS.close, START.fov);
    /* a thumb tilts it too: "On the phone i can't tilt with my thumb at all?" (Carl, 2 Nov 2026). It had been held level.
       A phone's tall view already shows more than his Highest to his Lowest, so it opens as low as it goes (down onto
       the rug) and tilts up as far as his Highest spot from before the opening view was tilted (TOP0): the soffit */
    const lo = uprightPitch(cam.tyaw, cam.tfov),
      hi = Math.max(lo, uprightPitch(cam.tyaw, cam.tfov, TOP0, START.pitch + TILT));
    cam.tpitch = between(cam.tpitch, lo, hi);
    cam.tyaw = furthest(START.yaw, cam.tyaw, (v) => within(v, cam.tpitch, cam.tfov));
    return;
  }
  cam.tfov = between(cam.tfov, LIMITS.close, LIMITS.wide);
  /* Each is found reaching out from the opening view, not from where the view is, so zooming out while
     looking to one side slides the view back toward the middle as it widens, rather than stopping: "if i'm
     zoomed in and looking at the side, it only allows me to partially zoom back out... i should be able to zoom
     back out to the original position from anywhere" (Carl, 6 Oct 2026). The opening view is within them. */
  const f = furthest(START.fov, cam.tfov, (v) => within(START.yaw, START.pitch, v));
  let p = level ? START.pitch : furthest(START.pitch, cam.tpitch, (v) => within(START.yaw, v, f));
  const y = furthest(START.yaw, cam.tyaw, (v) => within(v, p, f));
  if (!level && !within(y, p, f)) p = furthest(START.pitch, p, (v) => within(y, v, f));
  cam.tfov = f;
  cam.tyaw = y;
  cam.tpitch = p;
}
/* THE LEAN: the one time the camera leaves its spot. Carl, 2 Nov 2026, of the console's flight: "it feels like we
   should be able to see closer", then of the endings offered, "My gut says 3 or 4". From where the camera stands the
   console's top is seen almost edge-on, so no turn or zoom shows into its well; this walks the camera up and over to
   `pos`, looking at `look` on a lens of `fov`, blended in as the console opens and out as it shuts. It breaks his
   5 Oct 2026 rule for this one flight only ("the camera should be fixed, so dragging moves the angle it's looking
   not moving the camera itself"), which is why it is shown to him as a trial. src/nav.mjs says when. */
const LEAN = { k: 0, to: 0, last: 0, pos: null, look: null, fov: 40 };
/* "I like lean but the camera needs to be smoother" (Carl, 2 Nov 2026). It was 1.8 s on a cubic, its place and its
   aim each blended in a straight line, so its aim swung between two points and jerked mid-way, while the flight turned
   it toward the whole console at the same time. Now it is the only move (src/nav.mjs holds the turn still), over
   2.4 s on a smootherstep, and it turns by the shortest way between where it looked and where it will look. */
const LEAN_MS = 2400;
function lean(on, target) {
  LEAN.to = on ? 1 : 0;
  if (target) Object.assign(LEAN, target);
  dirty = true;
}
const leanEase = (x) => x * x * x * (x * (6 * x - 15) + 10);
/* THE OPENING FLYOVER: "Could there be a moving opening kinda like how the garden has the
   'flyover'?" (Carl, 7 Nov 2026, his officers' quiz), then, offered one from the rug and one from above: "can i see both?
   and also maybe one from zoomed far back? it could be cool" (8 Nov 2026). As the loading screen lifts the camera starts
   at one of three places and comes in to the room as it opens, over OPEN_MS (`?openms=`): `rug`, low over his name on
   the rug, looking down at it, rising and pulling back; `above`, high over the rug looking down, coming down; `far`, well
   back along its own line of sight, coming in. Nothing takes a click until it lands. None for a visitor who asks for
   less motion. B, `above`, is every visitor's opening: "I need to see the flyover it shouldn't be trial it was b I told
   you that" (Carl, 8 Nov 2026). `?open=rug` or `far` still shows the others, and `?open=none` opens on the room as it
   used to (for the tests that click straight away). */
const OPEN_ASKED = new URLSearchParams(location.search).get("open") || "above";
// a link straight to a page (carlbahner.com/#contact) opens on its card, with no flyover behind it
const OPEN_KIND = REDUCED || OPEN_ASKED === "none" || location.hash.length > 1 ? null : OPEN_ASKED;
const OPEN_MS = +(new URLSearchParams(location.search).get("openms") || (OPEN_KIND === "above" ? 5600 : 4200));
const OPENING = { k: OPEN_KIND ? 1 : 0, t0: 0 };
/* THE LAMP WAITS FOR B: "b is cool except the lamp looks all sorts of fucked from that perspective haha" (Carl, 8 Nov
   2026). The lamp is flat drawings turned to where the camera stands, made to be seen from about eye height far back;
   from above and close its pole, base and necks come apart. So while B is overhead and dropping it is not drawn, and
   it fades in (dithered, as a record fades) over LAMP_IN of the time, once the camera is nearly home. */
const LAMP_FADE = { value: 1 },
  LAMP_IN = [0.84, 0.97];
function lampWaits() {
  const ids = new Set(["lamp", "neck1", "neck2", "neck3"]);
  for (const m of props)
    if (ids.has(m.userData.prop.id))
      m.traverse((o) => {
        const mat = o.material;
        if (!mat?.fragmentShader || mat.uniforms?.fade) return;
        mat.uniforms.fade = LAMP_FADE;
        mat.fragmentShader = mat.fragmentShader.replace(
          /void main\(\)\s*\{/,
          "uniform float fade;\nvoid main() {\n  if (fade < 1.0 && fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) > fade) discard;",
        );
        mat.needsUpdate = true;
      });
}
/* NEARLY HOME IS HOME: "can we make it that things can still be clicked even if the camera isn't 100% still?" (Carl, 9 Nov
   2026). The flyover's last second is the camera easing the last few centimetres in, and until it was still nothing took
   a click. So from NEARLY_HOME of the way through (when the lamp starts coming in) the room takes clicks and taps. A
   click then flies from wherever the camera is, the flyover's last bit easing out under it. */
const NEARLY_HOME = 0.84;
function startOpening() {
  if (!OPENING.k) return nav.introFrom();
  if (OPEN_KIND === "above") lampWaits(), (LAMP_FADE.value = 0);
  OPENING.t0 = performance.now();
  dirty = true;
}
function stepOpening(now) {
  if (!OPENING.k || !OPENING.t0) return !!OPENING.k;
  OPENING.k = Math.max(0, 1 - (now - OPENING.t0) / OPEN_MS);
  if (OPEN_KIND === "above") LAMP_FADE.value = Math.min(1, Math.max(0, (1 - OPENING.k - LAMP_IN[0]) / (LAMP_IN[1] - LAMP_IN[0])));
  if (!OPENING.k) nav.introFrom();
  return true;
}
/* THE DRUM TURNS BACK: on a phone the drum starts the flyover turned about its right foot (props.mjs PHONE PROPS) and, 4 s
   in, eases back to where it stands, there as the camera lands: "it looks good during flyover but then once the main page
   is in use it looks wrong. Is it possible to start there and then at the 4s mark it starts moving back to the original
   position?" (Carl, 9 Nov 2026). No flyover (a link straight to a page, less motion asked for), no turn. */
const DRUM_BACK_MS = Math.min(4000, OPEN_MS * 0.7);
/* THE CHAIR AND DRUM LEAN BACK FOR THE OPENING: "What if the chair and drum lean back a bit for the opening shots?", then,
   shown both at 20 degrees: "Drum looks great at 20%, try chair at 10% please" (Carl, 9 Nov 2026). Leaned back about their
   feet while the camera is over the rug (props.mjs LEANS_BACK), easing upright from 4 s in, as the drum's phone turn does
   (THE DRUM TURNS BACK), upright as it lands. How far through that it is, 1 all the way back. */
function leanBackNow(now) {
  if (!OPEN_KIND || !OPENING.k) return 0;
  if (!OPENING.t0) return 1;
  const t = (now - OPENING.t0 - DRUM_BACK_MS) / (OPEN_MS - DRUM_BACK_MS);
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  return 1 - t * t * t * (t * (t * 6 - 15) + 10);
}
function drumTurn(now) {
  if (!OPEN_KIND || !upright() || !OPENING.k) return 0;
  if (!OPENING.t0) return 1;
  const t = (now - OPENING.t0 - DRUM_BACK_MS) / (OPEN_MS - DRUM_BACK_MS);
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  return 1 - t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
}
/* B starts closer still and pulls out first: "can b start zoomed in further into the carpet and pull out before droping
   back?" (Carl, 8 Nov 2026). For its first RISE of the time it rises straight up from CLOSE over the rug, still looking
   down, to the high place, then drops back into the room as before. */
const RISE = 0.32,
  CLOSE_H = 1.85,
  UPRIGHT_TOP = +(new URLSearchParams(location.search).get("otop") || 0.08), // how far under the ceiling, on a phone
  UPRIGHT_TOP_FOV = +(new URLSearchParams(location.search).get("ofov") || 1), // more or less than the fit, to try
  UPRIGHT_TOP_FILL = +(new URLSearchParams(location.search).get("ofill") || 0.94); // how much of the screen's width his name takes
function openingClose(fov1) {
  if (OPEN_KIND !== "above") return null;
  const rug = [1.89, 0, 1.79],
    k = CLOSE_H / (ROOM.h - 0.35);
  return [[rug[0], CLOSE_H, rug[2] - 0.05 + 0.35 * k], [rug[0], 0, rug[2] - 0.05], fov1 * 1.2];
}
// where it starts, from where it lands: [place, the spot it looks at, lens]
function openingFrom(p1, d1, fov1) {
  const rug = [1.89, 0, 1.79];
  if (OPEN_KIND === "rug") return [[2.25, 0.42, 2.15], [1.75, 0.02, 1.62], fov1 * 1.15];
  /* the same height, turned so his name on the rug reads left to right, not on a slant: "what if B started at a slightly
     different angle (same height, but rotated so that the wordmark is left to right instead of diagonal?" (Carl, 8 Nov
     2026). Facing the teal wall square, the rug's length across the screen */
  /* and on a phone held upright, higher and a little wider, so his whole name on the rug fits the narrow screen at the
     top: "Can we have the camera go just a bit higher at the top of the flyover in mobile? Just enough to get the whole
     wordmark in it" (Carl, 9 Nov 2026). The ceiling stops the rise short (UPRIGHT_TOP), and the lens opens the rest. */
  if (OPEN_KIND === "above" && upright()) {
    /* wide enough for his name and a little either side on this screen's shape, no wider: 1.3 times on every phone went
       "out too far" on his (Carl, 9 Nov 2026, a screenshot from his phone), wider for its shape than the test's. The
       across-the-screen reach that fit the name at 95% on a 390 by 844 screen at 1.3 times, made to fit it at
       UPRIGHT_TOP_FILL, then the lens that gives that reach on this screen. */
    const tanV0 = Math.tan(((fov1 * 1.2 * 1.3) * Math.PI) / 360),
      reach = (tanV0 * (390 / 844) * 0.95) / UPRIGHT_TOP_FILL,
      aspect = camera.aspect || 390 / 844,
      fov = (2 * Math.atan(reach / aspect) * 180) / Math.PI;
    return [[rug[0], ROOM.h - UPRIGHT_TOP, rug[2] + 0.3], [rug[0], 0, rug[2] - 0.05], Math.max(fov1 * 1.2, fov) * UPRIGHT_TOP_FOV];
  }
  if (OPEN_KIND === "above") return [[rug[0], ROOM.h - 0.35, rug[2] + 0.3], [rug[0], 0, rug[2] - 0.05], fov1 * 1.2];

  // far: back along its own line of sight and a little up, looking at the same corner
  const back = 5.5,
    look = 3;
  // kept under the ceiling, which the first try rose through
  return [[p1.x - d1[0] * back, Math.min(p1.y - d1[1] * back + 0.6, ROOM.h - 0.8), p1.z - d1[2] * back], [p1.x + d1[0] * look, p1.y + d1[1] * look, p1.z + d1[2] * look], fov1];
}
function stepLean(now) {
  const dt = LEAN.last ? now - LEAN.last : 0;
  LEAN.last = now;
  if (LEAN.k === LEAN.to) return false;
  const step = REDUCED ? 1 : dt / LEAN_MS;
  LEAN.k = LEAN.to > LEAN.k ? Math.min(LEAN.to, LEAN.k + step) : Math.max(LEAN.to, LEAN.k - step);
  return true;
}
function place() {
  const { walk, stand } = MODES[mode];
  const back = lookDir(
    REF.yaw + walk * (cam.yaw - REF.yaw),
    REF.pitch + walk * (cam.pitch - REF.pitch),
  );
  camera.position.set(AIM.x - back[0] * stand, AIM.y - back[1] * stand, AIM.z - back[2] * stand);
  const d = lookDir(cam.yaw, cam.pitch),
    p = camera.position;
  camera.lookAt(p.x + d[0], p.y + d[1], p.z + d[2]);
  /* where the camera stands in the room, kept before the opening flyover or the lean moves it: the things that turn to
     the camera turn to this, so nothing swings round to face the flyover high over the rug, and where the room opens is
     where their home turn is taken from ("The drum looks weird and rotates", Carl, 9 Nov 2026) */
  const stands = { x: p.x, y: p.y, z: p.z };
  // for tests/lamp.mjs: the camera stood where the turn puts it, looking at one spot instead
  const aim = window.__studio?.aim;
  if (aim) camera.lookAt(aim.x, aim.y, aim.z);
  let fov = lensAt(cam.fov, stand);
  // THE EDGES LEAN THE VIEW: pushed in, and turned and tilted by the room that frees, inside what the view already shows
  if ((peek.x || peek.y) && !aim) {
    camera.rotateY((-peek.x * PEEK_H * Math.PI) / 180);
    camera.rotateX((-peek.y * PEEK_V * Math.PI) / 180);
  }
  const close = OPENING.k > 0 && openingClose(fov),
    t = 1 - OPENING.k;
  /* ONE SMOOTH MOVE: "I think all the camera movements (including the flyover) need to be smooth motions not stop and
     pivots" (Carl, 9 Nov 2026). B rose from close over the rug to the high place, stopped there, and dropped into the
     room, two moves each easing in and out. Now it is one move along the same path (EVEN ALL THE WAY, below). */
  if (close) {
    /* EVEN ALL THE WAY: "It should be even from start to finish other than the ease in and out" (Carl, 9 Nov 2026), after
       the curve above slowed to a third over the top, and a single arc tried in its place, turning early, was "way weirder
       and the opposite of smooth". So it goes up over his name and then down into the room along one curve (NO DOGLEGS,
       below), at one speed, easing up to it over the first EASE of the time and down from it over the last (PACE). It looks straight down at the rug, his name square,
       until the top, then turns to the room on a smootherstep over the rest of the way. */
    const EASE = 0.2,
      p1 = camera.position.clone(),
      q1 = camera.quaternion.clone(),
      [hi, hiLook, hiFov] = openingFrom(p1, lookDir(cam.yaw, cam.pitch), fov),
      A = close[0],
      C = [p1.x, p1.y, p1.z],
      sub = (x, y) => x.map((v, i) => v - y[i]),
      len = (x) => Math.hypot(...x),
      /* NO DOGLEGS: a straight rise, a tight bend and a straight drop read as a dogleg ("there are some weird like...
         doglegs in the placement?", Carl, 9 Nov 2026). So the path is one curve that bends a little all the way along: up
         off the rug, over the top above the rug at the high place's height (its handles raised until it peaks there, no
         higher), and down into the room along the line the drop came in on. */
      curve = (H) => {
        const P = [A, [A[0], H, A[2]], [hi[0], H, hi[2]], C];
        return (u) => [0, 1, 2].map((k) => (1 - u) ** 3 * P[0][k] + 3 * u * (1 - u) ** 2 * P[1][k] + 3 * u * u * (1 - u) * P[2][k] + u ** 3 * P[3][k]);
      },
      peakOf = (f) => {
        let m = -Infinity,
          at = 0;
        for (let i = 0; i <= 64; i++) {
          const y = f(i / 64)[1];
          if (y > m) (m = y), (at = i / 64);
        }
        return [m, at];
      };
    let H = hi[1],
      path = curve(H);
    for (let n = 0; n < 5; n++) (H += hi[1] - peakOf(path)[0]), (path = curve(H));
    // measured, so it goes along at one speed
    const K = 96,
      marks = [0],
      across = [0]; // how far across the floor it has gone, at each mark
    for (let i = 1; i <= K; i++) {
      const a = path(i / K),
        b = path((i - 1) / K);
      marks.push(marks[i - 1] + len(sub(a, b)));
      across.push(across[i - 1] + Math.hypot(a[0] - b[0], a[2] - b[2]));
    }
    const S = marks[K],
      // PACE: the share of the way gone at t, its speed rising on a half wave over EASE, even, then falling over EASE
      area = (x) => (x <= 0 ? 0 : x >= EASE ? EASE / 2 + (x - EASE) : (x - (EASE / Math.PI) * Math.sin((Math.PI * x) / EASE)) / 2),
      pace = (x) => (x <= 1 - EASE ? area(x) : 1 - EASE - area(1 - x)) / (1 - EASE),
      d = S * pace(t),
      uAt = (d) => {
        let i = 1;
        while (i < K && marks[i] < d) i++;
        return Math.min(1, (i - 1 + (d - marks[i - 1]) / Math.max(1e-9, marks[i] - marks[i - 1])) / K);
      },
      top = marks[Math.round(peakOf(path)[1] * K)],
      rise = Math.min(1, d / Math.max(1e-9, top));
    /* where it points is set at the ends and the top, never by aiming from where it is: looking almost straight down, an
       aim kept on the rug spun the view round as the camera moved off sideways, his name swinging diagonal. So it eases
       rises square over his name, held at the view it has at the top (the close-up's own angle differed by a few
       degrees, and easing between the two stopped the turn at the top), and from the top turns to the room's on one
       smootherstep, from a standstill */
    camera.position.set(...path(peakOf(path)[1]));
    camera.lookAt(...hiLook);
    const qTop = camera.quaternion.clone();
    camera.position.set(...path(uAt(d)));
    /* TURNING AS IT GOES ACROSS: "why does it rise up and then at the top it like, moves sideways before continuing?
       That's the dogleg I meant" (Carl, 9 Nov 2026). Held looking down until the top while the camera had already begun
       to move across, the view slid sideways over the rug first and turned after. So it turns by how far across the floor
       it has gone, a share for a share: none on the way up, his name square, then turning as it moves across, so the
       slide and the turn are one move, slowing together as it lands. */
    const u = uAt(d),
      j = Math.min(K, Math.floor(u * K)),
      gone = Math.min(1, (across[j] + (j < K ? (u * K - j) * (across[j + 1] - across[j]) : 0)) / Math.max(1e-9, across[K]));
    camera.quaternion.slerpQuaternions(qTop, q1, gone);
    fov = gone <= 0 ? close[2] + (hiFov - close[2]) * leanEase(rise) : hiFov + (fov - hiFov) * gone;
  } else if (OPENING.k > 0) {
    const e = leanEase(close ? 1 - (t - RISE) / (1 - RISE) : OPENING.k),
      mix = (a, b) => a + (b - a) * e,
      p1 = camera.position.clone(),
      q1 = camera.quaternion.clone(),
      [pos, look, f0] = openingFrom(p1, lookDir(cam.yaw, cam.pitch), fov);
    camera.position.set(...pos);
    camera.lookAt(...look);
    const q0 = camera.quaternion.clone();
    camera.position.set(mix(p1.x, pos[0]), mix(p1.y, pos[1]), mix(p1.z, pos[2]));
    camera.quaternion.slerpQuaternions(q1, q0, e);
    fov = mix(fov, f0);
  }
  if (LEAN.k > 0 && LEAN.pos) {
    const e = leanEase(LEAN.k),
      mix = (a, b) => a + (b - a) * e,
      p0 = camera.position.clone(),
      q0 = camera.quaternion.clone();
    camera.position.set(...LEAN.pos);
    camera.lookAt(...LEAN.look);
    const q1 = camera.quaternion.clone();
    camera.position.set(mix(p0.x, LEAN.pos[0]), mix(p0.y, LEAN.pos[1]), mix(p0.z, LEAN.pos[2]));
    camera.quaternion.slerpQuaternions(q0, q1, e);
    fov = mix(fov, LEAN.fov);
  }
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  setLeanBack(leanBackNow(performance.now())); // THE CHAIR AND DRUM LEAN BACK
  faceProps(props, stands);
  setLights(shared, lampLights());
}
/* Turns the camera to look straight at a decoration and zooms the lens right in on it. The camera's place
   depends on where it looks (Sway walks it round the corner), so the aim is found in a few rounds. */
function lookClosely(mesh) {
  const at = mesh.position; // a decoration stands straight in the scene, so this is its place in the room
  const { walk, stand } = MODES[mode];
  let yaw = cam.yaw,
    pitch = cam.pitch;
  for (let i = 0; i < 8; i++) {
    const back = lookDir(REF.yaw + walk * (yaw - REF.yaw), REF.pitch + walk * (pitch - REF.pitch));
    const dx = at.x - (AIM.x - back[0] * stand),
      dy = at.y - (AIM.y - back[1] * stand),
      dz = at.z - (AIM.z - back[2] * stand),
      n = Math.hypot(dx, dy, dz);
    yaw = Math.atan2(dx, dz) - HEADING;
    yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
    pitch = Math.asin(dy / n);
  }
  // past the turn limit if it must be (the clock is beyond it), until he drags again
  cam.tyaw = yaw;
  cam.tpitch = pitch;
  cam.tfov = 3;
  dirty = true;
}
// radians the view turns for one screen pixel
const perPx = () => (camera.fov * Math.PI) / 180 / view().height;
function zoom(dir) {
  const at = ORDER.reduce(
    (a, k) => (Math.abs(LENS[k] - cam.tfov) < Math.abs(LENS[a] - cam.tfov) ? k : a),
    "close",
  );
  cam.tfov = LENS[ORDER[Math.max(0, Math.min(2, ORDER.indexOf(at) + dir))]];
  clamp();
  dirty = true;
}

/* THE WAY ROUND THE SITE (src/nav.mjs): the things that open a window, the flight to each, the windows.
   While one is open or the camera is flying, the drag, the wheel and the keys leave the camera alone. */
const nav = startNav({
  cam,
  START,
  props,
  canvas: cv,
  shared,
  pose,
  onScreen,
  clamp,
  reduced: REDUCED,
  dirty: () => (dirty = true),
  lean,
  camera,
});
// every page's word on the walls (props.mjs and nav.mjs ALL THE WORDS)
scene.add(buildAllWords(nav.wordList()));
// EACH VIEW ITS OWN PLACING (viewtune.mjs): the things on the console as each view has them, and his editor
startViews({ props, dirty: () => (dirty = true) });
// where the room opens, as he set it in the view editor (VIEWS.opening.camera), over START
if (cameraFor("opening")) nav.setCamera("opening");
/* WHERE THE POINTER MEETS A WALL, for the editor's word placing (viewtune.mjs PLACE WORDS): the teal wall (x 0) or the
   cream wall (z 0), whichever the line from the camera through the pointer reaches first, and how far along and up */
function wallAt(clientX, clientY) {
  const b = view(),
    nx = ((clientX - b.left) / b.width) * 2 - 1,
    ny = 1 - ((clientY - b.top) / b.height) * 2;
  camera.updateMatrixWorld();
  const I = camera.projectionMatrixInverse.elements,
    M = camera.matrixWorld.elements,
    un = (z) => {
      const c = [0, 1, 2, 3].map((i) => I[i] * nx + I[4 + i] * ny + I[8 + i] * z + I[12 + i]);
      const q = c.map((v) => v / c[3]);
      return [0, 1, 2].map((i) => M[i] * q[0] + M[4 + i] * q[1] + M[8 + i] * q[2] + M[12 + i]);
    },
    o = un(-1),
    f = un(1),
    d = f.map((v, i) => v - o[i]);
  let best = null;
  // the console's front first: nearer than the teal wall behind it, and only where the console is (props.mjs CONSOLE FRONT)
  const cf = consoleFront();
  if (Math.abs(d[0]) > 1e-9) {
    const t = (cf.x - o[0]) / d[0],
      p = o.map((v, i) => v + d[i] * t);
    if (t > 0 && p[2] >= cf.z0 && p[2] <= cf.z1 && p[1] >= cf.y0 && p[1] <= cf.y1) best = { t, wall: "console", x: p[2], y: p[1] };
  }
  for (const [wall, axis, along] of [["teal", 0, 2], ["cream", 2, 0]]) {
    if (Math.abs(d[axis]) < 1e-9) continue;
    const t = (0.021 - o[axis]) / d[axis];
    if (t <= 0) continue;
    const p = o.map((v, i) => v + d[i] * t);
    if (p[along] < 0 || p[1] < 0 || p[1] > ROOM.h) continue;
    if (!best || t < best.t) best = { t, wall, x: p[along], y: p[1] };
  }
  return best;
}
// the pages' words only: SYNCS (`tour`) has had no thing since the logos went under the bio (3 Nov 2026)
editWords({ says: Object.fromEntries(Object.entries(SAYS).filter(([k]) => k !== "tour")), wallAt });
editViews({ phone: { values: PHONE, set: setPhone }, open: { views: nav.views, names: nav.viewNames, go: (h) => nav.go(h), cameraKeys: (v) => nav.cameraKeys(v), setCamera: (v) => nav.setCamera(v) } });
// THE ROOM'S SOUNDS (src/sound.mjs): off until a visitor turns them on, and Carl's room sound page's way in
const sound = startSound({ nav, props, reduced: REDUCED });
// for the tests and the films (studio/tests): the camera as it is
// `visitors(yaw, pitch)`: whether a visitor's camera can stand where that turn and tilt put it (at the closest lens
// their limits allow, which lets it turn furthest), for tests/lamp.mjs to mark the views only Carl's free camera reaches
window.__studio = { lean: LEAN, cam, START, props, shared, camera, aim: null, visitors: (y, p) => within(y, p, LIMITS.close), lidAt: (k) => (lidAt(k), (dirty = true)) };

/* PINCH TO ZOOM (Carl, 5 Oct 2026: "can you add pinch to zoom so I can make a snapshot of where I
   want the starting camera to be?"). It zooms the lens smoothly, any amount between LENS_MIN and
   LENS_MAX, and comes three ways, because browsers send a pinch three ways: Chrome and Firefox send
   a trackpad pinch as a wheel with ctrl held; Safari sends its own gesture events instead (the first
   version listened only for the wheel, and on Safari "I can't pinch to zoom"); and a touch screen
   sends two fingers. A plain wheel still steps between the three zooms. */
const LENS_MIN = 4,
  LENS_MAX = 80; // the most a pinch may do; the camera's limits (THE CAMERA'S LIMITS) narrow it
const setLens = (f) => {
  cam.tfov = Math.max(LENS_MIN, Math.min(LENS_MAX, f));
  clamp();
  cam.fov = cam.tfov;
  // a pinch is followed straight away, so the turn it may need goes with it, never showing past a limit
  cam.yaw = cam.tyaw;
  cam.pitch = cam.tpitch;
  dirty = true;
};
let gestureFov = 0;
cv.addEventListener("gesturestart", (e) => {
  e.preventDefault();
  if (nav.busy()) return;
  gestureFov = cam.fov;
});
cv.addEventListener("gesturechange", (e) => {
  e.preventDefault();
  if (nav.busy() || !gestureFov) return;
  setLens(gestureFov / e.scale);
});
cv.addEventListener("gestureend", (e) => e.preventDefault());

// fingers and the mouse: one pointer down turns the view, two pinch it
const down = new Map();
const THUMB = 2;
/* A TAP IS NOT A GRAB: "sometimes I try to tap and it latches to my finger and grabs" (Carl, 9 Nov 2026). A finger turned
   the view from its first pixel of movement, at twice a mouse's rate, and a flick carried on when it lifted, so the small
   roll every fingertip makes as it presses turned the room under it, and once it rolled 8px the tap stopped counting as
   one. Now a finger has to move SLOP px before it turns anything, starting from there (no jump), and stays a tap until
   then; a flick carries on only after a real drag. */
const SLOP = 12;
let fling = 0;
let drag = null,
  pinch = null,
  press = null; // where and when the first finger or the mouse went down: a press that never drags is a tap
const spread = () => {
  const [a, b] = [...down.values()];
  return Math.hypot(a.x - b.x, a.y - b.y) || 1;
};
cv.addEventListener("pointerdown", (e) => {
  if (nav.busy() || window.PLACING_WORDS) return; // the word editor's drag of a word takes the pointer (src/wordtune.mjs)
  down.set(e.pointerId, { x: e.clientX, y: e.clientY });
  press = down.size === 1 ? { x: e.clientX, y: e.clientY, at: performance.now(), far: 0 } : null;
  cv.setPointerCapture(e.pointerId);
  if (down.size === 2) {
    drag = null;
    pinch = { d: spread(), fov: cam.fov };
  } else if (down.size === 1) {
    drag = { x: e.clientX, y: e.clientY };
    cv.classList.add("grabbing");
  }
});
cv.addEventListener("pointermove", (e) => {
  if (!down.has(e.pointerId)) {
    if (e.pointerType === "mouse") nav.hover(e.clientX - view().left, e.clientY - view().top);
    return;
  }
  down.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (press) press.far = Math.max(press.far, Math.hypot(e.clientX - press.x, e.clientY - press.y));
  if (nav.busy()) return;
  if (pinch && down.size === 2) {
    setLens((pinch.fov * pinch.d) / spread());
    return;
  }
  if (!drag) return;
  if (e.pointerType === "touch" && !drag.live) {
    if (!press || press.far < SLOP) return; // still a tap
    drag = { x: e.clientX, y: e.clientY, live: true }; // a drag from here: the roll before it turns nothing
    return;
  }
  if (e.pointerType === "touch") {
    /* A THUMB, 2 Nov 2026: "Moving/dragging with my thumb is really slow and kinda glitchy" (Carl). So a finger turns
       the view THUMB times as far as the mouse, moves where the view is going rather than where it is (the frame eases
       after it, so a phone's uneven touches don't jerk it), and a flick carries on a little when the finger lifts. */
    const k = perPx() * THUMB,
      now = performance.now(),
      dx = (e.clientX - drag.x) * k;
    cam.tyaw += dx;
    cam.tpitch += (e.clientY - drag.y) * k;
    const dt = Math.max(8, now - (drag.t || now - 16));
    fling = fling * 0.6 + (dx / dt) * 0.4; // radians a millisecond, smoothed
    drag = { x: e.clientX, y: e.clientY, t: now, live: true };
    clamp();
    dirty = true;
    return;
  }
  const k = perPx();
  cam.tyaw = cam.yaw + (e.clientX - drag.x) * k;
  cam.tpitch = cam.pitch + (e.clientY - drag.y) * k;
  drag = { x: e.clientX, y: e.clientY };
  clamp();
  cam.yaw = cam.tyaw;
  cam.pitch = cam.tpitch;
  dirty = true;
});
cv.addEventListener("pointerleave", () => nav.leave());
/* THE EDGES TURN THE VIEW: "can we have the edges of the card pan/tilt? so you don't have to click and drag but you CAN
   click and drag if you want" (Carl, 3 Nov 2026). A mouse resting in the outer EDGE of the room's card, with no button
   held and no window open, turns the view that way, faster the nearer the edge, within his limits as a drag is. A drag
   still works as it did; a finger never does this (a phone has no pointer resting anywhere). */
const EDGE = 0.1, // how deep the band round the card is, a share of its width and height
  EDGE_PX_S = 520; // how fast it turns at the very edge, in the drag's own screen pixels a second
let edgeAt = null;
/* "when i havce my mouse on the left edge it bounces and doesn't really show the left side" (Carl, 8 Nov 2026). The mouse
   was read only over the room itself, so pushed to the very edge it slipped onto the card's drawn border or the margin
   past it, the room lost it, the lean let go, and coming back on it leaned again: a bounce. So it is read over the whole
   page: anywhere in the band, on the border, or out in the margin up to EDGE_OUT past the card counts as the very edge,
   and only further out, or over a window, a button or the panel, lets go. */
const EDGE_OUT = 80; // px past the card's edge that still count as its edge
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" || e.buttons) return (edgeAt = null);
  const b = view(),
    over = e.target === cv || e.target === document.body || e.target === document.documentElement || !!e.target.closest?.("#stage > .wob");
  const out = Math.max(b.left - e.clientX, e.clientX - b.left - b.width, b.top - e.clientY, e.clientY - b.top - b.height);
  if (!over || out > EDGE_OUT) return (edgeAt = null);
  const c = (v) => Math.min(1, Math.max(0, v));
  edgeAt = { x: c((e.clientX - b.left) / b.width), y: c((e.clientY - b.top) / b.height) };
});
document.documentElement.addEventListener("pointerleave", () => (edgeAt = null));
const edgeOf = (v) => (v < EDGE ? -((1 - v / EDGE) ** 2) : v > 1 - EDGE ? ((v - (1 - EDGE)) / EDGE) ** 2 : 0);
/* THE EDGES LEAN THE VIEW: "i feel like i've asked multiple times to have it pan/tilt when the mouse is on the edges"
   (Carl, 3 Nov 2026). It was there, but from the opening view, which is his widest, his limits leave no room to turn, and
   the view is held level, so the edges moved it about a degree and could not tilt it. Then a lean that pushed the lens
   in to free room, refused the same day: "when i move my mouse to the edge it does a weird zoom in, not panning". So now
   a mouse resting at an edge turns the view that way by up to PEEK_H degrees side to side and PEEK_V up and down, past
   his limits by that much and no more (looked at at twice these: the room holds, the clock and the marching machine come
   in on the left, more wall and lamp on the right), with no zoom; leaving the edge eases it back. It is drawn on top of
   the camera's turn (place), never changing where the camera is, so a drag, a click and a flight start from where they
   always did. `?peekh=` and `?peekv=` try others. */
const PEEK_H = +(new URLSearchParams(location.search).get("peekh") || 6), // degrees it turns at the very edge, side to side
  PEEK_V = +(new URLSearchParams(location.search).get("peekv") || 4), // and up and down
  PEEK_MS = 450; // how quickly it leans in, and back
const peek = { x: 0, y: 0 };
function stepPeek(dt) {
  const want = !edgeAt || drag || down.size || nav.busy() || nav.isOpen?.() || upright() ? [0, 0] : [edgeOf(edgeAt.x), edgeOf(edgeAt.y)];
  const a = REDUCED ? 1 : 1 - Math.exp((-dt * 1000) / PEEK_MS);
  const was = [peek.x, peek.y];
  peek.x += (want[0] - peek.x) * a;
  peek.y += (want[1] - peek.y) * a;
  if (Math.abs(peek.x - want[0]) < 1e-4) peek.x = want[0];
  if (Math.abs(peek.y - want[1]) < 1e-4) peek.y = want[1];
  return peek.x !== was[0] || peek.y !== was[1];
}
function edgeTurn(dt) {
  const leaned = stepPeek(dt);
  if (!edgeAt || drag || down.size || nav.busy() || upright()) return leaned;
  const ex = edgeOf(edgeAt.x),
    ey = edgeOf(edgeAt.y);
  if (!ex && !ey) return leaned;
  // the other way from a drag: a drag pulls the room with the mouse; resting at the right edge looks to the right
  const k = perPx() * EDGE_PX_S * dt,
    was = [cam.tyaw, cam.tpitch];
  cam.tyaw -= ex * k;
  if (!level) cam.tpitch -= ey * k;
  clamp();
  return leaned || cam.tyaw !== was[0] || cam.tpitch !== was[1];
}
const end = (e) => {
  if (press && down.size === 1 && e.type === "pointerup") {
    if (press.far < (e.pointerType === "touch" ? SLOP : 8) && performance.now() - press.at < 700 && !window.WORDS_EDITOR) nav.tap(e.clientX - view().left, e.clientY - view().top);
    press = null;
  }
  down.delete(e.pointerId);
  if (down.size < 2) pinch = null;
  if (down.size === 0) {
    // a flick carries on: about a quarter second more of the speed it had
    if (drag?.live && e.pointerType === "touch" && e.type === "pointerup" && performance.now() - (drag.t || 0) < 80) {
      cam.tyaw += fling * 260;
      clamp();
      dirty = true;
    }
    fling = 0;
    drag = null;
    cv.classList.remove("grabbing");
  }
};
cv.addEventListener("pointerup", end);
cv.addEventListener("pointercancel", end);
// and a finger the page lost track of lets go, so the view never stays stuck to one that has lifted
cv.addEventListener("lostpointercapture", (e) => down.has(e.pointerId) && end(e));
let wheel = 0;
cv.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (nav.busy()) return;
    if (e.ctrlKey) {
      setLens(cam.fov * Math.exp(e.deltaY * 0.01));
      return;
    }
    /* A TRACKPAD SWIPE turns the view, as a drag does: up and down tilts it, left and right sways it.
       It stepped the zoom, like a mouse wheel, so swiping up and down zoomed: "I asked for up and down
       control which should adjust the pov angle, but now swiping up or down just zooms in and out?"
       (Carl, 5 Oct 2026). A trackpad sends small, smooth steps, often sideways too; a mouse wheel,
       big notches straight up and down, still steps the zoom. */
    const pad = e.deltaMode === 0 && (e.deltaX !== 0 || Math.abs(e.deltaY) < 50 || !Number.isInteger(e.deltaY));
    if (pad) {
      const k = perPx();
      cam.tyaw = cam.yaw + e.deltaX * k;
      cam.tpitch = cam.pitch + e.deltaY * k;
      clamp();
      cam.yaw = cam.tyaw;
      cam.pitch = cam.tpitch;
      dirty = true;
      return;
    }
    wheel += e.deltaY;
    if (Math.abs(wheel) > 40) {
      zoom(Math.sign(wheel));
      wheel = 0;
    }
  },
  { passive: false },
);
addEventListener("keydown", (e) => {
  if (nav.busy() || e.target.closest?.("#arrange, #win")) return;
  const step = 0.08;
  if (e.key === "+" || e.key === "=") zoom(-1);
  else if (e.key === "-" || e.key === "_") zoom(1);
  else if (e.key === "ArrowLeft") cam.tyaw += step;
  else if (e.key === "ArrowRight") cam.tyaw -= step;
  else if (e.key === "ArrowUp") cam.tpitch += step;
  else if (e.key === "ArrowDown") cam.tpitch -= step;
  else return;
  e.preventDefault();
  clamp();
  dirty = true;
});

/* ---------- the loop ---------- */
let W = 0,
  H = 0,
  last = 0,
  shown = -1,
  dirty = true;
/* SMOOTH WHILE IT MOVES: "mannnnn desktop it glitchy as fuck. it seems like ALL movement is 8fps just because the boil is
   8fps" (Carl, 4 Nov 2026). At rest the room redraws only when the boil changes, eight times a second, which any machine
   keeps up with; while the camera moves it redraws every frame, at up to twice the screen's pixels, the grain, light and
   boil on every surface, and a graphics chip that cannot keep up drops to a few frames a second. So while something
   moves and frames come slower than SLOW_MS, the room draws at fewer pixels, a step at a time down to one a screen
   pixel; settled for SETTLE_MS, it draws at full sharpness again. `?fps=1` shows the frame rate and the pixels drawn. */
const FULL_PR = renderer.getPixelRatio(),
  SLOW_MS = 22,
  SETTLE_MS = 350;
let pr = FULL_PR,
  frameMs = 16,
  movedAt = 0,
  lastDraw = 0;
const seen = [0, 0, 0];
let wasMoving = false;
const setPR = (v) => {
  pr = v;
  renderer.setPixelRatio(v);
  if (W && H) renderer.setSize(W, H, false);
};
const meter = new URLSearchParams(location.search).get("fps") === "1" && document.body.appendChild(Object.assign(document.createElement("div"), { style: "position:fixed;right:8px;bottom:8px;z-index:99;font:600 12px system-ui;background:#2c2c2a;color:#f4ead8;padding:4px 8px;border-radius:6px;pointer-events:none" }));
let meterFrames = 0,
  meterFrom = 0;
function tick(now) {
  requestAnimationFrame(tick);
  /* A page can open before its window has a size (the artifact viewer does), so wait for one,
     and nothing here may stop the loop. */
  const vb = fitStage(); // the room's card (src/stage.mjs): its size, not the window's
  if (Math.round(vb.width) !== W || Math.round(vb.height) !== H) {
    W = Math.round(vb.width);
    H = Math.round(vb.height);
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    widenForAspect(W / H);
    nav.refit(); // a page open: its thing framed again for the new shape
    dirty = true;
  }
  if (!W || !H) return;
  phoneProps(drumTurn(now), upright()); // THE DRUM TURNS BACK, to where it rests on a phone
  const dt = Math.min(0.1, (now - last) / 1000 || 0);
  last = now;
  const navMoved = nav.step(now);
  if (navMoved) dirty = true; // a flight, and the things under the pointer or the keyboard
  const edgeMoved = edgeTurn(dt);
  if (edgeMoved) dirty = true; // the mouse resting at an edge of the card (THE EDGES TURN THE VIEW)
  // a finger down eases quickly after it (A THUMB, below); otherwise the slow glide
  const k = REDUCED ? 1 : 1 - Math.exp(-(drag && drag.t ? 22 : 3.2) * dt);
  for (const [a, b] of [
    ["yaw", "tyaw"],
    ["pitch", "tpitch"],
    ["fov", "tfov"],
  ]) {
    if (cam[a] === cam[b]) continue;
    cam[a] += (cam[b] - cam[a]) * k;
    if (Math.abs(cam[b] - cam[a]) < 0.0005) cam[a] = cam[b];
    dirty = true;
  }
  // the camera turned or zoomed since the last frame (a drag, a flight, the glide, the edges), a flight or a hover
  let moving = navMoved || edgeMoved || cam.yaw !== seen[0] || cam.pitch !== seen[1] || cam.fov !== seen[2];
  seen[0] = cam.yaw;
  seen[1] = cam.pitch;
  seen[2] = cam.fov;
  const f = REDUCED ? 1 : BOIL_ORDER[Math.floor(now / BOIL_MS) % 4];
  if (f !== shown) {
    boilPhases(f);
    shared.boil.value = f;
    shown = f;
    dirty = true;
  }
  if (tickProps(now, REDUCED)) dirty = true; // the snow globe's flag and the clock's hands
  if (stepLean(now)) dirty = moving = true; // THE LEAN
  if (stepOpening(now)) dirty = moving = true; // THE OPENING FLYOVER
  if (stepViews(now, REDUCED)) dirty = true; // EACH VIEW ITS OWN PLACING
  // SMOOTH WHILE IT MOVES
  if (moving) {
    // two moving frames in a row: how long one took
    if (wasMoving && lastDraw) frameMs = frameMs * 0.6 + (now - lastDraw) * 0.4;
    movedAt = now;
    if (frameMs > SLOW_MS && pr > 1) setPR(Math.max(1, frameMs > 2 * SLOW_MS ? 1 : pr - 0.25)), (frameMs = 16);
  } else if (pr < FULL_PR && now - movedAt > SETTLE_MS) setPR(FULL_PR), (dirty = true), (frameMs = 16);
  wasMoving = moving;
  if (meter) {
    if (now - meterFrom > 500) (meter.textContent = Math.round((meterFrames * 1000) / (now - meterFrom)) + " fps · " + pr.toFixed(2) + "x"), (meterFrom = now), (meterFrames = 0);
  }
  if (!dirty) return;
  dirty = false;
  if (meter) meterFrames++;
  lastDraw = now;
  place();
  shared.linePx.value = linePx * renderer.getPixelRatio();
  renderer.render(scene, camera);
}
requestAnimationFrame(tick);
