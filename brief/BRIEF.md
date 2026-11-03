# Personal website: explore the studio (2.5D)

## Goal

Build my new personal website as an explorable **2.5D version of my home studio / filming set**. Visitors navigate the site by interacting with objects in the room instead of (only) a traditional menu.

**Important:** I want this built the same way as **"my garden" in this front-end repo**. Before writing anything, find and study the garden implementation (its rendering approach, layering/parallax, camera/scroll behavior, asset pipeline, interaction model, component structure) and reuse those patterns, utilities, and conventions here. Match its 2.5D technique rather than inventing a new one. If anything about the garden approach is unclear or doesn't translate to an indoor room, ask me before choosing a different technique.

## Reference photos (`/photos`)

- `03-full-set-camera-view.jpeg` is **the master reference**: the full set as seen on camera. It shows the room composition the 2.5D scene should be based on: a corner where two walls meet.
- `02-left-wall-map-dog-console.jpeg` is a close-up of the left (teal) wall.
- `01-right-wall-arch-gong-drum.jpeg` is a close-up of the right (cream) wall.

### What's in the room

**Left wall (deep teal):**
- Large brass/copper wire world map in two globe halves
- Furry dog figure sitting on an old book ("The Complete Book of Composting")
- Vintage walnut record console/stereo cabinet with speaker grille
- Small framed photo and a small brass object on the console

**Right wall (textured cream plaster):**
- Hanging gong (dark bronze, on a wire)
- Painted mustard-yellow arch shape
- Painted teal rectangle overlapping the arch
- Diamond-hung framed photo: coral-red top, teal bottom, small animal with glowing eyes
- Vintage bass drum with a wood hoop and a "CC" logo head (bottom right)
- Three brushed-metal dome pendant lamps hanging from above

**Other:** mustard/orange upholstered chair or couch, a warm wood/orange ceiling panel, and a striped pillow in coral, white, and olive.

## Visual observations so far

- The palette is strong and cohesive: **teal, mustard, coral-red, cream, brass, walnut**. The site's design tokens should come from the room itself.
- Two walls meeting gives natural depth, which is ideal for 2.5D layering (back walls → wall objects → furniture → foreground).
- The props have personality (quirky but not cluttered). That charm is the brand.
- The painted arch and teal panel act as a built-in frame on the right; the map wall is busier on the left.
- The brass map throws purple/pink reflections in the stills. In video it reads warm gold, so lean warm gold.

### Approximate palette (sampled by eye, so refine from the photos)

| Name | Hex |
|---|---|
| Studio teal (wall) | `#1F5A5E` |
| Deep teal (panel) | `#0F4A4A` |
| Mustard (arch) | `#C9A23A` |
| Chair orange | `#E8A02A` |
| Coral red (print) | `#D93A55` |
| Plaster cream | `#EDE6DA` |
| Brass | `#C89B5C` |
| Walnut | `#6B3A1F` |

## Navigation concept: objects are the menu

Each object is a hotspot that opens a section. This is a proposed mapping, so confirm with me before finalizing:

| Object | Section | Interaction idea |
|---|---|---|
| Gong | Contact | Strike it → it rings and swings → contact panel opens |
| Bass drum | Music / Work | Hit it → thump → projects, mixes, credits |
| World map | About / Clients | Continents light up; pins for where I've worked or where students are |
| Record console | Listen | Lid/player opens → audio player for tracks/podcast |
| Diamond print | Videos / Portfolio | Zooms in to a gallery |
| Dog | Easter egg / personal "about me" | Something playful (bloopers, a fun fact) |
| Pendant lamps | Light/dark mode | Pull/tap the light to switch the theme; room lighting changes |

## Interaction and UX requirements

- **Sound is the signature.** I run a music business, so objects should make real sounds. Sound must be **opt-in** with a visible mute toggle, and nothing autoplays with audio.
- Hover/focus states should make hotspots discoverable (subtle glow, lift, or wobble) without labels cluttering the scene.
- **A plain-text menu fallback** must always be available for accessibility, for visitors in a hurry, and for SEO. Every section should also be reachable by URL.
- Keyboard navigable, with visible focus on hotspots and screen-reader labels for each object.
- Respect `prefers-reduced-motion` by reducing parallax/animation.
- **Mobile matters.** Decide how the corner composition works on a narrow portrait screen (pan, crop to one wall at a time, or a reflowed layout). Look at how the garden handles this.
- Keep load time reasonable: optimize and compress assets and lazy-load section content.

## Assets

The photos are references, not final assets. Depending on the garden's technique, the scene will likely need either cut-out layers from photos (walls, each prop separated with transparency) or an illustrated/stylized redraw of the room in the palette above. Tell me what assets you need from me (e.g., new straight-on photos of each object, a clean shot of each wall without me in frame, audio samples of the gong and drum).

## Suggested first steps

1. Inspect the garden implementation and summarize its 2.5D approach back to me.
2. Propose the room's layer structure and hotspot list based on that approach.
3. Build a rough prototype of the room with placeholder layers and 2–3 working hotspots (gong → contact, drum → work, lamps → theme).
4. Then iterate on art, sound, and content.
