#!/usr/bin/env python3
"""Cuts the candle and its flames, and the clock and its hands (Carl's drawings, sent 6 Oct 2026: "Here's a
candle with flame to animate at 8fps, and a clock to sync with eastern time"). Keyed off their blue as
cut_art.py keys. Run from the repo root: python3 studio/tools/cut_bits.py

- assets/candle.webp, cropped to it, and where its wick's tip is (a share of the canvas) for the flame.
- assets/flame-0..4.webp, the five flames, each on one canvas the same size, bottom middle at the same
  place, so the room can show them in turn.
- assets/clock-face.webp, square, the face's middle in the middle.
- assets/clock-hour/minute/second.webp, each on a canvas the same size as the face, its pivot in the middle
  and pointing at twelve, so the room lays it on the face and turns it about its middle. The hands are
  drawn without a face, so their size against it is a guess: the minute hand reaching most of the way to
  the ticks (MINUTE)."""
import math
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, '..', 'art', '{}-source.png')
OUT = os.path.join(HERE, '..', 'assets', '{}.webp')
NEAR, FAR = 40, 110
MINUTE = 0.8  # the minute hand's length, a share of the face's inner radius


def key(name):
    im = Image.open(ART.format(name)).convert('RGB')
    w, h = im.size
    corners = [im.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
    bg = tuple(sum(c[i] for c in corners) / 4 for i in range(3))
    out = Image.new('RGBA', (w, h))
    s, d = im.load(), out.load()
    for y in range(h):
        for x in range(w):
            c = s[x, y]
            dist = sum((c[i] - bg[i]) ** 2 for i in range(3)) ** 0.5
            a = min(1.0, max(0.0, (dist - NEAR) / (FAR - NEAR)))
            if a > 0:
                d[x, y] = tuple(int(max(0, min(255, (c[i] - (1 - a) * bg[i]) / a))) for i in range(3)) + (int(a * 255),)
    return out


def save(im, name):
    im.save(OUT.format(name), 'WEBP', quality=90, method=6, exact=True)


def pad(box, n, size):
    return (max(0, box[0] - n), max(0, box[1] - n), min(size[0], box[2] + n), min(size[1], box[3] + n))


# the candle, and its wick's tip: the topmost wick-coloured pixel near the middle
c = key('candle')
box = pad(c.getbbox(), 6, c.size)
src = Image.open(ART.format('candle')).convert('RGB')
tips = [(x, y) for y in range(150, 400) for x in range(560, 690)
        if (lambda p: p[0] > 200 and 150 < p[1] < 225 and p[2] < 150)(src.getpixel((x, y)))]
wx = sum(t[0] for t in tips) / len(tips)
wy = min(t[1] for t in tips)
cc = c.crop(box)
save(cc, 'candle')
print('candle', cc.size, 'wick at', [round((wx - box[0]) / cc.size[0], 4), round(1 - (wy - box[1]) / cc.size[1], 4)])

# the flames, split where the columns between them are empty
f = key('flames')
W, H = f.size
A = f.split()[3].load()
cols = [any(A[x, y] > 20 for y in range(H)) for x in range(W)]
runs, x = [], 0
while x < W:
    if cols[x]:
        x0 = x
        while x < W and cols[x]:
            x += 1
        runs.append((x0, x))
    x += 1
runs = [r for r in runs if r[1] - r[0] > 40]
assert len(runs) == 5, runs
pieces = []
for a, b in runs:
    col = f.crop((a, 0, b, H))
    pieces.append(col.crop(col.getbbox()))
fw = max(p.size[0] for p in pieces) + 8
fh = max(p.size[1] for p in pieces) + 8
for i, p in enumerate(pieces):
    canvas = Image.new('RGBA', (fw, fh))
    canvas.paste(p, ((fw - p.size[0]) // 2, fh - 4 - p.size[1]))
    save(canvas, 'flame-%d' % i)
print('flames', (fw, fh))

# the clock's face, square about its middle
face = key('clock')
b = face.getbbox()
cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
outer = max(b[2] - b[0], b[3] - b[1]) / 2
R = outer + 6
S = int(2 * R)
fb = (int(cx - R), int(cy - R), int(cx - R) + S, int(cy - R) + S)
# the inner radius: from the middle out to where the rim's black starts, half way between two ticks
fs = Image.open(ART.format('clock')).convert('RGB')
r, t = 0, math.radians(15)
while sum(fs.getpixel((int(cx + r * math.sin(t)), int(cy - r * math.cos(t))))) > 200:
    r += 1
inner = r
# THE RIM IN WOOD: its thick black band painted the bass drum's shell, a thin black line kept along each edge as
# every drawing has: "Can we make the outline of the clock the wood color is the kick drum instead of black?"
# (Carl, 6 Oct 2026)
WOOD, EDGE = (0xaa, 0x52, 0x25), 14
px = face.load()
for y in range(b[1], b[3]):
    for x in range(b[0], b[2]):
        d = math.hypot(x - cx, y - cy)
        if inner + EDGE < d < outer - EDGE and px[x, y][3] > 0:
            px[x, y] = WOOD + (px[x, y][3],)
save(face.crop(fb), 'clock-face')
print('clock face', S, 'inner radius', round(inner / S, 4))

# the hands: each its own third of the drawing, its pivot the middle of the dot at its hub
hands = key('clock-hands')
hs = Image.open(ART.format('clock-hands')).convert('RGB')
W, H = hands.size
found = {}
for name, x0, x1, dot in [
    ('hour', 0, W // 3, lambda p: p[2] > 90 and p[2] - p[0] > 60 and p[1] < 120),
    ('minute', W // 3, 2 * W // 3, lambda p: p[2] > 90 and p[2] - p[0] > 60 and p[1] < 120),
    ('second', 2 * W // 3, W, lambda p: p[0] > 220 and p[1] > 200 and p[2] > 180),
]:
    part = hands.crop((x0, 0, x1, H))
    al = part.split()[3].load()
    # the pivot is the middle of the round hub: the point inside the hand furthest from its edge (the hub is its
    # widest part). It was the middle of the hub's coloured dot, which is drawn a little off the ring's middle, and
    # the hubs swung round as the hands turned: "i think the clock hands got messed up again" (Carl, 6 Oct 2026)
    import numpy as np
    from scipy import ndimage
    solid = ndimage.binary_fill_holes(np.array(part.split()[3]) > 128)
    dist = ndimage.distance_transform_edt(solid)
    py, px = np.unravel_index(np.argmax(dist), dist.shape)
    py, px = float(py), float(px)
    far = max(((x, y) for y in range(H) for x in range(x1 - x0) if al[x, y] > 128),
              key=lambda q: (q[0] - px) ** 2 + (q[1] - py) ** 2)
    found[name] = (part, px, py, far)
# THE HANDS IN THE ROOM'S COLOURS: charcoal, mustard and wood, not the cream, blue and red they were drawn in:
# "Then we need to recolor it to be charcoal mustard and wood" (Carl, 6 Oct 2026). The hour and minute hands
# charcoal, the second hand the drum's wood, the dots at their hubs mustard.
CHARCOAL, MUSTARD = (0x2c, 0x2c, 0x2a), (0xf0, 0xaf, 0x1b)
for name, (part, *_rest) in found.items():
    q = part.load()
    for y in range(part.size[1]):
        for x in range(part.size[0]):
            r_, g_, b_, a_ = q[x, y]
            if a_ == 0:
                continue
            if b_ > 90 and b_ - r_ > 60 and g_ < 120:  # blue: a hub's dot
                q[x, y] = MUSTARD + (a_,)
            elif r_ > 150 and r_ - g_ > 60:  # red: the second hand
                q[x, y] = WOOD + (a_,)
            elif min(r_, g_, b_) > 150:  # cream: a hand, or the second hand's dot
                q[x, y] = (MUSTARD if name == 'second' else CHARCOAL) + (a_,)
mp, mx, my, mf = found['minute']
k = MINUTE * inner / math.hypot(mf[0] - mx, mf[1] - my)
for name, (part, px, py, far) in found.items():
    sp = part.resize((round(part.size[0] * k), round(part.size[1] * k)), Image.LANCZOS)
    canvas = Image.new('RGBA', (S, S))
    canvas.paste(sp, (round(S / 2 - px * k), round(S / 2 - py * k)))
    turn = math.degrees(math.atan2(far[0] - px, -(far[1] - py)))
    save(canvas.rotate(turn, resample=Image.BICUBIC, center=(S / 2, S / 2)), 'clock-' + name)
    print(name, 'length', round(math.hypot(far[0] - px, far[1] - py) * k / S, 4), 'turned', round(turn, 1))
