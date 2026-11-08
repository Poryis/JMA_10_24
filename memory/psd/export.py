from PIL import Image
import numpy as np, json
S = 0.75
out = '/app/frontend/public/assets/shred/'
L = Image.open('lights-copy.png'); a = np.array(L)
segs = [(79, 277), (296, 485), (513, 697), (725, 895), (924, 1084), (1119, 1297), (1324, 1510), (1532, 1731)]
cuts = [0] + [(segs[i][1] + segs[i + 1][0]) // 2 for i in range(7)] + [L.size[0]]
lamps = []
for i in range(8):
    x0, x1 = cuts[i], cuts[i + 1]
    sub = a[:, x0:x1]
    ys, xs = np.where(sub[:, :, 3] > 20); y0, y1 = int(ys.min()), int(ys.max() + 1); xa, xb = int(xs.min() + x0), int(xs.max() + 1 + x0)
    crop = L.crop((xa, y0, xb, y1))
    c = np.array(crop).astype(int)
    sat = c[:, :, :3].max(axis=2) - c[:, :, :3].min(axis=2); sm = (c[:, :, 3] > 200) & (sat > 100)
    col = [int(v) for v in c[sm][:, :3].mean(axis=0)]
    crop.resize((int(crop.size[0] * S), int(crop.size[1] * S)), Image.LANCZOS).save(out + f'lamp-{i}.webp', quality=88)
    lamps.append(dict(x=313 + xa, y=-151 + y0, w=xb - xa, h=y1 - y0, color=col))
print(json.dumps(lamps))
names = {'background': 'background', 'dark-back-curtains': 'back-curtains', 'top-curtain': 'top-curtain', 'stage': 'riser', 'marshal': 'marshall', 'wedge-monitor-right': 'wedge-right', 'wedge-monitor-left': 'wedge-left', 'amps': 'amps', 'left-bottom-sound': 'cone-lb', 'right-bottom-sound': 'cone-rb', 'right-top-sound-copy': 'cone-rt', 'right-top-sound-copy-2': 'cone-lt', 'rectangle-1': 'light-bar', 'left-curtain': 'curtain-left', 'right-curtain': 'curtain-right'}
for k, v in names.items():
    im = Image.open(k + '.png'); im = im.resize((max(1, int(im.size[0] * S)), max(1, int(im.size[1] * S))), Image.LANCZOS); im.save(out + v + '.webp', quality=88)
