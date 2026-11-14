# Shared snippet (copied into browser_automation scripts) - documented here for reuse.
# Usage pattern in playwright:
#   await page.add_init_script(open('/app/tests/dj_helpers.js').read())
#   await page.evaluate("window.__djAuto.mode='all'")  # all | half | none
#   wait for [data-testid=dj-turntable-complete]; inspect window.__djLog for phase durations
#   (any single phase lasting >20s indicates a stuck round)
