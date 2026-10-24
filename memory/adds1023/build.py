from PIL import Image
Image.MAX_IMAGE_PIXELS = None
import os
SRC = '/app/memory/adds1023/adds/'
CH = '/app/frontend/public/assets/characters/'
MAXH = 900

def export(src, dst, maxh=MAXH, pad=0.0, q=85):
    im = Image.open(src).convert('RGBA')
    bb = im.getbbox(); im = im.crop(bb)
    if pad:
        p = int(im.height * pad); c = Image.new('RGBA', (im.width + 2 * p, im.height + 2 * p), (0, 0, 0, 0)); c.paste(im, (p, p)); im = c
    s = min(1.0, maxh / max(im.height, im.width / 1.6))
    if s < 1: im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)
    print(os.path.basename(dst), im.size, os.path.getsize(dst) // 1024, 'KB')

# outfits
export(SRC + 'Charlie Thumbs up.png', CH + 'charlie-captain.webp')
export(SRC + 'Charlie puppet pinstripes.png', CH + 'charlie-pinstripes.webp')
export(SRC + 'Reggae Charlie.png', CH + 'charlie-reggae.webp')
export(SRC + 'zebra charlie4.png', CH + 'charlie-zebra.webp')
export(SRC + 'Steampunk fin.png', CH + 'finn-dapper.webp')
export(SRC + 'electrician Finn.png', CH + 'finn-electrician.webp')
export(SRC + 'Jazzy Jaguar steampunk.png', CH + 'jazzy-dapper.webp')
export(SRC + 'Jazzy Jaguar posing for card.png', CH + 'jazzy-tiger.webp')
export(SRC + 'Disco pose Jazzy.png', CH + 'jazzy-showtime.webp')
export(SRC + 'Driver Jazzy.png', CH + 'jazzy-roadtrip.webp')
export(SRC + 'Steampunk Llama.png', CH + 'lou-dapper.webp')
export(SRC + 'Llama lou drinking tea.png', CH + 'lou-tea.webp')
export(SRC + 'llama lou spitting fire.png', CH + 'lou-spitfire.webp')
export(SRC + 'Steampunk J-Bone.png', CH + 'dr-jellybone-dapper.webp')
export(SRC + 'jellybone discol.png', CH + 'dr-jellybone-disco.webp')
# secret friends
export(SRC + 'dolphin.png', CH + 'dolphin.webp')
export(SRC + 'Pepperoni Pete Puppet.png', CH + 'pepperoni-pete.webp')
export(SRC + 'Goldfish Gil.png', CH + 'goldfish-gil.webp')
export(SRC + 'Seahorse rest puppet.png', CH + 'seahorse-sal.webp')
export('/app/frontend/public/assets/ui/sun.png', CH + 'the-sun.webp')
export(SRC + 'Elephant gerald.png', CH + 'elephant-gerald.webp')
# plaza clammo + academy poster
export(SRC + 'Clammo1.png', '/app/frontend/public/assets/plaza/clammo-1.webp', maxh=420)
export(SRC + 'Clammo2.png', '/app/frontend/public/assets/plaza/clammo-2.webp', maxh=420)
export(SRC + 'pbj movie poster.png', '/app/frontend/public/assets/academy/pbj-poster.webp', maxh=900, q=82)
