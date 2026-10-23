from PIL import Image
import numpy as np
from collections import deque
import os

OUT = '/app/frontend/public/assets/drums/pov'
os.makedirs(OUT, exist_ok=True)
MAX = 560

def cutout(path):
    im = Image.open(path).convert('RGB')
    a = np.array(im).astype(int)
    h, w, _ = a.shape
    neutral = (np.abs(a[:,:,0]-a[:,:,1]) < 14) & (np.abs(a[:,:,1]-a[:,:,2]) < 14) & (a[:,:,1] >= 185)
    mask = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h-1):
            if neutral[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w-1):
            if neutral[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and neutral[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True; q.append((ny, nx))
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')

for name in ['kick', 'snare', 'racktom', 'floortom', 'hihat', 'crash', 'ride']:
    idle = cutout(f'/app/memory/drum_pov/{name}.img')
    hit = cutout(f'/app/memory/drum_pov/{name}_hit.img')
    b1, b2 = idle.getbbox(), hit.getbbox()
    box = (min(b1[0], b2[0]) - 4, min(b1[1], b2[1]) - 4, max(b1[2], b2[2]) + 4, max(b1[3], b2[3]) + 4)
    box = tuple(max(0, min(v, 1024)) for v in box)
    for frame, img in (('1', idle), ('2', hit)):
        c = img.crop(box)
        c.thumbnail((MAX, MAX), Image.LANCZOS)
        c.save(f'{OUT}/{name}-{frame}.webp', 'WEBP', quality=88, method=6)
    print(name, c.size, os.path.getsize(f'{OUT}/{name}-1.webp')//1024, 'KB', os.path.getsize(f'{OUT}/{name}-2.webp')//1024, 'KB')
