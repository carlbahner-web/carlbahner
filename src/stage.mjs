/* THE CARD THE ROOM SITS IN. Carl, 1 Nov 2026: "I think the screen needs to be inside of a card that is a fixed ratio so
   it has letterboxes or something if the screen ratio is too different". So the room, the things you can click and the
   windows all live in #stage, always 16:9 (the shape his camera limits and opening view were saved at), as big as fits
   the window with a margin round it, and the rest of the window is plain page. Everything that measured the window
   measures this instead: `view()` is its box on the page. */
const RATIO = 16 / 9;
let box = { left: 0, top: 0, width: innerWidth, height: innerHeight };
export const view = () => box;
/* A PHONE HELD UPRIGHT, 2 Nov 2026. Carl: "I now want to develop the vertical mobile version of the website. My thought
   is that it can open a bit more zoomed out than the laptop landscape version does, and the cards open on the bottom half
   instead of the top half. Then they are able to scroll down/be taller to fit". So a window taller than it is wide (a
   phone upright) has no 16:9 card: the room fills it, a small margin round it, and `upright()` tells the rest. Until
   that day a phone upright was asked to turn ("1: Turn it", 6 Oct 2026). */
/* TYPING ON A PHONE HOLDS THE ROOM STILL: "clicking in the name field does crazy stuff with panning and zooming" (Carl,
   3 Nov 2026). A phone's keyboard coming up shrinks the window, so the room was refitted to the shorter window (an
   upright phone could even read as on its side) and the camera reframed under the card, then again as the keyboard went.
   So while a field on a card has the keyboard, the room keeps the size and shape it had (`fitStage` returns its last
   box), and it fits itself again once the field lets go. */
export const typing = () => matchMedia("(pointer: coarse)").matches && !!document.activeElement?.matches?.("#win input, #win textarea, #win select");
let wasUpright = null;
export const upright = () => {
  if (typing() && wasUpright !== null) return wasUpright;
  /* a touch screen only: "man it gets real weird when resizing" (Carl, 5 Nov 2026). A laptop's window dragged taller than
     it was wide switched to the phone's layout and back as it crossed square, the room jumping between the two; a laptop
     keeps its 16:9 card at any shape, letterboxed. */
  return (wasUpright = (innerHeight > innerWidth && matchMedia("(pointer: coarse)").matches && !window.STUDIO_EDITOR && !window.WORDS_EDITOR) || !!window.PHONE_PREVIEW);
};
// the view editor's "Show as a phone": the room drawn phone-shaped, a 390 by 844 phone's proportions (src/viewtune.mjs)
const PHONE_SHAPE = 390 / 844;
export const CARD_REF = 1408;
/* HOW MUCH OF A PHONE HELD UPRIGHT ITS CARD TAKES, from the bottom: half until 3 Nov 2026, then "i think the mobile cards
   may need to take up more than just the bottom half, possibly doing 60 or 70%" (Carl), phones only ("MOBILE ONLY thought
   since the desktop version is grat"). The thing a card is about is framed in what is left above it. `?ch=` tries another. */
export const UPRIGHT_CARD = +(new URLSearchParams(location.search).get("ch") || 0.65);
export function fitStage() {
  const el = document.querySelector("#stage");
  if (!el) return box;
  if (typing() && box.width) return box; // the keyboard is up: the room as it was (TYPING ON A PHONE)
  const m = Math.min(innerWidth, innerHeight) < 500 ? 6 : 16; // the margin: smaller on a phone on its side
  // the view editor's own copy keeps a column on the left for its panel, so the panel never covers the room: "the
  // panel covers the page dude so i can't see" (Carl, 2 Nov 2026)
  const side = window.STUDIO_EDITOR || window.WORDS_EDITOR ? 336 : 0; // the word editor's too (src/wordtune.mjs)
  const W = Math.max(0, innerWidth - side - 2 * m),
    H = Math.max(0, innerHeight - 2 * m);
  const tall = upright();
  document.body.classList.toggle("upright", tall);
  const w = window.PHONE_PREVIEW ? H * PHONE_SHAPE : tall ? W : Math.min(W, H * RATIO),
    h = tall ? H : w / RATIO,
    x = side + (innerWidth - side - w) / 2;
  Object.assign(el.style, { width: w + "px", height: h + "px", left: x + "px", top: (innerHeight - h) / 2 + "px" });
  el.style.setProperty("--half", h * (1 - UPRIGHT_CARD) + "px"); // where a window's top sits on a phone upright (index.html #win)
  /* THE CARD SCALES WITH THE ROOM: "I want the card contents to scale with the resizing, because otherwise it's gonna just
     be a formatting nightmare with stuff wrapping around and moving around" (Carl, 3 Nov 2026). The card is laid out once,
     at his laptop's room (CARD_REF wide: a 1440 by 900 window), and drawn bigger or smaller with the room (index.html
     #win's zoom), so its words wrap the same way at every size. Upright, its words scale with the phone's width from a
     390-wide phone's. */
  /* NO SMALLER THAN THREE QUARTERS: the student Godzilla officer's fourth hole: on a phone on its side the contact card
     came out a quarter of its size, SUBMIT and the X too small to tap, and a laptop zoomed to 200% got no bigger words.
     "Stop shrinking below a height, scroll instead" (Carl, 9 Nov 2026, the officers' fixes quiz). So the card scales with
     the room down to K_MIN and no further, its words scrolling inside it, never wider than the room leaves. */
  const K_MIN = 0.75;
  el.style.setProperty("--k", String(tall ? (window.PHONE_PREVIEW ? w : innerWidth) / 390 : Math.min(Math.max(w / CARD_REF, K_MIN), Math.max(w / CARD_REF, (w - 32) / 620))));
  box = { left: x, top: (innerHeight - h) / 2, width: w, height: h };
  return box;
}
