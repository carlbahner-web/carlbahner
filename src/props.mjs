/* The decorations: Carl's drawings, standing in the room the way the paper garden stands its
   drawings (garden/src/template.html paperMesh): each a flat cut-out on its feet, turned to face
   the camera, with the paper grain laid over it in soft light and its lines drawn darker first
   (the garden's PAPER_INK.dark, "darkest", 30 Sept 2026). They boil (THE BOIL, below): "can we add
   the boil to the gong, marching machine, pillow and chair?" (Carl, 5 Oct 2026). They had held
   still, on the garden's rule that the boil is for things that do something.

   In metres: `at` is where its feet stand (x along the cream wall from the corner, z along the
   teal wall), `w` how wide it is; its height follows its drawing. */
import {
  Mesh,
  Group,
  PlaneGeometry,
  ShaderMaterial,
  DoubleSide,
  BufferGeometry,
  Float32BufferAttribute,
  CanvasTexture,
  NoColorSpace,
  LinearMipmapLinearFilter,
} from "../vendor/three-garden.js";
import { LINE, GRAIN_M } from "./room.mjs";
import { LIGHT_GLSL, pickLight, LIGHTS } from "./light.mjs";
import { cue } from "./cues.mjs";

/* every picture the room asks for, so the loading screen can wait for all of them (index.html THE LOADING SCREEN) */
const PENDING = [];
function loadingImage() {
  const img = new Image();
  PENDING.push(new Promise((r) => (img.addEventListener("load", r), img.addEventListener("error", r))));
  return img;
}
/* EVERY PICTURE THE CARDS SHOW, loaded behind the loading screen too: "i want to see what other art can be loaded before
   the page opens because the console was glitchy showing the vinyl when i clicked" (Carl, 3 Nov 2026). The songs'
   covers (each one also its record's label), the quote and bio photos, the logos and the icons, kept here so a
   record's label is drawn the moment it is picked (labelRecord) */
const PICTURES = new Map();
/* Not behind the loading screen any more: "Show the room sooner" (Carl, 7 Nov 2026, his officers' quiz; about 8 MB of
   card pictures had to come in before the room showed). They load as the room opens; a card opened in its first moments
   may see one come in. */
export function preloadPictures(urls) {
  for (const u of urls) {
    if (!u || PICTURES.has(u)) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = u;
    PICTURES.set(u, img);
  }
}
// settles once every picture asked for so far, and any asked for while waiting, has come or failed
export async function picturesIn() {
  let n = -1;
  while (n !== PENDING.length) (n = PENDING.length), await Promise.all(PENDING.slice());
}

/* THE CHAIR (Carl's drawing, sent 5 Oct 2026, kept as he sent it in art/chair-source.png and cut out
   by tools/cut_art.py). In the corner, where the mustard chair sits in the photos, against the
   cream wall to the left of the arch; its spot read off the photos by eye. Its size is his: "Chair
   should be like 2x the size", then set on the size slider and saved, 1.35 m, then 1.16 m (5 Oct 2026). `fwd`
   brings it that many metres out of the corner toward the camera: "it's too far back", then set on
   the forward slider and saved, 1.6 m ("it's in the spot"), then 0.9 m with the Sway camera
   (5 Oct 2026). `color` repaints its fabric ("we also need to recolor the chair"), keeping the
   drawing's own shading, its outline and its wooden legs; null leaves it as drawn. It was first
   turned to the orange the chair looks in one photo, and was wrong: "No, the chair is yellow in real
   life". So it starts as drawn, and his panel's colour picker chooses.

   COLOURS. Each prop's `colors` lists the colours in its drawing that can be repainted: `base` is
   the drawing's own colour, `color` what it is painted now (null: as drawn). A pixel takes the
   swatch nearest its own hue and saturation, so its shade of that colour carries over; its outline
   and anything not near a swatch (the chair's wooden legs) stay as drawn. */
export const PROPS = [
  {
    id: "chair",
    label: "Chair",
    src: "assets/chair.webp",
    follow: 0, // his, set on his panel and saved the same day; then 0, saved 6 Oct 2026
    w: 1.16,
    /* thickness, as the map has: copies of it stacked behind, darker further back ("And chair depth?",
       Carl, 6 Oct 2026; WIRE DEPTH). 0 is the flat drawing as before. */
    solid: true, // its depth the fabric's colour, not stacked outlines
    legsTop: 0.155, // its legs are below this share of its height
    /* its depth on its backrest alone, the cushion between the arms (u from, u to, v from, v to, on its picture):
       "Can we try making the depths of the chair just the backrest?" (Carl, 6 Oct 2026, the cushion's top traced) */
    // then its sides brought in to the cushion's own, where he marked them: "the sides go too far out"
    // its top at the cushion's corners' height, so the rounding shows there: "the corners need to be rounded a bit"
    // its sides on the cushion's own side lines, its border lying on them, off the drawing: "sooooooo close"
    // (Carl, 6 Oct 2026, the sides traced from the cushion's edge round to its top)
    depthOnly: [0.208, 0.792, 0.56, 0.985],
    depthRound: 0.08, // metres
    taper: 0, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
    layers: 12,
    depth: 0.2, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
    slide: 0.06,
    fwd: 0.65,
    colors: [{ id: "fabric", label: "colour", base: "#f0af1b", color: null }],
    at: [0.5, 0.55],
  },
  /* THE PILLOW (Carl's drawing, sent 5 Oct 2026: "let's add this pillow onto the chair, give me
     controls for that too"). It rides on the chair (`on`), so it goes where the chair goes: `side`
     metres to the right of the chair's middle as you look at it (left is negative), its bottom `up`
     metres off the floor, `tilt` degrees leaned in the picture (positive leans it left), standing a
     hair in front of the chair so it draws in front. Its size, place and tilt are his, set on his
     sliders and saved (5 Oct 2026). `depth` is how far in front of the chair it stands, so that it
     drifts a little against the chair as the camera sways: "I want it to have a little depth relative
     to the chair so maybe a slightly independent sway?" (the same day). */
  {
    id: "pillow",
    label: "Pillow",
    src: "assets/pillow.webp",
    w: 0.43,
    on: "chair",
    side: 0.21,
    follow: 0.2,
    up: 0.56,
    tilt: -7,
    // a hair in front of the chair, so it is always drawn over it. It stood 0.3 out ("I want it to have
    // a little depth relative to the chair"), which slid it across the chair as the camera swayed: "It
    // seems to move too far left and right no matter what setting I have" (Carl, 5 Oct 2026)
    depth: 0.03,
    // its four colours, each its own picker: "Can you re-color it as well?" (5 Oct 2026)
    colors: [
      { id: "red", label: "red", base: "#d66037", color: null },
      { id: "yellow", label: "yellow", base: "#dba92b", color: null },
      { id: "green", label: "green", base: "#9eaa90", color: null },
      { id: "cream", label: "cream", base: "#f7e8cd", color: null },
    ],
  },
  /* THE GONG (Carl's drawing, sent 5 Oct 2026, the second one: "Can we try coloring this to match the
     one that is in there now, but then I would like to add thickness/depth to the gong itself"). Cut by
     tools/cut_gong.py into the disc and its strings. The disc hangs on the cream wall (`wall`), `x`
     metres along it from the corner to its left edge, its bottom `y` metres up, its back on the wall and
     its face `depth` metres out, with a rim (`disc`, its ellipse on the canvas) built round it. Its size,
     place and colours are the first gong's, set on his panel ("Updated"): the rim and rope repainted to
     the first one's, the face and gold as drawn. */
  {
    id: "gong",
    label: "Gong",
    src: "assets/gong-disc.webp",
    w: 0.6,
    wall: "cream",
    x: 0.26,
    y: 1.53,
    depth: 0.07,
    disc: [0.5, 0.626, 0.494, 0.3685],
    edgeColor: "rim",
    colors: [
      { id: "face", label: "face", base: "#343029", color: "#1d1b16" },
      { id: "gold", label: "gold", base: "#fbc13b", color: "#614400" },
      { id: "rim", label: "rim", base: "#e1a42e", color: "#704100" },
    ],
  },
  /* ITS STRINGS: "the strings would then attach the two points in the middle of the depth at the top of
     the gong, and the top point where it hangs on the screw would be attached flush to the wall, so it
     would slightly an angle out, depending on how thick the gong becomes". One card, tilted so the screw
     (`strings.screw`, on the canvas) is on the wall and the ties (`strings.ties`, how far down) are half
     the gong's depth out. The rope's colour is on the gong's panel. */
  {
    id: "gongStrings",
    label: "Gong strings",
    src: "assets/gong-strings.webp",
    on: "gong",
    strings: { screw: [0.5054, 0.0374], ties: 0.3023 },
    colors: [{ id: "rope", label: "rope", base: "#f2c16a", color: "#d0c3ae" }],
  },
  /* THE ARC LAMP (Carl's drawing, sent 5 Oct 2026: "This goes on the right wall, and the three necks
     are actually independent so a slightly different angle would make the sway look better"). Cut by
     tools/cut_lamp.py into its stand and three necks on one canvas. The stand stands on the floor by
     the cream wall like the chair, turned to the camera; each neck rides on it (`on`), turned `neck`
     degrees further about the pole (`pole`, its place across the canvas), so the three fan apart as
     the camera sways. Its place, spin and the necks' turns are his, set on his panel and saved the same day. */
  {
    id: "lamp",
    label: "Lamp",
    src: "assets/lamp-stand.webp",
    w: 1.7,
    at: [2.6, 0.45],
    along: 3.06,
    fwd: 0.3,
    pole: 0.8358,
    raise: 0.34,
    spin: 12,
    colors: [
      { id: "metal", label: "pole", base: "#9b8768", color: null },
      { id: "base", label: "base", base: "#f0d4b5", color: null },
    ],
  },
  {
    id: "neck1",
    label: "Lamp neck 1",
    src: "assets/lamp-neck1.webp",
    on: "lamp",
    neck: -50,
    colors: [{ id: "shade", label: "shade", base: "#9b8567", color: null }],
  },
  {
    id: "neck2",
    label: "Lamp neck 2",
    src: "assets/lamp-neck2.webp",
    on: "lamp",
    neck: -48,
    colors: [{ id: "shade", label: "shade", base: "#9b8567", color: null }],
  },
  {
    id: "neck3",
    label: "Lamp neck 3",
    src: "assets/lamp-neck3.webp",
    on: "lamp",
    neck: -40,
    colors: [{ id: "shade", label: "shade", base: "#9b8567", color: null }],
  },
  /* THE LAMP'S SHADES, each hanging from the tip of its neck (`hang`, where its top is on the canvas)
     and turned to the camera whatever way the neck turns: "if we could make the actual shade (I think
     that's the word?) stay facing the camera regardless of the neck rotation that would be cool" (Carl,
     5 Oct 2026). Their colour is the neck's shade picker. */
  ...[
    [0.1074, 0.0628, 0.217],
    [0.3173, 0.112, 0.249],
    [0.5086, 0.1654, 0.306],
  ].map(([u, v, glow], i) => ({
    id: "shade" + (i + 1),
    label: "Lamp shade " + (i + 1),
    src: "assets/lamp-shade" + (i + 1) + ".webp",
    on: "neck" + (i + 1),
    hang: [u, v],
    glow: [u, glow], // where its light is, on the canvas: the middle of its mouth
    unlit: true,
    colors: [{ id: "shade", label: "shade", base: "#9b8567", color: null }],
  })),
  /* THE WIRE WORLD MAP (Carl's drawing, sent 5 Oct 2026: "This one is going to be the trickiest one yet,
     because it is very important to get the key right. This is probably the most detailed piece in the
     whole room"). Cut by tools/cut_map.py. It hangs flat on the teal wall (`wall: "teal"`) above the
     console, `x` metres from the corner to its right end, its bottom `y` metres up. Its size and place
     are read off his photo of it ("Can you look at the placement and location from this real photo and
     help to figure out where it should go?", 5 Oct 2026): its bottom is 23% of its width above the
     console's top, its right end 56% of its width past the console's right end toward the corner, and
     the soffit's end falls 43% of its width in from its right end. The soffit's 1.4 m along this wall
     makes it 2.3 m wide, which puts its top 0.2 m under the soffit, as in the photo. His second photo,
     of the corner, put its right end nearer the corner than the console did: about as far from it as
     the gong's left edge is on the other side (90 px against the gong's 80, the camera square on to
     the corner), so 0.25 m; its bottom just under the gong's, as before. The land and the wires each
     have a picker. */
  {
    id: "map",
    label: "World map",
    src: "assets/map.webp",
    ringOutside: true, // the keyboard's ring round its outside only (RING THE OUTSIDE)
    layers: 12,
    depth: 0.03,
    w: 2.14,
    wall: "teal",
    x: 0.25,
    y: 1.4,
    colors: [
      { id: "land", label: "land", base: "#edae3c", color: null },
      { id: "wire", label: "wires", base: "#c0652e", color: null },
    ],
  },
  /* HIS NAME ON THE WALL was tried on 2 Nov 2026 (on the duct, then the teal wall under the map) and dropped for the rug:
     "no need for the wall I like the rug better" (Carl, 2 Nov 2026). His drawing stays in art/site/. */
  /* THE EYES (Carl's drawing, sent 5 Oct 2026: "this should be the easiest piece to add, it goes under the
     lamp"), then redrawn: "Love it, can we replace the eye art with this?"). Cut by tools/cut_art.py. It hangs flat on the cream wall, as in the full-set photo: its left
     point just past the teal panel's right edge. Its size and place are his, set on his panel and saved
     the same day; the teal, the gold, the orange and the cream each have a picker. */
  {
    id: "eyes",
    label: "Eye painting",
    src: "assets/eyes.webp",
    depth: 0.09, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
    outline: [
      [0.4996, 0.0053],
      [0.9938, 0.4978],
      [0.496, 0.9929],
      [0.0062, 0.4942],
    ],
    edgeHex: "#1d1b19", // its frame's black
    w: 0.66,
    wall: "cream",
    x: 1.97,
    y: 0.85,
    colors: [
      { id: "teal", label: "teal", base: "#035665", color: null },
      { id: "gold", label: "gold", base: "#f7c040", color: "#f6cc60" }, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
      { id: "orange", label: "orange", base: "#c36623", color: null },
      { id: "cream", label: "cream", base: "#faf1da", color: null },
    ],
  },
  /* THE RUG (Carl's drawing, sent 5 Oct 2026: "can we try this as a rig with depth control?", a rug, as
     dictated); then replaced by a second drawing, a cream medallion rug ("can you replace the rug with this
     one? Can you stretch it to match the current rug's dimensions?"). Cut by tools/cut_art.py. It lies flat on the floor (`floor`), its middle `x` metres along
     the cream wall and `z` along the teal wall from the corner, its edge built `depth` deep down to the
     floor round its outline. An area rug, square to the walls: "It needs to be an area rug with more full
     controls and should be the same orientation as the walls" (Carl, 5 Oct 2026). So `turn` is 0 or 90
     only, a Rotate button; `w` its width and `long` its length, each a slider. Its size is a start,
     under the chair, a hand's width off each wall. */
  {
    id: "rug",
    label: "Rug",
    /* HIS WORDMARK RUG (his drawing, sent 2 Nov 2026, "carl wordmark rug.png", kept in art/site/), his name across its
       middle: "or it could be cool as the rug" (Carl, 2 Nov 2026), then the rug itself, then his fixed copy the same evening, then the one "actually fixed". It is a touch wider for its length
       than the one before, so the same width covers a little less floor. `?rug=0` shows the medallion rug that was
       there (assets/rug.webp); the try with his drum logo dropped into it is kept as assets/rug-logo.webp. */
    src: new URLSearchParams(location.search).get("rug") === "0" ? "assets/rug.webp" : "assets/rug-wordmark.webp",
    floor: true,
    w: 3.28, // his size and place, saved the same day
    // the second drawing is a little longer for its width than the first, so its length is set to keep
    // the same rug on the floor: "Can you stretch it to match the current rug's dimensions?"
    long: 0.71,
    x: 1.89,
    z: 1.79,
    turn: 0,
    depth: 0.015,
    /* The first drawing was recoloured to the room ("Can you recolor it? Then give me a saturation/mute
       control to make it less intense", Carl, 5 Oct 2026); this one is as drawn, a picker for each colour.
       A Mute slider came and went ("Maybe mute is not what I wanted, I'm thinking a blur or fuzz to soften
       it"): `soft` blurs and fuzzes its pattern instead (SOFTEN, in the shader), a Soften slider. */
    // 0.38 his, for the medallion rug; less on his wordmark rug, so the stroke round his name is not fuzzed away: "i want
    // the one that has the slight stroke around my wordmark" (Carl, 2 Nov 2026)
    soft: 0.12,
    // his drawing runs to its edges
    outline: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    edgeColor: "edge",
    colors: [
      { id: "cream", label: "cream", base: "#ecdcbc", color: null },
      { id: "red", label: "red", base: "#b85838", color: null },
      { id: "navy", label: "teal", base: "#38585e", color: null },
      { id: "edge", label: "edge", base: "#38585e", color: null },
    ],
  },
  /* THE DOG ON ITS BOOK (Carl's drawing, sent 5 Oct 2026: "try to add one more decoration tbh I'm not sure
     how this is gonna work or if we need to make a book as a separate layer?"). The book is drawn at an
     angle, so it is built (BOOK): a box on the console's top, `along` metres along it from its corner end
     and `inset` back from its front, `w` its length, in the drawing's tan and page cream. The dog is cut
     without it (tools/cut_dog.py) and sits on it, a card turned part of the way to the camera as the
     chair is (`follow`). Sizes are a start: a statue about 0.55 m tall, on the console's far end, as in
     the photos. */
  {
    id: "book",
    label: "Book",
    src: "assets/paper-grain.webp", // its card is never drawn; the box is the book
    on: "console",
    box: true,
    w: 0.36, // his size, place and spin, saved the same day
    titleSize: 0.5,
    titleAlong: 0,
    titleUp: 0,
    titleOpacity: 0.81,
    // centred under the dog's base, its paws to its haunch, from the opening view: "it needs centered under the dog's
    // base" (Carl, 2 Nov 2026). It went 0.51, 0.46, 0.49 that day, each nudged by eye; measured, 0.41.
    along: 0.463, // its middle under the dog's base (the dog, above), 0.41 when lined up from one view only
    inset: 0.117, // 0.23 until then: the book came forward to sit under the dog
    spin: -39,
    edgeColor: "cover",
    colors: [
      { id: "cover", label: "cover", base: "#c99f4a", color: null },
      { id: "pages", label: "pages", base: "#fee8b7", color: null },
    ],
  },
  {
    id: "dog",
    label: "Dog",
    src: "assets/dog.webp",
    // its eyes shut, shown for a blink every few seconds (BLINK): "can we make the dog blink occasionally?"
    // (Carl, 6 Oct 2026); painted by tools/blink_dog.py
    blink: "assets/dog-blink.webp",
    /* ON THE CONSOLE, NOT THE BOOK: "Ok fully unlink the book and dog please" (Carl, 5 Oct 2026). It stands
       on the console's top on its own (`atop`), `along` it from its corner end and `inset` back from its
       front, `up` above it; it starts where it sat on the book as he saved them, so on the book's cover. */
    on: "console",
    atop: true,
    front: true, // drawn in front of its book from every view (placeProp, ALWAYS IN FRONT)
    /* his place, saved the same day, moved back along the opening view's line of sight onto the book's
       cover and grown to match, so it looks as he set it from there and stands on the book from anywhere:
       he had it 0.2 m in front of the book, lined up only from the opening view. */
    /* its feet on the book's top: "in the world map view the dog floats above the book?" (Carl, 2 Nov 2026). They
       were 21 cm in front of the book's middle (0.34 wide, 0.54 along, 0.13 in), on the book only from the opening
       view; moved back along that view's line of sight onto the cover, and grown by the same share so it looks the
       same from there. */
    // then "Those three all look different" (Carl, 2 Nov 2026, of the opening, map and dog views): the dog stood 13 cm
    // in front of the book's middle, so each view lined them up differently. Now the book's middle is under the dog's
    // base (0.62 across its drawing, paws to haunch), both 4 cm back along the opening view's line of sight.
    w: 0.351,
    along: 0.469,
    inset: 0.25,
    /* then "The dog is not fixed", "Look logically at what youd expect to see" (Carl, 2 Nov 2026): from the map's view
       the camera is just above the book, its cover a thin strip, and paws in the cover's middle line up with its far
       edge, so the dog read as perched behind it. A dog on a book has its paws near the front of the cover, just over
       the spine: so its feet are there (along the opening view's line of sight again, 0.21 in, 0.493 along, 0.347
       wide), and its drawn paws, 30 of its 840 px above the drawing's foot, at the cover's height. */
    up: 0.036, // with its base over the book's middle; 0.044, then 0.032 ("Still a little high") with its paws at the cover's front
    tilt: 5,
    follow: 0.7,
    colors: [
      { id: "orange", label: "orange", base: "#e8892a", color: null },
      { id: "cream", label: "cream", base: "#fee7b5", color: null },
    ],
  },
  /* THE MUG (Carl's drawing, sent 5 Oct 2026: "This should go on next to the dog/book combo"). Cut by
     tools/cut_art.py, the hole in its handle keyed through. It stands on the console's top on its own
     (`atop`), as the dog does, just toward the corner from the book, turned part of the way to the camera.
     Its size is a start, a little larger than life so it reads. */
  {
    id: "mug",
    label: "Mug",
    src: "assets/mug.webp",
    on: "console",
    atop: true,
    w: 0.16,
    along: 0.17,
    inset: 0.13,
    up: 0,
    tilt: 0,
    follow: 0.2,
    colors: [
      { id: "teal", label: "mug", base: "#085e72", color: null },
      { id: "gold", label: "gold", base: "#feb30b", color: null },
    ],
  },
  /* THE PICTURE FRAME (Carl's drawing, sent 6 Oct 2026: "This goes on the console too"). Cut by
     tools/cut_art.py, the gap behind its stand keyed through. It stands on the console's top on its own
     (`atop`), as the mug does, past the book from the corner, turned part of the way to the camera. Its
     size is a start, a little larger than life so it reads. */
  {
    id: "frame",
    label: "Picture frame",
    src: "assets/frame.webp",
    parts: "assets/frame-parts.webp", // green where it is glass (tools/cut_art.py GLASS)
    glass: 0.34, // how much of the glass is drawn: "maybe 10% transparency?" (Carl, 6 Oct 2026), then 0.34 on his panel, saved the same day
    on: "console",
    atop: true,
    w: 0.24,
    along: 1.3, // where the candle stood, off the opening view's left edge: the snow globe took its place in view (3 Nov 2026)
    inset: 0.19,
    up: 0,
    tilt: 1,
    follow: 0,
    colors: [
      { id: "gold", label: "frame", base: "#d79a36", color: null },
      { id: "matte", label: "mount", base: "#6c9eb1", color: null },
    ],
  },
  /* THE SNOW GLOBE, where the candle stood: "I'm gonna replace the candle with a snow globe with this inside it, I'm
     making the art now" (Carl, 3 Nov 2026), "this" being his Brand Castle from Homegrown's classroom (sent 18 Oct 2026).
     tools/cut_globe.py lays the castle in behind his globe's glass, up on a hill ("Can we add a simple procedural hill
     under the castle so it sits a bit higher?", the same day; then "The hill needs to be lower, the castle needs to be bigger,
     and we need to recolor all of it", picked "Cream castle rust roof"); its flag's six frames wave on its pole, eight a
     second (BITS), as on the classroom's map. It opens StudioLand's card (nav.mjs THINGS). Until then the candle (sent 6 Oct
     2026, "Here's a candle with flame to animate at 8fps") stood here; its pictures stay in assets/ and art/. Its size is
     a start, a little larger than life so it reads. */
  {
    id: "globe",
    label: "Snow globe",
    src: "assets/snowglobe.webp",
    on: "console",
    atop: true,
    w: 0.24,
    along: 0.96, // where the picture frame stood, so it is in the opening view: the candle's spot is half off it
    inset: 0.16,
    up: 0,
    tilt: 4, // anticlockwise: "can you rotate the snowglobe a bit, counter clockwise? it may onlyl be a degree or so, but it looks tilted weird", then, at one, "try 3 more" (Carl, 3 Nov 2026)
    follow: 0.2,
    flag: 0.1371,
    bits: [
      {
        frames: [0, 1, 2, 3, 4, 5].map((i) => `assets/globe-flag-${i}.webp`),
        fps: 8,
        at: [0.5146, 0.8509], // the top of the castle's pole, off tools/cut_globe.py
        anchor: [0, 0.8261], // the flag's edge that meets the pole
        size: "flag",
      },
    ],
  },
  /* THE CLOCK (Carl's drawing, sent 6 Oct 2026: "and a clock to sync with eastern time"). Cut by
     tools/cut_bits.py: the face, and its three hands each on a canvas the face's size, pointing at twelve,
     which the room lays on the face and turns to the time in New York (BITS, clockTime). It hangs flat on
     the teal wall, a start for him to move. */
  {
    id: "clock",
    label: "Clock",
    newest: true,
    src: "assets/clock-face.webp",
    w: 0.36,
    // on the teal wall, `x` from the corner to its right end, left of the map: "Clock should be on the other
    // wall" (Carl, 6 Oct 2026)
    wall: "teal",
    x: 2.54,
    y: 1.63,
    // its body, `depth` deep from its face back to the wall, as the gong's rim is: "Can we add depth to the
    // clock too? The body specifically" (Carl, 6 Oct 2026). Its circle off tools/cut_bits.py, the rim's.
    depth: 0.07,
    disc: [0.5, 0.5, 0.4943, 0.4943],
    edgeColor: "rim", // its body the rim's wood
    /* each hand's own fine tuning: where its pivot sits on the face (X, Y, a share of the face's width) and its
       size: "The central pivot point of the hands don't look right though. Can you let me zoom in on it and
       fine tune each hand?" (Carl, 6 Oct 2026) */
    // 0 since the hubs were cut true (tools/cut_bits.py). His nudges from his panel (hour -0.017, 0.013; minute 0.033,
    // 0.02, 6 Oct 2026) had been making up for the old cut, and on the true one they pushed the hubs apart, by a different
    // amount at each time of day as they turned with their hands: "can we fix this? it seems to look different on
    // different sizes ... when one looks good the other doesn't always" (Carl, 9 Nov 2026). So all three on one pin.
    hourX: 0,
    hourY: 0,
    hourK: 1,
    minuteX: 0,
    minuteY: 0,
    minuteK: 1,
    secondX: 0,
    secondY: 0,
    secondK: 1,
    bits: [
      { src: "assets/clock-hour.webp", at: [0.5, 0.5], anchor: [0.5, 0.5], hand: "hour" },
      { src: "assets/clock-minute.webp", at: [0.5, 0.5], anchor: [0.5, 0.5], hand: "minute" },
      { src: "assets/clock-second.webp", at: [0.5, 0.5], anchor: [0.5, 0.5], hand: "second" },
    ],
    colors: [
      // the chair's mustard: "charcoal mustard and wood" (Carl, 6 Oct 2026)
      { id: "face", label: "face", base: "#f9c646", color: "#bf7538" },
      // the bass drum's shell: "the outline of the clock the wood color is the kick drum" (Carl, 6 Oct 2026)
      { id: "rim", label: "rim", base: "#aa5225", color: "#ffffdf" },
    ],
  },
  /* THE BASS DRUM (Carl's drawing, sent 5 Oct 2026: "Can this go along the right wall?"). Cut by
     tools/cut_art.py. It stands on the floor by the cream wall where the marching machine leaned, as the
     chair does: turned part of the way to the camera (`follow`). Its size is a start, a 22 inch drum. */
  {
    id: "drum",
    label: "Bass drum",
    src: "assets/drum.webp",
    // flipped in its picture, its logo kept reading the right way (tools/flip_drum.py): "The drum needs
    // flipped, I forgot to mention" (Carl, 5 Oct 2026)
    w: 0.98,
    at: [1.9, 0.55],
    along: 2.26,
    fwd: 0.15,
    /* 0.2 until 2 Nov 2026: seen from the side it squashed, "The drum gets kinda skewed in a weird way" (Carl); then
       0.8 until 9 Nov 2026, when it turned with every look round: "The drum looks weird and rotates - the two legs should
       be pinned to a position" (Carl). So it holds the turn it has from where the room opens, its legs where they stand. */
    follow: 0,
    spin: 0,
    /* ON A PHONE, turned clockwise about its right foot, that foot kept where it stood: "Can we start with the left foot in
       this other new spot? Like rotating it clockwise but keeping the right foot where it is" (Carl, 9 Nov 2026, the left
       foot's new spot drawn on the flyover's first view on his phone). Tried everywhere and undone ("hmmmm no undo that"),
       then: "it should be on the phone only. I was judging it on the laptop but the phone is the issue" (Carl, 9 Nov
       2026). `pole` is the right foot, 81% across the picture; `slide` stands that foot where it stood when the drum
       turned about its middle; `spin` turns it about the foot, so it stands 36 degrees clockwise of its laptop turn seen from above (a foot is a different
       line of sight from the camera than its middle, which turns it 4.8 more; PHONE PROPS). */
    // only while the flyover is still over the rug: "it looks good during flyover but then once the main page is in use
    // it looks wrong. Is it possible to start there and then at the 4s mark it starts moving back to the original
    // position?" (Carl, 9 Nov 2026), so it eases back from 4 s until the camera lands (studio.mjs THE DRUM TURNS BACK)
    /* and at rest on a phone, its right foot (as you look at it) brought forward, turned about its left foot, that foot
       where it stood: "could you possibly (on phone only) rotate the audience-right drum leg forward a bit?" (Carl, 9 Nov
       2026, the spot marked on his phone's screenshot). `pole` is the left foot, 4.5% across; `slide` and `fwd` stand
       it where it stood; `spin` -6.9 holds its old turn about that foot, and 12 degrees more brings the right foot about
       15 cm toward you. */
    phoneRest: { pole: 0.045, slide: (0.045 - 0.5) * 0.98, fwd: 0.216, spin: -6.9 - 12 },
    phone: { pole: 0.81, slide: (0.81 - 0.5) * 0.98 + 0.004, fwd: 0.15 - 0.046, spin: -31.2 },
    colors: [
      { id: "wood", label: "shell", base: "#aa5225", color: null },
      { id: "head", label: "head", base: "#f9f0db", color: null },
    ],
  },
  /* THE RECORD CONSOLE (Carl's drawing, sent 5 Oct 2026: "here's the next piece, for the other wall").
     It stands on the floor in front of the teal wall, `alongTeal` metres along it from the corner. Its wood and
     its cane speaker panels each have a picker; its size and place are a start, read off the photos. */
  {
    id: "console",
    label: "Console",
    src: "assets/console.webp",
    w: 1.9,
    alongTeal: 1.57,
    /* Then "Yes!" to real 3D sides: like the marching machine its drawing is clipped to its front face
       (tools/cut_art.py FRONT) and the room builds its top and sides `depth` deep. It is not turned to
       the camera but stands square with its back to the teal wall (`against`); `body` is how much of
       its height, from the top, is cabinet, the rest its legs. */
    against: "teal",
    lid: true, // its top is two sliding panels over a sunken well (THE CONSOLE OPENS)
    wide: 0.77,
    rearLeg: "assets/console-rear-leg.webp",
    depth: 0.69,
    body: 0.85,
    colors: [
      { id: "wood", label: "wood", base: "#b35c1a", color: null, reach: 0.3 },
      { id: "cane", label: "cane", base: "#fbc073", color: null },
    ],
  },
  /* THE BLOCK RACK (Carl's drawing, sent 5 Oct 2026 with a photo of the real one: "I need to recolor
     this one but this is the next piece"). It stands on the floor leaning on the cream wall, in front
     of the teal panel, as in the photo (brief/photos/04-blocks-rack-photo.jpeg): a wall prop with its
     bottom on the floor. The drawing's frame and the blocks' end faces are two slightly different
     oranges, so each has a picker; the real frame is dark walnut and the end faces pale raw wood.
     It was first hung flat on the wall, and that was wrong: "you're treating it like a wall decoration
     this is an object" (the same day). So it stands on the floor like the chair, a cut-out turned to
     the camera, `along` metres along the cream wall, `lift` up or down from the floor. Then: "make the
     top attached to the wall and the bottom attached to the floor (so it looks accurately like it's
     leaning when I sway the camera)". So it is not turned to the camera at all: it leans `lean`
     degrees off upright, its bottom edge on the floor and its top edge against the cream wall, and
     sways as a real board would. Its size and place along the wall are his, saved the same day. */
  {
    id: "blocks",
    label: "Marching machine", // its real name (Carl, 5 Oct 2026); its id and files still say blocks
    src: "assets/blocks.webp",
    parts: "assets/blocks-parts.webp", // white where a pixel is a block's end face (tools/cut_art.py PARTS)
    w: 0.49,
    along: 3.14, // past the console's far end, on the teal wall, flipped (see the lean's placement)
    leanWall: "teal",
    flip: true,
    lean: 28,
    // the frame's real thickness, in metres: its sides, top and bottom are built (EDGES OF A BOARD).
    // 6 cm, then 12: "can we make the side deeper?" (Carl, 5 Oct 2026), with a Depth slider
    depth: 0.14,
    colors: [
      // the frame's top edge is a paler orange than its front, so its reach is wider
      // his colours, set on the pickers and saved (5 Oct 2026): a dark walnut frame, brown block ends
      { id: "frame", label: "frame", base: "#fda93c", color: "#7a4e00", reach: 0.4 },
      { id: "ends", label: "block ends", base: "#febf54", color: "#754600", part: true },
      { id: "strings", label: "strings", base: "#fdfadf", color: null },
    ],
  },
];

const VERT = `
uniform float flip;
varying vec2 vUv; varying vec3 vW;
uniform float toEye;
void main() { vUv = vec2(flip > .5 ? 1.0 - uv.x : uv.x, uv.y); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  // drawn as if toEye metres nearer the camera, along its line of sight, so it lies where it lies on the screen
  w.xyz += normalize(cameraPosition - w.xyz) * toEye;
  gl_Position = projectionMatrix * viewMatrix * w; }`;

const FRAG = `${LIGHT_GLSL}
uniform float above; uniform float litK; uniform float bulb; uniform float dim; uniform float mute; uniform float soft; uniform vec3 fillCol; uniform float fillK; uniform vec4 band; uniform float bandK;
uniform float alphaCut; uniform vec2 texel; uniform float edgeOnly; uniform float edgeK; uniform float use; uniform float hot; uniform vec3 hotInk; uniform float navRest; uniform float navLook;
uniform sampler2D shape; uniform float hasShape;
uniform sampler2D map; uniform sampler2D grain; uniform float grainM; uniform float grainK; uniform float dark; uniform vec2 size; uniform vec3 swBase[4]; uniform vec3 swTint[4]; uniform float swOn[4]; uniform float swPart[4]; uniform float swReach[4]; uniform int swN; uniform sampler2D partMap; uniform float hasParts; uniform float glass; uniform float ring; uniform vec4 keep; uniform float keepR; uniform float boil; uniform float boilK; uniform float below;
// inside keep, its corners rounded keepR metres: "the corners need to be rounded a bit" (Carl, 6 Oct 2026)
// how far outside keep a point is, in metres (negative inside)
float keepSd(vec2 q) {
  vec2 lo = keep.xz * size, hi = keep.yw * size, p = q * size, c = (lo + hi) * .5, h = (hi - lo) * .5 - keepR;
  vec2 d = abs(p - c) - h;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - keepR;
}
/* SMOOTH EDGES ON THE CHAIR'S DEPTH: its edge and its border were cut on or off, a pixel at a time, and on a phone's
   screen they showed as a staircase: "the back of the chair looks blocky and not smooth?", then, shown more layers: "It
   looks pixelated and stepped" (Carl, 9 Nov 2026). So they fade over the width of a screen pixel (w, from fwidth). */
float inKeepS(vec2 q, float w) { return 1.0 - smoothstep(-w, w, keepSd(q)); }
varying vec2 vUv; varying vec3 vW;
/* THE BOIL, the garden's (garden/src/template.html boiledFrame) done on the graphics chip: each pixel
   reads the drawing a little to one side, by a smooth noise that changes with each of the three
   drawings shown 0,1,2,1 every 130 ms, so its outline wanders. Its numbers are the garden's
   'thirsty' ones turned into metres at a decoration's usual size on a laptop (about 340 px a
   metre): 0.9 px of wander over waves about 12 px long. */
const float BOIL_AMP = .0027, BOIL_WAVE = .035;
float bhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(bhash(i), bhash(i + vec2(1, 0)), f.x), mix(bhash(i + vec2(0, 1)), bhash(i + vec2(1, 1)), f.x), f.y); }
vec3 hsv(vec3 c) { vec4 K = vec4(0., -1. / 3., 2. / 3., -1.); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); return vec3(abs(q.z + (q.w - q.y) / (6. * d + 1e-10)), d / (q.x + 1e-10), q.x); }
vec3 rgb(vec3 c) { vec3 p = abs(fract(c.xxx + vec3(1., 2. / 3., 1. / 3.)) * 6. - 3.); return c.z * mix(vec3(1.), clamp(p - 1., 0., 1.), c.y); }
vec3 softLight(vec3 b, float g) { vec3 d = mix(((16.0 * b - 12.0) * b + 4.0) * b, sqrt(b), step(.25, b)); return g <= .5 ? b - (1.0 - 2.0 * g) * b * (1.0 - b) : b + (2.0 * g - 1.0) * (d - b); }
void main() {
  /* A STRETCH of the picture's height (the lamp's pole, POLE): band.xy is where the stretch runs on the
     card, band.zw on the picture, bandK how much taller the card is than the picture; above and below it
     the picture is drawn as it is. */
  vec2 vu = vUv;
  if (bandK > 1.0001) {
    float y = vUv.y;
    vu.y = y < band.x ? y * bandK : (y < band.y ? band.z + (y - band.x) / (band.y - band.x) * (band.w - band.z) : band.w + (y - band.y) * bandK);
  }
  vec2 m = vUv * size / BOIL_WAVE + boil * 17.31;
  /* A THING YOU CAN OPEN (src/nav.mjs): use marks it, and it boils at rest by navRest, as the garden boils
     what does something; hot is the pointer or the keyboard on it, 0 to 1, drawn the way navLook says:
     0 it boils harder, 1 it takes more light, 2 its outline is inked round. */
  vec2 uv = vu + (vec2(bnoise(m), bnoise(m + 41.7)) - .5) * 2. * BOIL_AMP * boilK / size;
  /* ITS OWN BOIL: the whole drawing while nothing is open, and only round its outside edge once it is opened and
     the camera is in close: "make the whole image boil when nothing is selected, but then only outlines once it's
     been selected and zoomed in" (Carl, 6 Oct 2026; before that, edge only throughout: "it should be just the
     outside of the frame not the picture itself?"). Measured in the drawing's own pixels, so it is the same size against its lines however near
     or far the camera is: "the amount of boil is always a fixed amount of the screen rather than relative to the
     view... when i click the map and it zooms out, the boil seems way more noticeable relative to the shapes"
     (Carl, 6 Oct 2026). It had wandered in metres, then a fixed few screen pixels. Up close the edge is the 14 art
     pixels inside the outline, and the card's own border counts as outline, so a drawing cut
     flush to its card (the console's front) boils round its silhouette too. */
  float nk = use * navRest + hot * (navLook < .5 ? 1.2 : 0.0);
  if (nk > 0.0) {
    vec2 er = 14.0 / texel;
    float inside = 1.0;
    for (int i = 0; i < 8; i++) {
      float t = float(i) * .7854;
      vec2 q = vu + vec2(cos(t), sin(t)) * er;
      inside = min(inside, (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) ? 0.0 : texture2D(map, q).a);
    }
    vec2 m2 = vUv * texel / 40.0 + boil * 17.31;
    uv += (vec2(bnoise(m2), bnoise(m2 + 41.7)) - .5) * 2. * 2.5 * nk * mix(1.0, (1.0 - smoothstep(.5, .98, inside)) * edgeK, edgeOnly) / texel;
  }
  vec4 c = texture2D(map, uv);
  // THE INKED OUTLINE: charcoal (or the focus ring's rust, hotInk) just outside the drawing, on its own card only
  // Outside the drawing it rings it; on a drawing cut flush to its card (the console's front) it runs just inside the edge.
  // a disc with depth (the gong) is rung by its rim's halo instead, round the outside of its thickness (RIM_HALO)
  if (hot > .01 && dim > .99 && ring <= 0.0 && edgeK > .5 && (navLook > 1.5 || hotInk.r > .5)) {
    // four of the screen's pixels wide, however near or far the thing is
    vec2 r = hot * 4.0 * length(fwidth(vUv * size)) / size;
    float a = 0.0, gap = 0.0;
    // RING THE OUTSIDE: a drawing with a silhouette (the map) is rung round that, so its holes are not: "Just the
    // outside" (Carl, 6 Oct 2026, asked on the edges sweep's quiz whether every wire should be rung)
    float inkHere = hasShape > .5 ? texture2D(shape, uv).r : c.a;
    for (int i = 0; i < 16; i++) {
      float t = float(i) * .3927;
      vec2 o = vec2(cos(t), sin(t));
      a = hasShape > .5 ? max(a, max(texture2D(shape, uv + o * r).r, texture2D(shape, uv + o * r * .5).r))
                        : max(a, max(texture2D(map, uv + o * r).a, texture2D(map, uv + o * r * .5).a));
      // only the card's own border: a see-through hole inside the drawing is rung from outside, as any edge is. Counted
      // as a gap too, it turned every one of the map's wires, thinner than the ring, solid rust (the edges sweep, 6 Oct 2026)
      vec2 q = vUv + o * r * .6;
      gap = max(gap, (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) ? 1.0 : 0.0);
    }
    if ((inkHere < .5 && a > .5) || (c.a >= .5 && gap > .5 && vUv.y >= above)) { gl_FragColor = vec4(hotInk, 1.0); return; }
  }
  /* THE DEPTH'S BORDER: a layer's ring copy draws charcoal just outside its picture's edge, ring metres wide,
     behind every layer, so only the edge round the whole depth shows: "add a border on the depth part of the
     couch" (Carl, 6 Oct 2026) */
  if (ring > 0.0) {
    float kw = max(fwidth(keepSd(vUv)), 1e-5);
    float a = c.a * inKeepS(vUv, kw);
    vec2 r = ring / size;
    for (int i = 0; i < 12; i++) {
      float t = float(i) * .5236;
      vec2 o = vec2(cos(t), sin(t)) * r;
      a = max(a, texture2D(map, uv + o).a * inKeepS(vUv + o, kw));
    }
    float fa = max(fwidth(a), 1e-3), cov = smoothstep(.5 - fa, .5 + fa, a);
    if (cov < .01 || vUv.y < above) discard;
    gl_FragColor = vec4(lit(vec3(.1, .1, .1) * (1.0 - dark * .5), vW, litK), cov); // the drawing's ink, #1b1b1b
    return;
  }
  float kw = max(fwidth(keepSd(vUv)), 1e-5), keepCov = inKeepS(vUv, kw), fwA = max(fwidth(c.a), 1e-3);
  if (c.a < .02 || vUv.y > below || vUv.y < above) discard;
  // only the picture inside keep (u from, u to, v from, v to) is drawn: the chair's depth, its backrest alone
  if (keepCov < .01) discard;
  /* SOFTEN: the picture read a little blurred, each pixel nudged by a fine noise as a rug's pile is, so
     its pattern loses its hard printed edges: "Maybe mute is not what I wanted, I'm thinking a blur or
     fuzz to soften it" (Carl, 5 Oct 2026). soft: 0 sharp to 1 about 2 cm of blur; its outline kept. */
  if (soft > 0.0) {
    vec2 r = soft * .02 / size;
    vec2 fz = (vec2(bhash(vUv * size * 900.0), bhash(vUv * size * 900.0 + 7.3)) - .5) * r * 1.5;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 2.39996, d = sqrt((float(i) + .5) / 12.0);
      acc += texture2D(map, uv + fz + vec2(cos(a), sin(a)) * d * r).rgb;
    }
    c.rgb = acc / 12.0;
  }
  float ink = 1.0 - smoothstep(.12, .18, max(c.r, max(c.g, c.b)));   // how much this pixel is outline: near-black only, so the gong's dark brown face is a colour
  // repainted in the nearest swatch's colour, keeping the drawing's shading (see COLOURS)
  vec3 h = hsv(c.rgb);
  float best = 1.0, on = 0.0; vec3 painted = c.rgb;
  // a swatch marked as a part takes the pixels its part map marks, and only those (see PARTS in tools/cut_art.py)
  float inPart = hasParts * step(.5, texture2D(partMap, uv).r);
  for (int i = 0; i < 4; i++) {
    if (i >= swN) break;
    vec3 sb = swBase[i];
    float dh = abs(h.x - sb.x); dh = min(dh, 1.0 - dh);
    float d = length(vec2(dh * 4.0 * min(1.0, (h.y + sb.y) * 2.0), h.y - sb.y));
    if (abs(swPart[i] - inPart) > .5) d = 1.0;
    if (d < best) {
      best = d;
      on = swOn[i] * (1.0 - smoothstep(swReach[i] * .6, swReach[i], d));
      vec3 t = swTint[i];
      painted = rgb(vec3(t.x, clamp(h.y * t.y / max(sb.y, .01), 0.0, 1.0), clamp(h.z * t.z / max(sb.z, .01), 0.0, 1.0)));
    }
  }
  vec3 b = mix(c.rgb, painted, on * (1.0 - ink)) * (1.0 - dark * ink);
  // a layer of a SOLID stack (the chair's): its own colour throughout, outline and all, so its sides read
  // as the fabric and only the backmost layer draws the edge: "can you make it the same mustard yellow?"
  // the fabric and its outline only: the legs' wood stays wood
  // wood is the darker brown: neither the near-black outline nor the bright fabric
  // and coloured: the charcoal outline is about as dark as the wood's shadow, and taken for wood it stayed dark on
  // every layer, streaks along the depth ("there are these streaks along the top", Carl, 6 Oct 2026)
  float wood = smoothstep(.16, .22, h.z) * (1.0 - smoothstep(.5, .62, h.z)) * smoothstep(.85, .97, c.a) * smoothstep(.3, .45, h.y);
  // a layer with its legs clipped off (above) has no wood left to keep: all of it fabric
  float fab = above >= 0.0 ? 1.0 : 1.0 - wood;
  b = mix(b, fillCol, fillK * fab);
  // MUTE: its colours drawn toward their own grey, and a touch darker, "to make it less intense"
  b = mix(b, vec3(dot(b, vec3(.3, .59, .11))) * .95, mute);
  float g = mix(.5, texture2D(grain, vUv * size / grainM).r, grainK);                  // the card's own grain, from where it stands
  vec3 o = lit(softLight(b, g) * dim, vW, litK);
  // THE LIGHT ON IT: a warm lift, as if a light came up on it
  if (navLook > .5 && navLook < 1.5) o = mix(o, o * 1.22 + vec3(.09, .06, .015), hot);
  if (bulb > .5) {
    // a lamp's shade: its metal in the room's light, its mouth (the bulb, its palest, least coloured
    // part) glowing as bright as the lamp is strong, dark as the shade with the lamp at nothing
    vec3 s = softLight(b, g);
    float hi = max(c.r, max(c.g, c.b)), sat = (hi - min(c.r, min(c.g, c.b))) / max(hi, .001);
    float mouth = smoothstep(.8, .92, hi) * (1.0 - smoothstep(.12, .3, sat));
    // its face its own colour, as bright as his Bulb brightness (THE BULBS' FACES in light.mjs): to 1 the colour
    // comes in, past 1 it burns toward white
    vec3 off = s * lAmb, face = mix(lFace.rgb, vec3(1.0), clamp(lFace.a - 1.0, 0.0, 1.0) * .75);
    vec3 on = mix(off, face, clamp(lFace.a, 0.0, 1.0));
    o = mix(off, on, mouth);
  }
  /* GLASS: what its part map marks green is glass, drawn this see-through (glass: 1 as drawn, 0 gone):
     "The light blue between the frame and the Polaroid is meant to be glass" (Carl, 6 Oct 2026) */
  float inGlass = step(0.0, glass) * hasParts * step(.5, texture2D(partMap, uv).g);
  /* a solid stack's filled layer is cut hard at its edge: soft, its edge let the border copies behind show
     through as streaks along the depth: "there are these streaks along the top" (Carl, 6 Oct 2026) */
  float outA = (fillK > .5 ? smoothstep(.5 - fwA, .5 + fwA, c.a) : c.a) * keepCov;
  if (outA < max(alphaCut, .02)) discard; // alphaCut is unset (0) on every card but a lamp neck
  gl_FragColor = vec4(o, outA * mix(1.0, glass, inGlass));
}`;

/* A BULB'S HALO: "Can bulbs need to be wayyyyyyy brighter?" (Carl, 5 Oct 2026). A soft glow round each
   shade's mouth, added onto whatever is behind it, as bright and as wide as the lamp is strong. */
// the plane it is drawn on, metres across; the glow inside it is the Bulb size slider's (lHalo)
const HALO = 3;
const HALO_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const HALO_FRAG = `
uniform vec4 lBulb; uniform float lHalo; uniform sampler2D map; uniform vec4 at; varying vec2 vUv;
void main() {
  float a = lBulb.a, r = length(vUv - .5) * 2.0 * ${HALO.toFixed(1)} / max(lHalo, .01) / (.4 + .6 * a);
  float g = pow(clamp(1.0 - r, 0.0, 1.0), 2.2) * a;
  /* Never above the shade's rim, nor over its metal: "the lightbulb brightness should not pass the upper
     rim of the shade right? Like it makes it seem like it glows through the metal unnaturally" (Carl,
     5 Oct 2026). Out of the mouth and into the air below it only. */
  // fading out as it rises to the rim, so a wide glow has no hard line across it
  g *= 1.0 - smoothstep(-.25, .02, (vUv.y - .5) * ${HALO.toFixed(1)});
  vec2 su = at.xy + (vUv - .5) * at.zw;
  vec4 sc = texture2D(map, su);
  float hi = max(sc.r, max(sc.g, sc.b)), sat = (hi - min(sc.r, min(sc.g, sc.b))) / max(hi, .001);
  float mouth = smoothstep(.8, .92, hi) * (1.0 - smoothstep(.12, .3, sat));
  g *= mix(1.0, mouth, smoothstep(.1, .5, sc.a));
  gl_FragColor = vec4(mix(lBulb.rgb, vec3(1.0), .35), g);
}`;

// the straight run of the lamp's pole on its stand's picture, shares of its height from the bottom
// (rows 780 to 450 of assets/lamp-stand.webp, between the base and the collar)
const POLE = [0.1832, 0.5288];
const COLLAR_NEAR = 0.06,
  SHADE_NEAR = 0.07,
  NECK_CUT = 0.3;

/* Each prop as a mesh, its picture arriving when it has loaded. `grain` is the room's shared
   grain uniform, so the cut-outs wear the tile the walls do. `face` is where the camera stands. */
/* EDGES OF A BOARD. A prop with `depth` and `lean` is a board, not a card: its drawing is its front
   face only (tools/cut_art.py FRONT), and its top, bottom and two sides are built here as real
   surfaces `depth` metres deep, so they come into view as the camera sways, as the soffit's do
   ("can you clip those sides and top and make it more 3d?", Carl, 5 Oct 2026). Each is the frame's
   colour, shaded a little darker than the front, grained, with a charcoal line along every edge. */
const EDGE_VERT = `
varying vec2 vUv; varying vec3 vW;
/* A DISC'S RIM BOILS as its outline (src/nav.mjs): the band's ring pushed in and out from the disc's middle by a
   smooth noise along it, wob drawing pixels of it (0 still), on the boil's clock: "the depth of the gong should be
   part of the outline, not the rim of the first layer" (Carl, 6 Oct 2026). */
uniform float wob; uniform float boil; uniform vec2 mid; uniform vec2 texel; uniform float around;
/* THE FACE'S OWN BOIL, shared with the face (FRAG, ITS OWN BOIL and THE BOIL), so the band's rings go where the
   face's drawn edge goes: at rest the whole drawing boils, rim and all, as one; once it is opened the face's edge
   holds still (edgeK 0) and so does the band's front, and only its back ring wanders, the depth's outline. Boiled
   apart, the front ring left the face's edge and showed as a second line beside it, and past the face on the far
   side (the edges sweep, 6 Oct 2026). */
uniform float use; uniform float navRest; uniform float hot; uniform float navLook; uniform float edgeOnly; uniform float edgeK;
uniform float boilK; uniform vec2 size;
float bhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(bhash(i), bhash(i + vec2(1, 0)), f.x), mix(bhash(i + vec2(0, 1)), bhash(i + vec2(1, 1)), f.x), f.y); }
float h1(float p) { return fract(sin(p * 127.1) * 43758.5453); }
// round the ring and back to where it began, so there is no step where the angle wraps
float n1(float p, float n) { float i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(h1(mod(i, n) + boil * 17.31), h1(mod(i + 1.0, n) + boil * 17.31), f); }
void main() { vUv = uv; vec3 q = position;
  if (wob > 0.0 || use > 0.0 || boilK > 0.0) {
    vec2 c = q.xy + .5;
    vec2 m = c * size / .035 + boil * 17.31;
    vec2 o = (vec2(bnoise(m), bnoise(m + 41.7)) - .5) * 2. * .0027 * boilK / size;
    float nk = (use * navRest + hot * (navLook < .5 ? 1.2 : 0.0)) * mix(1.0, edgeK, edgeOnly);
    vec2 m2 = c * texel / 40.0 + boil * 17.31;
    o += (vec2(bnoise(m2), bnoise(m2 + 41.7)) - .5) * 2. * 2.5 * nk / texel;
    // the face reads its picture from o further on, so its edge is drawn o back
    q.xy -= o;
    if (q.z < -.5) {
      vec2 r = position.xy - mid;
      float t = atan(r.y, r.x) / 6.2832 + .5;
      q.xy += normalize(r) * 2.0 * (n1(t * around, around) - .5) * wob * edgeOnly / texel;
    }
  }
  vec4 w = modelMatrix * vec4(q, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const EDGE_FRAG = `${LIGHT_GLSL}
uniform vec3 color; uniform vec3 ink; uniform float shade; uniform float linePx; uniform float dark; uniform float band;
uniform sampler2D grain; uniform float grainM; uniform float grainK; uniform float hot; uniform float navLook;
uniform float lineK; uniform float ripple; uniform vec3 ph;
varying vec2 vUv; varying vec3 vW;
vec3 softLight(vec3 b, float g) { vec3 d = mix(((16.0 * b - 12.0) * b + 4.0) * b, sqrt(b), step(.25, b)); return g <= .5 ? b - (1.0 - 2.0 * g) * b * (1.0 - b) : b + (2.0 * g - 1.0) * (d - b); }
void main() {
  vec2 e = min(vUv, 1.0 - vUv);
  vec2 g = vec2(length(vec2(dFdx(vUv.x), dFdy(vUv.x))), length(vec2(dFdx(vUv.y), dFdy(vUv.y))));
  vec2 t = e / max(g, vec2(1e-6));
  t.x = mix(t.x, 1e6, band);                    // a band round a disc: lines only along its two rims
  /* THE BOOK'S LINES, thicker and rippled: "can we thicken the outlines a bit of hte book and give it ripple?" (Carl,
     9 Nov 2026). lineK times the room's line, and its edge wandering ripple metres either way along its length, as
     the room's own lines do (room.mjs LINE), in screen px however near the camera is */
  float mpp = max(length(dFdx(vW)), length(dFdy(vW))), along = vW.x + vW.y + vW.z, A = 6.2831853;
  float wob = ripple * (.5 * sin(A * along / .05 + ph.x) + .3 * sin(A * along / .023 + ph.y) + .2 * sin(A * along / .011 + ph.z)) / max(mpp, 1e-6);
  float hw = linePx * lineK * .5 + wob;
  float on = 1.0 - smoothstep(hw - .75, hw + .75, min(t.x, t.y));
  vec3 b = mix(color * shade * mix(1.0, vUv.x, band), ink * (1.0 - dark), on);
  // the grain laid flat on the face, whichever way it faces, so it never smears across it
  vec3 nf = abs(normalize(cross(dFdx(vW), dFdy(vW))));
  vec2 gp = nf.y > max(nf.x, nf.z) ? vW.xz : (nf.x > nf.z ? vW.zy : vW.xy);
  float gr = mix(.5, texture2D(grain, gp / grainM).r, grainK);
  vec3 o = lit(softLight(b, gr), vW, 1.0);
  // THE LIGHT ON IT, as its face takes it (FRAG): its sides and rim come up with its front, never the front alone
  if (navLook > .5 && navLook < 1.5) o = mix(o, o * 1.22 + vec3(.09, .06, .015), hot);
  gl_FragColor = vec4(o, 1.0);
}`;
const hex3 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
/* `face` is the uniforms of the picture these sides belong to: they take its light under the pointer, and a disc's
   rim its boil too (EDGE_VERT). Without one they hold still and unlit, as the book's box does. */
function edgeMaterial(p, shared, shade, band = 0, face = null) {
  const id = p.edgeColor || "frame",
    frame = (p.colors || []).find((w) => w.id === id) || (p.colors || [])[0];
  return new ShaderMaterial({
    vertexShader: EDGE_VERT,
    fragmentShader: EDGE_FRAG,
    side: DoubleSide,
    uniforms: {
      color: { value: hex3(p.edgeHex || (frame ? frame.color || frame.base : "#c98a4a")) },
      ink: { value: hex3("#2c2c2a") },
      shade: { value: shade },
      band: { value: band },
      linePx: shared.linePx,
      dark: { value: LINE.dark },
      grain: shared.grain,
      grainM: { value: GRAIN_M },
      grainK: shared.grainK,
      wob: { value: 0 },
      boil: shared.boil,
      mid: { value: [0, 0] },
      texel: { value: [1000, 1000] },
      around: { value: 64 },
      use: { value: 0 },
      navRest: { value: 0 },
      hot: face ? face.hot : { value: 0 },
      navLook: face ? face.navLook : { value: 0 },
      edgeOnly: { value: 0 },
      edgeK: { value: 1 },
      lineK: { value: 1 },
      ripple: { value: 0 },
      ph: { value: [0, 0, 0] },
      boilK: { value: 0 },
      size: { value: [1, 1] },
      ...pickLight(shared),
    },
  });
}
/* THE RIM OF A DISC. A prop with `disc` (its ellipse on the canvas: middle and radii, as shares) and
   `depth` is a disc, not a card: a band round its outline, one unit deep and stretched to `depth` by
   sizeEdges, from its face back to the wall. Lighter on top, darker below; a line round each rim. */
function discBand(mesh, p, shared) {
  // enough corners that its boiled back ring is a curve: at 96 it sampled its wobble about once a wave, and its
  // outline came out a jagged polygon up close (the edges sweep, 6 Oct 2026)
  const [cu, cv, ru, rv] = p.disc,
    N = 512,
    pos = [],
    uv = [],
    idx = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2,
      x = cu - 0.5 + ru * Math.cos(t),
      y = 0.5 - cv + rv * Math.sin(t),
      shade = 0.78 + 0.14 * Math.sin(t);
    pos.push(x, y, 0, x, y, -1);
    uv.push(shade, 1, shade, 0);
    if (i < N) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const f = mesh.material.uniforms,
    band = new Mesh(geo, edgeMaterial(p, shared, 1, 1, f)),
    u = band.material.uniforms;
  u.mid.value = [cu - 0.5, 0.5 - cv];
  // its face's own boil, the very same numbers (EDGE_VERT)
  for (const k of ["use", "navRest", "edgeOnly", "edgeK", "boilK", "size", "texel"]) u[k] = f[k];
  mesh.add(band);
  mesh.userData.edges = [band];
  mesh.userData.band = band;
  rimHalo(band, geo, f, shared);
}
/* RIM_HALO: the keyboard's ring round a disc with depth goes round the outside of its thickness, not round its face,
   where it was drawn across the rim and hid part of it. Shown that, Carl asked "Is it cropping parts out too?", then,
   asked whether it should go round the outside of the thickness instead: "yes" (6 Oct 2026, the edges sweep). A copy
   of the rim band, each point pushed out from the middle by the ring's width in screen pixels, drawn in the ring's
   colour first and writing no depth, so the gong draws over it and only its outside edge shows. */
const RIM_HALO_VERT = `
attribute vec2 rad; uniform float hot; uniform float vh;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec4 c = projectionMatrix * viewMatrix * w;
  vec3 d = (modelMatrix * vec4(rad, 0.0, 0.0)).xyz;
  if (dot(d, d) > 0.0) {
    w.xyz += normalize(d) * c.w * 2.0 / (projectionMatrix[1][1] * vh) * 4.0 * hot;
    c = projectionMatrix * viewMatrix * w;
  }
  gl_Position = c;
}`;
const RIM_HALO_FRAG = `
uniform float hot; uniform float navLook; uniform vec3 hotInk;
void main() {
  if (hot < .01 || !(navLook > 1.5 || hotInk.r > .5)) discard;
  gl_FragColor = vec4(hotInk, 1.0);
}`;
function rimHalo(band, bandGeo, f, shared) {
  const pos = bandGeo.attributes.position.array,
    [mx, my] = band.material.uniforms.mid.value,
    rad = [];
  for (let i = 0; i < pos.length; i += 3) rad.push(pos[i] - mx, pos[i + 1] - my);
  const geo = new BufferGeometry();
  geo.setAttribute("position", bandGeo.attributes.position);
  geo.setAttribute("rad", new Float32BufferAttribute(rad, 2));
  geo.setIndex(bandGeo.index);
  const vh = { value: 900 },
    halo = new Mesh(
      geo,
      new ShaderMaterial({
        vertexShader: RIM_HALO_VERT,
        fragmentShader: RIM_HALO_FRAG,
        side: DoubleSide,
        depthWrite: false,
        uniforms: { hot: f.hot, hotInk: f.hotInk, navLook: f.navLook, vh },
      }),
    );
  // after the room (or the wall paints over it, since it writes no depth) and before the rim, which then draws over it
  halo.renderOrder = 1;
  band.renderOrder = 2;
  halo.onBeforeRender = (r) => (vh.value = r.domElement.height);
  band.add(halo);
}
/* THE FRAME OF A FLAT PICTURE with an `outline` (its corners on the canvas, as shares, clockwise) and
   `depth`: one side per edge of the outline, from its face back to the wall, a line round each.
   "can you give me a depth/thickness control for the eye painting?" (Carl, 5 Oct 2026). */
function frameBand(mesh, p, shared) {
  const pts = p.outline.map(([u, v]) => [u - 0.5, 0.5 - v]),
    band = new Group(),
    edges = [];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length],
      n = Math.hypot(y1 - y0, x1 - x0) || 1,
      up = (x1 - x0) / n, // how much this side faces up
      geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute([x0, y0, 0, x1, y1, 0, x1, y1, -1, x0, y0, -1], 3));
    geo.setAttribute("uv", new Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const side = new Mesh(geo, edgeMaterial(p, shared, 0.78 + 0.14 * up, 0, mesh.material.uniforms));
    band.add(side);
    edges.push(side);
  });
  mesh.add(band);
  mesh.userData.edges = edges;
  mesh.userData.band = band;
}
/* BOOK: a closed book as a box in the room's own style, each face its colour shaded by which way it
   faces, a charcoal line round every face: its cover on top and its spine toward the room, its pages
   on the other three sides. Built in metres for a length of 1, scaled by `w`; its bottom at 0. */
// the book's outline: 1.4 times the room's line, wandering 2.5 mm either way (THE BOOK'S LINES)
const BOOK_LINE = { k: 1.4, ripple: 0.0025 };
function buildBook(p, shared) {
  const g = new Group(),
    faces = [],
    L = 1,
    Wd = 0.62,
    T = 0.16,
    cover = p,
    pages = { ...p, edgeColor: "pages" };
  const face = (a, b, pos, rx, ry, shade, src) => {
    const m = new Mesh(new PlaneGeometry(a, b), edgeMaterial(src, shared, shade));
    // thicker than the room's line, and rippled (THE BOOK'S LINES, EDGE_FRAG): each face its own wobble
    Object.assign(m.material.uniforms, { lineK: { value: BOOK_LINE.k }, ripple: { value: BOOK_LINE.ripple }, ph: { value: [faces.length * 1.7, faces.length * 2.9 + 1, faces.length * 4.1 + 2] } });
    m.rotation.set(rx, ry, 0);
    m.position.set(...pos);
    m.userData.swatch = src.edgeColor;
    g.add(m);
    faces.push(m);
  };
  // its length along the teal wall (z), its width out into the room (x)
  face(Wd, L, [0, T, 0], -Math.PI / 2, 0, 1.0, cover); // the cover, on top
  face(L, T, [Wd / 2, T / 2, 0], 0, Math.PI / 2, 0.85, cover); // the spine, to the room
  face(L, T, [-Wd / 2, T / 2, 0], 0, -Math.PI / 2, 0.75, pages); // the fore-edge, to the wall
  face(Wd, T, [0, T / 2, L / 2], 0, 0, 0.9, pages); // the ends
  face(Wd, T, [0, T / 2, -L / 2], 0, Math.PI, 0.8, pages);
  const title = spineTitle(p, shared, Wd, T, L);
  g.add(title.mesh);
  return { group: g, faces, title };
}
/* THE TITLE ON ITS SPINE: "the book should have the title on the spine - id like it to be clear when you
   zoom in but I want an opacity and size/placement control. It should say "the complete book of
   composting" in my dw fairfield font" (Carl, 5 Oct 2026). His words as he wrote them, in DW Fairfield
   (assets/dwfairfield.woff2, the garden's copy), drawn large on a canvas so they stay sharp up close, in
   charcoal, lit with the book. `titleSize` is its height as a share of the spine's, `titleAlong` and
   `titleUp` move it along and up the spine (shares, 0 the middle), `titleOpacity` 0 to 1. */
const TITLE = "the complete book of composting";
const TITLE_FRAG = `${LIGHT_GLSL}
uniform sampler2D map; uniform float opacity; uniform vec3 ink; varying vec2 vUv; varying vec3 vW;
void main() {
  float a = texture2D(map, vUv).a * opacity;
  if (a < .01) discard;
  gl_FragColor = vec4(lit(ink, vW, 1.0), a);
}`;
const TITLE_VERT = `
varying vec2 vUv; varying vec3 vW;
void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
function spineTitle(p, shared, Wd, T, L) {
  const cv = document.createElement("canvas"),
    H = 256;
  const mesh = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      vertexShader: TITLE_VERT,
      fragmentShader: TITLE_FRAG,
      uniforms: { map: { value: null }, opacity: { value: 1 }, ink: { value: hex3("#2c2c2a") }, ...pickLight(shared) },
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.set(0, Math.PI / 2, 0);
  mesh.renderOrder = 2;
  mesh.visible = false; // until its words are drawn
  let aspect = 8;
  const draw = () => {
    const c = cv.getContext("2d");
    c.font = `${H * 0.78}px "DW Fairfield", serif`;
    const w = Math.ceil(c.measureText(TITLE).width) + 16;
    cv.width = Math.min(4096, w);
    cv.height = H;
    c.font = `${H * 0.78}px "DW Fairfield", serif`;
    c.fillStyle = "#000";
    c.textBaseline = "middle";
    c.textAlign = "center";
    c.fillText(TITLE, cv.width / 2, H * 0.54, cv.width - 8);
    aspect = cv.width / H;
    // a new texture at the canvas's new size (one already sent to the graphics chip keeps its first size)
    const tex = new CanvasTexture(cv);
    tex.colorSpace = NoColorSpace;
    tex.minFilter = LinearMipmapLinearFilter;
    mesh.material.uniforms.map.value?.dispose();
    mesh.material.uniforms.map.value = tex;
    mesh.visible = true;
    place();
  };
  const place = () => {
    // as tall as `titleSize` of the spine, and never longer than the spine: then moved, kept on it
    let h = T * (p.titleSize ?? 0.5),
      w = h * aspect;
    if (w > L * 0.96) (h *= (L * 0.96) / w), (w = L * 0.96);
    const along = (p.titleAlong ?? 0) * (L - w),
      up = (p.titleUp ?? 0) * (T - h);
    mesh.scale.set(w, h, 1);
    mesh.position.set(Wd / 2 + 0.004, T / 2 + up, -along);
    mesh.material.uniforms.opacity.value = p.titleOpacity ?? 0.85;
  };
  const font = new FontFace("DW Fairfield", "url(assets/dwfairfield.woff2)");
  font.load().then((f) => (document.fonts.add(f), draw()), draw);
  return { mesh, place };
}
function boardEdges(mesh, p, shared) {
  const make = (geo, rx, ry, pos, shade) => {
    const m = new Mesh(geo, edgeMaterial(p, shared, shade, 0, mesh.material.uniforms));
    m.rotation.set(rx, ry, 0);
    m.position.set(...pos);
    mesh.add(m);
    return m;
  };
  // made one unit deep and stretched to `depth` by sizeEdges, so his Depth slider can change it
  mesh.userData.edges = [
    make(new PlaneGeometry(1, 1), -Math.PI / 2, 0, [0, 0.5, 0], 0.92), // top
    make(new PlaneGeometry(1, 1), Math.PI / 2, 0, [0, -0.5, 0], 0.7), // bottom
    make(new PlaneGeometry(1, 1), 0, -Math.PI / 2, [-0.5, 0, 0], 0.8), // left
    make(new PlaneGeometry(1, 1), 0, Math.PI / 2, [0.5, 0, 0], 0.8), // right
  ];
  sizeEdges(mesh);
}
function sizeEdges(mesh) {
  if (mesh.userData.prop.box) return;
  sizeBits(mesh);
  for (const l of mesh.userData.stack || []) {
    l.position.z = -l.userData.t * (mesh.userData.prop.depth || 0);
    /* TAPER: each layer smaller going back, its foot kept on the floor: "Can we make the added depth of
       the chair taper in? Can I control that?" (Carl, 6 Oct 2026). `taper` is how much smaller the back is. */
    // narrower going back, its height kept, so its seat and feet stay where they are
    const k = 1 - (mesh.userData.prop.taper || 0) * l.userData.t;
    l.scale.set(k, 1, 1);
    l.visible = (mesh.userData.prop.depth || 0) > 0.002; // flat: no copies fighting the front for the same place
  }
  if (mesh.userData.band) {
    mesh.userData.band.scale.z = mesh.userData.prop.depth;
    return;
  }
  // the rear legs, in the box's own units (its picture is w by h, one unit each way)
  if (mesh.userData.rearLegs && mesh.userData.legAspect) {
    const p = mesh.userData.prop,
      h = p.w * mesh.userData.aspect,
      legH = (1 - p.body) * h + 0.02,
      legW = legH * mesh.userData.legAspect;
    for (const l of mesh.userData.rearLegs) {
      l.scale.set(legW / (p.w * (p.wide ?? 1)), legH / h, 1);
      l.position.set(
        l.userData.side * (0.5 - legW / (p.w * (p.wide ?? 1)) / 2),
        -0.5 + legH / h / 2,
        -p.depth + 0.04,
      );
    }
  }
  // `body` is the share of the picture's height, from its top, the box fills: the console's legs
  // below it stay a flat picture, its cabinet a box
  const d = mesh.userData.prop.depth,
    b = mesh.userData.prop.body ?? 1,
    [top, bottom, left, right] = mesh.userData.edges || [];
  if (!top) return;
  for (const e of [top, bottom]) e.scale.set(1, d, 1);
  for (const e of [left, right]) {
    e.scale.set(d, b, 1);
    e.position.y = 0.5 - b / 2;
  }
  bottom.position.y = 0.5 - b;
  for (const e of [top, bottom, left, right]) e.position.z = -d / 2;
  if (mesh.userData.lid) sizeLid(mesh);
}

/* THE CONSOLE OPENS (Carl, 1 Nov 2026, of putting his turntable in it: "In my real record player, the top surface of
   made of two sliding panels (probably common for old console record players like this) so the dog, book, picture
   frame and mug would need to disappear (maybe sliding up and out of the frame?) so the right side top opens up to
   reveal a slightly-sunk-in place for the record player"; then "We should make it wood colored"). Its top is two
   panels, each drawn as the console's other sides are (edgeMaterial: its wood, an inked line round it, the grain,
   the room's light). Under the right one, the end toward the corner, a wooden well WELL_SINK deep, framed by a
   rim WELL_RIM wide. Opening, the things on its top lift up and out of the frame one after another (liftOf), and the
   right panel slides under the left one: "Can the right panel be under the left? So it slides under not on top?"
   (Carl, 2 Nov 2026). So the left panel is the raised one, PANEL_T over the cabinet with its right edge open, and the
   right one lies low on the rim, thin enough to go beneath it. In the picture's own units: x a share of its width, y of its height
   (0.5 its top), z metres back from its front. The turntable that goes in the well waits for his newer player. */
const WELL_SINK = 0.05, // shallow enough to see into from where the camera stands
  WELL_RIM = 0.035,
  PANEL_T = 0.014, // the left panel's height over the cabinet
  LOW_T = 0.007; // the right panel's thickness, under it
function consoleLid(mesh, p, shared) {
  const plane = (shade, rx, ry) => {
    const m = new Mesh(new PlaneGeometry(1, 1), edgeMaterial(p, shared, shade, 0, mesh.material.uniforms));
    m.rotation.set(rx, ry, 0);
    return m;
  };
  const UP = [-Math.PI / 2, 0],
    FRONT = [0, 0],
    BACK = [0, Math.PI],
    RIGHT = [0, Math.PI / 2],
    LEFT = [0, -Math.PI / 2];
  const slider = new Group();
  const lid = {
    left: plane(0.92, ...UP),
    leftFront: plane(0.85, ...FRONT),
    leftEnd: plane(0.78, ...LEFT),
    slider,
    top: plane(0.95, ...UP),
    lipFront: plane(0.85, ...FRONT),
    lipLeft: plane(0.78, ...LEFT),
    lipRight: plane(0.78, ...RIGHT),
    floor: plane(0.62, ...UP),
    wallFront: plane(0.7, ...BACK),
    wallBack: plane(0.82, ...FRONT),
    wallLeft: plane(0.76, ...RIGHT),
    wallRight: plane(0.76, ...LEFT),
    rimFront: plane(0.92, ...UP),
    rimBack: plane(0.92, ...UP),
    rimLeft: plane(0.92, ...UP),
    rimRight: plane(0.92, ...UP),
  };
  slider.add(lid.top, lid.lipFront, lid.lipRight);
  lid.lipLeft.visible = false; // its left edge goes under the left panel and is never seen
  for (const [k, m] of Object.entries(lid)) if (k !== "top" && !k.startsWith("lip")) mesh.add(m);
  mesh.userData.lid = lid;
  lid.deck = buildDeck();
  mesh.add(lid.deck);
}
/* THE TURNTABLE IN THE WELL: Carl's portfolio player (sent 2 Nov 2026 as portfolio-player-kit.zip, its drawings kept as
   he sent them in art/player/), laid flat on the well's floor: "We should make it wood colored" (1 Nov 2026), so its
   deck is recoloured from teal to the console's wood (assets/deck-plinth.webp). Its record and arm are his drawings,
   placed by the kit's own measurements in a square the deck's width (src/vinyl-player.js, its GEOMETRY NOTE and the
   tonearm block): the platter's middle (39.6%, 38.5%) and radius 26%, the arm turning about (73.6%, 26.2%), parked at
   -80.2 degrees, dropping onto the lead-in groove at -56.7 and running in to -35.3 as a side plays. Seen from above,
   the picture's top toward the wall. The record spins at 33 1/3 and the arm moves as the portfolio window plays
   (setDeck, from src/nav.mjs). Inside, everything is in metres: the group undoes the console's own stretch. */
const DECK = {
  plinth: "assets/deck-plinth.webp",
  record: "assets/deck-record.webp",
  // the slip mat: the kit's platter art, the StudioLand MGMT mark, on the kit's mat colour (#2F5259): "Can we add the slip
  // mat art btw?" (Carl, 2 Nov 2026). It shows with no record on.
  platter: "assets/deck-platter.webp",
  // the arm in its three parts, cut from his tonearm drawing on its own canvas each (the pivot, the cream tube, the
  // head): "there are three distinct sections of the arm that i want separate depth control for" (Carl, 2 Nov 2026)
  pivot: "assets/deck-arm-pivot.webp",
  tube: "assets/deck-arm-tube.webp",
  head: "assets/deck-arm-head.webp",
};
/* The record and arm 10% further toward the front of the deck than the kit has them, the two moved as one so the arm's
   angles still hold (the kit's own rule: "translating both ends of a vector leaves it identical"). The kit kept a band
   under them for its title and controls; here those are on the card: "I think the player and arm need to be more lower
   (front?) since Greg's version had the text and player controls below the record and arm but they are on the card in
   this page" (Carl, 2 Nov 2026). DECK_DOWN is the move. */
/* Then a pair of sliders on the view editor to move them over the deck himself: "Gimme an editor with controls to move
   it along that plane" (Carl, 2 Nov 2026). DECK_MOVE is that move, shares of the deck's width: `x` toward the corner,
   `z` toward the front; DECK_DOWN is its first `z`. */
// his, set on the view editor's slider and saved, 2 Nov 2026 (0.1 until then); then back to the kit's place (0), the
// controls coming back onto the deck under the record: "Actually now I miss the controls from Greg's" (Carl, 2 Nov 2026)
// then nudged on the view editor and saved, 3 Nov 2026: "Ok look at the new player position" (Carl), 1% of the deck toward the
// corner and 1.5% toward the front
const DECK_DOWN = 0.015;
export const DECK_MOVE = { x: 0.01, z: DECK_DOWN };
const DECK_KIT = { cx: 0.396, cz: 0.385, px: 0.736, pz: 0.262 };
const DECK_AT = { cx: DECK_KIT.cx, cz: DECK_KIT.cz + DECK_DOWN, r: 0.26, px: DECK_KIT.px, pz: DECK_KIT.pz + DECK_DOWN, rest: -80.2, start: -56.7, end: -35.3 };
const DECK_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// a layer of its thickness (`solid`) is the piece's shape in one colour, darker the further down
const DECK_FRAG = `uniform sampler2D map; uniform float hasMap; uniform float shade; uniform float disc; uniform vec3 col; uniform float ready; uniform float solid; uniform vec3 scol; uniform float fade; uniform float soft; varying vec2 vUv;
void main() {
  // fading away (RECORD_FADE): a fine dissolve, each layer of the record going at the same pixels, so it fades as one
  // piece without its stacked copies showing through each other
  if (fade < 1.0 && fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) > fade) discard;
  vec4 c = texture2D(map, vUv);
  if (disc > .5) { vec3 m = hasMap > .5 ? mix(col, c.rgb, c.a) : col; c = vec4(m, step(length(vUv - .5), .5)); }
  // the controls' picture keeps its soft edges, so its words fade and blur in whole, not cut at half (THE WORDS WAIT FOR
  // THE RECORD); every other piece is cut at half as before
  if (soft > .5) { if (c.a < .01 || ready < .5) discard; gl_FragColor = vec4(c.rgb * shade, c.a); return; }
  if (c.a < .5 || ready < .5) discard;
  gl_FragColor = vec4((solid > .5 ? scol : c.rgb) * shade, 1.0);
}`;
/* HOW THICK EACH IS: "can we add depth/height to these things? i'll want separate depth control for the record, the
   player arm, the base" (Carl, 2 Nov 2026). Metres, each built of stacked copies of its own shape (as the map's
   thickness is), a slider each on the view editor (src/viewtune.mjs). */
/* The arm's three parts hang DOWN from one top, `arm` metres over the base: "i don't want the depth to accumulate
   bottom-up, i want it to be top-down. So that just like a real arm, the highest plane would be even across them, but
   then i could have the pivot/joint connect to the wood and the cream arm could be thinner and have a gap under neath"
   (Carl, 2 Nov 2026). So `pivot`, `tube` and `head` are each how far that part reaches down from the top. */
// his, set on the view editor's sliders and saved, 2 Nov 2026
export const DECK_DEPTH = { base: 0.006, record: 0.0075, arm: 0.0235, pivot: 0.06, tube: 0.005, head: 0.009, mat: 0.004 };
/* THE SPINDLE: "Can we add a simple procedural nub in the center? Like the post the record goes on. And then we need to
   add depth to the slip mat" (Carl, 2 Nov 2026). A steel post up through the record's hole, SPINDLE_R wide either way and
   SPINDLE_UP over the record; the mat's thickness is `mat` above, a slider on the view editor. */
const SPINDLE_R = 0.0035,
  SPINDLE_UP = 0.012; // 6 mm, then charcoal and 12: "Make the spindle charcoal longer post like 12?" (Carl, 2 Nov 2026)
const DECK_LAYERS = 14; // copies a piece's thickness is built of, at most
const DECK_SIDE = { base: "#7a3f12", record: "#1b1b1a", pivot: "#2c2a28", tube: "#b8ad97", head: "#2c2a28" };
const deckTex = {};
function deckMap(src) {
  if (!src) return { map: { value: null }, ready: { value: 1 } };
  if (deckTex[src]) return deckTex[src];
  const t = (deckTex[src] = { map: { value: null }, ready: { value: 0 } });
  const img = loadingImage();
  img.onload = () => {
    const tx = new CanvasTexture(img);
    tx.colorSpace = NoColorSpace;
    tx.minFilter = LinearMipmapLinearFilter;
    t.map.value = tx;
    t.ready.value = 1;
    bitsChanged = true;
  };
  img.src = src;
  return t;
}
function deckPlane(src, shade = 0.9, disc = false, side = null) {
  const t = deckMap(src);
  const u = { map: t.map, hasMap: { value: src ? 1 : 0 }, ready: t.ready, shade: { value: shade }, disc: { value: disc ? 1 : 0 }, col: { value: hex3(disc ? "#2F5259" : "#2c2c2a") }, solid: { value: side ? 1 : 0 }, scol: { value: hex3(side || "#000000") }, fade: { value: 1 }, soft: { value: 0 } };
  const m = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({ vertexShader: DECK_VERT, fragmentShader: DECK_FRAG, uniforms: u, side: DoubleSide }));
  m.rotation.x = -Math.PI / 2; // flat, its picture's top toward the wall
  return m;
}
// a piece and the copies under it that make its thickness
function deckPiece(src, shade, disc, side) {
  const g = new Group(),
    top = deckPlane(src, shade, disc),
    under = [];
  for (let i = 0; i < DECK_LAYERS; i++) {
    const m = deckPlane(src, 1, disc, side);
    under.push(m);
    g.add(m);
  }
  g.add(top);
  g.userData.piece = { top, under };
  return g;
}
// lays a piece's layers from its bottom (0) up to its top (`d` metres), each `w` by `w` metres
function stackPiece(g, w, d, off = [0, 0]) {
  const { top, under } = g.userData.piece;
  top.scale.set(w, w, 1);
  top.position.set(off[0], d, off[1]);
  const n = Math.max(0, Math.min(DECK_LAYERS, Math.ceil(d / 0.0012)));
  under.forEach((m, i) => {
    m.visible = i < n;
    m.scale.set(w, w, 1);
    m.position.set(off[0], n ? (d * i) / n : 0, off[1]);
    m.material.uniforms.shade.value = 0.55 + (0.3 * i) / Math.max(1, n); // darker toward the bottom
  });
}
/* GREG'S CONTROLS, ON THE DECK: "Actually now I miss the controls from Greg's", then, asked whether on the turntable or
   on the card: "1" (Carl, 2 Nov 2026). Where his kit puts them on its deck (src/vinyl-player.js .onDeck, .scrub): a row
   under the mat from 15.6% across, 70.5% to 81% down, play then stop then what is on; under that, from 15.6% to 81.4%,
   the progress line at 84.8%. Drawn on a picture the deck's size, laid over it; DECK_HIT is where each is, for a click
   (src/nav.mjs). Charcoal on the wood, the song's name in DW Fairfield in the deck's cream. */
const CONTROLS = (() => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1024;
  const tex = new CanvasTexture(cv);
  tex.colorSpace = NoColorSpace;
  return { cv, tex, state: { title: "Choose a record", playing: false, k: 0 } };
})();
export const DECK_HIT = {
  play: [0.156, 0.705, 0.236, 0.81],
  stop: [0.252, 0.705, 0.332, 0.81],
  scrub: [0.156, 0.808, 0.814, 0.888],
};
/* THE DECK'S BUTTONS AND WORDS, his to size and move on the view editor: "Can you give me control to edit and move the
   button sizes and the text sizes?" (Carl, 3 Nov 2026). Sizes are times the kit's; moves are shares of the deck's width.
   DECK_HIT is laid out from where the kit put them (HIT_KIT) by these, so a click still lands where the key is drawn. */
// his, set on the view editor and saved, 3 Nov 2026 ("Look now")
export const DECK_UI = { keySize: 1.23, keysX: -0.014, keysY: -0.008, titleSize: 1, artistSize: 1, textX: 0.022, textY: -0.014, lineY: 0, knobSize: 1 };
const HIT_KIT = { play: [...DECK_HIT.play], stop: [...DECK_HIT.stop], scrub: [...DECK_HIT.scrub] };
function layoutDeckUI() {
  const u = DECK_UI,
    // the two keys keep their gap between them, growing about the middle of the pair
    mx = (HIT_KIT.play[0] + HIT_KIT.stop[2]) / 2,
    my = (HIT_KIT.play[1] + HIT_KIT.play[3]) / 2;
  for (const k of ["play", "stop"]) {
    const [x0, y0, x1, y1] = HIT_KIT[k];
    DECK_HIT[k] = [mx + (x0 - mx) * u.keySize + u.keysX, my + (y0 - my) * u.keySize + u.keysY, mx + (x1 - mx) * u.keySize + u.keysX, my + (y1 - my) * u.keySize + u.keysY];
  }
  const [a, b, c, d] = HIT_KIT.scrub;
  DECK_HIT.scrub = [a, b + u.lineY, c, d + u.lineY];
}
layoutDeckUI();
export function setDeckUI(u) {
  Object.assign(DECK_UI, u);
  layoutDeckUI();
  drawControls();
}
export function drawControls(st = {}) {
  Object.assign(CONTROLS.state, st);
  const { title, artist, playing, k, textA = 1 } = CONTROLS.state,
    N = 1024,
    g = CONTROLS.cv.getContext("2d"),
    px = (f) => f * N,
    INK = "#2c2c2a",
    CREAM = "#f4ead8";
  g.clearRect(0, 0, N, N);
  const btn = ([x0, y0, x1, y1], draw) => {
    const w = px(x1 - x0) * 0.86,
      h = w,
      x = px((x0 + x1) / 2) - w / 2,
      y = px((y0 + y1) / 2) - h / 2;
    g.fillStyle = CREAM;
    g.strokeStyle = INK;
    g.lineWidth = N * 0.006;
    g.beginPath();
    g.roundRect(x, y, w, h, w * 0.22);
    g.fill();
    g.stroke();
    g.fillStyle = INK;
    draw(x + w / 2, y + h / 2, w * 0.5);
  };
  // the play and stop are keys of their own now, raised off the deck (KEYS, below); their tops drawn there
  drawKeys(playing);
  /* what is on, in his heading face: the song's title on top, its artist under it: "On the console player, it should be
     Top line song title, bottom line artist name. The description should be on the card with the vinyl" (Carl, 3 Nov
     2026). It was the card's whole line, description and all, on one line, and ran off the deck. Each line shrinks to
     fit, and only then is cut short. */
  g.fillStyle = CREAM;
  g.textBaseline = "middle";
  const U = DECK_UI,
    tx = px(0.35 + U.textX),
    room = px(0.885) - tx;
  const line = (text, size, min, y) => {
    let fs = px(size);
    const t = String(text || "").toUpperCase();
    g.font = `${fs}px "DW Fairfield", Georgia, serif`;
    while (g.measureText(t).width > room && fs > px(min)) g.font = `${(fs *= 0.94)}px "DW Fairfield", Georgia, serif`;
    let shown = t;
    while (g.measureText(shown).width > room && shown.length > 2) shown = shown.slice(0, -2) + "…";
    g.fillText(shown, tx, y);
  };
  // bigger: "the text on the deck needs to be bigger - we can move things around if I need to make more space" (Carl,
  // 3 Nov 2026); it was 0.04 and 0.03 of the deck, the one line 0.042
  // `textA` fades the words in once the record has landed (src/nav.mjs THE WORDS WAIT FOR THE RECORD)
  g.globalAlpha = textA;
  // and it comes in out of a blur, the whole of it at once: "make the fade be a blur-in not like, entering line by line"
  // (Carl, 8 Nov 2026)
  if (textA < 1) g.filter = `blur(${((1 - textA) * px(0.014)).toFixed(1)}px)`;
  if (artist) {
    line(title, 0.056 * U.titleSize, 0.03 * U.titleSize, px(0.731 + U.textY));
    g.globalAlpha = 0.72 * textA;
    line(artist, 0.042 * U.artistSize, 0.024 * U.artistSize, px(0.786 + U.textY));
  } else line(title, 0.056 * U.titleSize, 0.03 * U.titleSize, px(0.7575 + U.textY));
  g.globalAlpha = 1;
  g.filter = "none";
  // the progress line: a cream track, the played part charcoal, a knob where it is
  const [sx0, sy0, sx1, sy1] = DECK_HIT.scrub,
    y = px((sy0 + sy1) / 2),
    th = px(0.018),
    x0 = px(sx0),
    x1 = px(sx1);
  g.fillStyle = CREAM;
  g.strokeStyle = INK;
  g.lineWidth = N * 0.005;
  g.beginPath();
  g.roundRect(x0, y - th / 2, x1 - x0, th, th / 2);
  g.fill();
  g.stroke();
  const at = x0 + (x1 - x0) * Math.max(0, Math.min(1, k || 0));
  g.fillStyle = INK;
  g.beginPath();
  g.roundRect(x0, y - th / 2, Math.max(th, at - x0), th, th / 2);
  g.fill();
  // the knob is a raised one of its own now (KNOB, with THE KEYS), placed where `at` is
  for (const m of all) if (m.userData.lid?.deck?.userData.S) placeKeys(m);
  CONTROLS.tex.needsUpdate = true;
  bitsChanged = true;
}
// the controls' picture, for a click: the deck's controls plane, or null
export function deckControls() {
  for (const m of all) if (m.userData.lid?.deck) return m.userData.lid.deck.userData.deck.controls;
  return null;
}
/* THE KEYS: the play and stop as real keys, raised KEY_UP off the deck and pressed down when clicked: "can the play
   buttons have depth? and then when they're clicked they actually depress?" (Carl, 2 Nov 2026). Each is a cream top with
   its icon (a picture of its own), on stacked copies of its shape in a darker cream down to the deck, as the record and
   the mat are built. A press sinks it to KEY_DOWN of its height and springs it back. */
const KEY_UP = 0.009,
  KEY_DOWN = 0.3,
  KEY_MS = 110;
const KEYS = {
  play: { cv: document.createElement("canvas"), press: 0, to: 0, held: 0 },
  stop: { cv: document.createElement("canvas"), press: 0, to: 0, held: 0 },
};
/* THE KNOB on the progress line, raised as the keys are: "can the scrubber/circle thing also have depth?" (Carl, 2 Nov
   2026). A cream round with an ink ring, KNOB_UP off the deck, KNOB_D across (a share of the deck), riding the line. */
const KNOB_UP = 0.006,
  KNOB_D = 0.046;
const KNOB = { cv: document.createElement("canvas") };
KNOB.cv.width = KNOB.cv.height = 256;
KNOB.tex = new CanvasTexture(KNOB.cv);
KNOB.tex.colorSpace = NoColorSpace;
{
  const g = KNOB.cv.getContext("2d");
  g.fillStyle = "#f4ead8";
  g.strokeStyle = "#2c2c2a";
  g.lineWidth = 18;
  g.beginPath();
  g.arc(128, 128, 128 - 10, 0, Math.PI * 2);
  g.fill();
  g.stroke();
}
for (const k of Object.values(KEYS)) {
  k.cv.width = k.cv.height = 256;
  k.tex = new CanvasTexture(k.cv);
  k.tex.colorSpace = NoColorSpace;
}
function drawKeys(playing) {
  const INK = "#2c2c2a",
    CREAM = "#f4ead8";
  for (const [name, k] of Object.entries(KEYS)) {
    const g = k.cv.getContext("2d"),
      N = 256,
      r = N * 0.22;
    g.clearRect(0, 0, N, N);
    g.fillStyle = CREAM;
    g.strokeStyle = INK;
    g.lineWidth = N * 0.05;
    g.beginPath();
    g.roundRect(g.lineWidth / 2, g.lineWidth / 2, N - g.lineWidth, N - g.lineWidth, r);
    g.fill();
    g.stroke();
    g.fillStyle = INK;
    const c = N / 2,
      s = N * 0.42;
    g.beginPath();
    if (name === "stop") g.rect(c - s * 0.4, c - s * 0.4, s * 0.8, s * 0.8);
    else if (playing) (g.rect(c - s * 0.42, c - s * 0.5, s * 0.3, s), g.rect(c + s * 0.12, c - s * 0.5, s * 0.3, s));
    else (g.moveTo(c - s * 0.36, c - s * 0.5), g.lineTo(c + s * 0.5, c), g.lineTo(c - s * 0.36, c + s * 0.5), g.closePath());
    g.fill();
    k.tex.needsUpdate = true;
  }
}
/* a key pressed (src/nav.mjs): down as the finger or the mouse goes down on it, and held there until it lets go, then
   back up: "do they come back up after the click is released?" (Carl, 2 Nov 2026). A press with no hold (the keyboard,
   a tap the page never saw go down) goes down, a beat, and back up. */
export function pressKey(name, hold = false) {
  const k = KEYS[name];
  if (!k) return;
  k.to = 1;
  k.held = hold ? Infinity : KEY_MS;
  bitsChanged = true;
}
export function releaseKeys() {
  for (const k of Object.values(KEYS)) if (k.held === Infinity) (k.held = 0), (k.to = 0);
  bitsChanged = true;
}
function keyPiece(k) {
  const g = new Group(),
    side = "#cbbd9f",
    top = deckPlane(null, 1),
    under = [];
  top.material.uniforms.map.value = k.tex;
  top.material.uniforms.hasMap.value = 1;
  for (let i = 0; i < DECK_LAYERS; i++) {
    const m = deckPlane(null, 1, false, side);
    m.material.uniforms.map.value = k.tex;
    m.material.uniforms.hasMap.value = 1;
    m.material.uniforms.ready.value = 1;
    under.push(m);
    g.add(m);
  }
  top.material.uniforms.ready.value = 1;
  g.add(top);
  g.userData.piece = { top, under };
  return g;
}
function stepKeys(dt, reduced) {
  let moved = false;
  for (const k of Object.values(KEYS)) {
    if (k.held > 0 && k.held !== Infinity && k.press >= 0.999) {
      k.held -= dt;
      if (k.held <= 0) k.to = 0;
    }
    if (k.press !== k.to) {
      const sp = dt / (k.to ? 60 : 160); // quick down, a softer spring back
      k.press = reduced ? k.to : k.to > k.press ? Math.min(1, k.press + sp) : Math.max(0, k.press - sp);
      moved = true;
    }
  }
  if (moved) for (const m of all) if (m.userData.lid?.deck?.userData.args) placeKeys(m);
  return moved;
}
function placeKeys(mesh) {
  const g = mesh.userData.lid.deck,
    d = g.userData.deck,
    S = g.userData.S,
    base = Math.max(0.002, DECK_DEPTH.base);
  for (const name of ["play", "stop"]) {
    const [x0, y0, x1, y1] = DECK_HIT[name],
      w = (x1 - x0) * 0.86 * S,
      cx = ((x0 + x1) / 2 - 0.5) * S,
      cz = ((y0 + y1) / 2 - 0.5) * S,
      h = KEY_UP * (1 - KEY_DOWN * KEYS[name].press);
    d.keys[name].position.set(0, base, 0);
    stackPiece(d.keys[name], w, h, [cx, cz]);
  }
  // the knob where the song has got to along the line
  const [sx0, , sx1] = DECK_HIT.scrub,
    k = Math.max(0, Math.min(1, CONTROLS.state.k || 0)),
    kx = (sx0 + (sx1 - sx0) * k - 0.5) * S,
    kz = ((DECK_HIT.scrub[1] + DECK_HIT.scrub[3]) / 2 - 0.5) * S;
  d.knob.position.set(0, base, 0);
  stackPiece(d.knob, KNOB_D * DECK_UI.knobSize * S, KNOB_UP, [kx, kz]);
}
function buildDeck() {
  const g = new Group(),
    plinth = deckPiece(DECK.plinth, 0.92, false, DECK_SIDE.base),
    // its rim cream, as the CB on it: "can we make the rim of the slip mat cream too? like the depth side" (Carl, 2 Nov 2026)
    platter = deckPiece(DECK.platter, 1, true, "#f4ead8"),
    spindle = deckPiece(null, 1, true, "#2c2c2a"),
    spin = new Group(),
    record = deckPiece(DECK.record, 0.95, false, DECK_SIDE.record),
    arm = new Group(),
    parts = Object.fromEntries(["pivot", "tube", "head"].map((k) => [k, deckPiece(DECK[k], 1, false, DECK_SIDE[k])]));
  spin.add(record);
  // every layer of the record shares one fade (RECORD_FADE)
  record.traverse((m) => m.material && (m.material.uniforms.fade = RECORD_FADE));
  arm.add(...Object.values(parts));
  // THE CONTROLS ON THE DECK (drawControls, above), a picture the deck's size laid just over it, drawn again once his
  // heading face has loaded
  drawControls();
  document.fonts?.load('40px "DW Fairfield"').then(() => drawControls(), () => {});
  const controls = deckPlane(null, 1);
  controls.material.uniforms.map.value = CONTROLS.tex;
  controls.material.uniforms.ready.value = 1;
  controls.material.uniforms.soft.value = 1;
  controls.material.transparent = true;
  // the spindle charcoal, its top a touch lighter so it reads as the end of the post
  spindle.userData.piece.top.material.uniforms.col.value = hex3("#4a4744");
  const keys = { play: keyPiece(KEYS.play), stop: keyPiece(KEYS.stop) },
    knob = keyPiece(KNOB);
  g.add(plinth, controls, keys.play, keys.stop, knob, platter, spindle, spin, arm);
  g.userData.deck = { plinth, controls, keys, knob, platter, spindle, spin, record, arm, parts };
  return g;
}
// lays the deck in the well: square, as wide as fits with a margin, each piece on the one under it
function sizeDeck(mesh, W, H, wellX, wellZ, wellW, wellD, floorY) {
  const g = mesh.userData.lid.deck,
    d = g.userData.deck,
    S = Math.min(wellW, wellD) * 0.94,
    at = (u, v) => [(u - 0.5) * S, (v - 0.5) * S],
    D = DECK_DEPTH;
  g.userData.args = [W, H, wellX, wellZ, wellW, wellD, floorY];
  g.userData.S = S;
  g.scale.set(1 / W, 1 / H, 1);
  g.position.set(wellX, floorY, wellZ);
  const base = Math.max(0.002, D.base);
  stackPiece(d.plinth, S, base);
  d.controls.scale.set(S, S, 1);
  d.controls.position.set(0, base + 0.0004, 0);
  g.userData.S = S;
  placeKeys(mesh);
  const [cx, cz] = at(DECK_AT.cx, DECK_AT.cz);
  // the slip mat, `mat` thick, on the deck; the record on the mat
  const mat = Math.max(0.001, D.mat);
  d.platter.position.set(cx, base + 0.001, cz);
  stackPiece(d.platter, 2 * DECK_AT.r * S, mat);
  // a cream rim only a little darker going down, so it reads as cream, not tan
  d.platter.userData.piece.under.forEach((m, i, a) => (m.material.uniforms.shade.value = 0.8 + (0.17 * i) / Math.max(1, a.length - 1)));
  const recBase = base + 0.001 + mat + 0.0005,
    recTop = recBase + Math.max(0.001, D.record);
  d.spin.position.set(cx, recBase, cz);
  d.spin.userData.y0 = recBase;
  stackPiece(d.record, 2 * DECK_AT.r * S * 0.98, Math.max(0.001, D.record));
  // the spindle: from the mat up through the record's hole, SPINDLE_UP over it
  d.spindle.position.set(cx, base + 0.001 + mat, cz);
  stackPiece(d.spindle, SPINDLE_R * 2, recTop + SPINDLE_UP - (base + 0.001 + mat));
  // the arm: its top `arm` over the base, never under the record's; each part reaches down from it by its own depth
  const [px, pz] = at(DECK_AT.px, DECK_AT.pz),
    armTop = Math.max(recTop + 0.002, base + D.arm);
  d.arm.position.set(px, armTop, pz);
  for (const [k, part] of Object.entries(d.parts)) {
    const dk = Math.max(0.001, Math.min(D[k], armTop - base)); // never through the base
    // the drawing hangs off its own pivot, where the kit measured it in the picture (DECK_KIT), wherever the pivot is
    // moved to: offset from the moved pivot, the arm slid the other way from the record ("those controls move them in
    // different directions. They need to be locked to each other", Carl, 2 Nov 2026)
    stackPiece(part, S, dk, [(0.5 - DECK_KIT.px) * S, (0.5 - DECK_KIT.pz) * S]);
    part.position.y = -dk;
  }
  showDeck(mesh);
}
// the view editor's sliders: the record and the arm moved together over the deck
export function setDeckMove(m) {
  Object.assign(DECK_MOVE, m);
  DECK_AT.cx = DECK_KIT.cx + DECK_MOVE.x;
  DECK_AT.px = DECK_KIT.px + DECK_MOVE.x;
  DECK_AT.cz = DECK_KIT.cz + DECK_MOVE.z;
  DECK_AT.pz = DECK_KIT.pz + DECK_MOVE.z;
  setDeckDepth({});
}
// the view editor's sliders: a new thickness for one or more of the three
export function setDeckDepth(d) {
  Object.assign(DECK_DEPTH, d);
  for (const m of all) if (m.userData.lid?.deck?.userData.args) sizeDeck(m, ...m.userData.lid.deck.userData.args);
  bitsChanged = true;
}
/* WHAT THE PORTFOLIO WINDOW SAYS, as his player kit runs it (src/vinyl-player.js _select): a record on the platter
   (`on`), the motor running (`playing`: it comes up to speed over 1.1 s and slows over 0.7, never at once), the arm
   parked or over the record (`armTo` "rest" or "play"), how far through the side (`k`, the arm creeping in with it),
   and the record's label, the song's own cover (`label`). "ok so it's not doing any of the sleeve/ record automations"
   (Carl, 2 Nov 2026). */
const DECKSTATE = { on: false, playing: false, armTo: "rest", k: 0, arm: DECK_AT.rest, speed: 0, turn: 0, last: 0, label: null, drop: 0, dropTo: 0 };
/* ONTO THE POST: the record comes in over the top of the spindle and is let down onto it, the post through its hole, and
   goes back up it before it leaves: "make sure the vinyl animation takes it to the top of the post and then 'down' with
   it penetrating the vinyl" (Carl, 2 Nov 2026). DECK_LIFT is how far over its seat it lands (its underside just over the
   post's top); `drop` is how high it is now, eased to `dropTo` over about DROP_MS. */
export const DECK_LIFT = 0.012 + 0.003; // SPINDLE_UP and a little
export const DROP_MS = 650;
// for the test rigs: the turntable's state and how far the console is open
export const deckState = () => ({ ...DECKSTATE, lid: LID.k, keys: { play: KEYS.play.press, stop: KEYS.stop.press } });
export function setDeck(s) {
  if ("label" in s && s.label !== DECKSTATE.label) labelRecord(s.label);
  // a record put on is whole; fading starts from wherever it is
  if (s.on) (RECORD_FADE.value = 1), (DECKSTATE.fadeTo = 1);
  Object.assign(DECKSTATE, s);
  for (const m of all) if (m.userData.lid?.deck) showDeck(m);
  bitsChanged = true;
}
// how long the arm takes to swing between rest and the record, as the kit's .tonearm transition (900 ms)
export const ARM_SWING_MS = 900;
/* THE LABEL IS THE SLEEVE'S ART, as on his MGMT pages (the kit's --pp-label-zoom 1.9: the middle of the cover, zoomed):
   his record drawing with the cover laid in its label's circle, the spindle hole drawn back over it. */
const LABEL_R = 0.205, // the label's radius, a share of the record picture's width
  // 1.9 as his kit has it, then the whole cover: "shrink the scale of the image that is used for the center of the vinyl
  // artwork, it seems like we're cutting/cropping an unnecessary amount of the image out" (Carl, 2 Nov 2026)
  LABEL_ZOOM = 1;
let recordImg = null;
function labelRecord(url) {
  const t = deckTex[DECK.record];
  const draw = (cover) => {
    if (!recordImg) return;
    const N = 1024,
      cv = document.createElement("canvas");
    cv.width = cv.height = N;
    const g = cv.getContext("2d");
    g.drawImage(recordImg, 0, 0, N, N);
    if (cover) {
      const r = LABEL_R * N,
        side = Math.min(cover.width, cover.height) / LABEL_ZOOM;
      g.save();
      g.beginPath();
      g.arc(N / 2, N / 2, r, 0, Math.PI * 2);
      g.clip();
      g.drawImage(cover, (cover.width - side) / 2, (cover.height - side) / 2, side, side, N / 2 - r, N / 2 - r, 2 * r, 2 * r);
      g.restore();
      g.lineWidth = N * 0.008;
      g.strokeStyle = "#1b1b1a";
      g.beginPath();
      g.arc(N / 2, N / 2, r, 0, Math.PI * 2);
      g.stroke();
      // the spindle hole
      g.fillStyle = "#f4ead8";
      g.beginPath();
      g.arc(N / 2, N / 2, N * 0.022, 0, Math.PI * 2);
      g.fill();
    }
    // the hole through it, really open, so the post shows through as the record goes down it
    g.globalCompositeOperation = "destination-out";
    g.beginPath();
    g.arc(N / 2, N / 2, N * 0.016, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "source-over";
    const tx = new CanvasTexture(cv);
    tx.colorSpace = NoColorSpace;
    tx.minFilter = LinearMipmapLinearFilter;
    t.map.value = tx;
    t.ready.value = 1;
    bitsChanged = true;
  };
  const withRecord = (then) => {
    if (recordImg) return then();
    const im = loadingImage();
    im.onload = () => ((recordImg = im), then());
    im.src = DECK.record;
  };
  withRecord(() => {
    if (!url) return draw(null);
    // a cover loaded behind the loading screen is drawn at once (preloadPictures), so the label never lags the record
    const ready = PICTURES.get(url);
    if (ready?.complete && ready.naturalWidth) return draw(ready);
    const c = loadingImage();
    c.onload = () => draw(c);
    c.src = url;
  });
}
/* WHERE THE RECORD IS IN THE ROOM, for the window's record to fly to and from (src/nav.mjs): its middle, and the ends
   of two diameters across its top, in metres. */
// `still`: as a record just put on lies, unturned (turn 0), whatever the one there now has turned to: the window's record
// lands in that pose, so the deck's takes over from it without a turn (src/nav.mjs takeRecord)
export function deckPoints(lift = 0, still = false) {
  for (const m of all) {
    const g = m.userData.lid?.deck;
    if (!g) continue;
    const d = g.userData.deck,
      r = DECK_AT.r * (g.userData.S || 0) * 0.98,
      y = Math.max(0.001, DECK_DEPTH.record) + lift - DECKSTATE.drop;
    const turned = d.spin.rotation.y;
    if (still) d.spin.rotation.y = 0;
    d.spin.updateMatrixWorld(true);
    if (still) d.spin.rotation.y = turned;
    const e = d.spin.matrixWorld.elements,
      at = (x, z) => [0, 1, 2].map((i) => e[i] * x + e[4 + i] * y + e[8 + i] * z + e[12 + i]);
    // and the whole deck's middle, last, for framing it (src/nav.mjs leanFor)
    d.plinth.updateMatrixWorld(true);
    const pe = d.plinth.matrixWorld.elements;
    return [at(0, 0), at(r, 0), at(-r, 0), at(0, r), at(0, -r), [pe[12], pe[13], pe[14]]];
  }
  return null;
}
/* A RECORD FADES AWAY rather than flying home: "there are still some glitches with the vinyl going back to its sleeve so i
   was thinking... what if the vinyl just fades away over the course of a second or so while the new one is animating out
   of the sleeve? then we don't have to worry about it glitching out" (Carl, 2 Nov 2026). setDeck({ fadeTo: 0 }) fades it
   out over FADE_MS where it sits; the next record put on (on: true) comes back whole. */
export const FADE_MS = 1000;
const RECORD_FADE = { value: 1 };
function showDeck(mesh) {
  const d = mesh.userData.lid.deck.userData.deck;
  // on the deck until the panel has closed over it (the window closing leaves it there: the sweep's "blinks out")
  d.spin.visible = DECKSTATE.on && LID.k > 0 && RECORD_FADE.value > 0;
  d.spin.position.y = (d.spin.userData.y0 ?? d.spin.position.y) + DECKSTATE.drop;
  d.spin.rotation.y = -DECKSTATE.turn;
  // a CSS turn on a page seen from above is the other way round about the room's up
  d.arm.rotation.y = (-DECKSTATE.arm * Math.PI) / 180;
}
function stepDeck(now, reduced) {
  const dt = DECKSTATE.last ? Math.min(100, now - DECKSTATE.last) : 0;
  DECKSTATE.last = now;
  const keysMoved = stepKeys(dt, reduced);
  const want = DECKSTATE.armTo === "play" ? DECK_AT.start + (DECK_AT.end - DECK_AT.start) * DECKSTATE.k : DECK_AT.rest;
  let moved = false;
  if (Math.abs(want - DECKSTATE.arm) > 0.01) {
    // the arm swings over in about ARM_SWING_MS, and creeps in with the song
    DECKSTATE.arm = reduced ? want : DECKSTATE.arm + (want - DECKSTATE.arm) * (1 - Math.exp(-dt / 260));
    moved = true;
  }
  // the record up or down the post, on an ease
  if (DECKSTATE.drop !== DECKSTATE.dropTo) {
    const left = DECKSTATE.dropTo - DECKSTATE.drop,
      stepD = (DECK_LIFT * dt) / DROP_MS;
    DECKSTATE.drop = reduced || Math.abs(left) <= stepD ? DECKSTATE.dropTo : DECKSTATE.drop + Math.sign(left) * Math.max(stepD * Math.min(1, Math.abs(left) / (DECK_LIFT * 0.35)), stepD * 0.15);
    moved = true;
  }
  // the record fading away (A RECORD FADES AWAY)
  const fadeTo = DECKSTATE.fadeTo ?? 1;
  if (RECORD_FADE.value !== fadeTo) {
    const st = dt / FADE_MS;
    RECORD_FADE.value = reduced || Math.abs(fadeTo - RECORD_FADE.value) <= st ? fadeTo : RECORD_FADE.value + Math.sign(fadeTo - RECORD_FADE.value) * st;
    if (RECORD_FADE.value === 0) DECKSTATE.on = false;
    moved = true;
  }
  // the motor: up to speed in 1.1 s, down in 0.7 (the kit's _rampSpin)
  const to = DECKSTATE.on && DECKSTATE.playing ? 1 : 0;
  if (DECKSTATE.speed !== to) {
    DECKSTATE.speed = reduced ? to : to > DECKSTATE.speed ? Math.min(1, DECKSTATE.speed + dt / 1100) : Math.max(0, DECKSTATE.speed - dt / 700);
    moved = true;
  }
  if (DECKSTATE.speed > 0 && !reduced) {
    DECKSTATE.turn += (dt / 1000) * ((100 / 3 / 60) * Math.PI * 2) * DECKSTATE.speed;
    moved = true;
  }
  if (!moved) return keysMoved;
  for (const m of all) if (m.userData.lid?.deck) showDeck(m);
  return true;
}
function sizeLid(mesh) {
  const p = mesh.userData.prop,
    l = mesh.userData.lid,
    W = p.w * (p.wide ?? 1),
    H = p.w * mesh.userData.aspect,
    d = p.depth,
    y = (m) => m / H, // metres up, in the picture's height
    mx = WELL_RIM / W,
    M = WELL_RIM,
    s = WELL_SINK;
  mesh.userData.edges[0].visible = false; // the whole top: the two panels are it now
  const set = (m, sx, sy, x, yy, z) => (m.scale.set(sx, sy, 1), m.position.set(x, yy, z));
  // the right panel, thin, low on the rim; it slides left under the left one (showLid)
  const top = 0.5 + y(0.002 + LOW_T);
  set(l.top, 0.5, d, 0.25, top, -d / 2);
  set(l.lipFront, 0.5, y(LOW_T), 0.25, top - y(LOW_T) / 2, 0.001);
  set(l.lipLeft, d, y(LOW_T), 0, top - y(LOW_T) / 2, -d / 2);
  set(l.lipRight, d, y(LOW_T), 0.5, top - y(LOW_T) / 2, -d / 2);
  // the left panel, raised PANEL_T on its front and outer end, open on its right so the other slides beneath it
  const high = 0.5 + y(PANEL_T);
  set(l.left, 0.5, d, -0.25, high, -d / 2);
  set(l.leftFront, 0.5, y(PANEL_T), -0.25, high - y(PANEL_T) / 2, 0.001);
  set(l.leftEnd, d, y(PANEL_T), -0.5, high - y(PANEL_T) / 2, -d / 2);
  // the well under it, a rim round it
  const xl = mx,
    xr = 0.5 - mx,
    zf = -M,
    zb = -(d - M),
    mid = (xl + xr) / 2,
    zm = (zf + zb) / 2,
    rim = 0.5 + y(0.002);
  set(l.floor, xr - xl, d - 2 * M, mid, 0.5 - y(s), zm);
  set(l.wallFront, xr - xl, y(s), mid, 0.5 - y(s) / 2, zf);
  set(l.wallBack, xr - xl, y(s), mid, 0.5 - y(s) / 2, zb);
  set(l.wallLeft, d - 2 * M, y(s), xl, 0.5 - y(s) / 2, zm);
  set(l.wallRight, d - 2 * M, y(s), xr, 0.5 - y(s) / 2, zm);
  set(l.rimFront, 0.5, M, 0.25, rim, -M / 2);
  set(l.rimBack, 0.5, M, 0.25, rim, -(d - M / 2));
  set(l.rimLeft, mx, d - 2 * M, mx / 2, rim, zm);
  set(l.rimRight, mx, d - 2 * M, 0.5 - mx / 2, rim, zm);
  sizeDeck(mesh, W, H, mid, zm, (xr - xl) * W, d - 2 * M, 0.5 - y(s));
  showLid(mesh);
}
/* WHAT STANDS ON IT STANDS ON THE PANELS, not the cabinet under them: "those items on top of the cabinet are clipping
   through the panel" (Carl, 2 Nov 2026). `along` is from the corner end, so less than half its width is on the right
   panel. */
function panelUnder(P, along = 0) {
  if (!P.lid) return 0;
  return (along || 0) < (P.w * (P.wide ?? 1)) / 2 ? 0.002 + LOW_T : PANEL_T;
}
// how open: 0 shut, 1 open; eased in tickProps over LID_MS
const LID = { k: 0, to: 0, last: 0 };
/* "is there any easing on the lift off animations and slide? I think it feels a little bit abrupt or maybe just a
   little too fast" (Carl, 2 Nov 2026). It was 1.7 s, each thing lifting on a cube (slow, then shooting off) and the
   panel on a quick ease in and out. Now 2.6 s: each thing rises gently first, then speeds away, and the panel eases
   in and out on a cubic, starting as the last thing clears. */
const LID_MS = 2600;
export function setLid(open) {
  LID.to = open ? 1 : 0;
}
// for the test rigs: hold the console at one point of its opening (0 shut, 1 open)
export function lidAt(k) {
  LID.k = LID.to = k;
  for (const m of all) {
    if (m.userData.lid) showLid(m);
    if (LIFT_ORDER.includes(m.userData.prop.id)) (placeProp(m), (m.visible = liftOf(m.userData.prop.id) < LIFT_MAX * 0.99));
  }
}
// the things on its top lift away in this order, a beat apart, gone out of the top of the frame
const LIFT_ORDER = ["globe", "frame", "book", "dog", "mug"];
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const LIFT_MAX = 1.1;
function liftOf(id) {
  return liftAt(id, LID.k);
}
function liftAt(id, k) {
  const i = LIFT_ORDER.indexOf(id);
  if (i < 0) return 0;
  // the dog rides up with his book
  const x = clamp01((k - 0.08 * (id === "dog" ? 2 : i)) / 0.5);
  /* eased in on a sine, so it leaves the top softly rather than jumping, then on up and out. Up LIFT_MAX metres, under
     the soffit, not three: from three they came back down through the ceiling as the camera pulled out, and seemed
     to pop back on: "when it closes and we zoom out, the dog/objects need to glide back into place because now they
     just reappear" (Carl, 2 Nov 2026). So they are seen coming back down the whole way, landing softly. */
  return (1 - Math.cos((x * Math.PI) / 2)) * LIFT_MAX;
}
function showLid(mesh) {
  const l = mesh.userData.lid;
  // the panel slides once the top is clear, all the way over the left one
  l.slider.position.x = -0.5 * easeInOutCubic(clamp01((LID.k - 0.4) / 0.6));
}
function stepLid(now, reduced) {
  const dt = LID.last ? now - LID.last : 0;
  LID.last = now;
  if (LID.k === LID.to) return false;
  const step = reduced ? 1 : dt / LID_MS;
  const was = LID.k;
  LID.k = LID.to > LID.k ? Math.min(LID.to, LID.k + step) : Math.max(LID.to, LID.k - step);
  // the sounds' moments (src/cues.mjs): each thing leaving the top, and the panel starting to slide open or shut
  const slide = (k) => clamp01((k - 0.4) / 0.6);
  if (slide(was) === 0 && slide(LID.k) > 0) cue("panel-open");
  if (slide(was) === 1 && slide(LID.k) < 1) cue("panel-close");
  if (LID.k > was) for (const id of LIFT_ORDER) if (id !== "dog" && liftAt(id, was) === 0 && liftAt(id, LID.k) > 0) cue("lift");
  for (const m of all) {
    if (m.userData.lid) (showLid(m), m.userData.lid.deck && showDeck(m));
    const id = m.userData.prop.id;
    if (LIFT_ORDER.includes(id)) {
      placeProp(m);
      m.visible = liftOf(id) < LIFT_MAX * 0.99; // gone once it is all the way up, out of the leaned-in frame
    }
  }
  return true;
}

/* BITS: small pictures laid on a decoration's own, moving with it: the snow globe's flag and the clock's hands.
   Each is placed by `at` (where on its parent's picture, a share across and up from the bottom left) and
   `anchor` (the point of its own picture that goes there), and is as wide as its parent times `size` (a key
   of the prop's own, the flame's), or as wide as its parent. One with `frames` shows them in turn, `fps` a
   second; one with `hand` turns to the time (clockTime). */
let bitsChanged = false;
function buildBit(mesh, b, i, uniforms) {
  const bit = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        ...uniforms,
        map: { value: null },
        swN: { value: 0 },
        hasParts: { value: 0 },
        glass: { value: -1 },
        litK: { value: b.unlit ? 0 : 1 },
        size: { value: [0.1, 0.1] },
      },
      transparent: true,
    }),
  );
  bit.renderOrder = 2 + i;
  bit.userData = { bit: b, aspect: 1, frames: [], shown: -1, angle: null };
  // a hand turns about its pivot, which may sit off the face's middle (the prop's <hand>X and <hand>Y)
  if (b.hand) {
    bit.userData.pivot = new Group();
    bit.userData.pivot.add(bit);
  }
  const srcs = b.frames || [b.src];
  srcs.forEach((src, k) => {
    const img = loadingImage();
    img.onload = () => {
      const t = new CanvasTexture(img);
      t.colorSpace = NoColorSpace;
      t.minFilter = LinearMipmapLinearFilter;
      bit.userData.frames[k] = t;
      if (k === 0) {
        bit.userData.aspect = img.naturalHeight / img.naturalWidth;
        bit.material.uniforms.map.value = t;
        sizeBits(mesh);
      }
      bitsChanged = true;
    };
    img.src = src;
  });
  mesh.add(bit.userData.pivot || bit);
  return bit;
}
function sizeBits(mesh) {
  const p = mesh.userData.prop;
  for (const bit of mesh.userData.bits || []) {
    const b = bit.userData.bit,
      share = b.size ? p[b.size] : 1,
      sx = share,
      sy = (share * bit.userData.aspect) / (mesh.userData.aspect || 1);
    const z = 0.002 * (bit.renderOrder - 1);
    if (b.hand) {
      // the pivot where the hand turns, and the hand at its own size round it
      const k = p[b.hand + "K"] ?? 1;
      // the pivot on the face's middle, and the hand nudged round it, so a nudge holds at every time of day: moved
      // with the pivot, a hub lined up at one time swung off at another
      bit.userData.pivot.position.set(b.at[0] - 0.5, b.at[1] - 0.5, z);
      bit.scale.set(sx * k, sy * k, 1);
      bit.position.set(p[b.hand + "X"] || 0, p[b.hand + "Y"] || 0, 0);
      bit.material.uniforms.size.value = [p.w * sx * k, p.w * (mesh.userData.aspect || 1) * sy * k];
      continue;
    }
    bit.scale.set(sx, sy, 1);
    bit.position.set(b.at[0] - 0.5 + (0.5 - b.anchor[0]) * sx, b.at[1] - 0.5 + (0.5 - b.anchor[1]) * sy, z);
    bit.material.uniforms.size.value = [p.w * sx, p.w * (mesh.userData.aspect || 1) * sy];
  }
}
/* THE TIME IN NEW YORK: "a clock to sync with eastern time" (Carl, 6 Oct 2026). Whatever the viewer's own
   time zone, the hands show Eastern, summer time and all, read off the browser's own time zone data. */
const EASTERN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});
export function clockTime(date = new Date()) {
  const t = Object.fromEntries(EASTERN.formatToParts(date).map((x) => [x.type, +x.value]));
  return { hour: t.hour % 12 + t.minute / 60, minute: t.minute + t.second / 60, second: t.second };
}
/* Each frame: the flames' next drawing and the hands' angles. True when anything changed, so the room
   draws again. The second hand ticks, as a wall clock's does; the other two creep with it. Held still
   (the first flame) for anyone who asks for less motion; the clock still tells the time. */
/* BLINK: a prop with `blink` shows that picture, its eyes shut, for BLINK_MS every few seconds, at random so it
   never ticks like a clock; now and then twice. Held open for anyone who asks for less motion. */
const BLINK_MS = 130;
/* THE COUNTRIES LIGHT UP ON THE MAP: his clients' countries, lit when the map's window is open ("maybe the map is the
   testimonials page?", his clients' countries lighting up, 1 Nov 2026). His list, sent 2 Nov 2026: "this list is out of
   order but complete". His drawing has no borders, so each is a small warm light where that country sits on it, placed
   by eye on the drawing (pixels of assets/map.webp, 1664 by 729); England, Scotland and Wales each have their own, as he
   listed them. They come on west to east as the window opens, and go off as it closes. */
const MAP_PX = [1664, 729];
export const COUNTRIES = {
  Canada: [380, 150], "U.S.": [370, 215], Mexico: [360, 275], Colombia: [505, 372], Peru: [505, 428], Brazil: [595, 430],
  Chile: [560, 525], Argentina: [585, 535], Ireland: [826, 188], Scotland: [841, 177], England: [846, 193], Wales: [836, 193],
  Portugal: [832, 233], Spain: [849, 233], France: [866, 215], Belgium: [873, 202], Germany: [889, 199], Denmark: [893, 184],
  Norway: [898, 158], Sweden: [918, 150], Finland: [941, 141], Poland: [914, 200], Austria: [902, 213], Italy: [910, 234],
  Macedonia: [935, 234], Ukraine: [960, 202], Turkey: [976, 247], Israel: [979, 273], Nigeria: [885, 365], India: [1180, 320],
  "South Korea": [1340, 250], Japan: [1385, 265], Taiwan: [1328, 302], Australia: [1470, 450], "New Zealand": [1590, 535],
};
const ML = { k: 0, to: 0, at: 0, from: 0, mesh: null };
const ML_MS = 1600;
/* LIKE THE GARDEN'S FIREFLIES: "What if the countries were subtle little blinking lights like the fireflies?" (Carl, 2 Nov
   2026). The garden's firefly (garden/src/template.html): a glow from near white at its middle (255,250,224) out through
   its mustard (246,204,96) to nothing, added onto what is under it; each blinks fully off and on at its own pace and
   phase (FLIES.speed 61: 2.2 x 0.61 a second, times its own 0.7 to 1.3), and grows from half its size as it lights
   (FLY_GROW_FROM 0.5). Smaller here, and fainter: "subtle". Under reduced motion they hold still and fully lit, as the
   garden's do. */
const ML_FRAG = `uniform vec2 pts[${Object.keys(COUNTRIES).length}]; uniform float k; uniform float aspect; uniform float t; varying vec2 vUv;
float h(float n) { return fract(sin(n * 91.7) * 43758.5); }
void main() {
  float c = 0.0;
  for (int i = 0; i < ${Object.keys(COUNTRIES).length}; i++) {
    float fi = float(i);
    float on = smoothstep(0.0, 0.35, k * 1.35 - pts[i].x); // west to east as the window opens
    // faster than the garden's, and a quicker flash at the top of each blink: "they could sparkle a bit faster though"
    // (Carl, 2 Nov 2026); they had the garden's 1.34 a second
    float lit = t < 0.0 ? 1.0 : pow(0.5 + 0.5 * sin(t * 3.2 * (0.7 + 0.6 * h(fi)) + 6.283 * h(fi + 17.0)), 1.6);
    // spread and radiant, not a point: "they look weird with the boil, so maybe they need to be more spread and radiant"
    // (Carl, 2 Nov 2026). A small bright dot sat still while the drawing boiled under it; a wide soft glow, its middle
    // only a little brighter than its edge, lies over the boil as light does
    float size = 0.05 * (0.6 + 0.4 * lit);
    float r = length((vUv - pts[i]) * vec2(aspect, 1.0)) / size;
    if (r > 1.0) continue;
    // cream, laid over the map rather than added as light: "Closer but maybe cream is better for contrast?" (Carl, 2 Nov
    // 2026). Added light on the mustard land went yellow-white and barely showed
    float a = exp(-r * r * 4.5) * (1.0 - r * r); // a gaussian, held to nothing at its edge
    c = max(c, a * lit * on * 0.9); // the stronger of two, never summed: Europe's twenty would be one cream blot
  }
  if (c < 0.003) discard;
  gl_FragColor = vec4(0.969, 0.937, 0.863, c); // cream, #f7efdc
}`;
function mapLights(map) {
  const pts = Object.values(COUNTRIES).map(([x, y]) => [x / MAP_PX[0], 1 - y / MAP_PX[1]]);
  const m = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: ML_FRAG,
      uniforms: { pts: { value: pts.flat() }, k: { value: 0 }, aspect: { value: MAP_PX[0] / MAP_PX[1] }, t: { value: 0 } },
      transparent: true,
      depthWrite: false,
    }),
  );
  m.position.z = 0.003;
  m.renderOrder = 5;
  m.visible = false;
  map.add(m);
  ML.mesh = m;
}
export const mapLightsMesh = () => ML.mesh; // for a test to film them on its own clock
export function setMapLights(on) {
  const to = on ? 1 : 0;
  if (to === ML.to) return;
  Object.assign(ML, { to, from: ML.k, at: performance.now() });
}
function stepMapLights(now, reduced) {
  if (!ML.mesh) return false;
  // blinking: a new frame whenever they are out
  ML.mesh.material.uniforms.t.value = reduced ? -1 : now / 1000;
  if (ML.k === ML.to) return ML.k > 0 && !reduced;
  const t = reduced ? 1 : Math.min(1, (now - ML.at) / (ML.to ? ML_MS : ML_MS / 2));
  ML.k = ML.from + (ML.to - ML.from) * t;
  ML.mesh.material.uniforms.k.value = ML.k;
  ML.mesh.visible = ML.k > 0;
  return true;
}
/* WORDS ON THE TEAL WALL UNDER THE POINTER: "I also think maybe we should have some hover text that appears somewhere on
   the page when we hover over something... maybe in that teal spot where we tried to have my wordmark before?" (Carl, 3
   Nov 2026). The spot is where his name was tried on 2 Nov (the teal wall under the map, between the console and the
   chair: 0.1 m from the corner, 1.1 m up, 0.95 m wide). The words are the page's own title, in his heading face and the
   room's cream, fading in as a thing lights up and out as it goes. */
const HW = { cv: document.createElement("canvas"), k: 0, to: 0, text: "", drawn: "", key: null, mesh: null, group: null, tex: null, wh: [1, 1] };
// his, set on the view editor and saved, 3 Nov 2026 ("look now"): the box 0.05 m from the corner, 0.93 m up and 1.66 m
// wide, its letters about 0.42 m (0.1, 1.1 and 0.95 until then). Kept here as its middle. Every word sits here unless it
// has a spot of its own (WORD_AT)
export const HW_AT = { wall: "teal", x: 0.88, y: 1.19, w: 1.66, s: 0.42, dir: "across", rot: 0 };
/* EACH WORD ITS OWN SPOT, on either wall: "i want a new editor that allows me to move the words to anywhere on any of
   the wall surfaces by clicking and dragging them in place. i want to mov som to the right wall, for example, so the text
   needs to adjust perspective to be flat on the plane of the respective surface right?" (Carl, 3 Nov 2026). Then, of that
   editor: "let's make this its own artifact without all those extra controls, i just want control of the text - width,
   size, orientation (left to right or top to bottom) and 90deg rotations" (the word editor, src/wordtune.mjs).
   Keyed as nav.mjs SAYS is (a page, or a link's id). `wall` is "teal" (x along it from the corner) or "cream" (x along
   the cream wall from the corner), and x, y are the words' middle; either way they lie flat on it. `w` is how wide a
   line may run before it wraps, `s` the letters' size, `dir` "across" (left to right) or "down" (top to bottom, a
   letter under a letter), `rot` a quarter turn 0, 90, 180 or 270 (clockwise), all in metres and degrees. */
// his, placed and saved on the word editor (https://claude.ai/artifact/L5sZYGwWCpwAeN1sRASJxB), 3 Nov 2026 ("saved").
// LISTEN keeps HW_AT, where they all were
/* ONE SIZE, ALL ACROSS: "no they're all different sizes and look like shit" (Carl, 8 Nov 2026, the words and opening quiz,
   of the spots laid out on 7 Nov). Then, the same day: "i think maybe all the left-wall words should be in the section
   under the globe (there's some negative space in the teal wall) and the right wall words should all be top-to-bottom in
   the yellow column like the about currently is". So the five for the left wall's things are one column in the teal
   under the map, each the same height from where the room opens; ABOUT and YOU+ME run down the arch, one under the
   other. `s` differs word to word only because each stands a different distance from the camera: a word moved needs its
   `s` measured again from the opening view. */
/* then placed by him on the word editor and saved, 8 Nov 2026 ("updated the wording"; words/layout-nov8 there) */
const at = (wall, x, y, s, dir = "across") => ({ wall, x, y, w: 1.66, s, dir, rot: 0 });
export const WORD_AT = {
  artists: at("teal", 0.472, 2.442, 0.215),
  // ABOUT and YOU+ME each in the middle of its column: the arch's yellow left of the panel (1.01 to 1.43 m) and the panel
  // (1.43 to 1.90 m): "Both "about" and the "you + me" look just a few pixels off-center relative to their columns, don't
  // you think?" (Carl, 9 Nov 2026). They stood 3 and 2 cm right of the middles; moved all the way, they read a touch left:
  // "You overcorrected the word centering a bit. can you split the difference?" (Carl, 9 Nov 2026), so halfway.
  bio: at("cream", 1.235, 1.066, 0.215, "down"),
  contact: at("teal", 0.954, 1.165, 0.22),
  "my-people": at("cream", 1.677, 1.144, 0.22, "rows"),
  portfolio: at("console", 2.297, 0.536, 0.22),
  // a little smaller than the rest, about 2.5px of its 38 from the opening view: "Keep it since I run it, but maybe make
  // it a little smaller like 2-3px smaller" (Carl, 9 Nov 2026, the officers' fixes quiz)
  studioland: at("teal", 2.45, 1.337, 0.205),
  tour: at("cream", 1.235, 1.066, 0.215, "down"),
};
/* A PHONE'S OWN SPOTS: "i need an artifa5 that allows me to control the per-swipe-camera and the placement of the words.
   Phone/mobile version only please" (Carl, 4 Nov 2026). On a phone held upright a
   word with a spot here sits there instead, at the size he set; the laptop keeps WORD_AT. The phone stop editor that set
   them went with swipe mode (7 Nov 2026); now the words a phone shows all the time (ALL THE WORDS) read them. */
export const WORD_AT_PHONE = {};
let phoneWords = false; // on a phone held upright (src/nav.mjs)
export const setPhoneWords = (on) => {
  if (phoneWords === !!on) return;
  phoneWords = !!on;
  if (HW.text) placeWords(HW, wordAt(HW.key));
  for (const S of SIGNS.values()) placeWords(S, wordAt(S.key));
};
const wordAt = (key) => ({ ...HW_AT, ...(WORD_AT[key] || {}), ...((phoneWords && WORD_AT_PHONE[key]) || {}) });
const PPM = 600; // canvas pixels a metre of wall
// how much of the letters' size their charcoal outline shows outside them (THE OUTLINE); `?stroke=` tries another
const WORD_STROKE = +(new URLSearchParams(location.search).get("stroke") || 0.07);
let WORD_ANISO = 1;
// the most slant filtering the graphics chip offers (src/studio.mjs, once its renderer is made)
export function setWordsAnisotropy(n) {
  WORD_ANISO = n || 1;
  if (HW.tex && HW.tex.anisotropy !== WORD_ANISO) (HW.tex.anisotropy = WORD_ANISO), (HW.tex.needsUpdate = true);
}
const FACE = (f) => `${f}px "DW Fairfield", Georgia, serif`;
// the words drawn at their size, wrapped to their width (or stacked a letter under a letter), on a canvas their own size
function drawWords(S, text, at) {
  const g = S.cv.getContext("2d");
  const T = text.toUpperCase();
  let F = at.s * PPM,
    lines,
    lineH;
  if (at.dir === "down") {
    lines = [...T].map((c) => (c === " " ? "" : c));
    lineH = () => F * 0.92;
  } else if (at.dir === "rows") {
    // a word to a row, and a + on a row of its own (YOU / + / ME), each centred
    lines = T.split(/\s+|(?=\+)|(?<=\+)/).filter(Boolean);
    lineH = () => F * 0.98;
  } else {
    const max = at.w * PPM;
    const wrap = () => {
      g.font = FACE(F);
      const out = [];
      for (const word of T.split(" ")) {
        const tryLine = out.length ? out[out.length - 1] + " " + word : null;
        if (tryLine && g.measureText(tryLine).width <= max) out[out.length - 1] = tryLine;
        else out.push(word);
      }
      return out;
    };
    lines = wrap();
    // a single word wider than the box: its letters come down until it fits
    while (F > 8 && Math.max(...lines.map((l) => (g.measureText(l).width))) > max) (F *= 0.96), (lines = wrap());
    lineH = () => F * 1.02;
  }
  g.font = FACE(F);
  const widest = Math.max(1, ...lines.map((l) => g.measureText(l).width));
  // room round the letters for their outline (THE OUTLINE, below)
  const pad = Math.ceil(F * WORD_STROKE);
  // as wide as the words themselves (they are centred, so nothing moves): the full wrapping width made a click or hover
  // on the wall far to either side of a word count as the word (the clickable map, 8 Nov 2026)
  const W = Math.min(4096, Math.ceil(widest + F * 0.2) + 2 * pad),
    H = Math.min(4096, Math.ceil(lines.length * lineH() + F * 0.2) + 2 * pad);
  S.cv.width = W;
  S.cv.height = H;
  g.clearRect(0, 0, W, H);
  g.font = FACE(F);
  g.fillStyle = "#f4ead8";
  g.textAlign = "center";
  g.textBaseline = "middle";
  /* THE OUTLINE: "can we add a contrast stroke to all the text? relative to the perceived size, not like, a fixed pixel
     size because they're at different zooms" (Carl, 4 Nov 2026). A charcoal line round the cream letters, as wide as a
     share of the letters' own size (WORD_STROKE of it showing outside), drawn into the word's picture, so it grows and
     shrinks with them at any zoom. Then cream on every surface: "can we make the "about" font cream instead of
     charcoal?" (the same day; the cream wall's words were charcoal until then, where cream alone would vanish). */
  g.lineJoin = "round";
  g.lineWidth = 2 * F * WORD_STROKE;
  g.strokeStyle = "#2c2c2a";
  const y = (i) => H / 2 + (i - (lines.length - 1) / 2) * lineH();
  lines.forEach((l, i) => g.strokeText(l, W / 2, y(i)));
  lines.forEach((l, i) => g.fillText(l, W / 2, y(i)));
  // a new texture at the canvas's new size (one already sent to the graphics chip keeps its first size)
  S.tex?.dispose();
  S.tex = new CanvasTexture(S.cv);
  S.tex.colorSpace = NoColorSpace;
  /* sharp seen at a slant: "podcast word looks really blurry bud idk why" (Carl, 4 Nov 2026). PODCAST runs down the teal
     wall by the corner, seen almost edge-on, and a picture seen that slanted was read at a much blurrier size than it
     shows; the graphics chip's slant filtering (anisotropy) reads it sharp. */
  S.tex.anisotropy = WORD_ANISO;
  S.mesh.material.uniforms.map.value = S.tex;
  S.wh = [W / PPM, H / PPM];
}
function placeWords(S, at, text = S.text) {
  if (!S.mesh) return;
  const sig = JSON.stringify([text, at.w, at.s, at.dir]);
  if (text && sig !== S.drawn) (S.drawn = sig), drawWords(S, text, at);
  const [w, h] = S.wh;
  S.mesh.geometry.dispose();
  S.mesh.geometry = new PlaneGeometry(w, h);
  S.mesh.rotation.set(0, 0, (-(at.rot || 0) * Math.PI) / 180);
  // flat on the cream wall facing into the room, or on the teal wall as the map is (placeProp, `wall`)
  if (at.wall === "cream") S.group.rotation.set(0, 0, 0), S.group.position.set(at.x, at.y, 0.021);
  // on the console's front, measured along the teal wall as the teal wall's are (CONSOLE FRONT, below)
  else if (at.wall === "console") S.group.rotation.set(0, Math.PI / 2, 0), S.group.position.set(consoleFront().x, at.y, at.x);
  else S.group.rotation.set(0, Math.PI / 2, 0), S.group.position.set(0.021, at.y, at.x);
  bitsChanged = true;
}
// the words' size on the wall as they are drawn now, turned: for the word editor's grab
export const hoverWordsBox = () => {
  const [w, h] = HW.wh,
    at = wordAt(HW.key);
  return (at.rot || 0) % 180 ? [h, w] : [w, h];
};
// one word's mesh on the wall, faded by `k` (0 to 1)
function newSign(S) {
  const m = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      // the word's own colours, cream letters in their charcoal outline (THE OUTLINE)
      fragmentShader: "uniform sampler2D map; uniform float k; varying vec2 vUv; void main() { vec4 c = texture2D(map, vUv); if (c.a * k < 0.01) discard; gl_FragColor = vec4(c.rgb, c.a * k); }",
      uniforms: { map: { value: null }, k: { value: 0 } },
      transparent: true,
      depthWrite: false,
    }),
  );
  m.visible = false;
  // drawn after everything else: on the console's front (CONSOLE FRONT) the console, drawn after it, covered it
  m.renderOrder = 10;
  S.mesh = m;
  S.group = new Group();
  S.group.add(m);
  return S;
}
export function buildHoverWords() {
  newSign(HW);
  placeWords(HW, HW_AT);
  return HW.group;
}
/* ALL THE WORDS: "Show all the words at first" and "I need to make every word visible and clickable and clear" (Carl, 7
   Nov 2026, his officers' quiz, the second of the phone). Every page's word stands on the wall at its own spot, each its
   own sign beside the one the pointer brings up (HW): src/nav.mjs says when they show. */
const SIGNS = new Map();
export function buildAllWords(list) {
  const g = new Group();
  for (const { key, text } of list) {
    const S = newSign({ cv: document.createElement("canvas"), k: 0, to: 0, text, drawn: "", key, mesh: null, group: null, tex: null, wh: [1, 1] });
    placeWords(S, wordAt(key), text);
    SIGNS.set(key, S);
    g.add(S.group);
  }
  // drawn again in his DW Fairfield once it has loaded, if it had not when the room was built
  document.fonts?.load(FACE(100)).then(() => {
    for (const S of SIGNS.values()) (S.drawn = ""), placeWords(S, wordAt(S.key));
    // and the word under the pointer, if it was up before the face came
    if (HW.text) (HW.drawn = ""), placeWords(HW, wordAt(HW.key));
  });
  return g;
}
// every word up (1) or away (0), fading as the hover word does
export function setAllWords(level, hot = null) {
  // a level, 0 to 1 (true and false still work), and the one word up full whatever it is (src/nav.mjs QUIET UNTIL HOVERED)
  level = +level;
  for (const S of SIGNS.values()) S.to = level > 0 && S.key === hot ? 1 : level;
  bitsChanged = true;
}
// where each word is in the room, for a tap on a word (src/nav.mjs): its key and its four corners
export function allWordsCorners() {
  return [...SIGNS.values()].filter((S) => S.to > 0 && S.k > 0.05).map((S) => ({ key: S.key, corners: signCorners(S) }));
}
/* where the words sit, his to move on the word editor. With a key, that word's own spot; with none, every word's */
export function setHoverWordsAt(at, key = null) {
  if (key && phoneWords) WORD_AT_PHONE[key] = { ...wordAt(key), ...at };
  else if (key) WORD_AT[key] = { ...wordAt(key), ...at };
  else Object.assign(HW_AT, at);
  placeWords(HW, wordAt(key || HW.key));
  // the word on the wall all the time (ALL THE WORDS) follows its spot too
  const sign = SIGNS.get(key);
  if (sign) placeWords(sign, wordAt(key));
}
export const hoverWordsAt = (key) => wordAt(key);
/* CONSOLE FRONT: "i want to be able to put words on the front of the console, like on the plane of the front" (Carl, 4 Nov
   2026). A third surface for the words, `wall: "console"`: the plane of the console's front, a few millimetres proud of it,
   x along the teal wall from the corner as the teal wall's words are. Its box: x the front's distance out from the teal
   wall, z0 to z1 its span along the wall, y0 to y1 floor to top (src/studio.mjs wallAt). */
export function consoleFront() {
  const m = all.find((q) => q.userData.prop.id === "console"),
    p = m?.userData.prop;
  if (!p) return { x: 0.716, z0: 0, z1: 0, y0: 0, y1: 0 };
  const w = p.w,
    h = p.w * (m.userData.aspect || 1);
  return { x: (p.gap || 0.02) + (p.depth || 0) + 0.006, z0: p.alongTeal, z1: p.alongTeal + w, y0: 0, y1: h };
}
// the words' four corners in the room as they are drawn now: a phone's tap turns to take in a thing and its word
// (src/nav.mjs THE WORD FIRST, ON A PHONE)
export const hoverWordsCorners = () => (HW.text ? signCorners(HW) : []);
function signCorners(S) {
  if (!S.mesh) return [];
  S.group.updateMatrixWorld(true);
  const e = S.mesh.matrixWorld.elements,
    [w, h] = S.wh;
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]].map(([x, y]) => [0, 1, 2].map((i) => e[i] * x + e[4 + i] * y + e[12 + i]));
}
export function setHoverWords(text, key = null) {
  if (text) {
    HW.key = key;
    HW.text = text;
    placeWords(HW, wordAt(key), text);
    HW.to = 1;
  } else HW.to = 0;
  bitsChanged = true;
}
function stepSign(S, dt, reduced) {
  if (!S.mesh || S.k === S.to) return false;
  const st = dt / 220;
  S.k = reduced || Math.abs(S.to - S.k) <= st ? S.to : S.k + Math.sign(S.to - S.k) * st;
  S.mesh.material.uniforms.k.value = S.k;
  S.mesh.visible = S.k > 0;
  return true;
}
function stepHoverWords(dt, reduced) {
  let moved = stepSign(HW, dt, reduced);
  for (const S of SIGNS.values()) if (stepSign(S, dt, reduced)) moved = true;
  return moved;
}
export function tickProps(now, reduced) {
  // each steps every frame: with them joined by ||, a moving turntable kept the lid from stepping, so it stood still,
  // then caught up in one frame and snapped shut (the animation sweep, 2 Nov 2026)
  const deckMoved = stepDeck(now, reduced),
    lidMoved = stepLid(now, reduced);
  const hwMoved = stepHoverWords(HW.last ? Math.min(100, now - HW.last) : 16, reduced);
  HW.last = now;
  let changed = deckMoved || lidMoved || bitsChanged || stepMapLights(now, reduced) || hwMoved;
  bitsChanged = false;
  for (const mesh of all) {
    const u = mesh.userData;
    if (!u.blinkTex || reduced || !mesh.material.uniforms.map.value) continue;
    u.openTex ||= mesh.material.uniforms.map.value;
    u.nextBlink ??= now + 2000 + Math.random() * 4000;
    const shut = now >= u.nextBlink && now < u.nextBlink + BLINK_MS;
    if (shut && !u.wasShut) cue("blink"); // its sound's moment (src/cues.mjs)
    u.wasShut = shut;
    // `again`: a second blink straight after, the dog noticing something (src/nav.mjs, THE TOUCHES)
    if (now >= u.nextBlink + BLINK_MS)
      u.nextBlink = now + (u.again || Math.random() < 0.2 ? 180 : 2500 + Math.random() * 5000), (u.again = false);
    const want = shut ? u.blinkTex : u.openTex;
    if (mesh.material.uniforms.map.value !== want) {
      mesh.material.uniforms.map.value = want;
      changed = true;
    }
  }
  const time = clockTime();
  // the second hand's tick, its sound's moment (src/cues.mjs), once a second as it moves
  if (time.second !== lastSecond) {
    if (lastSecond !== null) cue("tick");
    lastSecond = time.second;
  }
  for (const mesh of all) {
    for (const bit of mesh.userData.bits || []) {
      const b = bit.userData.bit;
      if (b.frames) {
        const f = reduced ? 0 : Math.floor((now / 1000) * b.fps) % b.frames.length;
        if (f !== bit.userData.shown && bit.userData.frames[f]) {
          bit.material.uniforms.map.value = bit.userData.frames[f];
          bit.userData.shown = f;
          changed = true;
        }
      }
      if (b.hand) {
        const turns = b.hand === "hour" ? time.hour / 12 : time[b.hand] / 60;
        const a = -turns * Math.PI * 2;
        if (a !== bit.userData.angle) {
          bit.userData.pivot.rotation.z = a;
          bit.userData.angle = a;
          changed = true;
        }
      }
    }
  }
  return changed;
}

let all = [];
let lastSecond = null;
export function buildProps(shared, face, onLoad) {
  all = PROPS.map((p) => {
    const uniforms = {
      map: { value: null },
      grain: shared.grain,
      grainM: { value: GRAIN_M },
      grainK: shared.grainK,
      ...pickLight(shared),
      litK: { value: p.unlit ? 0 : 1 }, // how much light it takes: a lamp's shade, which holds the light, none
      bulb: { value: p.glow ? 1 : 0 }, // a lamp's shade: its mouth glows with the lamp's strength
      dim: { value: 1 }, // a layer behind the front (WIRE DEPTH) is drawn darker
      mute: { value: p.mute || 0 },
      soft: { value: p.soft || 0 },
      fillCol: { value: [0, 0, 0] },
      fillK: { value: 0 },
      // only the picture over this height is drawn (a solid stack's middle layers: not its legs). The gong's strings
      // stop a little under their ties: their picture keeps a stray scrap of an old outline at its bottom left, rows
      // 957 to 1061 of 1095, drawn as a grey arc on the wall beside the gong (the edges sweep, 6 Oct 2026)
      above: { value: p.strings ? 1 - (p.strings.ties + 0.1) : -1 },
      band: { value: [0, 0, 0, 0] },
      bandK: { value: 1 },
      boil: shared.boil,
      boilK: shared.boilK,
      use: { value: 0 }, // a thing you can open (src/nav.mjs)
      hot: { value: 0 }, // the pointer or the keyboard on it
      edgeOnly: { value: 0 }, // opened and flown in to: it boils round its outline alone (src/nav.mjs)
      edgeK: { value: p.disc && p.depth ? 0 : 1 }, // a disc's outline is its rim's (EDGE_VERT), not its face's edge
      texel: { value: [1000, 1000] }, // its drawing's size in pixels, for a boil measured in them
      hotInk: { value: [0.1, 0.1, 0.1] }, // its outline's colour: the drawing's ink, or the focus ring's rust
      navRest: shared.navRest,
      navLook: shared.navLook,
      swBase: {
        value: swatches(p)
          .map((w) => hsv(w.base))
          .flat(),
      },
      swTint: {
        value: swatches(p)
          .map((w) => hsv(w.color || w.base))
          .flat(),
      },
      swOn: { value: swatches(p).map((w) => (w.color ? 1 : 0)) },
      swN: { value: (p.colors || []).length },
      flip: { value: p.flip ? 1 : 0 },
      swPart: { value: swatches(p).map((w) => (w.part ? 1 : 0)) },
      // how far from its colour a pixel may be and still be repainted: 0.2 unless a swatch says
      swReach: { value: swatches(p).map((w) => w.reach || 0.2) },
      partMap: { value: null },
      hasParts: { value: 0 },
      glass: { value: "glass" in p ? p.glass : -1 }, // -1 no glass: a part map's green is not glass
      keep: { value: [0, 1, 0, 1] },
      keepR: { value: 0 },
      ring: { value: 0 }, // a ring copy (THE DEPTH'S BORDER): how wide
      shape: { value: null }, // its silhouette, holes filled (RING THE OUTSIDE)
      hasShape: { value: 0 },
      below: { value: 2 }, // only the picture under this height is drawn (the rear legs' copy uses it)
      dark: { value: LINE.dark },
      size: { value: [p.w, p.w] },
      /* THE LAMP'S COLLAR OVER ITS NECKS: the stand is drawn COLLAR_NEAR metres nearer the camera than it stands, so
         its collar always covers the necks' ends, which run on behind it (tools/cut_lamp.py, INTO THE COLLAR). The
         necks meet the stand within a few centimetres of the pole, and nothing else comes that close to it. */
      // and each shade SHADE_NEAR nearer, so it covers its sleeve's end, which runs on behind its top (INTO THE SHADE)
      toEye: { value: p.pole != null ? COLLAR_NEAR : p.hang ? SHADE_NEAR : 0 },
      /* how see-through a pixel may be and still be drawn (and hide what is behind it). A lamp neck seen edge-on, far
         round to the right, thins to pixels that are nearly see-through, and those hid the shade behind them: a line
         of wall cut down the shade (the lamp angles sweep, 7 Oct 2026). So a neck draws only what is half solid. */
      alphaCut: { value: p.neck != null ? NECK_CUT : 0.02 },
    };
    const m = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
    });
    // a finely cut plane, so dragging its corners bends the picture smoothly (see shapeProp)
    const geo = new PlaneGeometry(1, 1, 16, 16);
    geo.userData.base = Float32Array.from(geo.attributes.position.array);
    const mesh = new Mesh(geo, m);
    mesh.rotation.order = "YXZ"; // turned to the camera first, then leaned in its own picture
    mesh.userData = { prop: p, aspect: 1, face };
    if ((p.lean != null || p.against) && p.depth) boardEdges(mesh, p, shared);
    if (p.lid) consoleLid(mesh, p, shared);
    if (p.disc && p.depth) discBand(mesh, p, shared);
    if (p.box) {
      m.visible = false; // the card: the box below is the book
      const { group, faces, title } = buildBook(p, shared);
      mesh.userData.title = title;
      mesh.add(group);
      mesh.userData.book = group;
      mesh.userData.edges = faces;
    }
    /* WIRE DEPTH: "Can you give me a thickness control for the map?" (Carl, 5 Oct 2026). Copies of the
       picture stacked from the wall out to its front, `depth` deep, each darker the further back, so as
       the camera sways the wires show their thickness and their shaded sides. */
    if (p.layers) {
      mesh.userData.stack = Array.from({ length: p.layers }, (_, i) => {
        const t = (i + 1) / p.layers,
          layer = new Mesh(
            new PlaneGeometry(1, 1),
            new ShaderMaterial({
              vertexShader: VERT,
              fragmentShader: FRAG,
              uniforms: {
                ...uniforms,
                // the map's wires darker going back; a solid stack (`solid`) its own colour, a touch darker,
                // all but its backmost layer, which draws the outline round the back
                // the depth shaded darker going back, its own shadow: "oh and maybe some shadows?" (Carl, 6 Oct 2026)
                dim: { value: p.solid ? 0.95 - 0.25 * t : 0.75 - 0.3 * t },
                fillK: { value: p.solid && i < p.layers - 1 ? 1 : 0 },
                // no layer draws its legs, the backmost neither: the depth is the top's alone, "For the chair
                // legs can we not do the depth on those? Just the top really" (Carl, 6 Oct 2026)
                above: { value: p.solid ? p.legsTop || 0 : -1 },
                fillCol: { value: hex3(p.colors[0].color || p.colors[0].base) },
                keep: { value: p.depthOnly || [0, 1, 0, 1] },
                keepR: { value: p.depthRound || 0 },
              },
              transparent: true,
            }),
          );
        layer.userData.t = t;
        layer.renderOrder = -i - 1;
        mesh.add(layer);
        // a solid stack's border: a charcoal copy a line wide round each layer, drawn behind them all
        if (p.solid) {
          const edge = new Mesh(
            new PlaneGeometry(1, 1),
            new ShaderMaterial({
              vertexShader: VERT,
              fragmentShader: FRAG,
              // as wide as the drawing's own outline, 13 px of its 1084, so the two read as one line: "the border
              // just doesn't match yet" (Carl, 6 Oct 2026)
              uniforms: { ...layer.material.uniforms, ring: { value: (13 / 1084) * p.w } },
              transparent: true,
              depthWrite: false,
            }),
          );
          edge.renderOrder = -100;
          layer.add(edge);
        }
        return layer;
      });
    }
    if (p.glow) {
      const halo = new Mesh(
        new PlaneGeometry(1, 1),
        new ShaderMaterial({
          vertexShader: HALO_VERT,
          fragmentShader: HALO_FRAG,
          uniforms: { lBulb: shared.lBulb, lHalo: shared.lHalo, map: uniforms.map, at: { value: [0, 0, 1, 1] } },
          transparent: true,
          depthWrite: false,
          blending: 2, // added onto what is behind it, as light is
        }),
      );
      halo.renderOrder = 10;
      mesh.add(halo);
      mesh.userData.halo = halo;
    }
    if (p.outline && p.depth) frameBand(mesh, p, shared);
    /* THE REAR LEGS, cut from his drawing, where the back left one shows behind the front ("You can
       see the rear legs in the one I sent you just need to clean up your image and crop and key",
       Carl, 5 Oct 2026; tools/cut_rear_leg.py). It stands under the back left corner of the box and
       a mirror of it under the back right, from the floor to the cabinet's underside. */
    if (p.rearLeg) {
      const legs = [-1, 1].map((sideX) => {
        const lu = {
          ...uniforms,
          map: { value: null },
          size: { value: [0.1, 0.15] },
          flip: { value: sideX > 0 ? 1 : 0 },
          swN: { value: 0 },
          hasParts: { value: 0 },
          below: { value: 2 },
        };
        const leg = new Mesh(
          new PlaneGeometry(1, 1),
          new ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: lu,
            transparent: true,
          }),
        );
        leg.userData.side = sideX;
        mesh.add(leg);
        return leg;
      });
      const li = loadingImage();
      li.onload = () => {
        const t = new CanvasTexture(li);
        t.colorSpace = NoColorSpace;
        for (const l of legs) l.material.uniforms.map.value = t;
        mesh.userData.legAspect = li.naturalWidth / li.naturalHeight;
        sizeEdges(mesh);
        onLoad();
      };
      li.onerror = onLoad;
      li.src = p.rearLeg;
      mesh.userData.rearLegs = legs;
    }
    if (p.bits) mesh.userData.bits = p.bits.map((b, i) => buildBit(mesh, b, i, uniforms));
    mesh.visible = false;
    const img = loadingImage();
    img.onload = () => {
      const t = new CanvasTexture(img);
      t.colorSpace = NoColorSpace;
      t.minFilter = LinearMipmapLinearFilter;
      // a lamp's necks and shades are seen nearly edge-on from far round: without it their lines crumbled
      if (p.neck != null || p.hang) t.anisotropy = 8;
      uniforms.map.value = t;
      uniforms.texel.value = [img.naturalWidth, img.naturalHeight];
      if (p.ringOutside) {
        uniforms.shape.value = silhouette(img);
        uniforms.hasShape.value = 1;
      }
      // a disc's rim: how many of its wobble's waves go round it, about 40 of the drawing's pixels each (EDGE_VERT)
      const ru = mesh.userData.band?.material?.uniforms; // (a picture frame's band is a group, and has none)
      if (ru && p.disc)
        ru.around.value = Math.max(8, Math.round((Math.PI * (p.disc[2] * img.naturalWidth + p.disc[3] * img.naturalHeight)) / 40));
      mesh.userData.aspect = img.naturalHeight / img.naturalWidth;
      shapeProp(mesh);
      placeProp(mesh);
      mesh.visible = true;
      onLoad();
    };
    img.onerror = onLoad;
    img.src = p.src;
    if (p.blink) {
      const bi = loadingImage();
      bi.onload = () => {
        const t = new CanvasTexture(bi);
        t.colorSpace = NoColorSpace;
        t.minFilter = LinearMipmapLinearFilter;
        mesh.userData.blinkTex = t;
      };
      bi.src = p.blink;
    }
    if (p.parts) {
      const pm = loadingImage();
      pm.onload = () => {
        const t = new CanvasTexture(pm);
        t.colorSpace = NoColorSpace;
        uniforms.partMap.value = t;
        uniforms.hasParts.value = 1;
        onLoad();
      };
      pm.onerror = onLoad;
      pm.src = p.parts;
    }
    if (p.id === "map") mapLights(mesh);
    return mesh;
  });
  /* the gong's strings take its light under the pointer, as its rim does: "Light them too" (Carl, 6 Oct 2026, asked on
     the edges sweep's quiz whether they should light up with it) */
  for (const m of all)
    if (m.userData.prop.strings) {
      const parent = all.find((g) => g.userData.prop.id === m.userData.prop.on);
      if (parent) m.material.uniforms.hot = parent.material.uniforms.hot;
    }
  return all;
}

/* RING THE OUTSIDE: a drawing's silhouette, white wherever it is or what it closes round, so the keyboard's ring
   goes round its outside and not round every hole in it (the map's seas between its wires). Everything see-through
   that the picture's border reaches without crossing ink is outside; the rest is the silhouette. */
function silhouette(img) {
  const W = img.naturalWidth,
    H = img.naturalHeight,
    cv = Object.assign(document.createElement("canvas"), { width: W, height: H }),
    c = cv.getContext("2d", { willReadFrequently: true });
  c.drawImage(img, 0, 0);
  const d = c.getImageData(0, 0, W, H),
    px = d.data,
    out = new Uint8Array(W * H),
    q = [];
  const visit = (i) => {
    if (!out[i] && px[i * 4 + 3] < 128) (out[i] = 1), q.push(i);
  };
  for (let x = 0; x < W; x++) visit(x), visit((H - 1) * W + x);
  for (let y = 0; y < H; y++) visit(y * W), visit(y * W + W - 1);
  while (q.length) {
    const i = q.pop(),
      x = i % W;
    if (x > 0) visit(i - 1);
    if (x < W - 1) visit(i + 1);
    if (i >= W) visit(i - W);
    if (i < W * (H - 1)) visit(i + W);
  }
  for (let i = 0; i < W * H; i++) {
    const v = out[i] ? 0 : 255;
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
    px[i * 4 + 3] = 255;
  }
  c.putImageData(d, 0, 0);
  const t = new CanvasTexture(cv);
  t.colorSpace = NoColorSpace;
  return t;
}

/* Places a prop from its own numbers: its width in metres, its height following its drawing.
   One standing on the floor stands its feet there; a cut-out is flat and faces the camera across the
   corner, so a wide one would cut into both walls (the chair at twice its size did), and it stands at
   least far enough out of the corner for its ends to clear them, CLEAR metres to spare. One riding on
   another (`on`) stands by that one's middle, and is placed again whenever that one moves. */
/* A prop riding on another is stuck flat to that one's front, `depth` metres before it, and turns
   with it: it takes its parent's turn rather than turning to the camera on its own. Turning each on
   its own, the two were never quite parallel once the camera moved, so the pillow cut through the
   chair and flickered in front and behind: "It glitches and there's no front/back. It always needs
   to stay visually in front of the chair" (Carl, 5 Oct 2026). It is also drawn after its parent
   (renderOrder), so the see-through edges of the two never sort the wrong way round. */
const CLEAR = 0.05;
/* FLIP mirrors the picture left to right (Carl, 5 Oct 2026: "flip l/r"). Its corners could once be
   dragged too ("corner holds that I can reshape it"); they were taken off the same day ("remove the
   corner controls"), and the plane keeps its fine cut only for the day they are wanted back. */
const NO_CORNERS = () => [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
];
export function shapeProp(mesh) {
  const p = mesh.userData.prop,
    c = p.corners || NO_CORNERS(),
    g = mesh.geometry,
    base = g.userData.base,
    pos = g.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) {
    const u = base[i] + 0.5,
      v = base[i + 1] + 0.5;
    // c: [top left, top right, bottom left, bottom right]
    const k = [(1 - u) * v, u * v, (1 - u) * (1 - v), u * (1 - v)];
    pos[i] = base[i] + k.reduce((a, w, j) => a + w * c[j][0], 0);
    pos[i + 1] = base[i + 1] + k.reduce((a, w, j) => a + w * c[j][1], 0);
  }
  g.attributes.position.needsUpdate = true;
  mesh.material.uniforms.flip.value = p.flip ? 1 : 0;
}

export function placeProp(mesh) {
  sizeEdges(mesh);
  // `wide` squeezes or stretches its width alone, its height kept ("could you give me a control to
  // squeeze the width of the console In-N-Out?", Carl, 5 Oct 2026)
  const { prop: p, aspect, face } = mesh.userData,
    w = p.w * (p.wide ?? 1),
    h0 = p.w * aspect * (p.long ?? 1), // `long` stretches a rug's length alone
    raise = p.pole != null ? p.raise || 0 : 0,
    h = h0 + raise;
  mesh.scale.set(w, h, 1);
  mesh.material.uniforms.size.value = [w, h];
  /* THE LAMP'S HEIGHT: "We need to make the lamp taller" (Carl, 5 Oct 2026). `raise` metres added to the
     straight run of its pole (POLE, shares of the picture's height from its bottom), so the base, collar,
     necks and shades keep their shape and the necks and shades rise with it. */
  if (p.pole != null) {
    const [a, b] = POLE.map((v) => v * h0);
    mesh.material.uniforms.band.value = [a / h, (b + raise) / h, POLE[0], POLE[1]];
    mesh.material.uniforms.bandK.value = h / h0;
  }
  /* a rider (the pillow) starts each placing upright: the chair's lean for the opening tipped it with the chair, and what
     was left of that tip piled up frame on frame, until the pillow lay edge-on across the chair: "Something weird happened
     with the pillow, it should be locked with the chair" (Carl, 9 Nov 2026) */
  if (p.on) mesh.rotation.x = 0;
  mesh.rotation.z = ((p.tilt || 0) * Math.PI) / 180;
  const parent = p.on && all.find((m) => m.userData.prop.id === p.on);
  if (p.against === "teal") {
    // a box with its back against the teal wall, facing into the room: the picture's right end toward
    // the corner, `alongTeal` metres from it, `gap` off the wall
    mesh.rotation.set(0, Math.PI / 2, 0);
    mesh.position.set((p.gap || 0.02) + (p.depth || 0), h / 2 + 0.005, p.alongTeal + w / 2);
  } else if (p.lean != null) {
    // leaning on the cream wall: the top edge touching it, the bottom edge on the floor, `lean` degrees off upright
    const a = (p.lean * Math.PI) / 180,
      d = p.edges === false ? 0 : p.depth || 0;
    mesh.rotation.set(-a, 0, 0);
    // its back's top edge against the wall and its FRONT bottom edge on the floor, the pivot a real
    // leaning board rests on, so its bottom face tips up toward the wall. It first stood on its back
    // bottom edge, which slanted the bottom face down and out: "the bottom looks like it was angled
    // out and gets wider (and not angled up at all" (Carl, 5 Oct 2026); then on the front edge it tipped
    // too far back: "angle is too far back (split the difference)". So it stands on the middle of its
    // bottom face, half way between the two. A hair above the floor.
    const up = (h / 2) * Math.cos(a) + (d / 2) * Math.sin(a) + 0.005,
      out = 0.02 + (h / 2) * Math.sin(a) + d * Math.cos(a);
    if (p.leanWall === "teal") {
      // on the teal wall instead, facing into the room, its right end toward the corner, `along` metres from
      // it to its nearer end: "the marching machine should get flipped horizontally and moves to the left wall
      // outside of the console" (Carl, 5 Oct 2026)
      mesh.rotation.set(-a, Math.PI / 2, 0);
      mesh.position.set(out, up, p.along + w / 2);
    } else mesh.position.set(p.along + w / 2, up, out);
  } else if (p.floor) {
    // flat on the floor, its face up `depth` above it, its edge down to the floor (frameBand)
    // (its order is YXZ: turned in its own picture, then laid down)
    mesh.rotation.set(-Math.PI / 2, 0, (Math.round((p.turn || 0) / 90) * Math.PI) / 2);
    mesh.position.set(p.x, (p.depth || 0) + 0.002, p.z);
  } else if (p.wall === "teal") {
    // flat on the teal wall, facing into the room: its right end toward the corner, `x` metres from it
    mesh.rotation.set(0, Math.PI / 2, 0);
    mesh.position.set(0.02 + (p.layers || p.disc || p.outline ? p.depth || 0 : 0), p.y + h / 2, p.x + w / 2);
  } else if (p.wall) {
    // flat on the cream wall, a hair off it so the wall's own paint never shows through; a disc's face
    // `depth` further out, its rim back to the wall
    mesh.rotation.y = 0;
    // `off` stands it that far out from the wall, on the face of something in front of it (his name on the duct)
    mesh.position.set(p.x + w / 2, p.y + h / 2, 0.02 + (p.off || 0) + (p.disc || p.outline || p.layers ? p.depth || 0 : 0));
  } else if (parent && p.atop) {
    // standing on the console's top, its own place, turned to the camera by `follow`
    const P = parent.userData.prop;
    mesh.renderOrder = parent.renderOrder + 2;
    /* ALWAYS IN FRONT OF WHAT IT SITS ON: "i want the dog to always be in front of the book" (Carl, 2 Nov 2026). A flat
       cut-out on a box sinks into it from some angles and the box hid its paws; `front` draws it after everything on
       the console, never hidden by it. */
    if (p.front) {
      mesh.renderOrder = parent.renderOrder + 20;
      mesh.material.depthTest = false;
    }
    // its feet are the point placed; it turns and tilts about them, so a tilt never lifts a paw off what
    // it stands on ("as I move the camera around they disconnect and the dog starts hovering", 5 Oct 2026)
    const fx = parent.position.x - (p.inset || 0),
      fy = parent.position.y + parent.scale.y / 2 + (p.up || 0) + liftOf(p.id) + panelUnder(P, p.along),
      fz = P.alongTeal + (p.along || 0),
      ry = turnTo({ x: fx, z: fz }, p.follow ?? 1, lastEye || face),
      t = mesh.rotation.z,
      side = -Math.sin(t) * (h / 2);
    mesh.rotation.y = ry;
    mesh.position.set(fx + Math.cos(ry) * side, fy + Math.cos(t) * (h / 2), fz - Math.sin(ry) * side);
  } else if (parent && p.box) {
    // on the console's top: `along` from its corner end, `inset` back from its front
    const P = parent.userData.prop;
    mesh.scale.set(1, 1, 1);
    mesh.rotation.set(0, ((p.spin || 0) * Math.PI) / 180, 0);
    mesh.userData.book?.scale.setScalar(p.w);
    mesh.userData.title?.place();
    const top = parent.position.y + parent.scale.y / 2 + liftOf(p.id) + panelUnder(P, p.along);
    mesh.position.set(parent.position.x - (p.inset || 0) - p.w * 0.31, top, P.alongTeal + p.along);
    mesh.userData.top = top + p.w * 0.16;
  } else if (parent && p.neck != null) {
    /* a lamp neck: the stand's size and canvas, turned `neck` degrees more about the pole. It does not
       turn with the stand as the camera sways; it keeps the turn the stand has from where the camera
       opens, so its shade stays where it is in the room: "The shades should stay a fixed distance from
       the wall while swaying" (Carl, 5 Oct 2026). */
    const P = parent.userData.prop,
      pw = P.w * (P.wide ?? 1),
      ph = P.w * parent.userData.aspect,
      at = parent.userData.anchor || parent.position,
      home = homeEye || face,
      ry = Math.atan2(home.x - at.x, home.z - at.z) + ((P.spin || 0) * Math.PI) / 180,
      r2 = ry + (p.neck * Math.PI) / 180,
      off = (P.pole - 0.5) * pw,
      poleX = at.x,
      poleZ = at.z;
    p.w = P.w;
    mesh.scale.set(pw, ph, 1);
    mesh.material.uniforms.size.value = [pw, ph];
    mesh.rotation.set(0, r2, 0);
    // up by the pole's added height above the stand's middle, which has risen by half of it
    mesh.position.set(poleX - Math.cos(r2) * off, parent.position.y + (P.raise || 0) / 2, poleZ + Math.sin(r2) * off);
  } else if (parent && p.strings) {
    // the gong's strings: the parent's canvas, its screw on the wall, tipped out about it until its ties
    // are half the parent's depth off the wall
    const P = parent.userData.prop,
      pw = parent.scale.x,
      ph = parent.scale.y,
      [su, sv] = p.strings.screw,
      sy = (0.5 - sv) * ph,
      reach = (p.strings.ties - sv) * ph,
      a = Math.asin(Math.min(1, (P.depth || 0) / 2 / reach)),
      sx = parent.position.x + (su - 0.5) * pw,
      wallY = parent.position.y + sy;
    p.w = P.w;
    mesh.scale.set(pw, ph, 1);
    mesh.material.uniforms.size.value = [pw, ph];
    mesh.rotation.set(-a, 0, 0);
    mesh.renderOrder = parent.renderOrder + 1;
    mesh.position.set(
      sx - (su - 0.5) * pw,
      wallY - sy * Math.cos(a),
      0.02 + sy * Math.sin(a),
    );
  } else if (parent && p.hang) {
    // a lamp shade: its top on the same spot of its neck's canvas, wherever the neck has turned, and
    // the shade turned to the camera about that spot
    const L = all.find((m) => m.userData.prop.id === parent.userData.prop.on),
      pw = parent.scale.x,
      ph = parent.scale.y,
      lx = (p.hang[0] - 0.5) * pw,
      ly = (0.5 - p.hang[1]) * ph,
      r2 = parent.rotation.y,
      hx = parent.position.x + Math.cos(r2) * lx,
      hy = parent.position.y + ly,
      hz = parent.position.z - Math.sin(r2) * lx,
      eye = lastEye || face,
      rs = Math.atan2(eye.x - hx, eye.z - hz);
    p.w = L ? L.userData.prop.w : p.w;
    mesh.scale.set(pw, ph, 1);
    mesh.material.uniforms.size.value = [pw, ph];
    mesh.rotation.set(0, rs, 0);
    mesh.renderOrder = parent.renderOrder + 1;
    mesh.position.set(hx - Math.cos(rs) * lx, hy - ly, hz + Math.sin(rs) * lx);
    // its bulb's halo, round the middle of its mouth, HALO metres across whatever the shade's size
    const halo = mesh.userData.halo;
    if (halo) {
      halo.position.set(p.glow[0] - 0.5, 0.5 - p.glow[1], 0.03);
      halo.scale.set(HALO / pw, HALO / ph, 1);
      // where it lies on the shade's picture, so it can keep off the metal
      halo.material.uniforms.at.value = [p.glow[0], 1 - p.glow[1], HALO / pw, HALO / ph];
    }
  } else if (parent) {
    // the parent's facing: toward the camera is (sin, cos) of its turn, right as the camera sees it (cos, -sin)
    const P = parent.position,
      ry = parent.rotation.y,
      nx = Math.sin(ry),
      nz = Math.cos(ry);
    mesh.renderOrder = parent.renderOrder + 1;
    mesh.position.set(
      P.x + nz * p.side + nx * (p.depth ?? 0.1),
      p.up + h / 2,
      P.z - nx * p.side + nz * (p.depth ?? 0.1),
    );
    // its own turn to the camera where it sits (FOLLOW, faceProps), or the parent's: "I think we need to
    // do the same thing for the pillow" (Carl, 5 Oct 2026)
    mesh.rotation.y = "follow" in p ? turnTo(mesh.position, p.follow, lastEye || face) : ry;
  } else {
    const out = (w / 2) * Math.SQRT1_2 + CLEAR,
      x = Math.max(p.along ?? p.at[0], out),
      z = Math.max(p.alongTeal ?? p.at[1], out),
      toward = Math.hypot(face.x - x, face.z - z) || 1,
      fwd = p.fwd || 0,
      // `slide`: left (negative) or right as the camera opens on it, square to its line of sight: "I need
      // left right controls for the chair and pillow" (Carl, 6 Oct 2026)
      slide = p.slide || 0,
      rx = -(face.z - z) / toward,
      rz = (face.x - x) / toward;
    mesh.position.set(
      x + ((face.x - x) / toward) * fwd - rx * slide,
      h / 2 + (p.lift || 0),
      z + ((face.z - z) / toward) * fwd - rz * slide,
    );
    if (p.pole != null) {
      // a prop with a pole stands with its POLE on that spot, and turns about it (SPIN, faceProps)
      const off = (p.pole - 0.5) * w,
        ry = mesh.rotation.y;
      mesh.userData.anchor = { x: mesh.position.x, z: mesh.position.z };
      mesh.position.x -= Math.cos(ry) * off;
      mesh.position.z += Math.sin(ry) * off;
    } else delete mesh.userData.anchor; // a pole given up (PHONE PROPS): it turns about its middle again
  }
  for (const m of all) if (m.userData.prop.on === p.id) placeProp(m);
}

/* PHONE PROPS: a prop's `phone` numbers stand in for its own by `w`, 1 all the way, 0 its own (studio.mjs: on a phone,
   during the opening flyover, then easing back). The drum's turn about its right foot is the first. A number it does not
   have counts as its plain one (a pole in the middle, no slide, no spin), and at 0 it is exactly as it was. */
const PLAIN = { pole: 0.5, slide: 0, fwd: 0, spin: 0 };
// `onPhone`: the phone's layout is on, so the prop rests on its `phoneRest` numbers where it has them, not its own
export function phoneProps(w, onPhone = false) {
  for (const m of all) {
    const p = m.userData.prop;
    if (!p.phone) continue;
    const key = w + "/" + onPhone;
    if (p.phoneW === key) continue;
    p.laptop ??= Object.fromEntries(Object.keys(p.phone).map((k) => [k, p[k]]));
    p.phoneW = key;
    const rest = onPhone && p.phoneRest ? p.phoneRest : p.laptop;
    if (!w) {
      setProp(m, rest);
      continue;
    }
    setProp(m, Object.fromEntries(Object.entries(p.phone).map(([k, v]) => { const own = rest[k] ?? PLAIN[k]; return [k, own + (v - own) * w]; })));
  }
}
// changes some of a prop's numbers and places it again
export function setProp(mesh, changes) {
  Object.assign(mesh.userData.prop, changes);
  if ("mute" in changes) mesh.material.uniforms.mute.value = changes.mute;
  if ("soft" in changes) mesh.material.uniforms.soft.value = changes.soft;
  if ("glass" in changes) mesh.material.uniforms.glass.value = changes.glass;
  if ("flame" in changes || Object.keys(changes).some((k) => /^(hour|minute|second)[XYK]$/.test(k))) sizeBits(mesh);
  if ("corners" in changes || "flip" in changes) shapeProp(mesh);
  placeProp(mesh);
}

// each cut-out turned to face the camera, wherever it stands, as the paper garden's cards do;

// where each lamp shade's light is, in the room (LIGHT, light.mjs)
export function lampLights() {
  return all
    .filter((m) => m.userData.prop.glow && m.visible && m.scale.x)
    .map((m) => {
      const [u, v] = m.userData.prop.glow,
        lx = (u - 0.5) * m.scale.x,
        r = m.rotation.y;
      // raised LIGHTS.lampLift above the mouth, so the light reads as coming from inside the shade
      return [m.position.x + Math.cos(r) * lx, m.position.y + (0.5 - v) * m.scale.y + LIGHTS.lampLift, m.position.z - Math.sin(r) * lx];
    });
}
let lastEye = null; // where the camera is, for the lamp's shades to face
let homeEye = null; // where it opened, which the lamp's necks keep their turn from
// the turn of something at `at`, `follow` of the way from facing where the camera opened to facing it now
function turnTo(at, follow, eye) {
  const home = Math.atan2((homeEye || eye).x - at.x, (homeEye || eye).z - at.z);
  let d = Math.atan2(eye.x - at.x, eye.z - at.z) - home;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return home + follow * d;
}
/* THE CHAIR AND DRUM LEAN BACK FOR THE OPENING (studio.mjs): tipped back about their feet, the drum 20 degrees and the
   chair 10, the pillow on the chair going with it: "Drum looks great at 20%, try chair at 10% please" (Carl, 9 Nov 2026).
   `LEAN_BACK_K` is how far through it is, 1 all the way back. */
let LEAN_BACK_K = 0;
const LEANS_BACK = { chair: 10, drum: 20 };
export function setLeanBack(k) {
  LEAN_BACK_K = k;
}
function leanBack(m) {
  const p = m.userData.prop,
    a = (LEAN_BACK_K * LEANS_BACK[p.id] * Math.PI) / 180;
  if (!a && !m.userData.leaned) return;
  m.userData.leaned = !!a;
  if (!a) return;
  const h = p.w * m.userData.aspect,
    ry = m.rotation.y,
    axis = m.position.clone().set(Math.cos(ry), 0, -Math.sin(ry)), // the card's own across, in the room (the bundle's Vector3)
    feet = m.position.clone().setY(m.position.y - h / 2);
  const riders = [m, ...all.filter((r) => r.userData.prop.on === p.id)];
  for (const r of riders) {
    const d = r.position.clone().sub(feet).applyAxisAngle(axis, -a);
    r.position.copy(feet).add(d);
    r.rotateOnWorldAxis(axis, -a);
  }
}
export function faceProps(meshes, eye) {
  lastEye = eye;
  homeEye ||= { x: eye.x, z: eye.z };
  // the ones on the floor turn to the camera; placing them again carries the ones riding on them along
  for (const m of meshes) {
    if (
      m.userData.prop.on ||
      m.userData.prop.wall ||
      m.userData.prop.floor ||
      m.userData.prop.lean != null ||
      m.userData.prop.against
    )
      continue;
    /* SPIN (Carl, 5 Oct 2026: "I'd like the ability to rotate the lamp pieces relative to the floor
       (like if I were to keep the base flat on the floor like it is but spin it around"): `spin`
       degrees added to its turn toward the camera, about its pole, its necks going round with it. */
    /* SPIN (Carl, 5 Oct 2026: "I'd like the ability to rotate the lamp pieces relative to the floor
       (like if I were to keep the base flat on the floor like it is but spin it around"): `spin`
       degrees added to its turn toward the camera, about its pole, its necks going round with it. */
    /* FOLLOW: how much of the way it turns to the camera as the camera sways, 1 all the way (always
       facing you), 0 none (the turn it has from where the camera opens, as the lamp's necks keep).
       "I feel like the chair moves too much now relative to everything else" (Carl, 5 Oct 2026). Tried,
       then its feet held, layers and a build, all undone: "maybe we should go back to the original
       way, except maybe we can unanchor the legs and try the turn control again". */
    if (m.userData.leaned) m.rotation.set(0, m.rotation.y, 0);
    m.rotation.y =
      turnTo(m.userData.anchor || m.position, m.userData.prop.follow ?? 1, eye) +
      ((m.userData.prop.spin || 0) * Math.PI) / 180;
    placeProp(m);
    if (m.userData.prop.id in LEANS_BACK) leanBack(m);
  }
}

// a hex colour as hue, saturation and value, 0 to 1, as the shader reads them
function hsv(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const v = Math.max(r, g, b),
    d = v - Math.min(r, g, b);
  const h = !d ? 0 : v === r ? ((g - b) / d) % 6 : v === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(((h / 6) % 1) + 1) % 1, v ? d / v : 0, v];
}

// a prop's colours padded to the shader's four
const swatches = (p) =>
  [...(p.colors || []), ...Array(4).fill({ base: "#000000", color: null })].slice(0, 4);

// repaints one of a prop's colours in a hex colour, or back to as drawn with null
export function colorProp(mesh, id, hex) {
  const p = mesh.userData.prop,
    i = (p.colors || []).findIndex((w) => w.id === id);
  // a piece placed by its parent (a lamp shade, the gong's strings) is painted by the parent's pickers
  for (const m of followers(p)) colorProp(m, id, hex);
  if (i < 0) return;
  p.colors[i].color = hex;
  for (const e of mesh.userData.edges || [])
    if (id === (e.userData.swatch || p.edgeColor || "frame"))
      e.material.uniforms.color.value = hex3(hex || p.colors[i].base);
  const u = mesh.material.uniforms;
  u.swTint.value = swatches(p)
    .map((w) => hsv(w.color || w.base))
    .flat();
  u.swOn.value = swatches(p).map((w) => (w.color ? 1 : 0));
  if (p.solid)
    for (const l of mesh.userData.stack || [])
      l.material.uniforms.fillCol.value = hex3(p.colors[0].color || p.colors[0].base);
}
// the pieces placed and painted by this prop, with no panel of their own
export const follows = (p) => !!(p.hang || p.strings);
export const followers = (p) => all.filter((m) => m.userData.prop.on === p.id && follows(m.userData.prop));
