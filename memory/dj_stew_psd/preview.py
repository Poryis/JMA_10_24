from PIL import Image
import os
OUT = '/app/frontend/public/assets/dj-stew'
STAGE_W, STAGE_H = 3232, 2269
SCALE = 0.45
canvas = Image.new('RGBA', (int(STAGE_W*SCALE), int(STAGE_H*SCALE)), (40,20,60,255))

# rel positions computed earlier (relative to stage origin 413,431)
pieces = [
  ('turntable-outline.png', 0, 1237, 3232, 1032),
  ('record-left.png', 199, 1292, 772, 245),
  ('record-right.png', 1732, 1279, 803, 254),
  ('needle-left.png', 2197, 1337, 338, 165),
  ('needle-right.png', 115, 1346, 338, 165),
  ('drum-machine.png', 958, 1264, 796, 319),
  ('faders-track.png', 1143, 1303, 440, 221),
  ('body.png', 1001, 800, 631, 802),
  ('head-base.png', 827, 0, 827, 907),
  ('eyes.png', 1012, 256, 299, 339),
  ('wing-right-idle.png', 513, 861, 532, 601),
  ('wing-left-idle.png', 1514, 302, 402, 899),
]
for fname, x, y, w, h in pieces:
    p = os.path.join(OUT, fname)
    if not os.path.exists(p):
        print('MISSING', fname); continue
    img = Image.open(p).convert('RGBA')
    img = img.resize((max(1,int(w*SCALE)), max(1,int(h*SCALE))), Image.LANCZOS)
    canvas.alpha_composite(img, (int(x*SCALE), int(y*SCALE)))

canvas.save('/app/memory/dj_stew_psd/preview.png')
print('saved preview')
