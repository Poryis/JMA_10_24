import subprocess, re, glob, os
V = '/app/frontend/public/assets/voice/'
C1 = '/tmp/vo/c1/'
C2 = '/tmp/vo/c2/Charlie 2/'
CH = "/tmp/vo/ch/Scotty's Chunky Lines 9.23.26/"

def c2(name): return glob.glob(C2 + name + ' (*.aif')[0]
def un(stamp): return C2 + f'charlie.UNNAMMED (Freeze) [2026-11-06 {stamp}].aif'

M = {}
for n in ['hub.first', 'hub.morning', 'hub.afternoon', 'hub.evening', 'hub.streak', 'hub.quests', 'hub.alldone', 'jam.takeit',
          'hub.lockbadge', 'academy.rankup', 'hub.lockpass', 'tag.shred', 'tag.jmatv',
          'meta.badge', 'meta.sticker', 'meta.gem', 'meta.rankup', 'meta.questsdone', 'meta.academyopen', 'meta.streak3', 'meta.streak7',
          'shred.opening', 'shred.headliner', 'shred.legend', 'shred.encore', 'shred.toowild', 'shred.flawless',
          'correct.1', 'correct.2', 'correct.3', 'correct.4', 'perfect.1', 'perfect.2', 'miss.1']:
    M['charlie.' + n] = c2('charlie.' + n)
M['charlie.academy.welcome'] = c2('charlie.academy.welcome.')
M['charlie.tag.music101'] = c2('charlie.class.session')
M['charlie.tag.songstudio'] = c2('charlie.quest.q_song_save')
M.update({
    'charlie.miss.2': un('085611'), 'charlie.miss.3': un('085612'), 'charlie.miss.4': un('085613'),
    'charlie.go.1': un('085615'), 'charlie.go.2': un('085616'), 'charlie.go.3': un('085614'),
    'charlie.dress.pick': C2 + 'charlie.UNNAMMED (Freeze) [2026-11-06 085616]-1.aif', 'charlie.dress.wear': un('085618'),
    'charlie.howto.jukebox': un('085710'), 'charlie.howto.kazoo': un('085714'), 'charlie.howto.earquest': un('085720'),
    'charlie.howto.tempo': un('085721'), 'charlie.howto.notematch': un('085726'),
})
for n, f in [('beatlab', 'beatlab_Take2'), ('boom.copy', 'boom.copy'), ('boom.match', 'boom.match_Take2'), ('boom.trail', 'boom.trail'),
             ('detective', 'detective_Take1'), ('dressing', 'dressing_Take1'), ('funfacts', 'funfacts'), ('jam', 'jam_Take1'),
             ('namenote.name', 'namenote.name'), ('namenote.place', 'namenote.place_Take2'), ('robot', 'robot_Take7'),
             ('shred', 'shred_Take1'), ('sightread', 'sightread_Take2'), ('songstudio', 'songstudio'), ('stage', 'stage')]:
    M['charlie.howto.' + n] = C1 + f'charlie.howto.{f}.wav'
M['charlie.quest.q_shred'] = C1 + 'charlie.quest.q_shred_Take1.wav'
M['charlie.quest.q_song_save'] = C1 + 'charlie.quest.q_song_save.wav'
for i, f in enumerate(['01', '02', '03', '04_Take2', '05', '06_Take2', '07', '08_Take2', '09', '10', '11'], 1):
    M[f'charlie.fact.{i:02d}'] = C1 + f'charlie.singing.{f}.wav'
chunk_order = ['DRUMS are one', 'A drum kit', 'The BIG drum', 'The crispy', 'Cymbals are', 'Drummers have', 'Every country', 'The hi-hat', 'Drumsticks', "You don't need"]
for i, p in enumerate(chunk_order, 1):
    M[f'chunk.fact.{i:02d}'] = glob.glob(CH + glob.escape(p) + '*.aif')[0]
# Dr. Jellybone: second clean pass of the long take, (start, end) seconds
DOC = [(123.60, 132.52), (133.77, 139.68), (141.31, 148.62), (150.05, 159.24), (160.17, 166.60), (167.31, 174.23),
       (175.85, 182.86), (183.63, 190.01), (190.67, 196.92), (197.89, 206.84), (207.53, 215.29)]

def lufs(path):
    o = subprocess.run(['ffmpeg', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])

def render(src, out, ss=None, to=None):
    pre = ['-ss', str(ss), '-to', str(to)] if ss is not None else []
    tmp = '/tmp/vo/_t.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *pre, '-i', src, '-ac', '1', '-ar', '44100',
                    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse',
                    tmp], check=True)
    g = -16 - lufs(tmp)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:level=false',
                    '-b:a', '96k', V + out + '.mp3'], check=True)

for k, src in M.items():
    render(src, k)
for i, (a, b) in enumerate(DOC, 1):
    render('/tmp/vo/doc07.wav', f'doctor.fact.{i:02d}', a, b)
print(len(M) + len(DOC), 'files')
