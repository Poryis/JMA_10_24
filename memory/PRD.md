# Jelly of the Month Club Music Academy (JMA) — PRD

## Jun 2026: Phone-landscape polish pass 2 (tested iteration_43/44, pass) — ALL scoped to @media (max-height:520px) and (orientation: landscape); desktop/portrait unchanged
- FitStage EXCLUDED: /, /home, /campus, /fun-facts, /rhythm-game, /free-play (they have their own handling). `.fit-stage-inner > * { min-height:100% }` kills the navy bar. MIN_BY_ROUTE robot-boogie 0.4.
- GameHeader title (`.game-title-pill`) hidden in phone landscape except `keepTitle` (campus).
- Jukebox: `.rhythm-board` calc(100vh-62px), `.rhythm-main` pt 54, lanes min-height 0, bells 52×62, `fallScale` 1.35 (notes take 35% longer to fall on short screens → runway).
- Jam Session: `.jam-controls-hint` hidden, `.jam-main` pt 48, bells circle width min(62vh,720px), `[data-testid=guitar-instrument] { zoom: .56 }`.
- Fun Facts: `desk` = width≥768 AND fine pointer; touch devices (any width) get the pannable porthole room (2400px portrait / 1500px phone-landscape) wrapped in `.funfacts-scroller-pad` (content-box, max-content, 26vh/30vw padding so corners reach the porthole centre); spyglass follows pointermove (finger too) on desk; when all 7 found the room goes `w-full` and the porthole hides.
- Campus phone landscape: bw = 0.62·h; left street sign at sandBack·0.95 (clear of the avatar).

## Jun 2026: Phone-landscape fit (FitStage) — tested iteration_42
- `components/FitStage.js` wraps `<Routes>` in App.js. Active only when innerHeight < 520 && landscape; excluded: `/`, `/home`, `/campus` (own landscape layouts). Measures the page's natural height and CSS-scales the stage (floor 0.55; stage width 100/scale vw; internal scroll if still too tall; bounded re-measure via ResizeObserver/MutationObserver to avoid oscillation). Fixed headers inside stay aligned (transform = containing block).
- Per-route at 844×390: rhythm-game 0.70, song-studio 0.70, loop-studio 0.59, name-that-note 0.58, shred 0.56, free-play 0.56, boom-garden 0.55 fit; STILL OVERFLOW at floor (menus are tall vertical stacks): robot-boogie, note-match, fun-facts, simon-says, detective, sight-reading → candidates for dedicated landscape (side-by-side) menu layouts.

## Jun 2026: "Make it → Jam on it" pipeline (tested iteration_40/41, all pass)
- Beat Lab: after naming a saved beat → yellow **Jam on it! →** (`loop-jam-on-it`) → `/free-play?beat=<id>`; sets `sessionStorage jma_just_saved_beat_v1`. Song Studio: celebration (now 6 s) + gallery rows have **Jam on it!** (`song-jam-on-it`, `song-gallery-jam-<id>`) → `/free-play?song=<id>`. Voice line `charlie.jam.takeit`.
- Jam Session: `JamAlongControls` rewritten — "My Music" button opens `components/MyMusicShelf.js` (tabs My Beats · My Songs · Jelly Songs, cassette `TapeCard`s, empty-state CTAs to Beat Lab / Song Studio). Auto-starts from `?beat=`/`?song=` (after audio unlock), fixed banner `jam-along-banner` "Jamming to: <name>". Naming deliberately plain ("My Music") — user wants zero cute jargon for kids.
- `hooks/useSongLoopPlayer.js` loops a Song Studio song (slots + mood chords + mood drum loop via usePianoAudio; MOODS is an object keyed by id). `loadSavedSongs()` exported there.
- `hooks/useBeatLoopPlayer.js` now takes `lab` (useBeatLabAudio) and replays by track.id (= Beat Lab key 'sax:C4' / 'kick') with the real sax/bass/guitar/piano/drum samples — fixed "my sax came back as a bell".
- Campus Create street: Beat Lab before Jam Session; Jam Session badge "<n> to jam" (`campus-building-jam-session-badge`); Chunk shouts "Take your beat next door!" after a save (flag consumed inside the timer — StrictMode-safe).
- Street signs (`campus-sign-left/right`, StreetSign) hop between streets (prev lands at far end via location.state.enterAt); shelf is overflow-hidden with exact width → no over-scroll; now-playing chip `campus-now-playing`; avatar starts at 0.45·bw, first building at 1.05·bw; front seaweed 70·acc.
- Known low-priority: duplicate-key React warning inside AnimatePresence on Jukebox/Shred (pre-existing); an empty-src <img> somewhere on FreePlayPage.

## Jun 2026: Jukebox misses + Shred crowd dedupe (tested iteration_39, pass)
- RhythmGamePage: `FallingBellNote` gets `onMiss` via `onAnimationComplete` → `handleNoteMiss` (previously never wired — notes that fell past were never counted NOR removed, and could still be "hit" late). Wrong-bell taps now count as misses too. handleNoteMiss decides from `fallingNotesRef` (no side effects inside state updaters).
- ShredLegendPage: `charOf(src)` + CrowdRow drops the regular matching the kid's avatar character → front row never repeats a character. Back row (disco costumes) unchanged.
- Street music DONE: 6 Jelly instrumentals re-encoded to 96 kbps stereo (`public/assets/music/`: brand-new-friend, goody-bag, play-one-skip-one, faster-as-we-go, magic, food-fight; 1.7–2.9 MB each, 14 MB total; originals ~45 MB). `data/campus.js` zones have `tracks` playlists (PLAY: play-one-skip-one/goody-bag/food-fight · LEARN: magic/brand-new-friend · CREATE: faster-as-we-go/food-fight/goody-bag). `useStreetMusic` in CampusMapPage: shuffles without back-to-back repeats, fades in to 0.28, next track on `ended`, stops on leave. Old synth loops in `assets/ambient/` deleted.

## Jun 2026: Bigger campus buildings + centred compact JMAtv card
- `CampusMapPage.layoutFor(w,h)` now derives everything from `bw = clamp(120, min(0.46·h, 0.55·w), 440)`: slot 1.3bw, left 0.5bw, sandBack 0.8bw, sandFront 0.5bw, floor 0.24bw, lift k=bw/230, avatar 0.28bw (44–72). Buildings fill ~half the screen height on every device (LAYOUTS wide/narrow/short removed). Swipe hint moved left of the fullscreen button.
- Compact JMAtv card (phone landscape) is centred: `justify-center gap-5`, text column `flex-none items-center text-center`, logo 96px.

## Jun 2026: Home phone-landscape layout + always-collapsible quests
- `DailyQuestCard` starts COLLAPSED on every screen size (strip `daily-quest-strip`), collapse chevron always shown; still auto-expands when a quest was just completed.
- `HomePage.useShortLandscape()` (innerHeight < 520 && landscape) → `data-layout="short"`, root class `home-short`, renders `home-short-layout`: progress pill + quest strip in one row, PLAY/LEARN/CREATE as `wide` cards in one row, `JmatvCrtMobile compact` (CRT 24%, logo 80px, 12px copy) centred at maxWidth 400 below. CSS in index.css shrinks hero (`home-finn` 52px, `jma-logo` 104px, `home-charlie` 64px) and card title/sub (`.home-card-title/.home-card-sub`). Verified 844×390 and 740×360.

## Jun 2026: Landscape + fullscreen (PWA groundwork)
- `public/manifest.json` (display fullscreen, orientation landscape, start_url/scope `./` for GitHub Pages, icons icon-192/512 + maskable). index.html: manifest link, apple-mobile-web-app-capable/status-bar/title, viewport-fit=cover, theme #0A2540. No service worker (avoids stale deploys on Pages).
- `lib/fullscreen.js` helpers (enterFullscreen = requestFullscreen + screen.orientation.lock('landscape'), isStandalone, isIOS, canFullscreen…).
- `components/OrientationGate.js` (App root, z-190): on touch devices in portrait with width < 600 shows "Turn me sideways!" card with Go-fullscreen button (if API) and iPhone Add-to-Home-Screen tip; "Keep it upright for now" dismisses for the session (`jma_portrait_ok_v1`).
- `components/FullscreenButton.js` rewritten (uses lib, hides when unsupported/standalone) and mounted ONCE in App.js; per-page mounts removed from 13 pages.
- AudioUnlockOverlay first tap on touch devices also calls enterFullscreen().
- Campus header title is now just PLAY / LEARN / CREATE (no "STREET").
- LIMITS: web pages cannot force orientation; iPhone Safari has no fullscreen API — only Add to Home Screen hides the URL bar there.

## Jun 2026: Campus de-clutter
- Jam Session (FreePlayPage) no longer renders `<RoomCharacters room="jam-hall" />` (corner cast removed at user request).
- Removed building name pills (buttons keep `aria-label={b.name}`) and the street-name chip ("Jelly Jam Boulevard" etc.). Lock chips remain.
- `assets/campus/jukebox-diner.png` sign now reads JELLY JUKEBOX (PIL edit: red text erased to cream, re-rendered Liberation Sans Narrow Bold stretched tall + rotated 7°). Original saved at `/app/memory/jukebox-diner.orig.png`.

## Jun 2026: Back button fix (phone / typed URLs)
- `/play`, `/learn`, `/create` now `<Navigate replace>` to `/campus?zone=…` (old Play/Learn/CreateMenuPage routes removed from App.js; files still exist but unused).
- Campus header uses `backTo="/home"` so Back always goes Home regardless of history.
- `GameHeader.handleBack`: when there is no history (`history.state.idx === 0`, e.g. typed URL / fresh tab) it navigates to `/home` instead of doing nothing.

## Jun 2026: Campus buildings alive + host scale
- Hosts sized by HEIGHT (34% of slot) not width → Jazzy (tall/narrow art) is now the same scale as everyone.
- Window-light overlays (BuildingLights / campusLights.js) were tried and REVERTED at user request ("don't look right"). Do not re-add glow overlays on the building art. Small `RoofBubbles` from each roofline remain.

## Jun 2026: Robot Boogie building redrawn
- Old PNG had speckled transparency (the old chromaKey.py `g<120` rule ate the purple). Regenerated on magenta and keyed with a stricter rule (r>200,b>200,g<110,|r-b|<50). Use that stricter key for any future purple/violet art.

## Jun 2026: Home JMAtv card → outer-space
- Desktop `components/RetroTV.js` card too (data-testid home-retro-tv-space).
- `JmatvCrtMobile` card in HomePage uses `SPACE_BG_STYLE` + exported `Nebula`/`Starfield` from SpaceBackdrop (data-testid home-card-jmatv-space); copy is cream on dark.

## Jun 2026: Campus v4.1 — user feedback ("I LOVE THIS")
- Front dune no longer starts mid-slope: `SandStrip shift={FRONT_TROUGH}` (0.249 of tile width) slides the tile so x=0 is a dune trough (campus + home backdrop).
- Floating lucide music notes restored on open buildings (user asked). Window glow stays removed.
- **Sharky merged into Finn** everywhere: `data/avatars.js` Finn now has Daredevil / Classic (`shark.png`) / Disco / Hip-Hop / Snorkel / Zoot; `useAvatar.readAvatar` migrates stored `{character:'sharky'}` → finn (classic → `plain`). Voice ids `sharky.*` → `finn.tag.notematch`, `finn.match.N`, `finn.sweep.N`, `finn.mismatch.N`, `finn.gomatch.N`, `finn.quest.q_note_match` (NoteMatchPage updated); voice script regenerated — Finn section is 33 lines, 6 voices total. No voice MP3s recorded yet.
- **Phone-landscape headroom**: `LAYOUTS.short` when viewport height < 520 (slot 176, buildings 132px, sand 84/56, floor 30, avatar 46, street chip hidden, accents ×0.62). Verified at 844×340. Tablets (≥700px tall in landscape) unaffected. PWA "Add to Home Screen" (P1 backlog) would remove the browser URL bar entirely.

## Jun 2026: **Campus v4 — built from the USER's layered underwater art** (tested iteration_38, 100%)
- User uploaded `Underwater scene.zip` (Water BG, wave bands, back/front sand dunes, 2 seaweeds, 2 shells, 2 fish + a fish school — ALL fish face RIGHT). Exported to `public/assets/underwater/` (bands.png, sand-back-tile.png / sand-front-tile.png = mirror-tiled so `repeat-x` is seamless, seaweed-1/2, shell-1/2, fish-1/2, fish-school). Water color `#34E0F6` (`UNDERWATER_WATER`).
- `components/UnderwaterBackdrop.js` rewritten as LAYERS (water → bands → sand-back → accents → sand-front → fish → bubbles) and exports `Bubbles`, `Swimmer` (flips scaleX −1 when swimming left), `SandStrip`, `Seaweed`, `UW_ASSETS`. HomePage now mounts `<UnderwaterBackdrop />` (its inline copy removed); SubMenu/DressingRoom use it; Jam Session uses `deep` (no sand).
- `pages/CampusMapPage.js` v4: removed ALL my SVG extras (kelp, coral, fish, reef circles, SVG sand, lucide floating notes, window glow). Kept per user: bubbles (loved), hosts + shout bubbles, bobbing, blimp, swipe hint, night tint (now .32). Back dune parallax +0.3·scrollX with seaweed-2/shell-1; front dune is the street; front seaweed-1/shell-2 parallax −0.2·scrollX at z 7 (behind buildings so name labels stay readable).
- Strollers on every street = Surf Charlie (L→R) + Snorkel Finn (R→L, flipped) (`data/campus.js`).
- **Swim-to-door**: tap open building → `campus-you` (data-swimming) translates to the door (0.75–1.5 s by distance), scale keyframes [1, .9, .28], fades, then zoom transition + navigate. Locked buildings still shake only.
- Screenshot harness tip: dismiss audio overlay with a click, then "I'll add my name later", set `jma_unlock_all_v1`, `jma_reveal_seen_v1`, `jma_player_name_skipped_v1` = '1', reload.
- Still pending (user said "just the campus work for now"): P0 Fun Facts Play Again cut-off, P0 Robot Boogie title overlap, For Parents counts, pre-launch code review.

## Jun 2026: Campus v3 — underwater panorama (SUPERSEDED by v4) (tested iteration_37, 100%)
- User HATED v2's flat green slab ("takes back the magic"). v3 (`pages/CampusMapPage.js`, full rewrite): one street per visit, horizontally scrollable panorama over the home `UnderwaterBackdrop` (+ `deep` at night), `BlimpFlyby`, fish, 2 swimming Jellies, kelp/coral SVG props, sand shelf, parallax far-reef + near-kelp (translate with scrollLeft), buildings at varied depth (every 3rd lifted/scaled .86), bobbing, pulsing window glow, floating lucide Music notes, **host Jelly at each door** with random shout bubbles, kid's avatar at the street entrance (`campus-you`), swipe hint, desktop drag-to-pan. Slot 300px (≥640) / 220px (phone). Street-name chip centered under header.
- Option "b. panorama" chosen by user over winding path (a) / diorama (c). Still one street per visit.

## Jun 2026: Campus v2 — single street, all 15 buildings, campus life (tested iteration_36, 100%) — SUPERSEDED
- `/campus?zone=` shows ONLY that street (user request). All 15 rooms have art in `assets/campus/` (kiosk fallback kept in code but unused). PLAY order: jukebox, shred, stew, note-match, detective, sight, robot. Stew uses `stew-room-kazoo.png` (v1 with kazoo in window — user approved v1 look; `stew-room.png` original kept). Who's Got the Rhythm = football field.
- Ground slab under every row (fixes "floating" on phone) + shadow ellipses; user's `assets/ui/sun.png` by day / CSS moon + stars at night (`skyFor(hour)`); `BlimpFlyby`; 3 strolling Jellies per street; ambient loops `assets/ambient/{play,learn,create}.mp3` (ffmpeg-synthesized placeholders, vol .22, honor voices toggle, start after audio-unlock tap).
- **Astronaut Jellybone helmet fixed**: `components/AvatarSprite.js` layers the SVG helmet (exported from `DrJellyboneAstronaut.js`) for outfits with `helmet: true`; used in Dressing Room, Home rank bar, Shred crowd.
- User approvals so far: Dr. Jellybone office ✓, Jukebox diner ✓, Stew room ✓ (with kazoo window), Shred/BeatLab/Studio "like it all" ✓. The 9 newest buildings not yet explicitly reviewed.

## Jun 2026: **Campus Map hub** (tested iteration_35; zone-scroll fix verified) · buildings #4–6 · character canon
- **Character canon saved in `/app/memory/characters.md`** (authoritative). Sharky IS Finn Danger (one character — the user corrected "same actor" wording). Jazzy = cat-pun machine (female). Stew talks in kazoo in the show. Lou non-verbal. Voice bios/lines updated + script regenerated.
- `pages/CampusMapPage.js` + `data/campus.js`: `/campus?zone=play|learn|create`. Three streets, 15 buildings (6 illustrated: jukebox-diner, shred-club, stew-room, detective-office, beat-lab, song-studio; 9 CSS kiosks with character icons until art exists). Locked (non-starter, Polliwog) buildings dark with glowing window + "Earn 1 badge" chip; open ones zoom-in "door" transition (`campus-door-transition`) then navigate. Home PLAY/LEARN/CREATE cards now route to the campus; `/play` `/learn` `/create` grids remain as fallbacks. Art imgs reserve 1:1 space; zone scroll runs at 150 ms and 800 ms.
- New buildings pending approval: `campus/shred-club.png`, `campus/beat-lab.png`, `campus/song-studio.png`. Stew room / Jukebox diner shown to user earlier (not yet explicitly approved, but already placed on the map).

## Jun 2026: voice personalities fixed · Stew outfits · campus props #2/#3
- Voice bios/lines rewritten to the user's character voices: Charlie = Sinatra/Louis Prima NY wise guy; Dr. Jellybone = smooth jazz cat, never loud; Jazzy = loud boisterous pun-teller; **Finn & Sharky = same character/voice** (Jerry Lewis "HEY LADY" giddy); Chunk = surfer bro; Stew unchanged. Script regenerated (`/app/memory/voice_script.md`).
- Stew outfits: Classic / Kazoo (`assets/stew/stew-neutral.png`, Keyboard Cadet) / Drum Line (`characters/stew-drumline.png` cropped from `animations/stew-drum/right-1.png`, Rhythm Pro). `stew-swing.png` is a duplicate of `stew.png` — unused now.
- Campus props: **Dr. Jellybone's office APPROVED by user** ("err slightly simpler" for future ones). Generated `campus/stew-room.png` and `campus/jukebox-diner.png` (pending approval). Pipeline: `scripts/chromaKey.py in.jpg out.png` on a magenta-background Gemini render; pass `campus/detective-office.png` as the style reference.

## Jun 2026: **Avatar + Dressing Room** (tested iteration_34, 100%) · first campus prop
- `data/avatars.js` (8 Jellies, 30 outfits from existing art; unlock kinds free/badge/rank/sticker), `hooks/useAvatar.js` (`jma_avatar_v1`, `readAvatarSrc()`), `pages/DressingRoomPage.js` at `/dressing-room` (character row + wardrobe, locked outfits show hint). Avatar appears in the Home rank bar (`home-avatar`, pulses "NEW" until chosen, tap → Dressing Room), as the YOU member in the Shred City crowd, and the Sticker Book has a Dressing Room button. Backup includes `progress.avatar`.
- **Campus prop #1** generated from the user's art as reference: `public/assets/campus/detective-office.png` (Dr. Jellybone's office, keyed from magenta → transparent via PIL; recipe: ask Gemini for solid #FF00FF background, then chroma-key — the "transparent" option bakes a checkerboard). AWAITING USER APPROVE/REJECT.
- Known noise: "two children with the same key" React warning (pre-existing, source not yet found).

## Jun 2026: **Voice layer** — tested iteration_33, 100%
- `data/voiceLines.js`: 150 short blurbs, 7 voices (Charlie = host; Dr. Jellybone, Stew, Jazzy, Chunk, Finn, Sharky; **Lou never talks**). id = `<char>.<group>[.<variant>]`. `lib/voice.js` `say(idOrGroup, {interrupt, minGapMs, delayMs})` plays `public/assets/voice/<id>.mp3`, random variant for groups, remembers missing files (silent), single channel, defers the latest line until the first tap (audio-unlock gate). Toggle: `jma_voice_v1` in Manage Progress ("Character Voices").
- Wired: Home greeting once per session (first visit / time-of-day / streak / quests / all-done), lock lines, quest nudges on GO, room taglines on every game mount (`useVoiceTagline`), correct/perfect/miss reactions in Detective, Stew, Note Match, Sight-Reading, Name That Note, Ear Quest, Jukebox (song end), Boom, Beat Lab, Robot Boogie, Fun Facts, Song Studio, Shred City (tiers/encore/too wild/flawless), plus badge/sticker/gem toast, rank-up, quests-done, Academy-open overlays.
- **Recording script for the user: `/app/memory/voice_script.md`** (regenerate with `node frontend/scripts/voiceScript.mjs`). Files go in `frontend/public/assets/voice/`.
- Decided direction (user): voice-act short blurbs only; avatar + Dressing Room next; campus map with AI-generated props one at a time from user's art as reference (user approves each); pricing recommendation $5.99/mo · $39.99/yr · $79 lifetime; free tier = 3 starter games + LEARN + JMAtv + meta, Academy Pass = CREATE + other games.

## Jun 2026: Compact quest strip on phone/tablet (< 1024px)
- `DailyQuestCard` renders `CompactQuestStrip` (`daily-quest-strip`, 58 px: sun, "Friday's Quests", 3 domain dots with ✓, n/3, chevron) below `lg`; tap expands the full card in place (`daily-quest-collapse` to fold). Auto-expands when a quest was just completed (`jma_quest_seen_done_v1`). Desktop ≥1024 keeps the full card. Result: rank bar + quests + PLAY/LEARN/CREATE + JMAtv all above the fold on 390×844 and 820×1180 (screenshot-verified).

## Latest (Jun 2026): **Shred City Encore Round** — tested iteration_32, 100%
- When the 45 s timer ends with the Crowd Meter maxed (reached SHRED LEGEND), a **10 s ENCORE** starts instead of the result screen: `band.setTempoScale(1.2)` (re-anchors the 8th grid), ENCORE tier-flash + mega confetti + crowd wave + everyone shouts, pink HUD (`shred-encore-label` "ENCORE! FLAWLESS" while no misses), punk strobe lights. **Flawless encore** (0 OFF BEAT/TOO WILD, ≥8 timed hits) → second sticker `shred_encore` ("Encore!", Fun Milestones) on top of `shred_legend` = "double stickers". Result card line `shred-result-encore`. Surf Charlie crowd-surfer removed. Dev hooks `__shredSetMeter` / `__shredSetTimeLeft` (non-production).

## Jun 2026: **Shred City** (was Shred Legend; route `/shred-legend` kept) — tested iteration_10 (Shred City run), 100%
- Renamed everywhere (PLAY tile now 2nd; header/intro; quest + sticker hints). Top crowd tier is still "SHRED LEGEND" (the sticker you earn in Shred City).
- **Bend bug fixed** (`GuitarInstrument.js`): bend targets are now per-note (`setBendTarget(id, …)`); releasing a quick second/third note no longer clears the bend for the note still held. BEND bends every still-sounding note.
- **Scoring rework** (`ShredLegendPage.js` `onGuitarPlay`/`bumpMeter`): tempo-scaled windows (perfect ≤18% / nice ≤36% of an 8th), one score per 8th, OFF BEAT resets combo, combo ×1.5 at 6 / ×2 at 12, **mash guard** (4+ onsets inside one beat = "TOO WILD!", −1.5 meter; 3-note runs allowed), sustain only feeds meter for first 1.5 s, idle decay 0.5/100 ms after 600 ms. **Meter curve**: gain ×1.6 below 22, ×1.0 to 58, ×0.72 to 90, ×0.55 after. Tiers 0 / 22 Opening Act / 58 Headliner / 90 SHRED LEGEND.
- **Crowd bells & whistles**: tier-up banner + screen flash + confetti burst, crowd jump wave (tier-ups and every 8 combo), speech bubbles (`CROWD_SHOUTS`), glow sticks + dim back row (disco outfits, brightness .42) at energy ≥.55, camera flashes ≥.58, beach ball ≥.58, Surf Charlie crowd-surfer + stage pyro ≥.9, meter glow/pulse/sheen, combo badge with ×1.5 / ×2 ON FIRE chip, result card 3-star rating + confetti.
- Dev-only hook `window.__shredSetMeter(v)` (non-production) for automated tests.

## Jun 2026: **Anti-overwhelm restructure, round 1 — Daily Quests + Progressive Reveal** (tested: iteration_31, 100% pass)
- **"Today at the Academy"** (`components/DailyQuestCard.js`, `hooks/useDailyQuests.js`, `data/dailyQuests.js`): new Home hero replacing `NextMissionPanel`. 3 quests/day from a 20-quest pool; slots 1–2 seeded by local date (same for every kid), slot 3 = kid's weakest achievement domain (curriculum nudge). Each row deep-links (`?quest=<difficulty>` auto-starts Detective / Note Match / Sight Reading / Stew Kazoo). Games call `reportQuestEvent(event, payload)` next to their existing `earnAchievement/earnSticker` calls (16 hook points). State in `jma_daily_quests_v1`, quest-day count in `jma_quest_days_v1`. Completing all 3 → global `DailyQuestCelebration` overlay (App.js) + **Daily Gem** stickers at 1/3/7/14/30 quest-days (new sticker category `gems`, inline-SVG gem icons). Practice streak untouched.
- **Progressive reveal** (`hooks/useUnlocks.js`): `unlocked = unlockAll override || rank !== polliwog`. Fresh kids: LEARN/CREATE home cards greyed with "Earn 1 badge to unlock" (click = shake, no nav); PLAY submenu only opens the 3 `starter: true` tiles (Jukebox, Stew Kazoo, Detective); all LEARN/CREATE tiles locked. First badge → one-time `AcademyRevealCelebration` on Home ("The Academy is Open!"), `jma_reveal_seen_v1`. Grown-up override lives in Sticker Book → Teacher View → Manage Progress → "Academy Rooms" → "Unlock everything now" (`jma_unlock_all_v1`; setting it also marks reveal seen). User explicitly rejected a separate "Playground" shelf — toys stay in their menus, just greyed until unlock.
- Backup/restore/reset (`lib/playerStorage.js`, `resetAllStickers`) include the new keys.
- Known pre-existing: 7 `react-hooks/exhaustive-deps` warnings make `CI=true yarn build` fail (LightningStage, BoomGarden, RhythmGame, ShredLegend, SimonSays) — fix in the pre-launch code review.
- Next: Weekly "Special Case" rotation (Detective/Jukebox modifiers), P0 mobile bugs (Fun Facts Play Again cut-off, Robot Boogie title overlap), For Parents counts, pre-launch code review.

## Latest (Jun 2026): **Jam Session defaults to Guitar** — `FreePlayPage` `activeTab` initial state is now `'guitar'` (guitar itself already defaults to Notes + Crunch).

## Jun 2026: **Unified STOP while recording** — `togglePlay` now routes to `stopRecording()` whenever `recorder.isRecording`, so the big STOP button (and spacebar) end both the loop and the MP3 recording exactly like the REC-row STOP, including the save + name prompt.

## Jun 2026: **Name Your Beat** — After STOP in Beat Lab an inline form (`beat-name-input` + `beat-name-save`, autofocus, 24-char max, Enter or Save) appears next to REC with the default name as placeholder; submitting renames the just-saved beat via `renameSavedBeat(id, name)` in `useSavedBeats.js`, blank keeps the default. Then the "✓ <name> → Jam Session" label shows.

## Jun 2026: **Beat Lab REC autoplay + "My Beats" in Jam Session** — `LoopStudioPage`: `togglePlay` split into `startPlayback`/`stopPlayback`; REC (`startRecording`) starts the MP3 recorder then auto-starts the loop; STOP (`stopRecording`) halts the loop, finishes the MP3, and saves the pattern (non-muted tracks with hits → `{id,type,note,steps}`, bpm, totalSteps) via `hooks/useSavedBeats.js` (localStorage `jma_saved_beats_v1`, newest-first, max 8) with an inline "✓ Beat N → Jam Session" label. `FreePlayPage`: new `hooks/useBeatLoopPlayer.js` sequences a saved beat through `useAudio` (`playBellNote`/`playDrumSound`, so it routes into masterNode and gets captured by the Jam recorder); `JamAlongControls` shows a "My Beats (from Beat Lab)" section under the JMA Originals, picks set `jamTrackId = 'beat:<id>'`, Stop halts the loop. Beats loop forever with perfect timing (pattern replay, not MP3).

## Jun 2026: **Guitar v11.1** — Fret glow removed per user (zoneRect/glow state deleted). Pick + label, skull knobs, pad-style chord attack remain.

## Jun 2026: **Electric guitar v11 — skull-knob tone switch, fret glow, pad-style chord attack on the drawing** — Tapping either traced skull knob (`SKULL_KNOBS` at viewBox (164,571) / (105,585), transparent r=26 hit circles, `stopPropagation` so no strum) flips Clean↔Crunch and plays a dashed yellow "twist" ring animation (`twist` {knob,id}). **Fret glow**: translucent yellow rounded rect over the active zone (`zoneRect`) while the finger is down, follows glides. **Chords on the guitar picture now behave exactly like pads/keys**: staggered 0.022 s attack, level 0.60, full 3.5 s ring, sustained while touching and muted (0.12 s) on lift or zone change. Notes on the guitar keep v10 behaviour (short ring, previous released).

## Jun 2026: **Electric guitar v10 — pitch by neck position, less wash** — Per user: on the drawn guitar, x-position picks the pitch: nut (x≈894, headstock side/right) = lowest, bridge (x≈163, left) = highest (`zoneAt` splits [BRIDGE_X, NUT_X] into 11 note zones or 6 chord zones; y must be within 392–522). Click = play, drag = glide through zones. Chords reordered by root pitch everywhere (pads + keys 1–6): Em F G Am C Dm. Every new guitar hit `release()`s the previous guitar voices (0.12 s fade) and guitar hits use a short `ring` (1.6–1.8 s exponential decay) instead of 3.5 s, killing the overtone pile-up. Pick shows a note/chord label bubble (e.g. "Am5") and the matching pad depresses while the finger is down. Removed per-string bands, selectedChord/notePos concepts and the white selection outline. Pads still hold/release as before.

## Jun 2026: **Electric guitar v9 — strummable strings + pick, new defaults, decluttered** — Per user: defaults are **Notes mode + Crunch tone**. Pads are now *selectors that also play*: chord pad → sets `selectedChord` (white outline) and strums; note pad → sets `notePos` (which 6 pentatonic notes the strings play, clamped to idx ≤ 5) and plays. **Strum zone** on the drawn guitar: pointer down/drag on the SVG maps to viewBox coords via `getScreenCTM().inverse()`; 6 string bands (top y 428, gap 11.4, zone x 150–480 / y 404–508 in viewBox space). Crossing bands plays every string passed (fast swipe = strum, slow = arpeggio), each string voice rings out (3.5 s) and is re-triggered per string. Crunch chord strums use a 6-string power voicing (root/5th/oct ×2 octaves). A yellow **Pick** (`PICK_PATH`) follows the finger while dragging; tapping a chord pad fires an auto pick sweep (`sweepId` keyed motion.g, 0.36 s). 11 notes now: A C D E G A C D E **G A** (added 784/880 Hz). Keyboard: notes 1–9,0,- ; chords 1–6; Q/W tone; Z/X mode (hints removed from UI). Removed: roman numerals, key hints, string-count dots, footer help text, POWER CHORDS badge. Guitar SVG enlarged to h-44 / md:h-64. Bug note: user's "not playing" report resolved on refresh and works on other devices — no code cause found (likely stale bundle / hot-reload state).

## Jun 2026: **Electric guitar v8.1 — strap removed, strap pins kept, cheap frame swap** — Strap fabric erased from all 3 traced frames pre-trace (scipy body-mask: flood-fill cream body → dilate 6px → erase non-body pixels in strap regions, repaint outline band black). Two `StrapPin` SVG groups (grey shank + cap, black outline) placed at the horn (427,392, -42°) and lower bout (157,814, 150°) in un-rotated guitar coords. Perf: all 3 frames now stay mounted (`GuitarFrame` memo) and strum just toggles `display` — no more re-parsing ~100 KB of SVG innerHTML 8× per strum (that main-thread stall was the likely cause of "controls stopped working" on slower/touch devices; desktop audio start/stop verified via AudioBufferSourceNode instrumentation: 6 voices start per chord, all released on pointer-up/key-up).

## Jun 2026: **Electric guitar v8 — user's actual hand-drawn guitar, vector-traced** — User rejected the hand-coded Tele SVG (v7) as "SOOO far afield" from their drawings. Replaced with the user's own artwork (`Guitar 1.webp` idle + `Guitar Strum1/2.webp` strum frames) auto-traced to SVG paths via `vtracer` (1000px source, ~70–130 KB per frame) and stored in `components/guitarFrames.js` (`GUITAR_VIEWBOX`, `GUITAR_ROTATE`, `GUITAR_FRAMES`). `GuitarArt` renders the paths inside `<g transform="rotate(44 500 445.5)">` so the diagonal drawing lays horizontal (headstock right), with a computed tight viewBox; vector so it scales crisply at every resolution (the user's explicit reason for not using raw PNGs). Strum = flip frames 1↔2 every 75 ms for ~0.5 s then back to idle (works for chords and single notes). Old per-string wobble / SkullKnob / GuitarStrings code removed. To re-trace new art: `pip install vtracer` → `vtracer.convert_image_to_svg_py(...)` → regenerate guitarFrames.js.

## Feb 2026 (superseded): **Electric guitar v7 — Telecaster cartoon body based on user reference sketch** — Rewrote `GuitarStrings` SVG component using the user's cartoon-guitar reference. Horizontal Tele silhouette: cream body (#F5EFDD) with single-cutaway shape + 3px chunky black outline, wooden tan fretboard (#B8956F) with 7 frets + 2 inlay dots, red Tele paddle headstock (#D62828), 6-inline tuning pegs (chrome caps + side wings, staggered zigzag), white pickguard with black outline, chunky black humbucker pickup with 6 pole pieces, bridge saddles with per-string metal blocks, output jack notch. Added two SVG **skull knobs** on the pickguard (cartoon skulls with eye sockets + jaw slit) matching the reference. **Black leather strap fragment** coming off the upper horn (partial arc + strap peg dot). Strings run 2 segments: static peg-to-nut convergence line (thin) + animated nut-to-bridge line (thicker, wobbles on strum). Background swapped from dark walnut to a warm cream gradient so the whole guitar reads as one cohesive cartoon illustration. viewBox 500×200, `preserveAspectRatio="xMidYMid meet"` so shape stays consistent across viewports.

## Feb 2026: **GarageBand-style electric guitar — Jam Session Stage 1 (deprecated)** — Added `components/GuitarInstrument.js`, initially with Web-Audio-synthesized (Karplus-Strong) audio. Replaced in Stage 2 above. Two modes toggleable at top: **Chords** (6 fat pads in A minor diatonic — Am · Dm · Em · G · C · F, each strummed as 6 KS voices with 25 ms per-string offsets so it reads as a real down-strum) and **Notes** (9-note pentatonic strip locked to A minor so kids can't hit a wrong note). **Tone toggle** (Clean / Crunch): Clean = 5.2 kHz LP for jangly surf/pop; Crunch = hyperbolic WaveShaper (k=400, 4× oversample) → 3 kHz LP for rock lead. Karplus-Strong plucked-string synthesis with 0.996 damping — cheap, authentic. Routes into the parent's masterNode via `getAudioGraph` so MP3 recorder captures it automatically. Sampled-audio migration path documented inline (swap `pluckChord()` for a one-shot buffer load from `assets/audio/guitar/{chord}.mp3` per chord). `FreePlayPage.js` INSTRUMENT_TABS updated + new `activeTab === 'guitar'` render branch. Placement: Stage 1 = Jam Session only; Beat Lab wiring deferred to Beat Lab rework.

## Latest (Feb 2026): **Scroll-collapsing back button (harp shield tucks away below the fold)** — `components/GameUI.js` `GameHeader` now listens to `window.scroll` and toggles a `collapsed` state at `scrollY > 24`. When collapsed, the harp / CRT shield inside the back-button motion.button is wrapped in an `AnimatePresence` and exits with a spring-tucked height + opacity + scale animation, leaving only the "BACK" text pill — which simultaneously grows its padding (8 → 12 px), font-size (10 → 12 px), and gains a soft drop-shadow so it stays tap-friendly on its own. At scroll top the shield returns with the reverse animation. Applies globally to every page using `GameHeader` (every game, JMAtv, lessons, etc.) so no per-page changes were needed. Verified: at y=0 back-button height 94px w/ 80px shield; at y=240 back-button collapses to 20px w/ shield removed from DOM; scrolling back to top restores the 80px shield.

## Prior (Feb 2026): **JMAtv phone-portrait logo stacking** — On viewports below the Tailwind `md` breakpoint (768px, i.e. phone-portrait), the JMAtv channel bug is lifted OUT of the CRT screen and rendered as a proper page header ABOVE the CRT (`clamp(120px, 42vw, 200px)` with drop-shadow + soft yellow glow). Desktop/tablet keeps the original in-screen bug at top-right (`hidden md:block` on the in-CRT img, `md:hidden` on the stacked header). Verified via DOM measurements: phone 390×844 renders stacked logo at y=96 above CRT at y=279 (`logo_above_crt=True`); desktop 1400×900 hides the stacked logo and shows the in-CRT bug. `pages/JMAtvPlayerPage.js`.

## Latest (Feb 2026): **Beat Lab canonical track order + Sight Reading tier rename + Clear-button width** — `LoopStudioPage.js` now sorts `activeTracks` through a `sortTracks` helper keyed on `TRACK_PRESETS` position so the deck always reads bells (Do → Re → Mi → Fa → So → La → Ti → High Do) → drums (Kick / Snare / Hi-Hat / Crash) → scratches (Pull / Push / P/P), regardless of the order kids tap `+ Add` chips or the order preset patterns dump tracks. Applied to initial state, `addTrack`, and `loadPreset`. Verified: adding `scratch_pull, bells_HC, drum_crash, bells_D` in that reversed order still renders `bells_C, bells_D, bells_E, bells_G, bells_HC, drum_kick, drum_snare, drum_hihat, drum_crash, scratch_pull`. Sight-Reading Sprint tiers renamed to Easy / Medium / Hard / Wizard (⚡ VERY HARD retained on Wizard) — internal LEVELS keys (`cadet/pro/master/wizard`) kept identical so existing best-score localStorage + achievement-tier mapping stay intact. Beat Lab Clear button changed from `w-9 h-9` fixed square (text overflowed the box) to `h-9 px-3` auto-width pill; measured `clear_text_fits_inside_button=true`.

## Prior (Feb 2026): **Beat Lab latency trim — deferred audio preload + memoized mascots** — `useAudio.js` moved the app-wide `preloadAudio()` off the mount critical path: instead of firing 26 fetch+decodeAudioData ops synchronously in a mount `useEffect` (one of the biggest first-tap latency contributors on mobile Beat Lab), preload now runs inside `requestIdleCallback` with a `setTimeout(250)` Safari fallback. Same buffers, same guarantees — decoded well before the first user gesture (kids can't hear anything before tapping the app-wide "Tap to Start the Music" gate anyway), just no longer competing with initial paint. In `LoopStudioPage.js`, the two full-color mascots (`charlie-rundmc.png` on the drum kit, `sharky-hiphop.png` on the turntable) were extracted into module-scope `React.memo` components (`CharlieMascot`, `SharkyMascot`), driven only by `{ isPlaying, bpm }`. Before, both `motion.img` subtrees reconciled every ~150ms during playback because `currentStep` + `activeHits` state changes forced the whole page to re-render. Now they only re-render on real prop changes (play/stop toggle, BPM adjust). Verified via automated smoke: play button toggles STOP, both mascots render exactly once, "Beat Builder Cadet" rank-up modal appears on first play (proves audio + state + progression all wired).

## Prior (Feb 2026): **Beta punch-list pass — Sneaky Note case-file card, Stew Kazoo win route, Robot Boogie arcade title, landscape crops, iPad unmute** — Sneaky Note "Bonus Mode" card in Detective menu redesigned as a dark-navy "case file" (dashed purple border, tape corner, red "CASE FILE" stamp, purple-gradient magnifier badge) so it visually reads as a separate mechanic, not an extra difficulty. `SimonSaysPage` post-level-8 win now routes back to `/simon-says` (Stew's own difficulty menu) instead of `/`. `RobotBoogiePage` swapped its custom chrome `RobotBoogieTitle` for the standard `"ROBOT BOOGIE"` string title so it renders through `GameHeader`'s arcade-marquee treatment like every other game. Robot Boogie active-band cropping fixed: `minHeight` clamped 150–220px, `maxHeight` uses `clamp(200px, calc(100vh - 260px), 640px)` so short landscape phones (~375px tall) don't clip characters. Beat Lab landscape back-button overlap fixed by bumping `main` padding to `pt-24 md:pt-28` and adding a `safe-area-inset-left` margin on the deck so the fixed back-pill can't collide with the PLAY transport button. JMAtv `JMAtvPlayerPage` now starts every episode with `autoplay=1&muted=1` (works on iOS Safari) and detects the muted state via `player.getMuted()`; when true, a full-screen "TAP FOR SOUND" overlay (chunky yellow volume badge) appears over the CRT and, on tap, unmutes + plays.

## Prior (Feb 2026): **Astronaut Jellybone v2 — full enclosure helmet + forward-facing drift** — `DrJellyboneAstronaut` helmet upgraded from a single floating bubble to a two-layer SVG rig: back-shell (dome silhouette + navy neck collar + oxygen tube + backpack tank with yellow valve) sits BEHIND the sprite; front-visor (transparent tinted glass + dark rim + inner white highlight + glints + side comm box with green LED + antenna with blinking red bulb) sits IN FRONT. Helmet enlarged (width 86% → 91%, top -2% → -4%) so fedora sits fully inside the dome. Fixed backwards-facing bug: `scaleX(${-direction})` → `scaleX(${direction})` so Jellybone always faces his direction of travel.

## Prior (Feb 2026): Astronaut Dr. Jellybone in the JMAtv sky — new `DrJellyboneAstronaut` component drifts across the space backdrop (blimp-style random-lap animation) on all JMAtv pages. Three user-provided "Jelly Man Jellybone no sax" frames resized 994×2000 → 300×604 and dropped in `public/assets/characters/dr-jellybone-astro-{1,2,3}.png` (~155 KB each); component cycles them every 480ms for an idle tentacle swap.

## Prior (Feb 2026): JMAtv antenna simplification — Music Videos back to coathanger, Variety Show → standard rabbit-ears, Lessons → wobble-ears. Arcade-marquee game titles + Detective ranks `Rookie / Sarge / Gumshoe`. Satellite signal waves cycle every 1.5s.

## Prior (Feb 2026): Arcade-marquee game titles + Detective rank rename — GameHeader renders string titles as chunky yellow-plate arcade marquees; Detective ranks renamed `Rookie / Sarge / Gumshoe`. Satellite signal waves cycle small-only → both → none on a 1.5s loop.

## Prior (Feb 2026): Arcade-marquee game titles + Detective rank rename — GameHeader now renders string titles as chunky yellow-plate arcade marquees with subtitle chips; Detective difficulties renamed `Rookie / Sarge / Gumshoe`.

## Prior (Feb 2026): Beat Lab mobile trim + JMAtv preview revert — Charlie + Sharky mascots hidden below 768px in `LoopStudioPage.js`; MiniCRT lazy-load reverted, muted previews auto-play again.

## Prior (Feb 2026): Perf pass — deleted 10 MB of unused assets (backup MP3s, AI-experiment PNGs, concept sketches). 67 MB → 57 MB public assets.

## Prior (Feb 2026): Shared backdrops — `SpaceBackdrop` reused across every JMAtv page; `UnderwaterBackdrop` mounted inside `SubMenuPage` so PLAY / LEARN / CREATE inherit the same undersea world as the HomePage lobby.

## Prior (Feb 2026): JMAtv per-set unique CRTs — every channel tile is a fully-rendered retro CRT with its own frame material (wood / metal / painted-red / purple-sparkle / chalkboard), antenna style (curly / ball-tips / coathanger / star-tips / apple), and knob color.

## Prior (Feb 2026): JMAtv overhaul v1 — home-page RetroTV is a single fully-clickable card; JMAtv page moved to an outer-space CSS background with `SatelliteFlyby`, and each channel embedded a mini-CRT preview.

## Prior (Feb 2026): Sub-menu tile-title clamp shrunk from `clamp(20px, 3.4vw, 38px)` → `clamp(17px, 2.6vw, 30px)` in `SubMenuPage.js` so "DETECTIVE DR. JELLYBONE" fits single-line on iPad portrait.

## Prior (Feb 2026): PLAY/LEARN/CREATE sub-menu pages now use the Finn·Shield·Charlie hero row for branding consistency; tile titles auto-fit on a single line at the top; heroes scaled 1.45× and centered at the bottom (see CHANGELOG for details).

## Prior (Jun 2026): Tablet overlap pass complete — see CHANGELOG.md. Header footprint rule: content under harp needs `pt-20 md:pt-24 lg:pt-32`.

## Original Problem Statement
Build a frontend-only rhythm/music education app for young children that feels like a **living musical academy**, not a menu of disconnected mini-games. Use the user's custom artwork (Jellybells, drum kit, xylophone, piano, turntable, kazoos, character cast, original songs).

The experience should evoke PBS Kids / Nintendo / Rhythm Heaven warmth — playful, exploratory, toy-like, personality-driven, with strong mobile responsiveness and progression that feels welcoming, not competitive.

## App Identity
- **Full name**: Jelly of the Month Club Music Academy
- **Short name**: JMA
- **Tagline**: "Where music friends play together"
- **HTML title**: `Jelly of the Month Club Music Academy (JMA)`

## 📎 Companion Documents (READ FIRST)
- **`/app/memory/INFRASTRUCTURE_ROADMAP.md`** — Long-term hosting/backend/payment strategy. User plans to self-host (GitHub Pages + Railway + MongoDB Atlas + Stripe). **DO NOT begin backend/auth/payment work until user explicitly says so.** Currently in polish + teacher-playtest phase.
- **`/app/memory/CHANGELOG.md`** — Running log of recent changes.

## Six Academy Destinations (rooms)
Replacing the legacy "6 mode tiles" grid with rich room-card destinations on the home page:

| Room | Path (kept for sticker compat) | Background | Character vibe |
|------|-------------------------------|------------|----------------|
| Jam Hall | `/free-play` | river.png | Drum Major Charlie + Finn |
| **Jelly Jukebox** (formerly "Who's Got the Rhythm?" / "Rhythm Arcade") | `/rhythm-game` | jelly-jukebox-scene.png (disco) | Disco Lou + Punk Charlie |
| Stew Kazoo Says (Kazoo Room) | `/simon-says` | underwater.png | Stew + Lou & Stew |
| Ear Quest | `/ear-trainer` | beach.png | Dr. Jellybone + Snorkel Sharky |
| Beat Lab | `/loop-studio` | graffiti-wall.jpg | Jelly Rap Trio |
| **Robot Boogie** (Incredibox-style stem mixer) | `/robot-boogie` | robot-boogie-scene.png (disco) | Full 8-character disco band |
| **Who's Got the Rhythm** (formerly "Stew's Rhythm Academy") | `/boom-garden` | jukebox-floor-1.png (disco tile) | Disco Chunk + Jazzy + Charlie |
| Fun Facts Clubhouse | `/fun-facts` | clubhouse.png | Jazzy + Charlie |

**Feb 2026 name-swap note**: The two rhythm games swapped names. What was "Who's Got the Rhythm?" (falling notes) became **Jelly Jukebox** (disco theme). What was "Stew's Rhythm Academy" (rhythm-reading rooms) became **Who's Got the Rhythm** (disco tile-floor theme). Inside that room, "Echo Stew" mode is now **Parrot Percussion** with tagline "Stew plays. You play it back." The internal route names `/rhythm-game` and `/boom-garden` were preserved for sticker/achievement compatibility.

**Feb 27, 2026 addition**: **Robot Boogie** — Incredibox-style stem mixer under CREATE. 8 characters, 12 audio stems (bass, 4 drums, guitar, 3 horns, 3 synths), preloaded and group-started on the first tap so they stay in perfect sync. Multi-stem characters (Chunk/Jellybone) cycle their variants on each click.

Each destination card features a full-bleed background scene, prominent character art, and an ALL-CAPS NES-cartridge title. Sign nameplates and taglines were removed Feb 2026 per the world-building direction.

## Academy Rank System (Polliwog → Maestro)
Driven by total stickers earned. Warm, non-competitive.

| Rank | Min Stickers | Icon |
|------|-------------|------|
| Polliwog | 0 | charlie-polliwog |
| Tadpole | 5 | finn-danger |
| Apprentice | 12 | dr-jellybone |
| Soloist | 20 | jazzy |
| Conductor | 30 | charlie-drum-major |
| Maestro | 45 | charlie-grad |

- `useRank({ withCelebration })` derives current rank from sticker count.
- `RankBadge` shows on Home + Sticker Book.
- `RankUpCelebration` overlay (with confetti + fanfare-style animation) fires once when crossing a tier; persisted via `localStorage.jma_rank_seen_v1`.

## Character Personality Layer
- `RoomCharacters` component drops 3-4 friendly characters into each game page corners. Tapping any character:
  - Cycles through the character's available outfit assets (10 looks for Charlie, 4 for Sharky, 3 for Chunk, 2 for Jazzy/Lou/Stew).
  - Pops a contextual speech bubble that auto-dismisses.
- Fun Facts mobile: scene wider than viewport (`minWidth: 720px`) so kids horizontally pan/swipe to discover characters. Desktop stays 16:9 capped at 1200px.
- Stew added as a 7th Fun Facts character (kazoo/birds-themed facts).

## Implemented (Feb 14, 2026 — Phase 1-4 cohesion pass)
### Renames
- HTML title now `Jelly of the Month Club Music Academy (JMA)`.
- `Stu Kazoo` → `Stew Kazoo` everywhere (page title, instructions, sticker hints).
- `Loop Studio` → `Beat Lab` (page header, sticker hints).
- `Free Play` → `Jam Hall` (page header, sticker hints).
- `Rhythm Game / Who's Got Rhythm` → `Rhythm Arcade` (menu title).
- `Ear Trainer` → `Ear Quest` (menu title).
- `Fun Facts` → `Fun Facts Clubhouse` (page header).

### New components & data
- `components/HarpIcon.js` — SVG harp (placeholder until user uploads custom artwork).
- `components/RoomCharacters.js` — per-page ambient cast with outfit cycling + speech bubbles.
- `components/RankBadge.js` — current rank pill + progress to next.
- `components/RankUpCelebration.js` — rank-up overlay (mounted in `App.js`).
- `hooks/useRank.js` — rank derivation + opt-in celebration tracking.
- `data/ranks.js` — Polliwog→Maestro ladder.
- `data/musicFacts.js` — added `Stew` entry with 10 kazoo/birds facts.

### Modified
- `pages/HomePage.js` — complete redesign as Academy Campus. 6 destination room-cards, banner, rank badge, sticker spotlight, sticker book button.
- `pages/StickerBookPage.js` — Home button now uses harp icon; RankBadge displayed.
- `pages/FunFactsPage.js` — title renamed; scene now horizontally pannable on mobile; 7 characters.
- `pages/SimonSaysPage.js` — name + RoomCharacters.
- `pages/LoopStudioPage.js`, `FreePlayPage.js`, `RhythmGamePage.js`, `EarTrainerPage.js` — names + RoomCharacters.
- `components/GameUI.js` — Home button replaced with harp + "Home" label.
- `App.js` — RankUpCelebration overlay mounted globally.

## Backlog
- **P0 (pre-launch)**: Run full code review before GitHub Pages deploy (user asked for a reminder).
- **P1**: "Now Playing" chip on campus streets so kids learn song names (verify `campus-now-playing` covers all streets).
- **P1**: For Parents page static game/tool counts out of date after menu moves.
- **P1**: Fun Facts Clubhouse discovery tracker + reset.
- **P2**: Music 101 nudges in games; JMAtv LIVE banner shows current airing title.
- **DONE June 2026**: Jukebox landscape HUD + guitar hold-sustain (iteration_45); landscape intro-menu grid + FitBox end cards (iteration_46); Charlie how-to voice lines + speaker buttons (iteration_47); Academy Plaza immersive homepage replacing card grid (iteration_48).
- **DONE June 2026 (plaza gate polish)**: `campus.js` gates now support `drop` (shift gate art + portal gradient down N% while inner buildings/ribbon stay fixed — Play/Learn use 4) and `ribbonLift` (Create ribbon +5%). Portal gradients widened 5% each side; ribbon now spans `portal.box` directly. `gate-play.png` fully redrawn (Gemini image gen, checkerboard bg removed via flood-fill) — no more alpha holes/black artifacts. All three ribbons shifted +5% right (`portal.box.left + 5`). Ribbons restyled as flat sign planks (`GateRibbon` in CampusMapPage: rounded 12px, 3px outline, drop shadow) — user picked style B over scroll-banner PNG and neon marquee. Plaza front "cover" sand layer removed. JMAtv kiosk (`DriveIn`) now plays a muted looping Vimeo preview (`pickFeaturedEpisode`) with scanlines + small logo bug (Vimeo shows a security error in the screenshot sandbox only — referrer not whitelisted — works on real preview).
- **DONE June 2026 (phone-landscape fixes)**: FitStage ratchet fixed — natural height is now measured with the `min-height:100%` fill lifted (`.fit-measuring` class), so the scale grows back when content shrinks (intro after a game). Stew Kazoo Says: Stew beside the kazoo board (`.simon-stage`, `.simon-*` classes). Sight-Reading Sprint: compact single-column layout (`.sr-*` classes), bells forced to one row; the Jam Session `62vh` bells-row width rule is now scoped to `.jam-main`. Robot Boogie: active dancers sized from the measured band height (`bandRef`/`bandSize`, never taller than the band), Time Machine 150px + lineup 58px on landscape phones (`.rb-stage`). Fun Facts (phone porthole): scroller opens at ~42%/44% of the room instead of top-left. Global: `user-select:none` on body (inputs + For Parents page keep text selection).
- **June 2026 follow-up**: FitStage now scales against a `100vh` probe (not `innerHeight`) so the mobile URL bar showing/hiding can't flip the scale (suspected cause of Stew Kazoo Says "glitching"), plus a 0.97→1 dead zone. Sight-Reading landscape: note images 64px (`.sr-staff [data-testid^=staff-note-] > div:last-child`). Robot Boogie: dancers may be 1.25× band height, no negative margins when height-limited; TM 130px / lineup 54px on landscape phones.
- **June 2026 follow-up 2**: Sight-Reading landscape notes 50px (`.staff-note-img` / `.staff-ledger` classes added in SolfegeStaff), staff 150px, clef 96px. Robot Boogie: height-based dancer sizing applies ONLY when `innerHeight < 520` (desktop untouched); slot may be 1.7× band height (sprites are centered with padding), 1-row vs 2-row fit check, `maxHeight:none` when sized; TM 112px / lineup 50px. Simon START "not loading" could not be reproduced (testing_agent iteration_50 with touch emulation: all 6 scenarios pass, scale stable 1.00) — likely stale dev bundle on the phone.
- **June 2026 — Sticker Shack + Rank Hall (testing_agent iteration_51: 100% pass)**: Sticker Book reskinned as dark "Sticker Shack" (pegboard bg, `.shack-sign` headers, sticker cards tilted/glossy, locked = white ghost + "?"); `AchievementBadge` → metallic medal (conic bronze/silver/gold ring, foil shine `.medal-earned::after`, star rivet, locked = navy disc + "?"). `StickerDetailModal` + `HowRanksWorkModal` render via `createPortal(document.body)` (fixed inside FitStage's transform pinned to the page top on phones) and the detail card is wrapped in `FitBox`. Bandstand → `path: '/rank-hall'` (new `pages/RankHallPage.js`): height-locked stage scene — curtain, marquee with rank, trophy shelf (tap → host bubble), kid's avatar under a swaying spotlight (tap/“TAKE A BOW!” → bow anim, crowd burst via exported `CrowdRow`/`StageLights` from ShredLegendPage, confetti, C-E-G-C fanfare from assets/audio), next-rank meter, host swaps to Dr. Jellybone when the avatar is Charlie; `.rank-hall-*` landscape CSS. Also: desktop campus drag no longer triggers a building click (`dragged` ref + `onClickCapture`), Beat Lab deck centered (removed inline safe-area margin-left), sticker-count pill removed from the Sticker Shack boot, Shred song renames (Berto's Barn Burner / Finn's Face Melter), orientation nudge sentence removed.
- **June 2026 — Rank Hall v2**: bow-shrink bug fixed (confetti wrapper `overflow-hidden`; pieces flying below the stage inflated FitStage's scrollHeight → scale 0.5). Added: hall music via exported `useStreetMusic` (Magic / Brand New Friend) with mute chip (`.rank-hall-music`), hype hearts on the BOW button → 3 bows = STANDING OVATION (banner, all 8 crowd shouts, double fanfare, brighter spotlight), `CrowdBurst` hearts/notes + camera flashes, `BadgeTicker` of earned badge names along the curtain, spotlight swings to wherever you tap (`spotX`) then drifts back.
- **June 2026 — Rank Hall v3 + guitar sustain**: spotlight sway restored (tap-to-aim removed); ovation = 3× sparklers (27 hearts/notes, 15 flashes, 3 confetti bursts); fanfare is now kick → crunch-guitar C‑E‑G‑C → crash (`SFX()` helper, assets/audio). Guitar sustain root cause: clean-tone samples' tails are near-silent for 4th/5th-octave notes (tail RMS ≈ 0.001–0.004 vs attack 0.03) while makeup capped at 2.4× → held notes faded out early and unevenly. `analyzeLoop` now walks the 0.6 s loop window back until the string is ≥30% of attack and makeup caps at 4×; note/chord/bend buttons use `touch-none` so slight finger drift can't fire pointercancel.
- **June 2026 — Dressing Room rebuilt as backstage (testing_agent iteration_52: 8/8 pass)**: `pages/DressingRoomPage.js` — vanity mirror (assets/dressing/mirror.png) with the Jelly inside, "THE CAST" headshot row, outfits as hanger cards on a rail (assets/dressing/rail.png, horizontal scroll `.dr-hangers`), tap → flyer + `Poof` sparkles + flash + pose (framer `useAnimationControls`, NOT key-remount — remounting stacked avatars) + per-character speech bubble (`<char>.dress.pick/.wear` voice lines added to voiceLines.js; Lou shows "…"), locked outfits = 3 s greyscale ghost + "Earn it" tag, new unlocks = gift box (assets/dressing/gift.png; `jma_outfits_seen_v1`, initialised with everything unlocked on first visit) → unwrap with confetti + fanfare, SNAP! camera 3‑2‑1 → Polaroid → pin to photo wall (`jma_polaroids_v1`, max 6). All avatar imgs sized with explicit box + `object-fit: contain` (Safari % height chains stretched some). Asset cutouts: flood-fill checkerboard + grow through pale glow halos (mirror) — see /tmp scripts pattern in this session; `.dr-*` landscape CSS.
- **June 2026 — iPhone fullscreen fix**: iOS Safari exits fullscreen on history traversal; `GameHeader` back no longer uses `navigate(-1)` — `parentRouteFor(pathname)` (GameUI.js) maps a room to its street via `CAMPUS_BUILDINGS` (`/campus?zone=…`), `/jmatv/*`→`/jmatv`, `/lessons/*`→`/lessons`, plaza rooms/campus→`/home`; `backTo` still overrides. (`backLink` prop seen on several pages is NOT a GameHeader prop — ignored.)
- **June 2026 — plaza polish**: JMAtv kiosk is now a 3/4-perspective CRT TV (assets/plaza/crt-tv.png, magenta-keyed screen hole; `DriveIn` places the Vimeo preview in the hole at left 28.2%/top 32%/w 50.7%/h 52.2%). Play gate redrawn in the same slight top-left 3/4 perspective as Learn/Create (portal box 23/54). Street music volume 0.28 → 0.16 and pauses on `visibilitychange`/`pagehide` (resumes with fade on return).
- **KNOWN (needs Path C)**: Safari user lost progress — iOS/macOS Safari ITP deletes all script-writable storage (localStorage) after 7 days without a visit, and Private Browsing never persists. Stopgaps: Sticker Shack → Manage Data → Backup/Restore JSON; installing to Home Screen (PWA) exempts the 7-day purge. Real fix = accounts/progress sync (Path C).
- **OPEN**: "blank strip at bottom" on Shred City on a landscape phone — still unreproduced; waiting on user screenshot.
- **OPEN (needs user screenshot)**: "blank strip at bottom" on Shred City / after Change Level on a landscape phone — not reproducible in an exact-viewport sandbox (no gap at 844×390). Suspect a vh vs innerHeight / URL-bar mismatch on the device; the ratchet fix may already change it. Ask for device + browser + screenshot.
- **P0 (new, user-flagged as important)**: **Robot Boogie waiting area (bottom lineup) scrolls off-screen on some viewports** — the compact character lineup + Time Machine can be pushed below the fold on shorter phones / landscape / tablet-portrait. Fix so the waiting area is always visible without vertical scroll.
- **P1 (new)**: **GarageBand-style electric guitar** — add a strummable electric guitar instrument (à la GarageBand touch instruments). Placement TBD (Jam Session tab? new Beat Lab melody instrument? standalone?).
- **P0 (deferred, needs go)**: Beat Lab rework — swap instruments to Kick/Snare/Hat/Crash + Stand-up bass + Sax (A minor) + Piano; ditch bells; use `[Rhythm | Melody]` tabs.
- **P1**: Note Names label toggle audit — verify Solfège / Letters / Both across every mini-game.
- **P1**: JMAtv inline-modal player on iOS Safari (kill the per-episode "TAP FOR SOUND" tap).
- **P1**: Replace `HarpIcon.js` SVG with user's custom harp artwork once uploaded → `assets/ui/harp.png`.
- **P1**: Beat Lab grid-cell memoization — split 96-cell sequencer into memoized rows.
- **P2**: Beat Lab timer consolidation (merge 7 setTimeout/setInterval calls).
- **P2**: Robot Boogie "boop" SFX on pinch-scale complete.
- **P2**: Parent Page CREATE spotlight (DAW / Song Studio) on `ForParentsPage`.
- **P2**: Dynamic scale numbers on parent page (read from data files).
- **P2**: Mechanic tags on game cards ("Tap the notes" / "Match by ear").
- **P2**: Sticker Book preview strip on Home.
- **P2**: JMAtv "Puns and Funs" episode rename list (waiting on user's titles).
- **P2**: Note Match logo swap (waiting on white PNG upload).
- **P2**: Score multiplier (×2) for streaks of 5+ in Rhythm Arcade.
- **P2**: 0.5x / 1x tempo dial on Boom Garden mode-pick screen for struggling students.
- **P2**: Split `FreePlayPage.js` (>900 lines) and `BoomGardenPage.js` (>800 lines) into sub-components.
- **P2**: README.md with GitHub Pages deploy instructions.
- **P2**: Verify MP3 recording on real mobile devices.
- **P3**: Hide "For Grown-ups" home-page link after subscribe (waits on Path C).
- **P3**: 24/7 streaming channel (research phase, on hold).
- **P3**: Color-randomness audit (case-by-case, on hold).
- **P3**: Confetti celebration on Who's Got Rhythm / Ear Quest milestones.
- **P3**: "Maestro's Map" board-game journey using existing minigames as tiles (idea stage).

## Path C — Backend (PAUSED, do NOT start until user says so)
- **Stage 1**: FastAPI + MongoDB + Auth backbone (JWT email/password + Emergent Google Auth for teachers + Class Code + First Name for kids). Zero visible UI change.
- **Stage 2**: Optional login syncs stickers/ranks to DB. Guest play still frictionless.
- **Stage 3**: `/teacher-portal` (rosters, class codes, report cards).
- **Stage 4**: Stripe test-mode checkout + free-tier paywall (chill Jukebox, Note Match easy, Lesson 1, Cadet Rhythm, Jam Session, Beat Lab are free; rest locked with silhouette stickers as teasers).

## Implemented (Feb 20, 2026 — later) — Boom Garden round-cycle + Stew Kazoo animations
- **Tap Trail no longer breaks after one round** — added `roundKey` on `RhythmStrip` / `ScrollingRhythmStrip` so the framer-motion node fully remounts between rounds and re-applies `initial={{ x: startX }}`. Verified via DOM probe across 3 consecutive Tap Trail rounds.
- **Stew Kazoo Says animations fire reliably on every note** — replaced 4-stacked-img display-toggle (which got clobbered by React re-applying JSX style on every re-render) with a single `<img>` whose `src` is swapped imperatively. Same pattern proven by `StewDrummer` in Boom Garden. Verified 9 src cycles in 3 s of demo with correct frame order.
- **CI build unblocked** — added eslint-disable for the stable `useImperativeHandle` in `StewDrummer.js`.



## Implemented (Feb 30, 2026 — Robot Boogie v8 special sauce)
- **P0 layout fix**: n=4 dancers now render in a single row (widthPct 28% / maxW 340px / negMx 22px). Active band capped at `calc(100vh - 340px)` so 2-row layouts at n≥5 never push the Time Machine into the compact lineup. Metrics-verified `bandOverlapsMachine: false`.
- **SVG lightning bolts** (`components/LightningStage.js`): persistent, jittering, team-colored plasma paths shoot from the Time Machine's top vent to every active character. Bolts re-roll every 130ms for a crackling live-plasma feel and gain a bright branch on zap. Replaces the old PNG lightning frames the user hated.
- **Beat-locked visual clock**: `useRobotBoogieAudio.getAudioClock()` + new `hooks/useBeatPulse.js` derive beat/phase/pulse from the same Web Audio timeline the stems loop on. Consumers subscribe imperatively (zero rerenders at 60fps).
- **Beat-synced world**: active characters' glow pulses; Time Machine under-glow throbs; bottom lineup bobs left/right + hops on the downbeat with per-character offsets; subtle world + disco-floor pulses in the background.
- **Steam puffs** on every character toggle — CSS keyframe `robotBoogiePuff` rising blobs from the machine vent.
- **Llama Lou PNG cropped**: source frames had ~50% empty transparent space; all 6 dance frames now cropped to 250×288 identically (originals backed up under `/lou-dancing/originals/`). Lou now sits centered in his slot.


## Implemented (Feb 17, 2026 — Phase 3 Educational Wins)
Four new mini-features designed to boost real music learning while keeping it fun:

### 1. Practice Buddy (daily-return streak)
- `hooks/usePracticeStreak.js` tracks `{count, lastDate}` in `localStorage.jma_practice_streak_v1`. Same-day visits don't bump; previous-day visits +1; gaps reset to 1.
- Crossing 3 / 7 / 14 days unlocks **3 new collection stickers**: Practice Buddy / Weekly Wonder / Two-Week Trooper (under Fun Milestones — pure flair, doesn't gate rank).
- `components/PracticeStreakChip.js` shows on the Home page once streak ≥ 2 (hidden day 1 to avoid pressure).

### 2. Sight-Reading Sprint (new game in PLAY)
- New page `pages/SightReadingPage.js` + reusable `components/SolfegeStaff.js`.
- 3 difficulty tiers: Cadet (3 notes / 20 s / low bells), Pro (4 / 18 s / low bells), Master (5 / 16 s / full 8-bell range).
- Flow: demo plays the sequence once → kid taps bells in order → time bonus on completion → win modal.
- Earns **Music Scholar** achievement ladder (same domain as video lessons — proves reading-the-notation skill).
- Tile added to Play menu (`/play`) and route `/sight-reading` wired in `App.js`.

### 3. Rest Quiz (new Detective Dr. Jellybone mode)
- 4th difficulty in `pages/DetectivePage.js`: instead of swapping one note to a wrong pitch, the suspect tune has an **EXTRA** note inserted.
- 30-second countdown timer (`detective-timer`) starts when guess phase opens; timeout costs a life and reveals.
- The chip row renders the corrupted sequence (one extra chip vs original).
- Reveal text: *"Slot N (SOLFEGE) was the EXTRA note!"*

### 4. Tempo Quiz (new Ear Quest sub-mode)
- New component `components/TempoListeningGame.js`, accessible via the `ear-tempo-quiz-btn` on Ear Quest menu.
- Plays two short clips of the same tune at different BPMs. Kid picks **Faster** or **Slower**.
- 10 rounds per run with progressively narrower BPM deltas: ±40 → ±20 → ±10 BPM.
- Earns **Rhythm Reader** achievement ladder: Cadet at 5+ correct, Pro at 8+, Master at 10/10.

### Verified
- Frontend testing agent: **100% pass (6/6 acceptance criteria)**, zero pageerror exceptions, all 13 routes navigate cleanly.
- `CI=true yarn build` → Compiled successfully (263.25 KB gz, +8 KB for Phase 3).

## Implemented (Feb 2026 — Spacebar hold + Clubhouse Chatter)

### Spacebar hold in Who's Got The Rhythm (`BoomGardenPage.js`)
- Added `if (e.repeat) return;` guard in the keydown handler — holding Space now produces exactly ONE snare tap, not a repeat-storm. Verified Playwright: 1 press + 30 auto-repeat keydowns → 2 UI chips total (initial tap + one forward-walk auto-miss).
- Added a `spaceHeld` visual state: a soft purple pulse ring around Stew while Space is held, framer-motion exit-animated. Purely cosmetic — scoring is unchanged, so kids who don't hold "long enough" through half/whole notes are not punished.

### Clubhouse Chatter (`FunFactsPage.js`)
- Added a `chatter` field to each `SCENE_CHARS` entry mapping the character to an existing personality-appropriate SFX (Chunk → piano flourish, Finn → drum fill, Dr. Jellybone → detective sting, Stew → kazoo honk, Jazzy → bell pair, Charlie → DJ scratch, Lou → twinkle).
- On FIRST find only, `showFact` spawns a soft `new Audio(chatter)` at volume 0.55 with autoplay-rejection silently caught.
- Verified via Playwright Audio-constructor interception — correct SFX fires for each first find.

## Testing Credentials
N/A — frontend-only, no auth.

## Implemented (Feb 2026 — Fun Facts Clubhouse: standalone Lou + Stew)
- `FunFactsPage.js` `SCENE_CHARS` array split the legacy `Lou & Stew` entry into two standalone entries: **Lou** (`lou.png`, no Stew on shoulder) at his old spot, and a new **Stew** (`stew.png`) placed at the top-right tree area (left 88% / top 18%, swing anim).
- Intro copy: "Find all 6 friends!" → "Find all 7 friends!".
- `stickers.js`: replaced `char_loustew` with `char_lou` + `char_stew` character stickers.
- `musicFacts.js`: renamed `'Lou & Stew'` key → `'Lou'`; existing `Stew` facts (kazoo/bird facts) now wired to the standalone Stew.
- Verified via manual screenshot: all 7 characters found, Stew visible top-right on the palm, Lou standalone in bottom-right.


---

## Session Update — June 2026 (Beta feedback + JMAtv Live)

Beta tester (Rose) feedback pass + a new Live channel. Respond in English.

### Shipped this session
- **Global "pause behind pop-ups"** (`hooks/useGamePause.js`): rank-up celebration + sticker toast register as active overlays; countdown games (Name That Note, Sight Reading) hold their clock, and Stew Kazoo holds its demo while a badge/dialog is up. Wired in `RankUpCelebration.js`, `StickerToast.js`.
- **Sight-Reading Sprint**: real fix was the dark `clubhouse` bg hiding the Do/Re/Mi — swapped menu + gameplay bg to bright `wintery-sunburst1.png`; title reverted to plain dark text (reads on bright bg).
- **Name That Note**: added "Replay Notes" button (`reviewTour` via shared `walkTour`) to re-walk the staff tour mid-round without losing score.
- **Stew Kazoo Says**: after beating all levels → win overlay (Play Again / Keep Playing the Kazoos / Back to Games) + free-play mode (kazoos make sound, no scoring). Fixed silent-kazoo bug (overlay AnimatePresence exit was swallowing taps → render instantly, resume audio ctx).
- **Jam Session**: record button recolored red.
- **HomePage mobile layout**: phones now show all 4 destinations above the fold — Play+Learn (2-col), full-width Create banner (PrimaryCard `wide`), and a JMAtv CRT card (`JmatvCrtMobile`). Hero + pills shrunk on mobile. Desktop unchanged (3 cards + RetroTV).
- **Jelly Jukebox beat-sync** (`RhythmGamePage.js` + `songs.js`): notes now land on real song beats. Per-song `audioAnchorMs` (measured via librosa comb-filter) added to 7 audio JMA Originals; all configured bpms verified correct. Engine measures device overlap fraction → beat-aligned lead-in; `SYNC_OFFSET_MS=70` nudge. Difficulty no longer time-stretches (broke sync): spawn cadence locked to beat; Easy = half the notes (strong beats) + slow fall; drums left intact. Drum songs rewritten to deliberate kick/snare/crash backbeat. (User says sync "better"; Easy feel still being tuned — TABLED.)
- **JMAtv LIVE** (`pages/JMAtvLivePage.js`, route `/jmatv/live`): interleaved never-ending feed of all 3 channels (`buildLivePlaylist()` round-robin, 33 items); clock-based start index + mid-show seek via Vimeo SDK `getDuration`/`setCurrentTime`; auto-advance on `ended`; manual "Next Show"; error shows manual-skip card (no auto-advance storm). LIVE banner on JMAtv home; homepage CRTs (RetroTV + mobile tile) now open `/jmatv/live`. Verified via testing_agent iteration_23 (all pass).

### Open / backlog from beta review (not yet done)
- Robot Boogie title overlaps Reset/tempo controls (P1) — SKIPPED per user.
- Jelly Jukebox Easy feel still "not great" — TABLED by user.
- Fun Facts: "found X of 7" progress indicator + shuffle/reset after all found (play-again button exists, may be cut off on phone).
- Beat Lab track mute button cut off on phone (exists, mobile visibility).
- Who's Got the Rhythm: clearer timing cue.
- "Learn this in the Academy!" hint nudges when a kid struggles.
- Sticker page overflow (may be pinch-zoom; verify).
- Note Names label toggle audit across all games.

### Testing notes
- The main-agent screenshot harness CANNOT dismiss the audio-unlock overlay reliably nor read runtime console / post-interaction state (it captures only load-time console + a pre-interaction frame). Use `testing_agent` for anything behind the overlay. Reports: iteration_22 (Jelly Jukebox regression), iteration_23 (JMAtv Live) — both pass.
- Vimeo embeds 401 in the test sandbox (referrer not whitelisted) — environment artifact, works on real preview/device.

## Session Update — June 2026 (Plaza polish + iPhone Safari reality)

### Shipped this session
- **Play gate** regenerated at the same ¾ angle as Learn/Create (generated on flat magenta + `scripts/chroma_key.py`); portal box nudged (`campus.js` left 27).
- **CRT TV** faces the stage: new `crt-tv.png` (knobs left, no antenna star) rendered with `scaleX(-1)` → faces left, knobs right; screen cutout `{left 8.8%, top 32.3%, w 46.5%, h 47.8%}`.
- **Dressing-room trailer** flipped inward (`flip: true` in `campus.js` → img `scaleX(-1)`).
- **Locked gates**: dashed "rope" removed. Locked LEARN/CREATE gates grey out (portal + art + ribbon), host stays in color, swinging yellow **UNLOCK ME!** sign on chains; top pill "Earn 1 badge to open" (no lock icons). Tapping a locked gate shakes → opens the Quest Board (`onLocked` → `setQuestsOpen`). Voice line `charlie.hub.lockbadge` rewritten to be encouraging.
- **Building signs baked into art** (edited via reference-image generation + chroma key): STEW + hanging KAZOO plank, LIVE JAM, SONG STUDIO, SIGHT READING, "WHO'S GOT THE RHYTHM?" (2 lines). JMA harp logo composited into the Clubhouse gable (PIL). Originals backed up in `/tmp/sign_bak` (ephemeral).
- **Jam Session phone landscape** (`@media (max-height:520px) and (orientation: landscape)`): `useFitScale` (width AND remaining height) for xylophone/piano/drums/guitar (`ResponsiveScaler nativeHeight` 492 for guitar; CSS `zoom` hack removed); `.key-hint` class on all keyboard hints (drums letters, xylophone/piano/bells numbers) hidden on phone landscape; bells 70px on a `min(66vh,720px)` circle (no overlap).
- **iPhone Safari**: confirmed (caniuse/WebKit 2026) NO Fullscreen API on iPhone except `<video>`. Shipped: `isIPhone()` in `lib/fullscreen.js`; `FullscreenButton` renders `IPhoneInstallButton` on iPhone → `InstallCard` (Share → Add to Home Screen steps); one-time Plaza nudge "Want JMA full screen? Tap here →" (`localStorage jma_install_nudge_seen`). Real fullscreen on iPhone = PWA install (manifest already `display: fullscreen`) or a future Capacitor App Store wrapper.
- **Safari-fit sweep at 844×345** (iPhone landscape minus URL bar): compact `PlayerNamePrompt` (`.name-prompt-card`), scrollable compact Shred City intro (`.shred-intro-card`, `.shred-main`), scrollable Clubhouse intro (`.clubhouse-intro-card`), Beat Lab `padding-top` 52px. All other routes verified fitting/scrolling.
- Testing: `test_reports/iteration_53.json` (frontend regression — pass; guitar overflow found there and fixed after).

### Still open
- Avatar significance (selected Jelly in game end-cards + "new outfit" gift nudge on kiosk) — approved earlier, not started.
- Safari localStorage "not saving" report — unverified; audio pause on `visibilitychange`/`pagehide` was added.
- Full code review before GitHub Pages launch (user asked for reminder). For Parents counts. Music 101 nudges. PWA service worker. The Path. Sing-back mic. Path C PAUSED.

## Session Update — June 2026 (part 2): Rank Hall → The Academy
- **Decision**: partner rejected the Rank Hall as a destination. Rank progression KEPT (user's core retention mechanic) but moved into the world:
  - **The Academy** (`assets/plaza/academy.png`, cuckoo-clock schoolhouse, plaza building `academy` → `/academy`). `Cuckoo` component in `CampusMapPage.js` pops the current rank's character onto the tower ledge (door ≈ left 55–68%, top 18–31% of the square art box).
  - **`AcademyPage.js`** rooms: *Today's Class* (3 daily quests + single Start button + stamps = `questDays`), *My Album* (saved Beat Lab beats + Song Studio songs as sleeves), *Yearbook* (avatar, rank ladder, next-rank meter, badge chips, stamps, How-ranks modal, print → `/sticker-book?print=1`).
  - **The Stage** (`/rank-hall`, `RankHallPage.js`) is now ceremony-only: bows, crowd, ovation, "My Yearbook" button. Trophy shelf + next-rank card removed (live in Yearbook). Bandstand renamed "The Stage".
  - `RankUpCelebration` gained "Take a bow on stage!" → `/rank-hall`.
- Also this session: Beat Lab audio-clock scheduler (`lib/stepScheduler.js`, fixes tempo sag on slow iPhones; recordings steady); plaza host blur fixed (removed animated `rotate` — Chrome rasterizes animated-rotation layers blurry); Back button constant 40px on phone landscape via `--stage-scale` from FitStage (`.back-shield/.back-label`, sticker-home-btn); Clubhouse "JMA" plank sign in art; Parrot Percussion hero = `stew-drumline.png`; corner `RoomCharacters` removed from intro/difficulty screens of Ear Quest, Name That Note, Stew Kazoo, Detective, Note Match; Jukebox SPEED label white; Rank Hall host hidden on portrait phones (`.rank-hall-host`); "The Magic Is in the Music" (Vimeo 1237507858) added to JMAtv music videos.
- Tests: `iteration_53.json`, `iteration_54.json` (Academy — pass).
- **Open**: Academy interior art is a plain gradient (needs a proper hall backdrop + Charlie host); For Parents copy still over-claims (COPPA/FERPA/DPA/report card) — user asked why, agreed path: Vimeo dnt, local fonts, privacy page, soften copy (NOT YET DONE); voice line recordings missing (`assets/voice` empty); WebP conversion + service worker for school Wi-Fi; standards-alignment doc; Avatar-in-games; Path C paused.

## Session Update — June 2026 (part 3): Academy polish
- **Academy interior**: painted hall backdrop `assets/academy/hall.jpg` (welcome desk left, clear center for cards); Charlie (`charlie-grad.png`) stands by the desk (md+ only) with a tappable rotating welcome bubble; voice line `charlie.academy.welcome`.
- **Cuckoo rank-up moment** (`Cuckoo` in `CampusMapPage.js`): first time a new rank (≠ polliwog) is seen on the Plaza (`jma_cuckoo_seen_rank_v1`), the door halves swing open (rotateY), 3-note xylophone chime (`assets/audio/xylo G/b/High c.mp3`), bouncing character, "RANK!" banner for 4s, voice `charlie.academy.rankup`.
- **Album cover designer** (`AcademyPage.js`): tap a sleeve → `CoverDesigner` modal: 6 colors + avatar/16 collection-sticker icons; saved in `jma_album_covers_v1` {trackId:{color,sticker}}; "Open in Beat Lab / Song Studio".
- Verified via screenshots (hall, designer save, cuckoo moment with seeded Tadpole rank). Testing agent not re-run for this part.

## Session Update — June 2026 (part 4): Academy as a clickable room
- `AcademyPage.js` is now a scene: hall art sized like `background-size: cover` (bottom-center anchored, `HALL = 1264x848`) with %-pinned `Hotspot`s — corkboard → Today's Class, gold record on trophy wall → My Album, yearbook on desk → Yearbook (panels open as modals, `academy-panel-*`, close `academy-panel-close`). Extras: desk bell (note + wiggle), plant wiggle, Charlie bubble cycling. Tabs removed.
- Cuckoo moment bug: plaza auto-scrolls the Academy into view (scrollIntoView delayed 350ms to outlive the plaza's `scrollLeft=0` reset) before the moment plays. Tests: iteration_55 (room pass, scroll fail) → iteration_56 (scroll PASS).

## Session Update — June 2026 (part 5): Drummer's-POV kit in Jam Session
- Jam Session drums (`FreePlayPage.js` `DrumKitPlayable`) now a GarageBand-style top-down kit: AI-generated pieces in the house style (red shells / cream heads / thick outlines), 2 frames each (idle + struck, cut from the same canvas) at `assets/drums/pov/{kick,snare,racktomL,racktom,floortom,hihat,crash,ride}-{1,2}.webp` (~35–58KB each). Layout table `DRUM_LAYOUT` on a 1000×460 canvas; toms mount onto the kick, hardware arms face center (Tom 1 uses `racktomL`).
- New 8th piece **Tom 2** (`midTom`, key D) = Tom sample at playbackRate 0.8 (`useAudio.playDrumSound`); Floor Tom moved to key F. Old front-view PNGs remain in `assets/drums/` (still used by Beat Lab `DrumKitVisual` / Instruments.js if ever re-enabled).
- Source JPEG generations + `build_pairs.py` (checkerboard→alpha cutout, shared crop) kept in `/app/memory/drum_pov/`.
- **Hold**: `Hey Pachuco stage.psd` — user said hold for now.
- Verified via screenshots (desktop + 844×390 landscape, all 8 pieces tappable, hit frames swap). Testing agent not run.
