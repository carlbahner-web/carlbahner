#!/usr/bin/env python3
"""Cuts Carl's wire world map (art/map-source.png, sent 5 Oct 2026) out of its blue: "This one is going
to be the trickiest one yet, because it is very important to get the key right. This is probably the
most detailed piece in the whole room." Hundreds of thin wires, each mostly edge, with blue in every gap,
so the key cut_art.py uses (how far a pixel is from the blue) leaves blue in the wires' soft edges and
takes the shine out of their pale highlights. This one unmixes each edge pixel instead:

- The blue (BLUE, off the drawing: it is even everywhere) and anything within NEAR of it is clear.
- A pixel CORE px or more from the blue is solid, as drawn, however pale.
- Between, an edge pixel is a mix of the blue and the solid colour nearest it, and its see-through
  share is how far along that line it sits; its colour is the solid one, so no blue is left in it.
- Blue drawn INTO the map - the wires' shine, which reflects the blue they were drawn on, and a spot on
  one island - is not the background and is far from it. It is painted the nearest pale solid colour
  of the wire around it: a pixel that is bluer than it is anything else (BLUISH) and does not sit on
  the line between the blue and the solid colour beside it (off by more than OFF_LINE).
- One blue spot on an island by Japan is mostly the background's own blue, so it would key out as a
  hole; it is filled (FILL, a point in it). Every other small hole is a real sea or gap between the
  land and a wire, and stays open.
- Then specks: any piece standing alone in the blue smaller than SPECK px is dropped.

Needs numpy and scipy. Run from the repo root: python3 studio/tools/cut_map.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art', 'map-source.png')
OUT = os.path.join(HERE, '..', 'assets', 'map.webp')
BLUE = np.array([0.0, 141.0, 253.0])
NEAR = 34      # this close to the blue, a pixel is the blue
CORE = 2.5     # this many px from the blue, a pixel is solid
SPECK = 40     # px: a piece alone in the blue smaller than this is dropped
BLUISH = 25    # blue more than this above red and green
OFF_LINE = 30  # how far off the blue-to-solid line a pixel must be to be drawn blue, not a soft edge
FILL = [(1436, 352)]   # px in the drawing: holes to fill, each a drawn spot, not a sea
PAD = 6

c = np.asarray(Image.open(SRC).convert('RGB')).astype(float)
d = np.linalg.norm(c - BLUE, axis=2)
clear = d < NEAR
far = ndimage.distance_transform_edt(~clear)          # px from the nearest clear pixel
bluish = (c[..., 2] - np.maximum(c[..., 0], c[..., 1]) > BLUISH) & ~clear
core = (far >= CORE) & ~bluish
# the nearest solid pixel to every pixel, and its colour
_, (iy, ix) = ndimage.distance_transform_edt(~core, return_indices=True)
F = c[iy, ix]
FB = F - BLUE
a = np.clip(((c - BLUE) * FB).sum(2) / np.maximum((FB * FB).sum(2), 1.0), 0, 1)
off = np.linalg.norm(c - (BLUE + a[..., None] * FB), axis=2)
drawn = bluish & ((far >= CORE) | (off > OFF_LINE))   # blue drawn into the map, not a soft edge
a[core | (drawn & (far >= CORE))] = 1
a[clear] = 0
# drawn blue takes the nearest pale solid colour (not the outline's black)
pale = core & (c.max(2) > 90)
_, (py, px) = ndimage.distance_transform_edt(~pale, return_indices=True)
rgb = np.where(core[..., None], c, np.where(drawn[..., None], c[py, px], F))
print('repainted', int(drawn.sum()), 'px of drawn blue')
for x, y in FILL:
    lab, _ = ndimage.label(a < 0.5)
    assert lab[y, x], 'FILL point is not in a hole'
    hole = lab == lab[y, x]
    assert hole.sum() < 500, 'FILL point is not in a small hole'
    # the spot and the dark-blue ring round it: anything near it bluer than it is red
    near = ndimage.binary_dilation(hole, iterations=12)
    spot = near & (hole | (c[..., 2] >= c[..., 0] - 10))
    keep = pale & ~near
    _, (qy, qx) = ndimage.distance_transform_edt(~keep, return_indices=True)
    a[spot] = 1
    rgb[spot] = c[qy, qx][spot]
    print("filled", int(spot.sum()), "px at", (x, y))
# specks: pieces of anything alone in the blue, too small to be part of the map
lab, n = ndimage.label(a > 0.05)
sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
small = np.isin(lab, 1 + np.flatnonzero(sizes < SPECK))
a[small] = 0
print('dropped', int((sizes < SPECK).sum()), 'specks of', n, 'pieces')
out = np.dstack([rgb, a * 255]).round().clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
b = img.getbbox()
img = img.crop((max(0, b[0] - PAD), max(0, b[1] - PAD), min(img.width, b[2] + PAD), min(img.height, b[3] + PAD)))
img.save(OUT, 'WEBP', quality=92, method=6)
print('wrote', OUT, img.size)
