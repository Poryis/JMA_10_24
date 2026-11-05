# JMA Voice Recording Script

**185 lines · 6 voices.** Lou never speaks. **Sharky IS Finn Danger — the same shark, one voice.** Stew can be performed as kazoo-talk.

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

## Charlie the Polliwog — 68 lines
**Rooms:** Academy host · Shred City · Song Studio · Music 101 · JMAtv  
**Voice:** Sinatra / Louis Prima New York wise guy. Friendly, finger-snapping, "how YOU doin'" warmth. Calls you kid, pal, cadet.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.hub.first` | **Heyyy — welcome to the Academy, kid!** | huge smile | Home — very first visit |
| 2 | `charlie.hub.morning` | **Mornin', cadet. Let's make some music.** | bright | Home — before noon |
| 3 | `charlie.hub.afternoon` | **Afternoon, pal! Ya ready?** | bright | Home — noon to 5pm |
| 4 | `charlie.hub.evening` | **Evenin'! Nothin' like a night session.** | cozy, excited | Home — after 5pm |
| 5 | `charlie.hub.streak` | **Look at you — on a streak!** | proud | Home — practice streak ≥ 3 days |
| 6 | `charlie.hub.quests` | **Got fresh quests for ya today.** | eager | Home — fresh quests, none done yet |
| 7 | `charlie.hub.alldone` | **That's the whole list! See ya tomorrow, kid.** | warm, satisfied | Home — all 3 quests done |
| 8 | `charlie.jam.takeit` | **Take it to the Jam Session, kid!** | hyped | Beat Lab / Song Studio — tapping "Jam on it!" |
| 9 | `charlie.hub.lockbadge` | **Earn one badge and this street is yours — here are today's quests!** | playful, encouraging | Tapping a locked LEARN/CREATE gate — opens the Quest Board |
| 10 | `charlie.academy.welcome` | **Welcome to the Academy! Today's class is up on the board.** | warm, host | Entering the Academy hall |
| 11 | `charlie.academy.rankup` | **Ding ding! A new friend just popped out of the clock — you ranked up!** | excited | Plaza cuckoo moment on a new rank |
| 12 | `charlie.hub.lockpass` | **Ask a grown-up about that one, kid.** | gentle | Tapping an Academy-Pass-locked room (future) |
| 13 | `charlie.tag.shred` | **Welcome to Shred City, baby!** | rock announcer | Entering Shred City |
| 14 | `charlie.tag.songstudio` | **Step into my studio. Let's write a hit.** | creative, warm | Entering Charlie's Song Studio |
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
| 25 | `charlie.shred.opening` | **Opening act! Here we go!** | announcer | Crowd meter tier: Opening Act |
| 26 | `charlie.shred.headliner` | **You're the headliner, kid!** | bigger | Crowd meter tier: Headliner |
| 27 | `charlie.shred.legend` | **SHRED LEGEND, BABY!** | maximum | Crowd meter maxed |
| 28 | `charlie.shred.encore` | **They want an encore! Encore!** | crowd-chant | Encore round starts |
| 29 | `charlie.shred.toowild` | **Whoa whoa whoa — too wild, pal!** | laughing | Mash guard triggers |
| 30 | `charlie.shred.flawless` | **Flawless encore. Un-be-lievable!** | stunned joy | Result card after a flawless encore |
| 31 | `charlie.correct.1` | **Yeah, that's it!** | quick | Song Studio — saving a song (kudos: max one every 15 s) |
| 32 | `charlie.correct.2` | **Badda-bing!** | punchy | Song Studio — saving a song (kudos: max one every 15 s) |
| 33 | `charlie.correct.3` | **Now you're cookin'!** | happy | Song Studio — saving a song (kudos: max one every 15 s) |
| 34 | `charlie.correct.4` | **That's the stuff, kid.** | rock | Song Studio — saving a song (kudos: max one every 15 s) |
| 35 | `charlie.perfect.1` | **PERFECT! Whatta pro!** | yell | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 36 | `charlie.perfect.2` | **Oh, you're GOOD.** | thrilled | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 37 | `charlie.perfect.3` | **Ring-a-ding-ding! Flawless!** | amazed | Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s) |
| 38 | `charlie.miss.1` | **Ehh, almost, pal.** | kind | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 39 | `charlie.miss.2` | **Not that one — try it again.** | encouraging | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 40 | `charlie.miss.3` | **Close, kid. Real close.** | sympathetic | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 41 | `charlie.miss.4` | **Shake it off. One more time.** | upbeat | Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s) |
| 42 | `charlie.go.1` | **Keep it rollin'!** | cheer | Shred City — as the song starts (kudos: max one every 15 s) |
| 43 | `charlie.go.2` | **You got this, cadet.** | cheer | Shred City — as the song starts (kudos: max one every 15 s) |
| 44 | `charlie.dress.pick` | **Me? You picked ME? Let's look sharp!** | delighted | Dressing Room — choosing Charlie |
| 45 | `charlie.dress.wear` | **Ooh, lookin' good! Spin around!** | proud | Dressing Room — Charlie changes outfit |
| 46 | `charlie.howto.jukebox` | **Tap the bell when the note drops into the box, kid!** | coach, upbeat | Jelly Jukebox menu — after Jazzy's tagline / speaker button |
| 47 | `charlie.howto.kazoo` | **Watch Stew play his kazoos, then tap 'em back in the same order.** | coach, warm | Stew Kazoo Says menu / speaker button |
| 48 | `charlie.howto.earquest` | **Listen to the mystery note, then tap the bell that matches it, pal.** | coach, warm | Ear Quest menu / speaker button |
| 49 | `charlie.howto.tempo` | **Listen to two tunes. Was the second one faster or slower?** | playful | Snail or Cheetah menu / speaker button |
| 50 | `charlie.howto.notematch` | **Flip two cards and listen. Find the ones that sound the same!** | coach, warm | Note Match menu / speaker button |
| 51 | `charlie.howto.detective` | **Hear the tune twice. Tap the note that changed the second time!** | sly, coach | Detective menu / speaker button |
| 52 | `charlie.howto.sightread` | **Read the notes on the staff, then tap those bells in order. Beat the clock!** | coach, quick | Sight-Reading Sprint menu / speaker button |
| 53 | `charlie.howto.namenote.name` | **See the note on the staff? Tap its name, cadet.** | coach, warm | Name That Note menu — Name It mode / speaker button |
| 54 | `charlie.howto.namenote.place` | **Read the note's name, then drag it onto the staff.** | coach, warm | Name That Note menu — Place It mode selected / speaker button |
| 55 | `charlie.howto.boom.copy` | **Listen to Stew's rhythm. After the count-in, play it back on the drum!** | coach, groovy | Who's Got the Rhythm — Parrot Percussion how-to card |
| 56 | `charlie.howto.boom.match` | **Listen to the secret rhythm, then tap the strip that matches.** | coach, groovy | Who's Got the Rhythm — Beat Finder how-to card |
| 57 | `charlie.howto.boom.trail` | **Tap Stew when each note crosses the gold line!** | coach, groovy | Who's Got the Rhythm — Rhythm Run how-to card |
| 58 | `charlie.howto.shred` | **Pick a song and play the guitar in time with the beat. No mashin', kid!** | rock announcer | Shred City intro / speaker button |
| 59 | `charlie.howto.robot` | **Tap the friends to zap 'em into the band. Add more for a bigger boogie!** | party host | Robot Boogie — on arrival / speaker button |
| 60 | `charlie.howto.funfacts` | **Slide the spyglass around to find the hidden friends, kid.** | cozy, curious | Fun Facts Clubhouse — on arrival / speaker button |
| 61 | `charlie.howto.beatlab` | **Tap the pads to build a beat, then hit Play to hear your loop!** | coach, groovy | Beat Lab — on arrival, after Chunk's tagline |
| 62 | `charlie.howto.jam` | **Tap any instrument to play. Hit Record to save your jam!** | coach, upbeat | Jam Session — on arrival, after Jazzy's tagline |
| 63 | `charlie.howto.songstudio` | **Pick a mood, tap the keys to write your tune, then press Play!** | creative, warm | Song Studio — on arrival, after Charlie's tagline |
| 64 | `charlie.howto.dressing` | **Choose your character, then tap an outfit to try it on!** | warm, inviting | Dressing Room — on arrival |
| 65 | `charlie.howto.stage` | **Take a bow for the crowd, or snap a poster of your star!** | showman | Main Stage — on arrival |
| 66 | `charlie.quest.q_shred` | **Play a show in Shred City, kid!** | rock | Quest: Shred City |
| 67 | `charlie.quest.q_song_save` | **Come write a hit in my studio.** | creative | Quest: Song Studio |
| 68 | `charlie.quest.q_jmatv` | **Catch a show on JMAtv, pal.** | TV | Quest: JMAtv |

---

## Dr. Jellybone — 20 lines
**Rooms:** Detective · Ear Quest  
**Voice:** Smooth-talkin' jazzman, sax player. Velvet, unhurried, gentlemanly. NEVER loud — the excitement is in the eyebrows.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `doctor.tag.detective` | **Mmm… I've got a case for you.** | noir, inviting | Entering Detective |
| 2 | `doctor.tag.earquest` | **Easy now. Just use those ears.** | calm | Entering Ear Quest |
| 3 | `doctor.correct.1` | **Case closed, baby.** | satisfied | Detective / Ear Quest — right answer (kudos: max one every 15 s) |
| 4 | `doctor.correct.2` | **Mmm-hmm. That's the one.** | smug-fun | Detective / Ear Quest — right answer (kudos: max one every 15 s) |
| 5 | `doctor.correct.3` | **Sharp ears. Real sharp.** | impressed | Detective / Ear Quest — right answer (kudos: max one every 15 s) |
| 6 | `doctor.correct.4` | **Precisely.** | dry | Detective / Ear Quest — right answer (kudos: max one every 15 s) |
| 7 | `doctor.perfect.1` | **Ohh, that was smooth.** | delighted | Detective — 3+ right in a row (kudos: max one every 15 s) |
| 8 | `doctor.perfect.2` | **Not a single clue slipped by.** | proud | Detective — 3+ right in a row (kudos: max one every 15 s) |
| 9 | `doctor.perfect.3` | **Now that… is detective work.** | warm | Detective — 3+ right in a row (kudos: max one every 15 s) |
| 10 | `doctor.miss.1` | **Mmm, not that note.** | thoughtful | Detective / Ear Quest — wrong answer (kudos: max one every 15 s) |
| 11 | `doctor.miss.2` | **A red herring. Listen again.** | playful | Detective / Ear Quest — wrong answer (kudos: max one every 15 s) |
| 12 | `doctor.miss.3` | **The clue slipped by. It happens.** | gentle | Detective / Ear Quest — wrong answer (kudos: max one every 15 s) |
| 13 | `doctor.miss.4` | **Close. Trust those ears.** | reassuring | Detective / Ear Quest — wrong answer (kudos: max one every 15 s) |
| 14 | `doctor.go.1` | **Listen close now…** | hushed | NOT USED IN THE APP YET — optional, record last |
| 15 | `doctor.go.2` | **Take your time, detective.** | coaxing | NOT USED IN THE APP YET — optional, record last |
| 16 | `doctor.dress.pick` | **Ah. An excellent choice, my friend.** | noir, warm | Dressing Room — choosing Dr. Jellybone |
| 17 | `doctor.dress.wear` | **Mmm. Very distinguished.** | noir, warm | Dressing Room — Dr. Jellybone changes outfit |
| 18 | `doctor.quest.q_detective_case` | **A case awaits, baby. Easy does it.** | noir | Quest: Crack a case |
| 19 | `doctor.quest.q_detective_3` | **Three cases today. Think you can hang?** | challenge | Quest: Crack 3 cases |
| 20 | `doctor.quest.q_ear_quest` | **Five right in Ear Quest. Smooth and easy.** | cool | Quest: Ear Quest |

---

## Stew — 20 lines
**Rooms:** Stew Kazoo Says · Fun Facts Clubhouse  
**Voice:** Goofy, buzzy, easily delighted. In the show Stew talks in KAZOO — these lines can be performed as kazoo-talk with the words as intent.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `stew.tag.kazoo` | **Stew Kazoo says… PLAY!** | goofy | Entering Stew Kazoo Says |
| 2 | `stew.tag.funfacts` | **Welcome to the Clubhouse!** | buzzy | Entering Fun Facts Clubhouse |
| 3 | `stew.correct.1` | **Kazoo-tastic!** | silly | Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s) |
| 4 | `stew.correct.2` | **You remembered!** | thrilled | Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s) |
| 5 | `stew.correct.3` | **Yesss!** | squeaky | Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s) |
| 6 | `stew.correct.4` | **Bzzz-rilliant!** | kazoo-buzz | Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s) |
| 7 | `stew.perfect.1` | **Every single one! WOW!** | exploding | Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s) |
| 8 | `stew.perfect.2` | **Perfect memory!** | proud | Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s) |
| 9 | `stew.perfect.3` | **Stew says: AMAZING!** | announcer | Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s) |
| 10 | `stew.miss.1` | **Oopsie!** | cute | Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s) |
| 11 | `stew.miss.2` | **Stew says… try again!** | kind | Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s) |
| 12 | `stew.miss.3` | **Almost had it!** | cheerful | Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s) |
| 13 | `stew.miss.4` | **That's okay — one more time!** | warm | Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s) |
| 14 | `stew.go.1` | **Watch and listen!** | eager | NOT USED IN THE APP YET — optional, record last |
| 15 | `stew.go.2` | **You can do it!** | cheer | NOT USED IN THE APP YET — optional, record last |
| 16 | `stew.dress.pick` | **Stew! That's me! Hi!** | goofy | Dressing Room — choosing Stew |
| 17 | `stew.dress.wear` | **Does this come with a kazoo pocket?** | goofy | Dressing Room — Stew changes outfit |
| 18 | `stew.quest.q_stew_2` | **Beat my level two!** | dare | Quest: Stew level 2 |
| 19 | `stew.quest.q_stew_4` | **Level four? You're brave!** | impressed | Quest: Stew level 4 |
| 20 | `stew.quest.q_facts_3` | **Find three friends in the Clubhouse!** | eager | Quest: Fun Facts ×3 |

---

## Jazzy — 20 lines
**Rooms:** Jelly Jukebox · Jam Session  
**Voice:** LOUD, boisterous, fun-loving pun machine — CAT puns (purrrfect, meow-sic, kitten around). Big laughs, means every word.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `jazzy.tag.jukebox` | **JELLY JUKEBOX! Jazzy's the name, meow-sic's my game!** | smooth DJ | Entering Jelly Jukebox |
| 2 | `jazzy.tag.jam` | **JAM SESSION! I hope you brought the peanut butter! HA!** | laid back | Entering Jam Session |
| 3 | `jazzy.correct.1` | **YES! That's what I'm TALKIN' about!** | cool | Jelly Jukebox — song finished under 90% (kudos: max one every 15 s) |
| 4 | `jazzy.correct.2` | **You're on a ROLL — and I'm not talkin' bread! HA!** | approving | Jelly Jukebox — song finished under 90% (kudos: max one every 15 s) |
| 5 | `jazzy.correct.3` | **Sharp! Like a C-sharp! Get it?!** | warm | Jelly Jukebox — song finished under 90% (kudos: max one every 15 s) |
| 6 | `jazzy.correct.4` | **THAT'S the groove — you're not kitten around!** | nodding | Jelly Jukebox — song finished under 90% (kudos: max one every 15 s) |
| 7 | `jazzy.perfect.1` | **PURRRFECT TIMING! Oh, you're ON FIRE!** | impressed | Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s) |
| 8 | `jazzy.perfect.2` | **WOW! That was NOTE-worthy! HA HA!** | delighted | Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s) |
| 9 | `jazzy.perfect.3` | **You ARE the beat! Can't BEAT that!** | big | Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s) |
| 10 | `jazzy.miss.1` | **Missed it! But hey — catch the next one!** | easy | NOT USED IN THE APP YET — optional, record last |
| 11 | `jazzy.miss.2` | **A little late — fashionably late! HA!** | chill | NOT USED IN THE APP YET — optional, record last |
| 12 | `jazzy.miss.3` | **Oof! Feel it… wait for it…** | coaching | NOT USED IN THE APP YET — optional, record last |
| 13 | `jazzy.miss.4` | **Shake it off! Like a maraca! HA!** | light | NOT USED IN THE APP YET — optional, record last |
| 14 | `jazzy.go.1` | **STAY on that beat!** | steady | NOT USED IN THE APP YET — optional, record last |
| 15 | `jazzy.go.2` | **Feel the groove, baby!** | smooth | NOT USED IN THE APP YET — optional, record last |
| 16 | `jazzy.dress.pick` | **Jazzy's in the house. Make it fabulous.** | sassy | Dressing Room — choosing Jazzy |
| 17 | `jazzy.dress.wear` | **Mmm-hmm. THAT's the look.** | sassy | Dressing Room — Jazzy changes outfit |
| 18 | `jazzy.quest.q_jukebox_song` | **Finish a song with me! It'll be MUSIC to my ears! HA!** | inviting | Quest: Jukebox song |
| 19 | `jazzy.quest.q_jukebox_streak` | **TEN in a row! I DARE ya!** | sly | Quest: Jukebox 10-streak |
| 20 | `jazzy.quest.q_jam_8` | **Eight notes in the Jam Hall — go go GO!** | smooth | Quest: Jam 8 notes |

---

## Chunk — 22 lines
**Rooms:** Beat Lab · Robot Boogie · Who's Got the Rhythm  
**Voice:** Stereotypical surfer bro. "Duuude." Laid back, stoked, everything is gnarly or epic.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `chunk.tag.beatlab` | **Duuude. Welcome to the Beat Lab.** | deep, warm | Entering Beat Lab |
| 2 | `chunk.tag.robot` | **Robot Boogie, bro! Let's dance.** | rumbly fun | Entering Robot Boogie |
| 3 | `chunk.tag.boom` | **Who's got the rhythm, dude?** | call-out | Entering Who's Got the Rhythm |
| 4 | `chunk.correct.1` | **Gnarly beat, bro!** | booming | Who's Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s) |
| 5 | `chunk.correct.2` | **Booom! Yes, dude!** | punchy | Who's Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s) |
| 6 | `chunk.correct.3` | **That's heavy, man.** | approving | Who's Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s) |
| 7 | `chunk.correct.4` | **Right on, bro.** | calm | Who's Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s) |
| 8 | `chunk.perfect.1` | **DUUUDE. Epic.** | huge | Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s) |
| 9 | `chunk.perfect.2` | **Perfect rhythm! Totally stoked!** | proud | Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s) |
| 10 | `chunk.perfect.3` | **Boom boom PERFECT, brah!** | drum-like | Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s) |
| 11 | `chunk.miss.1` | **Whoa, little off, dude.** | gentle | Who's Got the Rhythm — round missed (kudos: max one every 15 s) |
| 12 | `chunk.miss.2` | **Try the rhythm again, bro.** | patient | Who's Got the Rhythm — round missed (kudos: max one every 15 s) |
| 13 | `chunk.miss.3` | **Almost, man. Almost.** | kind | Who's Got the Rhythm — round missed (kudos: max one every 15 s) |
| 14 | `chunk.miss.4` | **Listen to the drums, dude.** | coaching | Who's Got the Rhythm — round missed (kudos: max one every 15 s) |
| 15 | `chunk.go.1` | **Keep the beat, bro!** | steady | NOT USED IN THE APP YET — optional, record last |
| 16 | `chunk.go.2` | **Nice and mellow, dude.** | soothing | NOT USED IN THE APP YET — optional, record last |
| 17 | `chunk.dress.pick` | **Chunk reporting for duty, dude.** | laid back | Dressing Room — choosing Chunk |
| 18 | `chunk.dress.wear` | **Dude. This is a vibe.** | cool | Dressing Room — Chunk changes outfit |
| 19 | `chunk.quest.q_beat_loop` | **Build a loop in my lab, dude.** | warm | Quest: Beat Lab loop |
| 20 | `chunk.quest.q_beat_3` | **Three tracks, bro. BIG sound.** | booming | Quest: 3-track loop |
| 21 | `chunk.quest.q_robot_4` | **Get four robots dancin', dude!** | fun | Quest: Robot Boogie ×4 |
| 22 | `chunk.quest.q_boom` | **Pass a round of rhythm with me, bro.** | steady | Quest: Who's Got the Rhythm |

---

## Finn Danger (the shark — a.k.a. Sharky) — 35 lines
**Rooms:** Sight-Reading Sprint · Name That Note · Note Match  
**Voice:** Jerry Lewis "HEY LADY!" energy — always on the brink of joyous laughter, can't contain his excitement at ANYTHING. Eager, literal, loves puns. "Jumpin' jellyfish!"

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `finn.tag.sightread` | **Sight-Reading SPRINT! Oh boy oh boy, ready?!** | daring | Entering Sight-Reading Sprint |
| 2 | `finn.tag.namenote` | **NAME! THAT! NOTE! Hee-hee!** | game-show | Entering Name That Note |
| 3 | `finn.correct.1` | **YES! Ha-HA!** | snappy | Name That Note — right answer (kudos: max one every 15 s) |
| 4 | `finn.correct.2` | **You READ that! Oh, I love it!** | impressed | Name That Note — right answer (kudos: max one every 15 s) |
| 5 | `finn.correct.3` | **Right! Next one, next one!** | fast | Name That Note — right answer (kudos: max one every 15 s) |
| 6 | `finn.correct.4` | **Oh, that's SHARP!** | quick | Name That Note — right answer (kudos: max one every 15 s) |
| 7 | `finn.perfect.1` | **PERFECT SCORE! Jumpin' jellyfish!** | big | Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s) |
| 8 | `finn.perfect.2` | **Speed reader! HEY, LOOK at you!** | amazed | Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s) |
| 9 | `finn.perfect.3` | **Nothing gets past you! NOTHING! Ha!** | proud | Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s) |
| 10 | `finn.miss.1` | **Nope-nope-nope — look again!** | quick, kind | Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s) |
| 11 | `finn.miss.2` | **Lines and spaces, lines and spaces!** | hinting | Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s) |
| 12 | `finn.miss.3` | **Not quite — ha! — try again!** | light | Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s) |
| 13 | `finn.miss.4` | **Ooh! Next one, next one!** | moving on | Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s) |
| 14 | `finn.go.1` | **Read ahead, read ahead!** | urging | NOT USED IN THE APP YET — optional, record last |
| 15 | `finn.go.2` | **Eyes on the staff! Hee!** | coach | NOT USED IN THE APP YET — optional, record last |
| 16 | `finn.tag.notematch` | **NOTE MATCH! Find the twins! Oh, I love this one!** | hip-hop cool | Entering Note Match |
| 17 | `finn.dress.pick` | **FINN time! Oh boy, what are we wearing?!** | daring | Dressing Room — choosing Finn |
| 18 | `finn.dress.wear` | **Whoa! Do I look fast? I feel fast!** | hyped | Dressing Room — Finn changes outfit |
| 19 | `finn.match.1` | **MATCH! Ha-HA!** | punchy | NOT USED IN THE APP YET — optional, record last |
| 20 | `finn.match.2` | **TWINS! Oh, look at 'em!** | fun | NOT USED IN THE APP YET — optional, record last |
| 21 | `finn.match.3` | **YES! You found it!** | cool | NOT USED IN THE APP YET — optional, record last |
| 22 | `finn.match.4` | **That's a match! Hee-hee!** | happy | NOT USED IN THE APP YET — optional, record last |
| 23 | `finn.sweep.1` | **CLEAN SWEEP! Jumpin' jellyfish!** | big | Note Match — round cleared (kudos: max one every 15 s) |
| 24 | `finn.sweep.2` | **Perfect match-up! HEY, LOOK at that!** | proud | Note Match — round cleared (kudos: max one every 15 s) |
| 25 | `finn.sweep.3` | **Flawless! FLAWLESS! Ha!** | thrilled | Note Match — round cleared (kudos: max one every 15 s) |
| 26 | `finn.mismatch.1` | **Nope! Not twins! Ha!** | easy | NOT USED IN THE APP YET — optional, record last |
| 27 | `finn.mismatch.2` | **Ooh, remember that one!** | hinting | NOT USED IN THE APP YET — optional, record last |
| 28 | `finn.mismatch.3` | **Try again, try again!** | chill | NOT USED IN THE APP YET — optional, record last |
| 29 | `finn.mismatch.4` | **Keep lookin'! Hee!** | calm | NOT USED IN THE APP YET — optional, record last |
| 30 | `finn.gomatch.1` | **Remember the sounds!** | coach | NOT USED IN THE APP YET — optional, record last |
| 31 | `finn.gomatch.2` | **You got this! Oh boy!** | cool | NOT USED IN THE APP YET — optional, record last |
| 32 | `finn.quest.q_sight_read` | **Run a sprint with me! Oh boy!** | daring | Quest: Sight-Reading |
| 33 | `finn.quest.q_name_note` | **Eight outta ten! I DARE ya! Hee-hee!** | dare | Quest: Name That Note |
| 34 | `finn.quest.q_lesson` | **Class time! Watch a lesson — it's FUN!** | bright | Quest: Music 101 lesson |
| 35 | `finn.quest.q_note_match` | **Clear a round of Note Match! Oh boy oh boy!** | cool | Quest: Note Match |

