#!/usr/bin/env python3
"""Cuts Carl's dog (art/dog-source.png, sent 5 Oct 2026) out of its blue, without the book it sits on:
"tbh I'm not sure how this is gonna work or if we need to make a book as a separate layer?" The book is
drawn at an angle, so as a flat cut-out it would swivel as the chair did; it is built in the room as a box
instead (BOOK in src/props.mjs), and the dog sits on it. Keyed as cut_art.py keys; then inside the book's
outline (BOOK, read off the drawing) only the dog is kept: its creams (pale, little colour), its oranges
(redder than the book's tan) and the outline within a few px of them. The book's page end (PAGES) goes
whole. Needs numpy and scipy. Run from the repo root: python3 studio/tools/cut_dog.py"""
import colorsys
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art', 'dog-source.png')
OUT = os.path.join(HERE, '..', 'assets', 'dog.webp')
NEAR, FAR, PAD = 40, 110, 6
BOOK = [(352, 790), (550, 680), (1165, 770), (1152, 1000), (985, 1062), (352, 930)]
PAGES = [(985, 922), (1150, 792), (1152, 1000), (985, 1062)]

im = Image.open(SRC).convert('RGB')
W, H = im.size
c = np.asarray(im).astype(float)
bg = np.mean([c[2, 2], c[2, W - 3], c[H - 3, 2]], axis=0)
d = np.linalg.norm(c - bg, axis=2)
a = np.clip((d - NEAR) / (FAR - NEAR), 0, 1)
rgb = np.clip((c - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3), 0, 255)
poly = lambda pts: np.asarray((lambda m: (ImageDraw.Draw(m).polygon(pts, fill=1), m)[1])(Image.new('L', (W, H), 0))).astype(bool)
book, pages = poly(BOOK), poly(PAGES)
n = rgb / 255
mx, mn = n.max(2), n.min(2)
sat = (mx - mn) / np.maximum(mx, 1e-3)
hue = np.vectorize(lambda r, g, b: colorsys.rgb_to_hsv(r, g, b)[0])(n[..., 0], n[..., 1], n[..., 2]) * 360
cream = (mx > .93) & (sat < .45)
orange = (hue < 36) & (sat > .45) & (mx > .3)
dog = (cream | orange) & (a > .5)
# outline near the dog, with enough dog round it: the book's own lines run off along the book with little
near = ndimage.binary_dilation(dog, iterations=7) & (ndimage.uniform_filter(dog.astype(float), 21) > .2)
dark = mx < .35
keep = ~book | (dog | (dark & near))
keep &= ~pages
# the dog's own pieces only: whatever is left of the book standing alone in it goes
lab, k = ndimage.label(keep & (a > 0))
sizes = ndimage.sum(np.ones_like(a), lab, range(1, k + 1))
big = 1 + int(np.argmax(sizes))
keep &= lab == big
a = a * keep
out = Image.fromarray(np.dstack([rgb, a * 255]).round().astype(np.uint8), 'RGBA')
b = out.getbbox()
out = out.crop((b[0] - PAD, b[1] - PAD, b[2] + PAD, b[3] + PAD))
out.save(OUT, 'WEBP', quality=90, method=6)
print('wrote', OUT, out.size)
