/* LIGHT. "Okay! So let's talk about LIGHTING baby!!" (Carl, 5 Oct 2026). Offered painted pools from
   the lamp's shades and the glow on the floor in the corner, then ambient light round them: "That would
   be good, and then we can figure out ambient lighting relative to those others".

   Painted, not lit as 3D: each light is a soft warm wash round a point, brightening whatever it falls
   on (the walls, floor and ceiling, the decorations, their built sides), gone at `size` metres. A
   lamp's light is aimed down, the corner's glow up the walls. Always smooth: banding them into flat
   rings was offered and refused, "Never any steps please" (Carl, 5 Oct 2026). One shader function, `lit`, used by the
   room's surfaces, the decorations and their sides alike, so a picture under the lamp is lit with the
   wall behind it. Its numbers are on his panel (Light), saved in settings/light. */

export const MAX_LIGHTS = 4;

// the lamp (its three shades share these) and the glow in the corner behind the chair
export const LIGHTS = {
  lamp: { strength: 1.35, size: 3.2, warmth: 0.8 }, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  glow: { strength: 5, size: 1.75, warmth: 0.7 }, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  /* AMBIENT: the room's own light, 1 every colour as drawn. The pools cannot show on colours already
     as bright as they go (the cream wall), so the room starts a little dim for them to read against,
     and his Room light slider sets it against them: "then we can figure out ambient lighting relative
     to those others". */
  ambient: 1,
  /* THE SWITCH: "Can you have a light switch to turn off the rest of the lighting? And like a dimmer so
     we can experiment?" (Carl, 5 Oct 2026). Off, the room falls to DARK and only the lamp and the glow
     light it; on, Room light is the dimmer. */
  roomOn: true,
  // the room's lights' colour, 0 a plain white to 1 warm: "can the room lights get warmth controls too"
  roomWarmth: 0.45,
  /* THE BULBS, their own brightness, apart from the lamp's light on the room: "Can you give me separate
     control for the lightbulb brightness vs the rest of the lamp strength? They feel a bit disconnected
     and I want to tweak it" (Carl, 5 Oct 2026). 0 off, 1 full. */
  bulbs: 0.7, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  // how far each bulb's glow spreads, metres across: "can you make the bulb strength give me size control too?"
  bulbSize: 1.2, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  /* THE BULBS' FACES, the inside of each shade, their own colour and brightness apart from the light they throw:
     "when i asked to make the bulbs brighter, you didn't actually do it... like, the color of these sections
     (combined with your light intensity, but a separate control please)" (Carl, 6 Oct 2026). Brightness 0 is
     the shade's inside as drawn, 1 the colour full, 2 burning toward white. */
  bulbColor: "#ffffff", // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
  /* how far above each shade's mouth its light comes from, metres: "the "bulbs" light source position, can we
     raise it to be a little higher in the room? it looks like they happen below the actual bulbs" (Carl, 6 Oct 2026) */
  lampLift: 0.15,
  bulbFace: 2, // his, as saved on his panel 6 Oct 2026, written in when the panel went (1 Nov 2026)
};
export const DARK = 0.15; // the room's own light with the switch off: near dark, not black
// where the corner's glow stands, in metres: on the floor, in the corner, behind the chair
export const GLOW_AT = [0.25, 0.05, 0.25];

// a light's colour for its warmth: 0 a warm white, 1 a deep amber
export function warmColor(w) {
  const a = [1.0, 0.95, 0.85],
    b = [1.0, 0.62, 0.28];
  return a.map((v, i) => v + (b[i] - v) * w);
}

// the uniforms, shared by every material that is lit
export function lightUniforms() {
  return {
    lPos: { value: Array(MAX_LIGHTS * 3).fill(0) },
    lCol: { value: Array(MAX_LIGHTS * 3).fill(0) },
    lPar: { value: Array(MAX_LIGHTS * 4).fill(0) },
    lN: { value: 0 },
    lAmb: { value: [1, 1, 1] }, // the room's own light: its colour times the dimmer
    lBulb: { value: [1, 1, 1, 0] }, // the lamp's bulbs: their colour, and how lit (0 off to 1 full)
    lHalo: { value: 0.9 }, // how far their glow spreads, metres across
    lFace: { value: [1, 0.82, 0.48, 1.2] }, // the bulbs' faces: their colour, and how bright (THE BULBS' FACES)
  };
}
export const pickLight = (shared) => ({
  lPos: shared.lPos,
  lCol: shared.lCol,
  lPar: shared.lPar,
  lN: shared.lN,
  lAmb: shared.lAmb,
  lBulb: shared.lBulb,
  lFace: shared.lFace,
});

/* Writes the lights into the shared uniforms: `lamps`, a point under each shade, and the glow. Each
   light: where, its colour times its strength, its size, which way it aims (1 down, -1 up), and whether
   it is a cone (1, a lamp's: out of the shade's mouth, not sideways) or a wide wash (0). */
export function setLights(shared, lamps) {
  const list = [
    ...lamps.map((at) => [at, LIGHTS.lamp, 1, 1]),
    [GLOW_AT, LIGHTS.glow, -1, 0],
  ].slice(0, MAX_LIGHTS);
  const pos = shared.lPos.value,
    col = shared.lCol.value,
    par = shared.lPar.value;
  list.forEach(([at, L, aim, cone], i) => {
    // the lamp's strength is spread over its shades, so three shades are no brighter than one
    const k = L === LIGHTS.lamp ? L.strength / Math.max(1, lamps.length) * 1.6 : L.strength;
    pos.splice(i * 3, 3, ...at);
    col.splice(i * 3, 3, ...warmColor(L.warmth));
    par.splice(i * 4, 4, k, L.size, aim, cone);
  });
  shared.lN.value = list.length;
  const room = [1, 1, 1].map((v, i) => v + ([1.0, 0.78, 0.52][i] - v) * LIGHTS.roomWarmth);
  shared.lAmb.value = room.map((v) => v * (LIGHTS.roomOn ? LIGHTS.ambient : DARK));
  // the bulbs glow with the lamp's strength: "the lightbulbs in the lamp should get brighter as the
  // strength goes up" (Carl, 5 Oct 2026), then "wayyyyyyy brighter": the mouth near white and a halo
  // round it (props.mjs HALO), full by a strength of 1.5.
  // Since then their own slider (THE BULBS), no longer the lamp's strength.
  shared.lBulb.value = [...warmColor(LIGHTS.lamp.warmth * 0.6), LIGHTS.bulbs];
  shared.lHalo.value = LIGHTS.bulbSize;
  const h = LIGHTS.bulbColor.replace("#", "");
  shared.lFace.value = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(LIGHTS.bulbFace);
}

// the shader function: `c` lit at world point `p`, `k` how much this surface takes light (1 all)
export const LIGHT_GLSL = `
uniform vec3 lPos[${MAX_LIGHTS}]; uniform vec3 lCol[${MAX_LIGHTS}]; uniform vec4 lPar[${MAX_LIGHTS}];
uniform int lN; uniform vec3 lAmb; uniform vec4 lBulb; uniform vec4 lFace;
vec3 lit(vec3 c, vec3 p, float k) {
  vec3 L = vec3(0.0);
  // the face's way, the side the camera sees
  vec3 n = normalize(cross(dFdx(p), dFdy(p)));
  n *= sign(dot(n, cameraPosition - p));
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    if (i >= lN) break;
    vec3 d = p - lPos[i];
    float dist = length(d);
    float f = clamp(1.0 - dist / max(lPar[i].y, .01), 0.0, 1.0);
    /* brightest at the light itself, falling away from it: "the lights need to be emitting from the bulbs,
       right?" (Carl, 6 Oct 2026). Eased in, as it was, a pool stayed full a long way out and its brightest
       showed well below the shades. */
    f = mix(f * f * (3.0 - 2.0 * f), f * f, lPar[i].w);
    // aimed: the wash fades away from straight below (or above) the light; a cone's (a lamp shade's
    // mouth) is gone level with it: "the light from the lamp looks like it's coming from the wall behind
    // the lamp not the light" (Carl, 5 Oct 2026)
    float aim = lPar[i].z, toward = -d.y * sign(aim) / max(dist, .001);
    // the cone opens from just above level, so the wall beside a shade's mouth is lit from it too
    f *= mix(1.0, mix(smoothstep(-.5, .6, toward), smoothstep(-.35, .75, toward), lPar[i].w), abs(aim));
    // only a face turned to the light takes it: "the light behind the chair should NOT make the chair
    // brighter" (Carl, 5 Oct 2026)
    f *= smoothstep(-.05, .3, dot(n, -d / max(dist, .001)));
    L += lCol[i] * lPar[i].x * f;
  }
  /* The room's light (the dimmer) and the lights we place, each its own: "the dimmer should only be
     for the ambient room lights not the ones we specifically control" (Carl, 5 Oct 2026). A light fills
     what the room's light leaves, softly and never past full, so a pool reads as the same warm wash
     however far the room is dimmed. It was added straight on top, and in a dim room the cream wall
     went white and the floor a hot orange: "The dimmer makes the lamp and floor light look super
     intense" (Carl, 5 Oct 2026). */
  // the light's own colour, carried by the surface's: a dark teal still takes a warm wash. Too faint
  // as first made, scaled by the surface's colour alone: "Max strength for the floor light and lamp are
  // still way too dim for me to be able to use them" (Carl, 5 Oct 2026)
  vec3 room = min(c * lAmb, vec3(1.0));
  // how much light, and its colour kept apart, so a strong light stays its warmth and never goes white
  float amount = max(L.r, max(L.g, L.b));
  vec3 hue = L / max(amount, .001);
  vec3 tint = mix(c, vec3(1.0), .2) * hue;
  vec3 shown = room + (vec3(1.0) - room) * (1.0 - exp(-amount * 1.4)) * tint;
  // k 0 is something that holds its own light (a lamp's shade): as drawn, whatever the room's light
  return mix(c, shown, k);
}
`;
