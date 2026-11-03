#!/usr/bin/env python3
"""Flips the bass drum's cut-out (assets/drum.webp, from cut_art.py) left to right, all but its "CC" logo,
which is put back the right way round: "The drum needs flipped, I forgot to mention" (Carl, 5 Oct 2026);
the room's own Flip mirrored the letters too. It goes where it sat on the drawn head, at about ten
o'clock, not where the flip carries it: "The cc logo should be on the other side at that 10 o'clock Ish
position that it was in the original head". LOGO is the logo's box and HEAD the head's middle on the
unflipped cut-out, px; the logo keeps its place left of the head's middle. BLANK is a stretch of plain
head the same size, on the flipped picture, laid over where the flip put the logo. Run from the repo root after cut_art.py drum: python3 studio/tools/flip_drum.py"""
import os
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, '..', 'assets', 'drum.webp')
LOGO = (415, 210, 540, 365)
HEAD = 627.5
BLANK_DOWN = 170

im = Image.open(PATH).convert('RGBA')
W = im.width
logo = im.crop(LOGO)
out = ImageOps.mirror(im)
x0, y0, x1, y1 = LOGO
mx = W - x1  # where the flip carried it: covered with plain head from just below
out.paste(out.crop((mx, y0 + BLANK_DOWN, mx + x1 - x0, y1 + BLANK_DOWN)), (mx, y0))
nx = round((W - HEAD) - (HEAD - x0))  # as far left of the flipped head's middle as it was of the drawn one's
out.paste(logo, (nx, y0))
out.save(PATH, 'WEBP', quality=90, method=6)
print('flipped', PATH)
