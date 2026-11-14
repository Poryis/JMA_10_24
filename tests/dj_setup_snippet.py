# Shared setup snippet for DJ Turntable browser_automation scripts (copy-paste).
# Steps: add_init_script(dj_helpers.js + name-skip), goto /#/dj-turntable, click audio-unlock-overlay,
# poll-close tour-start-modal (it appears late, ~2-4s after load), then click difficulty and
# wait for [data-testid=dj-turntable-playing].
# Spam: setTimeout loop dispatching Space keydown every 90-290ms (window.__spam).
