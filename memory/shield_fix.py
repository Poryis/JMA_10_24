from PIL import Image
import numpy as np
src = '/app/frontend/public/assets/plaza/academy.webp'
b = Image.open(src).convert('RGBA')
logo = Image.open('/app/frontend/public/assets/ui/logo.png').convert('RGBA')

def red_bbox(im, region=None):
    a = np.array(im).astype(int)
    m = (a[:, :, 0] > 190) & (a[:, :, 1] < 70) & (a[:, :, 2] < 70) & (a[:, :, 3] > 200)
    if region:
        x0, y0, x1, y1 = region; mm = np.zeros_like(m); mm[y0:y1, x0:x1] = m[y0:y1, x0:x1]; m = mm
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max(), ys.max()

bx0, by0, bx1, by1 = red_bbox(b, (675, 395, 830, 500))
lx0, ly0, lx1, ly1 = red_bbox(logo)
print('building red', bx0, by0, bx1, by1, 'logo red', lx0, ly0, lx1, ly1)
s = (bx1 - bx0) / (lx1 - lx0)
ss = 3  # paste at 3x the building's resolution, then the whole image is upscaled 1.5x for crispness
up = 1.5
B = b.resize((int(b.size[0] * up), int(b.size[1] * up)), Image.LANCZOS)
L = logo.resize((int(logo.size[0] * s * up), int(logo.size[1] * s * up)), Image.LANCZOS)
ox = int(bx0 * up - lx0 * s * up); oy = int(by0 * up - ly0 * s * up)
B.alpha_composite(L, (ox, oy))
B.save('/app/memory/academy_new.webp', quality=92)
B.crop((int(560 * up), int(360 * up), int(900 * up), int(600 * up))).save('/tmp/acad_new_crop.png')
print(B.size)
