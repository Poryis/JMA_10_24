from psd_tools import PSDImage
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
    print('saved', fname, img.size, 'mode', img.mode)

wing_l = L(['Left wing'])
btn1 = find_path(wing_l, ['Stews left wing swap set', 'on buttons'])
btn2 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 2'])
btn3 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 3'])
save(btn1, 'wing_left_press1', 'wing-left-press1.png')
save(btn2, 'wing_left_press2', 'wing-left-press2.png')
save(btn3, 'wing_left_press3', 'wing-left-press3.png')

wing_r = L(['Right wing'])
on_rec_push = find_path(wing_r, ['swaps', 'on record push'])
save(on_rec_push, 'wing_right_push', 'wing-right-push.png')

with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print('DONE')
