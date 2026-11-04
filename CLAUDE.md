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
control that? And can you make it the same mustard yellow?" (6 Oct 2026). The pillow has its own ("I think we need to do the
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
"the complete book of composting" in my dw fairfield font". The panel shows
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
the dots at their hubs mustard. The room lays both on their pieces as BITS in `src/props.mjs`; the flame has a Flame size slider.
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
button) is one Back: closing never walks back through the windows before it.

**His answers of 2 Nov 2026, evening.** The Spotify button under the sleeves opens his playlist. The contact form sends to
his Gmail through FormSubmit, falling back to the visitor's own email (`contactForm` in `src/nav.mjs`); FormSubmit asks
him to confirm the first message. The drum's page is the logos alone ("maybe the logos are all I need tbh?"). His
clients' countries, 35 from his list, light up on the map when its window opens, west to east (THE COUNTRIES LIGHT UP in
`src/props.mjs`), placed by eye on his drawing, which has no borders. The progress knob drags to skip through the song
and does not press down ("You should be able to drag it and skip through the song but it won't depress"). The opening
view tilts down onto the rug ("yes"; the most of four, "4"), his top and bottom limits moved with it (`TILT` in `src/studio.mjs`, `?tilt=`). The
first song reads as the others do ("fix it"). The player is four songs, in his order, two by two: "fake a happy face, good
grief, the garden, night life. those 4", three across so the next row shows ("a bit smaller so it's clear there are more
than two"). Changing songs, the old record fades away on the deck over a second while the new one comes out of its
sleeve (A RECORD FADES AWAY in `src/props.mjs`): flying it home glitched. His name on the wall is gone: "no need for the wall I like the rug better".

**The room's sounds, 2 Nov 2026** (Carl, asked where they are put to the room's moments: "Personal site's room"; his
brief: "Sound must be opt-in with a visible mute toggle, and nothing autoplays with audio"). Each moment says so as it
happens (`src/cues.mjs`; the list, numbered for him, is `docs/STUDIO-ROOM-SOUND-MOMENTS.md` in the repo), and
`src/sound.mjs` plays his sounds on them once a visitor turns sound on with the garden's speaker, top left of the card.
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
a separate sync page, i think you're right... make them smaller to fit under the bio, maybe as a carousel?" (3 Nov 2026).
**Going live, 3 Nov 2026:** it replaces carlbahner.com ("i want to replace my current site"), with the four songs ("launch
with four songs"), built here until then and moved to its own repo for the launch. His launch quiz answers (https://claude.ai/artifact/5LWQs73jHMp7yRByiUZgP1): the tab
says "Carl Bahner"; a shared link shows the room as it opens (`assets/share.jpg`), his name and his line "Mixer, educator,
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

**Carl's live link is https://claude.ai/artifact/DQ8ij9nV3LYqoqFPctKkyx** (Carl, 5 Oct 2026: "this is
a playable page right? i dont just want a video"). After a change, run `studio/build-artifact.sh
<folder>` and publish the page it writes to that same link, so he plays the real thing.


Serve the folder with anything static (`npx vite studio`), or render it with
`node studio/tests/render.mjs`. That renders at a laptop window (as it opens, dragged, near and far)
and fails on any page error. `node studio/tests/nav.mjs` walks the way round the site (hover, open,
close, Back, a link, the keyboard, a phone), and `node studio/tests/film.mjs` films its options for a
quiz (`NAVIGATION.md` says how both keep time).
`node studio/tests/lamp.mjs [outdir]` looks at the arc lamp alone from every place Carl's free camera can stand, at the
opening and closest lenses and both Heights, and writes labelled contact sheets, its joins enlarged, and a film of the
turn swept (about 40 minutes; `--root` renders another copy of the room, `--eval` switches a piece off first).
