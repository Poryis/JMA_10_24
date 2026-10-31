"""Focused reproductions: label clipping, Finn crops, drag settling and Trail round/score tracking."""
import asyncio,json
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
from test_boom_layout import ROOT,BASE,SEED,dismiss,prepare,enter
from test_ntn_review import start,record,drag,NOTE_Y

RESULTS=[]
async def ntn(browser):
    context=await browser.new_context(viewport={'width':568,'height':260},has_touch=True)
    page=await context.new_page()
    await page.goto(BASE+'/#/name-that-note')
    await page.evaluate(SEED)
    await page.reload()
    await page.wait_for_timeout(1500)
    await dismiss(page)
    await start(page,'name','master','both')
    await page.wait_for_timeout(500)
    RESULTS.append({'tag':'both-label-repro',**(await record(page,'confirmed-both-label-repro'))})
    await page.screenshot(path=str(ROOT/'screens'/'ntn_confirmed_both_568.jpg'),quality=40,full_page=False)
    await start(page,'place','cadet')
    for w,h in [(812,290),(568,260)]:
        await page.set_viewport_size({'width':w,'height':h})
        await page.wait_for_timeout(400)
        for n,y in NOTE_Y.items():
            await drag(page,n)
            await page.wait_for_timeout(600)
            actual=await page.get_by_test_id('ntn-drag-note').evaluate('e=>parseFloat(e.style.top)-.6')
            result={'tag':f'settled-drag:{w}:{n}','expected':y,'actual':actual,'pass':abs(actual-y)<.1}
            RESULTS.append(result)
            print('DRAG',result,flush=True)
    for w,h in [(568,260),(320,568),(390,844),(1920,800)]:
        await page.set_viewport_size({'width':w,'height':h})
        await page.wait_for_timeout(500)
        await dismiss(page)
        await page.wait_for_timeout(500)
        await page.get_by_test_id('ntn-menu-btn').click()
        await page.wait_for_timeout(600)
        RESULTS.append({'tag':f'settled-menu:{w}',**(await record(page,f'settled-menu:{w}'))})
        await page.screenshot(path=str(ROOT/'screens'/f'ntn_confirmed_menu_{w}.jpg'),quality=40,full_page=False)
        await start(page,'place','master','both',skip=False)
        await page.wait_for_timeout(1000)
        RESULTS.append({'tag':f'tour:{w}',**(await record(page,f'tour:{w}'))})
        await page.screenshot(path=str(ROOT/'screens'/f'ntn_tour_{w}.jpg'),quality=40,full_page=False)
        await page.get_by_test_id('ntn-skip-tour-btn').click()
    await context.close()

async def trail(browser):
    for auto in [True,False]:
        context,page=await prepare(browser,True)
        await page.get_by_test_id('boom-tempo-turbo').click(force=True)
        await enter(page,'trail')
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        rounds=[]
        for iteration in range(1,8):
            if await page.get_by_test_id('boom-session-summary').is_visible():break
            await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-trail]').dataset.phase==='input'",timeout=18000)
            counter=await page.get_by_test_id('boom-round-counter').inner_text()
            for _ in range(5):
                if await page.get_by_test_id('boom-mode-page-trail').get_attribute('data-phase')!='input':break
                await page.keyboard.press('Space')
                await page.wait_for_timeout(570)
            await page.get_by_test_id('boom-round-summary').wait_for(timeout=15000)
            await page.wait_for_timeout(250)
            header=await page.locator('.boom-room header .game-card').last.inner_text()
            rounds.append({'round':counter,'score':header})
            print('TRAIL ROUND',auto,counter,header,flush=True)
            if not auto:await page.get_by_test_id('boom-play-again').click(force=True)
            else:
                await page.get_by_test_id('boom-round-summary').wait_for(state='hidden',timeout=6500)
            await page.wait_for_timeout(200)
        complete=await page.get_by_test_id('boom-session-summary').is_visible()
        final=await page.get_by_test_id('session-final-score').inner_text() if complete else None
        result={'tag':'trail:'+('auto' if auto else 'manual'),'rounds':rounds,'summary':final,'scorePass':complete and final==header,'roundCountPass':len(rounds)==5,'complete':complete}
        print('TRAIL RESULT',result,flush=True)
        RESULTS.append(result)
        await context.close()

async def main():
    for path in ['assets/characters/finn-danger.png','assets/characters/fit/finn-disco.webp']:
        im=Image.open(Path('/app/frontend/public')/path).convert('RGBA')
        RESULTS.append({'tag':'asset-crop','src':path,'size':im.size,'alphaBounds':im.getchannel('A').getbbox()})
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        for name,fn in [('ntn',ntn),('trail',trail)]:
            try:await fn(browser)
            except Exception as e:
                RESULTS.append({'tag':name,'failure':str(e)})
                print('FAIL',name,str(e),flush=True)
        await browser.close()
    (ROOT/'review_final_results.json').write_text(json.dumps(RESULTS,indent=2))

if __name__=='__main__':asyncio.run(main())