"""Focused bounds: short-screen notes, fullscreen obstruction, keyboard and tap feedback."""
import asyncio
import json
from test_boom_layout import ROOT,prepare,enter,dismiss,record,RESULTS
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context,page=await prepare(browser,True)
        await page.set_viewport_size({'width':568,'height':260})
        await page.wait_for_timeout(500)
        await enter(page,'match')
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-match]').dataset.phase==='input'")
        info=await page.evaluate("""()=>{
          const f=document.querySelector('[data-testid=fullscreen-button]').getBoundingClientRect();
          return {notes:[...document.querySelectorAll('.rhythm-strip img')].map(e=>{const r=e.getBoundingClientRect(), b=e.parentElement.getBoundingClientRect(),s=e.nextElementSibling.getBoundingClientRect();return {note:e.alt,w:r.width,h:r.height,blockH:b.height,labelClipped:s.bottom>b.bottom-2,imageClipped:r.bottom>b.bottom-2}}),overlap:[...document.querySelectorAll('.rhythm-strip')].map(e=>{const r=e.getBoundingClientRect();return Math.max(0,Math.min(r.right,f.right)-Math.max(r.left,f.left))*Math.max(0,Math.min(r.bottom,f.bottom)-Math.max(r.top,f.top))})};}""")
        RESULTS.append({'tag':'short-match-readability',**info})
        print('MATCH DETAIL',info,flush=True)
        await page.screenshot(path=str(ROOT/'screens'/'boom_match_input_568_260.jpg'),quality=40,full_page=False)
        await page.get_by_test_id('boom-back-modes').click(force=True)
        await page.get_by_test_id('boom-mode-copy').wait_for()
        await page.set_viewport_size({'width':844,'height':300})
        await page.wait_for_timeout(400)
        await enter(page,'copy')
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-copy]').dataset.phase==='countin'",timeout=15000)
        await record(page,'detail:copy:countin')
        await page.screenshot(path=str(ROOT/'screens'/'boom_countin_844_300.jpg'),quality=40,full_page=False)
        before=await page.get_by_test_id('boom-stew-art').bounding_box()
        await page.keyboard.down('Space')
        await page.get_by_test_id('boom-sustain-ring').wait_for()
        h1=await page.get_by_test_id('boom-stew-drummer').get_attribute('data-hits')
        await page.wait_for_timeout(500)
        h2=await page.get_by_test_id('boom-stew-drummer').get_attribute('data-hits')
        await page.keyboard.up('Space')
        print('SPACE HOLD',h1,h2,flush=True)
        assert h1==h2
        await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-copy]').dataset.phase==='input'",timeout=6000)
        await page.get_by_test_id('boom-stew-drummer').click(force=True)
        await page.wait_for_timeout(200)
        await page.mouse.click(410,280)
        await page.wait_for_timeout(200)
        await page.keyboard.press('Space')
        hitCount=await page.get_by_test_id('boom-stew-drummer').get_attribute('data-hits')
        after=await page.get_by_test_id('boom-stew-art').bounding_box()
        print('TAP DETAILS',h2,hitCount,before,after,flush=True)
        RESULTS.append({'tag':'tap-keyboard-animation','before':before,'after':after,'hitsBefore':h2,'hitsAfter':hitCount,'spaceRepeatPrevented':h1==h2})
        await page.wait_for_timeout(200)
        await page.set_viewport_size({'width':390,'height':844})
        await dismiss(page)
        await page.wait_for_timeout(400)
        await record(page,'detail:orientation:portrait')
        await page.set_viewport_size({'width':844,'height':300})
        await page.wait_for_timeout(400)
        await record(page,'detail:orientation:landscape')
        await context.close()
        await browser.close()
    (ROOT/'boom_detail_results.json').write_text(json.dumps(RESULTS,indent=2))

if __name__=='__main__':asyncio.run(main())