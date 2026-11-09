import zipfile, os
from PIL import Image, ImageDraw
P = '/app/frontend/public/assets/'
tv = Image.open(P + 'plaza/crt-tv.png').convert('RGBA').transpose(Image.FLIP_LEFT_RIGHT)
W, H = tv.size
sx, sy, sw, sh = int(0.078 * W), int(0.313 * H), int(0.485 * W), int(0.498 * H)
base = Image.new('RGBA', tv.size, (0, 0, 0, 0))
scr = Image.new('RGBA', (sw, sh), (11, 16, 51, 255))
mask = Image.new('L', (sw, sh), 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, sh - 1), radius=int(sw * 0.1), fill=255)
logo = Image.open(P + 'ui/jmatv-logo-v2.png').convert('RGBA')
lw = int(sw * 0.62); logo = logo.resize((lw, int(logo.size[1] * lw / logo.size[0])), Image.LANCZOS)
scr.alpha_composite(logo, ((sw - lw) // 2, (sh - logo.size[1]) // 2))
base.paste(scr, (sx, sy), mask)
base.alpha_composite(tv)
os.makedirs('/app/memory/zip_src', exist_ok=True)
base.save('/app/memory/zip_src/jmatv-with-screen.png')

files = {
  'Campus - Academy.png': 'plaza/academy.png', 'Campus - Dressing Room.png': 'plaza/dressing-room.png',
  'Campus - Sticker Shack.png': 'plaza/sticker-shack.png', 'Campus - Main Stage.png': 'plaza/bandstand.png',
  'Campus - Quest Board.png': 'plaza/quest-board.png', 'Campus - JMAtv (empty screen).png': 'plaza/crt-tv.png',
  'Gate - Play.png': 'plaza/gate-play.png', 'Gate - Learn.png': 'plaza/gate-learn.png', 'Gate - Create.png': 'plaza/gate-create.png',
  'Play - Jelly Jukebox.png': 'campus/jukebox-diner.png', 'Play - Shred City.png': 'campus/shred-club.png',
  'Play - Stew Kazoo Says.png': 'campus/stew-room-kazoo.png', 'Play - Note Match.png': 'campus/note-match.png',
  'Play - Dr Jellybone Office.png': 'campus/detective-office.png', 'Play - Sight-Reading Sprint.png': 'campus/sight-reading.png',
  'Play - Robot Boogie.png': 'campus/robot-boogie.png', 'Learn - Music 101.png': 'campus/music-101.png',
  'Learn - Fun Facts Clubhouse.png': 'campus/fun-facts.png', 'Learn - Whos Got the Rhythm.png': 'campus/football-field.png',
  'Learn - Ear Quest.png': 'campus/ear-quest.png', 'Learn - Name That Note.png': 'campus/name-that-note.png',
  'Create - Beat Lab.png': 'campus/beat-lab.png', 'Create - Jam Session.png': 'campus/jam-session.png',
  'Create - Charlies Song Studio.png': 'campus/song-studio.png',
}
with zipfile.ZipFile('/app/frontend/public/downloads/jma-buildings.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for name, src in files.items():
        z.write(P + src, name)
    z.write('/app/memory/zip_src/jmatv-with-screen.png', 'Campus - JMAtv.png')
print(os.path.getsize('/app/frontend/public/downloads/jma-buildings.zip'))
