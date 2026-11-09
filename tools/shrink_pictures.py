"""Pictures sized to what the room shows of them, and saved lighter, for speed (the speed sweep, 9 Nov 2026: "do 1, 3,
and 4 now please", Carl). Run from the repo root after re-cutting any of these: python3 tools/shrink_pictures.py

Each size is about twice the most of it the room ever shows, at the opening view and at every card's landing, on a 2x
laptop and a phone (measured by placing the camera there and projecting each picture onto the screen). The boil keeps
counting in the drawing's own pixels whatever size it is saved at (DRAWN in src/props.mjs), so it boils as it did.
The rug with his name was saved lossless, 1.5 MB; saved as the room's other pictures are, it is a fifth of that. The
paper grain is saved lighter (QUALITY). Running it again re-saves the re-saved ones, each a little softer: re-cut first."""
import sys
from pathlib import Path
from PIL import Image
import numpy as np

# file: width to save at (its height kept in proportion); None keeps its size and only re-saves it
SIZES = {
    "assets/clock-face.webp": 512,
    "assets/clock-hour.webp": 512,
    "assets/clock-minute.webp": 512,
    "assets/clock-second.webp": 512,
    "assets/blocks.webp": 298,
    "assets/mug.webp": 717,
    "assets/rug-wordmark.webp": None,
    "assets/paper-grain.webp": None,
}
# saved lighter still: the grain is noise, laid over the room at a third strength (GRAIN_K); at 70 it keeps 99.6% of its
# contrast and 99.4% of its fine texture, at about half the weight
QUALITY = {"assets/paper-grain.webp": 70}


def shrink(im, w):
    """Resized on premultiplied alpha, so no dark fringe creeps in from the see-through pixels round a drawing."""
    a = np.asarray(im.convert("RGBA")).astype(np.float32) / 255
    rgb, al = a[..., :3] * a[..., 3:], a[..., 3:]
    h = round(im.height * w / im.width)
    big = lambda x: np.asarray(Image.fromarray((x * 255).round().astype(np.uint8)).resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
    rgb2 = np.stack([big(rgb[..., i]) for i in range(3)], -1)
    al2 = big(al[..., 0])[..., None]
    out = np.where(al2 > 1e-4, rgb2 / np.maximum(al2, 1e-4), 0)
    return Image.fromarray((np.concatenate([np.clip(out, 0, 1), al2], -1) * 255).round().astype(np.uint8), "RGBA")


for f, w in SIZES.items():
    p = Path(f)
    im = Image.open(p)
    before = p.stat().st_size
    if w and im.width > w:
        im = shrink(im, w)
    if im.mode == "RGBA" and np.asarray(im)[..., 3].min() == 255:
        im = im.convert("RGB")
    im.save(p, "WEBP", quality=QUALITY.get(f, 90), alpha_quality=100, method=6)
    print(f"{f}: {before / 1e6:.2f} MB -> {p.stat().st_size / 1e6:.2f} MB, {im.width}x{im.height}")
