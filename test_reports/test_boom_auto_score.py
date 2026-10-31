"""Copy mode automatic session score must equal the live header score."""
import asyncio
import json
from test_boom_layout import ROOT,prepare,enter
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context,page=await prepare(browser,True)
        await page.get_by_test_id('boom-tempo-turbo').click(force=True)
        await enter(page,'copy')
        await page.get_by_test_id('boom-how-to-play-start').click(force=True)
        await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
        for round in range(1,6):
            await page.wait_for_function("()=>document.querySelector('[data-testid=boom-mode-page-copy]').dataset.phase==='input'",timeout=15000)
            # Physical keyboard input near every quarter-beat ensures a nonzero live score.
            for _ in range(5):
                if await page.get_by_test_id('boom-mode-page-copy').get_attribute('data-phase')!='input': break
                await page.keyboard.press('Space')
                await page.wait_for_timeout(570)
            await page.get_by_test_id('boom-round-summary').wait_for(timeout=15000)
            await page.wait_for_timeout(350)
            if round<5:
                await page.get_by_test_id('boom-play-again').click(force=True)
            else:
                header=await page.locator('.boom-room header .game-card').last.inner_text()
                await page.get_by_test_id('boom-session-summary').wait_for(timeout=6000)
                final=await page.get_by_test_id('session-final-score').inner_text()
                result={'header_score':header,'automatic_session_score':final,'pass':header==final}
                print('AUTO SCORE',result,flush=True)
                (ROOT/'boom_auto_score_results.json').write_text(json.dumps(result,indent=2))
        await context.close()
        await browser.close()

if __name__=='__main__':asyncio.run(main())