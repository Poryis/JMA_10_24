import zipfile, os
P = '/app/frontend/public/assets/'
files = {
  'Campus - Academy.png': 'plaza/academy.png', 'Campus - Dressing Room.png': 'plaza/dressing-room.png',
  'Campus - Sticker Shack.png': 'plaza/sticker-shack.png', 'Campus - Bandstand (Main Stage).png': 'plaza/bandstand.png',
  'Campus - Quest Board.png': 'plaza/quest-board.png', 'Campus - JMAtv.png': 'plaza/crt-tv.png',
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
os.makedirs('/app/frontend/public/downloads', exist_ok=True)
with zipfile.ZipFile('/app/frontend/public/downloads/jma-buildings.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for name, src in files.items():
        z.write(P + src, name)
print(os.path.getsize('/app/frontend/public/downloads/jma-buildings.zip'))
