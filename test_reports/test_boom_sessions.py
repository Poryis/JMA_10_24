"""Run sessions independently of the screen-size matrix; inspect compact picker."""
import asyncio
import json
from test_boom_layout import ROOT,RESULTS,prepare,sessions,record
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context,page=await prepare(browser,True)
        for w,h in [(844,390),(844,300),(812,290),(667,275),(568,260)]:
            await page.set_viewport_size({'width':w,'height':h})
            await page.wait_for_timeout(400)
            info=await page.evaluate("""()=>{const p=document.querySelector('.bg-picker-main');return {scrollHeight:p.scrollHeight,clientHeight:p.clientHeight,buttons:[...document.querySelectorAll('[data-testid^="boom-tempo"],[data-testid^="boom-level"],[data-testid^="boom-mode-"]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.testid,y:r.y,bottom:r.bottom}})}}""")
            RESULTS.append({'tag':f'picker:{w}x{h}',**info})
            print('PICKER',w,h,info,flush=True)
            if w==568: await page.screenshot(path=str(ROOT/'screens'/'boom_picker_568_260.jpg'),quality=40,full_page=False)
        await context.close()
        try: await sessions(browser)
        except Exception as e:
            RESULTS.append({'tag':'sessions','failure':str(e)})
            print('FAIL',str(e),flush=True)
        await browser.close()
    (ROOT/'boom_sessions_results.json').write_text(json.dumps(RESULTS,indent=2))

if __name__=='__main__':asyncio.run(main())