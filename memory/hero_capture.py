import asyncio, base64, os, sys, shutil
from playwright.async_api import async_playwright

BASE = sys.argv[1]
FR = '/tmp/hero_frames'
SEED = """
localStorage.setItem('jma_unlock_all_v1','1');
localStorage.setItem('jma_reveal_seen_v1','1');
localStorage.setItem('jma_player_name_skipped_v1','1');
localStorage.setItem('jma_avatar_v1', JSON.stringify({character:'charlie', outfit:'classic'}));
localStorage.setItem('jma_tour_v1', JSON.stringify({done:{t_character:true,t_first_game:true},completedAt:new Date().toISOString(),seen:true}));
"""
HIDE = """
const s=document.createElement('style');
s.textContent=`header, [data-testid*="back"], [data-testid*="fullscreen"], [data-testid="campus-swipe-hint"], [data-testid="home-for-parents-link"], [data-testid*="speech"], [data-testid*="shout"], [data-testid*="bubble-say"], [data-testid*="now-playing"], [data-testid*="sign-left"], [data-testid*="sign-right"], .fixed.top-0 {display:none !important}`;
document.head.appendChild(s);
"""

async def main():
  shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
  async with async_playwright() as p:
    b = await p.chromium.launch()
    page = await (await b.new_context(viewport={'width': 1920, 'height': 1080})).new_page()
    await page.goto(BASE + '/#/home'); await page.evaluate(SEED); await page.reload()
    await page.wait_for_timeout(2000)
    await page.mouse.click(960, 540); await page.wait_for_timeout(6000)
    await page.evaluate(HIDE); await page.wait_for_timeout(1000)
    await page.screenshot(path='/tmp/hero_poster.jpg', type='jpeg', quality=90)
    cdp = await page.context.new_cdp_session(page)
    frames = []
    def on(ev):
      frames.append((ev['metadata']['timestamp'], ev['data']))
      async def ack():
        try: await cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
        except Exception: pass
      asyncio.ensure_future(ack())
    cdp.on('Page.screencastFrame', on)
    await cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 92, 'maxWidth': 1920, 'maxHeight': 1080, 'everyNthFrame': 1})
    await page.wait_for_timeout(12500)
    await cdp.send('Page.stopScreencast')
    t0 = frames[0][0]
    with open(f'{FR}/list.txt', 'w') as L:
      for i, (t, d) in enumerate(frames):
        open(f'{FR}/{i:05d}.jpg', 'wb').write(base64.b64decode(d))
        nxt = frames[i + 1][0] if i + 1 < len(frames) else t + 1 / 30
        L.write(f"file '{FR}/{i:05d}.jpg'\nduration {nxt - t:.4f}\n")
    print('frames', len(frames), 'span', frames[-1][0] - t0)
    await b.close()

asyncio.run(main())
