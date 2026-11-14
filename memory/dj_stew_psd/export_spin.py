from psd_tools import PSDImage
from PIL import Image
import os, json

psd = PSDImage.open('/app/memory/dj_stew_psd/dj_stew.psd')
root = psd[0]
OX, OY = root.left, root.top
OUT = '/app/frontend/public/assets/dj-stew'
manifest = json.load(open(os.path.join(OUT, 'manifest.json')))

def find_path(layers, path):
    cur = layers
    for name in path:
        found = None
        for l in cur:
            if l.name == name:
                found = l
                break
        if found is None:
            return None
        cur = found
    return found

def L(path):
    l = find_path(root, path)
    if l is None: raise Exception('not found: ' + str(path))
    return l

def save(layer, key, fname):
    was_visible = layer.visible
    layer.visible = True
    b = layer.bbox
    manifest[key] = {'x': b[0]-OX, 'y': b[1]-OY, 'w': b[2]-b[0], 'h': b[3]-b[1], 'file': fname}
    img = layer.composite()
    img.save(os.path.join(OUT, fname))
    layer.visible = was_visible
    print('saved', fname, img.size)

# Disc (static base, never rotates) for both turntables
save(L(['+Turntable', '+Record', 'Disc']), 'disc_right', 'disc-right.png')
save(L(['+Turntable', '+Record Right', 'Disc']), 'disc_left', 'disc-left.png')

# 4-frame spinning shadow/glint cycle for each turntable — toggling these
# fakes rotation without literally spinning the angled artwork.
for side, path_name in [('right', '+Record'), ('left', '+Record Right')]:
    spin_group = L(['+Turntable', path_name, 'Shadow spinning'])
    spin_group.visible = True
    for i in ['1', '2', '3', '4']:
        frame = find_path(spin_group, [i])
        save(frame, f'spin_{side}_{i}', f'spin-{side}-{i}.png')
    spin_group.visible = False

with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print('DONE')
