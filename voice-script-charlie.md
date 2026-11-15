# JMA Voice Script — Charlie the Polliwog

**81 lines for Charlie.** Sinatra / Louis Prima New York wise guy. Friendly, finger-snapping, "how YOU doin'" warmth. Calls you kid, pal, cadet.

## How to record
- One short take per line, 1–3 seconds. Leave ~150 ms of silence at the start, trim the tail.
- Export **MP3, mono, 44.1 kHz, ~96 kbps**, normalized to about **−3 dBFS** peak.
- File name = the `id` column exactly, plus `.mp3` (e.g. `doctor.correct.2.mp3`).
- Drop files into `frontend/public/assets/voice/`. Missing files are skipped silently, so record in any order.
- Numbered takes (`.1 .2 .3`) are variants of the same moment — the app picks one at random, so vary the delivery.
- Keep the *energy* in the "Emotion" column; the words are short on purpose — the voice does the work.
- **Kudos** (cheers, "miss" lines, "keep going" lines) are rationed in the app: at most one every 15 seconds across all games, so each take will be heard on its own.
- **How-to lines** (`howto`) play once when a kid opens that game, right after the host's tagline, and again when the kid taps a How to Play speaker button (where the game has one). These run 3–5 seconds — say them slowly and clearly, many listeners can't read yet.

---

## How-to instructions — 21 lines

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.howto.jukebox` | **Tap on the bell when it drops in the box.** | coach, upbeat | Jelly Jukebox — first bells song of the session · bells How to Play speaker |
| 2 | `charlie.howto.jukedrums` | **Tap on the drum when it drops in the box.** | coach, upbeat | Jelly Jukebox — first drums song of the session · drums How to Play speaker |
| 3 | `charlie.howto.kazoo` | **Watch Stew play his kazoos, then tap 'em back in the same order.** | coach, warm | Stew Kazoo Says menu / speaker button |
| 4 | `charlie.howto.earquest` | **Listen to the mystery note, then tap the bell that matches it.** | coach, warm | Ear Quest menu / speaker button |
| 5 | `charlie.howto.tempo` | **Listen to these two tunes. Was the second one faster or slower?** | playful | Snail or Cheetah menu / speaker button |
| 6 | `charlie.howto.notematch` | **Flip two cards and listen, then find the ones that match.** | coach, warm | Note Match menu / speaker button |
| 7 | `charlie.howto.detective` | **Hear the tune twice, then tap the note that changed.** | sly, coach | Detective menu / speaker button |
| 8 | `charlie.howto.sightread` | **Read the notes on the staff, then tap the bells in the right order. Beat the clock!** | coach, quick | Sight-Reading Sprint menu / speaker button |
| 9 | `charlie.howto.namenote.name` | **See the note on the staff? Tap its name.** | coach, warm | Name That Note menu — Name It mode / speaker button |
| 10 | `charlie.howto.namenote.place` | **Read the note's name, then drag it onto the staff.** | coach, warm | Name That Note menu — Place It mode selected / speaker button |
| 11 | `charlie.howto.boom.copy` | **Listen to Stew's rhythm. After the count-in, play it back on the drums.** | coach, groovy | Who's Got the Rhythm — Parrot Percussion how-to card |
| 12 | `charlie.howto.boom.match` | **Listen to the secret rhythm, then tap the strip that matches.** | coach, groovy | Who's Got the Rhythm — Beat Finder how-to card |
| 13 | `charlie.howto.boom.trail` | **Tap Stew when each note crosses the gold line!** | coach, groovy | Who's Got the Rhythm — Rhythm Run how-to card |
| 14 | `charlie.howto.shred` | **Pick a song and play the guitar in time with the beat. No mashin'!** | rock announcer | Shred City intro / speaker button |
| 15 | `charlie.howto.robot` | **Tap the band members to zap 'em into the jam, then boogie, robot boogie!** | party host | Robot Boogie — on arrival / speaker button |
| 16 | `charlie.howto.funfacts` | **Slide the spyglass around to find the hidden friends.** | cozy, curious | Fun Facts Clubhouse — on arrival / speaker button |
| 17 | `charlie.howto.beatlab` | **Tap the pads to build a beat, then hit Play to hear your loop!** | coach, groovy | Beat Lab — on arrival, after Chunk's tagline |
| 18 | `charlie.howto.jam` | **Tap any instrument to play. Hit Record to save your jam!** | coach, upbeat | Jam Session — on arrival, after Jazzy's tagline |
| 19 | `charlie.howto.songstudio` | **Pick a mood, tap the keys to write your tune, then press Play!** | creative, warm | Song Studio — on arrival, after Charlie's tagline |
| 20 | `charlie.howto.dressing` | **Choose your character, then tap an outfit and try it on!** | warm, inviting | Dressing Room — on arrival |
| 21 | `charlie.howto.stage` | **Take a bow for the crowd, or pose for a poster!** | showman | Main Stage — on arrival |

---

## Host lines, taglines & big moments — 37 lines

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.hub.first` | **Hello there, and welcome to the Academy!** | huge smile | Home — very first visit |
| 2 | `charlie.hub.morning` | **Mornin', cadet. Let's make some music.** | bright | Home — before noon |
| 3 | `charlie.hub.afternoon` | **Afternoon, pal! Ya ready?** | bright | Home — noon to 5pm |
| 4 | `charlie.hub.evening` | **Evenin'! Nothin' like a night session.** | cozy, excited | Home — after 5pm |
| 5 | `charlie.hub.streak` | **Look at you — on a streak!** | proud | Home — practice streak ≥ 3 days |
| 6 | `charlie.hub.quests` | **Got fresh quests for ya today.** | eager | Home — fresh quests, none done yet |
| 7 | `charlie.hub.alldone` | **That's the whole list! See ya tomorrow, kid.** | warm, satisfied | Home — all 3 quests done |
| 8 | `charlie.jam.takeit` | **Take it to the Jam Session, kid!** | hyped | Beat Lab / Song Studio — tapping "Jam on it!" |
| 9 | `charlie.hub.lockbadge` | **Earn one badge and this street is yours — here are today's quests!** | playful, encouraging | Tapping a locked LEARN/CREATE gate — opens the Quest Board |
| 10 | `charlie.academy.welcome` | **Hello, cadet, and welcome to the Jelly of the Month Club Music Academy!** | warm, host | Entering the Academy — once a day |
| 11 | `charlie.academy.rankup` | **Way to go, rockstar! You just ranked up!** | excited | Campus — the moment a new rank is earned |
| 12 | `charlie.hub.lockpass` | **Ask a grown-up about that one, kid.** | gentle | Tapping an Academy-Pass-locked room (future) |
| 13 | `charlie.tag.shred` | **Welcome to Shred City, baby!** | rock announcer | Entering Shred City |
| 14 | `charlie.tag.songstudio` | **Step into the studio, let's write a hit!** | creative, warm | Entering Charlie's Song Studio |
| 15 | `charlie.tag.music101` | **Class is in session, folks.** | teacher-y, fun | Entering Music 101 |
| 16 | `charlie.tag.jmatv` | **You're watchin' JMAtv!** | TV announcer | Entering JMAtv |
| 17 | `charlie.meta.badge` | **Badda-bing — new badge!** | excited | Any achievement badge earned |
| 18 | `charlie.meta.sticker` | **New sticker! Lookin' sharp.** | delighted | Any collection sticker earned |
| 19 | `charlie.meta.gem` | **A Daily Gem! Now THAT'S classy.** | awed | Daily Gem sticker earned |
| 20 | `charlie.meta.rankup` | **Jumpin' Jelly Beans — you ranked up, kid!** | huge | Rank-up celebration |
| 21 | `charlie.meta.questsdone` | **All three quests. Whatta pro!** | proud | Daily quests complete overlay |
| 22 | `charlie.meta.academyopen` | **Jumpin' Jelly Beans! The Academy is OPEN!** | ceremonial | First badge → LEARN/CREATE reveal |
| 23 | `charlie.meta.streak3` | **Three days runnin'! Attaboy!** | proud | Practice streak hits 3 |
| 24 | `charlie.meta.streak7` | **A whole week? Fuhgeddaboudit!** | amazed | Practice streak hits 7 |
| 25 | `charlie.dress.pick` | **Me? You picked ME? Let's look sharp!** | delighted | NOT VOICED — speech bubble only (the character's riff plays instead) |
| 26 | `charlie.dress.wear` | **Ooh, lookin' good! Give us a spin!** | proud | Dressing Room — Charlie changes outfit |
| 27 | `charlie.fact.01` | **Your VOICE is your very first instrument — and you were born with it!** | curious, friendly | Fun Facts — tapping Charlie (fact 1) |
| 28 | `charlie.fact.02` | **When you sing, over 100 muscles in your body work together — even ones in your tummy!** | curious, friendly | Fun Facts — tapping Charlie (fact 2) |
| 29 | `charlie.fact.03` | **Humming is a kind of singing you do with your mouth closed — try it, it tickles!** | curious, friendly | Fun Facts — tapping Charlie (fact 3) |
| 30 | `charlie.fact.04` | **Singers warm up their voices just like athletes stretch their muscles.** | curious, friendly | Fun Facts — tapping Charlie (fact 4) |
| 31 | `charlie.fact.05` | **A CHOIR is a big group of people singing together in harmony — like a vocal team!** | curious, friendly | Fun Facts — tapping Charlie (fact 5) |
| 32 | `charlie.fact.06` | **Opera singers can sing SO loudly they don't even need a microphone!** | curious, friendly | Fun Facts — tapping Charlie (fact 6) |
| 33 | `charlie.fact.07` | **Babies can recognize their favorite songs before they're even born, from inside mommy's tummy!** | curious, friendly | Fun Facts — tapping Charlie (fact 7) |
| 34 | `charlie.fact.08` | **Whistling is music made just with your lips and air — no vocal cords required!** | curious, friendly | Fun Facts — tapping Charlie (fact 8) |
| 35 | `charlie.fact.09` | **The highest singing voice is a SOPRANO, and the lowest is called a BASS.** | curious, friendly | Fun Facts — tapping Charlie (fact 9) |
| 36 | `charlie.fact.10` | **Singing together with friends actually makes your brain release happy chemicals!** | curious, friendly | Fun Facts — tapping Charlie (fact 10) |
| 37 | `charlie.fact.11` | **Your voice sounds different to YOU than it does to everybody else!** | curious, friendly | Fun Facts — tapping Charlie (fact 11) |

---

## Reactions & Shred City calls — 20 lines

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.shred.opening` | **Opening act! Here we go!** | announcer | Crowd meter tier: Opening Act |
| 2 | `charlie.shred.headliner` | **You're the headliner, kid!** | bigger | Crowd meter tier: Headliner |
| 3 | `charlie.shred.legend` | **SHRED LEGEND, BABY!** | maximum | Crowd meter maxed |
| 4 | `charlie.shred.encore` | **They want an encore! Encore!** | crowd-chant | Encore round starts |
| 5 | `charlie.shred.toowild` | **Whoa whoa whoa — too wild, pal!** | laughing | Mash guard triggers |
| 6 | `charlie.shred.flawless` | **Flawless encore. Un-be-lievable!** | stunned joy | Result card after a flawless encore |
| 7 | `charlie.correct.1` | **Yeah, that's it!** | quick | Song Studio — saving a song (kudos: max one every 15 s) |
| 8 | `charlie.correct.2` | **Badda-bing!** | punchy | Song Studio — saving a song (kudos: max one every 15 s) |
| 9 | `charlie.correct.3` | **Now you're cookin'!** | happy | Song Studio — saving a song (kudos: max one every 15 s) |
| 10 | `charlie.correct.4` | **That's the stuff, kid.** | rock | Song Studio — saving a song (kudos: max one every 15 s) |
| 11 | `charlie.perfect.1` | **PERFECT! Whatta pro!** | yell | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 12 | `charlie.perfect.2` | **Oh, you're GOOD.** | thrilled | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 13 | `charlie.perfect.3` | **Ring-a-ding-ding! Flawless!** | amazed | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 14 | `charlie.miss.1` | **Ehh, almost, pal.** | kind | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 15 | `charlie.miss.2` | **Ooh, try that one again!** | encouraging | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 16 | `charlie.miss.3` | **Close, kid. Real close.** | sympathetic | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 17 | `charlie.miss.4` | **Shake it off. Try it one more time.** | upbeat | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 18 | `charlie.go.1` | **Keep it rollin'!** | cheer | Shred City — as the song starts (kudos: max one every 15 s) |
| 19 | `charlie.go.2` | **You got this, cadet!** | cheer | Shred City — as the song starts (kudos: max one every 15 s) |
| 20 | `charlie.go.3` | **All right, keep it rollin'!** | pumped | Shred City — as the song starts (kudos: max one every 15 s) |

---

## Quest nudges — 3 lines

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.quest.q_shred` | **Play a show in Shred City, kid!** | rock | Quest: Shred City |
| 2 | `charlie.quest.q_song_save` | **Come write a hit in my studio.** | creative | Quest: Song Studio |
| 3 | `charlie.quest.q_jmatv` | **Catch a show on JMAtv, pal.** | TV | Quest: JMAtv |

