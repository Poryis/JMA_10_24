import subprocess, re, json, itertools
K = '/tmp/kz/'
V = '/app/frontend/public/assets/voice/'
R = '/app/frontend/public/assets/audio/riffs/'
PH = [('08', 0.26, 3.71), ('08', 5.02, 7.48), ('08', 8.94, 11.71), ('08', 13.30, 15.89), ('08', 17.55, 18.43), ('08', 18.70, 19.61),
      ('09', 0.53, 3.03), ('09', 4.27, 7.05), ('09', 9.06, 9.86)]

def lufs(p):
    o = subprocess.run(['ffmpeg', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])

def finish(tmp, out, target, br='96k', mono=True):
    g = target - lufs(tmp)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, *(['-ac', '1'] if mono else []), '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:level=false', '-b:a', br, out], check=True)

def phrase_wav(idx, path):
    c, a, b = PH[idx]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a - 0.05), '-to', str(b + 0.12), '-i', f'{K}Clip_{c}.wav', '-ar', '44100', '-ac', '2',
                    '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.08,areverse', path], check=True)

for i in range(len(PH)):
    phrase_wav(i, f'/tmp/kz/ph{i}.wav')
dur = [b - a for _, a, b in PH]

lines = json.load(open('/tmp/kz/stew_lines.json'))  # [[id, text], ...]
import random
random.seed(7)
deck = []
def draw(avoid):
    global deck
    if not deck:
        deck = list(range(len(PH))); random.shuffle(deck)
    for j, i in enumerate(deck):
        if i not in avoid: return deck.pop(j)
    return deck.pop(0)
k = 0
for lid, text in lines:
    target = max(0.9, len(text) / 14)
    picks, total = [], 0
    while total < target * 0.75 and len(picks) < 4:
        i = draw(picks); picks.append(i); total += dur[i]
    if len(picks) == 1:
        subprocess.run(['cp', f'/tmp/kz/ph{picks[0]}.wav', '/tmp/kz/_l.wav'], check=True)
    else:
        ins = sum([['-i', f'/tmp/kz/ph{p}.wav'] for p in picks], [])
        f = ''.join(f'[{j}:a]' for j in range(len(picks))) + f'concat=n={len(picks)}:v=0:a=1[o]'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f, '-map', '[o]', '/tmp/kz/_l.wav'], check=True)
    r = random.uniform(0.9, 1.12)  # pitch/speed wobble so repeated phrases still sound different
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/kz/_l.wav', '-af', f'asetrate={int(44100 * r)},aresample=44100', '/tmp/kz/_w.wav'], check=True)
    finish('/tmp/kz/_w.wav', V + lid + '.mp3', -16)
    print(lid, picks, round(r, 2))
    k += 1
print(k, 'stew lines')

for n, name in [('01', 'stew-classic-1'), ('02', 'stew-kazoo-1'), ('03', 'stew-drumline-1'), ('04', 'stew-classic-2'),
                ('05', 'stew-classic-3'), ('06', 'stew-kazoo-2'), ('07', 'stew-drumline-2'),
                ('10', 'charlie-disco-5'), ('11', 'charlie-disco-1'), ('12', 'charlie-disco-2'), ('13', 'charlie-disco-3'), ('14', 'charlie-disco-4')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{K}Clip_{n}.wav', '-ar', '44100', '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,afade=t=in:d=0.01', '/tmp/kz/_r.wav'], check=True)
    finish('/tmp/kz/_r.wav', R + name + '.mp3', -14, '128k', mono=False)
print('riffs done')
