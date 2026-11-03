#!/usr/bin/env python3
"""Paints the dog with its eyes shut, for its blink: "can we make the dog blink occasionally?" (Carl, 6 Oct 2026).
Each eye (its black, its shine and its pale rim, inside EYES) is painted over in the dark patch round it, and a
charcoal lid drawn across it, curved down like a shut eye. Writes assets/dog-blink.webp beside assets/dog.webp, the
same size, so the room swaps one for the other. Run from the repo root: python3 studio/tools/blink_dog.py"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets', 'dog.webp')
OUT = os.path.join(HERE, '..', 'assets', 'dog-blink.webp')
# each eye: its middle and its radii across and down, px on assets/dog.webp, read off it
EYES = [((141, 129), (23, 23)), ((245, 135), (24, 23))]
PATCH = (50, 40, 30)  # the dark patch round each eye
LID = (19, 19, 17)  # the drawing's outline

dog = Image.open(SRC).convert('RGBA')
px = dog.load()
# the eye's own pixels: inside its oval and not the patch's brown nor the fur's orange (the black, the shine, the rim)
mask = Image.new('L', dog.size, 0)
mp = mask.load()
for (cx, cy), (rx, ry) in EYES:
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1:
                continue
            r, g, b, a = px[x, y]
            dark = r + g + b < 75
            pale = min(r, g, b) > 150 and max(r, g, b) - min(r, g, b) < 70
            if dark or pale:
                mp[x, y] = 255
mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))
# each eye painted in its own patch's brown: the middle of the patch's pixels in a ring round it
shut = Image.new('RGBA', dog.size, (0, 0, 0, 0))
sd = ImageDraw.Draw(shut)
for (cx, cy), (rx, ry) in EYES:
    ring = []
    for y in range(cy - 2 * ry, cy + 2 * ry):
        for x in range(cx - 2 * rx, cx + 2 * rx):
            e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            r, g, b, a = px[x, y]
            if 1.4 < e < 3.5 and 75 <= r + g + b < 200 and r - b < 45:
                ring.append((r, g, b))
    col = tuple(sorted(c[i] for c in ring)[len(ring) // 2] for i in range(3)) if ring else PATCH
    sd.ellipse((cx - rx - 3, cy - ry - 3, cx + rx + 3, cy + ry + 3), fill=col + (255,))
shut.putalpha(Image.composite(mask, Image.new('L', dog.size, 0), shut.split()[3]))
d = ImageDraw.Draw(shut)
for (cx, cy), (rx, ry) in EYES:
    # the lid, a little below the eye's middle, its ends turned up
    d.arc((cx - rx * 0.95, cy - ry * 0.6, cx + rx * 0.95, cy + ry * 0.5), 15, 165, fill=LID + (255,), width=5)
out = dog.copy()
out.alpha_composite(shut)
# only where the dog is: none of it past the drawing's edge
out.putalpha(dog.split()[3])
out.save(OUT, 'WEBP', quality=90, method=6, exact=True)
print('wrote', OUT, out.size)
