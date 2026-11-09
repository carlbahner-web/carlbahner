# The studio as a landing page: the way round it

## What Carl still has to decide

1. **Decided 1 Nov 2026: the pages, and which thing opens which.** On 6 Oct he had put it off: "not sure yet,
   let's figure out what info/pages we should have first. this feels like putting the cart before the horse a bit".
   On 1 Nov the pages became the sections of his current site, carlbahner.com/for-artists, and he picked on a quiz
   (https://claude.ai/artifact/EdvqB1h1H4HQKyXh9JMJWf) and in chat: the console the portfolio player, the photo the
   bio, the map what artists say ("maybe the map is the testimonials page?", his clients' countries lighting up),
   the drum tour photos, the gong "the co producer part", the dog "contact info", the eye painting "Are YOU my
   people?", and the mug his Secret Sonics podcast on Spotify (not wired until he sends the link). "lamps, clock,
   candle could be nothing", and the headline goes ("I think we can lose the hijack part"). A phone on the floor
   with its cable behind the chair for Instagram and YouTube is his idea, waiting on his drawing. `THINGS` in
   `src/nav.mjs`. Then the book, 2 Nov 2026: "I'm thinking the book should link out to https://homegrownapp.io".
   It is a link, not a window: a click opens the address in a new tab, the camera stays where it is.
   It does not boil like the things that open windows: asked "Should the book boil like your other clickable
   objects?", "No" (Carl, 2 Nov 2026).
2. **The words are in (1 Nov 2026)**, off his current site, sent as a PDF: "I wrote it all myself". `WORDS` in
   `src/nav.mjs`. Still his: the photos (bio, tour), the songs' audio, covers and full titles (the PDF cuts them
   off), his links (Spotify, the full portfolio, Secret Sonics, Instagram, YouTube), where the form sends, his
   clients' countries for the map, and the end of the co-producer section (the PDF stops at "WE'VE ALL BEE").

**The bigger touches**, shown to him: "they're better!" (6 Oct 2026).

**Decided on the quiz (https://claude.ai/artifact/WBZBE9pY7pQ29wUZ9twZRT, 6 Oct 2026), now the only
behaviour:** the things you can open boil while the rest hold still ("1: They boil"); under the mouse a light
comes up on it ("2: Lights up"); the flight takes 1.8 s ("3: Slow"); the window is a sheet down the right side
("1: Sheet down the side"); a phone held upright is asked to turn ("1: Turn it"). The losing options and the
page settings that switched them are gone.

And, not on the quiz because they are his words, not choices:

- **Everything inside the windows.** Each window is a shell of dashed empty spaces: the portfolio's title,
  cover, "now playing" line and each track's name; the bio's photo, title and text; each page's title and
  contents. The player plays three placeholder tones (`assets/placeholder-*.mp3`) until his tracks come.
- **The names a screen reader says.** Each thing's button is named for the thing ("Record console",
  "Picture frame", "World map", "Gong") until he says what each should be called; the window's close
  button says "Close" and the player's buttons "Play", "Pause" and "Position". Those are words on
  controls, but they are still his to change.

## Delight, without the apps' rewards

**Carl, 6 Oct 2026: "I want to try to make it feel delightful. I know that in the homegrown apps,
delightfulness is use a lot in conjunction with the literal gamification system, so that is where this
will be departing from the delightfulness docs in the repo".** So the apps' tokens, tickets, receipts and
gardens stay in the apps. What carries over from `docs/DELIGHT.md` is the line he drew there, "delight and
distraction sometimes be blurry", and its four questions, which every touch here is held to: each comes
after something the visitor did, never makes them wait (the press runs while the flight sets off), never
happens if nobody does anything, and never pulls them off what they came for. Here the visitor's "work" is
finding his music and him, so a touch points back at that: it answers the thing they chose, where they chose
it.

## How it works

`src/nav.mjs` is the whole of it; `src/studio.mjs` hands it the camera and calls it from its pointer
handlers and its render loop; `src/props.mjs`'s shader draws the looks; `index.html` holds the window and
its styles.

- **Which things.** `THINGS` in `src/nav.mjs`: a decoration's id, the window's address (`#portfolio`,
  `#bio`, `#map`, `#contact`) and the shell it opens (`player`, `bio`, `page`).
- **Finding the thing under the pointer.** The line of sight through the pointer is crossed with every
  decoration's card, nearest first, and counts only where the drawing has ink (the garden's `inkMask`,
  copied in `src/garden-bits.mjs`): the see-through box round a drawing is not the drawing, and the dog
  standing in front of the console is the dog, which opens nothing.
- **The looks** are drawn in the decorations' own shader (`use`, `hot`, `navRest`, `navLook`): at rest a
  thing you can open boils all over while no window is open, and only round its outside edge while one is
  (that one alone; the rest stop: "when one thing is selected, the other things should stop boiling", Carl,
  6 Oct 2026). A disc's outline is its depth, the rim band round its back, not its face's edge: "the depth of the
  gong should be part of the outline, not the rim of the first layer" (the same day; `wob` in EDGE_VERT). The rim reads
  its face's own boil: at rest its rings go where the face's drawn edge goes, so the whole gong boils as one; opened, its
  front ring holds with the face's edge and only its back ring wanders. Boiled on a noise of its own, its front line left
  the face's edge and showed as a second line beside it, and past the face on the far side (`SWEEP-EDGES-2026-10-06.md`): "make the whole image boil when nothing is
  selected, but then only outlines once it's been selected and zoomed in" (Carl, 6 Oct 2026). Before that it
  was round its outside edge only, throughout, never through the picture ("it should be just the
  outside of the frame not the picture itself?", Carl, 6 Oct 2026), by 2.5 of its drawing's own pixels over
  waves about 40 long, so the wobble keeps its size against the lines at any zoom ("the amount of boil is
  always a fixed amount of the screen rather than relative to the view", the same day, of a try in screen
  pixels). The edge is the 14 art pixels inside the outline, the card's own border counting as outline, so the
  console's front, cut flush to its card, boils round its silhouette. The map is nearly all wire, so nearly all
  of it boils. `node studio/tests/heat.mjs` draws what boils as a heatmap. The room's own Boil, which Carl set to none, is left alone; under the pointer it takes a warm light, and so do its built
  sides and rim (EDGE_FRAG takes its face's `hot`), never the front alone. The keyboard's focus rings it in rust, four
  screen pixels wide, just inside the edge of a drawing cut flush to its card like the console's front. Only the card's own
  border counts as that edge: a see-through hole in a drawing is rung from outside, as any edge is (counted, every one of
  the map's wires went solid rust). The map is rung round its outside alone, its holes filled (`ringOutside`): "Just the
  outside" (Carl, 6 Oct 2026). The gong's strings take its light: "Light them too" (the same day). The gong is rung round the outside of its
  thickness, not round its face, where the ring hid part of the rim (RIM_HALO): "yes" (Carl, 7 Oct 2026).
  The shader still knows the two looks he did not pick (`navLook` 0 boil, 2 ink).
- **The touches**: the press squashes the whole thing, its built sides and rim with it (`give` and `pressed` in
  `src/nav.mjs`): the gong from where it hangs, a thing standing on something from its feet, the console only
  across so nothing on its top is left in the air. It first squashed the picture alone, in the shader, and a
  see-through gap opened down the console's sides and round the gong ("the front panel of the console springs
  inward but then you see a transparent gap on either side", Carl, 6 Oct 2026). The gong's strings narrow with it, about
  the same middle, their screw kept on the wall (`hung`): left at their width, their ends stood out past the squashed rim. The dog's two blinks are
  `nextBlink` and `again` in `tickProps`; the paper's give is a CSS curve on `.touches #win.sheet`. All three are off under reduced motion.
- **The keyboard.** One invisible button over each thing, in the room's order left to right. Tab moves
  between them, and the camera turns to the one with focus when it is not well on screen (within the
  visitors' limits). The focus shows on the thing itself: its outline inked in the focus ring's rust,
  whichever look is picked. Enter opens, Esc closes, and the focus goes back to the thing.
- **The flight** finds where to look so the thing sits in the part of the screen the window leaves
  (`frame`), worked out from the opening view through the room's own `pose` and `onScreen`, then eases
  there, in and out, the lens moving evenly in its tangent's log. The visitors' limits are off while it
  flies and while a window is open, and the drag, the wheel and the keys leave the camera alone. The
  window starts in at 72% of the flight, so the two read as one move. Closing flies back to where the
  visitor was (the opening view, if they arrived by a link) and the limits hold again.
- **Reduced motion**: no flight. The room fades out for 0.14 s, the camera cuts, and it fades back in.
- **Addresses.** Opening a window pushes its address, so the browser's Back closes it and Forward opens it
  again; closing with the button, Esc or a tap outside goes Back too, so the history stays the same
  whichever way. A reload or a link with the address lands straight on the open window. In the artifact
  viewer only a bare `#word` reaches the page, which these are.
- **The windows** are one shared component: the room's cream paper with its grain, a boiled charcoal
  edge (the apps' own `wobbleLine`, three drawings shown 0,1,2,1 every 130 ms, corners an eighth of the
  height up to 12, the middle drawing held under reduced motion), a mustard close button, DW Fairfield.
  On a laptop it is a sheet down the right side; on a phone on its side, the right half.
- **The phone.** "A phone" is a coarse pointer on a screen under 600 px on its short side. Held upright, a
  drawing of a phone turning covers the room. On its side, a tap is a press that never moved more than 8 px
  and lasted under 0.7 s; anything else is a drag.
- **A phone upright, since 9 Nov 2026** (the officers' fixes quiz): the room opens on the console and a row of every
  page's word runs along its bottom, a tap opening that page ("Open on the console and the row of words"); each card
  filled the screen for a day ("Whole screen"), then went back to the bottom 65% so the player's deck shows above it ("Now
  I can't see the record player deck", 9 Nov 2026), and NOW PLAYING drops to the bottom while one is open ("Move it out of the way").
  The row is the room's one label, on his word. `node tests/holes-nov9.mjs` recreates that round's four holes.
- **Carl's editing panel** is unchanged and still shown to him alone. The windows' empty spaces show
  their names faintly to him too (`slot-names`), and to anyone with `?slots=1`; visitors see bare dashed
  boxes.

- **The sounds** (2 Nov 2026): each step above says its moment (`cue` in `src/cues.mjs`): the click on a thing, the
  flight in and back, the window opening and closing, the light under the pointer; `props.mjs` says the console's things
  lifting, its panel sliding, the clock's tick and the dog's blink. `src/sound.mjs` plays them, off until the sound
  button is pressed. For the room sound page it repeats one moment (`room-repeat`), opening a thing without pushing its
  address, so the page round it keeps its own Back.

## Testing

- `node studio/tests/film.mjs [outdir] [only]` films the room off the real page (it filmed every option for
  the first quiz). Software
  WebGL draws about a frame a second, so the page's clock is stood still and moved 40 ms a frame by the
  script, each frame drawn once, the time of day frozen, and its CSS transitions paused and stepped with
  it. Each film carries its label on it. About two seconds a frame at 1440x900.
- `node studio/tests/nav.mjs [outdir]` (laptop 1440x900, a phone upright 390x844 and on its side 844x390,
  reduced motion) clicks and taps its way through hover, opening, closing, Back, a reload on `#bio`, the
  keyboard, the turn card and a tap on the phone, writes a labelled screenshot of each, and fails on a page error or a step that did not happen.
- `window.__studio.cam` and `window.__nav` (`where`, `frame`, `room`) are there for these scripts.

## The workings

- The first framing iterated from wherever the camera was. On the phone's tour, from a turn far to the
  left, Sway's walking camera found a second answer, tipped 50 degrees down, that stood it behind the teal
  wall: a screen of teal. So framing always starts from the opening view, and the turn it may take is
  held to 1.1 and the tilt to 0.65 down, 0.5 up.
- The inked outline was first a fixed 1.2 cm, which was a hair on the frame across the room and a rope up
  close; it is four screen pixels now (`fwidth`). The console's front is cut flush to its card, so the ring
  outside the drawing had nowhere to draw; it is drawn just inside the edge there.
- The fake clock Playwright ships fired three or four animation frames for every 40 ms, each a full
  software render: about 40 s a filmed frame. The film's own clock draws once a frame: about 2 s.
- The windows have no drop shadow, no blur, no rounded white card, no blue: the room's paper, line and
  palette only (the brief's own list of looks to avoid).
