#!/usr/bin/env python3
"""Cuts Carl's arc lamp (art/lamp-source.png, sent 5 Oct 2026) into four pieces on one canvas: the stand
(base, pole and collar) and each neck with its shade, so the room can turn each
neck a little on its own: "the three necks are actually independent so a slightly different angle would
make the sway look better". Keyed as cut_art.py keys. Above the collar (COLLAR_Y) each neck is its own tube
and the lines round it (EACH NECK BY ITS OWN TUBE, below), each shade its own dome (EACH SHADE BY ITS OWN
SHAPE); the rest is the stand. Each neck runs whole, from its shade down
into the collar: "The lamp necks are cut at weird places and it makes it hard to find a good angle
for them" (Carl, 5 Oct 2026). They were first cut at a fixed column partway down the curve, so the
rest of each arc stayed on the stand and turning a neck broke its arc there.
Each shade is a piece of its own, so the room can keep it facing the camera while its neck turns:
"if we could make the actual shade (I think that's the word?) stay facing the camera regardless of
the neck rotation that would be cool" (Carl, 5 Oct 2026). The little sleeve it hangs from stays on the neck.
Run from the repo root: python3 studio/tools/cut_lamp.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage  # pip install scipy

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art', 'lamp-source.png')
OUT = os.path.join(HERE, '..', 'assets', 'lamp-{}.webp')
NEAR, FAR = 40, 110
COLLAR_Y = 353
RING, RIM, OPEN_PX = 6, 7, 5  # px: a line's reach round a neck's tan; a shade's rim past its circle; what is solid
INK = (8, 7, 6)  # the drawing's line colour
SLEEVE_LINE = 7  # px of line round a sleeve inside its shade: the rim it sits on, the sleeve's bottom line
HAIRLINE = 8  # px: two tubes this close (their distances added) have only the drawing's line, or a hairline of background, between them
DOT = 6  # px: a loose dot of tan smaller than this in the black is inked
HOLE = 12  # px: a see-through hole smaller than this inside a piece is filled
SCRAP = 40  # px: a patch smaller than this, loose on a piece, is a scrap
SLEEVE_REACH = 22  # px either side of a shade's hang that its sleeve's run may reach
SLEEVE_EXT = 1  # px each sleeve's run goes on into its shade's top, behind it
EXT = 16  # px each neck runs on behind the collar (its band is rows 353 to 372)
# each neck's centreline, (x, y), down to the collar, and its shade's circle (x, y, r), read off the drawing by hand:
# the line picks out which tan is whose, the circle roughly where its shade is. The middle one
# goes behind the lower one at about y 280 and is not drawn below it.
NECKS = [
    ([(440, 75), (480, 70), (560, 47), (640, 39), (720, 45), (800, 67), (880, 109), (960, 181), (970, 194),
      (978, 206), (985, 218), (993, 230), (997, 242), (1005, 254), (1010, 266), (1015, 278), (1019, 290),
      (1023, 302), (1026, 314), (1030, 326), (1033, 338), (1035, 352)], (445, 178, 92)),
    ([(600, 128), (640, 126), (720, 113), (800, 120), (880, 149), (960, 209), (967, 218), (971, 224),
      (978, 230), (982, 236), (989, 248), (996, 260), (1002, 272), (1005, 280)], (615, 215, 82)),
    ([(760, 183), (800, 182), (880, 187), (960, 235), (967, 242), (972, 248), (981, 260), (991, 272),
      (997, 284), (1005, 296), (1010, 308), (1016, 320), (1020, 332), (1023, 344), (1025, 352)], (770, 268, 84)),
]


im = Image.open(SRC).convert('RGB')
W, H = im.size
bg = tuple(sum(im.getpixel(p)[i] for p in [(2, 2), (W - 3, 2), (2, H - 3)]) / 3 for i in range(3))
c = np.asarray(im).astype(float)
alpha = np.clip((np.linalg.norm(c - np.array(bg), axis=2) - NEAR) / (FAR - NEAR), 0, 1)
rgb = np.clip((c - (1 - alpha[..., None]) * np.array(bg)) / np.maximum(alpha, 1e-6)[..., None], 0, 255)
""" THE BLUE IN THE LINES: where the drawing's black lines blend into its blue background the pixels are dark blue,
dark enough to count as solid, and they kept their blue: a cold fringe round every line of the lamp, worst wherever it
lay over something other than the cream wall (the lamp angles sweep's blind check, 7 Oct 2026). The console's cut
takes the same blue out (DEBLUE in cut_art.py, "Re-cut it"). A bluish pixel is ink and background mixed: it is drawn
ink, as see-through as its share of the background. """
blue = c[..., 2] > c[..., 0] + 6  # nothing in the lamp is bluer than it is red
ink_c, bg_c = np.array(INK, float), np.array(bg)
share = np.clip(((c - ink_c) * (bg_c - ink_c)).sum(2) / ((bg_c - ink_c) ** 2).sum(), 0, 1)
blue &= alpha > 0
alpha = np.where(blue, np.where(1 - share < 0.05, 0, 1 - share), alpha)
rgb[blue] = ink_c
lum = c.mean(2)
above = np.arange(H)[:, None] < COLLAR_Y
yy, xx = np.mgrid[0:H, 0:W]
""" EACH NECK BY ITS OWN TUBE (the lamp angles sweep, 6 Oct 2026). A neck is its own tan inside (its tube and its
sleeve, the pieces of tan the drawing's outlines close off that its centreline runs through) and every line within
RING px of it: where two necks touch in the drawing they share one line, and each takes a copy of it. Cut by what was
nearest a centreline, a shared line went to one neck alone, so as the necks turned apart the other showed a bare tan
edge with no line, a pale ragged seam and a crack of wall between them, at every angle (THE NECKS' STRAYS, which
dropped the slices of a neighbour's line instead, made the same gaps). The copy's far edge, where it met the other
neck's tan, fades out by how dark it is, so it ends as a line ends, not as a ragged tan edge. """
tan = (alpha > 0.9) & (lum > 110) & (c[..., 0] > c[..., 2] + 15) & above
lab, n = ndimage.label(tan)
votes = np.zeros((n + 1, 3))
for i, (pts, _) in enumerate(NECKS):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = max(1, int(np.hypot(x1 - x0, y1 - y0)))
        for t in range(L):
            votes[lab[int(round(y0 + (y1 - y0) * t / L)), int(round(x0 + (x1 - x0) * t / L))], i] += 1
votes[0] = 0
own = [ndimage.binary_fill_holes(np.isin(lab, np.flatnonzero((votes.argmax(1) == i) & (votes.max(1) > 0)))) for i in range(3)]
fills = own[0] | own[1] | own[2]
ink = (alpha > 0) & ~fills & above
dist = [ndimage.distance_transform_edt(~f) for f in own]
pieces = [np.zeros((H, W, 4), np.uint8) for _ in range(7)]  # 0 the stand, 1-3 the necks, 4-6 their shades
def put(k, mask, a=None):
    pieces[k][mask, :3] = rgb[mask].astype(np.uint8)
    pieces[k][mask, 3] = ((alpha if a is None else a)[mask] * 255).astype(np.uint8)
# inside a shade's circle a neck keeps the line its sleeve sits on (the shade's rim, its bottom line too), not more
in_shade = np.any([np.hypot(xx - cx, yy - cy) <= r - 6 for _, (cx, cy, r) in NECKS], axis=0)
for i in range(3):
    line = ink & (dist[i] <= np.where(in_shade, SLEEVE_LINE, RING))
    # where its line meets another neck's tan, or is the shade's rim under its sleeve: faded by how dark it is,
    # ink-coloured, so it ends as a line ends and not in a pale ragged edge
    shared = line & ((np.min([dist[j] for j in range(3) if j != i], axis=0) <= 1.5) | in_shade)
    put(i + 1, own[i] | (line & ~shared))
    pieces[i + 1][shared, :3] = INK
    # against a neck's pale tan, anything darker than it is line; against a shade's darker metal, only the ink is
    fade = np.where(in_shade, np.clip((110 - lum) / 90, 0, 1), np.clip((250 - lum) / 60, 0, 1))
    pieces[i + 1][shared, 3] = (fade[shared] * alpha[shared] * 255).astype(np.uint8)
""" EACH SHADE BY ITS OWN SHAPE: everything inside a circle fitted to its outline on either side of its sleeve that is
not a neck's tan, the whole patch of ink that circle holds most of: above the circle is the sleeve's (the sides of
the sleeve rode on the shade, loose bits of line floating over its top whenever the two turned apart). Where the
sleeve sits on its top the rim is the sleeve's bottom line as well, and both take a copy. """
dc = [np.hypot(xx - cx, yy - cy) / r for _, (cx, cy, r) in NECKS]
nearest = np.argmin(dc, axis=0)
solid = alpha > 0.5
near_neck = np.min(dist, axis=0) <= RING + 4
fitted, rims, centres, circles = [], [], [], []
for i, (_, (cx, cy, r)) in enumerate(NECKS):
    pts = []
    for ang in np.radians(np.arange(190, 351, 2)):
        for rr in np.arange(r + RIM + 6, r - 30, -0.5):
            x, y = int(round(cx + rr * np.cos(ang))), int(round(cy + rr * np.sin(ang)))
            if solid[y, x]:
                if not near_neck[y, x] and nearest[y, x] == i:
                    pts.append((x, y))
                break
    P = np.array(pts, float)
    # a circle through them, least squares: x^2 + y^2 = 2ax + 2by + c
    A = np.c_[2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))]
    fa, fb, fc = np.linalg.lstsq(A, (P ** 2).sum(1), rcond=None)[0]
    fr = np.sqrt(fc + fa * fa + fb * fb)
    fitted.append(np.hypot(xx - fa, yy - fb) <= fr + 2.5)
    centres.append(fb)
    circles.append((fa, fb, fr))
    rims.append(np.hypot(xx - fa, yy - fb) > fr - 3)
# the shades never touch in the drawing, so each is the patch of ink its fitted circle holds most of: the
# hand-read circles, a few px too big, had given a shade a slice of its neighbour's rim, which floated beside it once
# the two turned to the camera from far round. Above its fitted circle, a line round a sleeve is the sleeve's.
in_any = np.any([d <= 1 + RIM / r for d, (_, (_, _, r)) in zip(dc, NECKS)], axis=0)
sleeve_side = (np.min(dist, axis=0) <= RING) & ~np.any(fitted, axis=0)
cand = (alpha > 0) & above & ~fills & in_any & ~sleeve_side
lab, n = ndimage.label(cand & (alpha > 0.3), structure=np.ones((3, 3)))
# the faintest edge pixels join the patch beside them
_, (iy, ix) = ndimage.distance_transform_edt(lab == 0, return_indices=True)
lab = np.where(cand, lab[iy, ix], 0)
counts = np.stack([ndimage.sum(f, lab, range(n + 1)) for f in fitted], axis=1)
whose = np.argmax(counts, axis=1)
whose[counts.max(1) == 0] = -1
for i in range(3):
    # and nothing above its fitted circle: where the tube leaves the sleeve over a shade's top, a piece of its line rode
    # on the shade and floated beside the sleeve from the side
    mine = cand & np.isin(lab, np.flatnonzero(whose == i)) & (lab > 0) & (fitted[i] | (yy >= centres[i]))
    # at its outer edge, a hair thinner than 3 px is the key's leftover, not the rim
    hair = mine & rims[i] & ~ndimage.binary_opening(mine & (alpha > 0.3), structure=np.ones((3, 3)))
    put(i + 4, mine & ~(hair & (alpha < 0.9)) & ~(hair & (rgb[..., 2] > rgb[..., 0] + 10)))
""" INTO THE SHADE: each sleeve runs on down, inked, to SLEEVE_EXT px into its shade's top, behind it, and the room
draws each shade a little nearer the camera than it hangs (`toEye`, src/props.mjs), so the shade always covers it.
The shade turns to the camera and the sleeve keeps its neck's turn, so the rim's curve lies a little differently on
the two, and a pale ragged seam opened between them (the lamp angles sweep, 6 Oct 2026). """
for i in range(3):
    p, sh = pieces[i + 1], pieces[i + 4]
    cx = NECKS[i][1][0]
    # only near where the shade turns (its hang, the top of its circle): further out the sleeve and the shade part by
    # more than SHADE_NEAR in depth, and the run showed in front of the shade as a dark tick
    for x in range(cx - SLEEVE_REACH, cx + SLEEVE_REACH + 1):
        # the shade's own top in this column, and the sleeve's bottom just above it, wherever that is: where the
        # run stopped short of the shade, the sleeve stood on "legs" with slits of wall between
        top = np.flatnonzero(sh[:, x, 3] > 200)
        if not len(top):
            continue
        top = top[0]
        ys = np.flatnonzero(p[top - 14:top + 8, x, 3] > 128)
        if not len(ys):
            continue
        y0 = top - 14 + ys[-1] + 1
        if y0 < top + SLEEVE_EXT:
            p[y0:top + SLEEVE_EXT, x, :3] = INK
            p[y0:top + SLEEVE_EXT, x, 3] = 255
taken = np.zeros((H, W), bool)
for p in pieces[1:]:
    taken |= p[..., 3] > 0
put(0, (alpha > 0) & ~above)
taken_now = np.zeros((H, W), bool)
for p in pieces[1:]:
    taken_now |= p[..., 3] > 0
# the collar's own top corners, a row or two above COLLAR_Y, on no neck: the stand's
put(0, (alpha > 0) & above & ~taken_now & (yy >= COLLAR_Y - 6) & (xx > 1000))
print('ink above the collar on no piece (before the leftovers go to the nearest):', int(((alpha > 0.5) & above & ~taken).sum()), 'px')
""" INTO THE COLLAR: each neck runs on down behind the collar, its last row repeated EXT rows, and the room draws the
stand a little nearer the camera than it stands (`toEye`, src/props.mjs), so the collar always covers the necks'
ends. Cut flat at the collar's top, the ends sat on it and slid across it as the necks turned against the stand,
overhanging its edge with a pale line between (the lamp angles sweep, 6 Oct 2026). The run behind the collar is
never seen. """
for i in (1, 2, 3):
    pieces[i][COLLAR_Y:COLLAR_Y + EXT] = pieces[i][COLLAR_Y - 1]
# THE WEDGE: below the middle neck's tip the long and the short necks run together, the black between them drawn as
# one wedge, which each now copies. They turn 10 degrees apart, so their copies drift apart and the wall showed
# between them in a white fleck by the middle neck's tip. The middle neck turns between the two, so the wedge goes on
# it too, as drawn, and fills whatever opens there.
wedge = (alpha > 0) & above & ~fills & (dist[0] <= RING + 2) & (dist[2] <= RING + 2) & (dist[1] > 1)
wedge &= yy >= NECKS[1][0][-1][1] - 30
pieces[2][wedge, :3] = INK
pieces[2][wedge, 3] = 255
# scraps of a few px left loose on a piece (a hair of a sleeve's line on a shade's top) go
for p in pieces[1:]:
    lab, n = ndimage.label(p[..., 3] > 0, structure=np.ones((3, 3)))
    if n > 1:
        size = ndimage.sum(np.ones((H, W)), lab, range(n + 1))
        p[np.isin(lab, np.flatnonzero(size < SCRAP)) & (lab > 0)] = 0
# ink above the collar on no piece, near a neck's tan (the black between sleeve 3's right end and its shade's rim,
# outside the shade's fitted circle and a little past RING): that neck's, or it showed as a ragged notch of wall
nobody = (alpha > 0) & above & ~np.any([p[..., 3] > 0 for p in pieces], axis=0)
for i in range(3):
    mine = nobody & (dist[i] <= 2 * RING + 2) & (dist[i] == np.min(dist, axis=0))
    pieces[i + 1][mine, :3] = INK
    pieces[i + 1][mine, 3] = (alpha[mine] * 255).astype(np.uint8)
# and the faintest edge of a shade's outline, which the patches above gave to a neighbour: the shade whose edge is nearest
nobody = (alpha > 0) & above & ~np.any([p[..., 3] > 0 for p in pieces], axis=0) & in_any
edge = np.argmin([np.abs(np.hypot(xx - fa, yy - fb) - fr) for fa, fb, fr in circles], axis=0)
for i in range(3):
    mine = nobody & (edge == i)
    pieces[i + 4][mine, :3] = INK
    pieces[i + 4][mine, 3] = (alpha[mine] * 255).astype(np.uint8)
""" EVERY EDGE IS INK: every edge of every piece is one of the drawing's black lines, so a pixel the key left half
see-through is coloured ink. Unmixed against the drawing's blue, some came out bluish or pale: unseen against the
cream wall, they showed as a blue fringe round each shade and a pale hairline round a sleeve wherever it lay over a
darker shade or the teal wall (the lamp angles sweep's blind check, 7 Oct 2026). Where two necks' tubes close off a
wedge of black, every copy of it is solid, and so is a hole of a few px left inside a piece: half see-through, the
copies let the wall through as a dotted slit and a grey speck by the middle neck's tip. """
between = np.sort(np.stack(dist), axis=0)[1] <= RING + 2
for k, p in enumerate(pieces):
    soft = (p[..., 3] > 0) & (p[..., 3] < 242) & ~fills
    p[soft, :3] = INK
    if 1 <= k <= 3:
        others = np.min([dist[j] for j in range(3) if j != k - 1], axis=0)
        solid = (p[..., 3] > 0) & above & ~fills & (dist[k - 1] <= RING) & (others <= 3)
        p[solid, :3] = INK
        p[solid, 3] = 255
    if k:
        lab, n = ndimage.label(p[..., 3] < 128)
        if n > 1:
            size = ndimage.sum(np.ones((H, W)), lab, range(n + 1))
            hole = np.isin(lab, np.flatnonzero(size < HOLE)) & (lab > 0)
            p[hole, :3] = INK
            p[hole, 3] = 255
# and a speck of background the drawing left between a sleeve and its shade (sleeve 3's right end): a hole in the two
# together, filled on the neck, or it showed the wall as a ragged notch once the shade turned
for i in range(3):
    both = (pieces[i + 1][..., 3] > 128) | (pieces[i + 4][..., 3] > 128)
    lab, n = ndimage.label(~both)
    if n > 1:
        size = ndimage.sum(np.ones((H, W)), lab, range(n + 1))
        hole = np.isin(lab, np.flatnonzero(size < SCRAP)) & (lab > 0)
        pieces[i + 1][hole, :3] = INK
        pieces[i + 1][hole, 3] = 255
# loose dots of tan in the black, a few px each, touching no tube (where the middle neck's tip narrows away into the wedge): ink,
# or they showed as specks floating in the line
tanish = above & ~fills & (lum > 90) & (alpha > 0.5)
lab, n = ndimage.label(tanish, structure=np.ones((3, 3)))
touch = np.unique(lab[ndimage.binary_dilation(fills, iterations=1) & tanish])
size = ndimage.sum(np.ones((H, W)), lab, range(n + 1))
loose = (lab > 0) & ~np.isin(lab, touch) & np.isin(lab, np.flatnonzero(size < DOT))
for i in range(3):
    mine = loose & (pieces[i + 1][..., 3] > 0)
    pieces[i + 1][mine, :3] = INK
    pieces[i + 1][mine, 3] = 255
# a hairline of the drawing's background where two tubes' lines meet (the gaps between them close to 3 px or less):
# filled on both, or the wall showed through it as a dotted seam inside the black (the wider gaps are drawn, and stay)
d2 = np.sort(np.stack(dist), axis=0)
hair = above & ~fills & (d2[0] + d2[1] <= HAIRLINE)
for i in range(3):
    mine = hair & (dist[i] <= RING + 2)
    pieces[i + 1][mine, :3] = INK
    pieces[i + 1][mine, 3] = 255
# every see-through pixel takes the colour of the nearest solid one, and the pieces are saved lossless: saved lossy,
# the colours round each line shifted to a cold blue-grey fringe on every line (the blind check, 7 Oct 2026)
for p in pieces:
    solid = p[..., 3] > 128
    if solid.any():
        _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)
        clear = p[..., 3] == 0
        p[clear, :3] = p[iy, ix, :3][clear]
pieces = [Image.fromarray(p, 'RGBA') for p in pieces]
box = None
for p in pieces:
    b = p.getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
box = (box[0] - 4, box[1] - 4, box[2] + 4, box[3] + 4)
# the room's numbers (`pole`, each shade's `hang` in src/props.mjs) are shares of this canvas: it must not move
assert box == (358, 26, 1168, 981), box
for i, p in enumerate(pieces):
    name = 'stand' if i == 0 else 'neck%d' % i if i < 4 else 'shade%d' % (i - 3)
    p.crop(box).save(OUT.format(name), 'WEBP', lossless=True, method=6, exact=True)
# where the pole stands, as a share of the canvas's width, for the room to turn the necks about it
bw, bh = box[2] - box[0], box[3] - box[1]
# where each shade hangs (the top of its circle), as shares of the canvas, for the room to hang it from its neck
for i, (_, (cx, cy, r)) in enumerate(NECKS):
    print('shade%d hangs at' % (i + 1), [round((cx - box[0]) / bw, 4), round((cy - r - box[1]) / bh, 4)])
print('wrote 7 pieces', (box[2] - box[0], box[3] - box[1]), 'pole at', round((1035 - box[0]) / (box[2] - box[0]), 4))
