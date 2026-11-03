# The arc lamp from every angle (6-7 Oct 2026)

**What Carl has to decide: nothing.** He answered both questions on the quiz
(https://claude.ai/artifact/XA1QSrfxj27E7GsyfHxhXN) on 7 Oct 2026:

1. **Turned far to the right, the lamp's arms vanish: "Leave it".** The necks keep the turn they open with ("The
   shades should stay a fixed distance from the wall while swaying"), so from far right they are seen edge-on and
   the shades look like they float. Only his free camera gets there; a visitor's stops at about 36° either way,
   before it happens. Left as it is. (`still-wrong-1-far-right-necks-edge-on.png`)
2. **Zoomed right in, a few specks are left: "Call it done".** At normal size the lamp looks right from everywhere a
   visitor can stand (the fifth blind check agreed). Zoomed in close there are still dark specks where the necks
   part, a frayed edge under each sleeve, and a thin crack between two necks at a visitor's furthest right. No more
   rounds on them. (`still-wrong-2-specks-up-close.png`)

**The lamp is not fixed by the test this work was given:** a fresh helper, shown the sheets and nothing else, has not
yet found nothing. What it finds has shrunk from cracks and loose pieces at every angle to specks seen only zoomed in.

Carl, 6 Oct 2026: "There are still some weird issues with the lamp next, depending on which angle you are looking at
it from. All of the past agents that I have tried to get to fix it once and for all come back constantly saying that
it's fixed, and even providing renders of a very clearly not fixed image... I just don't want it to come back with a
confident but unfinished result."

## How it was looked at

`node studio/tests/lamp.mjs` (one command; "Run it" in `studio/CLAUDE.md`). The lamp alone in the room, every other
decoration hidden, the camera stood wherever Carl's free camera can stand (FREE in `src/studio.mjs`: turn ±1.5, tilt
±0.7) and pointed at the lamp, since the lamp's look depends only on where the camera stands (the stand and shades
turn to it). 9 turns × 3 tilts, at the opening lens and at Carl's closest (4), the Height as saved and at 0, 1440×900,
the boil held and the clock frozen. Tilted up past about 0.62 the camera walks under the floor, so the top row is
tilted 0.6. Every panel says its turn, tilt and lens on the picture, and "Carl only" where a visitor's camera cannot
stand. The sheets, before and after, are in `sweeps/lamp-angles-2026-10-06/`:

- `*-1-whole-lamp-height-saved.jpg`, `*-1-whole-lamp-height-0.jpg`: the whole lamp, every turn and tilt
- `*-2-necks-and-collar-height-*.jpg`: closest lens, framed on the necks and collar
- `*-3-joins-enlarged.jpg`: where the necks cross, where they go into the collar, each shade on its sleeve
- `*-4-visitors-furthest-views.jpg`: the same places as far as a visitor's camera goes each way
- `film-whole-lamp-before-and-after.mp4`, `film-necks-and-collar-before-and-after.mp4`: the turn swept slowly from
  furthest left to furthest right and back, before on the left, after on the right

## What was wrong, why, and what changed

Each cause was proved by switching a piece off (`--eval`) or changing one thing, not argued from the code.

### 1. A bare edge, a pale ragged seam and a crack of wall between the necks: at every angle

Where two necks touch in his drawing they share one black line. The cut gave each pixel to the neck whose hand-read
centreline was nearest, so a shared line went to one neck alone. **Proved:** with the middle neck switched off, the
long neck has no line at all on that side. As the necks turn apart, one shows its bare tan edge, ragged and pale
where the cut ran through the drawing's blended pixels, with the wall between. The day's earlier "Clean them up"
(THE NECKS' STRAYS) dropped the stray slices instead of giving them back, which made the same gaps. This was suspect
(d).

**Fix (`tools/cut_lamp.py`, EACH NECK BY ITS OWN TUBE):** a neck is its own tan inside, found as the pieces of tan
its centreline runs through, plus every line within a few pixels of it. A line two necks share is copied to both,
and its far edge fades by how dark it is, so it ends as a line ends.

### 2. The necks' ends slide across the collar and hang over its edge: everywhere but the opening view

The necks were cut flat at the collar's top. The stand turns to the camera; the necks keep the turn they opened
with. So the flat ends sat on the collar from a different angle each time, overhanging its edge with a pale line
between, worst tilted and to the right. This was suspect (a). **Proved** on the enlarged collar sheet: every panel
off the opening view shows it.

**Fix (INTO THE COLLAR):** each neck runs on down behind the collar (its last row repeated), and the stand is drawn
6 cm nearer the camera than it stands (`toEye`, COLLAR_NEAR in `src/props.mjs`), along the line of sight, so it lies
exactly where it lies on screen and the collar always covers the necks' ends. Nothing else comes within 6 cm of the
pole.

### 3. Bits of line floating over the shades' tops, and a slice of one shade's rim beside another

The cut gave a shade everything inside a circle read off the drawing by hand. The circles were a few pixels too big,
so each shade carried the sides of its sleeve, and shade 3 a slice of shade 2's rim. When the shade turns to the
camera and the sleeve does not, those float loose. **Proved:** with shade 3 switched off, the dotted arc beside it
goes.

**Fix (EACH SHADE BY ITS OWN SHAPE):** a circle is fitted to each shade's real outline, and a shade is the patch of
ink that circle holds most of (the shades never touch in the drawing). A line hugging a neck's tan is the neck's.

### 4. A pale ragged seam between each sleeve and its shade: at most angles

The shade turns to face the camera; its sleeve stays on the neck. The top of the shade is a curve, so it lies a
little differently on the two, and the wall shows between. Suspect (a) again.

**Fix (INTO THE SHADE):** each sleeve keeps the whole line it sits on, the shade keeps its whole rim, and the sleeve
runs on in each column down to its shade's top, close to where the shade turns (SLEEVE_REACH); each shade is drawn
7 cm nearer the camera (SHADE_NEAR), so it covers that run. The first try, a 4 px run everywhere and 3 cm, showed as
dark drips and little "legs" under the sleeves from above; the blind check found them, and they are what the reach,
the 7 cm and the run to the shade's own top are for.

### 5. A line of wall cut down the front shade, far round to the right

Seen almost edge-on, a neck thins to nearly see-through pixels, which still hid the shade behind them, so the wall
showed through in a line. This was suspect (b), transparent cards that write depth hiding each other. **Proved**
in the necks-and-collar film, last frames: the line is the colour of the wall behind, not of the neck.

**Fix (`alphaCut`, NECK_CUT):** a neck draws only what is at least a third solid; every other card is as it was.
The necks and shades also get the anisotropic filtering the floor has, so their lines do not crumble when seen
nearly edge-on (they did at a visitor's furthest right).

### 6. A blue fringe round every line, and pale specks and slits in the black between the necks

The drawing's black lines blend into its bright blue background through darker blues. The key counted those as
solid, so every line of the lamp had a ring of dark blue round it (the stand's edge pixels averaged RGB 32, 54, 76),
unseen on the cream wall and plain over a shade, the teal wall or the ceiling; saved lossy, the colours round the
lines went bluer still. **Proved** by reading the pieces: a thousand solid bluish pixels on the stand alone, and the
rendered edges blue where the file held warm ink. This was there before any of this work, at every angle.

**Fix (THE BLUE IN THE LINES, EVERY EDGE IS INK):** a bluish pixel is ink and background mixed, so it is drawn ink,
as see-through as its share of background (the console's cut does the same, DEBLUE, "Re-cut it"); every half
see-through pixel is ink; the pieces are saved lossless, each see-through pixel holding its nearest colour; and in
the black between two tubes the copies are solid, the drawing's hairlines of background filled, small holes and
loose dots of tan inked. No pixel of ink is left on no piece.

### What was ruled out

Suspect (b) at the necks' crossing: drawing the three necks in a fixed order, depth off, changed nothing visible at
the opening view, so how the neck cards cross in 3D is not what breaks them there.

### What did not change

His drawing (`art/` untouched), the colours, sizes and place, the necks' turns, the shades facing the camera, the
Height, the light and bulbs. The cut's canvas is pinned (`assert box == ...`) so `pole` and every `hang` still point
at the same spots. Seen from the opening view, before and after are the same picture but for the glitches.

## Which earlier try this resembles, and why it should hold

Closest to **bb009fd** (recut piece by piece, each neck by its own fill). That cut still gave every shared line to
one neck (`own = min(...)`), so it kept glitch 1, and it was built for the droop, which tipped the necks apart and
showed the middle neck's drawn-in stretch, the part Carl called not clean. This one copies shared lines to both
necks, has no droop, and draws nothing new: the middle neck's hidden stretch is left as his drawing has it, and asked
about. **3bc19b8** turned the necks about joints above the collar and crossfaded them into it; that joint came apart
from the stand once the necks turned round the pole ("Thats not fixed dude"). Here the necks still turn about the pole
and the collar is drawn over their ends instead, so there is no joint to come apart. **b858a73** (today's strays) is
replaced: its job is done by building each neck from its own tube.

It holds because each fix removes the cause at every angle rather than at the ones rendered: a neck has its own
line all round wherever it turns, and the collar and shades cover the ends they meet whatever the angle, which the
sheets check across the whole of Carl's free camera.

## The blind checks

Five times, a fresh helper was given the before and after sheets (and later the full-size panels and Carl's drawing)
and told: the lamp has glitches, find every one; earlier reviewers called it clean when it was not. It was told
nothing about what changed, and not to read the code. Each round's findings went back to the causes above.

1. **First** (6 Oct): drips under the sleeves, sleeve 2 on "legs" with slits, sleeve 3 ragged and pale underneath,
   a nick in shade 1's rim, specks and a white slit where the necks cross, a blue-green halo on the collar. All from
   this work's own first sleeve and seam fixes, or the blue in the lines: glitches 4 and 6 above.
2. **Second** (7 Oct): a grey speck at the crossing, dotted pale slits, pale seams round the sleeves at a visitor's
   furthest right, crumbly necks there, a pinhole on sleeve 3, a dark-blue fringe on every shade. Glitches 5 and 6.
3. **Third**: notches where the gaps between necks close, ragged teeth under the sleeves looking up, a lump on the
   collar's top, a cold blue-grey outer pixel on every line. The last was the drawing's blue in solid pixels, and
   lossy saving: glitch 6.
4. **Fourth**: stopped partway, because this work had found its own regression first: the fill for the hairlines
   between necks had blacked out the gaps the drawing shows, and the loose-dot rule had inked part of the middle
   neck. Both pulled back.
5. **Fifth** (on what is live): at normal size, every visitor view clean. Zoomed in: specks where the necks part, a
   thin crack between two necks at a visitor's furthest right, frayed sleeve undersides, a short step at the
   collar's top corner, a 1 px seam on sleeve 3. Carl-only: far round to the right the necks thin to nothing and
   the shades float; coloured fringes where an edge-on line lies over the ceiling or the teal wall.

The rounds were stopped there, not finished: the last two had each fixed specks and made something else a little
worse, and what is left is either seen only zoomed in or needs a change to how the lamp is built (question 1).

## Still wrong, or not checked

- The two things at the top, with their pictures, left as they are on Carl's word (7 Oct 2026).
- The middle neck's tip, where it narrows away between the other two: the fifth check judged it part of the
  drawing, and it is left as drawn.
- Up close at the opening view, the long and middle necks' shared line reads a little thicker than drawn, since
  each now carries its own copy and they are turned 2 degrees apart. Before, it was a thin line with a pale crack in
  it.
- Not checked: a phone-sized window, and the boil's other two drawings (the sheets hold the middle one).
- `node studio/tests/nav.mjs` passes run alone (7 Oct). Sharing the machine with a lamp render it times out at a
  different step each run, and the room before this work does the same.
- Published to the live room (version 143, 7 Oct) with the other session's gong focus ring (RIM_HALO), already his.
