# The studio's edges sweep, 6 Oct 2026

**Carl, 6 Oct 2026: "do a visual sweep to make sure there's no weird glitches or unintended mismatch between
boil/ripple and card edges, etc."** Asked whether to report or fix: **"Fix objective issues/bugs/glitches, but flag any
potential improvements".**

## What Carl has to decide

**Nothing.** The last open question, the keyboard's rust ring on the gong, is answered and done. It was drawn on the
gong's face, in front of its thickness, and covered part of it (`flag-5-gong-focus-ring-crosses-rim.png`). Asked on the
quiz, he answered "Something else" with "Is it cropping parts out too?"; told it was, and asked whether it should go round
the outside of the thickness instead: "yes" (7 Oct 2026). A rust copy of the rim band, pushed out by the ring's width
and drawn behind the gong, now rings the whole outside, thickness and all, and covers nothing (RIM_HALO in
`src/props.mjs`; `answer-5-gong-ring-outside.png`).

**His four answers, on the picture quiz (https://claude.ai/artifact/SZ2rKa3CSJsqgNJ4X6BxAm, 6 Oct 2026), all done**,
each with a labelled before and after (`answer-*.png`):

1. **The gong's strings light up with it: "Light them too".** The strings' material takes the gong's own `hot`
   (`buildProps` in `src/props.mjs`).
2. **The console's right edge re-cut: "Re-cut it".** The blue left by the key in its outline's dark pixels (the drawing's
   last columns measured rgb 14,24,33 against the outline's 16,14,13), which the boil smeared into a bluish sliver, is
   set to the outline's own warm charcoal at the same brightness (`DEBLUE` in `tools/cut_art.py`; the console has no
   blue of its own). Re-run, the cut gave back the old picture exactly before the change, so nothing else moved.
3. **The lamp's arms cleaned up: "Clean them up".** Where two arms run close, a thin slice of one's outline landed on the
   other's picture and came loose beside it as they turned. Each arm now keeps only what lies within a pixel of its own
   thick body (THE NECKS' STRAYS in `tools/cut_lamp.py`); the canvas, the pole and the shades are as they were.
4. **The keyboard's ring on the map goes round its outside: "Just the outside".** The ring tests the map's silhouette,
   its holes filled, rather than its ink (RING THE OUTSIDE, `ringOutside` in `src/props.mjs`).

## What was fixed

Each has a labelled before and after in `sweeps/edges-2026-10-06/` (a film for anything that moves). How much and when
anything boils is unchanged: the four that open boil whole at rest, outline only while one is open, the rest still,
nothing under reduced motion.

1. **The gong's rim boiled apart from its face, once it was opened** (`fix-1-gong-opened-rim-boil.mp4`,
   `fix-1b-gong-opened-what-moves.png`). The rim band's front ring and back ring both wandered on a noise of their own
   while the face's edge held still, so its front line left the face and showed as a second line beside it, and the rim
   peeped past the face on the far side. Cause: `EDGE_VERT` in `src/props.mjs` moved the whole band. Now the band's
   front ring stays on the face's edge and only its back ring, the depth's outer edge, wanders. Measured over the
   boil's drawings: pixels moving on the far side 38 before, 0 after.
2. **At rest the gong's face and rim boiled apart, and a grey arc floated under it** (`fix-2-gong-at-rest-boil.mp4`,
   `fix-2b-grey-arc-cause.png`). At rest the face boils whole while the rim boiled by its own noise, so the two drifted
   apart. Now the rim reads the face's own boil (the same numbers, shared from its material: `use`, `navRest`,
   `edgeOnly`, `edgeK`, `boilK`, `size`, `texel`) and goes where the face's drawn edge goes. The arc was not the rim:
   switching the face and rim off left it. It is a stray scrap at the bottom left of `assets/gong-strings.webp` (rows
   957 to 1061 of 1095; the ties are at row 331, nothing between). The strings' card now stops a little under its ties
   (`above` in `buildProps`); the art is untouched.
3. **The press left the gong's strings behind** (`fix-3-gong-press-strings.mp4`). The gong squashed by a tenth across
   while its strings kept their width, so their ends stood out past the rim at the deepest squash. Now the strings
   narrow with it about the same middle (`hung` in `src/nav.mjs` THE PRESS); their screw stays on the wall.
4. **The light under the mouse lit fronts and not their sides** (`fix-4-light-reaches-sides.png`). The console's built
   top and sides, and the gong's rim, stayed dark while the front glowed, a hard seam along the console's top.
   `EDGE_FRAG` now takes its face's `hot` and `navLook` and lifts by the same amount. The book's box, which has no
   face to light with, is unchanged.
5. **The gong's rim was drawn as a jagged polygon up close** (`fix-5-gong-rim-curve.png`). Its wobble ran about 64
   waves round it on 96 corners, so each wave got one or two corners. Now 512 corners, and the wobble wraps round
   without a step where its angle starts again (`around`, `n1` in `EDGE_VERT`).
6. **The keyboard's focus filled the map solid rust** (`fix-6-map-focus-ring.png`). The ring is drawn just inside the
   edge for a drawing cut flush to its card (the console's front); that rule also fired beside every see-through hole,
   and the map's wires, thinner than the ring, went solid. Now only the card's own border counts (`gap` in FRAG's
   inked outline). The console keeps its inside ring.

`after-heatmap-what-boils-at-rest.png` is `tests/heat.mjs` after all six: the four boil, nothing else.

## What was checked and found clean

At 1440x900 and a phone on its side (844x390), off the real page on the frozen clock (`tests/heat.mjs`'s), the boil's
drawings compared pixel by pixel and the joints enlarged:

- **At rest:** the console's front against its built top, the map's stacked thickness (its layers boil together), the
  picture frame, the chair's depth and its border, the pillow, the lamp's shades and bulbs, the eye painting's frame,
  the drum, the dog, the mug, the candle, the book and its spine title. Only the four boil.
- **The mouse on each of the four:** the light, after fix 4, on fronts, sides, rim, the map's layers and the console's
  rear legs alike.
- **Each window open, flown in:** the console's front against its sides (its card's edge cannot move, so no gap), the
  frame, the map, the gong (fix 1).
- **Mid-flight in and out** of the console: its built left side, top and front meet; the chair's depth holds.
- **The press, frame by frame:** the console (its top, sides and rear legs squash with the front; nothing on it is left
  in the air), the frame, the map and its layers. The gong after fix 3.
- **The camera dragged to every limit and wheeled to its closest and widest**, both sizes: the clock's face, rim, body
  and hands; the console's legs, rear legs and the rug's edge. The room's lines where the walls, floor, soffit and wall
  paint meet were seen whole in every view (they hold still, the room's Boil being none) but not enlarged. Visitors' closest zoom is 15.3 degrees against the opening's 17.8, so the views are near each other.
- **Reduced motion:** nothing moves between the boil's drawings at all, at rest or with a window open.
- **The dog's blink:** its eyes-shut picture differs from the open one only round the eyes, the same size and
  outline, so the blink cannot jump the edge. The candle's five flames share one canvas size.
- `node studio/tests/nav.mjs` after the last fix: all steps held.

## What could not be checked, and why

- **The marching machine's board edges.** It leans on the teal wall past the console's far end, outside what visitors'
  limits show, and the flight to the console does not turn that far. Its edges are built the same way as the console's
  box (EDGES OF A BOARD) and hold still, so nothing in the code suggests a mismatch; not seen on screen.
- **Carl's own Boil slider above none.** He set it to none, so no decoration but the four boils. The rim now follows
  that boil too (`boilK` in `EDGE_VERT`), but it was not rendered turned up.
- **A real phone's GPU.** Everything was drawn by headless software WebGL; a real phone's rounding could differ by a
  pixel at the edges.

## How it was looked at

A probe on `tests/heat.mjs`'s frozen clock (the page's time moved by hand, a picture per step), with the decorations
and their uniforms on `window.__studio` (`props`, `shared`, added for this) so pieces could be switched off one at a
time. "Before" pictures were drawn from an untouched copy of the branch. No earlier sweep of the studio exists, and
none was read.
