import subprocess
A = '/app/frontend/public/assets/audio/'
K = lambda n: f'kazoos/kazoo-{n}.mp3'
S = lambda n: f'sax/{n}.mp3'
D = {'k': 'Bass drum - kick.mp3', 's': 'Snare.mp3', 'h': 'Hi Hat closed.mp3', 't': 'Tom.mp3', 'l': 'Low Tom.mp3', 'c': 'Crash cymbal.mp3', 'r': 'ride bell.mp3'}

def notes(fn, seq, step, last=0.45):
    # seq: list of (note, steps) ; last note rings 'last' seconds
    out = []
    for i, (n, st) in enumerate(seq):
        dur = step * st
        play = last if i == len(seq) - 1 else min(dur, step * st) * 0.9
        out.append((fn(n), play, max(dur, play) if i < len(seq) - 1 else last))
    return out

def drums(pat, step, last=0.8):
    out = []
    for i, h in enumerate(pat):
        if i == len(pat) - 1:
            out.append((D[h], last, last))
        else:
            out.append((D[h], step, step))
    return out

RIFFS = {
    'stew-kazoo':    notes(K, [('C', 1), ('C', 1), ('G', 1), ('G', 1), ('A', 1), ('A', 1), ('G', 2)], 0.13, 0.4),
    'stew-drumline': notes(K, [('G', 1), ('G', 1), ('G', 1), ('E', 1), ('G', 2), ('HighC', 1)], 0.14, 0.45),
    'doctor-detective': notes(S, [('E3', 1), ('F3', 2), ('E3', 1), ('F3', 2), ('B3', 1), ('A3', 1)], 0.16, 0.55),
    'doctor-astro':  notes(S, [('C3', 1), ('G3', 1), ('C4', 1), ('G4', 1), ('C5', 1)], 0.15, 0.55),
    'doctor-disco':  notes(S, [('A3', 1), ('A4', 1), ('A3', 1), ('A4', 1), ('G3', 1), ('G4', 1)], 0.13, 0.4),
    'doctor-dapper': notes(S, [('G3', 1), ('B3', 1), ('D4', 1), ('F4', 2), ('E4', 1)], 0.17, 0.55),
    'chunk-disco':    drums('khshkhsc', 0.13),
    'chunk-marching': drums('sssskssc', 0.11),
    'chunk-steampunk': drums('ttllkrkc', 0.14),
    'charlie-grad': notes(S, [('G3', 1), ('C4', 1), ('E4', 1), ('G4', 2), ('E4', 1), ('G4', 1), ('C5', 1)], 0.14, 0.7),
}

def build(name, segs):
    cmd = ['ffmpeg', '-v', 'error', '-y']
    f = ''
    for i, (file, play, step) in enumerate(segs):
        cmd += ['-i', A + file]
        fo = max(0.0, play - 0.05)
        f += f'[{i}:a]aresample=44100,aformat=channel_layouts=stereo,silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{play:.3f},afade=t=out:st={fo:.3f}:d=0.05,apad,atrim=0:{step:.3f}[a{i}];'
    f += ''.join(f'[a{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1[o]'
    cmd += ['-filter_complex', f, '-map', '[o]', '-ar', '44100', '-b:a', '128k', '/tmp/raw.wav']
    cmd.remove('-b:a'); cmd.remove('128k')
    subprocess.run(cmd, check=True)
    import re
    o = subprocess.run(['ffmpeg', '-i', '/tmp/raw.wav', '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    mean = float(re.search(r'mean_volume: ([-0-9.]+)', o).group(1)); peak = float(re.search(r'max_volume: ([-0-9.]+)', o).group(1))
    gain = min(-15 - mean, -1 - peak + 8)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/raw.wav', '-af', f'volume={gain:.1f}dB,alimiter=limit=0.9', '-b:a', '128k', A + f'riffs/{name}.mp3'], check=True)

for k, v in RIFFS.items():
    build(k, v)
    print(k, 'ok')
