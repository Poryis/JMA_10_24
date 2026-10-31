"""Complete functional checks separately from the layout sweep; rhythm regression checks."""
import asyncio
import json
from playwright.async_api import async_playwright
from test_boom_layout import prepare,enter,dismiss,ROOT,BASE,SEED
from test_ntn_review import workflows,RESULTS as NTN,record,start,NOTE_Y

RESULTS=[]

async def rhythm_layout(browser):
    context,page=await prepare(browser,True)
    for w,h in [(568,260),(320,568),(390,844)]:
        await page.set_viewport_size({'width':w,'height':h})
        await page.wait_for_timeout(500)
        await dismiss(page)
        await page.wait_for_timeout(300)
        info=await page.evaluate("""()=>{const p=document.querySelector('.bg-picker-main'),blurb=document.querySelector('.bg-picker-blurb').getBoundingClientRect();return {size:[innerWidth,innerHeight],scrollHeight:p.scrollHeight,clientHeight:p.clientHeight,blurbBottom:blurb.bottom,controls:[...document.querySelectorAll('[data-testid^="boom-tempo"],[data-testid^="boom-level"],[data-testid^="boom-mode-"]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.testid,bottom:r.bottom}})}}""")
        RESULTS.append({'tag':'picker',**info})
        print('PICKER',info,flush=True)
        await page.screenshot(path=str(ROOT/'screens'/f'boom_retest_picker_{w}.jpg'),quality=40,full_page=False)
        if w==320:
            for mode in ['copy','trail','match']:
                await enter(page,mode)
                info=await page.get_by_test_id('boom-how-to-play-start').bounding_box()
                card=await page.get_by_test_id('boom-how-to-play-card').evaluate('e=>({scrollHeight:e.scrollHeight,clientHeight:e.clientHeight})')
                RESULTS.append({'tag':'portrait-instructions:'+mode,'start':info,'card':card})
                print('INSTRUCTIONS',mode,info,card,flush=True)
                await page.screenshot(path=str(ROOT/'screens'/f'boom_retest_instructions_{mode}.jpg'),quality=40,full_page=False)
                await page.get_by_test_id('boom-how-to-play-start').click(force=True)
                await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
                await page.get_by_test_id('boom-back-modes').click(force=True)
    await page.set_viewport_size({'width':568,'height':260})
    await page.wait_for_timeout(300)
    await enter(page,'match')
    await page.get_by_test_id('boom-how-to-play-start').click(force=True)
    await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
    for level in ['cadet','pro','master']:
        await page.get_by_test_id('boom-play-level-'+level).click(force=True)
        await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-match]').dataset.phase==='input'",timeout=18000)
        info=await page.evaluate("""()=>{const f=document.querySelector('[data-testid=fullscreen-button]').getBoundingClientRect(),header=document.querySelector('.boom-room header .game-card').getBoundingClientRect();return {level:document.querySelector('[data-testid=boom-play-level-master]').textContent,notes:[...document.querySelectorAll('.rhythm-strip img')].map(e=>{const r=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect(),s=e.nextElementSibling.getBoundingClientRect();return {note:e.alt,w:r.width,h:r.height,blockH:b.height,label:e.nextElementSibling.textContent,labelClipped:s.bottom>b.bottom-1,imageClipped:r.bottom>b.bottom-1}}),overlap:[...document.querySelectorAll('.rhythm-strip')].map(e=>{const r=e.getBoundingClientRect();return Math.max(0,Math.min(r.right,f.right)-Math.max(r.left,f.left))*Math.max(0,Math.min(r.bottom,f.bottom)-Math.max(r.top,f.top))}),headerFullscreenOverlap:Math.max(0,Math.min(header.right,f.right)-Math.max(header.left,f.left))*Math.max(0,Math.min(header.bottom,f.bottom)-Math.max(header.top,f.top))}}""")
        RESULTS.append({'tag':'match-readability:'+level,**info})
        print('MATCH',level,info,flush=True)
        await page.screenshot(path=str(ROOT/'screens'/f'boom_retest_match_{level}.jpg'),quality=40,full_page=False)
        await page.get_by_test_id('boom-match-replay').click(force=True)
        await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-match]').dataset.phase==='input'",timeout=15000)
        await page.get_by_test_id('match-0-block-0').click(force=True)
        await page.get_by_test_id('boom-round-summary').wait_for()
        print('PASS match replay and actual answer',level,flush=True)
    await context.close()

async def scores(browser):
    for mode in ['copy','trail']:
        for auto in [True,False]:
            context,page=await prepare(browser,True)
            await page.get_by_test_id('boom-tempo-turbo').click(force=True)
            await enter(page,mode)
            await page.get_by_test_id('boom-how-to-play-start').click(force=True)
            await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
            for round in range(1,6):
                await page.wait_for_function("m=>document.querySelector('[data-testid=boom-mode-page-'+m+']').dataset.phase==='input'",arg=mode,timeout=18000)
                for _ in range(5):
                    if await page.get_by_test_id('boom-mode-page-'+mode).get_attribute('data-phase')!='input':break
                    await page.keyboard.press('Space')
                    await page.wait_for_timeout(570)
                await page.get_by_test_id('boom-round-summary').wait_for(timeout=18000)
                await page.wait_for_timeout(250)
                header=await page.locator('.boom-room header .game-card').last.inner_text()
                if round<5 or not auto:await page.get_by_test_id('boom-play-again').click(force=True)
            await page.get_by_test_id('boom-session-summary').wait_for(timeout=6500)
            final=await page.get_by_test_id('session-final-score').inner_text()
            result={'tag':f'score:{mode}:{"auto" if auto else "manual"}','header':header,'summary':final,'pass':header==final}
            print('SCORE',result,flush=True)
            RESULTS.append(result)
            await context.close()

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context=await browser.new_context(viewport={'width':844,'height':300},has_touch=True)
        page=await context.new_page()
        try:
            await page.goto(BASE+'/#/name-that-note')
            await page.evaluate(SEED)
            await page.reload()
            await page.wait_for_timeout(1500)
            await dismiss(page)
            await workflows(page)
        except Exception as e:
            NTN.append({'tag':'followup-failure','failure':str(e)})
            print('FAIL NTN',str(e),flush=True)
        (ROOT/'ntn_followup_results.json').write_text(json.dumps(NTN,indent=2))
        await context.close()
        for name,fn in [('rhythm-layout',rhythm_layout),('scores',scores)]:
            try:await fn(browser)
            except Exception as e:
                RESULTS.append({'tag':name,'failure':str(e)})
                print('FAIL',name,str(e),flush=True)
        (ROOT/'review_followup_results.json').write_text(json.dumps(RESULTS,indent=2))
        await browser.close()

if __name__=='__main__':asyncio.run(main())