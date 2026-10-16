import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]

# magenta-ness: high R and B, low G
mag = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
alpha = np.clip((0.55 - mag) / 0.35, 0, 1)  # mag>=0.55 -> 0, mag<=0.20 -> 1

# despill: pull G up toward min(R,B) on semi-transparent fringe pixels
fringe = (alpha > 0) & (alpha < 1)
g2 = np.where(fringe, np.maximum(g, np.minimum(r, b) * 0.85), g)
rgb = np.stack([r, g2, b], axis=-1)

out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
img = img.crop(bbox)
img.save(dst)
print(img.size)
