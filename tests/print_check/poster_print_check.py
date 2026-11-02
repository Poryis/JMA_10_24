# Poster print-size regression check (StagePoster PosterModal beforeprint/afterprint + real PDF print layout)
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
OUT = "/app/tests/print_check"
W = "getComputedStyle(document.querySelector('[data-testid=stage-poster]')).width"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.add_init_script("""(() => {
          localStorage.setItem('jma_stage_posters_v1', JSON.stringify([{id:'p1', at: Date.now(), name:'Test Kid', rank:'Star Pupil', rankColor:'#FFCC00', avatarSrc:'assets/characters/charlie.png', helmet:false, song:'Jelly Jam'}]));
          localStorage.setItem('jma_avatar_v1', JSON.stringify({character:'charlie', outfit:'classic'}));
          localStorage.setItem('jma_tour_v1', JSON.stringify({done:{t_character:true,t_first_game:true}, completedAt:new Date().toISOString(), seen:true}));
          localStorage.setItem('jma_player_name_skipped_v1','1');
          sessionStorage.setItem('jma_audio_unlocked_v1','1');
        })()""")
        await page.goto(BASE + "/#/academy?panel=yearbook")
        await page.wait_for_timeout(2500)
        for tid in ["player-name-skip", "tour-start-modal-close"]:
            loc = page.locator(f'[data-testid="{tid}"]')
            if await loc.count():
                try:
                    await loc.first.click(force=True, timeout=2000); await page.wait_for_timeout(700)
                except Exception:
                    await page.mouse.click(960, 900); await page.wait_for_timeout(700)
                    try: await loc.first.click(force=True, timeout=2000); await page.wait_for_timeout(700)
                    except Exception as e: print("dismiss fail", tid, e)
        if not await page.locator('[data-testid="academy-poster-p1"]').count():
            if await page.locator('[data-testid="academy-room-yearbook"]').count():
                await page.click('[data-testid="academy-room-yearbook"]', force=True); await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT}/0_yearbook.jpg", quality=40)
        await page.click('[data-testid="academy-poster-p1"]', force=True)
        await page.wait_for_selector('[data-testid="academy-poster-modal"] [data-testid="stage-poster"]', timeout=5000)
        await page.wait_for_timeout(900)
        print("onscreen width:", await page.evaluate(W))
        await page.screenshot(path=f"{OUT}/1_onscreen.jpg", quality=40)
        timing = await page.evaluate("""async () => {
          const el = () => document.querySelector('[data-testid=stage-poster]');
          window.dispatchEvent(new Event('beforeprint'));
          const sync = getComputedStyle(el()).width;
          await Promise.resolve(); const micro = getComputedStyle(el()).width;
          await new Promise(r=>setTimeout(r,0)); const macro = getComputedStyle(el()).width;
          await new Promise(r=>setTimeout(r,400)); const later = getComputedStyle(el()).width;
          return {sync, micro, macro, later, h: getComputedStyle(el()).height};
        }""")
        print("after beforeprint:", timing)
        await page.screenshot(path=f"{OUT}/2_printing.jpg", quality=40)
        await page.evaluate("window.dispatchEvent(new Event('afterprint'))")
        await page.wait_for_timeout(500)
        print("after afterprint:", await page.evaluate(W))
        # Real print layout via PDF (chromium fires beforeprint/afterprint around printToPDF?)
        await page.evaluate("window.__ev=[]; addEventListener('beforeprint',()=>__ev.push('before')); addEventListener('afterprint',()=>__ev.push('after'))")
        await page.emulate_media(media="print")
        await page.pdf(path=f"{OUT}/poster.pdf", format="Letter", print_background=True, prefer_css_page_size=True)
        await page.emulate_media(media="screen")
        print("print events fired during page.pdf:", await page.evaluate("window.__ev"))
        # Print button + close
        await page.evaluate("window.__pc=0; window.__st=[]; window.print=()=>{window.__pc++; window.__st.push(new Error().stack.split('\\n').slice(1,4).join(' | '))}")
        await page.click('[data-testid="stage-poster-print"]')
        await page.wait_for_timeout(500)
        print("print calls:", await page.evaluate("window.__pc"), await page.evaluate("window.__st"))
        await page.click('[data-testid="stage-poster-close"]')
        await page.wait_for_timeout(900)
        print("modal closed:", await page.locator('[data-testid="academy-poster-modal"]').count() == 0)
        await b.close()

asyncio.run(main())
