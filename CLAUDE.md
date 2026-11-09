# Carl's personal site: the studio

An explorable version of Carl's home studio. Each object in the room opens a section of the site.
**Carl, 5 Oct 2026: "I'd like to put it as a different repo once we have it built with the garden/shed js".** Built in
the ss-frontend repo's `studio/` folder until 3 Nov 2026, then moved here for the launch: "should it just stay in this
repo for now? is that gonna slow things down for the rest of homegrown etc?", then "i just created a new repo:
carlbahner" (Carl, 3 Nov 2026). Nothing here imports from Homegrown: the garden pieces it uses are copied into
`src/garden-bits.mjs`, each saying where it came from. Where this file names "the repo" for Homegrown's docs
(`docs/STUDIO-ROOM-SOUND-MOMENTS.md`, the admin app's room sound page), that is ss-frontend, which still keeps a copy of
the room in `studio/` for its room sound page.

**It is carlbahner.com**, replacing his old site ("i want to replace my current site", 3 Nov 2026). `build-site.sh dist`
lays out what a visitor's browser loads (the page, `src`, `vendor`, `assets`, `404.html`) and nothing else: his
drawings' sources, the brief's photos, the tools and the tests are never published.

The brief and the three reference photos are in `brief/`, as Carl sent them on 5 Oct 2026.
`brief/photos/03-full-set-camera-view.jpeg` is the master the room is traced from.

## Where it stands: one bare corner

**Carl, 5 Oct 2026: "let's make just a single simple corner that has the solid teal left wall, solid
cream right wall, solid orange ceiling, and solid brown floor".** So that is all the page is:
`src/room.mjs` `paintCorner`, four flat colours filling the whole window.

**Then, the same day: "i want the paper grain and i want the borders to have the charcoal line and
boil like the garden".** So the five edges where two colours meet are charcoal lines that boil (three
wobbles shown 0,1,2,1 every 130 ms, the middle one held under reduced motion, drawn 0.6 darker
before the grain as the garden's are), and the paper garden's grain (`assets/paper-grain.webp`,
copied from `garden/assets/`) lies on every surface in soft light, the blend he picked for the
garden. The line's weight and wander are a first guess, not yet seen by him.

**Then, shown it flat: "is it using three.js? it wont let me move or do anything", and asked how he
wanted to move: "like the garden".** So the room is 3D now, in the paper garden's own three.js
bundle (`vendor/three-garden.js`, copied from `garden/assets/`). The wheel (or + and -) steps
between three zooms, near, close and far, at the garden's ease and from its 26 degree lens.

**Then: "the camera should be fixed, so dragging moves the angle it's looking not moving the camera
itself".** So the camera stands still at eye height on the room's diagonal: dragging turns its head
(as far as keeps the corner in reach), and the zooms change its lens, never where it stands.
For a while it moved left and right only ("sway left and right like you have it but not up and
down"); then "can I have up/down control again for the camera?" (5 Oct 2026), so it tilts again, and
an Up/down switch on the Camera panel holds it level (`level` in `src/studio.mjs`). A trackpad's two-finger swipe turns the view
the same way, since it was stepping the zoom ("swiping up or down just zooms in and out?"); a pinch
zooms, and a mouse wheel's notches still step the zoom. How
far it may turn waits for the decorations (Carl: "we'll decide once we get decorations in").

**Then, the ceiling: the orange is a soffit, not the ceiling** ("it has hvac in it"), shaped like an
L ("a protruding box of the soffit that doesn't extend all the way left but is sticking out like an
L"), under a ceiling that is wood too ("It's wood ceilings"). `src/room.mjs` says how his words were
read: a square block in the corner and a narrower arm along the cream wall, off the right of the
screen. The sizes and the three oranges are read off the photo by eye.

**Then the paint on the cream wall: "I want to create the two geometric shapes on the cream wall (the
yellow and teal)".** The mustard arch and the deep teal panel over its right side, flat paint drawn
in the cream wall's own shader with boiling charcoal outlines (`PAINT` in `src/room.mjs`, placed by
eye off the photos). The panel is as wide as the arch ("same width as the yellow shape's widest
part"); each has width, height and left/right sliders on his panel, saved at `settings/paint`, and
the arch's top is always a half-circle as wide as the arch ("a perfect semicircle regardless of
resizing"). The lines and grain are drawn on the
surfaces in one shader (`src/room.mjs`), so they sit on the walls and narrow with distance.

**Pinch to zoom** ("can you add pinch to zoom so I can make a snapshot of where I want the starting
camera to be?"): a trackpad pinch (Chrome's ctrl-wheel and Safari's own gesture) and two fingers on
a touch screen zoom the lens smoothly; the plain wheel still steps. A Save start view button stored
the view he chose in the live page's database (`views/start`, 5 Oct 2026), and that is now the
opening view (`START` in `src/studio.mjs`); the button and the database have gone.

**Every edge drawn the same width on screen** ("notice how some of the intersections don't have a
border?"), then thinner to match the chair, 4px, then 2.5px set on his Room lines slider, saved in
`settings/look`. See THE LINE in `src/room.mjs`.

**The first decoration: the chair** (Carl's drawing, sent 5 Oct 2026). Kept as he sent it in
`art/chair-source.png`, cut out of its blue by `tools/cut_art.py chair` into `assets/chair.webp`, and
stood in the corner by `src/props.mjs` the way the paper garden stands a drawing: a flat cut-out on
its feet, turned to face the camera, with the grain over it. A new drawing is a cut script and one
row in `PROPS`. Doubled on his word ("Chair should be like 2x the size"), and a wide cut-out stands
far enough out of the corner to clear both walls.

**An arranging panel for Carl while the room is arranged** ("Can you give me the ability to resize
it?", then "it's too far back"): a size and a forward slider a decoration and a Save button, shown
only to someone who can edit, keeping each setting in the live page's database at `props/<id>`
(`w`, `fwd`). The page opens with what was saved, so it holds; read them back with the ArtifactData
tool (`list`, collection `props`), write them into `PROPS`, and the panel can go once the room is
arranged. The chair's saved size, 1.35 m, is already in `PROPS`.

**The panel is gone, 1 Nov 2026: "I need the notes/editor modal thing removed" (Carl).** Everything he had saved on
it (the light, the wall paint, the chair's depth and taper, the eye painting, the frame's glass, the clock's hands)
was written into `LIGHTS`, `PAINT` and `PROPS` the same day, each marked, so what he sees is what every visitor sees.
`ARRANGING` in `src/studio.mjs` switches the panel back on if a decoration ever needs arranging again.

**The camera is Sway** (Carl tried the three, then picked Sway and saved it with the chair 0.9 m
forward, 5 Oct 2026), opening on the view he saved with his phone turned sideways ("This is what the opening laptop view
should be"). Turn and Swing stay on his panel.
The panel's Save keeps each decoration (`props/<id>`) and the grain (`settings/look`); read them back
with ArtifactData and write them into `PROPS` and `GRAIN_K`. It no longer keeps the camera: that
replaced his chosen laptop view whenever he saved something else on his phone. The view is `START`.

**Grain at half strength, and the chair recoloured** ("ease up on the paper grain, it's quite a bit
more intense than what's in the garden. And we also need to recolor the chair"). `GRAIN_K` in
`src/room.mjs`; a prop's `color` repaints its drawing's fabric, keeping its shading, outline and
wood. It was first turned orange, from one photo, and was wrong ("No, the chair is yellow in real
life"), so it starts as drawn and he picks. A Grain slider and a colour picker on his panel, saved at
`settings/look` and in `props/<id>`.

**The pillow rides on the chair** ("let's add this pillow onto the chair, give me controls for that
too"): a prop with `on` stands by its parent's middle and moves with it, placed by `side`, `up` and
`tilt`, and `depth` in front of the chair: first 0.3 so it drifted against it ("a little depth relative
to the chair"), now 3 cm, as that drift slid it across the chair ("It seems to move too far left and
right no matter what setting I have", 5 Oct 2026), each a slider on his panel and saved in `props/<id>` like the rest. Grain is his saved 0.35.
Its four colours each have a picker too ("Can you re-color it as well?"): a prop's `colors` lists the
colours in its drawing that can be repainted, saved as `colors` in `props/<id>` (COLOURS in
`src/props.mjs`).

**The panel always sits wholly on screen** ("can you reset the hud to be lower? It renders in a place I
can't reach", 5 Oct 2026): dragged anywhere, it shrinks and scrolls inside rather than running off.

**The panel shows one element at a time** ("can we hide those settings so I'm only working on one
element at a time?"): an Editing menu at its top picks Camera, Room, Wall shapes or a decoration. It
opens on the newest decoration, so a new drawing's controls are the ones he sees first.

**The gong hangs on the cream wall, with thickness** ("Can we recolor this and remove those dashed lines on the
rim?"; then a second drawing without them: "Can we try coloring this to match the one that is in there
now, but then I would like to add thickness/depth to the gong itself"). `tools/cut_gong.py` cuts it into
the disc and its strings. A prop with `wall` lies on the wall at `x` and `y`; one with `disc` too has a rim
built round its outline, `depth` deep (a Depth slider), its back on the wall. The strings (`strings`) are
one card from the screw, flush on the wall, out to the middle of the rim's depth: "the strings would then
attach the two points in the middle of the depth at the top of the gong, and the top point where it hangs
on the screw would be attached flush to the wall". Their rope colour is on the gong's panel. "Outline" is
near-black only, so the gong's dark brown face counts as a colour.

**The block rack leans on the cream wall**, an object and not a wall decoration ("you're treating it
like a wall decoration this is an object"), its top against the wall and its bottom on the floor ("so
it looks accurately like it's leaning when I sway the camera"): a prop with `lean` (degrees off
upright) is not turned to the camera. The drawing shows it already leaning, so `tools/cut_art.py`
straightens it to face front, on its front face's own corners (`STRAIGHTEN`, `FRONT`: "look at the outline of this and imagine how it would
look leaned against the wall") and the room gives the angle. It is then clipped to its front face
alone, flush to its outline, and the room builds its top, bottom and sides as real surfaces `depth`
deep (EDGES OF A BOARD in `src/props.mjs`: "can you clip those sides and top and make it more 3d?"). Left / right (`along`) and Lean sliders, in front of the teal panel ("I need to
recolor this one but this is the next piece", with a photo of the real one in
`brief/photos/04-blocks-rack-photo.jpeg`). Its frame and blocks' end faces are two oranges too close
to split by colour, so `tools/cut_art.py` writes a part map (`PARTS`) marking the end faces by shape,
and a colour marked `part` repaints only those pixels. A colour's `reach` widens how far from it a
pixel may be and still be repainted.

**Flip on every decoration** ("flip l/r"), saved as `flip`; a wall decoration's up / down reaches
below the floor. Corner handles to bend a picture came and went the same day ("remove the corner
controls").

**The decorations boil** ("can we add the boil to the gong, marching machine, pillow and chair?"):
the garden's boil done in their shader (THE BOIL in `src/props.mjs`), on the same 130 ms clock as the
room's lines, at half the garden's strength with a Boil slider ("It's a little too much tbh but I
can't find any boil controls"), saved in `settings/look`. The block rack is the marching machine, its
real name, on his panel.

**The record console stands in front of the teal wall** ("here's the next piece, for the other wall"):
`alongTeal` metres along the teal wall, with wood and cane pickers. Then given real 3D sides ("Yes!"):
clipped to its front face, legs kept (`ON_LEGS`), and stood square with its back to the wall
(`against`), its top and sides built `depth` deep down to the cabinet's underside (`body`). Its cut takes the key's
leftover blue out of its outline (`DEBLUE`), which the boil had smeared into a bluish line down its right edge: "Re-cut
it" (6 Oct 2026, the edges sweep's quiz).

**The chair is his drawing, turning to face you, with a "turns to you" slider** (`follow`, 1 always facing
you, 0 holding the turn it has from where the camera opens). On 5 Oct 2026 ("I feel like the chair moves
too much now relative to everything else") four tries were made and undone: the slider at a half ("that
doesn't seem to get the kind of effect I'm looking for"); its feet held on the floor while its top turned;
cutting it into a backrest layer behind a seat-and-arms layer ("This is very much not working", the drawing
having its perspective drawn in); and building it in blocks ("That chair looks terrible lol"). Then: "maybe
we should go back to the original way, except maybe we can unanchor the legs and try the turn control
again". So the slider is back; he set it to 0.2. It has a Left/right (`slide`, square to the opening view's line of
sight: "I need left right controls for the chair and pillow") and a Depth, the map's stacked thickness
(`layers`, `depth`: "And chair depth?"), hidden at 0. That depth is the fabric's mustard, not stacked
outlines, with only its back edge drawn and none on its legs (`solid`, `legsTop`: "For the chair legs can we not do the depth on those? Just the top really", 6 Oct 2026), and it narrows
towards the back on a Taper slider (`taper`). Its depth has a charcoal border round its outer edge, a line-wide
charcoal copy of each layer drawn behind them all (THE DEPTH'S BORDER), and is shaded darker going back: "next i want
you to add a border on the depth part of the couch", then "oh and maybe some shadows?" (6 Oct 2026), read as shading
on the depth itself, not shadows thrown on the floor. Then the depth on the backrest alone, the cushion between
the arms (`depthOnly`, a box on its picture), the arms flat again: "Can we try making the depths of the chair just the
backrest?" (6 Oct 2026, with the cushion's top traced on a screenshot). Then "there are these streaks along the top, and
the sides go too far out": the streaks were the drawing's soft outline edge taken for the legs' wood and left dark on
every layer, so a layer with its legs clipped is all fabric now; the sides come in to the cushion's. The border is as wide and as
dark as the drawing's own outline, 13 px of its 1084 ("the border just doesn't match yet"), and its top corners rounded (`depthRound`): "the corners need to
be rounded a bit"; then its sides set on the cushion's own side lines, read off the drawing, its border lying on them
("sooooooo close", with the sides traced): "Can we make the added depth of the chair taper in? Can I
control that? And can you make it the same mustard yellow?" (6 Oct 2026). Its depth's edge and border fade over a screen pixel
rather than cutting on or off, so the top of its back runs smooth on a phone: "the back of the chair looks blocky and not
smooth?", then, shown 64 layers for 12 (tried and put back): "they all look the same / It looks pixelated and stepped"
(Carl, 9 Nov 2026; SMOOTH EDGES ON THE CHAIR'S DEPTH in `src/props.mjs`). The pillow has its own ("I think we need to do the
same thing for the pillow"): it sits where it sits on the chair, and turns by its own amount there.

**The eye painting hangs flat on the cream wall under the lamp** ("this should be the easiest piece to
add, it goes under the lamp", 5 Oct 2026; redrawn the same day, "can we replace the eye art with this?"): cut by `tools/cut_art.py`, its left point just past the teal
panel's right edge, as in the full-set photo, its size and place his. It has a frame `depth` deep round
its diamond (`outline`), its back on the wall, a Depth slider: "can you give me a depth/thickness control
for the eye painting?" (5 Oct 2026).

**The dog sits on its book on the console** ("try to add one more decoration tbh I'm not sure how this is
gonna work or if we need to make a book as a separate layer?", 5 Oct 2026). The book is drawn at an angle,
so it is built as a box (`box`, BOOK) on the console's top, its cover and spine tan, its pages cream; the
dog is cut without it (`tools/cut_dog.py`). The two were first linked ("the left right front back controls
should link the book and dog"), then fully unlinked ("Ok fully unlink the book and dog please"): each
stands on the console's top on its own (the dog `atop`, with its own `up`), Left/right the way it is
dragged and end to end on the console ("I can't go far enough right"), Front/back across it. A card stands on its feet only if its feet are over what it stands on: the dog was
saved 0.2 m in front of the book, lined up from the opening view alone, and hovered from anywhere else ("as
I move the camera around they disconnect and the dog starts hovering"); it was moved back along that line
of sight onto the cover and grown to match. A card on the console turns and tilts about its feet. The book's spine carries
its title in DW Fairfield (`assets/dwfairfield.woff2`, the garden's copy), drawn large so it stays sharp up
close, with size, left/right, up/down and opacity sliders: "the book should have the title on the spine -
id like it to be clear when you zoom in but I want an opacity and size/placement control. It should say
"the complete book of composting" in my dw fairfield font". Its outline 1.15 times the room's line, wandering 2.5 mm as the
room's lines do: "can we thicken the outlines a bit of hte book and give it ripple?", then of 1.4 times: "the book lines looks
little thick, and i think it may be clipping into the panel" (Carl, 9 Nov 2026; THE BOOK'S LINES), so it stands 2 mm
clear of the panel too. The panel shows
only these two for now ("Let's hide the current controls for the time being"): `ONLY` in studio.mjs. Since 6 Oct 2026
it shows the room, light and wall shapes alone, every decoration's controls put away: "ok so let's remove the item
controls for now and talk about how to define the camera limitations".

**The dog blinks** every few seconds, at random ("can we make the dog blink occasionally?", 6 Oct 2026): its picture
swapped for one with its eyes shut (`tools/blink_dog.py`, `assets/dog-blink.webp`) for an eighth of a second, BLINK in
`src/props.mjs`; held open under reduced motion.

**The mug stands on the console beside the book** ("This should go on next to the dog/book combo", 5 Oct
2026): cut by `tools/cut_art.py`, the hole in its handle keyed through, on the console's top on its own
(`atop`) like the dog, with the same sliders. **The picture frame** joins them ("This goes on the console
too", 6 Oct 2026), cut the same way with the gap behind its stand keyed through, past the book from the
corner, with frame and mount colour pickers. Its light blue round the polaroid is glass, drawn 10% there and the
rest see-through, on a Glass slider (`glass`, the green of `assets/frame-parts.webp`, GLASS in `tools/cut_art.py`):
"The light blue between the frame and the Polaroid is meant to be glass... so I was thinking what if it's like,
not fully keyed out but maybe 10% transparency?" (6 Oct 2026).

**The candle stands on the console, its flame his five drawings in turn, eight a second** ("Here's a candle with
flame to animate at 8fps", 6 Oct 2026). **The clock hangs on the teal wall, left of the map, and tells the time in New York** ("Clock should be on the other wall")
("and a clock to sync with eastern time"), its second hand ticking, whatever the viewer's own time zone.
`tools/cut_bits.py` cuts both: the flames on one canvas size so they line up, the hands each on a canvas the
face's size pointing at twelve. The hands were drawn without the face, so their length against it is a guess
(`MINUTE`). Each hand turns about the middle of its round hub, found as the point inside it furthest from its edge;
it was the middle of the hub's coloured dot, drawn a little off, and the hubs swung apart as the hands turned ("i think
the clock hands got messed up again", 6 Oct 2026). Each hand has its own left/right, up/down and size sliders (`hourX`, `hourY`, `hourK` and so on), and the
clock's panel a Zoom in button that turns the camera onto it, past the turn limit if it must, and zooms right in:
"The central pivot point of the hands don't look right though. Can you let me zoom in on it and fine tune each
hand?" (6 Oct 2026). Zoom out goes back to the opening view. Its body is built round its face, `depth` deep back to the wall, as the
gong's rim is (`disc`, a Depth slider): "Can we add depth to the clock too? The body specifically" (6 Oct 2026). Its rim and body are the bass drum's
wood, not black, a thin black line kept round each edge of the rim (`tools/cut_bits.py`, a rim picker): "Can we make
the outline of the clock the wood color is the kick drum instead of black?" (6 Oct 2026). Then all of it in charcoal, mustard and wood ("Then we need to recolor it to be
charcoal mustard and wood"): the face the chair's mustard, the hour and minute hands charcoal, the second hand wood,
the dots at their hubs mustard. All three hands on one pin, his panel's nudges zeroed: made for the hands' old cut,
on the true one they pushed the hubs apart by a different amount at each time of day ("it seems to look different on
different sizes ... when one looks good the other doesn't always", Carl, 9 Nov 2026). The room lays both on their pieces as BITS in `src/props.mjs`; the flame has a Flame size slider.
Testing: headless software WebGL takes about a second a frame, and the clock wants one every second, so a
screenshot never finds the page quiet. Freeze `Date` in the test, and check the flame in a small window.

**The bass drum stands on the floor by the cream wall** ("Can this go along the right wall?", 5 Oct 2026),
where the marching machine leaned, a floor card turned part of the way to the camera like the chair. Flipped in
its picture by `tools/flip_drum.py`, which puts its "CC" back the right way round ("The drum needs flipped,
I forgot to mention") and at ten o'clock on the head, where it was drawn ("The cc logo should be on the other
side at that 10 o'clock Ish position that it was in the original head"); the room's Flip would have mirrored the letters. **His CB is on the head now, not the CC**: "Should I put my CB from the drum logo (minus the rim) in lieu of the CC on
the kick drum?", then his logo sent (3 Nov 2026). `tools/drum_cb.py`, run after `flip_drum.py`, lifts the letters out of
his drum logo and sets them where the CC sat, in its ink. **The
marching machine moved to the teal wall** past the console's far end, flipped ("the marching machine should
get flipped horizontally and moves to the left wall outside of the console"): `leanWall: "teal"`, its
left/right reversed like the console's.

**The rug lies on the floor in front of the chair** ("can we try this as a rig with depth control?", 5 Oct
2026, a rug as dictated): a prop with `floor` lies flat, its middle at `x` and `z`, turned `turn` degrees,
its edge built `depth` deep down to the floor round its `outline`. An area rug, square to the walls
("It needs to be an area rug with more full controls and should be the same orientation as the walls"):
Width, Length (`long`), left/right, forward/back, Depth, and a Rotate 90° button; `turn` snaps to
quarter turns. Recoloured to the room (mustard, the wall's teal, an olive) ("Can you recolor it?
Then give me a saturation/mute control to make it less intense"); a Mute slider was tried and replaced by
Soften (`soft`), a blur and a fuzz like a rug's pile: "Maybe mute is not what I wanted, I'm thinking a blur
or fuzz to soften it". His size and place are its defaults. Then a second drawing, a cream medallion rug, replaced it at the same
size on the floor ("Can you stretch it to match the current rug's dimensions?"): its length set so the rug
covers the same floor, its colours as drawn.

**The wire world map hangs on the teal wall above the console** ("This one is going to be the trickiest
one yet, because it is very important to get the key right. This is probably the most detailed piece in
the whole room", 5 Oct 2026). `tools/cut_map.py` keys it its own way, since its wires are almost all
edge: each soft edge pixel is unmixed against the solid wire beside it, so no blue stays in the wires
and their pale shine stays solid; blue drawn into the map (the wires' reflections) is painted the
wire's own colour; one blue spot on an island by Japan is filled (`FILL`), and every other small hole is a
real sea. A prop with `wall: "teal"` lies flat on the teal wall, `x` from the corner to its right end,
its left/right slider reversed like the console's. It has thickness (`layers`, `depth`, a Depth slider): copies of it
stacked from the wall to its front, darker further back ("Can you give me a thickness control for the
map?", 5 Oct 2026). Its place is measured off his photo of it, against
the console and the soffit: 2.3 m wide, its bottom 1.37 m up, and its right end 0.25 m from the corner, off a second photo of the corner, where it sits about as far from it as the gong does on the other side
("Can you look at the placement and location from this real photo and help to figure out where it should go?").

**The arc lamp stands by the cream wall, its three necks turned on their own** ("the three necks are
actually independent so a slightly different angle would make the sway look better"):
`tools/cut_lamp.py` cuts it into a stand and three necks on one canvas; each neck (`neck`, degrees)
turns about the pole, with a turn slider and a shade colour. Each neck is cut whole, from its shade
down into the collar: "The lamp necks are cut at weird places and it makes it hard to find a good
angle for them" (5 Oct 2026) - they were first cut partway down the curve, so turning one broke its arc.
Each shade is its own piece too, hung from its neck's tip (`hang`) and always turned to the camera:
"if we could make the actual shade (I think that's the word?) stay facing the camera regardless of the
neck rotation that would be cool" (5 Oct 2026). A shade has no panel of its own; the neck's shade
picker paints it. The necks keep the turn they have from where the camera opens and do not follow it
as it sways, so the shades stay put in the room: "The shades should stay a fixed distance from the
wall while swaying" (5 Oct 2026). The pole and base still turn to the camera, as every floor card does. Each neck had a Droop slider for a while, tipping it down so its shade sat lower ("bringing the middle
shade down a few pixels and the short one a few more", 5 Oct 2026); tipped, the cut between the necks
showed, and three recuts did not clear it ("Dude no those don't look clean / Maybe we just go back to how we
had them", 6 Oct 2026). So the cut, the pieces and the necks are back as they were, all one height. The cut then dropped the thin slices of a
neighbour's outline each neck had picked up where they run close, which came loose as faint lines beside them: "Clean
them up" (6 Oct 2026, the edges sweep's quiz). Then the lamp was looked at from every place the camera can stand
(`tests/lamp.mjs`, `LAMP-ANGLES-2026-10-06.md`): "There are still some weird issues with the lamp next, depending on
which angle you are looking at it from" (6 Oct 2026). So each neck is cut by its own tube, not by the nearest
centreline: its tan inside and every line within a few pixels of it, a line two necks share copied to both (EACH NECK
BY ITS OWN TUBE), so neither shows a bare edge or a crack as they turn apart; each shade is its own dome, cut off at
its top so its sleeve's sides stay with the sleeve; each neck runs on behind the collar, the stand drawn a little
nearer the camera than it stands (`toEye`, COLLAR_NEAR) so the collar always covers the necks' ends (INTO THE
COLLAR); each sleeve runs on behind its shade's top, the shade drawn a hair nearer (SHADE_NEAR, INTO THE SHADE); and
a neck draws only what is a third solid (`alphaCut`), so seen edge-on it no longer cuts a line of wall through a
shade. The drawing, the necks' turns and the shades facing the camera are as they were. Asked on that doc's quiz, he left two things as they are: far round to the right, where
only his free camera goes, the necks are seen edge-on and the shades look like they float ("Leave it", 7 Oct 2026),
and zoomed right in a few specks and a frayed edge under each sleeve remain ("Call it done", 7 Oct 2026). A Height slider lengthens the straight
run of its pole alone (`raise`, POLE), the necks and shades rising with it: "We need to make the lamp
taller" (5 Oct 2026). A Spin slider turns the whole lamp about
its pole ("keep the base flat on the floor like it is but spin it around"). A prop marked `newest` is the one the
panel opens on.

**Light, painted** ("Okay! So let's talk about LIGHTING baby!!", 5 Oct 2026; then, offered pools from
the lamp and the corner's glow first: "That would be good, and then we can figure out ambient lighting
relative to those others"). `src/light.mjs`: each light a soft warm wash round a point, one under each
shade (aimed down) and one on the floor in the corner behind the chair (aimed up), brightening whatever
it falls on, walls, decorations and their sides alike, through one shader function every material
calls. A lamp's shades hold their own light (`unlit`). The room's own light (`ambient`, Room light)
starts a little dim, since the cream wall is already as bright as it goes and a pool cannot show on
it. Strength, size and warmth for each, on his panel's Light, saved in `settings/light`. **Never steps**:
banding the washes into flat rings was offered and refused, "Never any steps please" (5 Oct 2026). The room's lights have a switch and a dimmer ("Can you have a light
switch to turn off the rest of the lighting? And like a dimmer so we can experiment?"): off, the room
falls to `DARK` and only the lamp and the glow light it; the dimmer is Room light, and turning it
turns the lights back on. The dimmer is the room's light alone, never the lamp's or the glow's ("the
dimmer should only be for the ambient room lights not the ones we specifically control"): a light fills what
the room's light leaves, softly and never past full, so it reads as the same warm wash however far the
room is dimmed. Added straight on top, a dim room sent the cream wall white and the floor a hot orange
("The dimmer makes the lamp and floor light look super intense"). The dimmer stops at 1, the colours as
drawn. Strength reaches 5, and a light keeps its own warmth however strong, carried by the surface's
colour ("Max strength for the floor light and lamp are still way too dim for me to be able to use
them"). The shades' mouths are the bulbs: dark with the lamp at nothing, glowing its warmth as its
strength goes up, full by 2 ("the lightbulbs in the lamp should get brighter as the strength goes
up"); the shades' metal takes the room's light like anything else. Then "Can bulbs need to be wayyyyyyy
brighter?": the mouth near white and a halo round it (HALO), kept below the rim and off the metal ("the lightbulb brightness should not pass the upper rim of the shade"). Then the bulbs got their own Bulbs slider, and a Bulb size for how far the glow spreads, apart from the lamp's strength ("Can you give me separate control for the lightbulb brightness vs the rest of the lamp strength?"). The Bulbs
slider moved the glow round the shades and hardly the shades' insides, which went cream to near white: "when i asked
to make the bulbs brighter, you didn't actually do it... like, the color of these sections (combined with your light
intensity, but a separate control please)" (6 Oct 2026). So the insides have their own Bulb colour and Bulb
brightness (`bulbColor`, `bulbFace`, THE BULBS' FACES in `src/light.mjs`). Each shade's light comes from a little
above its mouth, a Lamp light height slider (`lampLift`, 0.15 m): "the "bulbs" light source position, can we raise it
to be a little higher in the room? it looks like they happen below the actual bulbs" (6 Oct 2026). The room's lights have a
Warmth too ("can the room lights get warmth controls too"), white to warm. Test the light by sweeping the dimmer, as the editor (saved settings load only for him). A face takes a light only if it is turned to it ("the light behind the chair
should NOT make the chair brighter"), and a lamp's is a cone out of its shade's mouth, gone level with
it ("the light from the lamp looks like it's coming from the wall behind the lamp not the light"). A lamp's light is
brightest at the bulb and falls away from it, its cone opening from just above level: "the lights need to be emitting
from the bulbs, right?" (6 Oct 2026); eased, its pool had sat well below the shades.

**The camera's limits are set by looking** ("i do really like your idea for noting the camera limits", 6 Oct 2026):
the Camera row on his panel has Furthest left, Furthest right, Highest, Lowest, Closest zoom and Widest zoom, each
taking the view as it is as that limit, and Try limits to feel them. They are off for him while he sets them, the
camera free to go further (`FREE`); visitors always have them (`LIMITS` in `src/studio.mjs`). Save keeps them at
`settings/camera`; read them back and write them into `LIMITS`. The turns are the view's EDGES, not where its
middle points, so a closer zoom may turn further and show no more of the room: "when i zoom in, i can't look to the
left or right. like, the limitation seems to be an angle relative to POV, not an area of the room" (6 Oct 2026). Then each side became a
place in the room, the spot at that edge of his screen when he tapped (`inRoom`), and the camera goes anywhere that
keeps those spots at or past the screen's edges (`within`): "instead of a POV direction/percentage, what if we used the
top/bottom/left/right limit's edge pixel to set the boundary". A turn never pinned a place, since Sway walks the camera
as it turns. Saved as `places`. The opening view is his widest zoom: "let's use the saved widest shot as the new
opening shot" (6 Oct 2026). Each limit is found reaching out from the opening view, so zooming out while looking to one
side slides back toward the middle rather than stopping ("i should be able to zoom back out to the original position
from anywhere"). Nothing yet stops a limit being set past the end of a
wall.

**The room sits in a 16:9 card, 1 Nov 2026: "I think the screen needs to be inside of a card that is a fixed ratio so
it has letterboxes or something if the screen ratio is too different" (Carl).** `src/stage.mjs`: `#stage` is always 16:9,
as big as fits the window with a margin, on Homegrown's quiet cream, its corner 12 and its charcoal line drawn over the
room's edge. The room, the things you can click and the windows are all inside it, and everything that measured the
window measures the card (`view()`), so every screen sees the framing he chose.

## The landing page: the room is the way round the site

**No trial switches. Carl, 9 Nov 2026, after the chair and drum's lean and the barn's floor were built behind `?leanback=`
and `?floor=`: "Please stop putting things behind trial switches".** So something he asks to see is shown on pictures,
then built straight into the room once he picks it; nothing new waits behind a `?` switch for him to turn on. The
switches already in the code (`?open=`, `?otop=` and the like) are tuning knobs, not trials.

**Carl, 6 Oct 2026: "This was going to be my landing page on my new personal website. I want the user to
land on this, and be able to hover on certain items, and clicking will zoom in on them and open certain
modals (like a portfolio player, my bio, etc). It needs to be smooth and easy to navigate on desktop, as
well as on mobile."** So some decorations open a window: the camera flies in to the thing, its window
opens, and closing flies back. How it works, what he still has to decide and how to test it are in
`NAVIGATION.md`; the code is `src/nav.mjs`.

- **His picks on the quiz (6 Oct 2026)**, now the only behaviour: the things you can open boil while the
  rest hold still ("1: They boil"); under the mouse a light comes up on it ("2: Lights up"); the camera flies
  in over 1.8 s ("3: Slow"); the window is a sheet down the right side ("1: Sheet down the side"); a phone held
  upright is asked to turn ("1: Turn it").
- **How the things that open boil**: the whole drawing while no window is open, outlines only while one is:
  "make the whole image boil when nothing is selected, but then only outlines once it's been selected and zoomed
  in" (6 Oct 2026). The wobble is measured in the drawing's own pixels, so it keeps its size against the lines at
  any zoom ("the amount of boil is always a fixed amount of the screen rather than relative to the view"). While one
  is open the others stop ("when one thing is selected, the other things should stop boiling"), and the gong's
  outline is its depth ("the depth of the gong should be part of the outline, not the rim of the first layer"). The
  edges sweep the same day (`SWEEP-EDGES-2026-10-06.md`) made the rim boil with its face rather than beside it, the light
  reach the built sides and rim, and the strings squash with the gong's press; how much and when each boils is unchanged. The
  picture frame has no depth to boil, and stays flat: shown it at 1, 2.5 and 4 cm deep, "Nah I don't like it.
  Keep it flat please" (6 Oct 2026). Its outline boil is its drawn edge.
- **Which object opens which window waits.** Asked, he put it off: "not sure yet, let's figure out what
  info/pages we should have first. this feels like putting the cart before the horse a bit" (6 Oct 2026). So
  `THINGS` in `src/nav.mjs` (console, frame, map, gong) are placeholders until the site's pages are decided.
  **Decided 1 Nov 2026**, the pages being the sections of his current site: console, portfolio; photo, bio; map, what
  artists say; drum, tour photos; gong, why he calls himself a co-producer; dog, contact; eye painting, "Are YOU my
  people?"; the mug, his Secret Sonics podcast, once he sends the link. `NAVIGATION.md` has his words.
- **The windows are Homegrown's cards, 1 Nov 2026: "you need to look at the css of homegrown to do the card design and
  boiling" (Carl).** Cream, a still 2px line at the faded ink, corners an eighth of the height up to 12, DM Sans body and
  DW Fairfield headings, Homegrown's mustard button and white field, each drawn by Homegrown's own `wobblePath` (copied
  into `src/garden-bits.mjs`). As in Homegrown, the card holds still and its one action boils: the big play, the
  eye painting's button, the form's Submit (`drawBox` in `src/nav.mjs`).
- **The windows are shells.** Every word, picture and track in them is his: they hold dashed empty spaces
  and placeholder tones until he fills them. No caption, tooltip, "click to explore" or bio text is
  written for him (the repo's explainer-copy rule).
- **Which things can be used shows on the thing itself**, in the room's own ink, boil and light, never a
  label or an arrow.
- **Delightful, without the apps' rewards.** **Carl, 6 Oct 2026: "I want to try to make it feel
  delightful. I know that in the homegrown apps, delightfulness is use a lot in conjunction with the literal
  gamification system, so that is where this will be departing from the delightfulness docs in the
  repo".** No tokens, points or rewards here. The four questions in `docs/DELIGHT.md` still hold (after
  the visitor acts, no waiting, nothing if nobody acts, nothing that pulls them away). The first touches (a
  press, the dog noticing, the paper settling) were too quiet: "they're quite subtle and i had to watch a few
  times to even notice them" (6 Oct 2026). So they are bigger now (a real squash and spring, two blinks, more
  give on the paper). Shown them again: "they're better!" (6 Oct 2026).

**The console opens, 2 Nov 2026** (Carl, 1 Nov: "the top surface of made of two sliding panels ... so the dog, book,
picture frame and mug would need to disappear (maybe sliding up and out of the frame?) so the right side top opens up to
reveal a slightly-sunk-in place for the record player", then "We should make it wood colored"). Clicking it, the candle,
frame, book with the dog, and mug lift up out of the frame one after another, and the right panel (the end toward the
corner) slides over the left, showing a wooden well 5 cm deep; closing runs it back. THE CONSOLE OPENS in
`src/props.mjs`.

**The turntable is in the well, 2 Nov 2026**, his newer portfolio player (sent as `portfolio-player-kit.zip`, its four
drawings kept as he sent them in `art/player/`): its deck recoloured from teal to wood ("We should make it wood colored"),
its record and arm placed by the kit's own measurements, laid flat on the well's floor (THE TURNTABLE IN THE WELL in
`src/props.mjs`). The portfolio window is the sleeves ("the card can just be the sleeves and text etc", 2 Nov 2026): a tap
on a sleeve puts that record on, the arm swings over and creeps in as it plays, and the record turns at 33 1/3
(`setDeck`, from `src/nav.mjs`). The platter is a plain dark disc: the kit's has the StudioLand MGMT logo on it.

**The camera leans in over the console, 2 Nov 2026.** Shown three filmed endings for its flight (the whole console,
leaning in, straight over the well): "I like lean but the camera needs to be smoother". From where the camera stands
the console's top is seen almost edge-on, so no turn or zoom shows into the well: for this one flight the camera walks
up and over to it, looking down, then back on close (THE LEAN in `src/studio.mjs`, `LEAN_AT` in `src/nav.mjs`). It is the
one exception to his 5 Oct rule that the camera stands still, and the only move of that flight: the turn holds still,
and the camera turns the shortest way between its two aims over 2.4 s on a smootherstep.

**From one window to the next: tried and taken out, 2 Nov 2026.** With a window open, a click on another thing glided
straight to it ("can we try glide?"); the same day: "i think we should disallow clicking on other pages from a page view"
(Carl). So a click in the room with a window open closes it. A move from one window to another (the eye painting's
button) is one Back: closing never walks back through the windows before it. That held only for windows opened in the
room: a visitor who landed on a link straight to the player (carlbahner.com/#portfolio) and pressed HOLY MOLY closed
Contact onto the player again. Asked "Fix it, or add it to the list?": "Fix it" (Carl, 9 Nov 2026), so the next window
takes the link's address in place and closing goes to the room (A WINDOW OPENED BY A LINK in `src/nav.mjs`;
`node tests/holes-player.mjs link`).

**His answers of 2 Nov 2026, evening.** The Spotify button under the sleeves opens his playlist. The contact form sends to
his Gmail through FormSubmit, falling back to the visitor's own email (`contactForm` in `src/nav.mjs`); FormSubmit asks
him to confirm the first message. The drum's page is the logos alone ("maybe the logos are all I need tbh?"). His
clients' countries, 35 from his list, light up on the map when its window opens, west to east (THE COUNTRIES LIGHT UP in
`src/props.mjs`), placed by eye on his drawing, which has no borders. The progress knob drags to skip through the song
and does not press down ("You should be able to drag it and skip through the song but it won't depress"). The opening
view tilts down onto the rug ("yes"; the most of four, "4"), his top and bottom limits moved with it (`TILT` in `src/studio.mjs`, `?tilt=`). The
first song reads as the others do ("fix it"). The player is four songs, in his order, two by two: "fake a happy face, good
grief, the garden, night life. those 4", three across so the next row shows ("a bit smaller so it's clear there are more
than two"). Then six, two more after Night Life (9 Nov 2026): "I want to add two more songs to the player - Crush by
Saint Slumber and Sunshine Of Your Youth by Cheerleader", "Yeah after night life", their silent ends cut ("You can remove
the extra silence"), his parts "co-production, mixing and mastering" and "drumming and additional engineering". Then every part an -ing word: "Can we make my roles consistently verbs?", "Active verbs like drumming"
(Carl, 9 Nov 2026). No white flash on a sleeve when a record is tapped on a phone: the browser's tap highlight is off and the sleeve's
hover slide is for a mouse only ("there is a quick white flash/glitch when selecting a vinyl", "On the sleeve", "Phone",
Carl, 9 Nov 2026; NO TAP FLASH in `index.html`). Then "there's still a white bar that appears and changes size": the record's slide out of its sleeve and the cut that
hides it behind the sleeve were two animations, which an iPhone ran apart; now both are set together each frame (ITS
SLIDE AND ITS CUT IN ONE STEP in `src/nav.mjs`). Changing songs, the old record fades away on the deck over a second while the new one comes out of its
sleeve (A RECORD FADES AWAY in `src/props.mjs`): flying it home glitched. His name on the wall is gone: "no need for the wall I like the rug better".

**The room's sounds, 2 Nov 2026** (Carl, asked where they are put to the room's moments: "Personal site's room"; his
brief: "Sound must be opt-in with a visible mute toggle, and nothing autoplays with audio"). Each moment says so as it
happens (`src/cues.mjs`; the list, numbered for him, is `docs/STUDIO-ROOM-SOUND-MOMENTS.md` in the repo), and
`src/sound.mjs` plays his sounds on them once a visitor turns sound on with the garden's speaker, bottom right of the card ("Bottom right", Carl, 2 Nov 2026), and hidden
until the room has sounds of his to play: the site is silent for now, so no speaker shows.
Nothing makes a sound of its own and no audio starts before that tap. His sounds are made on the admin app's room sound
page, which shows this folder in a frame (copied in by its `vite.config.ts`, never imported) and can ask the room to
repeat one moment (`room-repeat`). `docs/STUDIO-ROOM-SOUNDS.md` in the repo says the rest.

**The card scales with the room, and a loading screen, 3 Nov 2026.** The card is laid out once, at his laptop's room (1440
by 900), and drawn bigger or smaller with the room, so its words never rewrap ("I want the card contents to scale with the
resizing, because otherwise it's gonna just be a formatting nightmare"; `--k` in `src/stage.mjs`, THE CARD SCALES WITH THE
ROOM in `index.html`); upright, its words scale with the phone's width. Until every picture and font is in, the room's
cream covers it with one of his records turning ("we need a loading screen because things load-in at different times";
THE LOADING SCREEN in `index.html`, `picturesIn` in `src/props.mjs`).

**3 Nov 2026, the cards.** A card's edge fades while there is more to scroll that way, as Homegrown's sidebar does
("can the bottoms/tops of the card contents fade out when they're scrollable?"). The quote photos' outlines boil ("can we
add the boil to the testimonial images?"). The co-producer's words are on the eye painting's page, above "Are YOU my
people?", and the gong opens nothing for now ("make the gong not boiling/not clickable for the time being"). A record
slides out of its sleeve from behind it, never in front ("when i click, it immediately teleports in front of the
sleeve"). **Three text sizes on the cards**, every job one of them, Homegrown's rule taken on his "yes": heading, what you
read (paragraphs, quotes, buttons, what you type) and the small words (`--fs-heading`, `--fs-body`, `--fs-small` in
`index.html`; `node studio/tests/sizes.mjs` fails on any other). The drum's page is still his to decide ("the drum... i'm still not sure what I want to do here"). **His titles, 3 Nov
2026:** HEAR FOR YOURSELF, WHAT THEY SAID, COOL SYNC THINGS, ARE YOU MY PEOPLE? (the co-producer part second) and CONTACT
with the "Hey Carl" line under it; the player and the quotes end on his contact button. **The thing under the pointer
says its page's title on the teal wall** under the map, where his name was tried (WORDS ON THE TEAL WALL in
`src/props.mjs`): "maybe in that teal spot where we tried to have my wordmark before?". **Then the bio moved onto the
drum**, and the picture frame opens nothing: "I want to put my bio behind the drum now and turn off the boil/click
ability if the photo frame" (3 Nov 2026). The logos' page ("COOL SYNC THINGS") has no thing for now. **Then the logos went under the bio**, smaller, running past as a carousel under his COOL SYNC THINGS title: "intead of
a separate sync page, i think you're right... make them smaller to fit under the bio, maybe as a carousel?" (3 Nov 2026). It never stops under the mouse, the logos not being links: "please stop the logo carousel from stopping on hover since
theyre not clickable" (Carl, 9 Nov 2026).
**Going live, 3 Nov 2026:** it replaces carlbahner.com ("i want to replace my current site"), with the four songs ("launch
with four songs"), built here until then and moved to its own repo for the launch. His launch quiz answers (https://claude.ai/artifact/5LWQs73jHMp7yRByiUZgP1): the tab
says "Carl Bahner"; a shared link shows the room as it opens (`assets/share.jpg`; on the charcoal and grain round the card since 9 Nov 2026: "Can we
make the page background charcoal with grain? Like outside the main card border. On the page and the preview", the page
round the card is too, THE PAGE ROUND THE CARD in `index.html`; and no words on the walls in it: "Can we do a render for the preview that does not have the page
titles on the walls etc?", rendered with `?open=none&quiet=0`; then the card alone, cropped past its edges: "Can we zoom in a bit for the preview pic so we
don't have so much of the background? We dont need the charcoal in the preview image"), his name and his line "Mixer, educator,
and sonic chaos gremlin."; visitor counts, yes; old addresses go to the room (`404.html`). `studio/build-site.sh <folder>`
lays out the real site. **On Netlify, the contact form goes to Netlify's own forms** (a hidden copy of it in `index.html` for Netlify to find), FormSubmit only if Netlify will not take it: the first FormSubmit sends from the live site did not arrive ("this isn't a test link, that's from the live netlify site", 3 Nov 2026). **The snow globe, 3 Nov 2026**, his drawing with his Brand Castle from Homegrown's classroom inside, its flag waving:
"I'm gonna replace the candle with a snow globe with this inside it", and "It should go to welcometostudioland.com".
`tools/cut_globe.py` builds it; it stands where the picture frame stood, in the opening view, and the frame (which opens
nothing) moved to the candle's old place at the console's far end. The wall says STUDIOLAND. Then it opens a card rather than the site ("It should zoom in actually, to a card that has a little info about
it"): his title StudioLand, his words for it (sent the same day: "a career school for producers and mixing engineers..."), and VISIT STUDIOLAND out to the site, then StudioLand MGMT under it with his words and its own way out ("I think they should both be in the snow globe"); the
castle stands on a hill drawn by the cut script ("Can we add a simple procedural hill under the castle so it sits a bit
higher?").


**The edges lean the view, 3 Nov 2026**: "i feel like i've asked multiple times to have it pan/tilt when the mouse is on
the edges" (Carl). From his opening view (his widest) his limits leave no room to turn, so the edge-turn moved it about a
degree and, held level, never tilted. A lean that pushed the lens in was refused ("it does a weird zoom in, not panning"), so a mouse resting at an edge
turns the view up to 6 degrees side to side and 4 up and down past his limits, no zoom (THE EDGES LEAN THE VIEW in
`src/studio.mjs`), easing back as the mouse leaves. On a phone the card's scrolling body reaches into the card's padding so no button's line
is clipped ("the buttons are getting cut off a little bit"), and the snow globe stands 4 degrees anticlockwise ("it looks
tilted weird", then "try 3 more").

**On a phone the things that open glow, 3 Nov 2026**: "On mobile, we need a totally different visual cue. I was thinking,
what if the different clickable items glow? But like, not all the time or at the same time, maybe a pulse like the countries
or the fireflies?" (Carl). Taken in turn first, then quicker ("The timing feels arbitrary and def not often enough to grab
attention"), then "Oh can they just all be a steady pulse in and out?": so with no mouse to hover, every thing that opens
breathes in and out together to the hover's light (ON A PHONE, THEY GLOW in `src/nav.mjs`, `?pulse=`, `?peak=`); never
while a card is open or the camera is flying, and not for someone who asks for less motion.

**One thing at a time on a phone, on trial behind `?snap=1`, 4 Nov 2026.** The pulse did not land ("That doesn't really
work either"); shown a camera that snaps from thing to thing: "I think it could be cool, espexially if the title/text
projection in the walls shows during that page" (Carl). So with `?snap=1` on a phone upright, a swipe left or right glides
to the next thing that opens, framed with its words on the wall and lit as a hover lights it; a tap opens it; dots along
the bottom, one a stop, the room as it opens first; and until the first swipe the view leans a third of the way toward
the next thing every 6 seconds. No pulse while it is on. ONE THING AT A TIME ON A PHONE in `src/nav.mjs`. Then "that is mega
clunky. Like, they should be in visual order. Like it starts in the center view but I can't swipe to look left. And the
text needs to be seen, and maybe we zoom in a bit for relevant size of things" (4 Nov 2026): so the stops run by where
each looks, far left to far right, starting on the room as it opens in the middle with no wrapping round; each frames
its thing and its words fully on screen, a fifth closer than the room opens where they fit, and a word too wide for the
phone beside its thing is drawn smaller there, never under 0.6 of his size (`framed`, `setHoverWordsScale`).
Then "Can we make the boil a bit more pronounced, and only boil the active page's item (so like on the about page the
drum should boil but not the eye art)" (4 Nov 2026): on a stop its thing alone boils, 1.7 times as hard (`SNAP_BOIL`,
`?boil=`); on the room as it opens every thing boils as on a laptop.
Then "ok instead of a literal snap, can it be a glide to that pan? i dont like how it shifts zoom and focus on mobile" (5 Nov
2026): every stop keeps the zoom and tilt the phone opens with and only turns, gliding over 0.9 s, the thing and its words
centred (A PAN, NOT A ZOOM in `src/nav.mjs`); a word still shrinks to 0.6 to fit beside its thing, and past that the thing
is kept whole. The fifth-closer framing is gone.
**The phone stop editor, 4 Nov 2026**: "i need an artifa5 that allows me to control the per-swipe-camera and the placement
of the words. Phone/mobile version only please" (Carl). https://claude.ai/artifact/G1HMjc718zjxSUSj6U7mNp, built by
`build-phone.sh` (`src/phonetune.mjs`): the room phone-shaped beside a panel; pick a stop, drag the room to turn its camera
(the wheel zooms), drag its word, size, width, direction and quarter turns. Saved at `phone/stops`; read it back with
ArtifactData and write it into `PHONE_CAMS` (`src/nav.mjs`) and `WORD_AT_PHONE` (`src/props.mjs`), which the phone's stops
use over the automatic framing and the laptop's spots.
**Words on the console's front, 4 Nov 2026**: "i want to be able to put words on the front of the console, like on the plane
of the front" (Carl). A third surface, `wall: "console"`, flat on the console's front (CONSOLE FRONT in `src/props.mjs`);
either editor drags a word onto it as onto a wall (`wallAt` in `src/studio.mjs` tries it first). The words draw last
(`renderOrder`), so the console no longer covers them; the drawings in front still hide them.
**The words outlined, cream everywhere, sharp, 4 Nov 2026** (Carl): "can we add a contrast stroke to all the text? relative to
the perceived size, not like, a fixed pixel size because they're at different zooms", "can we make the "about" font cream
instead of charcoal?" and "podcast word looks really blurry". A charcoal outline drawn into each word's picture, 0.07 of
its letters' size outside them (THE OUTLINE, `WORD_STROKE`, `?stroke=`), so it scales with them; cream on every surface;
and the graphics chip's slant filtering on the words, since PODCAST is seen almost edge-on (`setWordsAnisotropy`).
**Smooth while it moves, 4 Nov 2026**: "mannnnn desktop it glitchy as fuck. it seems like ALL movement is 8fps just
because the boil is 8fps" (Carl). At rest the room redraws only on the boil's eight a second; moving, it redraws every frame
at up to twice the screen's pixels, and a chip that cannot keep up drops to a few frames a second. So while the camera
moves and frames come slower than 22 ms, it draws at fewer pixels, down to one a screen pixel, and at full sharpness again
350 ms after it settles (SMOOTH WHILE IT MOVES in `src/studio.mjs`); `?fps=1` shows the frame rate and the pixels drawn.
**The word first, on a phone, 4 Nov 2026**: "On phone when I'm moving around in free camera mode, I would love to see the
text show up for a second before it zooms into place" (Carl). A finger has no hover, so on a touch screen (not the stops) a
tap lights the thing and puts its words up, the view first turning over 0.6 s to take in the thing and its words if they
are off screen (no more than a third wider), held 0.9 s (`?hold=`), then flew in; since 9 Nov 2026 with no hold ("Ok we can remove the hold and keep the words up?",
then, the tapped word kept up through the flight for an hour: "Wait why are the words not going transparent anymore?
There may have been a miscommunication"), and then no turn either: a tap flies straight in, as a click does ("the
pan-first can also be a bit weird and jarring", Carl, 9 Nov 2026); closing comes back to where the
visitor was. A link (the book, the mug) opens at once, since a new tab opened later is blocked as a popup (THE WORD
FIRST, ON A PHONE in `src/nav.mjs`).
**The phone's layout is for touch screens alone, 5 Nov 2026**: "man it gets real weird when resizing" (Carl). A laptop window
dragged taller than wide switched to the phone's layout and back as it crossed square; `upright()` in `src/stage.mjs` now
needs a coarse pointer too, so a laptop keeps its 16:9 card at any shape, letterboxed. **Then a laptop window dragged
phone-narrow switches again, 9 Nov 2026**: "i used to be able to resize my window and it would switch to mobile view when it
got to a certain dimension, but now it doesn't", then, offered switching only below a clearly phone-sized width rather than
as it crossed square: "switching" (Carl). Narrower than 520px and taller than wide (`PHONE_W` in `src/stage.mjs`), it takes
the phone's layout; dragged back wide, the room returns to his laptop's opening turn if it hadn't been moved.

**His officers' quiz, 7 Nov 2026** (https://claude.ai/artifact/VNbCtGWc4tvWrT4aFmp57s; his delight, simplicity, clutter and
words officers, the Homegrown skills, walked the site). His answers, built the same day:
- **Swipe mode is gone** ("I'm dropping swipe mode"), and the phone stop editor with it. Free look stays the phone's way
  round, with "every word visible and clickable and clear": **ALL THE WORDS** (`src/props.mjs`, `src/nav.mjs`) puts every
  page's word on the walls at once, always on a touch screen while no card is open, and with a mouse as the room opens
  until the first hover or 6 s (`?intro=`) ("Show all the words at first"); a tap or click on a word opens its page. The
  word spots were laid out so all of them fit at once ("You move them and show me"): LISTEN, HOMEGROWN and STUDIOLAND on
  the console's front, CONTACT and QUOTES under the map, YOU+ME on the teal panel, ABOUT on the arch (`WORD_AT`).
- **The song plays on** when its card closes, with a **NOW PLAYING** card in the room's corner (its name, pause, stop):
  "There needs to be some sort of song info/control hud thing so they can stop as needed". Opening the player again
  started it fresh until 9 Nov 2026: "when i clicked back into the player, it stopped the audio and reset the player
  instead of having the record still playing visually and sonically" (Carl). Now it takes the song back, its record on
  the deck, turning (THE PLAYER TAKES ITS SONG BACK in `src/nav.mjs`). The song's audio lives in NOW PLAYING's card, so a
  Back pressed mid-flight to another thing no longer stops it ("it was glitching when i left the player page while the
  audio was still going and i was clicking into other pages"). `node tests/holes-player.mjs` recreates both.
- The bio ends on HOLY MOLY; Spotify is the quiet button (a line, no fill) and the one action is the card's width; the
  form lost its "(required)" and its Name heading; Smallpools, one word; the keyboard's and screen reader's names are his
  wall words; the podcast is off the site ("We can remove it actually"), the mug a plain decoration; the book weighs as
  the dog does for a click and reaches 2 cm round its edges; the card pictures load behind the room ("Show the room
  sooner"); curly apostrophes; the logos' names; his old site's pages for artists open the player (`404.html`); on a phone
  the close X has a strip of its own. Kept as they are: the timing ("Keep the timing"), silence ("Keep it silent for
  now"), the co-producer words ending where they do. The officers' "camera bug" going card to card was their slow browser
  catching a flight mid-way, not a bug.

**The speed sweep, 9 Nov 2026** ("Can you do a speed sweep to see if we can make this faster and smoother fps?", then
"Yeah do 1, 3, and 4 now please", Carl). Every picture goes up to the graphics chip and every shader is built behind the
loading screen, so none arrives mid-flyover (WARM UP BEHIND THE LOADING SCREEN in `src/studio.mjs`; 31 pictures and 3
shaders had); the clock's pieces, the marching machine and the mug are saved at about twice the most the room shows of
them, the rug with his name lossy and the grain lighter (`tools/shrink_pictures.py`, the boil still measured in each
drawing's own size, DRAWN in `src/props.mjs`); and the cards' pictures load once the room shows. On a phone's 4G the room
shows in about 6 s, not 8, after 4.3 MB, not 7.7. Still his to decide: drawing a laptop at 1.5 times its pixels rather
than 2 (44% less work a frame), to be shown side by side; and merging the stacked layers that give things depth (about
200 drawings a frame), left for if the rest is not enough. A phone's card slides down its own height on closing, so it
leaves the screen whole: "the page cards do not slide all the way off screen, they slide mostly then stop and disappear
suddenly" (Carl, 9 Nov 2026).

**Buzz in his coaster car, an Easter egg, 9 Nov 2026**: "How could we sneak a small icon in the top left corner of the
room that we don't mention and it's like an Easter egg?", then, the spot marked on his phone, "And it should be the buzz
coaster image from the wild-ride repo" (Carl). The wild-ride repo's `games/src/assets/buzz-car.png` (kept in
`art/buzz-car-source.png`), standing on the ceiling by the teal wall, up and left of the clock, where he marked it: his wheels
pinned to the ceiling just out from the wall's top line, upright and turned to the camera, his body rising above the
line on screen and drawn in front of the ceiling as the floor's cards are (`ceiling`,
`out`, `along`). First put beside the clock ("That's not where I showed
you in the marked up screenshot"), then on the wall under the ceiling ("It should be on the ceiling not the wall"), then flat on the ceiling, seen
almost edge-on: "can we make it look like he's vertical and staying in front of the ceiling? Like his wheels are pinned
but he is always vertical", then, hung by his wheels upside down: "he's upside down, flip him 180", then, hung under it: "You aren't getting it.
Move him up on the screen so he is above the line". Seen
when the view is tilted up, as his screenshot was, never in the opening view. Not one of the things that open: no boil, no light, no word, no zone; a mouse over him turns to a
hand, and a click or tap opens Buzz's Wild Ride (https://buzzs-wild-ride.netlify.app/) in a new tab (THE EGG in
`src/nav.mjs`, `egg` on the prop). He answers anywhere in a box at least 48px across round him, a fingertip's size: "he
needs a tappable hitbox" (Carl, 9 Nov 2026). Nothing on the site mentions him.

**Nothing takes a click under the loading screen, 8 Nov 2026**: "it accepts clicks during the loading screen, which makes
it glitch out" (Carl). Until it lifts (`body.loaded`), every press, wheel, key and touch is stopped before the room hears
it (NOTHING TAKES A CLICK UNDER THE LOADING SCREEN in `src/studio.mjs`).

**His words and opening quiz, 8 Nov 2026** (https://claude.ai/artifact/7Pc99ezUfGF7z5GkeSPjYG):
- The thank-you after the form sends is a toast, his pick "B: HOLY MOLY, it sent!" (`THANKS` in `src/nav.mjs`); a failed
  send says the draft he took ("Ugh, that didn't send..."); the room's screen-reader name is "Carl Bahner's studio".
- The snow globe's two VISIT buttons stay, centred ("keep them but should they be centered?").
- NOW PLAYING has back and next ("should we add forward/back buttons?"), round his four songs.
- **The words, laid out again**: "no they're all different sizes and look like shit", then "i think maybe all the
  left-wall words should be in the section under the globe (there's some negative space in the teal wall) and the right
  wall words should all be top-to-bottom in the yellow column like the about currently is". LISTEN, QUOTES, CONTACT,
  HOMEGROWN and STUDIOLAND are one column in the teal under the map, one size from the opening view; ABOUT and YOU+ME run
  down the arch, one under the other (`WORD_AT`).
- **The opening flyover**, B for every visitor since 9 Nov 2026 ("I need to see the flyover it shouldn't be trial it was b I told
  you that"; `?open=rug`, `far` or `none` for the others), none under a link straight to a page; first tried behind `?open=rug|above|far` ("can i see both? and also maybe one from zoomed far
  back? it could be cool"): THE OPENING FLYOVER in `src/studio.mjs`, filmed by `tests/film.mjs` (`open-`). The words'
  first showing counts from when it lands (`introFrom`).
- Opening B starts square to the rug, his name straight across ("rotated so that the wordmark is left to right instead of
  diagonal"), close on it, pulls up and out, then drops into the room ("can b start zoomed in further into the carpet and
  pull out before droping back?"): RISE and CLOSE_H. Then one smooth move through those three places, not a rise, a stop and a drop: "I think all
  the camera movements (including the flyover) need to be smooth motions not stop and pivots" (Carl, 9 Nov 2026; ONE
  SMOOTH MOVE in `src/studio.mjs`). Then at one even speed the whole way along that path, easing only
  at its start and end: "It should be even from start to finish other than the ease in and out", after a single arc that
  turned early was "way weirder and the opposite of smooth"; then, the rise, a tight bend and the drop reading as a
  dogleg ("You can round the turns too instead of elbows", "there are some weird like... doglegs in the placement?"), one
  curve that bends a little all the way, its top still the high place's height (NO DOGLEGS). Its aim is set at the ends,
  never aimed from where the camera is, which spun his name diagonal; it eases evenly from the close-up's view to the
  top's on the way up, his name square ("it may need a subtle even rotation while rising?"), and turns to the room by how
  far across it has gone, so it never slides sideways over the rug before turning ("it like, moves sideways before
  continuing? That's the dogleg I meant"; TURNING AS IT GOES ACROSS). Then: "This is great please make it live!" (Carl,
  9 Nov 2026; EVEN ALL THE WAY in `src/studio.mjs`). On a phone its top is higher, near the ceiling, and a little wider, so
  his whole name fits the narrow screen: "Can we have the camera go just a bit higher at the top of the flyover in mobile?
  Just enough to get the whole wordmark in it" (Carl, 9 Nov 2026; `UPRIGHT_TOP`, `?otop=`). The lens is worked out for
  each screen's shape, his name taking 94% of its width, after one size for every phone "goes out too far" on his (Carl,
  9 Nov 2026; `UPRIGHT_TOP_FILL`, `?ofill=`, `?ofov=`). The drum and the chair lean back about their feet while the camera
  is over the rug, easing upright from 4 s as it lands: "What if the chair and drum lean back a bit for the opening
  shots?", then, shown both at 20 degrees, "Drum looks great at 20%, try chair at 10% please" (Carl, 9 Nov 2026; LEANS_BACK
  in `src/props.mjs`, THE CHAIR AND DRUM LEAN BACK in `src/studio.mjs`). The barn's floor from Homegrown was shown beside
  this one the same day ("what would it look like if we used the same floor as the barn?"), mostly under the rug; it is
  not in the room.
- The word editor (https://claude.ai/artifact/L5sZYGwWCpwAeN1sRASJxB, `build-words.sh`) is back up to date ("do you hvae
  the editor where i can put the words and resize them?"): every word stays up while one is moved, and it saves at
  `words/layout-nov8`, so the 3 Nov spots no longer pull the words back. Read that back with ArtifactData and write it
  into `WORD_AT`.
- The lamp waits for B ("b is cool except the lamp looks all sorts of fucked from that perspective haha"): not drawn
  while B is overhead and dropping, it fades in as the camera comes home (THE LAMP WAITS FOR B in `src/studio.mjs`).
- ABOUT and YOU+ME each in the middle of its column, the yellow left of the panel and the panel: "Both "about" and the
  "you + me" look just a few pixels off-center relative to their columns, don't you think?" (Carl, 9 Nov 2026); they
  stood 3 and 2 cm right of the middles. Moved all the way they read a touch left, so they are halfway: "You overcorrected
  the word centering a bit. can you split the difference?" (Carl, 9 Nov 2026; `WORD_AT`).
- YOU / + / ME on three centred rows down the arch ("you + me needs to be on 3 rows, center-aligned"): `dir: "rows"`,
  a Rows button on the word editor too.
- No HOMEGROWN word and the book a plain decoration: "we don't need a homegrown link, i'd rather put that inside the
  studioland page". The snow globe's card has a third part, Homegrown, its line his motto "Habits not hacks." and VISIT
  HOMEGROWN.
- His word layout from the editor, saved and written into `WORD_AT` ("updated the wording").
- The edge lean holds at the very edge: "when i havce my mouse on the left edge it bounces and doesn't really show the left
  side". The mouse is read over the whole page, so the card's border and the margin past it count as the edge (`EDGE_OUT`).
- Words quiet until hovered on a laptop: "can we have the words always on screen on laptop, just quiet? like 18% until
  hovered then it gets full? and the words dshould be clickable/hoverable too". After the opening's full showing every
  word stays at `QUIET` (`?quiet=`), the hovered thing's word full; a quiet word hovers and clicks as its thing does.
- A new home angle, turned left to his screenshot ("can we try to make this the new "home" angle?"): `START.yaw` 0.135
  (was -0.0726), matched by rendering against his picture, and `LIMITS.left` moved out to 3.25 so the view can rest there.
- A card's words never show a scrollbar of their own, and keep 10px each side for a button's drawn line: "padding is still
  cutting stuff off" (the player's two buttons cut on the right, where a Mac's always-on scrollbar sat).
  Then "both sides are a little cutoff": the card's body clipped at the button's own edge, so it reaches 10px into the
  card's padding too. The songs are two rows of two ("two rows of two songs instead of a row of 3 and a row of 1"),
  further apart so they come out smaller ("they should have more padding between them so they can be a bit smaller"),
  with no lengths under them ("we can remove the times from the page").
- The deck's song and artist wait until the record has landed, then fade in: "can we make the words on the player not show
  up until the vinyl lands? it can fade in?" (THE WORDS WAIT FOR THE RECORD in `src/nav.mjs`, `textA` in `drawControls`).
  Then out of a blur, whole: "make the fade be a blur-in not like, entering line by line". The deck's pieces are cut at
  half their alpha, which made a fading word appear in chunks; the controls' picture keeps its soft alpha (`soft`).
- NOW PLAYING in a mini player's order, asked "what is a best practices order?", then "yes": the song, back, play/pause
  (a little bigger), next, and a small × apart at the end that stops the song and closes the card. No stop button.
  Then the buttons ahead of the song, so they stay put as its name changes length: "can the buttons be before the song
  info? then they won't bounce around when the song changes" (Carl, 9 Nov 2026): back, play/pause, next, the song, ×.
- The clickable map ("Can you show me the clickable heat map?"): `node tests/clickmap.mjs [out.png]` colours every spot of
  the room as it opens by the page a click there opens, labelled. Drawing it found two things, fixed the same day: a click
  was aimed by the camera's turn alone, so with the edges leaning the view it landed beside what was under the pointer
  (`rayAt` now goes through the camera as drawn); and each word answered across its whole 1.66 m wrapping width, far
  past its letters (a word's picture is now as wide as its words).
- Each page one zone, as he drew round the clickable map (8 Nov 2026): the map and QUOTES, the snow globe and STUDIOLAND,
  the dog and CONTACT, the console for LISTEN, the panel and the eye painting for YOU + ME, the arch and the drum for ABOUT.
  A zone is the outline wrapping a thing's picture and its word as the camera sees them now, so it follows the view;
  where two meet, the smaller wins (EACH PAGE ONE ZONE, `zoneAt` in `src/nav.mjs`).

**The chief hole-poker's first round, 8 Nov 2026** (https://claude.ai/artifact/Y6SDkFV4CF8VBwTNACdcmC,
`docs/GODZILLA-2026-11-08.md`), every hole fixed on his "Yeah fix them all now": Back pressed while the camera flies in turns
it round with no card opening, so closing never leaves the site (BACK PRESSED MID-FLIGHT, `coming` and `callOff` in
`src/nav.mjs`); a contact box of only spaces counts as empty and the browser's own "fill out this field" comes up (A BOX
OF SPACES IS EMPTY); an address in capitals opens its page (`byHash`); and a song changed before it starts no longer
leaves an error in the console (`play`). `node tests/holes.mjs` recreates each one and fails if it comes back.
**A tap is not a grab, 9 Nov 2026**: "sometimes I try to tap and it latches to my finger and grabs" (Carl). A finger
turned the room from its first pixel, so a fingertip's roll on a tap moved the view and, past 8px, stopped being a tap.
Now a finger moves 12px (`SLOP` in `src/studio.mjs`) before it turns anything and is a tap until then, a flick carries on
only after a real drag, and a finger the page loses track of lets go. In `tests/holes.mjs` too.
**The drum's legs pinned, 9 Nov 2026**: "The drum looks weird and rotates - the two legs should be pinned to a position"
(Carl). Its `follow` is 0, so it keeps the turn it has from where the room opens. And the things that turn to the camera
turn to where it stands in the room (`stands` in `src/studio.mjs`), never to the flyover high over the rug or the lean
over the console, which had swung the drum, the chair and the lamp round as the room opened. **A slide-in at the end of the
flyover was tried and taken out the same day**: "The drum still looks so weird during the move, can it slide into place
at the end instead?", then, shown it hidden overhead and sliding in from the right as the camera dropped: "No I don't
like that either it's weird to have it appear on its own" (Carl, 9 Nov 2026). So the drum is drawn all the way through
the flyover again, legs pinned; how it should look from overhead is still his to say. **Turning it about its right foot was
tried and undone the same day**: "Can we start with the left foot in this other new spot? Like rotating it clockwise but
keeping the right foot where it is", then, shown it 36 degrees clockwise, narrower from the laptop's opening view: "hmmmm
no undo that" (Carl, 9 Nov 2026). It stands as before on a laptop. **Then on the phone only**: "it should be on the phone only.
I was judging it on the laptop but the phone is the issue" (Carl, 9 Nov 2026). So with the phone's layout on, the drum
stands 36 degrees clockwise about its right foot, that foot where it stood (`phone` on the drum, PHONE PROPS in
`src/props.mjs`). Then only while the flyover is over the rug: "it looks good during flyover but then once the main page
is in use it looks wrong. Is it possible to start there and then at the 4s mark it starts moving back to the original
position?" (Carl, 9 Nov 2026). So 4 s in it eases back to where it stands, there as the camera lands (THE DRUM TURNS BACK
in `src/studio.mjs`); with no flyover it is never turned. And where it rests on a phone, its right leg (as you look at it)
comes forward, turned 12 degrees about its left foot: "could you possibly (on phone only) rotate the audience-right drum
leg forward a bit?" (Carl, 9 Nov 2026, the spot marked on his screenshot; `phoneRest` on the drum). A real round body (its head cut from the drawing, a built
cylinder behind it, as the gong's rim and the clock's body are) was offered for how it looks from overhead: "nah it's too
complex of an image to try that tbh" (Carl, 9 Nov 2026).

**The student officers' 33 findings, merged into one quiz, 9 Nov 2026** (https://claude.ai/artifact/L3wsezeEBG1PJnkq35QotX;
the findings from his words, clutter, simplicity, delight and Godzilla officers, 8 Nov, on
https://claude.ai/artifact/EDaPDi6bsdhrD6XhKpKRFB). Carl, asked whether to fix them "now, or the list?": "Now, in a new
chat". His answers, built the same day unless marked:
- **The four Godzilla holes**, each recreated by `node tests/holes-nov9.mjs`, seen failing before and passing after: a
  half-written contact message is kept when the card closes, "Keep it until it's sent" (not through a reload; A
  HALF-WRITTEN MESSAGE IS KEPT in `src/nav.mjs`); an email that can't be replied to ("maya@gmail", ".con") is caught,
  "Catch it", in his words for a missed email box, "Almost there! Just need your email so I can reply." (AN EMAIL YOU
  CAN'T REPLY TO IS CAUGHT); a song that didn't load says "Ugh, that one didn't load. Tap it to try again." and loads
  again on a tap (A SONG THAT DIDN'T LOAD); the cards stop shrinking at three quarters and scroll, the X a finger's size,
  "Stop shrinking below a height, scroll instead" (NO SMALLER THAN THREE QUARTERS in `src/stage.mjs`), which bounds his
  3 Nov "I want the card contents to scale with the resizing".
- **On a phone**: the room opens on the console, LISTEN whole (`PHONE.turn` in `src/studio.mjs`). Every page's word sat in
  a row along the bottom of the room for a day ("Open on the console and the row of words"), then went: "I say lose em
  because the user will see the bottom of the drum during the flyover and that signals that there is something on that
  side (and swipe-worthy)" (Carl, 9 Nov 2026), the wall words being full on a phone all the time. So what opens shows on
  the thing itself again, as the rule above has it (A ROW OF WORDS ON A PHONE in `src/nav.mjs` says what it was). Every card fills the screen from the moment it opens, "Whole screen", asked
  knowing the player above is then out of sight. Then back to the bottom 65% the same day: "Can we make the mobile version
  card sixes back to the 2/3 or whatever we had instead of full? Now I can't see the record player deck" (Carl, 9 Nov
  2026; THE BOTTOM 65% AGAIN in `index.html`). Each thing lands whole in the room over the card; the drum on the floor had
  landed low and half behind it, the camera held from tipping further (Sway walks it up through the ceiling), so on a
  phone the camera stays where it stands and only looks down at it: "we need to make sure we fix the landing framing so
  the item is in the right spot" (Carl, 9 Nov 2026; A THING LOW IN THE ROOM, ON A PHONE in `src/nav.mjs`). NOW PLAYING
  goes to the bottom while a card is open, out of the X's way: "Move it out of the way". The room takes taps once the opening flyover is nearly home, not
  only once the camera is still, and a click on the way home from a card opens the next one too: "can we make it that
  things can still be clicked even if the camera isn't 100% still?" (Carl, 9 Nov 2026; NEARLY HOME IS HOME in
  `src/studio.mjs`).
- **The cards**: Spotify is small underlined words under HOLY MOLY on the songs' card ("Spotify as small words under
  HOLY MOLY"); the logos moved from under the bio to the top of the quotes card ("Move them to Quotes"); the email and
  Instagram icons left the contact form for the foot of the bio, under HOLY MOLY ("Drop em both, put them at the bottom
  of the about page"); orange only on the three lines of the You + Me list ("Only the three lines").
- **His words**: the Subject comes filled with "I want to talk to you about my song"; the co-producer line is "I'll
  tighten up the transitions, find those perfect moments for ear candy, and cut out those unnecessary layers you kinda
  forgot were even there." ("Use the draft"); the bio ends on "...borderline sentient." ("End a sentence sooner");
  Jean-Philip's quote starts "...the approach that Carl took" ("Start it with ..."); the tab and a shared link's title
  say "Carl Bahner // mixing and co-production", replacing his launch quiz's "Carl Bahner". Then in capitals, as his cards' titles are:
  "CARL BAHNER // MIXING AND CO-PRODUCTION" ("Capitals", 9 Nov 2026, the link preview quiz). Then "CARL BAHNER // MIXER & CO-PRODUCER": "MIXER & CO-PRODUCER" (Carl, 9 Nov 2026). The line under it is from his bio, "Mixes that feel tight, weird, and borderline
  sentient.", for "Mixer, educator, and sonic chaos gremlin." ("Use this one", the same quiz).
- **STUDIOLAND on the wall stays, a little smaller**: "Keep it since I run it, but maybe make it a little smaller like
  2-3px smaller" (0.205 for 0.22, about 2.5px of its 38 from the opening view).
- **Kept as they are, so not to be suggested again**: SUBMIT ("Keep SUBMIT"); the wall word and the card's title naming
  one place two ways ("Keep both, it's on purpose"); the snow globe's three VISIT buttons ("3 visits, but we need a better
  description for homegrown"); no song playing when the console opens ("Keep it they pick", his brief's "nothing
  autoplays with audio" standing).
- **The four that waited on him**, answered on a second quiz the same day (https://claude.ai/artifact/CCjRxZ6aLgEdvE7wEQCw9B)
  and built: his part after each song on the songs' card, as the words officer's draft had it ("Co-production, mixing,
  mastering" on the GGFO remix, "Co-produced and mixed", "Mixed and mastered", "Mixed and mastered"), the style words
  going; Homegrown's line on the snow globe's card is the landing page's own sentence, his of 12 Oct, then his motto
  ("Look at the homegrown landing page"); Homegrown's pointing glove floated over the first sleeve, bobbing as the garden's
  does, until a sleeve was first tapped ("Connect to the Ss-frontend repo"), and was taken out the same day: "I want to
  remove the glove pointer, it doesn't really fit or work for me visually or UX-wise" (Carl, 9 Nov 2026), so nothing
  hints over the sleeves; and Homegrown's red X closes every card ("Every card, it's also on the frontend repo"; THE RED
  X), copied from ss-frontend (`public/assets/icon-cancel.webp`), as the garden's other pieces are.
- **The consistency officer's nine, added to the same quiz the same day** (Carl's "yes" to adding them). Eight answered
  "match homegrown": the cards take Homegrown's own numbers (ss-frontend `src/styles/tokens.css`): gaps from 4, 8, 12, 16,
  24, 40, the card's inside 24 all round; DM Sans at 1.2 and DW Fairfield at 0.8 line spacing; faded ink 38% and 55%; one
  yellow, Homegrown's mustard `#f6cc60` (the quote marks and the line beside each name were a deeper one); every line 2px;
  small capitals 0.06em apart and capitals at reading size 0.02em; and only DW Fairfield and DM Sans, the quote marks
  moved off Georgia onto DM Sans. Corners (an eighth of the height up to 12) and the two creams (page and card) already
  were Homegrown's; the covers' fixed corner went 10 to 12. MATCHED TO HOMEGROWN in `index.html`. The ninth, the card on a
  phone held sideways: "Full size" (`K_MIN` 1 in `src/stage.mjs`), the card at its normal size, scrolling inside.

## Laptop first. Phones wait.

**Carl, 5 Oct 2026: "dont do phone yet i'll make them turn it sideways anyway. let's jsut get
laptop looking great".** So every decision is made and checked at a laptop window, and nothing is
built or rendered for a phone held upright. When phones come, they get the garden's answer:
turn it sideways.

**Then, 6 Oct 2026, for the landing page: "Mobile I'm not sure how to handle it other than requiring they
turn the phone, but maybe you have better ideas."** So phones are back in: three ways for a phone held
upright are built behind `?phone=` and filmed on his quiz (turn it, a tall room, a swipe from thing to
thing). He picked "1: Turn it" (6 Oct 2026), the garden's answer after all: held upright, a drawing of a
phone turning covers the room; on its side, it works as the laptop does. The other two are gone.

**A phone upright has its own layout, 2 Nov 2026: "I now want to develop the vertical mobile version of the website. My
thought is that it can open a bit more zoomed out than the laptop landscape version does, and the cards open on the
bottom half instead of the top half. Then they are able to scroll down/be taller to fit" (Carl).** So the turn card is
hidden (still in the page). Upright (`upright()` in `src/stage.mjs`) the room fills the phone with no 16:9 card; its lens
is his opening lens widened `PORTRAIT_ZOOM` times top to bottom, tilted so his Highest spot sits on the screen's top
edge (the extra height is floor), held level, swiped left and right within his side limits, never zoomed out past where
it opens (THE PHONE UPRIGHT in `src/studio.mjs`). A window's top comes up to the middle of the screen, the thing framed in the top half
(`room()` in `src/nav.mjs`; his laptop cameras from the view editor are not used upright), and the card is as long as its
words, scrolling up over the room (`#winscroll`): "Top of the card should stay fixed and the card's container height of
whatever can get taller/longer to fit content" (Carl, 2 Nov 2026). **Then pinned, 3 Nov 2026**: the card stays in the bottom half at any
window size and its words scroll inside it, so the player above stays in sight ("the card too needs to stay pinned (relative
to the resized windows) so I can scroll to the other sleeves without covering up the player in the top half"). Then the
bottom 65%, the thing framed in what is left above ("i think the mobile cards may need to take up more than just the bottom
half, possibly doing 60 or 70%", phones only; `UPRIGHT_CARD` in `src/stage.mjs`, `?ch=`). The console's lean has its own aim upright (`LEAN_UPRIGHT`). `?pz=` tries another zoom.

## Where it is going

**Carl, 5 Oct 2026: "take a head-on shot of each wall, so we can make a painted geometry version of
each piece, then do some garden illustration-style versions for all the different decorations which
can become the navigation bits".** The walls are painted geometry; the decorations are drawings in
the garden's style, and they are the navigation. `src/garden-bits.mjs` holds the garden pieces that
will draw them (the boil, the tap-on-ink test), copied ready for that.

## Run it

**Carl plays the real thing at https://carlbahner.com.** A change reaches it once its PR merges (Netlify builds `main`),
so that is the link he gets. No more claude.ai preview: "Stop giving me the artifact" (Carl, 9 Nov 2026), after it was
published three times without its code beside it and showed him the old player. Until then his live link was
https://claude.ai/artifact/DQ8ij9nV3LYqoqFPctKkyx (5 Oct 2026: "this is a playable page right? i dont just want a
video"), built by `build-artifact.sh`, which stays for the editors that still use it.


Serve the folder with anything static (`npx vite studio`), or render it with
`node studio/tests/render.mjs`. That renders at a laptop window (as it opens, dragged, near and far)
and fails on any page error. `node studio/tests/nav.mjs` walks the way round the site (hover, open,
close, Back, a link, the keyboard, a phone), and `node studio/tests/film.mjs` films its options for a
quiz (`NAVIGATION.md` says how both keep time).
`node studio/tests/lamp.mjs [outdir]` looks at the arc lamp alone from every place Carl's free camera can stand, at the
opening and closest lenses and both Heights, and writes labelled contact sheets, its joins enlarged, and a film of the
turn swept (about 40 minutes; `--root` renders another copy of the room, `--eval` switches a piece off first).
