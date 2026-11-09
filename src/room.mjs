/* The room: one corner, four solid colours (Carl, 5 Oct 2026: "let's make just a single simple
   corner that has the solid teal left wall, solid cream right wall, solid orange ceiling, and
   solid brown floor"), built in 3D the way the paper garden is, so the camera can move through it
   ("like the garden", the same day). The colours are the brief's, sampled by eye off the photos.

   In metres. The corner's edge stands at x = 0, z = 0; the teal wall is the plane x = 0, the cream
   wall z = 0, the floor y = 0 and the ceiling y = ROOM.h. The walls run far enough that the camera
   never sees where they end.

   THE SOFFIT. The orange is not one ceiling. Shown the full-set photo's top, Carl, 5 Oct 2026:
   "I forget what those things are called but it has hvac in it" (a soffit, a box hung from the
   ceiling over the ducts), "It's roughly as deep as the left side is wide", "the right side
   extends all the way off screen", and "It's wood ceilings but look at the image, where it has a
   protruding box of the soffit that doesn't extend all the way left but is sticking out like an
   L". So, seen from above, an L: a square BLOCK in the corner, SOFFIT.block each way, its end
   stopping partway along the teal wall (the teal runs on up past it), and an ARM along the cream
   wall, SOFFIT.arm deep, running off the right of the screen. Both hang SOFFIT.drop below the real
   ceiling, which is wood as well. The drop was 0.6 m, a third shorter since: "can you make the
   softer like 1/3rd shorter? It hangs too far down" (Carl, 5 Oct 2026). The two oranges are the photo's: the underside lit, the sides
   in the shade. The ceiling above and the block's end over the teal wall are teal: "This particular
   soffit face should be teal as well as the ceiling" (Carl, 5 Oct 2026, circling them), the ceiling a
   shade darker than the wall, as the ceiling was the darkest orange. The sizes are read off the photo by eye. */

import { Mesh, PlaneGeometry, ShaderMaterial, DoubleSide } from "../vendor/three-garden.js";
import { LIGHT_GLSL } from "./light.mjs";

export const ROOM = { h: 3, l: 26 };
/* THE PAINT ON THE CREAM WALL (Carl, 5 Oct 2026: "I want to create the two geometric shapes on the
   cream wall (the yellow and teal)"): the mustard arch, and the deep teal panel painted over its
   right side, both running down to the floor. In metres along the cream wall from the corner, and
   up from the floor. Placed and sized by eye off the full-set photo and the cream wall's close-up,
   not measured. The colours are the brief's. The panel was 0.57 m wide, then as wide as the arch at its widest, 0.70 m, its
   left edge kept where it overlaps the arch: "The teal one should be the same width as the yellow
   shape's widest part" (Carl, 5 Oct 2026). */
export const PAINT = {
  // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  arch: { x: 1.01, w: 0.59, top: 2.28 },
  panel: { x: 1.43, w: 0.47, top: 1.53 },
};
/* Each shape is its left edge `x`, its width `w` and how high its top is, `top`, all in metres; his
   panel has a slider for each ("Actually can I have controls for the height and width and l/r
   placement on the wall?"). The arch's top is always a half-circle as wide as the arch, however it is
   sized: "The top of the yellow should always be a perfect semicircle regardless of resizing"
   (5 Oct 2026). So its round part is worked out from its width here, never set on its own. The
   numbers are his, set on those sliders and saved the same day ("Updated"). */
const archU = (a) => [a.x + a.w / 2, a.top - a.w / 2, a.w / 2, 0];
const panelU = (p) => [p.x + p.w / 2, p.w / 2, p.top, 0];
let paintMaterial = null;
// changes a shape ("arch" or "panel") and redraws the wall
export function setPaint(which, changes) {
  Object.assign(PAINT[which], changes);
  if (!paintMaterial) return;
  paintMaterial.uniforms.arch.value = archU(PAINT.arch);
  paintMaterial.uniforms.panel.value = panelU(PAINT.panel);
}
export const SOFFIT = { block: 1.4, arm: 0.6, drop: 0.4 };
export const PAL = {
  teal: "#1F5A5E",
  cream: "#EDE6DA",
  floor: "#6B3A1F",
  soffit: "#D98A3D",
  soffitSide: "#C0702E",
  arch: "#C9A23A",
  panel: "#0F4A4A",
  ceiling: "#174A4E", // teal, a shade under the wall's
};
export const CHARCOAL = "#2c2c2a";
/* THE LINE (Carl, 5 Oct 2026: "i want the borders to have the charcoal line and boil like the
   garden"). Drawn on the surfaces, its wander in metres, so it wobbles with the wall; its WIDTH
   held in screen px, so every edge reads the same whatever its distance or angle. It was first a
   width in metres, which thinned with distance and all but vanished where a surface is seen
   nearly edge-on, such as the soffit's underside: "notice how some of the intersections don't
   have a border?" (Carl, 5 Oct 2026). It was 5px, then thinner to match the chair: "Can we make the
   room edge borders thinner to match the chair?" The chair's outline measures about 4px on a laptop
   at the opening view, so 4; then he set his panel's Room lines slider and saved 2.5. Its wave lengths are the apps' wobbled line's
   (170, 85 and 42px) at the same scale. DARK is the garden's: "darkest" (Carl, 30 Sept 2026), a
   line drawn 0.6 darker before the grain goes on, so the grain still lands on it. */
export const LINE = { px: 2.5, wander: 0.008, waves: [0.98, 0.49, 0.24], dark: 0.6 };
/* THE GRAIN is the paper garden's tile, in the garden's soft light (Carl, 29 Sept 2026: "Soft
   light. Oh man that looks great!"), laid on each surface at its own point, as the garden lays it
   on each cut-out, so it moves with the wall rather than sitting on the screen. One tile covers
   GRAIN_M metres: about 1024 screen px a tile where the corner stands, the apps' page grain size. */
export const GRAIN_M = 5.9;
/* How strong the grain is, 0 none to 1 the tile at full strength. It was full, which was "quite a
   bit more intense than what's in the garden" (Carl, 5 Oct 2026); half is where it starts, the
   strength the apps' page grain was given ("3 halfway", 30 Sept 2026); he set it on his panel's
   Grain slider and saved 0.35 the same day. */
export const GRAIN_K = 0.35;

/* How many edges there are, each with its own wobble; buildRoom numbers them as it goes, and the
   arch's and the panel's outlines take the last ones but one (EDGES - 3, EDGES - 2). */
export const EDGES = 18;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const VERT = `
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

/* Each surface knows its own two axes (u, v in metres) and up to three of the edges, each as
   (which axis is constant: 0 u, 1 v; where; +1 if inward is the coordinate rising, -1 falling;
   which edge). `side` is +1 or -1 so the two surfaces either side of an edge put the same line
   in the same place: the wobble moves the line across the fold rather than splitting it. `inset`
   moves a line wholly onto this surface, for an edge whose other side is hidden (the soffit's
   ends against the teal wall, which lie inside the box). `range` keeps a line to a stretch of its
   edge, for an edge that is only part of the surface's side. */
const FRAG = `${LIGHT_GLSL}
uniform vec3 color; uniform vec3 ink; uniform sampler2D grain; uniform float grainM; uniform float grainK;
uniform vec3 origin; uniform vec3 axisU; uniform vec3 axisV;
uniform vec4 edge[4]; uniform float side[4]; uniform float inset[4]; uniform vec2 range[4]; uniform int edges;
uniform vec3 ph[${EDGES}]; uniform vec3 waves; uniform float wander; uniform float linePx; uniform float dark;
uniform int floored; uniform int boardsOn; uniform sampler2D boards; uniform float boardsM;
uniform int paint; uniform vec4 arch; uniform vec4 panel; uniform vec3 archColor; uniform vec3 panelColor;
varying vec3 vW;
vec3 softLight(vec3 b, float g) { vec3 d = mix(((16.0 * b - 12.0) * b + 4.0) * b, sqrt(b), step(.25, b)); return g <= .5 ? b - (1.0 - 2.0 * g) * b * (1.0 - b) : b + (2.0 * g - 1.0) * (d - b); }
float wob(float t, vec3 p) {
  float A = 6.2831853;
  return wander * (.5 * sin(A * t / waves.x + p.x) + .3 * sin(A * t / waves.y + p.y) + .2 * sin(A * t / waves.z + p.z));
}
void main() {
  vec3 r = vW - origin; float u = dot(r, axisU), v = dot(r, axisV);
  float on = 0.0;
  /* How fast u and v change across a screen pixel, taken once here, before any branch. A slope
     taken inside a branch some neighbouring pixels skip is undefined, and on some graphics chips
     it drew a hairline wherever a part-length edge stopped: "Two weird lines" (Carl, 5 Oct 2026,
     on his phone), one down the teal wall in line with the soffit block's end, one across its
     underside. */
  vec2 gu = vec2(dFdx(u), dFdy(u)), gv = vec2(dFdx(v), dFdy(v));
  for (int i = 0; i < 4; i++) {
    if (i >= edges) break;
    vec4 e = edge[i];
    float q = (e.x < .5 ? u - e.y : v - e.y) * e.z;     // how far inside this surface, from the edge
    float t = e.x < .5 ? v : u;                          // how far along the edge
    float inRange = step(range[i].x, t) * step(t, range[i].y);
    vec3 p = ph[0];
    for (int k = 0; k < ${EDGES}; k++) if (float(k) == e.w) p = ph[k];
    // the line's width is held on screen, whatever the angle or distance (see LINE)
    float gq = length(e.x < .5 ? gu : gv), hw = .5 * linePx * gq;
    float c = side[i] * wob(t, p) + inset[i] * hw;
    on = max(on, inRange * (1.0 - smoothstep(hw - gq * .75, hw + gq * .75, abs(q - c))));
  }
  vec3 base = color;
  // THE BARN FLOOR, a trial (?floor=barn): his boards from the barn in Homegrown, laid on the floor
  if (floored == 1 && boardsOn == 1) base = texture2D(boards, vec2(u, v) / boardsM).rgb;
  if (paint == 1) {
    // the arch: half its width round on top, square below; the panel: a box. How far outside
    // each one a point is, in metres (negative inside), so the outline can wander across it.
    vec2 c = vec2(arch.x, arch.y);
    float ar = arch.z, da = v > c.y ? length(vec2(u, v) - c) - ar : abs(u - c.x) - ar;
    float dp = max(abs(u - panel.x) - panel.y, v - panel.z);
    float aa = (abs(gu.x) + abs(gu.y)) * .75;
    float inA = 1.0 - smoothstep(-aa, aa, da), inP = 1.0 - smoothstep(-aa, aa, dp);
    base = mix(mix(base, archColor, inA), panelColor, inP);
    // each outline's slope from which side of the shape the pixel is nearest, and the u and v slopes
    vec2 nA = v > c.y ? normalize(vec2(u, v) - c) : vec2(sign(u - c.x), 0.0);
    vec2 nP = abs(u - panel.x) - panel.y > v - panel.z ? vec2(sign(u - panel.x), 0.0) : vec2(0.0, 1.0);
    float gA = length(nA.x * gu + nA.y * gv), hA = .5 * linePx * gA;
    float gP = length(nP.x * gu + nP.y * gv), hP = .5 * linePx * gP;
    float lineA = 1.0 - smoothstep(hA - gA * .75, hA + gA * .75, abs(da - wob(u + v, ph[${EDGES - 3}])));
    float lineP = 1.0 - smoothstep(hP - gP * .75, hP + gP * .75, abs(dp - wob(u + v, ph[${EDGES - 2}])));
    on = max(on, max(lineA * smoothstep(hP, 2.0 * hP, dp), lineP));   // the arch's outline goes under the panel
  }
  vec3 b = mix(base, ink * (1.0 - dark), on);
  float g = mix(.5, texture2D(grain, vec2(u, v) / grainM).r, grainK);
  gl_FragColor = vec4(lit(softLight(b, g), vW, 1.0), 1.0);
}`;

// a surface carries up to four edges; the unused ones are zeros
const pad = (list, empty) => [...list, ...Array(4).fill(empty)].slice(0, 4);

function surface({ color, origin, axisU, axisV, edges, w, h, place, painted = false }, shared) {
  const m = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: DoubleSide,
    uniforms: {
      ...shared,
      color: { value: hex(color) },
      paint: { value: painted ? 1 : 0 },
      floored: { value: color === PAL.floor ? 1 : 0 },
      arch: { value: archU(PAINT.arch) },
      panel: { value: panelU(PAINT.panel) },
      archColor: { value: hex(PAL.arch) },
      panelColor: { value: hex(PAL.panel) },
      origin: { value: origin },
      axisU: { value: axisU },
      axisV: { value: axisV },
      edge: {
        value: pad(
          edges.map((e) => e.slice(0, 4)),
          [0, 0, 0, 0],
        ).flat(),
      },
      side: {
        value: pad(
          edges.map((e) => e[4]),
          0,
        ),
      },
      inset: {
        value: pad(
          edges.map((e) => e[5] || 0),
          0,
        ),
      },
      range: {
        value: pad(
          edges.map((e) => [e[6] ?? -1e3, e[7] ?? 1e3]),
          [0, 0],
        ).flat(),
      },
      edges: { value: edges.length },
    },
  });
  const mesh = new Mesh(new PlaneGeometry(w, h), m);
  if (painted) paintMaterial = m;
  place(mesh);
  return mesh;
}

/* The surfaces. `shared` holds the uniforms every surface reads alike: the grain, the line, and
   the boil's phases, which the page changes in place on each tick. Each edge is
   [axis, where, inward, which edge, side, inset, from, to]: an edge two surfaces share is drawn
   half on each, with sides +1 and -1; an edge whose other side is hidden is drawn wholly on the
   one that shows, inset by half a line. */
export function buildRoom(shared) {
  const { h, l } = ROOM,
    { block: B, arm: A, drop: D } = SOFFIT,
    low = h - D,
    on = 1; // an inset of half a line
  let n = 0;
  const id = () => n++;
  // the edges, each numbered once and handed to both surfaces that draw it
  const E = {
    corner: id(),
    floorTeal: id(),
    floorCream: id(),
    ceilTeal: id(),
    creamTop: id(),
    blockTeal: id(),
    blockFrontLow: id(),
    blockFrontTeal: id(),
    blockFrontTop: id(),
    blockEdge: id(),
    blockSideLow: id(),
    blockSideTop: id(),
    inner: id(),
    armLow: id(),
    armTop: id(),
  };
  const make = (o) => surface(o, shared);
  return [
    make({
      color: PAL.teal,
      origin: [0, 0, 0],
      axisU: [0, 0, 1],
      axisV: [0, 1, 0],
      w: l,
      h,
      edges: [
        [0, 0, 1, E.corner, 1],
        [1, 0, 1, E.floorTeal, 1],
        [1, h, -1, E.ceilTeal, 1],
        // the block's underside meets the teal wall here: half the line is on the wall, where it shows
        [1, low, -1, E.blockTeal, 1, 0, 0, B],
      ],
      place: (m) => {
        m.rotation.y = Math.PI / 2;
        m.position.set(0, h / 2, l / 2);
      },
    }),
    make({
      color: PAL.cream,
      painted: true,
      origin: [0, 0, 0],
      axisU: [1, 0, 0],
      axisV: [0, 1, 0],
      w: l,
      h: low,
      edges: [
        [0, 0, 1, E.corner, -1],
        [1, 0, 1, E.floorCream, 1],
        [1, low, -1, E.creamTop, 1],
      ],
      place: (m) => m.position.set(l / 2, low / 2, 0),
    }),
    make({
      color: PAL.floor,
      origin: [0, 0, 0],
      axisU: [1, 0, 0],
      axisV: [0, 0, 1],
      w: l,
      h: l,
      edges: [
        [0, 0, 1, E.floorTeal, -1],
        [1, 0, 1, E.floorCream, -1],
      ],
      place: (m) => {
        m.rotation.x = -Math.PI / 2;
        m.position.set(l / 2, 0, l / 2);
      },
    }),
    make({
      color: PAL.ceiling,
      origin: [0, h, 0],
      axisU: [1, 0, 0],
      axisV: [0, 0, 1],
      w: l,
      h: l,
      edges: [[0, 0, 1, E.ceilTeal, -1]],
      place: (m) => {
        m.rotation.x = Math.PI / 2;
        m.position.set(l / 2, h, l / 2);
      },
    }),
    // the block's underside, B by B in the corner
    make({
      color: PAL.soffit,
      origin: [0, low, 0],
      axisU: [1, 0, 0],
      axisV: [0, 0, 1],
      w: B,
      h: B,
      edges: [
        [0, 0, 1, E.blockTeal, -1],
        [1, 0, 1, E.creamTop, -1],
        [1, B, -1, E.blockFrontLow, 1],
        [0, B, -1, E.blockSideLow, 1, 0, A, B],
      ],
      place: (m) => {
        m.rotation.x = Math.PI / 2;
        m.position.set(B / 2, low, B / 2);
      },
    }),
    // the arm's underside, from the block to the end of the cream wall
    make({
      color: PAL.soffit,
      origin: [0, low, 0],
      axisU: [1, 0, 0],
      axisV: [0, 0, 1],
      w: l - B,
      h: A,
      edges: [
        [1, 0, 1, E.creamTop, -1],
        [1, A, -1, E.armLow, 1],
      ],
      place: (m) => {
        m.rotation.x = Math.PI / 2;
        m.position.set((l + B) / 2, low, A / 2);
      },
    }),
    // the block's front, facing along the teal wall into the room: teal, as the wall below it
    make({
      color: PAL.teal,
      origin: [0, low, B],
      axisU: [1, 0, 0],
      axisV: [0, 1, 0],
      w: B,
      h: D,
      edges: [
        [0, 0, 1, E.blockFrontTeal, 1, on],
        [1, 0, 1, E.blockFrontLow, -1],
        [1, D, -1, E.blockFrontTop, 1, on],
        [0, B, -1, E.blockEdge, 1],
      ],
      place: (m) => m.position.set(B / 2, low + D / 2, B),
    }),
    // the block's side, facing along the cream wall, between its front and the arm
    make({
      color: PAL.soffitSide,
      origin: [B, low, 0],
      axisU: [0, 0, 1],
      axisV: [0, 1, 0],
      w: B - A,
      h: D,
      edges: [
        [0, B, -1, E.blockEdge, -1],
        [1, 0, 1, E.blockSideLow, -1],
        [1, D, -1, E.blockSideTop, 1, on],
        [0, A, 1, E.inner, 1],
      ],
      place: (m) => {
        m.rotation.y = Math.PI / 2;
        m.position.set(B, low + D / 2, (A + B) / 2);
      },
    }),
    // the arm's front, facing the room, running off the right of the screen
    make({
      color: PAL.soffitSide,
      origin: [0, low, A],
      axisU: [1, 0, 0],
      axisV: [0, 1, 0],
      w: l - B,
      h: D,
      edges: [
        [0, B, 1, E.inner, -1],
        [1, 0, 1, E.armLow, -1],
        [1, D, -1, E.armTop, 1, on],
      ],
      place: (m) => m.position.set((l + B) / 2, low + D / 2, A),
    }),
  ];
}

export const inkColor = () => hex(CHARCOAL);

/* THE BARN'S FLOOR, a trial behind `?floor=barn`: "what would it look like if we used the same floor as the barn?" (Carl,
   9 Nov 2026). The barn's boards as Homegrown's garden draws them (ss-frontend garden/src/template.html roomFlatBoards,
   copied here): rows of boards in his planks' brown, a hair lighter or darker board to board, rippled charcoal between
   them, the joins across a board staggered row to row. The barn's sizes in metres: a board BOARD_W wide, about BOARD_L
   long. One tile of TILE_M metres, repeated. */
export const BOARDS = { tile: 6, w: 0.16, len: 1.9, seam: 0.022, end: 2.5, ripple: 0.006, fill: "#965131", shade: 0.78 };
export function barnBoards(B = BOARDS, px = 340) {
  const cw = Math.round(B.tile * px), ch = cw, cv = Object.assign(document.createElement("canvas"), { width: cw, height: ch }),
    g = cv.getContext("2d");
  let s = 67;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const [fr, fg, fb] = [1, 3, 5].map((i) => parseInt(B.fill.slice(i, i + 2), 16) * B.shade);
  const amp = B.ripple * px;
  const ripple = () => {
    const w = [0, 1, 2].map((i) => [rnd() * 6.28, (0.006 + 0.01 * rnd()) * (i + 1) * (1.5 / px) * 340, ((1 - i * 0.3) * amp) / 2]);
    return (t) => w.reduce((v, [ph, f, a]) => v + a * Math.sin(ph + f * t), 0);
  };
  g.fillStyle = "#2c2c2a";
  g.fillRect(0, 0, cw, ch);
  const rows = Math.max(1, Math.round(B.tile / B.w)),
    rh = ch / rows,
    m = (B.seam * px) / 2,
    e = ((B.seam * px) / 2) * B.end,
    bl = B.len * px;
  for (let y = 0; y < ch - 1; y += rh) {
    for (let x = -rnd() * bl; x < cw; ) {
      const b = bl * (0.7 + 0.6 * rnd()),
        t = 0.96 + 0.08 * rnd();
      const top = ripple(), bot = ripple(), l = ripple(), r = ripple(),
        x0 = x + e, x1 = x + b - e, y0 = y + m, y1 = y + rh - m;
      g.fillStyle = `rgb(${Math.min(255, fr * t) | 0},${Math.min(255, fg * t) | 0},${Math.min(255, fb * t) | 0})`;
      g.beginPath();
      for (let u = x0; u < x1; u += 6) g.lineTo(u, y0 + top(u));
      for (let v = y0; v < y1; v += 6) g.lineTo(x1 + r(v * 3) * B.end, v);
      for (let u = x1; u > x0; u -= 6) g.lineTo(u, y1 + bot(u));
      for (let v = y1; v > y0; v -= 6) g.lineTo(x0 + l(v * 3) * B.end, v);
      g.closePath();
      g.fill();
      x += b;
    }
  }
  return cv;
}
