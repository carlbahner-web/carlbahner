/* The garden's own pieces, copied rather than imported so this folder can leave for its own
   repo in one move (Carl, 5 Oct 2026: "I'd like to put it as a different repo once we have it
   built with the garden/shed js"). Each one says where it came from; when the garden's copy
   changes, this one does not follow on its own. */

// garden/src/shade.mjs hashN
export function hashN(i, seed) {
  const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// garden/src/template.html vnoise
export function vnoise(x, seed) {
  const i = Math.floor(x),
    t = x - i;
  const a = hashN(i, seed),
    b = hashN(i + 1, seed),
    u = (1 - Math.cos(t * Math.PI)) / 2;
  return a + (b - a) * u;
}

// garden/src/template.html vnoise2
export function vnoise2(x, y, seed) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    tx = x - xi,
    ty = y - yi;
  const h = (i, j) => hashN(i * 57 + j * 131 + 7, seed);
  const ux = (1 - Math.cos(tx * Math.PI)) / 2,
    uy = (1 - Math.cos(ty * Math.PI)) / 2;
  const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * ux,
    b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * ux;
  return a + (b - a) * uy;
}

// garden/src/template.html jit, with the phase pinned: a rippled line that holds still
export const jit = (i, seed, amp) => (vnoise(i * 3.7, seed) - 0.5) * 2 * amp;

// garden/src/template.html: the boil clock, 0,1,2,1 at 130 ms, held at 0 under reduced motion
export const BOIL_ORDER = [0, 1, 2, 1];
export const SEEDS = [2, 9, 15];
export const BOIL_MS = 130;
// the garden's 'thirsty' numbers (BOIL_SET), in screen px
export const BOIL = { w: 0.9, r: 12, d: 6, iw: 0.4, ir: 24 };

// garden/src/template.html insideDistance
function insideDistance(data, w, h) {
  const d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = data[i * 4 + 3] < 128 ? 0 : 1e9;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const v = d[k];
      if (!v) continue;
      const l = x > 0 ? d[k - 1] : 0,
        u = y > 0 ? d[k - w] : 0,
        ul = x > 0 && y > 0 ? d[k - w - 1] : 0,
        ur = x < w - 1 && y > 0 ? d[k - w + 1] : 0;
      d[k] = Math.min(v, l + 3, u + 3, ul + 4, ur + 4);
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const k = y * w + x;
      const v = d[k];
      if (!v) continue;
      const r = x < w - 1 ? d[k + 1] : 0,
        b = y < h - 1 ? d[k + w] : 0,
        br = x < w - 1 && y < h - 1 ? d[k + w + 1] : 0,
        bl = x > 0 && y < h - 1 ? d[k + w - 1] : 0;
      d[k] = Math.min(v, r + 3, b + 3, br + 4, bl + 4);
    }
  for (let i = 0; i < w * h; i++) d[i] /= 3;
  return d;
}

/* garden/src/template.html boiledFrame: one phase of a drawing's boil, as a canvas `pad` px
   bigger on every side. `art` is a canvas here rather than a sheet crop; `sc` is screen px per
   art px. */
export function boiledFrame(art, ph, sc) {
  const B = BOIL;
  const amp = B.w / sc,
    wave = B.r / sc,
    iamp = B.iw / sc,
    iwave = B.ir / sc,
    depth = B.d / sc,
    fade = Math.max(B.d * 0.5, 1) / sc;
  const P = Math.ceil(Math.max(amp, iamp)) + 3,
    w = art.width + 2 * P,
    h = art.height + 2 * P;
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sg = src.getContext("2d");
  sg.drawImage(art, P, P);
  const from = sg.getImageData(0, 0, w, h).data;
  const dist = insideDistance(from, w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.pad = P;
  const g = c.getContext("2d"),
    out = g.createImageData(w, h),
    to = out.data;
  const s1 = SEEDS[ph] * 3.1,
    s2 = SEEDS[ph] * 3.1 + 19;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let dx = (vnoise2(x / wave, y / wave, s1) - 0.5) * 2 * amp,
        dy = (vnoise2(x / wave, y / wave, s2) - 0.5) * 2 * amp;
      const t = Math.min(1, Math.max(0, (dist[y * w + x] - depth) / fade)),
        m = 1 - t * t * (3 - 2 * t);
      if (m < 1) {
        dx = dx * m + (vnoise2(x / iwave, y / iwave, s1 + 5) - 0.5) * 2 * iamp * (1 - m);
        dy = dy * m + (vnoise2(x / iwave, y / iwave, s2 + 5) - 0.5) * 2 * iamp * (1 - m);
      }
      const sx = Math.round(x + dx),
        sy = Math.round(y + dy);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      const i = (y * w + x) * 4,
        j = (sy * w + sx) * 4;
      to[i] = from[j];
      to[i + 1] = from[j + 1];
      to[i + 2] = from[j + 2];
      to[i + 3] = from[j + 3];
    }
  g.putImageData(out, 0, 0);
  return c;
}

/* garden/src/template.html inkMask: a tap has to land on ink, grown by one cell so a tap just
   off the edge still counts. */
export const MASK_N = 28;
export function inkMask(art) {
  const c = document.createElement("canvas");
  c.width = MASK_N;
  c.height = MASK_N;
  const g = c.getContext("2d");
  g.drawImage(art, 0, 0, MASK_N, MASK_N);
  const d = g.getImageData(0, 0, MASK_N, MASK_N).data,
    raw = new Uint8Array(MASK_N * MASK_N);
  for (let i = 0; i < raw.length; i++) raw[i] = d[i * 4 + 3] > 36 ? 1 : 0;
  const m = new Uint8Array(MASK_N * MASK_N);
  for (let y = 0; y < MASK_N; y++)
    for (let x = 0; x < MASK_N; x++) {
      let on = 0;
      for (let dy = -1; dy <= 1 && !on; dy++)
        for (let dx = -1; dx <= 1 && !on; dx++) {
          const yy = y + dy,
            xx = x + dx;
          if (yy >= 0 && yy < MASK_N && xx >= 0 && xx < MASK_N && raw[yy * MASK_N + xx]) on = 1;
        }
      m[y * MASK_N + x] = on;
    }
  return m;
}

/* src/lib/wobbleGeometry.ts wobbleLine: the apps' own wobbled line, an open line from (0,0) to
   (w,0) as an SVG path. Three seeds of it, shown in turn, are a boiling line (Wobble.tsx). */
export function wobbleLine(w, seed, amp = 0.7, waves = 1, step = 6) {
  if (!(w > 0)) return "";
  const A = amp * Math.min(1, 0.5 + w / 400);
  let x = (seed * 9301 + 49297) % 233280;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280), x / 233280);
  const bends = [
    [Math.max(1, Math.round(w / (170 * waves))), 0.5],
    [Math.max(2, Math.round(w / (85 * waves))), 0.3],
    [Math.max(3, Math.round(w / (42 * waves))), 0.2],
  ].map(([k, a]) => [k + rnd() * 0.6 - 0.3, a, rnd() * Math.PI * 2]);
  const wander = (s) =>
    bends.reduce((sum, [k, a, p]) => sum + a * Math.sin((2 * Math.PI * k * s) / w + p), 0);
  const n = Math.max(4, Math.round(w / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * w;
    pts.push([s, A * wander(s)]);
  }
  const f = (v) => v.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(i - 1, 0)],
      p1 = pts[i],
      p2 = pts[i + 1],
      p3 = pts[Math.min(i + 2, n)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/* THE BOX'S LINE, copied from Homegrown (src/lib/wobbleGeometry.ts wobblePath, unchanged but for its types), so the
   room's windows and buttons are drawn as Homegrown's cards and buttons are: "you need to look at the css of homegrown
   to do the card design and boiling" (Carl, 1 Nov 2026). */
export function wobblePath(w, h, r, seed, amp = 0.7, tail, fine = 1) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const sw = w - 2 * r; // the straight run of the top/bottom edges
  const sh = h - 2 * r; // ... and the sides
  const q = (Math.PI * r) / 2; // one corner
  const L = 2 * sw + 2 * sh + 4 * q; // all the way round
  if (!(L > 0)) return "";
  // how far the line wanders: small shapes get less, so a chip doesn't look drunk
  const A = amp * Math.min(1, 0.5 + L / 800);

  // Walking clockwise from the top-left corner's end: where are we, and which way is out?
  const at = (s) => {
    let t = ((s % L) + L) % L;
    if (t < sw) return [r + t, 0, 0, -1];
    t -= sw;
    if (t < q) { const a = -Math.PI / 2 + (t / q) * (Math.PI / 2); return [w - r + r * Math.cos(a), r + r * Math.sin(a), Math.cos(a), Math.sin(a)]; }
    t -= q;
    if (t < sh) return [w, r + t, 1, 0];
    t -= sh;
    if (t < q) { const a = (t / q) * (Math.PI / 2); return [w - r + r * Math.cos(a), h - r + r * Math.sin(a), Math.cos(a), Math.sin(a)]; }
    t -= q;
    if (t < sw) return [w - r - t, h, 0, 1];
    t -= sw;
    if (t < q) { const a = Math.PI / 2 + (t / q) * (Math.PI / 2); return [r + r * Math.cos(a), h - r + r * Math.sin(a), Math.cos(a), Math.sin(a)]; }
    t -= q;
    if (t < sh) return [0, h - r - t, -1, 0];
    t -= sh;
    const a = Math.PI + (t / q) * (Math.PI / 2);
    return [r + r * Math.cos(a), r + r * Math.sin(a), Math.cos(a), Math.sin(a)];
  };

  // The wander: three slow sine waves whose wavelengths divide the loop
  // exactly, so the line meets itself without a seam. Long waves read as a
  // hand that drifts; short ones read as a hand that shakes. The seed picks
  // their phases.
  let x = (seed * 9301 + 49297) % 233280;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280), x / 233280);
  /* `fine` divides the wavelength, so it multiplies both the cycle count and
     the floor - raising only the count leaves a small shape pinned to the
     floor, which is the whole failure this exists for. */
  const waves = [
    [Math.max(2 * fine, Math.round((L * fine) / 170)), 0.5],
    [Math.max(3 * fine, Math.round((L * fine) / 85)), 0.3],
    [Math.max(4 * fine, Math.round((L * fine) / 42)), 0.2],
  ].map(([k, a]) => [k + Math.round(rnd() * 2 - 1), a, rnd() * Math.PI * 2]);
  const wander = (s) => waves.reduce((sum, [k, a, p]) => sum + a * Math.sin((2 * Math.PI * k * s) / L + p), 0);

  // Where the tail goes, as a run along the loop: [start, apex, end].
  let tailRun = null;
  if (tail) {
    const tw = tail.w ?? 18, along = tail.at;
    const from = (len) => (along < 0 ? len + along : along);
    let sc;
    if (tail.side === "top") sc = from(w) - r;
    else if (tail.side === "right") sc = sw + q + (from(h) - r);
    else if (tail.side === "bottom") sc = sw + 2 * q + sh + (w - r - from(w));
    else sc = 2 * sw + 3 * q + sh + (h - r - from(h));
    // The loop runs clockwise, so which screen edge comes BEFORE the apex depends on the side:
    // along the top it is the left, down the right side the top, along the bottom the right,
    // up the left side the bottom. A straight edge is a base that sits at the apex's foot.
    const beforeIs = { top: "left", right: "top", bottom: "right", left: "bottom" };
    const before = tail.straight && tail.straight === beforeIs[tail.side] ? 0 : tw / 2;
    const after = tail.straight && tail.straight !== beforeIs[tail.side] ? 0 : tw / 2;
    tailRun = [sc - before, sc, sc + after];
  }

  // Sample the loop every few px, skipping the tail's run, then put the tail
  // in as three sharp points: base, apex, base.
  /* Sampled `fine` times as densely too, or the shorter waves just get drawn
     as a polygon: the 18px circle's 16 points are one every 3.5px, which is
     a 16-gon before anything wanders at all. */
  const n = Math.max(16 * fine, Math.round((L * fine) / 6));
  const pts = [];
  const inTail = (s) => !!tailRun && s > tailRun[0] && s < tailRun[2];
  for (let i = 0; i < n; i++) {
    const s = (i / n) * L;
    if (inTail(s)) continue;
    const [px, py, nx, ny] = at(s), d = A * wander(s);
    pts.push([px + nx * d, py + ny * d, false]);
    if (tailRun && s <= tailRun[0] && (i + 1) / n * L > tailRun[0]) {
      const th = tail.h ?? 12, tip = tail.tip ?? 0;
      const [bx, by] = at(tailRun[0]), [ax, ay, anx, any] = at(tailRun[1]), [ex, ey] = at(tailRun[2]);
      const tx = ax + anx * th, ty = ay + any * th;
      if (tip > 0) {
        // two smooth points just short of the apex, one on each edge, so the curve rounds
        // through the tip instead of meeting at it; the bases stay sharp
        const back = (fx, fy) => { const dx = fx - tx, dy = fy - ty, l = Math.hypot(dx, dy) || 1; return [tx + (dx / l) * tip, ty + (dy / l) * tip, false]; };
        pts.push([bx, by, true], back(bx, by), back(ex, ey), [ex, ey, true]);
      } else pts.push([bx, by, true], [tx, ty, true], [ex, ey, true]);
    }
  }

  // A smooth curve through the points (Catmull-Rom as cubic Beziers); sharp
  // points get no handles, so the tail keeps its point.
  const m = pts.length;
  const f = (v) => v.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

