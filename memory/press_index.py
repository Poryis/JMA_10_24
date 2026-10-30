import os, html
os.chdir('/app/frontend/public/press')
rows = []
for d in ['screenshots/desktop', 'screenshots/tablet', 'logos', 'characters', 'buildings', 'underwater-layers', 'academy-room', 'dressing-room']:
    base = d if d.startswith('screenshots') else 'artwork/' + d
    cards = ''.join(f'<a href="{base}/{f}" download><img src="{base}/{f}" loading="lazy"><span>{html.escape(f)}</span></a>' for f in sorted(os.listdir(base)))
    rows.append(f'<h2>{d}</h2><div class="g">{cards}</div>')
head = '''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JMA Press Kit</title>
<style>body{font-family:system-ui;background:#0A2540;color:#fff;margin:0;padding:24px}a.btn{display:inline-block;background:#FFCC00;color:#0A2540;padding:12px 20px;border-radius:999px;font-weight:800;text-decoration:none;margin:4px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.g a{background:#34E0F6;border-radius:12px;padding:8px;color:#0A2540;text-decoration:none;font-size:12px;display:flex;flex-direction:column;gap:6px}.g img{width:100%;height:140px;object-fit:contain}</style>
<h1>JMA Press Kit</h1><a class="btn" href="jma-press-kit.zip" download>Download everything (ZIP)</a><a class="btn" href="README.md">Layer guide (README)</a><p>Tap any image to download it, or copy its link for the site builder.</p>
<h2>Hero loop video (10 s, seamless)</h2><video src="hero/jma-hero-loop-1280.mp4" poster="hero/jma-hero-poster.jpg" autoplay muted loop playsinline style="width:100%;max-width:960px;border-radius:12px"></video>
<p><a class="btn" href="hero/jma-hero-loop-1920.mp4" download>MP4 1920</a><a class="btn" href="hero/jma-hero-loop-1920.webm" download>WebM 1920</a><a class="btn" href="hero/jma-hero-loop-1280.mp4" download>MP4 1280 (phones)</a><a class="btn" href="hero/jma-hero-poster.jpg" download>Poster image</a></p>'''
open('index.html', 'w').write(head + ''.join(rows))
print('done')
