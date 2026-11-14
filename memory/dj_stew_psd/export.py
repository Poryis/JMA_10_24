from psd_tools import PSDImage
from PIL import Image
import os

psd = PSDImage.open('/app/memory/dj_stew_psd/dj_stew.psd')
root = psd[0]
OX, OY = root.left, root.top
OUT = '/app/frontend/public/assets/dj-stew'
os.makedirs(OUT, exist_ok=True)

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

def save(layer, fname, max_dim=1100):
    img = layer.composite()
    if img is None:
        print('EMPTY', fname); return
    w, h = img.size
    scale = min(1.0, max_dim / max(w, h))
    if scale < 1.0:
        img = img.resize((max(1,int(w*scale)), max(1,int(h*scale))), Image.LANCZOS)
    img.save(os.path.join(OUT, fname))
    print('saved', fname, img.size)

def L(path):
    l = find_path(root, path)
    if l is None: raise Exception('not found: ' + str(path))
    return l

# --- simple static pieces ---
save(L(['+Stew','Body']), 'body.png')
save(L(['+Turntable','Outline']), 'turntable-outline.png')
save(L(['+Turntable','+Record']), 'record-right.png')       # visually right deck
save(L(['+Turntable','+Record Right']), 'record-left.png')  # visually left deck
save(L(['+Turntable','+Needle left']), 'needle-left.png')
save(L(['+Turntable','+Needle right']), 'needle-right.png')
save(L(['+Drum machine']), 'drum-machine.png')

# --- head with eyes hidden (base), then eyes isolated ---
eyes = L(['+Stew','+Head','+Beak and Ballss','Blink','Bird Eyes Open copy'])
eyes.visible = False
save(L(['+Stew','+Head']), 'head-base.png')
eyes.visible = True
save(eyes, 'eyes.png')

# --- faders: track-only (all knob subgroups hidden) + each knob isolated ---
fader_group = L(['+Turntable','Faders'])
knob_names = ['1','2','3','4']
knobs = {n: find_path(fader_group, [n]) for n in knob_names}
for n, k in knobs.items():
    k.visible = False
save(fader_group, 'faders-track.png')
for n, k in knobs.items():
    k.visible = True
for n, k in knobs.items():
    save(k, f'fader-knob-{n}.png', max_dim=300)

# --- right wing: idle (off the record) vs scratch (on record 1) ---
wing_r = L(['Right wing'])
off_rec = find_path(wing_r, ['swaps', 'off the record'])
on_rec1 = find_path(wing_r, ['swaps', 'on record 1'])
on_rec_push = find_path(wing_r, ['swaps', 'on record push'])
on_rec1.visible = False
on_rec_push.visible = False
off_rec.visible = True
save(wing_r, 'wing-right-idle.png')
off_rec.visible = False
on_rec1.visible = True
save(wing_r, 'wing-right-scratch.png')
on_rec1.visible = False
on_rec_push.visible = True
save(wing_r, 'wing-right-push.png')
# restore defaults
on_rec_push.visible = False
off_rec.visible = True

# --- left wing: idle (flap) vs 3 "on buttons" press frames ---
wing_l = L(['Left wing'])
flap = find_path(wing_l, ['Stews left wing swap set', 'Bird Flap uo copy'])
flap_alt = find_path(wing_l, ['Stews left wing swap set', 'Bird Flap uo'])
btn1 = find_path(wing_l, ['Stews left wing swap set', 'on buttons'])
btn2 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 2'])
btn3 = find_path(wing_l, ['Stews left wing swap set', 'on buttons 3'])
anchor = find_path(wing_l, ['anchor point'])
if anchor: anchor.visible = False
for l in [flap_alt, btn1, btn2, btn3]:
    l.visible = False
flap.visible = True
save(wing_l, 'wing-left-idle.png')
flap.visible = False
for name, l in [('1', btn1), ('2', btn2), ('3', btn3)]:
    l.visible = True
    save(wing_l, f'wing-left-press{name}.png')
    l.visible = False
flap.visible = True
if anchor: anchor.visible = True

print('DONE')
