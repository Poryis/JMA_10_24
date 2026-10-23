import sys
from PIL import Image
import numpy as np
from collections import deque

def is_bg(px):
    r, g, b = px
    return abs(int(r)-int(g)) < 14 and abs(int(g)-int(b)) < 14 and 185 <= int(g) <= 255

def dechecker(src, dst):
    im = Image.open(src).convert('RGB')
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
    # soften edge: pixels adjacent to bg get partial alpha based on darkness
    out = np.dstack([a.astype(np.uint8), alpha])
    img = Image.fromarray(out, 'RGBA')
    bbox = img.getbbox()
    img = img.crop(bbox)
    img.save(dst)
    print(dst, img.size, 'bg%%=%.1f' % (100*mask.mean()))

if __name__ == '__main__':
    for name in sys.argv[1:]:
        dechecker(f'/app/memory/drum_pov/{name}.img', f'/app/memory/drum_pov/{name}.png')
