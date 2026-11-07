import { CHARACTER_FACTS } from './musicFacts';
// Voice-line registry — every spoken blurb in the Academy.
//
// Audio files live at public/assets/voice/<id>.mp3 and are recorded by real
// humans. The app plays a line via say('group') (see lib/voice.js); groups
// with numbered variants (e.g. 'doctor.correct') pick a random take.
// Missing files fail silently so lines can be dropped in as they're recorded.

export const VOICE_CHARACTERS = {
  charlie: { name: 'Charlie the Polliwog', role: 'Academy host · Shred City · Song Studio · Music 101 · JMAtv', vibe: 'Sinatra / Louis Prima New York wise guy. Friendly, finger-snapping, "how YOU doin\'" warmth. Calls you kid, pal, cadet.' },
  doctor:  { name: 'Dr. Jellybone',        role: 'Detective · Ear Quest',                                     vibe: 'Smooth-talkin\' jazzman, sax player. Velvet, unhurried, gentlemanly. NEVER loud — the excitement is in the eyebrows.' },
  stew:    { name: 'Stew',                  role: 'Stew Kazoo Says · Fun Facts Clubhouse',                     vibe: 'Goofy, buzzy, easily delighted. In the show Stew talks in KAZOO — these lines can be performed as kazoo-talk with the words as intent.' },
  jazzy:   { name: 'Jazzy',                 role: 'Jelly Jukebox · Jam Session',                               vibe: 'LOUD, boisterous, fun-loving pun machine — CAT puns (purrrfect, meow-sic, kitten around). Big laughs, means every word.' },
  chunk:   { name: 'Chunk',                 role: "Beat Lab · Robot Boogie · Who's Got the Rhythm",            vibe: 'Stereotypical surfer bro. "Duuude." Laid back, stoked, everything is gnarly or epic.' },
  finn:    { name: 'Finn Danger (the shark — a.k.a. Sharky)', role: 'Sight-Reading Sprint · Name That Note · Note Match',                   vibe: 'Jerry Lewis "HEY LADY!" energy — always on the brink of joyous laughter, can\'t contain his excitement at ANYTHING. Eager, literal, loves puns. "Jumpin\' jellyfish!"' },
  // Lou never talks. By design.
};

// id format: <character>.<group>[.<variant>]
// Fun Facts characters → voice key (Lou has no voice actor yet)
const FACT_VOICE = { Charlie: 'charlie', 'Dr. Jellybone': 'doctor', Chunk: 'chunk', Finn: 'finn', Jazzy: 'jazzy', Stew: 'stew' };
export const factVoiceId = (name, index) => FACT_VOICE[name] && `${FACT_VOICE[name]}.fact.${String(index + 1).padStart(2, '0')}`;

const L = (id, text, emotion, where) => {
  const [char] = id.split('.');
  return { id, char, text, emotion, where };
};

export const VOICE_LINES = [
  // ───────────── CHARLIE — Academy host (Home hub) ─────────────
  L('charlie.hub.first',     'Hello there, and welcome to the Academy!',            'huge smile',     'Home — very first visit'),
  L('charlie.hub.morning',   'Mornin\', cadet. Let\'s make some music.',             'bright',         'Home — before noon'),
  L('charlie.hub.afternoon', 'Afternoon, pal! Ya ready?',               'bright',         'Home — noon to 5pm'),
  L('charlie.hub.evening',   'Evenin\'! Nothin\' like a night session.',        'cozy, excited',  'Home — after 5pm'),
  L('charlie.hub.streak',    'Look at you — on a streak!',               'proud',          'Home — practice streak ≥ 3 days'),
  L('charlie.hub.quests',    'Got fresh quests for ya today.',                  'eager',          'Home — fresh quests, none done yet'),
  L('charlie.hub.alldone',   'That\'s the whole list! See ya tomorrow, kid.',   'warm, satisfied','Home — all 3 quests done'),
  L('charlie.jam.takeit',    'Take it to the Jam Session, kid!',                     'hyped',          'Beat Lab / Song Studio — tapping "Jam on it!"'),
  L('charlie.hub.lockbadge', 'Earn one badge and this street is yours — here are today\'s quests!', 'playful, encouraging', 'Tapping a locked LEARN/CREATE gate — opens the Quest Board'),
  L('charlie.academy.welcome', 'Hello, cadet, and welcome to the Jelly of the Month Club Music Academy!', 'warm, host',       'Entering the Academy — once a day'),
  L('charlie.academy.rankup',  'Way to go, rockstar! You just ranked up!', 'excited',  'Campus — the moment a new rank is earned'),
  L('charlie.hub.lockpass',  'Ask a grown-up about that one, kid.',     'gentle',         'Tapping an Academy-Pass-locked room (future)'),

  // Charlie — room taglines
  L('charlie.tag.shred',     'Welcome to Shred City, baby!',             'rock announcer', 'Entering Shred City'),
  L('charlie.tag.songstudio','Step into the studio, let\'s write a hit!',               'creative, warm', 'Entering Charlie\'s Song Studio'),
  L('charlie.tag.music101',  'Class is in session, folks.',               'teacher-y, fun', 'Entering Music 101'),
  L('charlie.tag.jmatv',     'You\'re watchin\' JMAtv!',            'TV announcer',   'Entering JMAtv'),

  // Charlie — meta moments
  L('charlie.meta.badge',      'Badda-bing — new badge!',                       'excited',        'Any achievement badge earned'),
  L('charlie.meta.sticker',    'New sticker! Lookin\' sharp.',                     'delighted',      'Any collection sticker earned'),
  L('charlie.meta.gem',        'A Daily Gem! Now THAT\'S classy.',           'awed',           'Daily Gem sticker earned'),
  L('charlie.meta.rankup',     'Jumpin\' Jelly Beans — you ranked up, kid!',                   'huge',           'Rank-up celebration'),
  L('charlie.meta.questsdone', 'All three quests. Whatta pro!',        'proud',          'Daily quests complete overlay'),
  L('charlie.meta.academyopen','Jumpin\' Jelly Beans! The Academy is OPEN!',             'ceremonial',     'First badge → LEARN/CREATE reveal'),
  L('charlie.meta.streak3',    'Three days runnin\'! Attaboy!',             'proud',          'Practice streak hits 3'),
  L('charlie.meta.streak7',    'A whole week? Fuhgeddaboudit!',              'amazed',         'Practice streak hits 7'),

  // Charlie — Shred City moments
  L('charlie.shred.opening',   'Opening act! Here we go!',                     'announcer',      'Crowd meter tier: Opening Act'),
  L('charlie.shred.headliner', 'You\'re the headliner, kid!',           'bigger',         'Crowd meter tier: Headliner'),
  L('charlie.shred.legend',    'SHRED LEGEND, BABY!',                    'maximum',        'Crowd meter maxed'),
  L('charlie.shred.encore',    'They want an encore! Encore!',                  'crowd-chant',    'Encore round starts'),
  L('charlie.shred.toowild',   'Whoa whoa whoa — too wild, pal!',                 'laughing',       'Mash guard triggers'),
  L('charlie.shred.flawless',  'Flawless encore. Un-be-lievable!',                 'stunned joy',    'Result card after a flawless encore'),

  // Charlie — reactions (Song Studio / Shred / lessons)
  L('charlie.correct.1', 'Yeah, that\'s it!',                 'quick',   'Song Studio — saving a song (kudos: max one every 15 s)'),
  L('charlie.correct.2', 'Badda-bing!',           'punchy',  'Song Studio — saving a song (kudos: max one every 15 s)'),
  L('charlie.correct.3', 'Now you\'re cookin\'!',     'happy',   'Song Studio — saving a song (kudos: max one every 15 s)'),
  L('charlie.correct.4', 'That\'s the stuff, kid.',             'rock',    'Song Studio — saving a song (kudos: max one every 15 s)'),
  L('charlie.perfect.1', 'PERFECT! Whatta pro!',             'yell',    'Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s)'),
  L('charlie.perfect.2', 'Oh, you\'re GOOD.', 'thrilled','Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s)'),
  L('charlie.perfect.3', 'Ring-a-ding-ding! Flawless!',     'amazed',  'Shred City — result screen when the Crowd Meter reached LEGEND (kudos: max one every 15 s)'),
  L('charlie.miss.1',    'Ehh, almost, pal.',              'kind',    'Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s)'),
  L('charlie.miss.2',    'Ooh, try that one again!', 'encouraging', 'Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s)'),
  L('charlie.miss.3',    'Close, kid. Real close.',       'sympathetic', 'Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s)'),
  L('charlie.miss.4',    'Shake it off. Try it one more time.', 'upbeat', 'Shred City — kid loses a 4+ note streak (off beat) (kudos: max one every 15 s)'),
  L('charlie.go.1',      'Keep it rollin\'!',       'cheer',   'Shred City — as the song starts (kudos: max one every 15 s)'),
  L('charlie.go.2',      'You got this, cadet!',    'cheer',   'Shred City — as the song starts (kudos: max one every 15 s)'),
  L('charlie.go.3',         'All right, keep it rollin\'!',                'pumped',     'Shred City — as the song starts (kudos: max one every 15 s)'),

  // ───────────── DR. JELLYBONE — Detective, Ear Quest ─────────────
  L('doctor.tag.detective', 'Mmm… I\'ve got a case for you.',  'noir, inviting', 'Entering Detective'),
  L('doctor.tag.earquest',  'Easy now. Just use those ears.',  'calm',           'Entering Ear Quest'),
  L('doctor.correct.1', 'Case closed, baby.',        'satisfied',   'Detective / Ear Quest — right answer (kudos: max one every 15 s)'),
  L('doctor.correct.2', 'Mmm-hmm. That\'s the one.',         'smug-fun',    'Detective / Ear Quest — right answer (kudos: max one every 15 s)'),
  L('doctor.correct.3', 'Sharp ears. Real sharp.',         'impressed',   'Detective / Ear Quest — right answer (kudos: max one every 15 s)'),
  L('doctor.correct.4', 'Precisely.',          'dry',         'Detective / Ear Quest — right answer (kudos: max one every 15 s)'),
  L('doctor.perfect.1', 'Ohh, that was smooth.', 'delighted', 'Detective — 3+ right in a row (kudos: max one every 15 s)'),
  L('doctor.perfect.2', 'Not a single clue slipped by.', 'proud',    'Detective — 3+ right in a row (kudos: max one every 15 s)'),
  L('doctor.perfect.3', 'Now that… is detective work.',          'warm',        'Detective — 3+ right in a row (kudos: max one every 15 s)'),
  L('doctor.miss.1',    'Mmm, not that note.', 'thoughtful',  'Detective / Ear Quest — wrong answer (kudos: max one every 15 s)'),
  L('doctor.miss.2',    'A red herring. Listen again.', 'playful', 'Detective / Ear Quest — wrong answer (kudos: max one every 15 s)'),
  L('doctor.miss.3',    'The clue slipped by. It happens.', 'gentle',      'Detective / Ear Quest — wrong answer (kudos: max one every 15 s)'),
  L('doctor.miss.4',    'Close. Trust those ears.', 'reassuring', 'Detective / Ear Quest — wrong answer (kudos: max one every 15 s)'),
  L('doctor.go.1',      'Listen close now…',     'hushed',      'NOT USED IN THE APP YET — optional, record last'),
  L('doctor.go.2',      'Take your time, detective.',   'coaxing',     'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── STEW — Stew Kazoo Says, Fun Facts ─────────────
  L('stew.tag.kazoo',    'Stew Kazoo says… PLAY!',       'goofy',    'Entering Stew Kazoo Says'),
  L('stew.tag.funfacts', 'Welcome to the Clubhouse!',    'buzzy',    'Entering Fun Facts Clubhouse'),
  L('stew.correct.1', 'Kazoo-tastic!',          'silly',      'Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s)'),
  L('stew.correct.2', 'You remembered!',        'thrilled',   'Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s)'),
  L('stew.correct.3', 'Yesss!',                 'squeaky',    'Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s)'),
  L('stew.correct.4', 'Bzzz-rilliant!',         'kazoo-buzz', 'Stew Kazoo Says — level 1–3 cleared · Fun Facts — friend found (kudos: max one every 15 s)'),
  L('stew.perfect.1', 'Every single one! WOW!', 'exploding',  'Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s)'),
  L('stew.perfect.2', 'Perfect memory!',        'proud',      'Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s)'),
  L('stew.perfect.3', 'Stew says: AMAZING!',    'announcer',  'Stew Kazoo Says — level 4+ cleared (kudos: max one every 15 s)'),
  L('stew.miss.1',    'Oopsie!',                'cute',       'Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s)'),
  L('stew.miss.2',    'Stew says… try again!',  'kind',       'Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s)'),
  L('stew.miss.3',    'Almost had it!',         'cheerful',   'Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s)'),
  L('stew.miss.4',    'That\'s okay — one more time!', 'warm', 'Stew Kazoo Says — wrong kazoo (kudos: max one every 15 s)'),
  L('stew.go.1',      'Watch and listen!',      'eager',      'NOT USED IN THE APP YET — optional, record last'),
  L('stew.go.2',      'You can do it!',         'cheer',      'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── JAZZY — Jelly Jukebox, Jam Session ─────────────
  L('jazzy.tag.jukebox', 'JELLY JUKEBOX! Jazzy\'s the name, meow-sic\'s my game!', 'smooth DJ', 'Entering Jelly Jukebox'),
  L('jazzy.tag.jam',     'JAM SESSION! I hope you brought the peanut butter! HA!',     'laid back',  'Entering Jam Session'),
  L('jazzy.correct.1', 'YES! That\'s what I\'m TALKIN\' about!',               'cool',       'Jelly Jukebox — song finished under 90% (kudos: max one every 15 s)'),
  L('jazzy.correct.2', 'You\'re on a ROLL — and I\'m not talkin\' bread! HA!',        'approving',  'Jelly Jukebox — song finished under 90% (kudos: max one every 15 s)'),
  L('jazzy.correct.3', 'Sharp! Like a C-sharp! Get it?!',               'warm',       'Jelly Jukebox — song finished under 90% (kudos: max one every 15 s)'),
  L('jazzy.correct.4', 'THAT\'S the groove — you\'re not kitten around!',   'nodding',    'Jelly Jukebox — song finished under 90% (kudos: max one every 15 s)'),
  L('jazzy.perfect.1', 'PURRRFECT TIMING! Oh, you\'re ON FIRE!',       'impressed',  'Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s)'),
  L('jazzy.perfect.2', 'WOW! That was NOTE-worthy! HA HA!',          'delighted',  'Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s)'),
  L('jazzy.perfect.3', 'You ARE the beat! Can\'t BEAT that!',     'big',        'Jelly Jukebox — song finished 90%+ (kudos: max one every 15 s)'),
  L('jazzy.miss.1',    'Missed it! But hey — catch the next one!', 'easy', 'NOT USED IN THE APP YET — optional, record last'),
  L('jazzy.miss.2',    'A little late — fashionably late! HA!', 'chill',   'NOT USED IN THE APP YET — optional, record last'),
  L('jazzy.miss.3',    'Oof! Feel it… wait for it…', 'coaching',   'NOT USED IN THE APP YET — optional, record last'),
  L('jazzy.miss.4',    'Shake it off! Like a maraca! HA!',         'light',      'NOT USED IN THE APP YET — optional, record last'),
  L('jazzy.go.1',      'STAY on that beat!',     'steady',     'NOT USED IN THE APP YET — optional, record last'),
  L('jazzy.go.2',      'Feel the groove, baby!',      'smooth',     'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── CHUNK — Beat Lab, Robot Boogie, Who's Got the Rhythm ─────────────
  L('chunk.tag.beatlab', 'Duuude. Welcome to the Beat Lab.',  'deep, warm',  'Entering Beat Lab'),
  L('chunk.tag.robot',   'Robot Boogie, bro! Let\'s dance.', 'rumbly fun', 'Entering Robot Boogie'),
  L('chunk.tag.boom',    'Who\'s got the rhythm, dude?',    'call-out',    "Entering Who's Got the Rhythm"),
  L('chunk.correct.1', 'Gnarly beat, bro!',             'booming',    'Who\'s Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s)'),
  L('chunk.correct.2', 'Booom! Yes, dude!',           'punchy',     'Who\'s Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s)'),
  L('chunk.correct.3', 'That\'s heavy, man.',        'approving',  'Who\'s Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s)'),
  L('chunk.correct.4', 'Right on, bro.',             'calm',       'Who\'s Got the Rhythm — round passed · Beat Lab — loop playing (kudos: max one every 15 s)'),
  L('chunk.perfect.1', 'DUUUDE. Epic.',              'huge',       'Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s)'),
  L('chunk.perfect.2', 'Perfect rhythm! Totally stoked!',       'proud',      'Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s)'),
  L('chunk.perfect.3', 'Boom boom PERFECT, brah!',    'drum-like',  'Beat Lab — 3+ tracks playing · Robot Boogie — 4+ friends dancing (kudos: max one every 15 s)'),
  L('chunk.miss.1',    'Whoa, little off, dude.',       'gentle',     'Who\'s Got the Rhythm — round missed (kudos: max one every 15 s)'),
  L('chunk.miss.2',    'Try the rhythm again, bro.', 'patient',    'Who\'s Got the Rhythm — round missed (kudos: max one every 15 s)'),
  L('chunk.miss.3',    'Almost, man. Almost.',     'kind',       'Who\'s Got the Rhythm — round missed (kudos: max one every 15 s)'),
  L('chunk.miss.4',    'Listen to the drums, dude.',  'coaching',   'Who\'s Got the Rhythm — round missed (kudos: max one every 15 s)'),
  L('chunk.go.1',      'Keep the beat, bro!',        'steady',     'NOT USED IN THE APP YET — optional, record last'),
  L('chunk.go.2',      'Nice and mellow, dude.',      'soothing',   'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── FINN — Sight-Reading, Name That Note ─────────────
  L('finn.tag.sightread', 'Sight-Reading SPRINT! Oh boy oh boy, ready?!', 'daring',  'Entering Sight-Reading Sprint'),
  L('finn.tag.namenote',  'NAME! THAT! NOTE! Hee-hee!',              'game-show','Entering Name That Note'),
  L('finn.correct.1', 'YES! Ha-HA!',              'snappy',     'Name That Note — right answer (kudos: max one every 15 s)'),
  L('finn.correct.2', 'You READ that! Oh, I love it!',        'impressed',  'Name That Note — right answer (kudos: max one every 15 s)'),
  L('finn.correct.3', 'Right! Next one, next one!',            'fast',       'Name That Note — right answer (kudos: max one every 15 s)'),
  L('finn.correct.4', 'Oh, that\'s SHARP!',                'quick',      'Name That Note — right answer (kudos: max one every 15 s)'),
  L('finn.perfect.1', 'PERFECT SCORE! Jumpin\' jellyfish!',        'big',        'Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s)'),
  L('finn.perfect.2', 'Speed reader! HEY, LOOK at you!',         'amazed',     'Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s)'),
  L('finn.perfect.3', 'Nothing gets past you! NOTHING! Ha!','proud',      'Name That Note — 3 in a row · Sight-Reading — card finished (kudos: max one every 15 s)'),
  L('finn.miss.1',    'Nope-nope-nope — look again!',    'quick, kind','Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s)'),
  L('finn.miss.2',    'Lines and spaces, lines and spaces!',     'hinting',    'Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s)'),
  L('finn.miss.3',    'Not quite — ha! — try again!',            'light',      'Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s)'),
  L('finn.miss.4',    'Ooh! Next one, next one!',     'moving on',  'Name That Note / Sight-Reading — wrong note (kudos: max one every 15 s)'),
  L('finn.go.1',      'Read ahead, read ahead!',           'urging',     'NOT USED IN THE APP YET — optional, record last'),
  L('finn.go.2',      'Eyes on the staff! Hee!',    'coach',      'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── SHARKY — Note Match ─────────────
  L('finn.tag.notematch', 'NOTE MATCH! Find the twins! Oh, I love this one!', 'hip-hop cool', 'Entering Note Match'),

  // ---- Dressing Room: picked as your Jelly / tried on a new outfit ----
  L('charlie.dress.pick',  'Me? You picked ME? Let\'s look sharp!',          'delighted',   'Dressing Room — choosing Charlie'),
  L('charlie.dress.wear',  'Ooh, lookin\' good! Give us a spin!',                'proud',       'Dressing Room — Charlie changes outfit'),
  L('finn.dress.pick',     'FINN time! Oh boy, what are we wearing?!',        'daring',      'Dressing Room — choosing Finn'),
  L('finn.dress.wear',     'Whoa! Do I look fast? I feel fast!',              'hyped',       'Dressing Room — Finn changes outfit'),
  L('chunk.dress.pick',    'Chunk reporting for duty, dude.',                  'laid back',   'Dressing Room — choosing Chunk'),
  L('chunk.dress.wear',    'Dude. This is a vibe.',                            'cool',        'Dressing Room — Chunk changes outfit'),
  L('jazzy.dress.pick',    'Jazzy\'s in the house. Make it fabulous.',          'sassy',       'Dressing Room — choosing Jazzy'),
  L('jazzy.dress.wear',    'Mmm-hmm. THAT\'s the look.',                        'sassy',       'Dressing Room — Jazzy changes outfit'),
  L('stew.dress.pick',     'Stew! That\'s me! Hi!',                             'goofy',       'Dressing Room — choosing Stew'),
  L('stew.dress.wear',     'Does this come with a kazoo pocket?',              'goofy',       'Dressing Room — Stew changes outfit'),
  L('doctor.dress.pick',   'Ah. An excellent choice, my friend.',              'noir, warm',  'Dressing Room — choosing Dr. Jellybone'),
  L('doctor.dress.wear',   'Mmm. Very distinguished.',                         'noir, warm',  'Dressing Room — Dr. Jellybone changes outfit'),

  L('finn.match.1', 'MATCH! Ha-HA!',              'punchy',     'NOT USED IN THE APP YET — optional, record last'),
  L('finn.match.2', 'TWINS! Oh, look at \'em!',              'fun',        'NOT USED IN THE APP YET — optional, record last'),
  L('finn.match.3', 'YES! You found it!',          'cool',       'NOT USED IN THE APP YET — optional, record last'),
  L('finn.match.4', 'That\'s a match! Hee-hee!',           'happy',      'NOT USED IN THE APP YET — optional, record last'),
  L('finn.sweep.1', 'CLEAN SWEEP! Jumpin\' jellyfish!',        'big',        'Note Match — round cleared (kudos: max one every 15 s)'),
  L('finn.sweep.2', 'Perfect match-up! HEY, LOOK at that!',   'proud',      'Note Match — round cleared (kudos: max one every 15 s)'),
  L('finn.sweep.3', 'Flawless! FLAWLESS! Ha!',       'thrilled',   'Note Match — round cleared (kudos: max one every 15 s)'),
  L('finn.mismatch.1',    'Nope! Not twins! Ha!',    'easy',       'NOT USED IN THE APP YET — optional, record last'),
  L('finn.mismatch.2',    'Ooh, remember that one!',  'hinting',    'NOT USED IN THE APP YET — optional, record last'),
  L('finn.mismatch.3',    'Try again, try again!',          'chill',      'NOT USED IN THE APP YET — optional, record last'),
  L('finn.mismatch.4',    'Keep lookin\'! Hee!',       'calm',       'NOT USED IN THE APP YET — optional, record last'),
  L('finn.gomatch.1',      'Remember the sounds!','coach',      'NOT USED IN THE APP YET — optional, record last'),
  L('finn.gomatch.2',      'You got this! Oh boy!',       'cool',       'NOT USED IN THE APP YET — optional, record last'),

  // ───────────── QUEST NUDGES (tap GO on a Daily Quest) ─────────────
  L('doctor.quest.q_detective_case', 'A case awaits, baby. Easy does it.',                 'noir',     'Quest: Crack a case'),
  L('doctor.quest.q_detective_3',    'Three cases today. Think you can hang?', 'challenge', 'Quest: Crack 3 cases'),
  L('doctor.quest.q_ear_quest',      'Five right in Ear Quest. Smooth and easy.',        'cool',     'Quest: Ear Quest'),
  L('stew.quest.q_stew_2',           'Beat my level two!',                  'dare',     'Quest: Stew level 2'),
  L('stew.quest.q_stew_4',           'Level four? You\'re brave!',          'impressed','Quest: Stew level 4'),
  L('stew.quest.q_facts_3',          'Find three friends in the Clubhouse!','eager',    'Quest: Fun Facts ×3'),
  L('jazzy.quest.q_jukebox_song',    'Finish a song with me! It\'ll be MUSIC to my ears! HA!',              'inviting', 'Quest: Jukebox song'),
  L('jazzy.quest.q_jukebox_streak',  'TEN in a row! I DARE ya!',              'sly',      'Quest: Jukebox 10-streak'),
  L('jazzy.quest.q_jam_8',           'Eight notes in the Jam Hall — go go GO!',   'smooth',   'Quest: Jam 8 notes'),
  L('chunk.quest.q_beat_loop',       'Build a loop in my lab, dude.',             'warm',     'Quest: Beat Lab loop'),
  L('chunk.quest.q_beat_3',          'Three tracks, bro. BIG sound.',            'booming',  'Quest: 3-track loop'),
  L('chunk.quest.q_robot_4',         'Get four robots dancin\', dude!',            'fun',      'Quest: Robot Boogie ×4'),
  L('chunk.quest.q_boom',            'Pass a round of rhythm with me, bro.',     'steady',   "Quest: Who's Got the Rhythm"),
  L('finn.quest.q_sight_read',       'Run a sprint with me! Oh boy!',               'daring',   'Quest: Sight-Reading'),
  L('finn.quest.q_name_note',        'Eight outta ten! I DARE ya! Hee-hee!',          'dare',     'Quest: Name That Note'),
  L('finn.quest.q_lesson',           'Class time! Watch a lesson — it\'s FUN!',         'bright',   'Quest: Music 101 lesson'),
  // Charlie — one-sentence how-to for every game (for kids who can't read yet).
  // Plays on the start menu right after the room host's tagline; the speaker
  // button on each "How to Play" card replays it.
  L('charlie.howto.jukebox',        'Tap on the bell when it drops in the box.',                                   'coach, upbeat',   'Jelly Jukebox — first bells song of the session · bells How to Play speaker'),
  L('charlie.howto.jukedrums',      'Tap on the drum when it drops in the box.',                                         'coach, upbeat',   'Jelly Jukebox — first drums song of the session · drums How to Play speaker'),
  L('charlie.howto.kazoo',          'Watch Stew play his kazoos, then tap \'em back in the same order.',                      'coach, warm',     'Stew Kazoo Says menu / speaker button'),
  L('charlie.howto.earquest',       'Listen to the mystery note, then tap the bell that matches it.',                   'coach, warm',     'Ear Quest menu / speaker button'),
  L('charlie.howto.tempo',          'Listen to these two tunes. Was the second one faster or slower?',         'playful',         'Snail or Cheetah menu / speaker button'),
  L('charlie.howto.notematch',      'Flip two cards and listen, then find the ones that match.',                       'coach, warm',     'Note Match menu / speaker button'),
  L('charlie.howto.detective',      'Hear the tune twice, then tap the note that changed.',             'sly, coach',      'Detective menu / speaker button'),
  L('charlie.howto.sightread',      'Read the notes on the staff, then tap the bells in the right order. Beat the clock!',   'coach, quick',    'Sight-Reading Sprint menu / speaker button'),
  L('charlie.howto.namenote.name',  'See the note on the staff? Tap its name.',                                       'coach, warm',     'Name That Note menu — Name It mode / speaker button'),
  L('charlie.howto.namenote.place', 'Read the note\'s name, then drag it onto the staff.',                              'coach, warm',     'Name That Note menu — Place It mode selected / speaker button'),
  L('charlie.howto.boom.copy',      'Listen to Stew\'s rhythm. After the count-in, play it back on the drums.',                                 'coach, groovy',   'Who\'s Got the Rhythm — Parrot Percussion how-to card'),
  L('charlie.howto.boom.match',     'Listen to the secret rhythm, then tap the strip that matches.',                                   'coach, groovy',   'Who\'s Got the Rhythm — Beat Finder how-to card'),
  L('charlie.howto.boom.trail',     'Tap Stew when each note crosses the gold line!',                                 'coach, groovy',   'Who\'s Got the Rhythm — Rhythm Run how-to card'),
  L('charlie.howto.shred',          'Pick a song and play the guitar in time with the beat. No mashin\'!',      'rock announcer',  'Shred City intro / speaker button'),
  L('charlie.howto.robot',          'Tap the band members to zap \'em into the jam, then boogie, robot boogie!',  'party host',      'Robot Boogie — on arrival / speaker button'),
  L('charlie.howto.funfacts',       'Slide the spyglass around to find the hidden friends.',                        'cozy, curious',   'Fun Facts Clubhouse — on arrival / speaker button'),
  L('charlie.howto.beatlab',        'Tap the pads to build a beat, then hit Play to hear your loop!',                     'coach, groovy',   'Beat Lab — on arrival, after Chunk\'s tagline'),
  L('charlie.howto.jam',            'Tap any instrument to play. Hit Record to save your jam!',                              'coach, upbeat',   'Jam Session — on arrival, after Jazzy\'s tagline'),
  L('charlie.howto.songstudio',     'Pick a mood, tap the keys to write your tune, then press Play!',                        'creative, warm',  'Song Studio — on arrival, after Charlie\'s tagline'),
  L('charlie.howto.dressing',       'Choose your character, then tap an outfit and try it on!',                               'warm, inviting',  'Dressing Room — on arrival'),
  L('charlie.howto.stage',          'Take a bow for the crowd, or pose for a poster!',                              'showman',         'Main Stage — on arrival'),

  L('finn.quest.q_note_match',     'Clear a round of Note Match! Oh boy oh boy!',        'cool',     'Quest: Note Match'),
  L('charlie.quest.q_shred',         'Play a show in Shred City, kid!',          'rock',     'Quest: Shred City'),
  L('charlie.quest.q_song_save',     'Come write a hit in my studio.',           'creative', 'Quest: Song Studio'),
  L('charlie.quest.q_jmatv',         'Catch a show on JMAtv, pal.',              'TV',       'Quest: JMAtv'),
  // Fun Facts — one line per fact, read by the character who tells it
  ...Object.entries(CHARACTER_FACTS).flatMap(([name, e]) => (FACT_VOICE[name] ? e.facts.map((t, i) =>
    L(`${FACT_VOICE[name]}.fact.${String(i + 1).padStart(2, '0')}`, t, 'curious, friendly', `Fun Facts — tapping ${name} (fact ${i + 1})`)) : [])),
];

export const VOICE_MAP = Object.fromEntries(VOICE_LINES.map(l => [l.id, l]));

// Which character "owns" a quest's voice line → id for say().
export function questVoiceId(questId) {
  return VOICE_LINES.find(l => l.id.endsWith(`.quest.${questId}`))?.id || null;
}
