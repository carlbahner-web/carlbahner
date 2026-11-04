"""THE CB ON THE KICK DRUM, in place of the CC: "Should I put my CB from the drum logo (minus the rim) in lieu of the CC on
the kick drum?", then his logo sent (3 Nov 2026, kept as art/drum-cb/cb-drum-logo-source.jpg). The letters alone are lifted
out of it (inside the rim's round, any speck dropped), coloured the CC's own ink, and set where the CC sat at about ten
o'clock on the head (tools/flip_drum.py puts it there), the CC first covered with plain head from just below, as
flip_drum.py covers the flipped one. Run from the repo root after flip_drum.py: python3 tools/drum_cb.py"""
from collections import deque
import numpy as np
from PIL import Image

src = np.array(Image.open("art/drum-cb/cb-drum-logo-source.jpg").convert("L")).astype(float)
dark = src < 128
H, W = dark.shape
yy, xx = np.mgrid[0:H, 0:W]
dark &= (xx - 640) ** 2 + (yy - 600) ** 2 < 300**2  # inside the rim's round: its letters
# each joined patch of ink; the small ones (a fleck of ink) are dropped
seen = np.zeros_like(dark)
keep = np.zeros_like(dark)
for y, x in zip(*np.nonzero(dark)):
    if seen[y, x]:
        continue
    q, part = deque([(y, x)]), []
    seen[y, x] = True
    while q:
        a, b = q.popleft()
        part.append((a, b))
        for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
            if 0 <= c < H and 0 <= d < W and dark[c, d] and not seen[c, d]:
                seen[c, d] = True
                q.append((c, d))
    if len(part) > 400:
        for a, b in part:
            keep[a, b] = True
ys, xs = np.nonzero(keep)
y0, y1, x0, x1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
# its soft edge from the scan's own greys, kept only round the letters
alpha = np.clip((200 - src[y0:y1, x0:x1]) / 150, 0, 1)
near = np.zeros_like(keep)
for dy in range(-3, 4):
    for dx in range(-3, 4):
        near |= np.roll(np.roll(keep, dy, 0), dx, 1)
alpha *= near[y0:y1, x0:x1]
INK = (39, 37, 32)  # the CC's own ink, read off the drawn head
cb = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
cb[..., :3] = INK
cb[..., 3] = (alpha * 255).round()
cb = Image.fromarray(cb)

drum = Image.open("assets/drum.webp").convert("RGBA")
LOGO = (180, 210, 305, 365)  # the CC on the flipped drum (flip_drum.py: LOGO moved to ten o'clock)
BLANK_DOWN = 170
lx0, ly0, lx1, ly1 = LOGO
drum.paste(drum.crop((lx0, ly0 + BLANK_DOWN, lx1, ly1 + BLANK_DOWN)), (lx0, ly0))
TALL = 165  # a little taller than the CC was, so his mark reads from across the room
cb = cb.resize((round(cb.width * TALL / cb.height), TALL), Image.LANCZOS)
cx, cy = (lx0 + lx1) / 2, (ly0 + ly1) / 2
drum.alpha_composite(cb, (round(cx - cb.width / 2), round(cy - cb.height / 2)))
drum.save("assets/drum.webp", "WEBP", quality=90, method=6)
print("CB on the drum,", cb.size)
