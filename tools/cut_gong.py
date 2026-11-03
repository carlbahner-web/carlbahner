#!/usr/bin/env python3
"""Cuts Carl's second gong (art/gong-source.png, sent 5 Oct 2026, in place of the first one, which had
dashes on its rim) into two pieces on one canvas: the disc, and the strings with the knob they hang
from. "I would like to add thickness/depth to the gong itself. So my thought is, we would separate the
strings from the gong itself, the strings would then attach the two points in the middle of the depth
at the top of the gong, and the top point where it hangs on the screw would be attached flush to the
wall, so it would slightly an angle out, depending on how thick the gong becomes." The disc is what
is inside its outline's ellipse (DISC, read off the drawing); everything else is the strings. Keyed as
cut_art.py keys. Prints the shares of the canvas the room needs: the disc's ellipse, the screw, and
where the strings meet the rim.
Run from the repo root: python3 studio/tools/cut_gong.py"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art', 'gong-source.png')
OUT = os.path.join(HERE, '..', 'assets', 'gong-{}.webp')
NEAR, FAR = 40, 110
DISC = (620.5, 734.5, 408.5, 403.5)  # centre x, y and radii of the outline's outer edge, px
GROW = 6                              # px past it, so the outline's soft edge stays with the disc
OUTLINE = 11, (30, 29, 25)            # the outline's width, px, and its colour, off the drawing
# where the rope's loops sit on the rim: there a rope-coloured pixel inside the outline's edge is painted
# as outline, and outside it goes to the strings, so no piece of a loop is left on the disc
LOOPS = lambda x, y: any((x - lx) ** 2 + (y - ly) ** 2 < 62 ** 2 for lx, ly in ((395, 365), (828, 358)))
SCREW = (625, 90)                     # the knob's middle, flush on the wall
TIES = 380                            # how far down the strings meet the rim, px

im = Image.open(SRC).convert('RGB')
W, H = im.size
bg = tuple(sum(im.getpixel(p)[i] for p in [(2, 2), (W - 3, 2), (2, H - 3)]) / 3 for i in range(3))
pieces = [Image.new('RGBA', (W, H)) for _ in range(2)]  # 0 the disc, 1 the strings
src = im.load()
dst = [p.load() for p in pieces]
cx, cy, rx, ry = DISC
for y in range(H):
    for x in range(W):
        c = src[x, y]
        d = sum((c[i] - bg[i]) ** 2 for i in range(3)) ** 0.5
        a = min(1.0, max(0.0, (d - NEAR) / (FAR - NEAR)))
        if a <= 0:
            continue
        rgb = tuple(int(max(0, min(255, (c[i] - (1 - a) * bg[i]) / a))) for i in range(3))
        e = (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2) ** 0.5 * (rx + ry) / 2 - (rx + ry) / 2  # px past the edge
        if LOOPS(x, y):
            rope = rgb[0] > 150 and rgb[2] > 80
            if e <= 0:
                dst[0][x, y] = (*OUTLINE[1], 255) if rope else (*rgb, int(a * 255))
            elif e > 4 or rope:
                dst[1][x, y] = (*rgb, int(a * 255))
            # (the disc outline's soft outer edge under a loop is dropped: it would float on the rim's top)
        else:
            dst[0 if e <= GROW else 1][x, y] = (*rgb, int(a * 255))
box = None
for p in pieces:
    b = p.getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
box = (box[0] - 4, box[1] - 4, box[2] + 4, box[3] + 4)
for i, p in enumerate(pieces):
    p.crop(box).save(OUT.format(('disc', 'strings')[i]), 'WEBP', quality=90, method=6)
bw, bh = box[2] - box[0], box[3] - box[1]
u = lambda x: round((x - box[0]) / bw, 4)
v = lambda y: round((y - box[1]) / bh, 4)
print('canvas', (bw, bh))
print('disc', [u(cx), v(cy), round(rx / bw, 4), round(ry / bh, 4)])
print('screw', [u(SCREW[0]), v(SCREW[1])], 'ties', v(TIES))
