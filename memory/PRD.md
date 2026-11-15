# Jelly Music Academy — PRD / Progress

## Original problem statement
Kids' music-learning app (React SPA, HashRouter) with a campus map of mini-games across
Play/Learn/Create streets plus a Plaza. Ongoing work adds/polishes individual games and
campus-wide UX. Latest major feature: "DJ Stew's Turntable" — a Guitar-Hero-style
continuous-scrolling sight-reading rhythm game on Play Street, with PSD-sprite animations
for DJ Stew (blinking, breathing, wing swaps, turntable spin-glints) and rotating boom-bap
backing loops synced to the notated rhythm.

## What's implemented (latest session, Nov 2026)
- **DJ Stew's Turntable bug fixes**:
  - Left-wing "drum press" pose now gated to only animate during actual gameplay
    (`phase==='input'`); stays in neutral "earphone" idle pose during count-in/reveal.
  - Fixed a bug where the press pose was always frame 1 (ref-based counter now cycles
    press1→press2→press3 correctly) — `DjStewSprite.js`.
  - Mobile landscape (`max-height:520px` + landscape) layout: DJ Stew now sits in a left
    column (`.dj-turntable-stew-wrap`, via `flex-direction:row-reverse` on
    `.dj-turntable-tap-target`) instead of being cut off below the note highway.
  - Added `/dj-turntable` to `FitStage.js`'s `EXCLUDED` list so orientation changes no
    longer remount the whole page mid-session (was dropping players back to the menu).
- **Campus map**: Play/Learn/Create street buildings reordered so Jelly Jukebox and Stew
  Kazoo Says are the first two on Play Street; all street building `size` values bumped
  ~8% (Plaza untouched) — `data/campus.js`. DJ Stew's Turntable building icon replaced
  with user-supplied "DJ Stew's Turntable Club.png" art.
- **Shred City guitar**: Spacebar now also holds the string-bend (alongside the existing
  'B' key), gated to not fire when a button/input/textarea has focus — `GuitarInstrument.js`.
- **Main Stage (`/rank-hall`)**:
  - Tapping different crowd/band members no longer cuts off a lick already playing
    (`playRiff(..., {overlap:true})` for crowd taps only — `avatarRiffs.js`, `RankHallPage.js`).
    `playRiff`'s `playing` array now self-prunes on `ended` to avoid unbounded growth.
  - Action buttons (TAKE A BOW!, PLAY MY SONG, LIGHT SHOW, SNAP!, My Achievement Book) now
    stack down the right wall on desktop/tablet (`min-width:700px`) matching the existing
    short-landscape-phone treatment; on narrow portrait phones (`max-width:480px`) the row
    wraps instead of overflowing — `index.css`.
- **Stew Kazoo Says (`/simon-says`)**: voice lines (`stew.correct`/`stew.perfect`/`stew.miss`)
  were much louder than kazoo SFX; lowered to `volume:0.65` to match kazoo loudness.
- **DJ Stew's Turntable snare fix**: the 3rd boom-bap variant had its snare landing on
  beat 3 instead of on beats 2 & 4; fixed to `snare: [2,6]` for all patterns.
- **DJ Stew's Turntable beat variety**: expanded `BOOM_BAP_PATTERNS` from 3 to 6 — 3
  boom-bap variants, 1 disco (four-on-the-floor kick + hat on the upbeats), and 2
  dancehall riddims (one-drop, stepper) — all still rotating bar-to-bar.
- **DJ Stew's Turntable groove-per-round fix**: the backing beat used to switch pattern
  every single bar/measure (jarring mid-round). Now one groove is picked randomly per
  ROUND and held fixed for every bar of that round; it only changes when the next round
  starts (avoids repeating the same groove twice in a row).
- **DJ Stew's Turntable animated background**: replaced the flat purple gradient with a
  full neon-club scene built from the user's "bg kit" PSD (extracted to
  `/app/frontend/public/assets/dj-stew-bg/`) — tiled dance floor, glowing center stage,
  two speakers that thump on the beat tempo, bouncing cyan EQ bars on both walls, a
  disco ball that spins + sways, a flickering neon sign, musical-note wall art, and
  floor sparkles/lightning/star accents — all via `DjStewBackground.js` (new component)
  + CSS keyframes in `index.css`. Used across menu, playing, and session-complete screens.
- **Campus map building art**: DJ Stew's Turntable icon replaced twice — final version
  is the user-supplied "Mirrored DJ Turntable Storefront" art (correct building-facing
  direction matching the rest of the street), with its baked-in checkerboard
  "transparency" chroma-keyed out and cropped to a near-square ~1:1 content box so it
  renders at a comparable size to the other street buildings (object-contain in a square
  slot was shrinking the old 4:3 art).

All of the above verified via testing_agent (iteration_85, iteration_86 — both passed,
only optional/low-priority suggestions which have now been addressed) and manual
screenshots.

## Known non-blocking notes
- Main Stage portrait-phone button wrap is a new CSS-only fix; not re-verified by testing_agent
  (added after iteration_86 passed) — should hold up but flag if a future report shows overlap.

## Backlog / Future tasks
- P2: Replace the DJ Turntable building icon art on the campus map (user called current
  one "awful", said they'd replace later — no action needed unless user follows up).
