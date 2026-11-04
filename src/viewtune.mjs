/* EACH VIEW ITS OWN PLACING. Carl, 2 Nov 2026, after the dog and its book were nudged by eye five times and lined up
   in one view only to come apart in the next: "How can you give me a single editor page where I can fix this myself in
   the different views? Like to get a view set and then it saves the settings for that view, then I can adjust another
   view without it changing the settings in the others".

   So a thing on the console (the dog, the book, the mug, the photo, the snow globe) can be placed differently in each view:
   the room as it opens ("opening") and each window's view (its address, nav.mjs THINGS). A view's settings are laid
   over the thing's own (PROPS); a view with none for it leaves it as PROPS has it. While the camera flies from one view
   to another the things glide from one view's settings to the next's, so nothing jumps.

   His settings are kept in the page's database at views/<view> (one document a view, { <thing>: { <key>: value } }),
   and written into VIEWS below once he is happy, as the arranging panel's were, so the room itself never reads the
   database. The panel (EDIT VIEWS, below) lives in its own artifact, not in the room: "Artifact not a page please"
   (Carl, 2 Nov 2026). That copy of the room is built with window.STUDIO_EDITOR set (build-editor.sh). */
import { setProp, setDeckDepth, DECK_DEPTH, setDeckMove, DECK_MOVE, setDeckUI, DECK_UI } from "./props.mjs";

// his settings, saved in the view editor (https://claude.ai/artifact/CwMdQ5PqSBDnxgjNHHB5xy) and written in here on
// 2 Nov 2026 (the dog's first, then the cameras), so the room has them without the database
export const VIEWS = {
  opening: { dog: { inset: 0.212, up: 0.027 } },
  artists: { dog: { up: 0.023 }, camera: { yaw: 0.076, pitch: 0.152, fov: 11.35 } },
  bio: { dog: { along: 0.436, up: 0.023 } },
  tour: { camera: { yaw: -0.773, pitch: -0.3742, fov: 9.3 } },
  "co-producer": { camera: { yaw: -0.195, pitch: 0.131, fov: 6.4 } },
  contact: { dog: { inset: 0.15 }, camera: { yaw: 0.394, pitch: -0.1104, fov: 4.6 } },
  "my-people": { camera: { yaw: -0.7051, pitch: -0.097, fov: 6.7529 } },
};

// what can be placed, and how: [key, label, min, max, step]
const THINGS = [
  ["dog", "Dog"],
  ["book", "Book"],
  ["mug", "Mug"],
  ["frame", "Photo"],
  ["globe", "Snow globe"],
];
const KEYS = [
  ["along", "Left / right", 0, 1.9, 0.002],
  ["inset", "Front / back", -0.1, 0.69, 0.002],
  ["up", "Up / down", -0.1, 0.2, 0.001],
  ["w", "Size", 0.05, 0.9, 0.002],
  ["tilt", "Tilt", -20, 20, 0.25],
  ["follow", "Turns to you", 0, 1, 0.01],
  ["spin", "Spin", -180, 180, 0.5],
];
const BLEND_MS = 1800; // the flight's own length (nav.mjs FLY_MS), so the things land as the camera does

let props = [],
  dirty = () => {},
  base = {}, // each thing's own settings, as PROPS has them
  saved = {}, // VIEWS, then the database over it
  from = "opening",
  to = "opening",
  k = 1,
  last = 0;

const meshOf = (id) => props.find((m) => m.userData.prop.id === id);
const settingsFor = (view, id) => ({ ...base[id], ...(saved[view] && saved[view][id]) });

function apply() {
  const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  for (const [id] of THINGS) {
    const m = meshOf(id);
    if (!m) continue;
    const a = settingsFor(from, id),
      b = settingsFor(to, id),
      out = {};
    for (const [key] of KEYS) {
      if (a[key] == null && b[key] == null) continue;
      const x = a[key] ?? b[key],
        y = b[key] ?? a[key];
      out[key] = x + (y - x) * e;
    }
    setProp(m, out);
  }
  dirty();
}

export function startViews(v) {
  props = v.props;
  dirty = v.dirty;
  for (const [id] of THINGS) {
    const m = meshOf(id);
    if (!m) continue;
    const p = m.userData.prop;
    base[id] = Object.fromEntries(KEYS.map(([key]) => [key, p[key]]).filter(([, x]) => x != null));
  }
  saved = JSON.parse(JSON.stringify(VIEWS));
  k = 0; // laid on at the first frame (stepViews), once the room's clock is running
}
// the view the room is going to: "opening" with no window, else the window's address
export function goToView(view) {
  view = view || "opening";
  if (view === to) return;
  from = to;
  to = view;
  k = 0;
  last = 0;
}
export function stepViews(now, reduced) {
  if (k >= 1) return false;
  const dt = last ? now - last : 0;
  last = now;
  k = reduced ? 1 : Math.min(1, k + dt / BLEND_MS);
  apply();
  return true;
}
export function currentView() {
  return to;
}
/* WHERE THE CAMERA LANDS, a view at a time: "can we add an option where I can reposition the camera? Like the camera's
   final resting place?" (Carl, 2 Nov 2026). Kept beside the things as `camera`: a window's turn, tilt and zoom
   ({ yaw, pitch, fov }), the console's lean ({ ox, oy, oz, ly, lz, fov }), the opening's turn, tilt and zoom. nav.mjs
   reads it when it flies; with none, the flight frames the thing as it always has. */
export function cameraFor(view) {
  return (saved[view] && saved[view].camera) || null;
}

/* EDIT VIEWS: his panel. A view picker (which takes the camera there), a thing picker, a slider a setting, Save and
   Reset. Shown to an editor alone, behind a button outside the room's card; the database keeps what he saves. */
export async function editViews({ open, phone }) {
  if (!window.STUDIO_EDITOR) return; // the room itself: VIEWS alone, no database, no panel
  const [db] = await Promise.all(
    [window.claude?.use?.("db")].map((p) => Promise.resolve(p).catch(() => null)),
  );
  if (db) {
    try {
      for (const view of ["opening", ...open.views]) {
        const d = await db.doc("views/" + view).get();
        if (d.exists) {
          saved[view] = { ...(saved[view] || {}), ...d.data().things };
          if (d.data().camera) saved[view].camera = d.data().camera;
        }
      }
      apply();
      if (cameraFor("opening")) open.setCamera("opening");
      const dd = await db.doc("deck/depth").get();
      if (dd.exists) (setDeckDepth(dd.data().depth || {}), setDeckMove(dd.data().move || {}), setDeckUI(dd.data().ui || {}));
    } catch {
      /* nothing saved yet */
    }
  }
  if (!db) return;
  const el = (tag, attrs = {}, kids = []) => {
    const e = Object.assign(document.createElement(tag), attrs);
    e.append(...kids);
    return e;
  };
  const panel = el("div", { id: "edit-views" });
  document.body.append(panel);
  const viewSel = el("select", { id: "ev-view" }, [
    el("option", { value: "opening", textContent: "Where the room opens" }),
    ...open.views.map((h, i) => el("option", { value: h, textContent: open.names[i] })),
  ]);
  const thingSel = el("select", { id: "ev-thing" }, THINGS.filter(([id]) => meshOf(id)).map(([id, name]) => el("option", { value: id, textContent: name })));
  const rows = el("div", { className: "ev-rows" });
  const status = el("p", { className: "ev-status" });
  const save = el("button", { type: "button", textContent: "Save this view" });
  const reset = el("button", { type: "button", textContent: "Reset this thing here" });
  const camRows = el("div", { className: "ev-rows" });
  const camReset = el("button", { type: "button", textContent: "Reset the camera here" });
  const deckRows = el("div", { className: "ev-rows" });
  const phoneRows = el("div", { className: "ev-rows" });
  const phoneSave = el("button", { type: "button", textContent: "Save phone view" });
  const deckSave = el("button", { type: "button", textContent: "Save turntable" });
  panel.append(
    el("label", {}, [el("span", { textContent: "View" }), viewSel]),
    el("label", {}, [el("span", { textContent: "Thing" }), thingSel]),
    rows,
    el("p", { className: "ev-head", textContent: "Camera" }),
    camRows,
    el("div", { className: "ev-buttons" }, [save, reset]),
    el("div", { className: "ev-buttons" }, [camReset]),
    el("p", { className: "ev-head", textContent: "Phone opening view" }),
    phoneRows,
    el("div", { className: "ev-buttons" }, [phoneSave]),
    el("p", { className: "ev-head", textContent: "Turntable thickness" }),
    deckRows,
    el("div", { className: "ev-buttons" }, [deckSave]),
    status,
  );
  /* THE TURNTABLE'S THICKNESS, the same in every view: "i'll want separate depth control for the record, the player
     arm, the base" (Carl, 2 Nov 2026). In millimetres here, metres in props.mjs DECK_DEPTH; kept at deck/depth. */
  // the arm's three hang down from its top (props.mjs DECK_DEPTH): "the highest plane would be even across them"
  for (const [key, label, max] of [["base", "Base", 45], ["mat", "Slip mat", 12], ["record", "Record", 12], ["arm", "Arm top, over the base", 60], ["pivot", "Pivot depth", 60], ["tube", "Cream arm depth", 30], ["head", "Head depth", 30]]) {
    const input = el("input", { type: "range", min: 0, max, step: 0.5, value: DECK_DEPTH[key] * 1000, id: "ev-deck-" + key });
    const num = el("span", { className: "ev-num", textContent: (DECK_DEPTH[key] * 1000).toFixed(1) + " mm" });
    input.addEventListener("input", () => {
      setDeckDepth({ [key]: +input.value / 1000 });
      num.textContent = (+input.value).toFixed(1) + " mm";
      status.textContent = "Not saved";
    });
    deckRows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
  }
  /* WHERE THE RECORD AND ARM SIT ON THE DECK, moved together: "Gimme an editor with controls to move it along that
     plane" (Carl, 2 Nov 2026). Shares of the deck's width, props.mjs DECK_MOVE. */
  for (const [key, label] of [["x", "Record + arm: left / right"], ["z", "Record + arm: back / front"]]) {
    const input = el("input", { type: "range", min: -0.25, max: 0.25, step: 0.005, value: DECK_MOVE[key], id: "ev-deckmove-" + key });
    const num = el("span", { className: "ev-num", textContent: (+DECK_MOVE[key]).toFixed(3) });
    input.addEventListener("input", () => {
      setDeckMove({ [key]: +input.value });
      num.textContent = (+input.value).toFixed(3);
      status.textContent = "Not saved";
    });
    deckRows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
  }
  /* THE DECK'S BUTTONS AND WORDS: "Can you give me control to edit and move the button sizes and the text sizes?" (Carl,
     3 Nov 2026). props.mjs DECK_UI; saved with the rest at deck/depth as `ui`. */
  deckRows.append(el("p", { className: "ev-head", textContent: "Deck buttons and words" }));
  for (const [key, label, min, max, step] of [
    ["keySize", "Keys: size", 0.5, 1.8, 0.01],
    ["keysX", "Keys: left / right", -0.15, 0.15, 0.002],
    ["keysY", "Keys: up / down", -0.2, 0.15, 0.002],
    ["titleSize", "Song: size", 0.5, 2, 0.01],
    ["artistSize", "Artist: size", 0.5, 2, 0.01],
    ["textX", "Words: left / right", -0.2, 0.3, 0.002],
    ["textY", "Words: up / down", -0.2, 0.15, 0.002],
    ["lineY", "Progress line: up / down", -0.15, 0.08, 0.002],
    ["knobSize", "Knob: size", 0.5, 2, 0.01],
  ]) {
    const input = el("input", { type: "range", min, max, step, value: DECK_UI[key], id: "ev-deckui-" + key });
    const num = el("span", { className: "ev-num", textContent: (+DECK_UI[key]).toFixed(3) });
    input.addEventListener("input", () => {
      setDeckUI({ [key]: +input.value });
      num.textContent = (+input.value).toFixed(3);
      status.textContent = "Not saved";
    });
    deckRows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
  }
  /* THE PHONE'S OPENING VIEW (studio.mjs PHONE): "Show as a phone" draws the room phone-shaped, as a phone held upright
     sees it, and the sliders move where it opens. "i'll want to re-position the "landing camera view" for them" (Carl,
     3 Nov 2026). Kept at phone/opening. */
  // the words on the walls have their own editor now (src/wordtune.mjs), not this one
  if (phone) {
    try {
      const pd = await db.doc("phone/opening").get();
      if (pd.exists) phone.set(pd.data().phone || {});
    } catch {
      /* none saved */
    }
    const show = el("input", { type: "checkbox", id: "ev-phone" });
    show.addEventListener("change", () => {
      window.PHONE_PREVIEW = show.checked;
      phone.set({}); // its opening laid on in the new shape
    });
    phoneRows.append(el("label", {}, [el("span", { textContent: "Show as a phone" }), show]));
    for (const [key, label, min, max, step] of [
      ["turn", "Turn", -0.6, 0.6, 0.002],
      ["tilt", "Tilt (floor to soffit)", 0, 1, 0.01],
      ["zoom", "Zoom (1 widest)", 0.4, 1, 0.01],
    ]) {
      const input = el("input", { type: "range", min, max, step, value: phone.values[key], id: "ev-phone-" + key });
      const num = el("span", { className: "ev-num", textContent: (+phone.values[key]).toFixed(3) });
      input.addEventListener("input", () => {
        if (!show.checked) (show.checked = true), (window.PHONE_PREVIEW = true);
        phone.set({ [key]: +input.value });
        num.textContent = (+input.value).toFixed(3);
        status.textContent = "Not saved";
      });
      phoneRows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
    }
    phoneSave.addEventListener("click", async () => {
      try {
        await db.doc("phone/opening").set({ phone: { ...phone.values }, savedAt: new Date().toISOString() });
        status.textContent = "Saved";
      } catch (e) {
        status.textContent = "Couldn't save: " + (e?.message || e);
      }
    });
  }
  deckSave.addEventListener("click", async () => {
    try {
      await db.doc("deck/depth").set({ depth: { ...DECK_DEPTH }, move: { ...DECK_MOVE }, ui: { ...DECK_UI }, savedAt: new Date().toISOString() });
      status.textContent = "Saved";
    } catch (e) {
      status.textContent = "Couldn't save: " + (e?.message || e);
    }
  });
  const draw = () => {
    rows.textContent = "";
    const view = viewSel.value,
      id = thingSel.value,
      now = settingsFor(view, id);
    for (const [key, label, min, max, step] of KEYS) {
      if (now[key] == null) continue;
      const input = el("input", { type: "range", min, max, step, value: now[key], id: "ev-" + key });
      const num = el("span", { className: "ev-num", textContent: (+now[key]).toFixed(3) });
      input.addEventListener("input", () => {
        saved[view] = saved[view] || {};
        saved[view][id] = { ...(saved[view][id] || {}), [key]: +input.value };
        num.textContent = (+input.value).toFixed(3);
        status.textContent = "Not saved";
        if (to === view) apply();
      });
      rows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
    }
    camRows.textContent = "";
    for (const [key, label, min, max, step, value] of open.cameraKeys(view)) {
      const input = el("input", { type: "range", min, max, step, value, id: "ev-cam-" + key });
      const num = el("span", { className: "ev-num", textContent: (+value).toFixed(3) });
      input.addEventListener("input", () => {
        saved[view] = saved[view] || {};
        const now = Object.fromEntries(open.cameraKeys(view).map((r) => [r[0], r[5]]));
        saved[view].camera = { ...now, ...(saved[view].camera || {}), [key]: +input.value };
        num.textContent = (+input.value).toFixed(3);
        status.textContent = "Not saved";
        open.setCamera(view);
      });
      camRows.append(el("label", {}, [el("span", { textContent: label }), input, num]));
    }
  };
  viewSel.addEventListener("change", () => {
    open.go(viewSel.value);
    draw();
  });
  thingSel.addEventListener("change", draw);
  save.addEventListener("click", async () => {
    const view = viewSel.value;
    try {
      const { camera, ...things } = saved[view] || {};
      await db.doc("views/" + view).set({ things, ...(camera ? { camera } : {}), savedAt: new Date().toISOString() });
      status.textContent = "Saved";
    } catch (e) {
      status.textContent = "Couldn't save: " + (e?.message || e);
    }
  });
  reset.addEventListener("click", () => {
    const view = viewSel.value;
    if (saved[view]) delete saved[view][thingSel.value];
    status.textContent = "Not saved";
    if (to === view) apply();
    draw();
  });
  camReset.addEventListener("click", () => {
    const view = viewSel.value;
    if (saved[view]) delete saved[view].camera;
    status.textContent = "Not saved";
    open.setCamera(view);
    draw();
  });
  draw();
}
