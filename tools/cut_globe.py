"""THE SNOW GLOBE: Carl's globe (art/snowglobe/snowglobe-source.png, sent 3 Nov 2026: "I'm gonna replace the candle with a
snow globe with this inside it, I'm making the art now") with his Brand Castle inside it (the classroom's, sent 18 Oct
2026, art/snowglobe/brand-castle.webp). The castle is laid in behind the glass, its foot under the base's rim, so the
glass's own see-through wash lies over it; its flag's six frames (art/snowglobe/brand-castle-flag.webp) are cut one a
picture to wave on its pole (src/props.mjs, the globe's BITS). Prints the flag's place for src/props.mjs.
Run from the repo root: python3 tools/cut_globe.py"""
from PIL import Image, ImageChops, ImageDraw

import json, sys

# THE COLOURS: his castle's own (cream walls, teal roofs, wood door, mustard flag) and the hill's, each swapped for one
# of the room's: "we need to recolor all of it I think tbh" (Carl, 3 Nov 2026). `python3 tools/cut_globe.py '<json>'`
# tries a set ({"walls": "#..", "roofs": .., "door": .., "flag": .., "hill": ..}); with none, PALETTE below.
# his pick, 3 Nov 2026, "Cream castle rust roof": option 3 of four shown against the teal wall
PALETTE = {"walls": "#f4ead8", "roofs": "#b5532d", "door": "#8a5a34", "flag": "#f0c060", "hill": "#93a35c"}
PAL = {**PALETTE, **(json.loads(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].startswith("{") else {})}
OUT = sys.argv[2] if len(sys.argv) > 2 else "assets"
BASE = {"walls": (244, 242, 230), "roofs": (55, 100, 100), "door": (150, 100, 70)}
hexrgb = lambda h: tuple(int(h[i : i + 2], 16) for i in (1, 3, 5))

def recolour(im, roles):
    """each pixel near one of `roles`' colours moved to its new colour by the same step, its shading and soft edge kept"""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            best, bd = None, 1e9
            for name, (base, to) in roles.items():
                d = ((r - base[0]) ** 2 + (g - base[1]) ** 2 + (b - base[2]) ** 2) ** 0.5
                if d < bd:
                    best, bd = (base, to), d
            w = max(0.0, min(1.0, 1 - (bd - 30) / 90))
            if w <= 0:
                continue
            base, to = best
            px[x, y] = tuple(max(0, min(255, round(c + (t - bc) * w))) for c, t, bc in zip((r, g, b), to, base)) + (a,)
    return im

globe = Image.open("art/snowglobe/snowglobe-source.png").convert("RGBA")
castle = Image.open("art/snowglobe/brand-castle.webp").convert("RGBA")
# the charcoal line stays charcoal: listed as itself, so the line's pixels go to it and not to the nearest colour
INK = (38, 40, 40)
castle = recolour(castle, {"ink": (INK, INK), **{k: (BASE[k], hexrgb(PAL[k])) for k in BASE}})
flags = recolour(Image.open("art/snowglobe/brand-castle-flag.webp").convert("RGBA"), {"ink": ((38, 40, 40), (38, 40, 40)), "flag": ((240, 196, 96), hexrgb(PAL["flag"]))})

N = globe.width
MID = 617  # the globe's middle, across
# THE HILL the castle stands on, so it sits higher in the glass: "Can we add a simple procedural hill under the castle so
# it sits a bit higher?" (Carl, 3 Nov 2026). A rounded mound from under the front of the base's rim, flat enough on top
# for the castle, in an olive the room already has (the rug's), a lighter crown, and the castle's own charcoal line.
HILL_BASE, HILL_H, HILL_HALF, HILL_P = 880, 145, 400, 4
CH = 540  # the castle's height in the globe's pixels
k = CH / castle.height
cw = round(castle.width * k)
hill_top_at = lambda t: HILL_BASE - HILL_H * max(0.0, 1 - abs(t) ** HILL_P) ** (1 / HILL_P)
# stood on the hill's top, its own foot line over the hill's, so its door shows whole
FOOT = round(hill_top_at(0)) + 8
left, top = round(MID - cw / 2), FOOT - CH
out = Image.new("RGBA", globe.size, (0, 0, 0, 0))

def hill(size):
    S = 4  # drawn four times over, then brought down, so its edge is smooth
    from PIL import ImageDraw
    im = Image.new("RGBA", (size[0] * S, size[1] * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = [((MID + t / 100 * HILL_HALF) * S, hill_top_at(t / 100) * S) for t in range(-100, 101)]
    body = pts + [((MID + HILL_HALF) * S, (HILL_BASE + 40) * S), ((MID - HILL_HALF) * S, (HILL_BASE + 40) * S)]
    hill_c = hexrgb(PAL["hill"])
    d.polygon(body, fill=hill_c + (255,))
    # a lighter crown just under its top edge
    crown = [(x, y + 10 * S) for x, y in pts[30:171]]
    d.line(crown, fill=tuple(min(255, round(c * 1.18 + 10)) for c in hill_c) + (255,), width=14 * S, joint="curve")
    d.line(pts, fill=(38, 40, 40, 255), width=round(CH * 14 / 955) * S + S, joint="curve")
    im = im.resize(size, Image.LANCZOS)
    # kept inside the glass: the globe's round, read off its outline (top at y 71, 184 to 1046 across at y 520), a little in
    inside = Image.new("L", size, 0)
    ImageDraw.Draw(inside).ellipse((615 - 423, 502 - 423, 615 + 423, 502 + 423), fill=255)
    im.putalpha(ImageChops.multiply(im.getchannel("A"), inside))
    return im

out.alpha_composite(hill(globe.size))
out.alpha_composite(castle.resize((cw, CH), Image.LANCZOS), (left, top))
out.alpha_composite(globe)
box = out.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
out = out.crop(box)
out.save(f"{OUT}/snowglobe.webp", "WEBP", quality=92)

# the flag: as the classroom draws it (garden/src/template.html, castle), each frame 300 by 230 at 0.7 of the castle's
# pixels, its pole edge (x 0, y 40 of the cell) at x 484, y 62 of the castle
FK = 0.7
for f in range(6):
    flags.crop((f * 300, 0, f * 300 + 300, 230)).save(f"{OUT}/globe-flag-{f}.webp", "WEBP", quality=92)
W, H = out.size
px, py = left + 484 * k - box[0], top + 62 * k - box[1]
print("globe", out.size, "castle foot", FOOT)
print("at", [round(px / W, 4), round(1 - py / H, 4)], "anchor", [0, round(1 - 40 / 230, 4)], "flag", round(300 * FK * k / W, 4))
