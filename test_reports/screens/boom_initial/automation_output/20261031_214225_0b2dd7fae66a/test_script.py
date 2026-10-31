async def run_test(page, output_dir, page_url):
    await page.set_viewport_size({"width":1920,"height":800})
    try:
     await page.evaluate("""() => {localStorage.setItem('jma_unlock_all_v1','1');localStorage.setItem('jma_player_name_skipped_v1','1');localStorage.setItem('jma_reveal_seen_v1','1')}""")
     await page.reload()
     await page.wait_for_timeout(2500)
     print(await page.locator('[data-testid]').evaluate_all('(els)=>els.map(e=>({id:e.dataset.testid,visible:!!e.getClientRects().length})).filter(e=>e.visible)'))
     await page.screenshot(path='/app/test_reports/screens/boom_initial/automation_output/20261031_214225_0b2dd7fae66a/entry.jpeg', type="jpeg", quality=40, full_page=False)
     print('PASS initial page loaded')
    except Exception as e:
     print('FAIL initial page',str(e))
