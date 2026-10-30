import json, os
from psd_tools import PSDImage
from PIL import Image, ImageDraw
import numpy as np

psd = PSDImage.open('/tmp/academy.psd')
W, H = psd.size
OUT = '/app/frontend/public/assets/academy/room'
os.makedirs(OUT, exist_ok=True)
SCALE = 1920 / W  # export canvas 1920x1080

def by_name(name, root=psd):
    for l in root.descendants():
        if l.name == name: return l
    raise KeyError(name)

def comp(layer):
    # composite a layer/group onto a full transparent canvas
    im = layer.composite(viewport=(0, 0, W, H))
    return im.convert('RGBA')

pos = {}
def save_prop(key, img, pad=6):
    a = np.array(img)[:, :, 3]
    ys, xs = np.where(a > 8)
    if len(xs) == 0: print('empty', key); return
    x0, x1, y0, y1 = max(0, xs.min()-pad), min(W, xs.max()+pad+1), max(0, ys.min()-pad), min(H, ys.max()+pad+1)
    crop = img.crop((x0, y0, x1, y1))
    crop = crop.resize((round((x1-x0)*SCALE), round((y1-y0)*SCALE)), Image.LANCZOS)
    crop.save(f'{OUT}/{key}.png', optimize=True)
    pos[key] = { 'left': round(x0/W*100, 2), 'top': round(y0/H*100, 2), 'width': round((x1-x0)/W*100, 2), 'height': round((y1-y0)/H*100, 2) }
    print(key, crop.size, pos[key])

# --- plate: background + doorway linework + coral accents, doorway hole cut to transparent
plate = comp(by_name('background plate use this'))
for name in ['extra line work for doorway and edges', 'coral accents']:
    layer = by_name(name)
    plate = Image.alpha_composite(plate, comp(layer))
arr = np.array(plate)
# flood fill the white doorway from its centre
rgb = arr[:, :, :3].astype(int)
white = (rgb.min(axis=2) > 235)
from collections import deque
cx, cy = (1288+1751)//2, 800
mask = np.zeros((H, W), bool)
q = deque([(cy, cx)]); mask[cy, cx] = True
while q:
    y, x = q.popleft()
    for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0 <= ny < H and 0 <= nx < W and not mask[ny, nx] and white[ny, nx]:
            mask[ny, nx] = True; q.append((ny, nx))
ys, xs = np.where(mask)
hole = { 'left': round(xs.min()/W*100, 2), 'top': round(ys.min()/H*100, 2), 'width': round((xs.max()-xs.min()+1)/W*100, 2), 'height': round((ys.max()-ys.min()+1)/H*100, 2) }
print('hole bbox px', xs.min(), ys.min(), xs.max(), ys.max(), hole)
# soften edge: feather 2px
from PIL import ImageFilter
m = Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
alpha = Image.fromarray(arr[:, :, 3])
alpha = Image.fromarray(np.minimum(np.array(alpha), 255 - np.array(m)).astype('uint8'))
plate.putalpha(alpha)
plate_s = plate.resize((1920, 1080), Image.LANCZOS)
plate_s.save(f'{OUT}/plate.png', optimize=True)
pos['hole'] = hole
# save the hole mask shape as a small png (for clip) too
Image.fromarray((mask*255).astype('uint8')).crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1)).resize((round((xs.max()-xs.min()+1)*SCALE), round((ys.max()-ys.min()+1)*SCALE))).save(f'{OUT}/hole-mask.png')

# --- props
chalk = Image.alpha_composite(comp(by_name('chalkboard base')), comp(by_name('blank chalkboard bg')))
save_prop('chalkboard', chalk)
save_prop('chalk-doodles', comp(by_name('Quest board elements')))
save_prop('shield', comp(by_name('shield logo and plaque copy')))
save_prop('lectern', comp(by_name('lectern', by_name('acchievement book'))))
save_prop('book', comp(by_name('book')))
save_prop('harp', comp(by_name('Whimsical Orange Starfish Harp')))
save_prop('trumpet', comp(by_name('Pink Seashell Trumpet Horn')))
save_prop('lantern-left', comp(by_name(' Lantern left')))
save_prop('lantern-right', comp(by_name(' Lantern right')))
save_prop('art-station', comp(by_name('ALbum art stastion')))
save_prop('guitar', comp(by_name('guitar')))
json.dump(pos, open(f'{OUT}/layout.json', 'w'), indent=1)
print(json.dumps(pos))
