/* THE ROOM'S MOMENTS, AS THEY HAPPEN. Carl, 2 Nov 2026, asked where the room's sounds should be put to its moments:
   "Personal site's room". So each thing the room does that a sound could land on says so here, by its moment's id
   (docs/STUDIO-ROOM-SOUND-MOMENTS.md lists them, numbered, for him), and whoever listens hears it: the room's own
   player (src/sound.mjs) and, when the room is shown inside the admin's room sound page, that page.

   Nothing here plays anything. A cue is a name and the moment it happened. */
const listeners = new Set();
export function cue(id) {
  const at = performance.now();
  for (const f of listeners) f(id, at);
}
export function onCue(f) {
  listeners.add(f);
  return () => listeners.delete(f);
}
