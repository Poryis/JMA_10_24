import subprocess, re, json, itertools
K = '/tmp/kz/'
V = '/app/frontend/public/assets/voice/'
R = '/app/frontend/public/assets/audio/riffs/'
PH = [('08', 0.26, 3.71), ('08', 5.02, 7.48), ('08', 8.94, 11.71), ('08', 13.30, 15.89), ('08', 17.55, 18.43), ('08', 18.70, 19.61),
      ('09', 0.53, 3.03), ('09', 4.27, 7.05), ('09', 9.06, 9.86), ('10', 0.40, 2.06), ('10', 2.66, 4.01)]

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
rot = itertools.cycle(sorted(range(len(PH)), key=lambda i: dur[i]))
order = list(range(len(PH)))
k = 0
for lid, text in lines:
    target = max(0.9, len(text) / 14)
    picks, total = [], 0
    while total < target * 0.8 and len(picks) < 3:
        best = min(order, key=lambda i: (abs(total + dur[i] - target), i in picks))
        picks.append(best); total += dur[best]
        order = order[1:] + order[:1]
    if len(picks) == 1:
        subprocess.run(['cp', f'/tmp/kz/ph{picks[0]}.wav', '/tmp/kz/_l.wav'], check=True)
    else:
        ins = sum([['-i', f'/tmp/kz/ph{p}.wav'] for p in picks], [])
        f = ''.join(f'[{j}:a]' for j in range(len(picks))) + f'concat=n={len(picks)}:v=0:a=1[o]'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f, '-map', '[o]', '/tmp/kz/_l.wav'], check=True)
    finish('/tmp/kz/_l.wav', V + lid + '.mp3', -16)
    k += 1
print(k, 'stew lines')

for n, name in [('01', 'stew-classic-1'), ('02', 'stew-kazoo-1'), ('03', 'stew-drumline-1'), ('04', 'stew-classic-2'),
                ('05', 'stew-classic-3'), ('06', 'stew-kazoo-2'), ('07', 'stew-drumline-2'),
                ('11', 'charlie-disco-1'), ('12', 'charlie-disco-2'), ('13', 'charlie-disco-3'), ('14', 'charlie-disco-4')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{K}Clip_{n}.wav', '-ar', '44100', '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,afade=t=in:d=0.01', '/tmp/kz/_r.wav'], check=True)
    finish('/tmp/kz/_r.wav', R + name + '.mp3', -14, '128k', mono=False)
print('riffs done')
