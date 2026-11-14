from PIL import Image
import json, os
OUT = '/app/frontend/public/assets/dj-stew'
manifest = json.load(open(os.path.join(OUT,'manifest.json')))
STAGE_W, STAGE_H = manifest['_stage']['w'], manifest['_stage']['h']
SCALE = 0.45
canvas = Image.new('RGBA', (int(STAGE_W*SCALE), int(STAGE_H*SCALE)), (40,20,60,255))

order = ['body','head_base','eyes','turntable_outline','record_left','record_right',
         'needle_left','needle_right','drum_on',
         'wing_right_scratch','wing_left_press1']
for key in order:
    m = manifest[key]
    img = Image.open(os.path.join(OUT, m['file'])).convert('RGBA')
    w, h = int(m['w']*SCALE), int(m['h']*SCALE)
    img = img.resize((max(1,w), max(1,h)), Image.LANCZOS)
    canvas.alpha_composite(img, (int(m['x']*SCALE), int(m['y']*SCALE)))
canvas.save('/app/memory/dj_stew_psd/preview2.png')
print('ok')
