from PIL import Image
import numpy as np
src = Image.open('/tmp/academy-new2.webp').convert('RGBA')
W, H = src.size  # 2000x1828
a = np.array(src)

def pct(x0, y0, x1, y1):
    # square box: image width = 100%, height 91.4% bottom-aligned → top offset 8.6%
    return dict(left=round(x0/W*100, 2), top=round(8.6 + y0/H*91.4, 2), width=round((x1-x0)/W*100, 2), height=round((y1-y0)/H*91.4, 2))

# flag cloth: right of the pole. find pole column: alpha column density in y 540..780 around x 1590..1640
reg = a[540:780, 1580:1660, 3] > 10
cols = reg.sum(axis=0)
pole_x = 1580 + int(np.argmax(cols))
print('pole x', pole_x)
# cloth bbox: alpha right of pole+12
sub = a[480:792, pole_x+26:2000, 3] > 10
ys, xs = np.where(sub)
fx0, fy0, fx1, fy1 = pole_x+26+xs.min(), 480+ys.min()-2, pole_x+26+xs.max()+3, 480+ys.max()+3
print('flag bbox', fx0, fy0, fx1, fy1, pct(fx0, fy0, fx1, fy1))
flag = src.crop((fx0, fy0, fx1, fy1))
# weathervane: everything above the spire tip. find roof top y: first row where alpha spans > 150px wide
rows = (a[:, :, 3] > 10).sum(axis=1)
roof_y = 258
print('roof/spire y', roof_y)
vy1 = roof_y + 2
sub = a[0:vy1, :, 3] > 10
ys, xs = np.where(sub)
vx0, vy0, vx1 = xs.min()-2, max(0, ys.min()-2), xs.max()+3
print('vane bbox', vx0, vy0, vx1, vy1, pct(vx0, vy0, vx1, vy1))
vane = src.crop((vx0, vy0, vx1, vy1))
# base without flag cloth + vane
base = a.copy()
base[fy0:fy1, fx0:fx1, 3] = 0
base[vy0:vy1, vx0:vx1, 3] = 0
base_im = Image.fromarray(base)
out = '/app/frontend/public/assets/plaza/'
base_im.resize((1200, round(H*1200/W)), Image.LANCZOS).save(out+'academy.webp', 'WEBP', quality=88, method=6)
flag.resize((round(flag.width*0.6), round(flag.height*0.6)), Image.LANCZOS).save(out+'academy-flag.png', optimize=True)
vane.resize((round(vane.width*0.6), round(vane.height*0.6)), Image.LANCZOS).save(out+'academy-vane.png', optimize=True)
print('pole pct x', round(pole_x/W*100, 2))
