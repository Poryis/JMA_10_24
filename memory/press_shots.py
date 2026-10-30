import asyncio, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1]
OUT = '/app/frontend/public/press/screenshots'
SEED = """
localStorage.setItem('jma_unlock_all_v1','1');
localStorage.setItem('jma_reveal_seen_v1','1');
localStorage.setItem('jma_player_name_skipped_v1','1');
localStorage.setItem('jma_avatar_v1', JSON.stringify({character:'charlie', outfit:'classic'}));
localStorage.setItem('jma_tour_v1', JSON.stringify({done:{t_character:true,t_first_game:true},completedAt:new Date().toISOString(),seen:true}));
"""
SHOTS = [
  ('01-academy', '/academy', 4500),
  ('02-plaza', '/home', 4500),
  ('03-main-stage-street', '/campus?zone=play', 4500),
  ('04-learn-street', '/campus?zone=learn', 4500),
  ('05-create-street', '/campus?zone=create', 4500),
  ('06-dressing-room', '/dressing-room', 3500),
  ('07-jam-session', '/free-play', 4000),
  ('09-jelly-jukebox', '/rhythm-game', 4000),
  ('10-detective', '/detective', 3500),
  ('14-jmatv', '/jmatv', 4000),
  ('15-sight-reading', '/sight-reading', 3500),
  ('16-song-studio', '/song-studio', 3500),
]

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    for size, tag in [((1920, 1080), 'desktop'), ((1366, 1024), 'tablet')]:
      ctx = await b.new_context(viewport={'width': size[0], 'height': size[1]}, device_scale_factor=1)
      page = await ctx.new_page()
      await page.goto(BASE + '/#/academy'); await page.evaluate(SEED); await page.reload()
      for i, (name, route, wait) in enumerate(SHOTS):
        try:
          await page.goto(BASE + '/#' + route); await page.wait_for_timeout(1500)
          (await page.mouse.click(size[0] // 2, size[1] // 2)) if i == 0 else None; await page.wait_for_timeout(wait)
          await page.keyboard.press('Escape'); await page.wait_for_timeout(400)
          await page.screenshot(path=f'{OUT}/{tag}/{name}.jpg', type='jpeg', quality=88)
          print('ok', tag, name)
        except Exception as e:
          print('fail', tag, name, e)
      await ctx.close()
    await b.close()

asyncio.run(main())
