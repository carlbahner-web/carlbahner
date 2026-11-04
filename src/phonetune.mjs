/* THE PHONE STOP EDITOR: each phone stop's camera and where its word sits, phone only, in its own artifact. Carl, 4 Nov
   2026: "i need an artifa5 that allows me to control the per-swipe-camera and the placement of the words. Phone/mobile
   version only please".

   The room is drawn phone-shaped (stage.mjs PHONE_PREVIEW) on its stops (nav.mjs ONE THING AT A TIME ON A PHONE), the panel
   on the left. Pick a stop; drag the room to turn its camera, the wheel or a pinch to zoom, or the sliders. Drag its word
   to move it (onto either wall, flat on it), and size, width, direction and quarter turns as on the word editor
   (wordtune.mjs). Saved at phone/stops in this artifact's database, then written into nav.mjs PHONE_CAMS and props.mjs
   WORD_AT_PHONE once he is happy, so the site itself never reads it. Built with window.SNAP_EDITOR set (build-phone.sh). */
import { setHoverWordsAt, hoverWordsAt, hoverWordsBox, WORD_AT_PHONE } from "./props.mjs";
import { PHONE_CAMS } from "./nav.mjs";

export async function editPhone({ nav, wallAt }) {
  if (!window.SNAP_EDITOR) return;
  const E = nav.snapEdit;
  // the stops are laid out once the room has drawn (nav.mjs whenReady)
  while (!E.list().length) await new Promise((r) => setTimeout(r, 200));
  const db = await Promise.resolve(window.claude?.use?.("db")).catch(() => null);
  if (db) {
    try {
      const d = await db.doc("phone/stops").get();
      if (d.exists) {
        Object.assign(PHONE_CAMS, d.data().cams || {});
        Object.assign(WORD_AT_PHONE, d.data().words || {});
        E.reorder();
      }
    } catch {
      /* nothing saved yet */
    }
  }
  const el = (tag, attrs = {}, kids = []) => {
    const e = Object.assign(document.createElement(tag), attrs);
    e.append(...kids);
    return e;
  };
  const panel = el("div", { id: "edit-views" });
  document.body.append(panel);
  const status = el("p", { className: "ev-status" });
  const dirty = () => (status.textContent = "Not saved");
  const pick = el("select", { id: "pt-stop" });
  const fill = () => {
    pick.replaceChildren(...E.list().map((s, i) => el("option", { value: i, textContent: s.says ? `${s.name}: ${s.says.toUpperCase()}` : s.name })));
    pick.value = E.at();
  };
  fill();
  const prev = el("button", { type: "button", textContent: "‹ Previous" }),
    next = el("button", { type: "button", textContent: "Next ›" });
  const slider = (id, min, max, step) => ({ input: el("input", { type: "range", min, max, step, id }), num: el("span", { className: "ev-num" }) });
  const turn = slider("pt-turn", -1.2, 1.2, 0.001),
    tilt = slider("pt-tilt", -0.7, 0.5, 0.001),
    zoom = slider("pt-zoom", 4, 45, 0.05),
    size = slider("pt-size", 0.06, 0.8, 0.005),
    width = slider("pt-width", 0.2, 3, 0.01);
  const auto = el("button", { type: "button", textContent: "Camera back to automatic" }),
    across = el("button", { type: "button", textContent: "Left to right" }),
    down = el("button", { type: "button", textContent: "Top to bottom" }),
    left = el("button", { type: "button", textContent: "Turn left 90°" }),
    right = el("button", { type: "button", textContent: "Turn right 90°" }),
    laptop = el("button", { type: "button", textContent: "Word back to the laptop's spot" }),
    save = el("button", { type: "button", textContent: "Save every stop" });
  const row = (label, s) => el("label", {}, [el("span", { textContent: label }), s.input, s.num]);
  const wordBits = el("div", {}, [
    el("p", { className: "ev-head", textContent: "Word" }),
    row("Size", size),
    row("Width", width),
    el("div", { className: "ev-buttons" }, [across, down]),
    el("div", { className: "ev-buttons" }, [left, right]),
    el("div", { className: "ev-buttons" }, [laptop]),
  ]);
  panel.append(
    el("label", {}, [el("span", { textContent: "Stop" }), pick]),
    el("div", { className: "ev-buttons" }, [prev, next]),
    el("p", { className: "ev-head", textContent: "Camera" }),
    row("Turn", turn),
    row("Tilt", tilt),
    row("Zoom", zoom),
    el("div", { className: "ev-buttons" }, [auto]),
    wordBits,
    el("div", { className: "ev-buttons" }, [save]),
    status,
  );
  const stop = () => E.list()[E.at()];
  const key = () => stop().key;
  function show() {
    pick.value = E.at();
    const c = E.cam();
    turn.input.value = c.yaw;
    turn.num.textContent = ((c.yaw * 180) / Math.PI).toFixed(1) + "°";
    tilt.input.value = c.pitch;
    tilt.num.textContent = ((c.pitch * 180) / Math.PI).toFixed(1) + "°";
    zoom.input.value = c.fov;
    zoom.num.textContent = (+c.fov).toFixed(1) + "°";
    auto.disabled = !PHONE_CAMS[key()];
    wordBits.hidden = !stop().says;
    if (!stop().says) return;
    const at = hoverWordsAt(key());
    size.input.value = at.s;
    size.num.textContent = Math.round(at.s * 100) + " cm";
    width.input.value = at.w;
    width.num.textContent = (+at.w).toFixed(2) + " m";
    width.input.disabled = at.dir === "down"; // a column of letters runs as tall as the word is long
    across.style.opacity = at.dir === "down" ? 0.5 : 1;
    down.style.opacity = at.dir === "down" ? 1 : 0.5;
    laptop.disabled = !WORD_AT_PHONE[key()];
  }
  const go = (i) => (E.go(i), show());
  pick.addEventListener("change", () => go(+pick.value));
  prev.addEventListener("click", () => go(E.at() - 1));
  next.addEventListener("click", () => go(E.at() + 1));
  const setCam = (p) => {
    E.setCam({ ...E.cam(), ...p });
    show();
    dirty();
  };
  turn.input.addEventListener("input", () => setCam({ yaw: +turn.input.value }));
  tilt.input.addEventListener("input", () => setCam({ pitch: +tilt.input.value }));
  zoom.input.addEventListener("input", () => setCam({ fov: +zoom.input.value }));
  auto.addEventListener("click", () => (E.setCam(null), show(), dirty()));
  // the first change to a word on the phone starts from the laptop's spot at the size it was showing, so nothing jumps
  const setWord = (at) => {
    if (!WORD_AT_PHONE[key()]) {
      const was = hoverWordsAt(key()),
        k = E.scale();
      WORD_AT_PHONE[key()] = { ...was, s: was.s * k, w: was.w * k };
    }
    setHoverWordsAt(at, key());
    E.words();
    show();
    dirty();
  };
  size.input.addEventListener("input", () => setWord({ s: +size.input.value }));
  width.input.addEventListener("input", () => setWord({ w: +width.input.value }));
  across.addEventListener("click", () => setWord({ dir: "across" }));
  down.addEventListener("click", () => setWord({ dir: "down" }));
  left.addEventListener("click", () => setWord({ rot: ((hoverWordsAt(key()).rot || 0) + 270) % 360 }));
  right.addEventListener("click", () => setWord({ rot: ((hoverWordsAt(key()).rot || 0) + 90) % 360 }));
  laptop.addEventListener("click", () => {
    delete WORD_AT_PHONE[key()];
    E.words();
    show();
    dirty();
  });
  save.addEventListener("click", async () => {
    if (!db) return void (status.textContent = "Couldn't save: no database here");
    try {
      await db.doc("phone/stops").set({ cams: { ...PHONE_CAMS }, words: { ...WORD_AT_PHONE }, savedAt: new Date().toISOString() });
      status.textContent = "Saved";
    } catch (e) {
      status.textContent = "Couldn't save: " + (e?.message || e);
    }
  });
  show();

  /* THE DRAG: a press on the word moves it; a press anywhere else turns the camera. The room's own drag and swipe never
     see either (they listen after this, without capture). The wheel or a trackpad pinch zooms. */
  const room = document.querySelector("#room");
  const onWord = (hit) => {
    if (!hit || !stop().says) return false;
    const at = hoverWordsAt(key()),
      [bw, bh] = hoverWordsBox().map((v) => v * (WORD_AT_PHONE[key()] ? 1 : E.scale()));
    return hit.wall === at.wall && Math.abs(hit.x - at.x) <= bw / 2 + 0.05 && Math.abs(hit.y - at.y) <= bh / 2 + 0.05;
  };
  let grab = null;
  room.addEventListener(
    "pointerdown",
    (e) => {
      e.stopImmediatePropagation();
      room.setPointerCapture(e.pointerId);
      const hit = wallAt(e.clientX, e.clientY);
      if (onWord(hit)) {
        const at = hoverWordsAt(key());
        grab = { id: e.pointerId, word: true, dx: hit.x - at.x, dy: hit.y - at.y };
      } else grab = { id: e.pointerId, word: false, x: e.clientX, y: e.clientY, from: E.cam() };
    },
    true,
  );
  room.addEventListener(
    "pointermove",
    (e) => {
      e.stopImmediatePropagation();
      if (!grab) {
        room.style.cursor = onWord(wallAt(e.clientX, e.clientY)) ? "move" : "grab";
        return;
      }
      if (e.pointerId !== grab.id) return;
      if (grab.word) {
        const hit = wallAt(e.clientX, e.clientY);
        if (!hit) return;
        // onto the other wall, the word's middle comes to the pointer
        if (hit.wall !== hoverWordsAt(key()).wall) grab.dx = grab.dy = 0;
        setWord({ wall: hit.wall, x: Math.max(0, hit.x - grab.dx), y: Math.max(0, hit.y - grab.dy) });
        return;
      }
      // a pixel turns the view about as far as the lens shows a pixel, so the room stays under the pointer
      const h = room.getBoundingClientRect().height || 1,
        k = ((grab.from.fov * Math.PI) / 180) / h;
      setCam({ yaw: grab.from.yaw + (e.clientX - grab.x) * k, pitch: grab.from.pitch + (e.clientY - grab.y) * k });
    },
    true,
  );
  const drop = (e) => {
    e.stopImmediatePropagation();
    grab = null;
  };
  room.addEventListener("pointerup", drop, true);
  room.addEventListener("pointercancel", drop, true);
  room.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      setCam({ fov: Math.max(4, Math.min(45, E.cam().fov * Math.exp(e.deltaY * 0.0015))) });
    },
    { capture: true, passive: false },
  );
}
