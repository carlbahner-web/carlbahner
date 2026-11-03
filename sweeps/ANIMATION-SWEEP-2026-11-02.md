# Animation sweep, 2 Nov 2026

**Carl, 2 Nov 2026: "Ok so before I add more songs and art, please do an animation sweep to make sure things behave as a
user would expect".** Fresh eyes: no earlier sweep was opened. What it found is listed here as it is confirmed, for Carl
to pick from; nothing is changed until he does.

How: the real page, on a fake clock that steps the room's frames, the player's timers and every page animation together
(so a film's timing is the visitor's), each frame's state logged (the window, the console's lid, the record, the arm, the
motor, each sleeve, the audio, any record in the air). Scenes: open the console, pick a song, switch, close; a second pick
mid-flight; close mid-flight; a double-click; a song running out; reduced motion; a phone upright; the other pages.

## Findings

**All six fixed the same day, on Carl's "Yes fix them"**, and checked again with the same scenes: the lid closes smoothly
while the arm goes home; closed mid-flight, nothing lands and nothing plays, and reopening starts fresh; a double-click
sends one record; a second pick mid-flight lets the first land, then sends it home as the second comes out; the record
stays on the deck until the panel has closed over it; a sleeve reads as empty while its record flies home, and is
scrolled into sight first when it is off the card.

1. **The console's lid stands still while the turntable moves.** The room's frame loop runs the turntable's step, and
   only if that did nothing runs the lid's (`tickProps` in `studio/src/props.mjs`, `stepDeck(...) || bitsChanged ||
   stepLid(...)`). So while the motor spins or the arm swings, the lid's opening or closing is frozen. Seen: closed with
   a record on its way, the lid stopped at 92% open and stayed there while the record dropped and the motor ran. A
   visitor would see the panel stop half way and the things on top hang in the air.
   Worse, when the turntable stops the lid catches up in one frame: closed while a song played, the lid held at fully
   open for 2 seconds while the arm went home, then snapped shut, and the dog and the rest popped back on top.
2. **Closing the console while a record is in the air does not stop it.** Esc (or a click on the room) closes the card,
   but the record still lands, drops onto the post, the motor spins up, the arm swings over and the song plays, with no
   card to stop it from. Seen: the page closed at 5.6 s, the song playing at 9.6 s. Opening the console again then shows
   a fresh card while the deck still believes it is playing: two players at once.
3. **A double-click on a sleeve sends two records.** The second click, while the first record is still on its way,
   starts the whole pick again: two records fly to the deck one after the other, and the second is the one that lands.
   Any second click on a sleeve whose record is in the air does it.
4. **Closing with a record on the deck makes it vanish at once.** The record is taken off the deck the moment the card
   closes, while the console is still open and the camera still close, so it blinks out of existence before the panel
   slides back over it.
5. **A second sleeve picked while the first record is flying makes the first one vanish in mid-air.** Its flight carries
   on to the deck and the record disappears there, never landing and never going back; its sleeve shows its record
   home again the moment the second is picked, while that record is still in the air.
6. **On a phone, a record going back can fly off the screen.** Switching songs on a phone sends the old record back to
   its sleeve wherever the card is scrolled, so when its sleeve has scrolled out of sight the record flies off the edge.

### Works as a visitor would expect

- Opening the console: the things on top lift away one after another, the panel slides under, the camera leans in, the
  card slides in.
- A pick: the record peeks out under the mouse, slides out of its sleeve, is carried over, lands over the post, goes down
  it, then the motor comes up to speed as the arm swings over, then the song plays. About 4 seconds from click to sound.
- Pause and play again from the sleeve or the deck: the motor slows to a stop and spins back up, the arm stays.
- A song running out: the next sleeve's record comes on by itself, the last one going back up the post and home.
- Reduced motion: every step happens at once, nothing flies.
- The eye painting's button goes to the dog; Back from there returns to the eye painting.
- Upright on a phone: the card opens and closes, a pick and a switch work, a tap above the card closes.

### Not bugs, noted

- The rig's own clock needed two fixes on the way (a page animation that is paused never reports it has finished; the
  room must settle before anything aims at it). Neither was the page's.

