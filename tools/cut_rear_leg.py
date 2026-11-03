#!/usr/bin/env python3
"""Cuts the console's rear leg out of Carl's drawing (art/console-source.png), the one leg drawn behind
the others at its back left, into assets/console-rear-leg.webp: "You can see the rear legs in the one I
sent you just need to clean up your image and crop and key" (Carl, 5 Oct 2026). Kept inside a polygon
read off the drawing by eye (its top is the side panel's bottom line), the blue keyed out as cut_art.py
keys it. Run from the repo root: python3 studio/tools/cut_rear_leg.py"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art', 'console-source.png')
OUT = os.path.join(HERE, '..', 'assets', 'console-rear-leg.webp')
POLY = [(72, 679), (147, 756), (145, 802), (92, 802), (70, 784)]
NEAR, FAR = 40, 110

im = Image.open(SRC).convert('RGB')
bg = tuple(sum(im.getpixel(p)[i] for p in [(2, 2), (im.width - 3, 2)]) / 2 for i in range(3))
inside = Image.new('L', im.size, 0)
ImageDraw.Draw(inside).polygon(POLY, fill=255)
box = (min(p[0] for p in POLY), min(p[1] for p in POLY), max(p[0] for p in POLY), max(p[1] for p in POLY))
out = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]))
src, dst, ins = im.load(), out.load(), inside.load()
for y in range(box[1], box[3]):
    for x in range(box[0], box[2]):
        if not ins[x, y]:
            continue
        c = src[x, y]
        d = sum((c[i] - bg[i]) ** 2 for i in range(3)) ** 0.5
        a = min(1.0, max(0.0, (d - NEAR) / (FAR - NEAR)))
        if a <= 0:
            continue
        rgb = tuple(int(max(0, min(255, (c[i] - (1 - a) * bg[i]) / a))) for i in range(3))
        dst[x - box[0], y - box[1]] = (*rgb, int(a * 255))
out = out.crop(out.getbbox())
out.save(OUT, 'WEBP', quality=90, method=6)
print('wrote', OUT, out.size)
