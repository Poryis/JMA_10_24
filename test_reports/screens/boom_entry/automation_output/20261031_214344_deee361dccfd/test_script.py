async def run_test(page, output_dir, page_url):
    await page.set_viewport_size({'width':1920,'height':1080})
    try:
     await page.evaluate("""() => {for (const k of ['jma_unlock_all_v1','jma_player_name_skipped_v1','jma_reveal_seen_v1']) localStorage.setItem(k,'1')}""")
     await page.reload()
     await page.get_by_test_id('audio-unlock-overlay').wait_for(state='visible',timeout=10000)
     await page.get_by_test_id('audio-unlock-overlay').click(force=True)
     await page.get_by_test_id('audio-unlock-overlay').wait_for(state='hidden',timeout=10000)
     await page.get_by_test_id('boom-mode-copy').click(force=True)
     await page.wait_for_timeout(1500)
     print('Visible testids',await page.locator('[data-testid]').evaluate_all('(els)=>els.filter(e=>!!e.getClientRects().length).map(e=>e.dataset.testid)'))
     await page.screenshot(path='/app/test_reports/screens/boom_entry/automation_output/20261031_214344_deee361dccfd/entry_after_click.jpeg', type="jpeg", quality=40, full_page=False)
     print('PASS entry',await page.get_by_test_id('boom-how-to-play-start').is_visible())
    except Exception as e: print('FAIL',str(e))
