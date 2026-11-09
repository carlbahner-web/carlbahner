/* THE WAY ROUND THE SITE: the room is the landing page, and some of its things open a window.
   Carl, 6 Oct 2026: "This was going to be my landing page on my new personal website. I want the user
   to land on this, and be able to hover on certain items, and clicking will zoom in on them and open
   certain modals (like a portfolio player, my bio, etc). It needs to be smooth and easy to navigate on
   desktop, as well as on mobile." And on 5 Oct 2026: the decorations "can become the navigation bits".

   - WHICH THINGS: THINGS, below. A DRAFT until Carl says which object opens which window.
   - SHOWING THEM: on the thing itself, in the room's own language, never a label, tooltip or arrow.
     The ones you can open boil while the rest hold still, the garden's rule that the boil is for what
     does something; under the pointer a light comes up on it. The keyboard's focus is its outline inked
     in the focus ring's rust. Carl picked both on his quiz (6 Oct 2026): "1: They boil", "2: Lights up".
   - A CLICK OR A TAP lands only on the drawing's own ink, not the see-through box round it (the garden's
     inkMask, src/garden-bits.mjs), and the nearest drawing under it wins, so the dog in front of the
     console is the dog.
   - THE FLIGHT: the camera turns and zooms onto the thing through the room's own pose maths, past the
     visitors' limits while it flies, eased over 1.8 s, then its window opens, a sheet down the right side
     (his picks: "3: Slow", "1: Sheet down the side"). Closing (the button, Esc, a tap
     outside, the browser's Back) flies back to where the visitor was. Under reduced motion, a short fade.
   - EACH WINDOW HAS ITS ADDRESS (#portfolio and so on), so a link or a reload opens it.
   - A PHONE HELD UPRIGHT is asked to turn, the garden's answer (his pick: "1: Turn it"); on its side it
     works as the laptop does, a tap for a click.
   - THE TOUCHES: "I want to try to make it feel delightful", without the apps' rewards
     (Carl, 6 Oct 2026, below). Each answers something the visitor did, where they did it: the thing gives
     a little press as it is clicked, the dog blinks as a window opens and again as you come back, and the
     window's paper settles as it lands. None makes anyone wait, and none happens if nobody does anything.
     The first ones were too quiet: "they're quite subtle and i had to watch a few times to even notice
     them" (Carl, 6 Oct 2026). So the press is a real squash and spring back, the dog blinks twice, and
     the paper lands with more give. studio/NAVIGATION.md has the rest. */
import { view, upright, CARD_REF, UPRIGHT_CARD } from "./stage.mjs";
import { setLid, setMapLights, setDeck, FADE_MS, preloadPictures, setHoverWords, hoverWordsCorners, setAllWords, allWordsCorners, setPhoneWords, deckPoints, ARM_SWING_MS, drawControls, deckControls, DECK_HIT, pressKey, releaseKeys, DECK_LIFT, DROP_MS, deckState } from "./props.mjs";
import { goToView, cameraFor } from "./viewtune.mjs";
import { cue } from "./cues.mjs";
import { inkMask, MASK_N, wobbleLine, wobblePath, BOIL_ORDER, BOIL_MS } from "./garden-bits.mjs";

/* WHICH OBJECT OPENS WHICH WINDOW: Carl's, on his pages quiz (https://claude.ai/artifact/EdvqB1h1H4HQKyXh9JMJWf) and in
   chat, 1 Nov 2026, with the sections of his current site (carlbahner.com/for-artists) as the pages. Asked on 6 Oct he had
   put it off: "let's figure out what info/pages we should have first". Then: the console "Yes, the console opens it" (the
   portfolio player: "the record player def would def make more sense as the portfolio player"); the photo "Yes, the photo
   opens it" (the third-person bio); the map "maybe the map is the testimonials page?", his clients' countries lighting up;
   the drum "could be tour photos or something?"; "Gong could be the co producer part"; "Dog would be contact info"; the eye
   painting "The diamond artwork?" for "Are YOU my people?". The mug goes to his Secret Sonics podcast on Spotify ("The mug
   should go to the secret Sonics podcast page on Spotify"), the link sent 2 Nov 2026; and
   "lamps, clock, candle could be nothing". His headline, "Hijack your listener's ears", is left off ("I think we can lose
   the hijack part"). `kind` is the window's shell; what is inside each is still his words, pictures and tracks. */
/* WHAT THE TEAL WALL SAYS for each, his words (3 Nov 2026): "Record console LISTEN, Picture frame ABOUT, World map QUOTES,
   Bass drum SYNCS, Eye painting YOU+ME, Dog CONTACT, Mug PODCAST, Book HOMEGROWN". Keyed by the page a thing opens (or a
   link's own id): written as the bio moved from the frame onto the drum, so ABOUT goes with the bio and SYNCS with the
   logos, whichever thing opens them. */
export const SAYS = { portfolio: "Listen", bio: "About", artists: "Quotes", tour: "Syncs", "my-people": "You+Me", contact: "Contact", studioland: "StudioLand" };
export const THINGS = [
  { id: "console", hash: "portfolio", kind: "player", name: "Record console" },
  /* the picture frame opened the bio until 3 Nov 2026, the drum the logos ("COOL SYNC THINGS"); then "I want to put my
     bio behind the drum now and turn off the boil/click ability if the photo frame" (Carl). So the frame opens nothing
     (it neither boils nor lights up), the drum opens the bio, and the logos' page has no thing for now. An old #tour link
     opens the bio. */
  { id: "map", hash: "artists", kind: "page", name: "World map" },
  { id: "drum", hash: "bio", kind: "bio", name: "Bass drum" },
  /* the gong opened "Why do I call myself a co-producer?" until 3 Nov 2026, when that went onto the eye painting's page:
     "I think the "are you my people" and "co-producer" text should really be one page. maybe that's what we put behind the
     eye art, and make the gong not boiling/not clickable for the time being" (Carl). So it is not a thing that opens (it
     neither boils nor lights up), and an old #co-producer link opens the eye painting's page. */
  { id: "dog", hash: "contact", kind: "page", name: "Dog" },
  { id: "eyes", hash: "my-people", kind: "page", name: "Eye painting" },
  /* the book linked out to Homegrown from 2 Nov 2026 ("I'm thinking the book should link out to https://homegrownapp.io")
     until "we don't need a homegrown link, i'd rather put that inside the studioland page" (Carl, 8 Nov 2026). A plain
     decoration again; Homegrown is the snow globe's card's third part. */
  /* the mug linked his Secret Sonics podcast on Spotify from 2 Nov 2026 until his officers' quiz, 7 Nov: "We can remove it
     actually" (Carl). It is a plain decoration again. */
  /* StudioLand, from the snow globe with his castle in it: "It should go to welcometostudioland.com", then "It should
     zoom in actually, to a card that has a little info about it" (Carl, 3 Nov 2026). Its card ends on the way there. */
  { id: "globe", hash: "studioland", kind: "page", name: "Snow globe" },
];

// six at first: "if i did 6" (Carl, 2 Nov 2026), each a placeholder tone and an empty sleeve until his song came
/* FOUR, in his order: "ok so i think i want to do fake a happy face, good grief, the garden, night life. those 4" (Carl,
   2 Nov 2026). Lowborn's and High Shores' sleeves went with the placeholders. */
const TRACKS = ["assets/tracks/small-pools-fake-a-happy-face.mp3", "assets/tracks/surname-good-grief.mp3", "assets/tracks/king-leer-the-garden.mp3", "assets/tracks/honestly-night-life.mp3"];
/* HIS SONGS, as he sends them (2 Nov 2026): the first, Small Pools' "Fake A Happy Face!" (Great Good Fine OK remix),
   its cover squared from the one he sent (art/covers/), the mp3 at 256 kbps as his player kit asks */
// Surname's "Good Grief", as his live site has it (sent 2 Nov 2026); it was "Rat Race" for an hour, whose files
// are kept (assets/tracks/surname-rat-race.mp3, assets/covers/surname-rat-race.webp). Its cover came the same evening.
// King Leer's "The Garden" (Tawnted version), sent 2 Nov 2026: his master at 256k, its cover his screenshot
// with its edges trimmed off and squared
// Honestly's "Night Life", sent 2 Nov 2026, the same way
// NEXT, not on the player yet: mrnoname's "Futurism", its cover sent 2 Nov 2026 and made the same way
// (assets/covers/mrnoname-futurism.webp); "i just need to find the mp3 so don't worry about adding it to the live player yet"
// on the deck, the song's title over its artist (props.mjs drawControls); the card keeps the description line
const SONGS = [
  // three lines for a moment ("Ok so this could be three lines since it's so long?"), then two, the remix on the artist's
  // line in his words: "can you make it say SMALLPOOLS (GGFO REMIX) so we can do two lines instead of three?" (Carl, 3 Nov
  // 2026). Drawn in capitals, so his spelling is kept as he wrote it
  { song: "Fake A Happy Face!", artist: "SMALLPOOLS (GGFO REMIX)" },
  { song: "Good Grief", artist: "Surname" },
  { song: "The Garden", artist: "King Leer" },
  { song: "Night Life", artist: "Honestly" },
];
const COVERS = ["assets/covers/small-pools-fake-a-happy-face.webp", "assets/covers/surname-good-grief.webp", "assets/covers/king-leer-the-garden.webp", "assets/covers/honestly-night-life.webp"];

/* CARL'S WORDS, off his current site (carlbahner.com/for-artists, sent as a PDF, 1 Nov 2026), word for word. Asked
   whether he wrote it or it was drafted: "I wrote it all myself". *Stars* mark the words his site sets in colour.
   What the PDF could not give stays an empty space: the photos, the songs' full titles and audio, the links, and
   the end of the co-producer section, which the PDF cuts off at "WE'VE ALL BEE". */
export const WORDS = {
  portfolio: {
    // shortened: "HEAR FOR YOURSELF (shorten the title)" (Carl, 3 Nov 2026); it was his site's "hear for yourself // full
    // portfolio link below player"
    title: "hear for yourself",
    // and the contact button at its foot: "(add a contact button at the bottom)" (Carl, 3 Nov 2026)
    button: { words: "HOLY MOLY I WANT TO TALK TO YOU ABOUT MY MUSIC", to: "contact" },
    // the full titles off his live site's player (screenshots, 2 Nov 2026); the first written the same way as the rest:
    // "fix it" (Carl, 2 Nov 2026), its remix credit where the others' describe the song
    /* then what he did on each, after the song, as the words officer's draft had it: "Say what I did on each", then "Quiz
       me and I'll answer", and his parts (Carl, 9 Nov 2026, the officers' fixes quiz): "Co-production, mixing, mastering",
       "Co-produced and mixed", "Mixed and mastered" and "Mixed and mastered". The first keeps its remix in his deck's
       words (SONGS). Until then: 'Great Good Fine OK remix // Smallpools "Fake A Happy Face!"', 'fun-yet-sad indie pop //
       Surname "Good Grief"', 'introspective indie // King Leer "The Garden"', 'ultra-catchy indie pop // Honestly "Night
       Life"'. */
    tracks: ['Smallpools "Fake A Happy Face!" (GGFO remix) // Co-production, mixing, mastering', 'Surname "Good Grief" // Co-produced and mixed', 'King Leer "The Garden" // Mixed and mastered', 'Honestly "Night Life" // Mixed and mastered'],
    more: "MORE SONGS ON SPOTIFY",
    // his playlist, sent 2 Nov 2026
    moreLink: "https://open.spotify.com/playlist/3Bt7j0jThvjdHSlVSRH6HK",
  },
  bio: {
    title: "Obligatory Third-Person Biography",
    button: { words: "HOLY MOLY I WANT TO TALK TO YOU ABOUT MY MUSIC", to: "contact" },
    text: [
      "If you put the Backstreet Boys and Aphex Twin in a blender with a 1960 Ludwig kit, you\u2019d land somewhere close to Carl\u2019s sonic instincts: pop sensibilities wrapped in glitchy ear candy, anchored by massive rhythm sections and tiny buried details that only reveal themselves on the 10th listen.",
      "Before mixing full-time, he toured internationally as a drummer, opening for artists like Charli XCX, Walk The Moon, The Wombats, and more\u2026 which left him with an unusually tuned ear for what actually moves a room full of humans.",
      "Now, he helps artists and producers turn their \u201calmost done\u201d songs into unignorable records - by making the catchy parts catchier and the weird parts weirder.",
      // ending a sentence sooner: "End a sentence sooner" (Carl, 9 Nov 2026, the officers' fixes quiz), without "The kind of
      // songs people don't just hear. They obsess over."
      "With a drummer\u2019s sense of motion and a remixer\u2019s ear for surprise, he shapes mixes that feel tight, weird, and borderline sentient.",
    ],
  },
  artists: {
    // "world map: WHAT THEY SAID (add a contact button at the bottom)" (Carl, 3 Nov 2026)
    title: "What they said",
    logos: true, // the logos above the quotes (THE LOGOS on the quotes card)
    button: { words: "HOLY MOLY I WANT TO TALK TO YOU ABOUT MY MUSIC", to: "contact" },
    quotes: [
      // starting on "...", not "I also really love": "Start it with ..." (Carl, 9 Nov 2026, the officers' fixes quiz)
      { words: "\u2026the approach that Carl took on his \"The Winds Of Change\" remix\u2026 literally had me grinning from ear to ear the first time I heard it.", name: "JEAN-PHILIP GROBLER", photo: "assets/people/jean-philip-grobler.webp", role: "// Artist, Producer - St Lucia //" },
      { words: "Carl is a reliable guy to have in the room. He’s always eagerly exploring the possibilities and naturally keeps the collective mood in a fun place. Among his many talents, you should know he is an exceedingly skilled and flexible drummer. It’s true.", name: "ANDREW MAURY", photo: "assets/people/andrew-maury.webp", role: "// Producer, Mixer - Shawn Mendes, Lizzo, Post Malone //" },
      { words: "Having toured with Carl over the years, we knew what an amazing musician he was - but having him work on remixes for Sunship Balloon and totally reimagine them was so cool... Highly recommend!", name: "DANIEL HAGGIS", photo: "assets/people/daniel-haggis.webp", role: "// Artist, Drummer - The Wombats, Sunship Balloon //" },
    ],
  },
  // the drum's page: "bass drum: COOL SYNC THINGS" (Carl, 3 Nov 2026)
  tour: { title: "Cool sync things" },
  "co-producer": {
    title: "Why do I call myself a *co-producer?*",
    text: [
      "I could just mix what you send me. I’m pretty damn good at that\u2026 but it\u2019s way more fun when I can help with that maddening final stretch of production where you’re too close to your own music to be objective.",
      // "Use the draft" (Carl, 9 Nov 2026, the officers' fixes quiz): his words with "I'll" at the front and the end mended;
      // until then "Tightening up the transitions, finding those perfect moments for ear candy, cutting out those unnecessary
      // layers you kinda forgot they're even there."
      "I\u2019ll tighten up the transitions, find those perfect moments for ear candy, and cut out those unnecessary layers you kinda forgot were even there.",
    ],
  },
  "my-people": {
    // the co-producer's words on the same page (THINGS, the gong), after its own: "ARE YOU MY PEOPLE? first, then the
    // coproducer part can be second" (Carl, 3 Nov 2026); they were first for a day. The button ends the page.
    then: "co-producer",
    title: "Are *YOU* my people?",
    text: ["I love love LOVE working with artists and producers who geek out over:"],
    list: ["Vocals that get *STUCK IN YOUR HEAD*", "Drums that make you *PHYSICALLY UNABLE TO SIT STILL*", "Those little nerdy *SONIC EASTER EGGS* that only your superfans notice"],
    /* the orange on the three lines of his list alone: "Only the three lines" (Carl, 9 Nov 2026, the officers' fixes quiz,
       of the clutter officer's "When that many are lit up, none of them stands out"). Here and in the co-producer's words it
       was where his site has it: *talk... everyone else.*, *way more fun*, *transitions*, *ear candy*, *unnecessary layers* */
    after: ["If you’re nodding along right now, we should probably talk\u2026 and I promise I won’t make you sound like everyone else."],
    // his site's button, which goes to the form: the dog here
    button: { words: "HOLY MOLY I WANT TO TALK TO YOU ABOUT MY MUSIC", to: "contact" },
  },
  // the snow globe's card: his words for StudioLand, sent 3 Nov 2026 ("StudioLand: a career school for ..."), its first
  // letter made a capital under the title; its button goes to StudioLand: "It should go to welcometostudioland.com"
  /* and StudioLand MGMT under it, on the same card: "I think they should both be in the snow globe" (Carl, 3 Nov 2026),
     with his words for it sent the same day ("StudioLand MGMT: a producer management company ..."). Each has its own
     button out, neither boiling: two equal ways on, not one action */
  studioland: {
    title: "StudioLand",
    text: ["A career school for producers and mixing engineers who are great at the craft but tired of feast-or-famine. We help them build the brand, systems, and client pipeline to go full-time."],
    link: { words: "VISIT STUDIOLAND", href: "https://welcometostudioland.com", calm: true },
    more: [
      {
        title: "StudioLand MGMT",
        text: ["A producer management company that matches passionate artists with the producers and engineers born to be on their records. Our roster has worked on some of the most influential albums of the last 25 years."],
        link: { words: "VISIT STUDIOLAND MGMT", href: "https://studiolandmgmt.com", calm: true },
      },
      /* and Homegrown, moved off the book: "i'd rather put that inside the studioland page" (Carl, 8 Nov 2026). Its line is
         Homegrown's motto, his: "Habits not hacks works great" (20 Oct 2026, in the marketing session) */
      {
        title: "Homegrown",
        /* a better line for it: "we need a better description for homegrown", then "Look at the homegrown landing page"
           (Carl, 9 Nov 2026, the officers' fixes quiz). The landing page's own sentence, his ("Yes use the longer one
           except say outreach and project management instead of outreach and follow-ups", 12 Oct 2026; ss-frontend
           src/lib/productName.ts LINK_DESCRIPTION), then his motto, which was here alone */
        text: ["Homegrown is a CRM for music producers and mixing engineers that turns outreach and project management into a game, one artist at a time. Habits not hacks."],
        link: { words: "VISIT HOMEGROWN", href: "https://homegrownapp.io", calm: true },
      },
    ],
  },
  contact: {
    // "CONTACT (and then use the hey carl line as a subheadline)" (Carl, 3 Nov 2026)
    title: "Contact",
    sub: "\u201cHey Carl, you seem like my *kind of weirdo.*\u201d",
    text: ["Fill out this form and tell me about your song. You know you want to."],
  },
};
// his words with their *coloured* parts
function said(text, tag = "p", cls = "") {
  const e = el(tag, cls);
  text.split(/\*([^*]+)\*/).forEach((part, i) => e.append(i % 2 ? el("span", "hi", { textContent: part }) : document.createTextNode(part)));
  return e;
}

const Q = new URLSearchParams(location.search);
const FLY_MS = 1800; // how long a flight takes: "3: Slow" (Carl, 6 Oct 2026)
const RUST = [0.749, 0.459, 0.22]; // the focus ring's rust, #bf7538, as the panel's
const INK = [0.1, 0.1, 0.1]; // the drawing's ink, #1b1b1b

export function startNav(v) {
  // every picture the cards show, in before the loading screen lifts (props.mjs EVERY PICTURE THE CARDS SHOW)
  preloadPictures([
    ...COVERS,
    ...Object.values(WORDS).flatMap((w) => (w.quotes || []).map((q) => q.photo)),
    "assets/people/carl.webp",
    ...LOGOS.map((n) => "assets/logos/" + n + ".webp"),
    ...SOCIALS.map((x) => x.icon),
  ]);
  const { cam, START, props, canvas, pose, onScreen, clamp, reduced } = v;
  DECKCAM = v.camera;
  REDUCED = reduced;
  const things = THINGS.map((t) => ({ ...t, mesh: props.find((m) => m.userData.prop.id === t.id), hot: 0 }))
    .filter((t) => t.mesh);
  /* boiling: each thing you can open, all over while no window is open; while one is, that one round its outline
     alone and the rest still ("when one thing is selected, the other things should stop boiling", Carl, 6 Oct
     2026). A disc's outline is its rim, the band of its depth (props.mjs EDGE_VERT). */
  const boiling = (opened, draw = true) => {
    for (const t of things) {
      const u = t.mesh.material.uniforms,
        on = !opened || t === opened;
      u.use.value = on ? 1 : 0;
      u.edgeOnly.value = opened ? 1 : 0;
      const wob = t.mesh.userData.band?.material?.uniforms?.wob; // a disc's rim
      if (wob) wob.value = on ? 2.5 : 0;
    }
    if (draw) v.dirty();
  };
  boiling(null, false); // before the room's first drawing: nothing to redraw yet
  /* how each gives under a press, [across, up, where it holds still: -1 its feet, 0 its middle, 1 its top]: the
     gong from where it hangs; one standing on something from its feet; the console, with the dog and the rest
     standing on its top, only across, so nothing on it is left in the air. The whole thing is squashed, its built
     sides and rim with it: squashing the picture alone left them standing and a see-through gap opened down the
     console's sides and round the gong ("the front panel of the console springs inward but then you see a
     transparent gap on either side like it becomes disconnected from the rest of the body. same issue, to a
     smaller degree, with the gong", Carl, 6 Oct 2026). */
  for (const t of things) {
    const p = t.mesh.userData.prop;
    t.give = p.against ? [1, 0, -1] : p.id === "gong" ? [1, 1, 1] : p.wall ? [1, 1, 0] : [1, 1, -1];
  }
  v.shared.navRest.value = 1; // the garden's own strength, on the outside edge alone
  v.shared.navLook.value = 1; // the light (props.mjs's shader keeps the other two looks' numbers: 0 boil, 2 ink)

  const touches = !reduced;
  document.body.classList.toggle("touches", touches);
  const dog = props.find((m) => m.userData.prop.id === "dog");
  // the dog blinks twice a moment from now (its blink in src/props.mjs tickProps), noticing what just happened
  const notice = (ms) => touches && dog && Object.assign(dog.userData, { nextBlink: performance.now() + ms, again: true });
  let pressed = null; // { t, t0 }: a thing's press
  // the words on the teal wall for the thing under the pointer: its page's title, or a link's own name (`says`)
  // his words for each, by the page it opens (3 Nov 2026), so they follow a page to whatever thing opens it
  const wordsOf = (t) => (t ? SAYS[t.hash || t.id] || t.says || (WORDS[t.hash]?.title || "").replace(/\*/g, "") || null : null);
  const sayFor = (t) => setHoverWords(wordsOf(t), t ? t.hash || t.id : null);
  /* ALL THE WORDS (props.mjs): "Show all the words at first" and, of the phone, "I need to make every word visible and
     clickable and clear" (Carl, 7 Nov 2026, his officers' quiz). On a touch screen every page's word stays on the wall
     while no card is open, and a tap on a word opens its page as a tap on its thing does. With a mouse they all show as
     the room opens, until the first hover or INTRO_MS, then the one under the pointer takes over as before. */
  const INTRO_MS = +(new URLSearchParams(location.search).get("intro") || 6000);
  let allOn = false,
    introUntil = Infinity, // set when the room is ready (whenReady)
    introDone = false;
  const keyOfThing = (t) => t.hash || t.id;
  const wordList = () => things.filter((t) => wordsOf(t)).map((t) => ({ key: keyOfThing(t), text: wordsOf(t) }));
  /* QUIET UNTIL HOVERED: "can we have the words always on screen on laptop, just quiet? like 18% until hovered then it
     gets full? and the words dshould be clickable/hoverable too" (Carl, 8 Nov 2026). With a mouse, once the opening's
     full showing is over, every word stays up at QUIET (`?quiet=`), and the one whose thing or word is under the pointer
     comes up full. A quiet word is still a word to hover and click. */
  const QUIET = +(new URLSearchParams(location.search).get("quiet") || 0.18);
  let shownAt = -1,
    shownHot = null;
  function showAll(level, hot = null) {
    if (level === shownAt && hot === shownHot) return;
    shownAt = level;
    shownHot = hot;
    allOn = level > 0;
    setAllWords(level, hot);
    v.dirty();
  }
  /* EACH PAGE ONE ZONE: Carl, 8 Nov 2026, drew round the clickable map: the map and QUOTES as one, the snow globe and
     STUDIOLAND, the dog and CONTACT, the whole console for LISTEN, the teal panel and the eye painting for YOU + ME, the
     arch and the drum for ABOUT. So each thing's zone is the outline wrapping its picture and its word on the wall, as
     the camera sees them now, and a point in it that hit neither still opens the page. Where two zones meet, the
     smaller one has it. */
  function zoneAt(x, y) {
    const C = v.camera;
    if (!C) return null;
    C.updateMatrixWorld();
    const P = C.projectionMatrix.elements,
      W = C.matrixWorldInverse.elements,
      w = view().width,
      h = view().height;
    const toScreen = ([px, py, pz]) => {
      const e = [0, 1, 2, 3].map((i) => W[i] * px + W[4 + i] * py + W[8 + i] * pz + W[12 + i]);
      if (e[2] > -1e-3) return null; // behind the camera
      const c = [0, 1, 3].map((i) => P[i] * e[0] + P[4 + i] * e[1] + P[8 + i] * e[2] + P[12 + i] * e[3]);
      return [((c[0] / c[2] + 1) / 2) * w, ((1 - c[1] / c[2]) / 2) * h];
    };
    const words = allOn ? allWordsCorners() : [];
    let best = null;
    for (const t of things) {
      if (!t.mesh?.visible || t.link) continue;
      const key = keyOfThing(t);
      const pts = [...corners(t.mesh).slice(0, 4), ...(words.find((q) => q.key === key)?.corners || [])].map(toScreen);
      if (pts.some((q) => !q)) continue;
      const hull = hullOf(pts);
      if (!inside(hull, x, y)) continue;
      const a = area(hull);
      if (!best || a < best.a) best = { t, a };
    }
    return best?.t || null;
  }
  // the outline round a few points on screen (Andrew's monotone chain), its area, and whether a point is in it
  function hullOf(pts) {
    const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]),
      cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]),
      lo = [],
      up = [];
    for (const q of p) {
      while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
      lo.push(q);
    }
    for (const q of p.reverse()) {
      while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
      up.push(q);
    }
    return [...lo.slice(0, -1), ...up.slice(0, -1)];
  }
  const area = (hull) => Math.abs(hull.reduce((s, q, i) => s + q[0] * hull[(i + 1) % hull.length][1] - hull[(i + 1) % hull.length][0] * q[1], 0)) / 2;
  function inside(hull, x, y) {
    let sign = 0;
    for (let i = 0; i < hull.length; i++) {
      const a = hull[i],
        b = hull[(i + 1) % hull.length],
        c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
      if (c === 0) continue;
      if (sign && Math.sign(c) !== sign) return false;
      sign = Math.sign(c);
    }
    return hull.length > 2;
  }
  // the thing whose word is under a point on screen, if the words are up: each word a flat quad on its wall
  function wordThingAt(x, y) {
    if (!allOn) return null;
    const r = rayAt(x, y);
    let best = null;
    for (const { key, corners: c } of allWordsCorners()) {
      const [p0, p1, p2] = c,
        e1 = p1.map((v, i) => v - p0[i]),
        e2 = p2.map((v, i) => v - p0[i]),
        n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]],
        dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        dn = dot(r.d, n);
      if (Math.abs(dn) < 1e-9) continue;
      const t = dot(p0.map((v, i) => v - r.o[i]), n) / dn;
      if (t <= 0 || (best && t >= best.t)) continue;
      const q = r.d.map((v, i) => r.o[i] + v * t - p0[i]),
        u = dot(q, e1) / dot(e1, e1),
        w = dot(q, e2) / dot(e2, e2);
      if (u >= 0 && u <= 1 && w >= 0 && w <= 1) best = { key, t };
    }
    return best ? things.find((t) => keyOfThing(t) === best.key) || null : null;
  }
  // ON A PHONE, THEY GLOW IN TURN (below, in step): no mouse to hover, so each thing that opens lights up in turn
  // ON A PHONE, THEY GLOW (in step, below): every thing that opens breathes in and out together. `?pulse=` (ms for one
  // breath) and `?peak=` (0 to 1) try others on a phone
  const Q = new URLSearchParams(location.search),
    TOUCH = matchMedia("(hover: none)").matches,
    PULSE_MS = +(Q.get("pulse") || 2200), // one breath in and out
    PULSE_PEAK = +(Q.get("peak") || 0.85); // a little short of the full light a hover brings
  const pulseFrom = performance.now() + 1200; // a moment after the room comes in
  let hovered = null, // under the mouse
    focused = null, // the keyboard's
    open = null, // whose window is open
    flight = null, // { from, to, t0, dur, then }
    away = null, // where the visitor was before flying in
    flying = false,
    holding = false; // a phone's tap showing the words before the flight (THE WORD FIRST, ON A PHONE)
  const WORD_HOLD_MS = +(Q.get("hold") || 900),
    TURN_MS = 600; // the turn to bring a tapped thing's words into view
  // a soft flight (a stop's nudge, ONE THING AT A TIME ON A PHONE) never holds a finger off the room
  const busy = () => !!(open || holding || (flight && !flight.soft));
  // the focus ring shows when the keyboard is in use, not after a click or a tap
  addEventListener("keydown", (e) => e.key === "Tab" && (document.documentElement.dataset.kbd = "1"), true);
  addEventListener("pointerdown", () => delete document.documentElement.dataset.kbd, true);
  if (Q.get("slots") === "1") document.body.classList.add("slot-names");
  const phone = () => matchMedia("(pointer: coarse)").matches && Math.min(innerWidth, innerHeight) < 600;
  const portrait = () => innerHeight > innerWidth;

  /* ---------- picking: the nearest drawing whose ink is under the pointer ---------- */
  const masks = new Map();
  function maskOf(mesh) {
    if (masks.has(mesh)) return masks.get(mesh);
    const img = mesh.material.uniforms.map.value?.image;
    if (!img) return null;
    const m = inkMask(img);
    masks.set(mesh, m);
    return m;
  }
  function rayAt(x, y) {
    /* through the camera as it is drawn: with the edges leaning the view (studio.mjs THE EDGES LEAN THE VIEW), the lean
       over the console or the opening flyover, the camera is not where the turn alone puts it, and a click aimed by the
       turn alone landed beside what was under the pointer (found drawing "the clickable heat map", 8 Nov 2026) */
    const C = v.camera;
    if (C) {
      C.updateMatrixWorld();
      const nx = (x / view().width) * 2 - 1,
        ny = 1 - (y / view().height) * 2,
        I = C.projectionMatrixInverse.elements,
        M = C.matrixWorld.elements,
        un = (z) => {
          const c = [0, 1, 2, 3].map((i) => I[i] * nx + I[4 + i] * ny + I[8 + i] * z + I[12 + i]);
          const q = c.map((w) => w / c[3]);
          return [0, 1, 2].map((i) => M[i] * q[0] + M[4 + i] * q[1] + M[8 + i] * q[2] + M[12 + i]);
        },
        o = un(-1),
        f = un(1),
        d = f.map((w, i) => w - o[i]),
        n = Math.hypot(...d);
      return { o, d: d.map((w) => w / n) };
    }
    const P = pose(cam.yaw, cam.pitch, cam.fov);
    const nx = (x / view().width) * 2 - 1,
      ny = 1 - (y / view().height) * 2;
    return { o: P.c, d: [0, 1, 2].map((i) => P.d[i] + P.R[i] * nx * P.ta + P.U[i] * ny * P.tv) };
  }
  // where the line of sight crosses a card, as its picture's u and v (0 to 1, v up), and how far along
  function cross(mesh, r) {
    const inv = mesh.matrixWorld.clone().invert().elements;
    const pt = (p, w) => [0, 1, 2].map((i) => inv[i] * p[0] + inv[4 + i] * p[1] + inv[8 + i] * p[2] + inv[12 + i] * w);
    const o = pt(r.o, 1),
      d = pt(r.d, 0);
    if (Math.abs(d[2]) < 1e-9) return null;
    const t = -o[2] / d[2];
    if (t <= 0) return null;
    const x = o[0] + d[0] * t,
      y = o[1] + d[1] * t;
    if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) return null;
    let u = x + 0.5;
    if (mesh.userData.prop?.flip) u = 1 - u;
    return { u, v: y + 0.5, t };
  }
  function thingAt(x, y) {
    const r = rayAt(x, y);
    let best = null;
    for (const mesh of props) {
      if (mesh.userData.book && mesh.visible) {
        // the book is a box, its card never drawn: a click anywhere on the box. Weighed as the dog is (ALWAYS IN FRONT),
        // so where the two meet the nearer wins: before, the dog always won and the book's middle opened Contact: "Make it
        // easier to hit" (Carl, 7 Nov 2026, his officers' quiz)
        let t = boxHit(mesh, r);
        if (t != null) t -= 1;
        if (t != null && (!best || t < best.t)) best = { mesh, t };
        continue;
      }
      if (!mesh.visible || mesh.material.visible === false) continue;
      const c = cross(mesh, r);
      // one drawn in front of what it stands on (the dog, props.mjs ALWAYS IN FRONT) is clicked in front of it too
      if (c && mesh.userData.prop.front) c.t -= 1;
      if (!c || (best && c.t >= best.t)) continue;
      const m = maskOf(mesh);
      if (!m) continue;
      const cx = Math.min(MASK_N - 1, Math.floor(c.u * MASK_N)),
        cy = Math.min(MASK_N - 1, Math.floor((1 - c.v) * MASK_N));
      if (m[cy * MASK_N + cx]) best = { mesh, t: c.t };
    }
    return best ? things.find((t) => t.mesh === best.mesh) || null : null;
  }

  /* THE BOOK'S FACES: a click on the book is a click on one of its faces, each a flat square in the room. It was a
     box round the faces lined up with the room's walls, and the book sits turned on the console, so the box was much
     bigger than the book and took clicks on the dog's paws and the mug: "why is the map for the book and dog and mug
     all fucked up?" (Carl, 2 Nov 2026, shown the map of what can be clicked). */
  const BOOK_REACH = 0.02; // metres
  function boxHit(mesh, r) {
    let best = null;
    mesh.userData.book.updateMatrixWorld(true);
    mesh.userData.book.traverse((f) => {
      if (!f.isMesh || !f.visible) return;
      // each face is a plane its own width and height (props.mjs BOOK), not a unit card
      const inv = f.matrixWorld.clone().invert().elements,
        pt = (q, w) => [0, 1, 2].map((i) => inv[i] * q[0] + inv[4 + i] * q[1] + inv[8 + i] * q[2] + inv[12 + i] * w),
        o = pt(r.o, 1),
        d = pt(r.d, 0),
        { width = 1, height = 1 } = f.geometry.parameters || {};
      if (Math.abs(d[2]) < 1e-9) return;
      const t = -o[2] / d[2];
      // and a little round its edges, BOOK_REACH, so a near miss on so small a thing still lands
      if (t <= 0 || Math.abs(o[0] + d[0] * t) > width / 2 + BOOK_REACH || Math.abs(o[1] + d[1] * t) > height / 2 + BOOK_REACH) return;
      if (best === null || t < best) best = t;
    });
    return best;
  }

  // the box round the book's faces, lined up with the walls: only for framing it (corners), never for a click
  function bookBox(mesh) {
    const lo = [1e9, 1e9, 1e9],
      hi = [-1e9, -1e9, -1e9];
    mesh.userData.book.updateMatrixWorld(true);
    mesh.userData.book.traverse((f) => {
      if (!f.isMesh) return;
      const e = f.matrixWorld.elements;
      for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]])
        for (let i = 0; i < 3; i++) {
          const v = e[i] * x + e[4 + i] * y + e[12 + i];
          lo[i] = Math.min(lo[i], v);
          hi[i] = Math.max(hi[i], v);
        }
    });
    return [lo, hi];
  }

  /* ---------- framing a thing: where the camera looks so it sits in the room left beside its window ---------- */
  function corners(mesh) {
    if (mesh.userData.book) {
      const [lo, hi] = bookBox(mesh);
      return [[lo[0], hi[1], lo[2]], [lo[0], hi[1], hi[2]], [hi[0], lo[1], lo[2]], [hi[0], lo[1], hi[2]], lo.map((v, i) => (v + hi[i]) / 2)];
    }
    const e = mesh.matrixWorld.elements;
    return [
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5],
      [0, 0],
    ].map(([x, y]) => [0, 1, 2].map((i) => e[i] * x + e[4 + i] * y + e[12 + i]));
  }
  // the part of the screen the window leaves, in -1..1: its middle and how much of it the thing may fill
  function room() {
    // a phone upright: what is left over the card (index.html .upright #win.sheet, UPRIGHT_CARD of the screen from the
    // bottom), its middle and eight tenths of its height
    if (upright()) return { x: 0, y: UPRIGHT_CARD, w: 1.6, h: 1.6 * (1 - UPRIGHT_CARD) };
    if (view().width < 900 || view().height < 500) return { x: -0.5, y: 0, w: 0.75, h: 1.3 };
    return { x: -0.46, y: 0.02, w: 0.92, h: 1.2 }; // the room left of a window 46% wide (index.html #win.sheet)
  }
  /* WHERE THE CONSOLE'S FLIGHT ENDS: THE LEAN (src/studio.mjs). Carl, 2 Nov 2026: "can we try some different camera
     endings for the record player opening? Like it feels like we should be able to see closer"; shown three filmed
     (the whole console, leaning in, straight over the well): "I like lean but the camera needs to be smoother". So the
     camera walks up and over to the console and looks down into its well, the one flight that leaves its spot. Offsets
     in metres from the well's middle: out from the teal wall (x), up (y), along it toward the corner (z); the look is
     pushed toward the corner so the well sits left of the window. */
  // aimed lower so less wall shows over the console: "the camera could be aimed a bit lower in the console page so
  // there isn't so much dead space above it" (Carl, 2 Nov 2026; the look was 5 cm down until then)
  const LEAN_AT = { off: [1.05, 0.95, 0.45], look: [0, -0.55, -0.62], fov: 42 };
  /* A TALL WINDOW looks straight down into the well, its own angle, with its own zoom: the turntable as wide as the
     screen, sitting in the top half over the card. Its angle was kept, its zoom changed: "i'm not opposed to a different
     angle but it would just need to be a different zoom amount" (Carl, 2 Nov 2026, of the well small in a tall window).
     UPRIGHT_FILL is how much of the screen's width, either side of the middle, the well takes (`?uf=` tries another). */
  const LEAN_UPRIGHT = { off: [1.15, 1.25, 0] };
  const DECK_ZOOM = +(Q.get("dz") || 1.7); // 1.4, then 2.0, then "Can we do 1.7 now" (Carl, 2 Nov 2026)
  const UPRIGHT_FILL = +(Q.get("uf") || 0.62); // the well's half-width over the distance, at the screen's edge: zoom
  // the lean as he has set it in the view editor (viewtune.mjs cameraFor), else LEAN_AT
  function leanAt(view) {
    const c = cameraFor(view);
    if (!c) return LEAN_AT;
    return { off: [c.ox, c.oy, c.oz], look: [0, c.ly, c.lz], fov: c.fov };
  }
  function leanFor(t) {
    const m = t.mesh;
    if (t.id !== "console" || !m.userData.lid) return null;
    const p = m.userData.prop,
      H = p.w * m.userData.aspect,
      e = m.matrixWorld.elements,
      at = (x, y, z) => [0, 1, 2].map((i) => e[i] * x + e[4 + i] * y + e[8 + i] * z + e[12 + i]),
      W = at(0.25, 0.5 - 0.05 / H, -p.depth / 2);
    // upright, the well sits in the middle of the top half, over the card: aimed along it and further down
    if (upright()) {
      const pos = W.map((v, i) => v + LEAN_UPRIGHT.off[i]),
        d0 = W.map((v, i) => v - pos[i]),
        dist = Math.hypot(...d0),
        d = d0.map((v) => v / dist),
        a = view().width / view().height,
        // wide enough that the well, about 0.66 m across, fills the screen's width with a little room
        tanH = (0.33 / dist) / UPRIGHT_FILL,
        tanV = tanH / a,
        // aimed below the well by enough that it sits in the middle of what the card leaves above it
        th = Math.atan(UPRIGHT_CARD * tanV),
        right = [d[2], 0, -d[0]].map((v, _, r) => v / Math.hypot(r[0], r[2])),
        up = [right[1] * d[2] - right[2] * d[1], right[2] * d[0] - right[0] * d[2], right[0] * d[1] - right[1] * d[0]],
        sgn = up[1] < 0 ? -1 : 1,
        dir = d.map((v, i) => v * Math.cos(th) - sgn * up[i] * Math.sin(th));
      return { pos, look: pos.map((v, i) => v + dir[i]), fov: Math.min(80, (2 * Math.atan(tanV) * 180) / Math.PI) };
    }
    /* THE CARD ON THE LEFT, THE TURNTABLE ON THE RIGHT: "let's move the card to the left side of the screen then and the
       turntable can still have the same focal center but just on the right side instead" (Carl, 2 Nov 2026), so a record
       pulled out of its sleeve goes toward the deck. The camera stands where his lean puts it and looks down as much;
       its aim along the wall is found so the well's middle sits as far right of the screen's middle as it sat left. */
    const C = deckPoints()?.[5] || W; // the turntable's middle (props.mjs deckPoints), the well's if it is not built yet
    /* and closer in on it: "better can we zoom in on the player more?" (Carl, 2 Nov 2026). DECK_ZOOM times, the lens
       narrowed about the deck, which stays where it sits on the screen. */
    const L = leanAt(t.hash),
      pos = W.map((v, i) => v + L.off[i]),
      a = view().width / view().height,
      tanV = Math.tan((L.fov * Math.PI) / 360) / DECK_ZOOM,
      tanH = tanV * a,
      // where the well's middle lands on the screen (-1..1) with the camera looking at `look`
      onAt = (look) => {
        const f0 = look.map((v, i) => v - pos[i]),
          fl = Math.hypot(...f0),
          f = f0.map((v) => v / fl),
          rl = Math.hypot(f[2], f[0]),
          r = [-f[2] / rl, 0, f[0] / rl],
          u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]],
          v = C.map((x, i) => x - pos[i]),
          z = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
        return [(v[0] * r[0] + v[1] * r[1] + v[2] * r[2]) / (z * tanH), (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / (z * tanV)];
      },
      his = W.map((v, i) => v + L.look[i]),
      // the turntable's middle in the middle of the room beside the card (index.html #win.sheet: 16px in, min(620px, 46%) wide)
      // the card scales with the room (index.html, THE CARD SCALES WITH THE ROOM): 16 + 620 of the room's CARD_REF
      cardRight = -1 + (2 * (16 + 620 + 8)) / CARD_REF,
      target = [(1 + cardRight) / 2, 0];
    // walk the aim along the wall and up and down until the well lands there (a few rounds of halving each way)
    const look = his.slice();
    for (let round = 0; round < 6; round++)
      for (const [axis, k] of [[2, 0], [1, 1]]) {
        // within a metre either way, so the aim never swings past straight down or round behind
        let lo = look[axis] - 1,
          hi = look[axis] + 1;
        const f = (x) => ((look[axis] = x), onAt(look)[k]);
        const rising = f(hi) > f(lo);
        for (let i = 0; i < 30; i++) {
          const m = (lo + hi) / 2;
          if (f(m) < target[k] === rising) lo = m;
          else hi = m;
        }
        look[axis] = (lo + hi) / 2;
      }
    return { pos, look, fov: (2 * Math.atan(tanV) * 180) / Math.PI };
  }
  function frame(t, box = room()) {
    return framePts(corners(t.mesh), box);
  }
  // the same for any points: all but the last are its edges, the last its middle (ONE THING AT A TIME ON A PHONE frames
  // a thing with its words on the wall)
  function framePts(pts, box = room()) {
    const mid = pts[pts.length - 1],
      edges = pts.slice(0, -1);
    // from the opening view, so the answer is the same wherever the visitor is: from a far turn, Sway's walk
    // found a second answer that stood the camera behind the teal wall
    let yaw = START.yaw,
      pitch = START.pitch,
      fov = START.fov;
    for (let i = 0; i < 16; i++) {
      const P = pose(yaw, pitch, fov);
      const s = onScreen(P, mid);
      if (!s) {
        // behind the camera: turn straight toward it first (as lookDir measures a turn)
        yaw = Math.atan2(mid[0] - P.c[0], mid[2] - P.c[2]) - Math.atan2(-1, -1);
        continue;
      }
      // drag right turns yaw up and moves the room right; drag down turns pitch up and moves it down
      yaw += Math.atan(P.ta) * (box.x - s[0]) * 0.9;
      pitch -= Math.atan(P.tv) * (box.y - s[1]) * 0.9;
      // never tipped so far that the walking camera leaves the room
      yaw = Math.max(-1.1, Math.min(1.1, yaw));
      pitch = Math.max(-0.65, Math.min(0.5, pitch));
      const ss = edges.map((p) => onScreen(P, p)).filter(Boolean);
      if (ss.length === edges.length) {
        const ex = Math.max(...ss.map((q) => q[0])) - Math.min(...ss.map((q) => q[0])),
          ey = Math.max(...ss.map((q) => q[1])) - Math.min(...ss.map((q) => q[1]));
        const k = Math.max(ex / box.w, ey / box.h);
        fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * Math.pow(k, 0.8)) * 180) / Math.PI;
        fov = Math.max(3, Math.min(60, fov));
      }
    }
    return { yaw, pitch, fov };
  }

  // refined on the screen itself: the points' box on screen centred in `box` and as wide or tall as it, from `p`
  function fitAll(pts, p, box) {
    let { yaw, pitch, fov } = p;
    for (let i = 0; i < 30; i++) {
      const P = pose(yaw, pitch, fov),
        ss = pts.map((q) => onScreen(P, q));
      if (ss.some((q) => !q)) break;
      const xs = ss.map((q) => q[0]),
        ys = ss.map((q) => q[1]),
        lx = Math.min(...xs),
        hx = Math.max(...xs),
        ly = Math.min(...ys),
        hy = Math.max(...ys);
      yaw += Math.atan(P.ta) * (box.x - (lx + hx) / 2) * 0.9;
      pitch -= Math.atan(P.tv) * (box.y - (ly + hy) / 2) * 0.9;
      const k = Math.max((hx - lx) / box.w, (hy - ly) / box.h);
      fov = Math.max(3, Math.min(60, (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * k) * 180) / Math.PI));
    }
    return { yaw, pitch, fov };
  }

  /* ---------- the flight ---------- */
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2); // in and out, no snap
  function fly(to, then, dur = FLY_MS, shape = null) {
    const from = { yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov };
    if (reduced) {
      // a cut, softened by a quick fade of the room
      canvas.classList.add("faded");
      setTimeout(() => {
        set(to);
        canvas.classList.remove("faded");
        then && then();
      }, 140);
      flight = { done: true };
      setTimeout(() => (flight = null), 150);
      return;
    }
    flight = { from, to, t0: performance.now(), dur, then, opened: false, shape, soft: !!shape };
    v.dirty();
  }
  function set(p) {
    cam.yaw = cam.tyaw = p.yaw;
    cam.pitch = cam.tpitch = p.pitch;
    cam.fov = cam.tfov = p.fov;
    v.dirty();
  }
  const tanH = (f) => Math.tan((f * Math.PI) / 360);
  function step(now) {
    let moved = false;
    if (flight && !flight.done) {
      const { from, to, dur } = flight;
      const x = Math.min(1, (now - flight.t0) / dur),
        k = flight.shape ? flight.shape(x) : ease(x);
      // the lens in its tangent's log, so the zoom feels even all the way in
      const f = (2 * Math.atan(Math.exp(Math.log(tanH(from.fov)) * (1 - k) + Math.log(tanH(to.fov)) * k)) * 180) / Math.PI;
      set({ yaw: from.yaw + (to.yaw - from.yaw) * k, pitch: from.pitch + (to.pitch - from.pitch) * k, fov: f });
      // the window starts in as the camera settles, so the two read as one move
      if (x >= 0.72 && flight.then && !flight.opened) {
        flight.opened = true;
        flight.then();
      }
      if (x >= 1) flight = null;
      moved = true;
    }
    // THE PRESS: squashed by a tenth, then a spring back past its size and settling, in half a second,
    // while the flight sets off
    if (pressed) {
      const x = Math.min(1, (now - pressed.t0) / 520),
        k = x >= 1 ? 0 : 0.1 * Math.sin(Math.PI * 3 * x) * Math.pow(1 - x, 1.6),
        { mesh, give } = pressed.t,
        b = pressed.base,
        sy = b.sy * (1 - k * give[1]);
      mesh.scale.x = b.sx * (1 - k * give[0]);
      mesh.scale.y = sy;
      mesh.position.y = b.py + (give[2] * (b.sy - sy)) / 2;
      /* the gong's strings narrow with it, about the same middle, so their ties stay on its rim: held at their own
         width, they stood out past it as it squashed (the edges sweep, 6 Oct 2026). Their screw stays on the wall. */
      for (const [m, sx] of b.hung) m.scale.x = sx * (1 - k * give[0]);
      if (x >= 1) pressed = null;
      moved = true;
    }
    /* ON A PHONE, THEY GLOW: "On mobile, we need a totally different visual cue. I was thinking, what if the different
       clickable items glow? But like, not all the time or at the same time, maybe a pulse like the countries or the
       fireflies?" (Carl, 3 Nov 2026). Taken in turn first (one swelling as the last faded, left to right), then quicker:
       "The timing feels arbitrary and def not often enough to grab attention", then "Oh can they just all be a steady
       pulse in and out?". So with no mouse to hover (a touch screen), every thing that opens breathes together, in and
       out to the light the mouse brings on a laptop, every PULSE_MS. Never while a window is open or the camera is
       flying, and not at all for someone who asks for less motion. */
    // ALL THE WORDS: up while nothing is open or flying (a tap's hold keeps them), on a touch screen always, with a
    // mouse until the first hover or INTRO_MS
    // the word editor keeps them all up, so each is placed among the rest (src/wordtune.mjs)
    const up = !open && (!flight || flight.soft || holding);
    showAll(!up ? 0 : TOUCH || window.WORDS_EDITOR || (!introDone && now < introUntil) ? 1 : QUIET, up && hovered ? keyOfThing(hovered) : null);
    const pulsing = TOUCH && !open && !flight && !reduced;
    const breath = pulsing ? PULSE_PEAK * (0.5 - 0.5 * Math.cos((2 * Math.PI * Math.max(0, now - pulseFrom)) / PULSE_MS)) : 0;
    for (const t of things) {
      const glow = breath;
      const aim = t === focused || (t === hovered && !open) ? 1 : glow;
      if (glow && aim === glow) {
        // the glow follows its own swell, not the hover's ease
        t.hot = glow;
        t.mesh.material.uniforms.hot.value = glow;
        t.mesh.material.uniforms.hotInk.value = INK;
        moved = true;
        continue;
      }
      if (t.hot !== aim) {
        t.hot += (aim - t.hot) * (reduced ? 1 : 0.22);
        if (Math.abs(aim - t.hot) < 0.02) t.hot = aim;
        t.mesh.material.uniforms.hot.value = t.hot;
        t.mesh.material.uniforms.hotInk.value = t === focused ? RUST : INK;
        moved = true;
      }
    }
    placeKeys();
    return moved;
  }

  /* ---------- the windows ---------- */
  const win = document.querySelector("#win"),
    body = win.querySelector(".body"),
    veil = document.querySelector("#veil");
  win.classList.add("sheet");
  drawBox(document.querySelector("#stage"), { front: true }); // the room's card: its line drawn over the room's edge
  drawBox(win); // a Homegrown card: still, its line faded (index.html #win)
  /* THE RED X: Homegrown's own (ss-frontend public/assets/icon-cancel.webp, ui.tsx CloseX, "Red X on every popup"),
     on every card: "I have a red x close button icon", then "Every card, it's also on the frontend repo" (Carl, 9 Nov
     2026, the officers' fixes quiz). It was a drawn mustard circle round a charcoal X until then. It is a drawing, so
     it gets no drawn box. */
  win.querySelector(".close").addEventListener("click", () => close());
  /* A CLICK IN THE ROOM WITH A WINDOW OPEN CLOSES IT. For a while, 2 Nov 2026, a click on another thing glided straight
     to it ("can we try glide?"); tried, Carl took it out the same day: "i think we should disallow clicking on other
     pages from a page view". The eye painting's own button still goes to the dog. */
  /* THE DECK'S BUTTONS: with the portfolio open, a click on the deck's play, stop or progress line works it, as on
     Greg's player; anywhere else in the room still closes. Read off the room's own camera, which is leaning in. */
  const onControls = (e, anywhere = false) => {
    const m = open?.kind === "player" && deckControls();
    if (!m || !m.visible || !DECKCAM) return null;
    const b = view(),
      nx = ((e.clientX - b.left) / b.width) * 2 - 1,
      ny = 1 - ((e.clientY - b.top) / b.height) * 2;
    DECKCAM.updateMatrixWorld();
    const I = DECKCAM.projectionMatrixInverse.elements,
      Wm = DECKCAM.matrixWorld.elements,
      un = (z) => {
        const c = [0, 1, 2, 3].map((i) => I[i] * nx + I[4 + i] * ny + I[8 + i] * z + I[12 + i]);
        const q = c.map((v) => v / c[3]);
        return [0, 1, 2].map((i) => Wm[i] * q[0] + Wm[4 + i] * q[1] + Wm[8 + i] * q[2] + Wm[12 + i]);
      },
      a = un(-1),
      z = un(1),
      d = z.map((v, i) => v - a[i]);
    m.updateMatrixWorld(true);
    const c = cross(m, { o: a, d });
    if (!c) return null;
    const u = c.u,
      v = 1 - c.v, // down the deck's picture
      inside = ([x0, y0, x1, y1]) => u >= x0 && u <= x1 && v >= y0 && v <= y1;
    for (const k of ["play", "stop", "scrub"]) if (inside(DECK_HIT[k])) return { k, u };
    return anywhere ? { k: null, u } : null; // a drag along the line still reads where it is once it has left it
  };
  const scrubTo = (u) => {
    const [x0, , x1] = DECK_HIT.scrub;
    PLAYER?.seek(Math.max(0, Math.min(0.995, (u - x0) / (x1 - x0)))); // never quite the end, which plays the next song
  };
  // on a tall screen the card's scroller takes the touches (index.html .upright #winscroll); a tap on it above the card
  // is a tap on the room
  const scroller = win.parentElement;
  scroller.addEventListener("click", (e) => e.target === scroller && veilClick(e));
  scroller.addEventListener("pointermove", (e) => e.target === scroller && (scroller.style.cursor = onControls(e) ? "pointer" : ""));
  veil.addEventListener("click", (e) => veilClick(e));
  function veilClick(e) {
    const h = onControls(e);
    if (dragged) return (dragged = false); // the end of a drag along the line, not a click
    if (!h || !PLAYER) return close();
    if (h.k === "scrub") (cue("knob-drag"), scrubTo(h.u));
    else {
      if (!held) pressKey(h.k); // a click the page never saw go down still goes down and up
      if (h.k === "play") cue("key:play");
      else cue("key:stop");
      PLAYER[h.k]();
    }
    held = null;
  }
  // a key goes down with the finger or the mouse, and comes back up when it lets go (props.mjs THE KEYS)
  let held = null;
  /* THE KNOB DRAGS along the line and the song follows it, but it does not press down: "You should be able to drag it
     and skip through the song but it won't depress" (Carl, 2 Nov 2026) */
  let scrubbing = null,
    dragged = false;
  const keyDown = (e) => {
    const h = onControls(e);
    if (!h || !PLAYER) return;
    if (h.k !== "scrub") return (held = h.k), pressKey(h.k, true);
    scrubbing = { id: e.pointerId, x: e.clientX };
    dragged = false;
    e.preventDefault();
    e.stopPropagation();
  };
  addEventListener(
    "pointermove",
    (e) => {
      if (!scrubbing || e.pointerId !== scrubbing.id) return;
      if (!dragged && Math.abs(e.clientX - scrubbing.x) < 3) return;
      if (!dragged) cue("knob-drag");
      dragged = true;
      e.preventDefault();
      e.stopPropagation();
      const h = onControls(e, true);
      if (h) scrubTo(h.u);
    },
    true,
  );
  const keyUp = () => {
    if (scrubbing && dragged) setTimeout(() => (dragged = false)); // after the click this release makes, if it makes one
    scrubbing = null;
    held && releaseKeys();
  };
  for (const el of [veil, win.parentElement]) el.addEventListener("pointerdown", keyDown, true);
  addEventListener("pointerup", keyUp);
  addEventListener("pointercancel", () => ((held = null), (scrubbing = null), (dragged = false), releaseKeys()));
  veil.addEventListener("pointermove", (e) => (veil.style.cursor = onControls(e) ? "pointer" : ""));
  // the card's edge fades while there is more to scroll that way (index.html WHILE THERE IS MORE TO SCROLL)
  // whichever box is the one that scrolls: the card's body upright, its words inside it on a laptop (index.html .words).
  // Measured by where its first and last things sit against its own edges, not by its scroll numbers: the card is drawn
  // scaled (index.html THE CARD SCALES WITH THE ROOM), and the numbers then disagree by a few pixels at the very end, so
  // the bottom faded with nothing more below ("the bottom of the card still fades as if there's more to scroll", Carl,
  // 3 Nov 2026)
  const edges = () => {
    for (const el of [body, body.firstElementChild]) {
      if (!el) continue;
      const scrolls = /(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1;
      const kids = el.children,
        box = el.getBoundingClientRect(),
        first = kids[0]?.getBoundingClientRect(),
        last = kids[kids.length - 1]?.getBoundingClientRect();
      el.toggleAttribute("data-up", !!(scrolls && first && first.top < box.top - 4));
      el.toggleAttribute("data-down", !!(scrolls && last && last.bottom > box.bottom + 4));
    }
  };
  body.addEventListener("scroll", edges, { passive: true, capture: true });
  win.addEventListener("scroll", () => win.scrollTop && (win.scrollTop = 0), { passive: true });
  // THE HOME STRETCH (index.html): a field on the card taken on a phone upright, and the card fills the screen
  win.addEventListener("focusin", (e) => {
    if (!upright() || !e.target.matches?.("input, textarea, select")) return;
    win.classList.add("full");
    // the field stays in sight once the card has risen
    setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 650);
  });
  new ResizeObserver(edges).observe(body);
  // and once its pictures are in, which makes it longer
  body.addEventListener("load", edges, true);
  let pushed = false,
    returnTo = null,
    coming = null; // the thing the camera is flying in to, until its card opens
  function show(t) {
    /* BACK PRESSED MID-FLIGHT: the chief hole-poker's first hole (docs/GODZILLA-2026-11-08.md; Carl, 8 Nov 2026, on its
       quiz: "Fix it"). Back during the console's long flight cleared the address, the card opened anyway on landing,
       and its close then pressed Back again, off the site. A flight Back has called off lands nothing. */
    if (coming !== t) return;
    coming = null;
    open = t;
    // in close now: it boils round its outline alone until it is closed, the rest still (props.mjs, ITS OWN BOIL)
    boiling(t);
    body.textContent = "";
    win.classList.remove("full"); // each card opens where cards open (THE HOME STRETCH ends with its card)
    body.scrollTop = 0;
    win.parentElement.scrollTop = 0; // a phone upright: the card back at the middle (index.html #winscroll)
    body.append(SHELLS[t.kind](t, (hash) => openThing(things.find((x) => x.hash === hash))));
    // EVERY CARD OPENS AT ITS TOP: "sometimes the page is open partially scrolled down the card" (Carl, 3 Nov 2026). The
    // card is the same box each time, and a box that hides its overflow can still be scrolled by the browser (a focus, a
    // picture landing); that scroll stayed for the next card. So the card, and anything in it that scrolls, starts at 0,
    // and the card itself is never left scrolled
    const toTop = () => {
      win.scrollTop = win.scrollLeft = 0;
      for (const x of [body, ...body.querySelectorAll("*")]) if (x.scrollTop) x.scrollTop = 0;
    };
    toTop();
    requestAnimationFrame(toTop);
    edges();
    // Homegrown's buttons and boxes: drawn, still, but the window's one action, which boils (drawBox)
    for (const b of body.querySelectorAll(".words-button, .play")) drawBox(b, { round: b.classList.contains("play"), live: b.classList.contains("act") });
    // their line boiling over the picture, the corners the card's own, as his photo on the bio has: "do the quote photos need
    // rounder edges or can they match the bio photo corners?" (Carl, 3 Nov 2026); a third of their height until then
    for (const b of body.querySelectorAll(".quote-photo-box")) drawBox(b, { live: true, front: true });
    // his photo on the bio, boiling the same way, its corner Homegrown's card's (an eighth of its height up to 12)
    for (const b of body.querySelectorAll(".bio-photo-box")) drawBox(b, { live: true, front: true });
    for (const f of body.querySelectorAll(".fieldbox")) drawBox(f);
    win.dataset.kind = t.kind;
    // the portfolio's card down the left, the turntable to its right (leanFor)
    win.classList.toggle("left", t.kind === "player");
    document.body.classList.add("win-open");
    win.hidden = veil.hidden = false;
    cue("window-open");
    requestAnimationFrame(() => win.classList.add("in"));
    // the keyboard lands in the window; the focus ring shows only if it came by the keyboard
    win.querySelector(".close").focus({ preventScroll: true });
  }
  function openThing(t, { jump = false, push = true } = {}) {
    if (!t || open === t) return;
    // its sound's moment (src/cues.mjs): a click, not a link or a reload landing on its window
    if (!jump) cue("click:" + t.id);
    if (t.link) {
      // a real link, clicked, so the viewer opens it in a new tab
      Object.assign(document.createElement("a"), { href: t.link, target: "_blank", rel: "noopener" }).click();
      return;
    }
    document.body.classList.add("going"); // the phone's row of words steps aside (A ROW OF WORDS ON A PHONE)
    // from another window: its card slides out as the camera leaves, and the new one comes in on landing
    if (open) {
      win.classList.remove("in");
      stopAudio();
    }
    // the console opens as the camera flies to it, and shuts if another window opens (props.mjs THE CONSOLE OPENS)
    setLid(t.id === "console");
    setMapLights(t.id === "map"); // his clients' countries light up on the map (props.mjs THE COUNTRIES LIGHT UP)
    if (t.id === "map") cue("map-lights");
    goToView(t.hash); // the things on the console take this view's placing (viewtune.mjs)
    const leanTo = leanFor(t);
    v.lean?.(!!leanTo, leanTo);
    t.leaning = !!leanTo;
    if (!open) away = jump ? { ...START } : { yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov };
    returnTo = document.activeElement?.classList?.contains("thing") ? document.activeElement : null;
    hovered = null;
    setHoverWords(null);
    canvas.style.cursor = "";
    if (push)
      try {
        // from one window to the next it is the same Back: closing never walks back through the windows before it
        if (open && pushed) history.replaceState({ studio: t.hash }, "", "#" + t.hash);
        else history.pushState({ studio: t.hash }, "", "#" + t.hash);
        pushed = true;
      } catch {
        /* no history here (a sandboxed frame): the window still opens */
      }
    // a lean is the only move: the turn holds where it is while the camera walks over (studio.mjs THE LEAN)
    // his saved cameras (viewtune.mjs) are for a laptop's card; a phone upright frames the thing in the top half
    const to = t.leaning ? { yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov } : (!upright() && cameraFor(t.hash)) || frame(t);
    if (touches && !jump && !pressed)
      pressed = {
        t,
        t0: performance.now(),
        base: {
          sx: t.mesh.scale.x,
          sy: t.mesh.scale.y,
          py: t.mesh.position.y,
          // what hangs from it on its own card (the gong's strings), and its width
          hung: props.filter((m) => m.userData.prop.on === t.id && m.userData.prop.strings).map((m) => [m, m.scale.x]),
        },
      };
    notice(jump ? 900 : 150);
    coming = t;
    if (jump) {
      set(to);
      show(t);
    } else {
      cue("fly-in");
      fly(to, () => show(t));
    }
  }
  // Back pressed while the camera flies in: it turns round and goes home, and no card opens (BACK PRESSED MID-FLIGHT)
  function callOff() {
    coming = null;
    document.body.classList.remove("going");
    pushed = false;
    setLid(false);
    setMapLights(false);
    v.lean?.(false);
    goToView("opening");
    stopAudio();
    fly(away || { ...START }, null);
    notice(FLY_MS + 150);
    const settle = () => (flight ? setTimeout(settle, 60) : (clamp(), v.dirty()));
    setTimeout(settle, 60);
  }
  function close({ fromHistory = false } = {}) {
    coming = null;
    if (!open) return;
    if (!fromHistory && pushed) {
      // the browser's Back does the closing, so Back and the button leave the same history
      pushed = false;
      try {
        history.back();
        return;
      } catch {
        /* fall through */
      }
    }
    if (!fromHistory)
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch {
        /* fine */
      }
    pushed = false;
    boiling(null);
    setLid(false);
    setMapLights(false);
    v.lean?.(false);
    goToView("opening");
    win.classList.remove("in");
    document.body.classList.remove("win-open", "going");
    stopAudio();
    const back = away || { ...START };
    open = null;
    /* hidden once its slide out has finished, not before: "Card slides in but just disappears on the way out" (Carl,
       2 Nov 2026). It was hidden at 260 ms while the paper's slide takes 620 (.touches #win.sheet in index.html). */
    veil.hidden = true;
    const gone = () => {
      win.removeEventListener("transitionend", ended);
      if (!open) win.hidden = true;
    };
    const ended = (e) => e.target === win && e.propertyName === (reduced ? "opacity" : "transform") && gone();
    win.addEventListener("transitionend", ended);
    setTimeout(gone, 900); // and if no transition ends (a hidden tab), hidden all the same
    cue("window-close");
    cue("fly-back");
    fly(back, null);
    notice(FLY_MS + 150);
    // the flight back ends inside the visitors' limits again
    const settle = () => (flight ? setTimeout(settle, 60) : (clamp(), v.dirty()));
    setTimeout(settle, 60);
    returnTo?.focus({ preventScroll: true });
  }
  // in any case: "#PORTFOLIO" opens the player as "#portfolio" does (docs/GODZILLA-2026-11-08.md, "Fix it")
  const byHash = () => {
    const h = decodeURIComponent(location.hash).toLowerCase();
    return things.find((t) => "#" + t.hash === ({ "#co-producer": "#my-people", "#tour": "#bio" }[h] || h)) || null;
  };
  addEventListener("popstate", () => {
    const t = byHash();
    if (t) openThing(t, { push: false });
    else if (!open && coming) callOff();
    else close({ fromHistory: true });
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
    // the window keeps the keyboard while it is open
    if (e.key === "Tab" && open) {
      const f = [...win.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])")].filter((x) => !x.hidden && !x.disabled);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });

  /* ---------- the keyboard: one button a thing, over it, in the room's order left to right ---------- */
  const keys = document.querySelector("#things");
  for (const t of things) {
    const b = Object.assign(document.createElement("button"), { type: "button", className: "thing" });
    // a screen reader's name for it, until Carl names what each opens (studio/NAVIGATION.md)
    // named by its page, his wall word, not the object: "Use the wall words" (Carl, 7 Nov 2026, his officers' quiz)
    b.setAttribute("aria-label", wordsOf(t) || t.name);
    b.addEventListener("focus", () => {
      focused = t;
      if (!open && !flight) glideTo(t);
      v.dirty();
    });
    b.addEventListener("blur", () => {
      if (focused === t) focused = null;
      v.dirty();
    });
    b.addEventListener("click", () => openThing(t));
    t.key = b;
    keys.append(b);
  }
  // the keyboard's thing turned toward, within the visitors' limits, if it is not already well on screen
  function glideTo(t) {
    const s = onScreen(pose(cam.yaw, cam.pitch, cam.fov), corners(t.mesh)[4]);
    if (s && Math.abs(s[0]) < 0.7 && Math.abs(s[1]) < 0.7) return;
    const to = frame(t, { x: 0, y: 0, w: 1.2, h: 1.2 });
    cam.tyaw = to.yaw;
    cam.tpitch = to.pitch;
    clamp();
    v.dirty();
  }
  function placeKeys() {
    const P = pose(cam.yaw, cam.pitch, cam.fov);
    for (const t of things) {
      const ss = corners(t.mesh).slice(0, 4).map((p) => onScreen(P, p));
      if (ss.some((s) => !s)) continue;
      const xs = ss.map((s) => ((s[0] + 1) / 2) * view().width),
        ys = ss.map((s) => ((1 - s[1]) / 2) * view().height);
      const l = Math.min(...xs),
        tp = Math.min(...ys);
      Object.assign(t.key.style, {
        left: l + "px",
        top: tp + "px",
        width: Math.max(...xs) - l + "px",
        height: Math.max(...ys) - tp + "px",
      });
    }
  }
  const ordered = () => {
    const P = pose(START.yaw, START.pitch, START.fov);
    return [...things].sort((a, b) => (onScreen(P, corners(a.mesh)[4])?.[0] ?? 0) - (onScreen(P, corners(b.mesh)[4])?.[0] ?? 0));
  };

  /* ONE THING AT A TIME ON A PHONE, a trial behind `?snap=1` from 4 to 7 Nov 2026 (a swipe glided from thing to thing,
     its words on the wall): dropped on his officers' quiz, "I'm dropping swipe mode", with "Free look is better than swipe
     mode but I need to make every word visible and clickable and clear" (Carl, 7 Nov 2026). */
  // the thing and its words, in from the edges (THE WORD FIRST, ON A PHONE turns to take both in)
  const SNAP_BOX = { x: 0, y: 0.04, w: 1.76, h: 1.6 };

  /* ---------- the phone held upright: asked to turn ---------- */
  const turnCard = document.querySelector("#turn");
  boilEdge(turnCard.querySelector("svg"), null, true);
  // no longer asked: an upright phone has its own layout since 2 Nov 2026 (src/stage.mjs upright). The card stays
  // in the page, hidden, in case it is wanted back.
  const phoneLayout = () => (turnCard.hidden = true);
  addEventListener("resize", phoneLayout);
  phoneLayout();

  /* ---------- what studio.mjs hands over ---------- */
  function whenReady() {
    // the order and the masks need every picture and one drawing of the room
    ordered().forEach((t) => keys.append(t.key));
    const t = byHash();
    setPhoneWords(upright()); // a phone held upright reads its own word spots (props.mjs WORD_AT_PHONE)
    introUntil = performance.now() + INTRO_MS;
    phoneRow();
    if (t) openThing(t, { jump: true, push: false });
  }
  /* A ROW OF WORDS ON A PHONE: four officers found the phone's room opening with LISTEN cut to "EN", ABOUT, YOU + ME and
     STUDIOLAND off the screen and nothing saying the room drags. "Open on the console and the row of words" (Carl, 9 Nov
     2026, the officers' fixes quiz). So on a phone held upright the room opens on the console (studio.mjs PHONE.turn) and
     every page's word sits in a row along the bottom of the room, in the room's order left to right, the walls' cream
     and charcoal; a tap opens its page as a tap on its thing does. Gone while a card is open or the camera is flying.
     This is the one label in the room: until then what opens showed only on the thing itself. */
  function phoneRow() {
    const row = el("nav", "phone-row");
    row.setAttribute("aria-label", "Pages");
    for (const t of ordered()) {
      const w = wordsOf(t);
      if (!w || t.link) continue;
      const b = el("button", "", { type: "button", textContent: w, tabIndex: -1 }); // the keyboard has its own buttons
      b.addEventListener("click", () => {
        if (busy() || open) return;
        openThing(t);
      });
      row.append(b);
    }
    document.querySelector("#stage").append(row);
  }
  // for the tests: where a thing's middle is on screen, -1..1
  window.__nav = { glow: () => things.filter((t) => t.hot > 0.05).map((t) => t.id + " " + t.hot.toFixed(2)), busy: () => busy(), ids: Object.fromEntries(things.map((t) => [t.id, t.hash ?? t.id])), at: (x, y) => thingAt(x, y)?.hash ?? thingAt(x, y)?.id ?? null, word: (x, y) => wordThingAt(x, y)?.hash ?? null, zone: (x, y) => zoneAt(x, y)?.hash ?? null, where: (id) => onScreen(pose(cam.yaw, cam.pitch, cam.fov), corners(things.find((t) => t.id === id).mesh)[4]), frame: (id, box) => frame(things.find((t) => t.id === id), box || room()), room, deck: () => deckState(), player: () => PLAYER };
  /* THE WINDOW RESIZED with a page open: the thing is framed again for the new shape, at once. It kept the camera it
     flew to, so the thing drifted off the middle of the room beside the card, and half off a tall window: "if i resize
     the then the focus point of the room is no longer in teh center of the viewing area" (Carl, 2 Nov 2026). */
  function refit() {
    if (!open || flight) return;
    if (open.leaning) {
      const L = leanFor(open);
      if (L) v.lean?.(true, L);
      return;
    }
    set((!upright() && cameraFor(open.hash)) || frame(open));
  }
  /* FOR THE ROOM'S SOUNDS (src/sound.mjs), repeating one moment for Carl on his room sound page: a thing opened and
     closed as a click would, the camera turned onto any decoration, the light under the pointer put on one */
  const meshOf = (id) => props.find((m) => m.userData.prop.id === id);
  const cueing = {
    // no address pushed: the page round the room keeps its own Back, and the repeat closes it straight away
    open: (id) => openThing(things.find((t) => t.id === id), { push: false }),
    close: () => close(),
    look(id) {
      const mesh = meshOf(id);
      if (!mesh || open) return;
      fly(frame({ mesh }, { x: 0, y: 0, w: 0.9, h: 0.9 }), null);
    },
    home: () => !open && fly({ ...START }, null),
    hoverOn(id) {
      const t = things.find((x) => x.id === id) || null;
      if (t === hovered) return;
      hovered = t;
      sayFor(t);
      if (t) cue("hover:" + t.id); // each thing its own: "Can the different items get different hover sounds too?" (Carl, 2 Nov 2026)
      v.dirty();
    },
    isOpen: () => !!open,
    // the portfolio window's own player, while it is open (PLAYER), and its keys pressed as a finger would
    player: () => PLAYER,
    key(name) {
      if (!PLAYER) return;
      pressKey(name);
      if (name === "play") cue("key:play");
      else cue("key:stop");
      PLAYER[name]();
    },
    scrub(k) {
      if (!PLAYER) return;
      cue("knob-drag");
      PLAYER.seek(k);
    },
  };
  return {
    refit,
    busy,
    step,
    whenReady,
    // the words' first showing counted from when the room is in sight: the loading screen lifted, and any opening
    // flyover landed (src/studio.mjs)
    introFrom: () => !introDone && (introUntil = performance.now() + INTRO_MS),
    wordList, // every page's word, for the room to put them all on the walls (ALL THE WORDS)
    // the view editor's picker (viewtune.mjs): open a window by its address, or "opening" for the room with none
    go(hash) {
      if (hash === "opening") return close();
      openThing(things.find((t) => t.hash === hash));
    },
    views: things.filter((t) => t.hash).map((t) => t.hash),
    // the camera's sliders for a view, each [key, label, min, max, step, now] (viewtune.mjs EDIT VIEWS)
    cameraKeys(view) {
      const r = (key, label, min, max, step, now) => [key, label, min, max, step, +(+now).toFixed(4)];
      if (view === "opening") return [r("yaw", "Turn", -1.2, 1.2, 0.001, START.yaw), r("pitch", "Tilt", -0.7, 0.5, 0.001, START.pitch), r("fov", "Zoom", 4, 40, 0.05, START.fov)];
      const t = things.find((x) => x.hash === view);
      if (!t) return [];
      if (t.id === "console") {
        const L = leanAt(view);
        return [r("ox", "Out from wall", -0.5, 2.5, 0.01, L.off[0]), r("oy", "Up", 0, 2, 0.01, L.off[1]), r("oz", "Along wall", -1.5, 1.5, 0.01, L.off[2]), r("ly", "Aim up / down", -1.2, 0.6, 0.01, L.look[1]), r("lz", "Aim along", -1.5, 1.5, 0.01, L.look[2]), r("fov", "Zoom", 20, 70, 0.1, L.fov)];
      }
      const c = cameraFor(view) || frame(t);
      return [r("yaw", "Turn", -1.2, 1.2, 0.001, c.yaw), r("pitch", "Tilt", -0.7, 0.5, 0.001, c.pitch), r("fov", "Zoom", 3, 40, 0.05, c.fov)];
    },
    // lay a view's camera on now, if the room is showing it
    setCamera(view) {
      if (view === "opening") {
        Object.assign(START, cameraFor("opening") || START);
        if (!open) set({ yaw: START.yaw, pitch: START.pitch, fov: START.fov });
        return v.dirty();
      }
      if (!open || open.hash !== view) return;
      if (open.leaning) v.lean?.(true, leanFor(open));
      else set(cameraFor(view) || frame(open));
      v.dirty();
    },
    viewNames: things.filter((t) => t.hash).map((t) => t.name + ": " + t.hash),
    cueing,
    // a mouse over the room, no button held
    hover(x, y) {
      if (busy() || phone() || window.WORDS_EDITOR) return; // the word editor shows the word it is placing
      const t = thingAt(x, y) || wordThingAt(x, y) || zoneAt(x, y);
      if (t) introDone = true; // the first hover: the one under the pointer takes over (ALL THE WORDS)
      if (t !== hovered) {
        hovered = t;
        sayFor(t);
        if (t) cue("hover:" + t.id); // each thing its own: "Can the different items get different hover sounds too?" (Carl, 2 Nov 2026)
        canvas.style.cursor = t ? "pointer" : "";
        v.dirty();
      }
    },
    leave() {
      // a finger lifted leaves too: while a tap holds its words up, they stay
      if (holding) return;
      if (hovered) {
        hovered = null;
        setHoverWords(null);
        canvas.style.cursor = "";
        v.dirty();
      }
    },
    // a click or a tap that did not drag
    tap(x, y) {
      if (busy()) return false;
      const t = thingAt(x, y) || wordThingAt(x, y) || zoneAt(x, y); // a word on the wall opens its page too (ALL THE WORDS), and the zone round both (EACH PAGE ONE ZONE)
      if (!t) return false;
      /* THE WORD FIRST, ON A PHONE: "On phone when I'm moving around in free camera mode, I would love to see the text show
         up for a second before it zooms into place" (Carl, 4 Nov 2026). A finger has no hover, so the words on the wall
         never showed before the flight. So a tap lights the thing and puts its words up for WORD_HOLD_MS, then flies in.
         */
      // a link opens at once: a new tab opened a second after the tap is blocked as a popup
      if (TOUCH && !reduced && !t.link) {
        holding = true;
        hovered = t;
        // its word is already on the wall when every word is up (ALL THE WORDS): not drawn a second time over itself
        const up = allOn && allWordsCorners().find((w) => w.key === keyOfThing(t));
        if (!up) sayFor(t);
        cue("hover:" + t.id);
        v.dirty();
        // the words are where the laptop has them, often off the side of a phone: the view turns to take in the thing
        // and its words first, no wider than a third more than it was, and the card's close comes back to where it was
        const was = { yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov },
          words = up ? up.corners : hoverWordsCorners(),
          P = pose(cam.yaw, cam.pitch, cam.fov),
          seen = words.length && words.every((q) => {
            const s = onScreen(P, q);
            return s && Math.abs(s[0]) < 0.95 && Math.abs(s[1]) < 0.95;
          });
        let turn = 0;
        if (words.length && !seen) {
          const pts = [...corners(t.mesh).slice(0, 4), ...words],
            to = fitAll(pts, was, SNAP_BOX);
          to.fov = Math.min(to.fov, (2 * Math.atan(Math.tan((was.fov * Math.PI) / 360) * 1.35) * 180) / Math.PI);
          turn = TURN_MS;
          fly(to, null, turn);
        }
        setTimeout(() => {
          holding = false;
          openThing(t);
          away = was;
        }, turn + WORD_HOLD_MS);
        return true;
      }
      openThing(t);
      return true;
    },
  };

  /* ---------- the shells: Carl's empty spaces, no words of anyone else's ---------- */
  function stopAudio() {
    // a song playing goes on in the room as the card closes or another opens (NOW PLAYING, below); anything else stops
    const kept = PLAYER?.release?.();
    if (kept) nowPlaying(kept);
    else {
      for (const a of document.querySelectorAll("#win audio")) a.pause();
      PLAYER?.cancel?.();
    }
    PLAYER = null;
    stopFlights();
    // the arm back on its rest and the motor slowing; the record stays on the deck until the panel closes over it
    setDeck({ playing: false, armTo: "rest", dropTo: 0 });
  }
}

const el = (tag, cls, attrs = {}) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, attrs);
// an empty space for Carl's words or pictures; `name` shows faintly to him alone (body.slot-names)
const slot = (name, cls = "") => {
  const s = el("div", "slot " + cls);
  s.dataset.slot = name;
  return s;
};
const SVG = "http://www.w3.org/2000/svg";
function icon(d, cls) {
  const s = document.createElementNS(SVG, "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("aria-hidden", "true");
  s.classList.add(cls);
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("d", d);
  s.append(p);
  return s;
}
const PLAY = "M8 5.5 L19 12 L8 18.5 Z",
  PAUSE = "M7 5 H10.5 V19 H7 Z M13.5 5 H17 V19 H13.5 Z",
  BACK = "M7 6 H9 V18 H7 Z M18 6 V18 L10 12 Z",
  NEXT = "M15 6 H17 V18 H15 Z M6 6 V18 L14 12 Z";

/* ---------- the record between the window and the deck ---------- */
let DECKCAM = null,
  REDUCED = false,
  PLAYER = null; // the portfolio window's play, stop and seek, for the deck's own buttons
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const flights = new Set();
function fly(elm, frames, opts) {
  const a = elm.animate(frames, { fill: "forwards", ...opts });
  flights.add(a);
  return a.finished.catch(() => {}).finally(() => flights.delete(a));
}
function stopFlights() {
  for (const a of flights) a.cancel();
  for (const f of document.querySelectorAll(".flier")) f.remove();
}
// a record as a page element: his drawing, the song's cover on its label (as on the deck: props.mjs labelRecord)
/* NOW PLAYING: "There needs to be some sort of song info/control hud thing so they can stop as needed" (Carl, 7 Nov 2026,
   his officers' quiz, on the song stopping as the player closed). A song playing when its card closes, or when its
   HOLY MOLY button opens the contact card, plays on, and a small card in the room's corner says what it is, with a
   pause and a stop. It goes when the song ends or is stopped, and when the player opens again, which takes the song back
   (THE PLAYER TAKES ITS SONG BACK, below). The song's audio is kept in this card, never left in the closed window, where
   the next close or a Back mid-flight paused it as "anything else" (stopAudio): "it was glitching when i left the
   player page while the audio was still going and i was clicking into other pages" (Carl, 9 Nov 2026). */
let NOW = null;
/* a song asked to play and then paused or changed before it starts says so in the browser's console ("The play()
   request was interrupted"), which is the next song taking over, not a fault (docs/GODZILLA-2026-11-08.md, "Fix it") */
const play = (a) => a.play()?.catch(() => {});
function endNowPlaying() {
  if (!NOW) return;
  NOW.audio.pause();
  NOW.box.remove();
  NOW = null;
}
/* and back and next, a song either way through his four: "should we add forward/back buttons?" (Carl, 8 Nov 2026, the
   words and opening quiz). Back past the first or next past the last wraps round. */
function nowPlaying({ audio, at = 0, title, artist }) {
  endNowPlaying();
  const box = el("div", "now-playing"),
    words = el("div", "np-words"),
    back = el("button", "np-button", { type: "button" }),
    toggle = el("button", "np-button", { type: "button" }),
    next = el("button", "np-button", { type: "button" }),
    stop = el("button", "np-close", { type: "button" });
  const song = el("b", "", { textContent: title }),
    who = el("span", "", { textContent: artist });
  words.append(song, who);
  back.append(icon(BACK, "np-icon"));
  next.append(icon(NEXT, "np-icon"));
  back.setAttribute("aria-label", "Previous song");
  next.setAttribute("aria-label", "Next song");
  const go = (d) => {
    at = (at + d + TRACKS.length) % TRACKS.length;
    audio.src = TRACKS[at];
    audio.currentTime = 0;
    play(audio);
    song.textContent = SONGS[at]?.song || WORDS.portfolio.tracks?.[at] || "";
    who.textContent = SONGS[at]?.artist || "";
    toggle.querySelector(".np-icon").replaceWith(icon(PAUSE, "np-icon")); // its icon only: its drawn circle stays
    name();
    cue("key:play");
  };
  back.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  toggle.append(icon(PAUSE, "np-icon"));
  /* no stop: a small × apart at the end, which stops the song and closes the card, as music players' mini players do
     ("what is a best practices order?", then "yes", Carl, 8 Nov 2026); play/pause, the one pressed most, a little
     bigger in the middle. The cards' own close drawing, at this size. */
  const x = document.createElementNS(SVG, "svg");
  x.setAttribute("viewBox", "0 0 20 20");
  x.setAttribute("aria-hidden", "true");
  x.innerHTML = '<path d="M4.5 4.8 L15.4 15.2 M15.2 4.6 L4.7 15.3" />';
  stop.append(x);
  toggle.classList.add("np-main");
  const name = () => toggle.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
  name();
  stop.setAttribute("aria-label", "Stop and close");
  toggle.addEventListener("click", () => {
    if (audio.paused) play(audio);
    else audio.pause();
    toggle.querySelector(".np-icon").replaceWith(icon(audio.paused ? PLAY : PAUSE, "np-icon"));
    name();
    cue(audio.paused ? "key:stop" : "key:play");
  });
  stop.addEventListener("click", () => (cue("key:stop"), endNowPlaying()));
  audio.addEventListener("ended", endNowPlaying, { once: true });
  box.append(words, back, toggle, next, stop, audio);
  document.querySelector("#stage").append(box);
  drawBox(box);
  for (const b of [back, toggle, next]) drawBox(b, { round: true });
  NOW = { audio, box, at: () => at };
}
// the song NOW PLAYING has, taken off its card without stopping it, for the player opening again
function takeNowPlaying() {
  if (!NOW || NOW.audio.ended) return endNowPlaying(), null;
  const kept = { audio: NOW.audio, at: NOW.at() };
  kept.audio.removeEventListener("ended", endNowPlaying);
  NOW.box.remove();
  NOW = null;
  return kept;
}
function recordEl(cover, cls) {
  const r = el("div", "vinyl " + cls);
  if (cover) {
    const lab = el("div", "vinyl-label");
    lab.style.backgroundImage = `url("${cover}")`;
    r.append(lab);
  }
  return r;
}
/* where the platter's record is on the page: its middle, and how wide and tall it looks from the camera, read off the
   room's own camera (props.mjs deckPoints) */
function deckOnScreen(lift = 0, still = false) {
  const pts = deckPoints(lift, still);
  if (!pts || !DECKCAM) return null;
  DECKCAM.updateMatrixWorld();
  const V = DECKCAM.matrixWorldInverse.elements,
    P = DECKCAM.projectionMatrix.elements,
    b = view(),
    proj = (q) => {
      const c = [0, 1, 2, 3].map((i) => V[i] * q[0] + V[4 + i] * q[1] + V[8 + i] * q[2] + V[12 + i]);
      const k = [0, 1, 3].map((i) => P[i] * c[0] + P[4 + i] * c[1] + P[8 + i] * c[2] + P[12 + i] * c[3]);
      return [b.left + ((k[0] / k[2] + 1) / 2) * b.width, b.top + ((1 - k[1] / k[2]) / 2) * b.height];
    },
    s = pts.slice(0, 5).map(proj),
    xs = s.slice(1).map((q) => q[0]),
    ys = s.slice(1).map((q) => q[1]);
  // and its picture's own two axes on the page (right is the record's +x, down its +z: props.mjs deckPlane lays it so),
  // for a record to land turned and tipped exactly as the deck's lies (takeRecord)
  // (each from both ends of its diameter, and the middle between them, since the near half looks bigger than the far)
  const mid = (k) => (s[1][k] + s[2][k] + s[3][k] + s[4][k]) / 4;
  return { x: s[0][0], y: s[0][1], w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), mx: mid(0), my: mid(1), ex: [(s[1][0] - s[2][0]) / 2, (s[1][1] - s[2][1]) / 2], ey: [(s[3][0] - s[4][0]) / 2, (s[3][1] - s[4][1]) / 2] };
}

// what a screen reader says for each, the company's own name, not the file's ("umg" was read out as a word; his officers'
// quiz, 7 Nov 2026: "Do them all")
const LOGO_NAMES = { netflix: "Netflix", columbia: "Columbia Records", "bbc-one": "BBC One", umg: "Universal Music Group", "bright-antenna": "Bright Antenna Records", "channel-4": "Channel 4", cbs: "CBS", "sony-music": "Sony Music", nfl: "NFL", activision: "Activision", wwe: "WWE", nbc: "NBC", discovery: "Discovery", fox: "Fox" };
const LOGOS = ["netflix", "columbia", "bbc-one", "umg", "bright-antenna", "channel-4", "cbs", "sony-music", "nfl", "activision", "wwe", "nbc", "discovery", "fox"];
const SHELLS = {
  /* THE PORTFOLIO PLAYER. The turntable is in the console's well, his player's drawings (props.mjs THE TURNTABLE IN
     THE WELL), so the window is the sleeves: "the card can just be the sleeves and text etc" (Carl, 2 Nov 2026). It runs
     as his player kit does (src/vinyl-player.js _select), "ok so it's not doing any of the sleeve/ record automations"
     (Carl, 2 Nov 2026): a sleeve's record peeks out under the mouse; picked, it slides out of its sleeve and is carried
     to the platter, the motor comes up to speed as the arm swings over and drops, and then the song plays. Picking
     another, the arm goes home first, then the old record goes back to its sleeve as the new one comes out. */
  player(t, go) {
    const W = WORDS.portfolio;
    /* THE PLAYER TAKES ITS SONG BACK: "when i clicked back into the player, it stopped the audio and reset the player
       instead of having the record still playing visually and sonically" (Carl, 9 Nov 2026). The song NOW PLAYING has
       carries on as the player opens, its record already on the deck, turning, its sleeve empty. It started fresh
       until then, from his officers' quiz of 7 Nov ("Opening the player again starts it fresh"). */
    const kept = takeNowPlaying();
    const box = el("div", "shell player words");
    box.append(said(W.title, "h2"));
    const audio = kept?.audio || el("audio", "", { preload: "metadata" });
    let at = -1, // the song whose record is on, or on its way
      loaded = false, // its record is on the platter
      gen = 0;
    const shelf = el("div", "sleeves");
    const rows = TRACKS.map((src, i) => {
      const b = el("button", "sleeve-pick", { type: "button" });
      // no length under it: "we can remove the times from the page" (Carl, 8 Nov 2026)
      b.addEventListener("click", () => pick(i));
      const stack = el("div", "sleeve-stack");
      const peek = recordEl(COVERS[i], "sleeve-peek");
      const sleeve = slot("sleeve " + (i + 1), "sleeve");
      if (COVERS[i]) (sleeve.classList.add("cover-art"), (sleeve.style.backgroundImage = `url("${COVERS[i]}")`));
      stack.append(peek, sleeve);
      b.append(stack, el("span", "track-name", { textContent: W.tracks[i] || "" }));
      shelf.append(b);
      return b;
    });
    box.append(shelf);
    /* No hint over the sleeves: Homegrown's pointing glove floated over the first one for a day, then "I want to remove
       the glove pointer, it doesn't really fit or work for me visually or UX-wise" (Carl, 9 Nov 2026). */
    /* A SONG THAT DIDN'T LOAD: the student Godzilla officer's third hole: a song tapped as the signal dropped stayed
       silent, a second tap did nothing, and nothing said why. "Fix it: "Ugh, that one didn't load. Tap it to try again.""
       (Carl, 9 Nov 2026, the officers' fixes quiz). The line shows under the sleeves while it can't load, and a tap on
       its sleeve loads it again from the start. */
    const songNote = el("p", "song-note", { hidden: true, textContent: "Ugh, that one didn\u2019t load. Tap it to try again.", role: "status" });
    box.append(songNote);
    const failed = () => !!audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
    audio.addEventListener("error", () => (songNote.hidden = false));
    audio.addEventListener("playing", () => (songNote.hidden = true));
    // the play, stop, what is on and the progress line are on the deck, as on Greg's player (props.mjs drawControls):
    // "Actually now I miss the controls from Greg's", then "1", on the turntable (Carl, 2 Nov 2026)
    // his site's button to Spotify, out to his playlist in a new tab
    // the quiet one beside his contact button, a line and no fill: "Make Spotify the quiet one" (Carl, 7 Nov 2026)
    /* then small underlined words under his contact button, so HOLY MOLY is in view as a song ends: "Spotify as small
       words under HOLY MOLY" (Carl, 9 Nov 2026, the officers' fixes quiz; the delight officer's "the only next step is a
       thin sliver of the yellow button, cut off at the bottom"). It was the full-width button above HOLY MOLY. */
    const more = el("a", "spotify-words", { href: W.moreLink, target: "_blank", rel: "noopener", textContent: W.more });
    more.addEventListener("click", () => cue("click:spotify"));
    // his contact button (WORDS.portfolio.button), then the Spotify words under it
    if (W.button) box.append(actionButton(W.button, go));
    box.append(more, audio);
    const sleeveOf = (i) => rows[i]?.querySelector(".slot.sleeve");
    // a sleeve whose record is on its way home reads as empty until it is in (no record peeking out while it flies)
    const returning = new Set();
    const mark = () => rows.forEach((r, i) => (r.dataset.state = i === at ? (loaded ? "deck" : "out") : returning.has(i) ? "flying" : ""));
    /* ONE RECORD MOVING AT A TIME (the animation sweep, 2 Nov 2026, "Yes fix them"): while a pick is under way (`busy`), a
       second click on the same sleeve does nothing, and a click on another is held (`next`, the latest one) until the
       first record has landed, when it runs as an ordinary switch: that record goes back up the post and home as the
       next comes out. Two records used to fly at once, and the first vanished in mid-air. Closing the window cancels
       it all (PLAYER.cancel), so nothing lands and nothing plays after it has gone. */
    let busy = false,
      next = null;
    async function pick(i) {
      if (busy) {
        if (i !== at) next = i;
        return;
      }
      if (i === at && loaded && failed()) {
        // loaded again from the start (A SONG THAT DIDN'T LOAD)
        songNote.hidden = true;
        audio.src = TRACKS[i];
        audio.load();
        return resume();
      }
      if (i === at && loaded) return audio.paused ? resume() : pause();
      busy = true;
      const g = ++gen;
      const over = () => g !== gen; // cancelled: the window closed, or a new run took over
      audio.pause();
      let leaving = null;
      if (at !== -1 && loaded) {
        // needle up and the motor slowing first, and only once the arm is home does the record move
        const wasPlaying = !audio.ended && audio.currentTime > 0;
        setDeck({ armTo: "rest", playing: false });
        cue("arm-home");
        if (!REDUCED && wasPlaying) await wait(ARM_SWING_MS);
        if (over()) return;
        loaded = false;
        leaving = returnRecord(at);
      }
      at = i;
      mark();
      paint();
      audio.src = TRACKS[i];
      audio.load();
      setDeck({ k: 0 });
      // the new label goes on once the old record has faded, so it never shows on the one going
      const [, flier] = await Promise.all([leaving?.then(() => !over() && setDeck({ label: COVERS[i] || null })) ?? setDeck({ label: COVERS[i] || null }), takeRecord(i)]);
      if (over()) return flier?.remove();
      // it arrives over the post, then is let down it; the page's record goes once the deck's is under it
      setDeck({ on: true, turn: 0, drop: REDUCED ? 0 : DECK_LIFT, dropTo: 0 });
      handOver(flier);
      cue("record-drop");
      if (!REDUCED) await wait(DROP_MS + 100);
      if (over()) return;
      loaded = true;
      wordsIn();
      mark();
      busy = false;
      // another sleeve was picked while this one was on its way: that one now, this one back home
      if (next !== null && next !== at) {
        const j = next;
        next = null;
        return pick(j);
      }
      next = null;
      busy = true;
      // the motor comes up to speed while the arm swings over, then the needle drops, then it plays
      setDeck({ playing: true, armTo: "play" });
      cue("motor-on");
      cue("arm-over");
      if (!REDUCED) await wait(ARM_SWING_MS + 260);
      if (over()) return;
      busy = false;
      if (next !== null && next !== at) {
        const j = next;
        next = null;
        return pick(j);
      }
      next = null;
      cue("needle-down");
      play(audio);
    }
    function pause() {
      audio.pause();
      setDeck({ playing: false });
    }
    function resume() {
      setDeck({ playing: true, armTo: "play" });
      play(audio);
    }
    // the record out of its sleeve and over to the platter
    /* ONE RECORD ALL THE WAY: "is the vinyl image that is used for the sleeve animations loaded separately from the one that
       actually goes on the player? Like it seems to jump/teleport/rotate unexpectedly during its trips" (Carl, 3 Nov 2026).
       It is two: this one, drawn on the page, then the deck's, in the room. They now meet exactly. The page's record is
       steered every frame to where the deck's record lies on screen right then (the camera may still be moving), turned
       and tipped as the deck's lies (`still`: unturned, as a record just put on is), and it stays until the deck's is
       showing, then fades off it. Until then it aimed once, at the start, at a flat oval with its label upright, and
       vanished as it landed: the record jumped when the camera had moved, turned as the deck's took over, and blinked.
       Returns the page's record, for pick() to take away once the deck's is on. */
    async function takeRecord(i) {
      const s = sleeveOf(i);
      if (REDUCED || !s || !deckOnScreen(DECK_LIFT, true)) return null;
      const from = s.getBoundingClientRect(),
        inset = from.width * 0.03,
        size = from.width - 2 * inset,
        peek = rows[i].querySelector(".sleeve-peek"),
        startX = new DOMMatrix(getComputedStyle(peek).transform).e || 0,
        f = recordEl(COVERS[i], "flier");
      Object.assign(f.style, { left: from.left + inset + "px", top: from.top + inset + "px", width: size + "px", height: size + "px", zIndex: 30 });
      document.body.append(f);
      rows[i].dataset.state = "flying";
      cue("record-out");
      const outX = from.width - inset,
        cx = from.left + inset + size / 2,
        cy = from.top + inset + size / 2;
      /* out of its sleeve from BEHIND it, as the peek is: the part still inside the sleeve is cut away as it slides, so it
         never shows in front of the sleeve: "when i click, it immediately teleports in front of the sleeve" (Carl, 3 Nov
         2026). The flier is drawn over the card, so the sleeve could not hide it on its own. */
      const hid = (x) => Math.max(0, Math.min(size, from.width - inset - x));
      await fly(f, [{ transform: `translate(${startX}px,0)`, clipPath: `inset(0 0 0 ${hid(startX)}px)` }, { transform: `translate(${outX}px,0)`, clipPath: `inset(0 0 0 ${hid(outX)}px)` }], { duration: 1000 * Math.max(0.2, (outX - startX) / outX), easing: "cubic-bezier(.22,.75,.28,1)" });
      if (!f.isConnected) return null;
      for (const a of f.getAnimations()) a.cancel();
      Object.assign(f.style, { clipPath: "none", transform: `translate(${outX}px,0)` });
      // then over to the deck, an arc up and down, on the ease the flight had
      const DUR = 1150,
        ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        half = size / 2;
      let last = null;
      await new Promise((done) => {
        const t0 = performance.now();
        const step = (now) => {
          if (!f.isConnected) return done();
          const t = Math.min(1, (now - t0) / DUR),
            e = ease(t),
            to = deckOnScreen(DECK_LIFT, true) || last;
          last = to;
          const M = [to.ex[0] / half, to.ex[1] / half, to.ey[0] / half, to.ey[1] / half, to.mx - cx, to.my - cy],
            S = [1, 0, 0, 1, outX, 0],
            lift = Math.min(60, Math.hypot(M[4] - outX, M[5]) * 0.11) * 4 * e * (1 - e),
            m = S.map((v, k) => v + (M[k] - v) * e);
          m[5] -= lift;
          f.style.transform = `matrix(${m.map((v) => v.toFixed(4)).join(",")})`;
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });
      return f.isConnected ? f : null;
    }
    // the page's record off the deck's, once the deck's is showing under it (ONE RECORD ALL THE WAY)
    function handOver(f) {
      if (!f) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!f.isConnected) return;
          f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).finished.finally(() => f.remove());
        }),
      );
    }
    /* the record off the platter: it fades away where it sits, over FADE_MS, while the next comes out of its sleeve, and
       its own sleeve has it back once it has gone (props.mjs A RECORD FADES AWAY). It flew home until 2 Nov 2026, and
       glitched on the way: "what if the vinyl just fades away over the course of a second or so" (Carl) */
    async function returnRecord(i) {
      returning.add(i);
      mark();
      setDeck({ playing: false, fadeTo: 0 });
      cue("record-fade");
      if (!REDUCED) await wait(FADE_MS);
      setDeck({ on: false }); // gone, even on a slow frame rate, before the next label goes on
      returning.delete(i);
      mark();
    }
    /* THE WORDS WAIT FOR THE RECORD: "can we make the words on the player not show up until the vinyl lands? it can fade
       in?" (Carl, 8 Nov 2026). A song's title and artist are off the deck while its record is on its way, and fade in
       over WORDS_IN_MS once it is down; "Choose a record", with nothing picked, shows as before. */
    const WORDS_IN_MS = 900;
    let wordsA = 1,
      wordsFrom = 0;
    const paint = () => {
      box.classList.toggle("playing", !audio.paused);
      const on = SONGS[at];
      if (at !== -1 && !loaded) wordsA = 0;
      drawControls({ playing: !audio.paused, title: at === -1 ? "Choose a record" : on?.song || W.tracks[at] || "", artist: on?.artist || "", k: audio.duration ? audio.currentTime / audio.duration : 0, textA: at === -1 ? 1 : wordsA });
    };
    const wordsIn = () => {
      wordsFrom = performance.now();
      const g0 = gen;
      const tick = () => {
        if (g0 !== gen && !loaded) return;
        wordsA = REDUCED ? 1 : Math.min(1, (performance.now() - wordsFrom) / WORDS_IN_MS);
        paint();
        if (wordsA < 1) requestAnimationFrame(tick);
      };
      tick();
    };
    // the deck's own buttons (nav's click on the deck, DECK_HIT)
    // a new card: the deck starts empty, whatever the last one left on it
    setDeck({ on: false, playing: false, armTo: "rest", drop: 0, dropTo: 0, k: 0 });
    if (kept) {
      // its song back: on the deck as it was left, the arm on the record, turning unless it was paused
      at = kept.at;
      loaded = true;
      setDeck({ on: true, label: COVERS[at] || null, playing: !audio.paused, armTo: "play", drop: 0, dropTo: 0, k: audio.duration ? audio.currentTime / audio.duration : 0 });
      mark();
    }
    PLAYER = {
      // the window closing on a song that is playing: it is handed on to play in the room (NOW PLAYING), the card's own
      // steps let go of it, so its end no longer reaches for the next record on a deck that has closed
      release: () => {
        if (at === -1 || !loaded || audio.paused) return null;
        gen++;
        busy = false;
        next = null;
        audio.removeEventListener("play", paint);
        audio.removeEventListener("pause", paint);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("timeupdate", onTime);
        const on = SONGS[at];
        return { audio, at, title: on?.song || W.tracks[at] || "", artist: on?.artist || "" };
      },
      // the window closing: every step under way stops where it is, nothing lands, nothing plays
      cancel: () => {
        gen++;
        busy = false;
        next = null;
        audio.pause();
        stopFlights();
        setDeck({ playing: false, armTo: "rest", dropTo: 0 });
      },
      play: () => (at === -1 ? pick(0) : loaded ? (audio.paused ? resume() : pause()) : null),
      // for the room's sounds repeating a moment (src/sound.mjs): a sleeve picked as a tap would, and the songs silent
      pick: (i) => pick(i),
      quiet: (on) => (audio.muted = on),
      stop: () => {
        // nothing to stop until the record is on and playing; mid-pick it is a click like a second one, and waits
        if (busy) return;
        audio.pause();
        if (audio.src) audio.currentTime = 0;
        setDeck({ playing: false, armTo: "rest", k: 0 });
        cue("arm-home");
        paint();
      },
      seek: (k) => {
        if (at === -1) return pick(0);
        if (!audio.duration) return;
        audio.currentTime = k * audio.duration;
        if (audio.paused && loaded) resume();
      },
    };
    paint();
    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);
    const onEnded = () => {
      if (at < TRACKS.length - 1) return pick(at + 1);
      setDeck({ armTo: "rest", playing: false });
      paint();
    };
    const onTime = () => {
      if (audio.duration) setDeck({ k: audio.currentTime / audio.duration });
      paint();
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    return box;
  },
  // THE BIO: a photo, a title and his words
  bio(t, go) {
    const W = WORDS.bio;
    const box = el("div", "shell bio words");
    /* his photo, the one on Homegrown's About page (public/assets/carl-about.webp, copied here so this folder stands
       alone): "i want that for the bio page" (Carl, 2 Nov 2026) */
    const photo = el("div", "bio-photo-box");
    photo.append(el("img", "bio-photo", { src: "assets/people/carl.webp", alt: "Carl Bahner", width: 900, height: 1200 }));
    box.append(said(W.title, "h2"), photo, ...W.text.map((t) => said(t)));
    // and his contact button, as the player, the quotes and Are YOU my people? end: "Add HOLY MOLY to the bio" (Carl, 7 Nov
    // 2026, his officers' quiz)
    if (W.button) box.append(actionButton(W.button, go));
    // then his email and Instagram: "Drop em both, put them at the bottom of the about page" (Carl, 9 Nov 2026)
    box.append(socials());
    return box;
  },
  // THE DRUM'S PAGE: it was to be tour photos, then "maybe the logos are all I need tbh?" (Carl, 2 Nov 2026), so it is
  // the logos alone
  photos() {
    const box = el("div", "shell photos words");
    if (WORDS.tour?.title) box.append(said(WORDS.tour.title, "h2"));
    /* THE LOGOS of who his work has been for, off his site (sent 2 Nov 2026, Archive 17), on the drum's page: "i was
       thinking maybe the logos could be when you click the drum?" (Carl, 2 Nov 2026). In his site's order, down its left
       column then its right. */
    const logos = el("div", "logos");
    for (const n of LOGOS) logos.append(el("img", "", { src: "assets/logos/" + n + ".webp", alt: LOGO_NAMES[n] || n.replace(/-/g, " "), loading: "lazy" }));
    box.append(logos);
    return box;
  },
  // any other window: a title and a space for whatever it holds
  page(t, go) {
    const W = WORDS[t?.hash];
    if (!W) {
      const box = el("div", "shell page");
      box.append(slot("title", "title"), slot("contents", "text"));
      return box;
    }
    const box = el("div", "shell page words");
    if (W.title) box.append(said(W.title, "h2"));
    if (W.sub) box.append(said(W.sub, "h3", "sub"));
    if (W.logos) box.append(logoStrip());
    for (const x of W.text || []) box.append(said(x));
    if (W.list) {
      const ul = el("ul", "stars");
      for (const x of W.list) ul.append(said(x, "li"));
      box.append(ul);
    }
    for (const x of W.after || []) box.append(said(x));
    // another page's words after this one's (the eye painting's carries the co-producer's)
    const N = W.then && WORDS[W.then];
    if (N) {
      if (N.title) box.append(said(N.title, "h2", "next"));
      for (const x of N.text || []) box.append(said(x));
    }
    // each quote with its photo off his site (sent 2 Nov 2026, Archive 17), round as his site has them
    for (const q of W.quotes || []) {
      const f = el("figure", "quote");
      // its photo's outline boils: "can we add the boil to the testimonial images?" (Carl, 3 Nov 2026)
      if (q.photo) {
        const ph = el("div", "quote-photo-box");
        ph.append(el("img", "quote-photo", { src: q.photo, alt: "" }));
        f.append(ph);
      }
      // its opening mark is drawn big in mustard over the words (index.html .quote blockquote::before), its closing one stays
      f.append(el("blockquote", "", { textContent: q.words + "\u201d" }));
      const c = el("figcaption");
      c.append(el("b", "", { textContent: q.name }), el("span", "", { textContent: q.role }));
      f.append(c);
      box.append(f);
    }
    // words still to come from him: an empty space, as the shells had (`blank`)
    if (W.blank) box.append(slot("his words", "text"));
    // its one action, last on the card: to another card, or out to a site (`link`, a new tab)
    if (W.button) box.append(actionButton(W.button, go));
    const out = (L) => el("a", "words-button" + (L.calm ? " calm" : " act"), { href: L.href, target: "_blank", rel: "noopener", textContent: L.words });
    if (W.link) box.append(out(W.link));
    // more on the same card, each its own title, words and way out (the snow globe's StudioLand MGMT)
    for (const M of W.more || []) {
      box.append(said(M.title, "h2", "next"), ...(M.text || []).map((t) => said(t)));
      if (M.link) box.append(out(M.link));
    }
    /* the email and Instagram icons off the form: "Drop em both, put them at the bottom of the about page" (Carl, 9 Nov
       2026, the officers' fixes quiz, of the clutter officer's "the email icon gives them a way around it") */
    if (t.hash === "contact") box.append(contactForm());
    return box;
  },
};

function logoStrip() {
  /* THE LOGOS on the quotes card, above what people said: "Move them to Quotes" (Carl, 9 Nov 2026, the officers' fixes
   quiz: "someone checking who you've worked with opens one window instead of two"). Until then they ran under the bio,
   smaller, as a carousel: "intead of a separate sync page, i think you're
     right... make them smaller to fit under the bio, maybe as a carousel?" (Carl, 3 Nov 2026). Their own page (the
     drum's, then nothing's once the bio took the drum) is gone. The row is drawn twice
     so it runs on without a seam; held still and wrapped for a visitor who asks for less motion. */
  // with no title of their own: "I don't need the cool sync things text, that's unnecessary now" (Carl, 3 Nov 2026)
  const strip = el("div", "logo-strip"),
    run = el("div", "logo-run");
  for (const round of [0, 1])
    for (const n of LOGOS) {
      const img = el("img", "", { src: "assets/logos/" + n + ".webp", alt: round ? "" : LOGO_NAMES[n] || n.replace(/-/g, " ") });
      /* each the same weight to the eye, not the same height: "some look awkwardly small compared to others" (Carl, 3
         Nov 2026). Their pictures are cut to the logo itself, and each gets the same area, so a tall mark is narrow and a
         long wordmark low, the longest held to 200px */
      img.addEventListener("load", () => {
        const ar = img.naturalWidth / img.naturalHeight;
        // and a nudge by eye for the ones whose lines are thin or whose ink is solid
        const h = Math.min(46, 50 / Math.sqrt(ar), 200 / ar) * ({ umg: 1.25, "sony-music": 1.15, discovery: 1.2, fox: 0.85, cbs: 0.9 }[n] || 1);
        img.style.height = h.toFixed(1) + "px";
        img.style.width = (h * ar).toFixed(1) + "px";
      });
      if (round) img.setAttribute("aria-hidden", "true");
      run.append(img);
    }
  strip.append(run);
  return strip;
}
// a card's one action: a mustard button to another card (drawn and boiling in openThing)
function actionButton(B, go) {
  const b = el("button", "words-button act", { type: "button", textContent: B.words });
  b.addEventListener("click", () => go(B.to));
  return b;
}
/* THE FORM off his site, its fields and his subject line. It sends to his Gmail: "Carlbahner@gmail.com" (Carl, 2 Nov
   2026), through FormSubmit (formsubmit.co), since the site has no server of its own. FormSubmit asks the address to
   confirm the very first message, by an email to it. If the post cannot get through (a page that may not reach it),
   the visitor's own email opens with the message written in, to the same address. */
const MAIL_TO = "carlbahner@gmail.com";
/* the thank-you once a message has gone, in the toast at the card's top: "B: HOLY MOLY, it sent!" (Carl, 8 Nov 2026, the
   words and opening quiz, https://claude.ai/artifact/7Pc99ezUfGF7z5GkeSPjYG) */
const THANKS = "HOLY MOLY, it sent! I\u2019ll get back to you about your song soon.";
/* HIS SOCIALS, his own drawings (sent 2 Nov 2026, kept in art/site/socials/), in a row under the form on the dog's page:
   "contact page works" (Carl, 2 Nov 2026). Then "no youtube yet, just the email (yes same address) and my instagram",
   "save youtube for a later date". One with no link yet is left out until it has one. */
const SOCIALS = [
  { name: "Email", icon: "assets/socials/email.webp", href: "mailto:" + MAIL_TO },
  { name: "Instagram", icon: "assets/socials/instagram.webp", href: "https://www.instagram.com/carlbahner" }, // sent 2 Nov 2026
];
function socials() {
  const row = el("div", "socials");
  for (const x of SOCIALS.filter((x) => x.href)) {
    const a = el("a", "", { href: x.href, title: x.name });
    a.setAttribute("aria-label", x.name);
    if (!x.href.startsWith("mailto:")) Object.assign(a, { target: "_blank", rel: "noopener" });
    a.append(el("img", "", { src: x.icon, alt: "", width: 200, height: 200 }));
    a.addEventListener("click", () => cue("click:social"));
    row.append(a);
  }
  return row;
}
// the toast a sent message raises over the top of its card (SENT, SAID WHERE IT IS SEEN): Homegrown's mustard, its line
// drawn, gone after three seconds or on a tap
function sentToast() {
  document.querySelector("#win .toast")?.remove();
  const t = el("div", "toast", { role: "status", textContent: THANKS });
  document.querySelector("#win").append(t);
  drawBox(t);
  requestAnimationFrame(() => t.classList.add("in"));
  const go = () => (t.classList.remove("in"), setTimeout(() => t.remove(), 300));
  t.addEventListener("click", go);
  setTimeout(go, 6000); // long enough to read his line
}
const DRAFT = {}; // what the visitor has typed, until it is sent (A HALF-WRITTEN MESSAGE IS KEPT)
const EMAIL_SAYS = "Almost there! Just need your email so I can reply.";
function contactForm() {
  const f = el("form", "form");
  const field = (label, input) => {
    const l = el("label");
    const box = el("span", "fieldbox");
    box.append(input);
    l.append(el("span", "", { textContent: label }), box);
    return l;
  };
  const row = el("div", "two");
  /* no "(required)" on each and no Name heading over the pair: every field must be filled, so the words told nobody
     anything (Carl, 7 Nov 2026, his officers' quiz: "Drop "(required)" and the heading"). The browser still stops an
     empty one. */
  row.append(field("First Name", el("input", "", { name: "first", required: true, autocomplete: "given-name" })), field("Last Name", el("input", "", { name: "last", required: true, autocomplete: "family-name" })));
  // the news and updates tick is off: "we tan turn off the new and updates box" (Carl, 3 Nov 2026)
  f.append(
    row,
    field("Email", el("input", "", { type: "email", name: "email", required: true, autocomplete: "email" })),
    field("Subject", el("input", "", { name: "subject", required: true, defaultValue: "I want to talk to you about my song" })), // a default, so the form's reset puts it back; his pick of the drafts: "\"I want to talk to you about my song\"" (Carl, 9 Nov 2026, the officers' fixes quiz), for his site's "I need the right mix engineer!"
    field("Message", el("textarea", "", { name: "message", required: true, rows: 5 })),
    el("button", "words-button act", { type: "submit" }),
  );
  const button = f.querySelector("button[type=submit]");
  /* A HALF-WRITTEN MESSAGE IS KEPT: the student Godzilla officer's first hole, found by the delight officer too: closed
     (the X, Escape, Back, a click on the room) and opened again, every box was empty. "Keep it until it's sent" (Carl, 9
     Nov 2026, the officers' fixes quiz). What is typed is kept here, for this visit, and the form opens with it until it
     has gone. */
  for (const [n, v] of Object.entries(DRAFT)) if (f.elements[n]) f.elements[n].value = v;
  f.addEventListener("input", (e) => e.target.name && (DRAFT[e.target.name] = e.target.value));
  /* AN EMAIL YOU CAN'T REPLY TO IS CAUGHT: the officer's second hole: "maya@gmail" and "maya@gmail.con" went straight
     through, and the reply would bounce. "Catch it", in his words for a missed email box: ""Almost there! Just need your
     email so I can reply."" (Carl, 9 Nov 2026). The box asks again when nothing follows the @'s dot, or it ends in one
     of the commonest slips of .com. The other boxes keep the browser's own words. */
  const email = f.elements.email;
  const emailOk = (v) => /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/i.test(v) && !/\.(con|cmo|ocm|vom|xom|cm|comm|om)$/i.test(v);
  email.addEventListener("input", () => email.setCustomValidity(""));
  email.addEventListener("invalid", () => email.setCustomValidity(EMAIL_SAYS));
  // its words in their own span, so changing them leaves its drawn line and fill (drawBox's picture inside it) alone:
  // setting the button's own text wiped them, which is the "button just went flat" (Carl, 3 Nov 2026)
  const label = el("span", "", { textContent: "SUBMIT" });
  button.append(label);
  /* WHAT HAPPENS AFTER SEND: "i filled out the form and hit send but the button just went flat and i didnt get any thank
     you or notification or anything and nothing went to my email" (Carl, 3 Nov 2026). The send now waits for FormSubmit
     to say it took the message (its answer's `success`, not only that it answered: its very first answer is a request
     to confirm the address, which delivers nothing), gives up after 15 seconds, and says which way it went: sent, the
     button says so and the form clears (THANKS, his words, will follow it once he has written them); not sent, a line
     under the button says so, with his address to write to instead, and the button can be pressed again. Until then a
     failed send quietly opened the visitor's own email, which a page shown in a frame (his live link) is not allowed to
     do, so nothing happened at all. */
  const note = el("p", "form-note", { hidden: true });
  f.append(note);
  const say = (bits) => {
    note.textContent = "";
    note.append(...bits);
    note.hidden = false;
  };
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (button.disabled) return;
    /* A BOX OF SPACES IS EMPTY: the chief hole-poker's second hole (docs/GODZILLA-2026-11-08.md; Carl, 8 Nov 2026: "Fix
       it"). The browser counts spaces as filled in, so a name and message of spaces sent, and HOLY MOLY said it had. Now
       they are taken out and the browser's own "fill out this field" comes up, as for an empty box. */
    const blank = [...f.querySelectorAll("[required]")].filter((x) => !x.value.trim());
    if (blank.length) {
      for (const x of blank) x.value = "";
      f.reportValidity();
      return;
    }
    if (!emailOk(email.value.trim())) {
      email.setCustomValidity(EMAIL_SAYS);
      email.reportValidity();
      return;
    }
    const v = Object.fromEntries(new FormData(f));
    const name = `${v.first} ${v.last}`.trim();
    const body = { name, email: v.email, _replyto: v.email, _subject: v.subject, message: v.message, _template: "box", _captcha: "false" };
    button.disabled = true;
    note.hidden = true;
    cue("form-send");
    label.textContent = "SENDING\u2026";
    const stop = new AbortController();
    const late = setTimeout(() => stop.abort(), 15000);
    let answer = null;
    try {
      /* ON HIS OWN SITE, NETLIFY TAKES IT: the site is on Netlify ("i'd rather stay in netlify tbh", Carl, 3 Nov 2026),
         and the first sends through FormSubmit from it did not arrive ("this isn't a test link, that's from the live
         netlify site"). So on carlbahner.com and its netlify.app address the message goes to Netlify's own forms (the
         hidden form in index.html, which Netlify reads when it builds; its Forms page keeps every message and emails
         him one); anywhere else, or if Netlify will not take it (forms not switched on for the site), FormSubmit. */
      let sent = false;
      if (/(^|\.)carlbahner\.(com|netlify\.app)$/.test(location.hostname)) {
        const n = await fetch("/", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ "form-name": "contact", name, email: v.email, subject: v.subject, message: v.message }).toString(), signal: stop.signal }).catch(() => null);
        sent = !!n?.ok;
        if (!sent) console.warn("Netlify did not take the message:", n?.status);
      }
      if (!sent) {
        const r = await fetch("https://formsubmit.co/ajax/" + MAIL_TO, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body), signal: stop.signal });
        answer = await r.json().catch(() => null);
        if (!r.ok || !(answer?.success === true || answer?.success === "true")) throw new Error(answer?.message || "HTTP " + r.status);
      }
      label.textContent = "SENT!";
      f.reset();
      for (const n of Object.keys(DRAFT)) delete DRAFT[n]; // gone, so the next opening starts clean
      /* SENT, SAID WHERE IT IS SEEN: "can we make the "sent" notification a popup or toast? it stays at the bottom of the
         page and actually gets automatically scrolled below the fold" (Carl, 3 Nov 2026). A toast at the top of the card,
         over whatever is scrolled there, for a few seconds; the button keeps saying SENT! below */
      sentToast();
    } catch (err) {
      console.warn("the contact form did not send:", err?.message || err, answer);
      label.textContent = "SUBMIT";
      button.disabled = false;
      // "Use the draft" (Carl, 8 Nov 2026, the words and opening quiz)
      say(["Ugh, that didn\u2019t send. Try again, or email me straight at ", el("a", "", { href: "mailto:" + MAIL_TO, textContent: MAIL_TO }), "."]);
      note.scrollIntoView({ block: "nearest", behavior: "smooth" }); // in sight, not under the fold
    } finally {
      clearTimeout(late);
    }
  });
  return f;
}

/* A BOX DRAWN AS HOMEGROWN DRAWS ONE (src/components/Wobble.tsx and app.css .wobble, copied): its line is Homegrown's
   wobblePath round the box, 2px, wandering 0.7px, its corner an eighth of its height up to 12 (round: half), still on
   its middle drawing; `live` boils it through three drawings shown 0,1,2,1 every 130 ms, the middle one held under
   reduced motion. Homegrown boils the action, not the card ("ON HOMEGROWN'S QUEUE PAGES THE ACTION BUTTON BOILS, NOT
   THE CARD", Wobble.tsx), so a window is still and its one action boils. Fill and line are the host's --fill and --line. */
let boxSeed = 0;
const boilers = new Set();
let boilAt = 1;
const stillMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function boilTick(now) {
  requestAnimationFrame(boilTick);
  const f = stillMotion ? 1 : BOIL_ORDER[Math.floor(now / BOIL_MS) % 4];
  if (f === boilAt) return;
  boilAt = f;
  for (const paint of boilers) paint();
}
requestAnimationFrame(boilTick);
export function drawBox(host, { live = false, round = false, front = false, corner = null } = {}) {
  if (!host) return;
  const svg = document.createElementNS(SVG, "svg");
  svg.classList.add("wob");
  if (front) svg.classList.add("front");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG, "path");
  svg.append(path);
  if (front) host.append(svg);
  else host.prepend(svg);
  const seed = 7 + ((boxSeed++ * 97) % 1000);
  let ds = [];
  const paint = () => {
    if (!svg.isConnected && ds.length) return boilers.delete(paint);
    path.setAttribute("d", ds[live ? boilAt : 1] || "");
  };
  const fit = () => {
    const w = host.offsetWidth,
      h = host.offsetHeight;
    if (!w || !h) return;
    const r = corner ? corner(w, h) : round ? h / 2 : Math.min(12, h * 0.125);
    host.style.borderRadius = r + "px";
    ds = [0, 1, 2].map((i) => wobblePath(w, h, r, seed + i * 131, 0.7));
    svg.setAttribute("viewBox", `-6 -6 ${w + 12} ${h + 12}`);
    paint();
  };
  new ResizeObserver(fit).observe(host);
  if (live) boilers.add(paint);
}

/* A BOILED EDGE round a box: four wobbled lines (the apps' own wobbleLine), three drawings of them shown
   0,1,2,1 every 130 ms, the middle one held under reduced motion. `own`: an SVG that draws its own lines
   (the turn-your-phone card). */
function boilEdge(svg, box, own = false) {
  if (!svg) return;
  if (own) {
    // a drawing that carries its own lines (the turn-your-phone card): its three drawings are the same
    // lines nudged, shown in the boil's order
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let f = -1;
    const go = (now) => {
      requestAnimationFrame(go);
      const k = still ? 1 : BOIL_ORDER[Math.floor(now / BOIL_MS) % 4];
      if (k === f) return;
      f = k;
      for (const [i, p] of [...svg.querySelectorAll("[data-boil]")].entries())
        p.setAttribute("transform", `translate(${[0, 0.5, -0.4][(k + i) % 3]} ${[0, -0.4, 0.5][(k + i) % 3]})`);
    };
    requestAnimationFrame(go);
    return;
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let f = -1,
    w = 0,
    h = 0;
  const path = document.createElementNS(SVG, "path");
  svg.append(path);
  const draw = () => {
    const r = Math.min(12, h / 8); // an eighth of its height, up to 12: the apps' corners
    const side = (len, seed) => wobbleLine(len - 2 * r, seed, 1.1, 1, 8);
    const seeds = [3, 11, 19][f];
    // each side a wobbled line, turned into place; the corners quarter circles
    const parts = [
      [`translate(${r} 1.5)`, side(w, seeds)],
      [`translate(${w - 1.5} ${r}) rotate(90)`, side(h, seeds + 1)],
      [`translate(${w - r} ${h - 1.5}) rotate(180)`, side(w, seeds + 2)],
      [`translate(1.5 ${h - r}) rotate(270)`, side(h, seeds + 3)],
    ];
    svg.textContent = "";
    for (const [tf, d] of parts) {
      const p = document.createElementNS(SVG, "path");
      p.setAttribute("d", d);
      p.setAttribute("transform", tf);
      svg.append(p);
    }
    const c = document.createElementNS(SVG, "path");
    c.setAttribute(
      "d",
      `M1.5 ${r} A${r - 1.5} ${r - 1.5} 0 0 1 ${r} 1.5 M${w - r} 1.5 A${r - 1.5} ${r - 1.5} 0 0 1 ${w - 1.5} ${r} M${w - 1.5} ${h - r} A${r - 1.5} ${r - 1.5} 0 0 1 ${w - r} ${h - 1.5} M${r} ${h - 1.5} A${r - 1.5} ${r - 1.5} 0 0 1 1.5 ${h - r}`,
    );
    svg.append(c);
  };
  const go = (now) => {
    requestAnimationFrame(go);
    if (box.hidden) return;
    const k = still ? 1 : BOIL_ORDER[Math.floor(now / BOIL_MS) % 4],
      W = box.offsetWidth,
      H = box.offsetHeight;
    if (k === f && W === w && H === h) return;
    f = k;
    w = W;
    h = H;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    draw();
  };
  requestAnimationFrame(go);
}
