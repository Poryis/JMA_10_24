"""Frontend-only public preview: Name That Note viewport/content bounds and real pointer workflows."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from test_boom_layout import BASE, ROOT, SEED, dismiss

RESULTS=[]
SIZES=[(1920,800),(1366,768),(1024,768),(768,1024),(844,390),(844,300),(812,290),(667,275),(568,260),(320,568),(390,844)]
NOTE_Y={'C':77,'D':71.5,'E':66,'F':60.5,'G':55,'A':49.5,'B':44,'High C':38.5}
SCAN="""()=>{
const W=visualViewport.width,H=visualViewport.height,room=document.querySelector('.ntn-room');
const ids=['ntn-question','ntn-score','ntn-time','ntn-streak','ntn-tools','ntn-staff-box','ntn-finn-image','ntn-bubble','ntn-check-btn','ntn-hear-btn','ntn-skip-tour-btn'];
const controls=[...document.querySelectorAll('.ntn-room button')].filter(e=>e.getClientRects().length);
const items=[...new Set([...ids.map(id=>document.querySelector(`[data-testid="${id}"]`)).filter(Boolean),...controls])];
const rect=e=>{const r=e.getBoundingClientRect();return {id:e.dataset.testid,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
const outside=items.map(rect).filter(r=>r.x<-.5||r.y<-.5||r.right>W+.5||r.bottom>H+.5);
const clipped=[];for(const e of items){if(!e.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(e);const a=range.getBoundingClientRect(),b=e.getBoundingClientRect();if(a.left<b.left-.5||a.right>b.right+.5||a.top<b.top-.5||a.bottom>b.bottom+.5)clipped.push({id:e.dataset.testid,text:e.textContent,content:{x:a.x,y:a.y,w:a.width,h:a.height},box:rect(e)});}
const scrolls=[...document.querySelectorAll('.ntn-room,.ntn-room *')].filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+1).map(e=>e.dataset.testid||e.className);
const tools=[...document.querySelectorAll('.ntn-tools button,[data-testid=fullscreen-button]')],hud=[...document.querySelectorAll('.ntn-hud>div')];
const overlaps=[];for(const a of tools)for(const b of hud){const r=a.getBoundingClientRect(),s=b.getBoundingClientRect(),area=Math.max(0,Math.min(r.right,s.right)-Math.max(r.left,s.left))*Math.max(0,Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top));if(area>1)overlaps.push({a:a.dataset.testid,b:b.dataset.testid,area});}
return {size:[W,H],state:room.dataset.gameState,height:room.getBoundingClientRect().height,outside,clipped,scrolls,overlaps,documentScroll:document.documentElement.scrollHeight>innerHeight+1,staff:document.querySelector('[data-testid=ntn-staff-box]')?rect(document.querySelector('[data-testid=ntn-staff-box]')):null,finn:document.querySelector('[data-testid=ntn-finn-image]')?{...rect(document.querySelector('[data-testid=ntn-finn-image]')),src:document.querySelector('[data-testid=ntn-finn-image]').getAttribute('src')}:null,broken:[...room.querySelectorAll('img')].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src)};
}"""

async def record(page,tag):
    data=await page.evaluate(SCAN)
    RESULTS.append({'tag':tag,**data})
    if data['outside'] or data['clipped'] or data['overlaps'] or data['scrolls']:
        print('ISSUE',tag,'outside',[e['id'] for e in data['outside']],'clipped',[e['id'] for e in data['clipped']],'overlaps',data['overlaps'],'scroll',data['scrolls'],flush=True)
    return data

async def menu(page):
    if await page.get_by_test_id('ntn-win-menu').is_visible():await page.get_by_test_id('ntn-win-menu').click()
    elif await page.get_by_test_id('ntn-menu-btn').is_visible():await page.get_by_test_id('ntn-menu-btn').click()
    await page.get_by_test_id('ntn-mode-name').wait_for()

async def start(page,mode='name',level='cadet',labels='letters',skip=True):
    await menu(page)
    await page.get_by_test_id('ntn-mode-'+mode).click()
    await page.get_by_test_id('ntn-answer-mode-'+labels).click()
    await page.get_by_test_id('ntn-difficulty-'+level).click()
    await page.get_by_test_id('ntn-tour-note').wait_for()
    if skip:
        await page.get_by_test_id('ntn-skip-tour-btn').click()
        await page.wait_for_function("()=>document.querySelector('[data-testid=name-that-note-playing]').dataset.gameState==='playing'")
        await page.wait_for_timeout(180)

async def drag(page,note):
    b=await page.get_by_test_id('ntn-staff-box').bounding_box()
    x=b['x']+b['width']*.6
    await page.mouse.move(x,b['y']+b['height']*.93)
    await page.mouse.down()
    await page.mouse.move(x,b['y']+b['height']*NOTE_Y[note]/100,steps=8)
    await page.mouse.up()
    await page.wait_for_timeout(120)
    assert await page.get_by_test_id('ntn-check-btn').is_enabled()

async def target(page,mode):
    if mode=='place':return (await page.get_by_test_id('ntn-hear-btn').inner_text()).replace('Hear ','').strip()
    y=await page.get_by_test_id('ntn-target-note').evaluate("e=>parseFloat(e.style.top)-.6")
    return min(NOTE_Y,key=lambda n:abs(NOTE_Y[n]-y))

async def workflows(page):
    await page.set_viewport_size({'width':844,'height':300})
    await start(page)
    await page.get_by_test_id('ntn-hint-btn').click()
    await page.get_by_test_id('ntn-hint-ghosts').wait_for()
    print('PASS hint',flush=True)
    await page.get_by_test_id('ntn-review-btn').click()
    await page.get_by_test_id('ntn-tour-note').wait_for()
    await page.wait_for_function("()=>document.querySelector('[data-testid=name-that-note-playing]').dataset.gameState==='playing'",timeout=12000)
    assert await page.get_by_test_id('ntn-question').inner_text()=='Note 1 / 10'
    print('PASS replay complete tour retains question',flush=True)
    await page.get_by_test_id('ntn-restart-btn').click()
    await page.get_by_test_id('ntn-skip-tour-btn').click()
    assert await page.get_by_test_id('ntn-score').inner_text()=='0 pts'
    print('PASS restart',flush=True)
    for mode in ['name','place']:
        await start(page,mode)
        for q in range(1,11):
            await page.wait_for_timeout(240)
            n=await target(page,mode)
            choice=n if q!=2 else next(v for v in list(NOTE_Y)[:5] if v!=n)
            if mode=='name': await page.get_by_test_id('ntn-answer-'+choice.replace(' ','-')).click()
            else:
                await page.get_by_test_id('ntn-hear-btn').click()
                if q==3:
                    await page.set_viewport_size({'width':568,'height':260})
                    await page.wait_for_timeout(250)
                    assert await page.get_by_test_id('ntn-question').inner_text()==f'Note {q} / 10'
                await drag(page,choice)
                await page.get_by_test_id('ntn-check-btn').click(force=True)
            await page.wait_for_timeout(220)
            await record(page,f'feedback:{mode}:{q}')
            if q in [1,3,4]:
                await page.screenshot(path=str(ROOT/'screens'/f'ntn_{mode}_mood_q{q}.jpg'),quality=40,full_page=False)
            if q==2 and mode=='place':await page.get_by_test_id('ntn-reveal-note').wait_for()
            if q<10:await page.wait_for_function("q=>document.querySelector('[data-testid=ntn-question]').textContent==='Note '+q+' / 10'",arg=q+1,timeout=4000)
        await page.get_by_test_id('ntn-round-complete').wait_for()
        line=await page.get_by_test_id('ntn-final-line').inner_text()
        assert '9 / 10 notes' in line
        assert await page.get_by_test_id('ntn-missed').is_visible()
        RESULTS.append({'tag':'round:'+mode,'summary':line,'pass':True})
        print('PASS complete round',mode,line,flush=True)
        await page.screenshot(path=str(ROOT/'screens'/f'ntn_summary_{mode}.jpg'),quality=40,full_page=False)
        await page.get_by_test_id('ntn-win-again').click()
        await page.get_by_test_id('ntn-tour-note').wait_for()
        print('PASS play again',mode,flush=True)
    # All 8 actual staff drop locations, then resize and repeat.
    await start(page,'place','pro')
    for w,h in [(812,290),(568,260)]:
        await page.set_viewport_size({'width':w,'height':h})
        await page.wait_for_timeout(200)
        for n,y in NOTE_Y.items():
            await drag(page,n)
            actual=await page.get_by_test_id('ntn-drag-note').evaluate('e=>parseFloat(e.style.top)-.6')
            await page.wait_for_timeout(100)
            actual=await page.get_by_test_id('ntn-drag-note').evaluate('e=>parseFloat(e.style.top)-.6')
            RESULTS.append({'tag':f'drag:{w}x{h}:{n}','expected':y,'actual':actual,'pass':abs(actual-y)<1})
        # Restart before the timed question expires.
        await start(page,'place','pro')
    print('PASS real pointer position checks executed',flush=True)
    await start(page)
    q=await page.get_by_test_id('ntn-question').inner_text()
    await page.set_viewport_size({'width':844,'height':390})
    await page.evaluate("()=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>290});visualViewport.dispatchEvent(new Event('resize'))}")
    await page.wait_for_timeout(250)
    d=await record(page,'visualViewport:290')
    assert d['height']==290 and await page.get_by_test_id('ntn-question').inner_text()==q
    await page.evaluate("()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'))}")
    print('PASS visualViewport height updates preserve question',flush=True)
    # Regression against an uncancelled answer-advance timeout in the source.
    await page.get_by_test_id('ntn-answer-'+(await target(page,'name')).replace(' ','-')).click()
    await page.get_by_test_id('ntn-restart-btn').click()
    await page.wait_for_timeout(1300)
    state=await page.get_by_test_id('name-that-note-playing').get_attribute('data-game-state')
    question=await page.get_by_test_id('ntn-question').inner_text()
    RESULTS.append({'tag':'restart-during-feedback','state':state,'question':question,'pass':question=='Note 1 / 10'})
    print('RESTART DURING FEEDBACK',state,question,flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context=await browser.new_context(viewport={'width':1920,'height':800},has_touch=True)
        page=await context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        try:
            await page.goto(BASE+'/#/name-that-note')
            await page.evaluate(SEED)
            await page.reload()
            await page.wait_for_timeout(1500)
            await dismiss(page)
            for w,h in SIZES:
                await page.set_viewport_size({'width':w,'height':h})
                await dismiss(page)
                await page.wait_for_timeout(220)
                await record(page,f'menu:{w}x{h}')
                if w in [320,568]:await page.screenshot(path=str(ROOT/'screens'/f'ntn_menu_{w}.jpg'),quality=40,full_page=False)
            for mode in ['name','place']:
                for level in ['cadet','pro','master']:
                    for labels in ['letters','solfege','both']:
                        await start(page,mode,level,labels)
                        for w,h in SIZES:
                            await page.set_viewport_size({'width':w,'height':h})
                            await dismiss(page)
                            await page.wait_for_timeout(130)
                            await record(page,f'play:{mode}:{level}:{labels}:{w}x{h}')
                            if labels=='both' and level=='master' and w in [1920,568,320,390]:
                                await page.screenshot(path=str(ROOT/'screens'/f'ntn_{mode}_{w}_{h}.jpg'),quality=40,full_page=False)
            print('PASS matrix completed 198 gameplay and 11 menu observations',flush=True)
            await workflows(page)
        except Exception as e:
            RESULTS.append({'tag':'harness-failure','failure':str(e)})
            print('FAIL',str(e),flush=True)
        error_text=await page.evaluate("""() => {const errorElements = Array.from(document.querySelectorAll('.error, [class*="error"], [id*="error"]'));return errorElements.map(el => el.textContent).join(', ')}""")
        print('Found error message: '+error_text if error_text else 'No error messages found on the page',flush=True)
        RESULTS.append({'tag':'page-errors','errors':errors})
        await context.close()
        await browser.close()
        try:
            wk=await p.webkit.launch(headless=True)
            await wk.close()
            RESULTS.append({'tag':'webkit','available':True,'tested':False})
        except Exception as e:RESULTS.append({'tag':'webkit','available':False,'error':str(e)})
    (ROOT/'ntn_review_results.json').write_text(json.dumps(RESULTS,indent=2))

if __name__=='__main__':asyncio.run(main())