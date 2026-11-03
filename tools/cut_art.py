#!/usr/bin/env python3
"""Cuts one of Carl's drawings out of the flat blue he draws them on: art/<name>-source.png, kept
as he sent it, into assets/<name>.webp. Run from the repo root:
    python3 studio/tools/cut_art.py chair
(First written for the chair, 5 Oct 2026; the pillow came the same way.)

The blue is keyed the way the garden's key_*.py scripts key green: how far a pixel is from the
background colour decides how see-through it is, and a pixel that is part blue (the soft edge of
the black outline) has the blue taken back out of its colour, so no blue fringe is left. Then it
is cropped to the drawing, and kept lossy at quality 90, the garden's rule for painted art."""
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
NAME = sys.argv[1]
SRC = os.path.join(HERE, '..', 'art', NAME + '-source.png')
OUT = os.path.join(HERE, '..', 'assets', NAME + '.webp')
# Dark marks Carl wants gone, by drawing: any dark shape whose size in pixels (of the cut-out) is in
# this range is painted over with the colours around it. First written for the first gong: "remove
# those dashed lines on the rim" (5 Oct 2026); its six dashes measured 300 to 450 px, its outline and
# face tens of thousands. That gong was redrawn without them and is cut by cut_gong.py now.
CLEAR_MARKS = {}
# Parts told apart by shape rather than colour, by drawing: a map beside the cut-out,
# assets/<name>-parts.webp, white where a pixel belongs to the part. The block rack's frame and its
# blocks' end faces are two oranges too close to separate by colour ("I need to recolor this one",
# Carl, 5 Oct 2026), so the end faces are the orange pieces closed off by outline and smaller than
# MAX px each way; the frame's pieces run long.
PARTS = {'blocks': 100}
# Drawings drawn at an angle, straightened to face front, by drawing: the four corners of the
# outline pulled out to a rectangle of this many px. The block rack is drawn already leaning, seen
# from the side, so its frame never sat square once the room leaned it (Carl, 5 Oct 2026: "look at
# the outline of this and imagine how it would look leaned against the wall"); straightened, the
# room's own lean gives the angle. 600 x 1000 is the real rack's shape, off his photo.
STRAIGHTEN = {'blocks': (600, 1000), 'console': (1400, 620)}  # the console: about 1.6 m by 0.7 m with its legs
# The front face's own corners, in the drawing's px (art/<name>-source.png), read off it by eye:
# top left, top right, bottom right, bottom left. Without them the outline's outermost points are
# used, and on the block rack those are the tips of its side face, which skewed the front: "top and
# bottom need to be parallel with the floor/wall. the bottom left corner is further back than the
# right side" (Carl, 5 Oct 2026).
FRONT = {'blocks': ((557, 42), (1012, 145), (892, 981), (477, 784)),
         # the console's front: the top slab's front corners, then the front legs' outer feet
         # ("Yes!" to giving it real 3D sides, Carl, 5 Oct 2026)
         'console': ((185, 293), (1465, 189), (1460, 762), (204, 918))}
# Fronts that stand on legs: their bottom is the feet, not the middle of the bottom edge, so it is not
# cropped up to the cabinet's underside.
ON_LEGS = {'console'}
NEAR, FAR = 40, 110   # distance from the blue, 0 to 441: fully clear below NEAR, fully solid past FAR
PAD = 6

im = Image.open(SRC).convert('RGB')
w, h = im.size
# the background, averaged off the four corners
corners = [im.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
bg = tuple(sum(c[i] for c in corners) / 4 for i in range(3))
out = Image.new('RGBA', (w, h))
src, dst = im.load(), out.load()
for y in range(h):
    for x in range(w):
        c = src[x, y]
        d = sum((c[i] - bg[i]) ** 2 for i in range(3)) ** 0.5
        a = min(1.0, max(0.0, (d - NEAR) / (FAR - NEAR)))
        if a <= 0:
            dst[x, y] = (0, 0, 0, 0)
            continue
        rgb = tuple(int(max(0, min(255, (c[i] - (1 - a) * bg[i]) / a))) for i in range(3))
        dst[x, y] = (*rgb, int(a * 255))
if NAME in STRAIGHTEN:
    # the outline's corners: furthest up-left, up-right, down-right and down-left
    a = out.getchannel('A').load()
    pts = [(x, y) for y in range(0, out.size[1], 2) for x in range(0, out.size[0], 2) if a[x, y] > 128]
    TL = min(pts, key=lambda p: p[0] + p[1]); BR = max(pts, key=lambda p: p[0] + p[1])
    TR = max(pts, key=lambda p: p[0] - p[1]); BL = min(pts, key=lambda p: p[0] - p[1])
    if NAME in FRONT:
        TL, TR, BR, BL = FRONT[NAME]  # straightening comes before the crop, so these are the drawing's own px
    # pushed out 6% from the middle, so the bits of the drawing that bulge past the straight line
    # between two corners (the frame's side lip on top, the handle loop at the bottom) are not cut
    # off: "the top is getting cut off too?" (Carl, 5 Oct 2026). The empty margin is cropped below.
    cx = sum(p[0] for p in (TL, TR, BR, BL)) / 4
    cy = sum(p[1] for p in (TL, TR, BR, BL)) / 4
    # A drawing straightened on its FRONT face is clipped to that face, out only as far as its outline
    # reaches (GROW_FRONT): its drawn sides and top are left behind, and the room builds them as real
    # surfaces instead ("can you clip those sides and top and make it more 3d?", Carl, 5 Oct 2026).
    k = 1.025 if NAME in FRONT else 1.06
    grow = lambda p: (cx + (p[0] - cx) * k, cy + (p[1] - cy) * k)
    QUAD = (*grow(TL), *grow(BL), *grow(BR), *grow(TR))
    out = out.transform(STRAIGHTEN[NAME], Image.QUAD, QUAD, Image.BICUBIC)
    if NAME in FRONT:
        # what is left of the side face past the front's right edge is trimmed off, the front's own
        # outline kept: a ragged strip of it hung off the right ("there's some weirdness still",
        # Carl, 5 Oct 2026). Row by row, from the right: past the outer line, a strip of wood no
        # wider than SIDE px is the side face; the line before it is the front's edge, and is kept.
        SIDE = 22 if NAME == 'blocks' else 0
        W2, H2 = out.size
        px2 = out.load()
        dark = lambda p: p[3] > 128 and max(p[:3]) < 90
        wood = lambda p: p[3] > 128 and not dark(p)
        for y in range(H2):
            x = W2 - 1
            while x >= 0 and px2[x, y][3] <= 128:
                x -= 1
            while x >= 0 and dark(px2[x, y]):
                x -= 1
            w0 = x
            while x >= 0 and wood(px2[x, y]):
                x -= 1
            if 0 < w0 - x <= SIDE and x >= 0 and dark(px2[x, y]):
                for xx in range(x + 1, W2):
                    px2[xx, y] = (0, 0, 0, 0)
    print('straightened from', TL, TR, BR, BL)
box = out.getbbox()
box = (max(0, box[0] - PAD), max(0, box[1] - PAD), min(w, box[2] + PAD), min(h, box[3] + PAD))
out = out.crop(box)
if NAME in FRONT:
    # A board's front is cropped flush to its outline, so the room's built sides meet it with no gap
    # (EDGES OF A BOARD in src/props.mjs): each edge where the outline is along the middle 60% of
    # that side, so a handle loop bulging past the edge does not push it out.
    a = out.getchannel('A').load()
    W3, H3 = out.size
    med = lambda v: sorted(v)[len(v) // 2]
    rows = range(int(H3 * .2), int(H3 * .8), 4)
    cols = range(int(W3 * .2), int(W3 * .8), 4)
    L = med([next(x for x in range(W3) if a[x, y] > 128) for y in rows])
    R = med([next(x for x in range(W3 - 1, -1, -1) if a[x, y] > 128) for y in rows]) + 1
    T = med([next(y for y in range(H3) if a[x, y] > 128) for x in cols])
    B = med([next(y for y in range(H3 - 1, -1, -1) if a[x, y] > 128) for x in cols]) + 1
    if NAME in ON_LEGS:
        B = max(next(y for y in range(H3 - 1, -1, -1) if a[x, y] > 128) for x in range(W3) if any(a[x, yy] > 128 for yy in range(H3))) + 1
    out = out.crop((L, T, R, B))
    box = (box[0] + L, box[1] + T, box[0] + R, box[1] + T + (B - T))
    # and a strip of the drawn top face left above the front's top line is cut off at that line:
    # "This is the top. Not the side" (Carl, 5 Oct 2026). The first charcoal within TOP px of the top,
    # along the middle of it; the room builds the real top.
    TOP = 40
    px3 = out.load()
    W3, H3 = out.size
    dk = lambda p: p[3] > 128 and max(p[:3]) < 90
    firsts = [next((y for y in range(TOP) if dk(px3[x, y])), None) for x in range(int(W3 * .2), int(W3 * .8), 4)]
    firsts = [f for f in firsts if f is not None]
    # Flush on all four sides, so the room's built sides meet it with nothing showing through
    # between ("look at the gap/seethrough", Carl, 5 Oct 2026): any see-through pixels left between
    # the outline and the edge, row by row and column by column, take the outline's colour.
    px4 = out.load()
    W4, H4 = out.size
    # (a front on legs is flushed only down to its cabinet's underside: under it, the gaps beside the
    # legs are real, and filling them painted keyed-out blue into the left leg - "a weird
    # discoloration thing in the front screen left leg", Carl, 5 Oct 2026)
    for y in range(int(H4 * .84) if NAME in ON_LEGS else H4):
        for rng in (range(W4 - 1, -1, -1), range(W4)):
            xs = [x for x in rng]
            k = next((i for i, x in enumerate(xs) if px4[x, y][3] > 200), None)
            if k is not None and 0 < k <= 12:
                for x in xs[:k]:
                    px4[x, y] = px4[xs[k], y][:3] + (255,)
    for x in range(W4):
        for rng in ((range(H4),) if NAME in ON_LEGS else (range(H4 - 1, -1, -1), range(H4))):
            ys = [y for y in rng]
            k = next((i for i, y in enumerate(ys) if px4[x, y][3] > 200), None)
            if k is not None and 0 < k <= 12:
                for y in ys[:k]:
                    px4[x, y] = px4[x, ys[k]][:3] + (255,)
    if NAME == 'blocks' and firsts and med(firsts) > 3:
        cut = med(firsts)
        out = out.crop((0, cut, W3, H3))
        box = (box[0], box[1] + cut, box[2], box[3])
if NAME in CLEAR_MARKS:
    from collections import deque
    lo, hi = CLEAR_MARKS[NAME]
    px = out.load()
    W, H = out.size
    dark = lambda p: p[3] > 128 and max(p[:3]) < 90
    seen, marks = set(), []
    for y in range(H):
        for x in range(W):
            if (x, y) in seen or not dark(px[x, y]):
                continue
            q, pts = deque([(x, y)]), []
            seen.add((x, y))
            while q:
                a, b = q.popleft()
                pts.append((a, b))
                for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= c < W and 0 <= d < H and (c, d) not in seen and dark(px[c, d]):
                        seen.add((c, d))
                        q.append((c, d))
            if lo <= len(pts) <= hi:
                marks.append(pts)
    # each mark, grown by its soft edge, filled from the outside in with the average of filled neighbours
    for pts in marks:
        hole = set()
        for a, b in pts:
            for c in range(a - 3, a + 4):
                for d in range(b - 3, b + 4):
                    if 0 <= c < W and 0 <= d < H:
                        hole.add((c, d))
        while hole:
            done = []
            for a, b in hole:
                near = [px[c, d] for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)) if (c, d) not in hole and 0 <= c < W and 0 <= d < H and px[c, d][3] > 128]
                if near:
                    done.append(((a, b), tuple(sum(p[i] for p in near) // len(near) for i in range(3)) + (255,)))
            if not done:
                break
            for k, v in done:
                px[k] = v
                hole.discard(k)
    print('cleared', len(marks), 'marks')
# DEBLUE: a near-black pixel left blue by the key (the soft edge of the outline, unmixed from the blue a little
# wrong) is set to the outline's own warm charcoal at the same brightness. On the console's right edge the room's
# boil smeared it into a faint blue line; asked whether to re-cut it: "Re-cut it" (Carl, 6 Oct 2026, the edges
# sweep's quiz). Only drawings with no blue of their own.
DEBLUE = {'console'}
if NAME in DEBLUE:
    px = out.load()
    W5, H5 = out.size
    for y in range(H5):
        for x in range(W5):
            r, g, b, a = px[x, y]
            v = max(r, g, b)
            # dark and leaning blue, or blue leading outright (the drawing has none of its own)
            if a > 0 and ((v < 110 and b > r) or b > max(r, g) + 12):
                px[x, y] = (v, round(v * 14 / 16), round(v * 13 / 16), a)
out.save(OUT, 'WEBP', quality=90, method=6)
if NAME in PARTS:
    import colorsys
    from collections import deque
    MAX = PARTS[NAME]
    px = out.load()
    W, H = out.size
    def orange(p):
        if p[3] < 128:
            return False
        h, s, v = colorsys.rgb_to_hsv(*[t / 255 for t in p[:3]])
        return 20 / 360 < h < 50 / 360 and s > .45 and v > .5
    mask = Image.new('L', (W, H), 0)
    mp = mask.load()
    seen = set()
    for y in range(H):
        for x in range(W):
            if (x, y) in seen or not orange(px[x, y]):
                continue
            q, pts = deque([(x, y)]), []
            seen.add((x, y))
            while q:
                a, b = q.popleft()
                pts.append((a, b))
                for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= c < W and 0 <= d < H and (c, d) not in seen and orange(px[c, d]):
                        seen.add((c, d))
                        q.append((c, d))
            xs, ys = [p[0] for p in pts], [p[1] for p in pts]
            if len(pts) > 1000 and max(xs) - min(xs) < MAX and max(ys) - min(ys) < MAX:
                for a, b in pts:
                    mp[a, b] = 255
    # grown by two pixels, so a face's soft edge against its outline belongs to it too
    from PIL import ImageFilter
    mask = mask.filter(ImageFilter.MaxFilter(5))
    mask.convert('RGB').save(os.path.join(HERE, '..', 'assets', NAME + '-parts.webp'), 'WEBP', lossless=True)
    print('wrote parts map')
# Glass, by drawing: the drawing's colour that is glass (its mount, seen through it), written as the green of
# assets/<name>-parts.webp, so the room draws it see-through. The picture frame's light blue between its
# frame and the polaroid: "The light blue between the frame and the Polaroid is meant to be glass... so I
# was thinking what if it's like, not fully keyed out but maybe 10% transparency?" (Carl, 6 Oct 2026). The
# glass is the one piece of that colour that spans the most, the ring round the polaroid; the polaroid's
# own flowered blue is cut off from it by its outline.
GLASS = {'frame': (108, 158, 177)}
if NAME in GLASS:
    from collections import deque
    from PIL import ImageFilter
    g = GLASS[NAME]
    px = out.load()
    W, H = out.size
    def glassy(p):
        return p[3] > 200 and sum((p[i] - g[i]) ** 2 for i in range(3)) ** 0.5 < 30
    seen, best = set(), None
    for y in range(H):
        for x in range(W):
            if (x, y) in seen or not glassy(px[x, y]):
                continue
            q, pts = deque([(x, y)]), []
            seen.add((x, y))
            while q:
                a, b = q.popleft()
                pts.append((a, b))
                for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= c < W and 0 <= d < H and (c, d) not in seen and glassy(px[c, d]):
                        seen.add((c, d))
                        q.append((c, d))
            xs, ys = [p[0] for p in pts], [p[1] for p in pts]
            span = (max(xs) - min(xs)) * (max(ys) - min(ys))
            if best is None or span > best[0]:
                best = (span, pts)
    mask = Image.new('L', (W, H), 0)
    mp = mask.load()
    for a, b in best[1]:
        mp[a, b] = 255
    # grown by a pixel, so its soft edge against the outline is glass too
    mask = mask.filter(ImageFilter.MaxFilter(3))
    zero = Image.new('L', (W, H), 0)
    Image.merge('RGB', (zero, mask, zero)).save(os.path.join(HERE, '..', 'assets', NAME + '-parts.webp'), 'WEBP', lossless=True)
    print('wrote glass map', len(best[1]), 'px')
print('wrote', OUT, out.size)
