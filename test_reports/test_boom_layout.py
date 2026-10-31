"""Frontend-only regression: rhythm-room layout, overlays and complete sessions."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path('/app/test_reports')
BASE = next(line.split('=', 1)[1].strip() for line in Path('/app/frontend/.env').read_text().splitlines() if line.startswith('REACT_APP_BACKEND_URL='))
RESULTS = []
SEED = """() => {for (const k of ['jma_unlock_all_v1','jma_player_name_skipped_v1','jma_reveal_seen_v1']) localStorage.setItem(k,'1')}"""
BOUNDS = """() => {
 const room=document.querySelector('.boom-room'), W=visualViewport.width,H=visualViewport.height;
 const ids=['boom-toolbar','boom-phase-banner','boom-stew-art','boom-stew-hint','boom-strips','boom-match-replay','boom-match-strip-0','boom-match-strip-1','boom-match-strip-2','boom-how-to-play-card','boom-how-to-play-start','count-in-overlay','boom-round-summary','boom-play-again','boom-session-restart','boom-session-modes','back-button'];
 const out={viewport:[W,H],roomHeight:room.getBoundingClientRect().height,fitStage:!!document.querySelector('[data-testid="fit-stage"]'),items:[],outside:[],clipped:[],overflows:[]};
 for(const id of ids){const el=document.querySelector(`[data-testid="${id}"]`);if(!el||!el.getClientRects().length)continue;const r=el.getBoundingClientRect();out.items.push({id,x:r.x,y:r.y,w:r.width,h:r.height});if(r.x<-.5||r.y<-.5||r.right>W+.5||r.bottom>H+.5)out.outside.push(id);if(el.scrollWidth>el.clientWidth+2)out.overflows.push(id);}
 for(const el of document.querySelectorAll('.rhythm-strip [data-testid*="-block-"] span')){if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)out.clipped.push({text:el.textContent,w:el.clientWidth,sw:el.scrollWidth});}
 out.brokenImages=[...document.querySelectorAll('.boom-room img')].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src);
 return out;
}"""

async def record(page, tag):
    data = await page.evaluate(BOUNDS)
    RESULTS.append({'tag': tag, **data})
    print(tag, 'OUTSIDE', data['outside'], 'OVERFLOW', data['overflows'], 'LABELS', data['clipped'], flush=True)
    return data

async def dismiss(page):
    for id in ['orientation-dismiss','audio-unlock-overlay']:
        loc=page.get_by_test_id(id)
        if await loc.is_visible():
            await loc.click(force=True)
            await loc.wait_for(state='hidden',timeout=10000)
            await page.wait_for_timeout(200)
    await page.evaluate("async () => {if(document.fullscreenElement) await document.exitFullscreen()}")

async def enter(page, mode):
    if await page.get_by_test_id('boom-back-modes').is_visible():
        await page.get_by_test_id('boom-back-modes').click(force=True)
    await page.get_by_test_id('boom-mode-'+mode).click(force=True)
    await page.get_by_test_id('boom-how-to-play-start').wait_for(state='visible',timeout=6000)
    await page.wait_for_timeout(400)

async def prepare(browser,touch=False):
    context=await browser.new_context(viewport={'width':1920,'height':800},has_touch=touch)
    page=await context.new_page()
    await page.goto(BASE+'/#/boom-garden')
    await page.evaluate(SEED)
    await page.reload()
    await page.get_by_test_id('boom-mode-copy').wait_for()
    await page.wait_for_timeout(1500)
    await dismiss(page)
    return context,page

async def matrix(browser, name):
    context,page=await prepare(browser,True)
    for mode in ['copy','match','trail']:
        await enter(page,mode)
        for w,h in [(1920,800),(1440,900),(1366,768),(1024,768),(844,390),(844,300),(812,290),(667,275),(568,260),(320,568),(390,844),(768,1024)]:
            try:
                await page.set_viewport_size({'width':w,'height':h})
                await dismiss(page)
                await page.wait_for_timeout(250)
                await record(page,f'{name}:{mode}:{w}x{h}:instructions')
            except Exception as e: print('FAIL matrix instructions',str(e),flush=True)
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        for level in ['cadet','pro','master']:
            await page.get_by_test_id('boom-play-level-'+level).click(force=True)
            for w,h in [(1920,800),(1440,900),(1366,768),(1024,768),(844,390),(844,300),(812,290),(667,275),(568,260),(320,568),(390,844),(768,1024)]:
                try:
                    await page.set_viewport_size({'width':w,'height':h})
                    await dismiss(page)
                    await page.wait_for_timeout(180)
                    await record(page,f'{name}:{mode}:{level}:{w}x{h}:play')
                    if level=='master' and (w,h) in [(1920,800),(568,260),(320,568),(844,300)]:
                        await page.screenshot(path=str(ROOT/'screens'/f'boom_{name}_{mode}_{w}_{h}.jpg'),quality=40,full_page=False)
                except Exception as e: print('FAIL matrix play',str(e),flush=True)
    # Simulate visible viewport smaller than layout viewport, dispatch actual listener event.
    await page.set_viewport_size({'width':844,'height':390})
    await page.evaluate("""() => {Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>290});visualViewport.dispatchEvent(new Event('resize'))}""")
    await page.wait_for_timeout(400)
    data=await record(page,name+':visualViewport_override_290')
    assert data['roomHeight']==290
    await context.close()

async def sessions(browser):
    context,page=await prepare(browser,True)
    await page.get_by_test_id('boom-tempo-turbo').click(force=True)
    await page.set_viewport_size({'width':568,'height':260})
    for mode in ['match','copy','trail']:
        await enter(page,mode)
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        for round in range(1,6):
            try:
                root=page.get_by_test_id('boom-mode-page-'+mode)
                await page.wait_for_function("m=>document.querySelector('[data-testid=boom-mode-page-'+m+']').dataset.phase==='input'",arg=mode,timeout=25000)
                if mode=='match':
                    if round==1:
                        await page.get_by_test_id('boom-match-replay').click(force=True)
                        print('PASS replay click',flush=True)
                    await page.get_by_test_id(f'match-{(round-1)%3}-block-0').click(force=True)
                else:
                    old=await page.get_by_test_id('boom-stew-drummer').get_attribute('data-hits')
                    await page.get_by_test_id('boom-stew-drummer').click(force=True)
                    await page.keyboard.press('Space')
                    await page.get_by_test_id('boom-play-main').dispatch_event('pointerdown',{'bubbles':True,'pointerId':1})
                    new=await page.get_by_test_id('boom-stew-drummer').get_attribute('data-hits')
                    print('PASS tap/space/blank animations',mode,old,new,flush=True)
                await page.get_by_test_id('boom-round-summary').wait_for(timeout=25000)
                await page.wait_for_timeout(400)
                await record(page,f'session:{mode}:round{round}:reveal')
                await page.get_by_test_id('boom-play-again').click(force=True)
                print('PASS round',mode,round,flush=True)
            except Exception as e:
                print('FAIL session',mode,round,str(e),flush=True)
                RESULTS.append({'tag':f'session:{mode}:{round}','failure':str(e)})
                break
        if await page.get_by_test_id('boom-session-summary').is_visible():
            await page.wait_for_timeout(500)
            await record(page,'session:'+mode+':complete')
            await page.screenshot(path=str(ROOT/'screens'/f'boom_session_{mode}.jpg'),quality=40,full_page=False)
            await page.get_by_test_id('boom-session-restart').click(force=True)
            await page.get_by_test_id('boom-session-summary').wait_for(state='hidden')
            assert 'Round 1' in await page.get_by_test_id('boom-round-counter').inner_text()
            print('PASS restart',mode,flush=True)
        await page.get_by_test_id('boom-back-modes').click(force=True)
        await page.get_by_test_id('boom-mode-copy').wait_for(state='visible')
        assert await page.get_by_test_id('boom-mode-copy').is_visible()
        print('PASS back modes',mode,flush=True)
    error_text=await page.evaluate("""() => {const errorElements = Array.from(document.querySelectorAll('.error, [class*="error"], [id*="error"]'));return errorElements.map(el=>el.textContent).join(', ')}""")
    print('Found error message: '+error_text if error_text else 'No error messages found on the page',flush=True)
    await context.close()

async def main():
    (ROOT/'screens').mkdir(exist_ok=True)
    async with async_playwright() as p:
        for name in ['chromium','webkit']:
            try:
                browser=await getattr(p,name).launch(headless=True)
                await matrix(browser,name)
                if name=='chromium': await sessions(browser)
                await browser.close()
                print('PASS browser',name,flush=True)
            except Exception as e:
                print('FAIL browser',name,str(e),flush=True)
                RESULTS.append({'tag':name,'failure':str(e)})
    (ROOT/'boom_layout_results.json').write_text(json.dumps(RESULTS,indent=2))

if __name__=='__main__': asyncio.run(main())