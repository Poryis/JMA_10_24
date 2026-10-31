async def run_test(page, output_dir, page_url):
    await page.set_viewport_size({'width':390,'height':844})
    try:
     await page.evaluate("""()=>{for(const k of ['jma_unlock_all_v1','jma_player_name_skipped_v1','jma_reveal_seen_v1'])localStorage.setItem(k,'1')}""")
     await page.reload()
     await page.wait_for_timeout(1500)
     for id in ['orientation-dismiss','audio-unlock-overlay']:
      loc=page.get_by_test_id(id)
      if await loc.is_visible():
       await loc.click(force=True)
       await loc.wait_for(state='hidden',timeout=10000)
     await page.evaluate('async()=>{if(document.fullscreenElement)await document.exitFullscreen()}')
     await page.set_viewport_size({'width':320,'height':568})
     await page.wait_for_timeout(500)
     if await page.get_by_test_id('orientation-dismiss').is_visible():
      await page.get_by_test_id('orientation-dismiss').click(force=True)
      await page.get_by_test_id('orientation-gate').wait_for(state='hidden')
     await page.get_by_test_id('boom-mode-copy').click(force=True)
     await page.get_by_test_id('boom-how-to-play-start').wait_for(state='visible')
     await page.wait_for_timeout(500)
     print('CTA initial bounds',await page.get_by_test_id('boom-how-to-play-start').bounding_box())
     await page.get_by_test_id('boom-how-to-play-start').click(force=True)
     await page.get_by_test_id('boom-how-to-play').wait_for(state='hidden')
     print('PASS portrait start accessible via card auto-scroll')
     print('Header boxes',await page.evaluate("""()=>{const a=document.querySelector('.game-title-pill').getBoundingClientRect(),b=document.querySelector('header .game-card').getBoundingClientRect();return {title:{x:a.x,right:a.right},score:{x:b.x,right:b.right},overlap:Math.min(a.right,b.right)-Math.max(a.x,b.x)}}"""))
     await page.screenshot(path='/app/test_reports/screens/boom_portrait/automation_output/20261031_214939_dac365b051ca/portrait_game.jpeg', type="jpeg", quality=40, full_page=False)
     error_text=await page.evaluate("""() => {const errorElements = Array.from(document.querySelectorAll('.error, [class*="error"], [id*="error"]'));return errorElements.map(el => el.textContent).join(', ')}""")
     print('Found error message: '+error_text if error_text else 'No error messages found on the page')
    except Exception as e:print('FAIL portrait',str(e))
