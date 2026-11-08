/* THE WORD EDITOR: where each page's word sits on the walls (props.mjs EACH WORD ITS OWN SPOT), in its own artifact.
   "i want a new editor that allows me to move the words to anywhere on any of the wall surfaces by clicking and dragging
   them in place" (Carl, 3 Nov 2026), then, of the first one, inside the view editor: "let's make this its own artifact
   without all those extra controls, i just want control of the text - width, size, orientation (left to right or top to
   bottom) and 90deg rotations".

   So the panel is those alone: the word, its width, its size, left to right or top to bottom, and a quarter turn each
   way. The picked word stays up on the wall; drag it to move it (onto either wall, flat on it), drag anywhere else to
   look round the room, double-click a wall to bring the word there. Saved at words/at in this artifact's database, then
   written into props.mjs WORD_AT once he is happy, so the room itself never reads it. Built with window.WORDS_EDITOR set
   (build-words.sh). */
import { setHoverWords, setHoverWordsAt, hoverWordsAt, hoverWordsBox, WORD_AT } from "./props.mjs";

/* Saved under a new name from 8 Nov 2026, when the words were laid out again on his say (props.mjs ONE SIZE, ALL ACROSS),
   so the spots saved on 3 Nov stay kept but no longer pull the words back where they were. "do you hvae the editor where
   i can put the words and resize them?" (Carl, 8 Nov 2026) */
const WORDS_DOC = "words/layout-nov8";
export async function editWords({ says, wallAt }) {
  if (!window.WORDS_EDITOR) return;
  const db = await Promise.resolve(window.claude?.use?.("db")).catch(() => null);
  if (db) {
    try {
      const d = await db.doc(WORDS_DOC).get();
      if (d.exists) for (const [k, at] of Object.entries(d.data().at || {})) setHoverWordsAt(at, k);
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
  const pick = el("select", { id: "ew-word" }, Object.entries(says).map(([k, w]) => el("option", { value: k, textContent: w.toUpperCase() })));
  const slider = (id, min, max, step) => {
    const input = el("input", { type: "range", min, max, step, id });
    const num = el("span", { className: "ev-num" });
    return { input, num };
  };
  const width = slider("ew-width", 0.2, 3, 0.01),
    size = slider("ew-size", 0.06, 0.8, 0.005);
  const across = el("button", { type: "button", textContent: "Left to right" }),
    down = el("button", { type: "button", textContent: "Top to bottom" }),
    // a word to a row, centred (YOU / + / ME, 8 Nov 2026)
    rows = el("button", { type: "button", textContent: "Rows" }),
    left = el("button", { type: "button", textContent: "Turn left 90°" }),
    right = el("button", { type: "button", textContent: "Turn right 90°" }),
    save = el("button", { type: "button", textContent: "Save every word's spot" });
  panel.append(
    el("label", {}, [el("span", { textContent: "Word" }), pick]),
    el("label", {}, [el("span", { textContent: "Width" }), width.input, width.num]),
    el("label", {}, [el("span", { textContent: "Size" }), size.input, size.num]),
    el("div", { className: "ev-buttons" }, [across, down, rows]),
    el("div", { className: "ev-buttons" }, [left, right]),
    el("div", { className: "ev-buttons" }, [save]),
    status,
  );
  const key = () => pick.value;
  const set = (at) => {
    setHoverWordsAt(at, key());
    show();
    dirty();
  };
  function show() {
    const at = hoverWordsAt(key());
    width.input.value = at.w;
    width.num.textContent = (+at.w).toFixed(2) + " m";
    size.input.value = at.s;
    size.num.textContent = Math.round(at.s * 100) + " cm";
    width.input.disabled = at.dir === "down" || at.dir === "rows"; // a column runs as tall as it needs
    for (const [b, d] of [[across, "across"], [down, "down"], [rows, "rows"]]) b.style.opacity = (at.dir || "across") === d ? 1 : 0.5;
    setHoverWords(says[key()], key());
  }
  pick.addEventListener("change", show);
  width.input.addEventListener("input", () => set({ w: +width.input.value }));
  size.input.addEventListener("input", () => set({ s: +size.input.value }));
  across.addEventListener("click", () => set({ dir: "across" }));
  down.addEventListener("click", () => set({ dir: "down" }));
  rows.addEventListener("click", () => set({ dir: "rows" }));
  left.addEventListener("click", () => set({ rot: ((hoverWordsAt(key()).rot || 0) + 270) % 360 }));
  right.addEventListener("click", () => set({ rot: ((hoverWordsAt(key()).rot || 0) + 90) % 360 }));
  save.addEventListener("click", async () => {
    if (!db) return void (status.textContent = "Couldn't save: no database here");
    try {
      await db.doc(WORDS_DOC).set({ at: { ...WORD_AT }, savedAt: new Date().toISOString() });
      status.textContent = "Saved";
    } catch (e) {
      status.textContent = "Couldn't save: " + (e?.message || e);
    }
  });
  show();

  // THE DRAG: a press on the word moves it (the room's own drag never sees it); a press anywhere else turns the camera
  const room = document.querySelector("#room");
  const onWord = (hit) => {
    if (!hit) return false;
    const at = hoverWordsAt(key()),
      [bw, bh] = hoverWordsBox();
    return hit.wall === at.wall && Math.abs(hit.x - at.x) <= bw / 2 + 0.05 && Math.abs(hit.y - at.y) <= bh / 2 + 0.05;
  };
  let grab = null;
  room.addEventListener(
    "pointerdown",
    (e) => {
      const hit = wallAt(e.clientX, e.clientY);
      if (!onWord(hit)) return;
      const at = hoverWordsAt(key());
      grab = { id: e.pointerId, dx: hit.x - at.x, dy: hit.y - at.y };
      window.PLACING_WORDS = true;
      room.setPointerCapture(e.pointerId);
      e.stopImmediatePropagation();
    },
    true,
  );
  room.addEventListener("pointermove", (e) => {
    if (!grab) {
      if (e.buttons === 0) room.style.cursor = onWord(wallAt(e.clientX, e.clientY)) ? "move" : "";
      return;
    }
    if (e.pointerId !== grab.id) return;
    const hit = wallAt(e.clientX, e.clientY);
    if (!hit) return;
    // onto the other wall, the word's middle comes to the pointer
    if (hit.wall !== hoverWordsAt(key()).wall) grab.dx = grab.dy = 0;
    setHoverWordsAt({ wall: hit.wall, x: Math.max(0, hit.x - grab.dx), y: Math.max(0, hit.y - grab.dy) }, key());
    dirty();
  });
  const drop = () => {
    grab = null;
    window.PLACING_WORDS = false;
  };
  room.addEventListener("pointerup", drop);
  room.addEventListener("pointercancel", drop);
  room.addEventListener("dblclick", (e) => {
    const hit = wallAt(e.clientX, e.clientY);
    if (hit) set({ wall: hit.wall, x: hit.x, y: hit.y });
  });
}
