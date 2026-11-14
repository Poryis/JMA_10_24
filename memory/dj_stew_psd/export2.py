from psd_tools import PSDImage
from PIL import Image
import os, json

psd = PSDImage.open('/app/memory/dj_stew_psd/dj_stew.psd')
root = psd[0]
OX, OY = root.left, root.top
OUT = '/app/frontend/public/assets/dj-stew'
os.makedirs(OUT, exist_ok=True)
manifest = {}

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

def save(layer, key, fname):
    b = layer.bbox
    manifest[key] = {'x': b[0]-OX, 'y': b[1]-OY, 'w': b[2]-b[0], 'h': b[3]-b[1], 'file': fname}
    img = layer.composite()
    img.save(os.path.join(OUT, fname))
    print('saved', fname, img.size, manifest[key])

def L(path):
    l = find_path(root, path)
    if l is None: raise Exception('not found: ' + str(path))
    return l

# drum machine ON (default, already correct) / OFF (all Color sublayers hidden)
drum = L(['+Drum machine'])
save(drum, 'drum_on', 'drum-machine-on.png')

def all_color_layers(grp):
    out = []
    for l in grp:
        if l.is_group():
            if l.name.lower() in ('color',):
                out.append(l)
            out.extend(all_color_layers(l))
    return out

colors = all_color_layers(drum)
print('found color groups', len(colors))
prev_states = [(c, c.visible) for c in colors]
for c in colors:
    c.visible = False
save(drum, 'drum_off', 'drum-machine-off.png')
for c, v in prev_states:
    c.visible = v

# re-save remaining static pieces with manifest
save(L(['+Stew','Body']), 'body', 'body.png')
save(L(['+Turntable','Outline']), 'turntable_outline', 'turntable-outline.png')
save(L(['+Turntable','+Record']), 'record_right', 'record-right.png')
save(L(['+Turntable','+Record Right']), 'record_left', 'record-left.png')
save(L(['+Turntable','+Needle left']), 'needle_left', 'needle-left.png')
save(L(['+Turntable','+Needle right']), 'needle_right', 'needle-right.png')

eyes = L(['+Stew','+Head','+Beak and Ballss','Blink','Bird Eyes Open copy'])
eyes.visible = False
save(L(['+Stew','+Head']), 'head_base', 'head-base.png')
eyes.visible = True
save(eyes, 'eyes', 'eyes.png')

# right wing frames
wing_r = L(['Right wing'])
off_rec = find_path(wing_r, ['swaps', 'off the record'])
on_rec1 = find_path(wing_r, ['swaps', 'on record 1'])
on_rec_push = find_path(wing_r, ['swaps', 'on record push'])
save(off_rec, 'wing_right_idle', 'wing-right-idle.png')
save(on_rec1, 'wing_right_scratch', 'wing-right-scratch.png')
save(on_rec_push, 'wing_right_push', 'wing-right-push.png')

# left wing frames
wing_l = L(['Left wing'])
flap = find_path(wing_l, ['Stews left wing swap set', 'Bird Flap uo copy'])
btn1 = find_path(wing_l, ['Stews left wing swap set', 'on buttons'])
btn2 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 2'])
btn3 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 3'])
save(flap, 'wing_left_idle', 'wing-left-idle.png')
save(btn1, 'wing_left_press1', 'wing-left-press1.png')
save(btn2, 'wing_left_press2', 'wing-left-press2.png')
save(btn3, 'wing_left_press3', 'wing-left-press3.png')

manifest['_stage'] = {'w': 3232, 'h': 2269}
with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print('DONE')
