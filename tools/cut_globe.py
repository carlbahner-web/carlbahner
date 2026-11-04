"""THE SNOW GLOBE: Carl's globe (art/snowglobe/snowglobe-source.png, sent 3 Nov 2026: "I'm gonna replace the candle with a
snow globe with this inside it, I'm making the art now") with his Brand Castle inside it (the classroom's, sent 18 Oct
2026, art/snowglobe/brand-castle.webp). The castle is laid in behind the glass, its foot under the base's rim, so the
glass's own see-through wash lies over it; its flag's six frames (art/snowglobe/brand-castle-flag.webp) are cut one a
picture to wave on its pole (src/props.mjs, the globe's BITS). Prints the flag's place for src/props.mjs.
Run from the repo root: python3 tools/cut_globe.py"""
from PIL import Image

globe = Image.open("art/snowglobe/snowglobe-source.png").convert("RGBA")
castle = Image.open("art/snowglobe/brand-castle.webp").convert("RGBA")
flags = Image.open("art/snowglobe/brand-castle-flag.webp").convert("RGBA")

N = globe.width
CH = 520  # the castle's height in the globe's pixels, its middle on the globe's
FOOT = 868  # its foot, just under the front of the base's rim
k = CH / castle.height
cw = round(castle.width * k)
left, top = round(617 - cw / 2), FOOT - CH
out = Image.new("RGBA", globe.size, (0, 0, 0, 0))
out.alpha_composite(castle.resize((cw, CH), Image.LANCZOS), (left, top))
out.alpha_composite(globe)
box = out.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
out = out.crop(box)
out.save("assets/snowglobe.webp", "WEBP", quality=92)

# the flag: as the classroom draws it (garden/src/template.html, castle), each frame 300 by 230 at 0.7 of the castle's
# pixels, its pole edge (x 0, y 40 of the cell) at x 484, y 62 of the castle
FK = 0.7
for f in range(6):
    flags.crop((f * 300, 0, f * 300 + 300, 230)).save(f"assets/globe-flag-{f}.webp", "WEBP", quality=92)
W, H = out.size
px, py = left + 484 * k - box[0], top + 62 * k - box[1]
print("globe", out.size)
print("at", [round(px / W, 4), round(1 - py / H, 4)], "anchor", [0, round(1 - 40 / 230, 4)], "flag", round(300 * FK * k / W, 4))
