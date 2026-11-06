"""Make the white background of a generated illustration transparent (for any image source; Gemini cannot make
transparent images, and transparent output from other models still leaves white in enclosed gaps).

python3 <skill>/scripts/people/remove_bg.py assets/generated/<id>.png [--min-hole 300]

1. Flood-fill near-white from every edge pixel (tolerant of soft shading).
2. Remove enclosed near-white areas larger than --min-hole pixels (the gap between a rescuer's arms). Small white
   areas (eyes, shirt highlights, pads) stay.
3. Then run defringe.py on the registered sprite to trim the halo.
Writes over the file. Needs Pillow.
"""
import argparse
from collections import deque

from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('path')
ap.add_argument('--min-hole', type=int, default=300)
a = ap.parse_args()

im = Image.open(a.path).convert('RGBA')
W, H = im.size
key = (255, 0, 255)
work = im.convert('RGB')
for x in range(0, W, 8):
    for y in (0, H - 1):
        if sum(work.getpixel((x, y))) > 3 * 236 and work.getpixel((x, y)) != key:
            ImageDraw.floodfill(work, (x, y), key, thresh=28)
for y in range(0, H, 8):
    for x in (0, W - 1):
        if sum(work.getpixel((x, y))) > 3 * 236 and work.getpixel((x, y)) != key:
            ImageDraw.floodfill(work, (x, y), key, thresh=28)
px, wp = im.load(), work.load()
for y in range(H):
    for x in range(W):
        if wp[x, y] == key:
            px[x, y] = (255, 255, 255, 0)


def white(x: int, y: int) -> bool:
    r, g, b, al = px[x, y]
    return al > 0 and min(r, g, b) > 236 and max(r, g, b) - min(r, g, b) < 14


seen = bytearray(W * H)
holes = 0
for y0 in range(H):
    for x0 in range(W):
        if seen[y0 * W + x0] or not white(x0, y0):
            continue
        comp, q = [], deque([(x0, y0)])
        seen[y0 * W + x0] = 1
        while q:
            x, y = q.popleft(); comp.append((x, y))
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < W and 0 <= ny < H and not seen[ny * W + nx] and white(nx, ny):
                    seen[ny * W + nx] = 1; q.append((nx, ny))
        if len(comp) > a.min_hole:
            for x, y in comp:
                px[x, y] = (0, 0, 0, 0)
            holes += 1
im.save(a.path)
print(a.path, 'background removed; enclosed holes removed:', holes)
