import json, os
from psd_tools import PSDImage
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

psd = PSDImage.open('/tmp/academy.psd')
W, H = psd.size
OUT = '/app/frontend/public/assets/academy/room'
SCALE = 1920 / W

def by_name(name, root=psd):
    for l in root.descendants():
        if l.name == name: return l
    raise KeyError(name)
def comp(layer): return layer.composite(viewport=(0, 0, W, H)).convert('RGBA')

pos = {}
def save_prop(key, img, pad=6):
    a = np.array(img)[:, :, 3]; ys, xs = np.where(a > 8)
    if len(xs) == 0: print('empty', key); return
    x0, x1, y0, y1 = max(0, xs.min()-pad), min(W, xs.max()+pad+1), max(0, ys.min()-pad), min(H, ys.max()+pad+1)
    crop = img.crop((x0, y0, x1, y1)).resize((round((x1-x0)*SCALE), round((y1-y0)*SCALE)), Image.LANCZOS)
    crop.save(f'{OUT}/{key}.png', optimize=True)
    pos[key] = { 'left': f'{x0/W*100:.2f}%', 'top': f'{y0/H*100:.2f}%', 'width': f'{(x1-x0)/W*100:.2f}%' }

# plate = background + doorway linework (coral accents now live on their own layers)
plate = Image.alpha_composite(comp(by_name('background plate use this')), comp(by_name('extra line work for doorway and edges')))
arr = np.array(plate); white = (arr[:, :, :3].astype(int).min(axis=2) > 235)
cx, cy = (1288+1751)//2, 800
mask = np.zeros((H, W), bool); q = deque([(cy, cx)]); mask[cy, cx] = True
while q:
    y, x = q.popleft()
    for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0 <= ny < H and 0 <= nx < W and not mask[ny, nx] and white[ny, nx]:
            mask[ny, nx] = True; q.append((ny, nx))
m = Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
plate.putalpha(Image.fromarray(np.minimum(arr[:, :, 3], 255 - np.array(m)).astype('uint8')))
plate.resize((1920, 1080), Image.LANCZOS).save(f'{OUT}/plate.webp', 'WEBP', quality=82, method=6)

# every visible coral accent as its own layer
coral = by_name('coral accents')
n = 0
for l in coral:
    if not l.visible: continue
    n += 1
    save_prop(f'coral-{n:02d}', comp(l))
json.dump(pos, open(f'{OUT}/coral.json', 'w'))
src = "// Generated from the Academy PSD by /app/memory/export_academy_coral.py — coral accent layer positions (% of the 1920x1080 room).\nexport const CORAL = " + json.dumps([{ 'id': k, **v } for k, v in pos.items()], indent=0).replace('"', "'") + ";\n"
open('/app/frontend/src/data/academyRoom.js', 'w').write(src)
print(n, 'coral layers'); print(src[:400])
