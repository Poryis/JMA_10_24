// Voice-line registry — every spoken blurb in the Academy.
//
// Audio files live at public/assets/voice/<id>.mp3 and are recorded by real
// humans. The app plays a line via say('group') (see lib/voice.js); groups
// with numbered variants (e.g. 'doctor.correct') pick a random take.
// Missing files fail silently so lines can be dropped in as they're recorded.

export const VOICE_CHARACTERS = {
  charlie: { name: 'Charlie the Polliwog', role: 'Academy host · Shred City · Song Studio · Music 101 · JMAtv', vibe: 'Sinatra / Louis Prima New York wise guy. Friendly, finger-snapping, "how YOU doin\'" warmth. Calls you kid, pal, champ.' },
  doctor:  { name: 'Dr. Jellybone',        role: 'Detective · Ear Quest',                                     vibe: 'Smooth-talkin\' jazzman, sax player. Velvet, unhurried, gentlemanly. NEVER loud — the excitement is in the eyebrows.' },
  stew:    { name: 'Stew',                  role: 'Stew Kazoo Says · Fun Facts Clubhouse',                     vibe: 'Goofy, buzzy, easily delighted. In the show Stew talks in KAZOO — these lines can be performed as kazoo-talk with the words as intent.' },
  jazzy:   { name: 'Jazzy',                 role: 'Jelly Jukebox · Jam Session',                               vibe: 'LOUD, boisterous, fun-loving pun machine — CAT puns (purrrfect, meow-sic, kitten around). Big laughs, means every word.' },
  chunk:   { name: 'Chunk',                 role: "Beat Lab · Robot Boogie · Who's Got the Rhythm",            vibe: 'Stereotypical surfer bro. "Duuude." Laid back, stoked, everything is gnarly or epic.' },
  finn:    { name: 'Finn Danger (the shark — a.k.a. Sharky)', role: 'Sight-Reading Sprint · Name That Note · Note Match',                   vibe: 'Jerry Lewis "HEY LADY!" energy — always on the brink of joyous laughter, can\'t contain his excitement at ANYTHING. Eager, literal, loves puns. "Jumpin\' jellyfish!"' },
  // Lou never talks. By design.
};

// id format: <character>.<group>[.<variant>]
const L = (id, text, emotion, where) => {
  const [char] = id.split('.');
  return { id, char, text, emotion, where };
};

export const VOICE_LINES = [
  // ───────────── CHARLIE — Academy host (Home hub) ─────────────
  L('charlie.hub.first',     'Heyyy — welcome to the Academy, kid!',            'huge smile',     'Home — very first visit'),
  L('charlie.hub.morning',   'Mornin\', champ. Let\'s make some music.',             'bright',         'Home — before noon'),
  L('charlie.hub.afternoon', 'Afternoon, pal! Ya ready?',               'bright',         'Home — noon to 5pm'),
  L('charlie.hub.evening',   'Evenin\'! Nothin\' like a night session.',        'cozy, excited',  'Home — after 5pm'),
  L('charlie.hub.streak',    'Look at you — on a streak!',               'proud',          'Home — practice streak ≥ 3 days'),
  L('charlie.hub.quests',    'Got fresh quests for ya today.',                  'eager',          'Home — fresh quests, none done yet'),
  L('charlie.hub.alldone',   'That\'s the whole list! See ya tomorrow, kid.',   'warm, satisfied','Home — all 3 quests done'),
  L('charlie.jam.takeit',    'Take it to the Jam Session, kid!',                     'hyped',          'Beat Lab / Song Studio — tapping "Jam on it!"'),
  L('charlie.hub.lockbadge', 'Earn one badge and this street is yours — here are today\'s quests!', 'playful, encouraging', 'Tapping a locked LEARN/CREATE gate — opens the Quest Board'),
  L('charlie.hub.lockpass',  'Ask a grown-up about that one, kid.',     'gentle',         'Tapping an Academy-Pass-locked room (future)'),

  // Charlie — room taglines
  L('charlie.tag.shred',     'Welcome to Shred City, baby!',             'rock announcer', 'Entering Shred City'),
  L('charlie.tag.songstudio','Step into my studio. Let\'s write a hit.',               'creative, warm', 'Entering Charlie\'s Song Studio'),
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
  L('charlie.correct.1', 'Yeah, that\'s it!',                 'quick',   'Correct'),
  L('charlie.correct.2', 'Badda-bing!',           'punchy',  'Correct'),
  L('charlie.correct.3', 'Now you\'re cookin\'!',     'happy',   'Correct'),
  L('charlie.correct.4', 'That\'s the stuff, kid.',             'rock',    'Correct'),
  L('charlie.perfect.1', 'PERFECT! Whatta pro!',             'yell',    'Perfect'),
  L('charlie.perfect.2', 'Oh, you\'re GOOD.', 'thrilled','Perfect'),
  L('charlie.perfect.3', 'Ring-a-ding-ding! Flawless!',     'amazed',  'Perfect'),
  L('charlie.miss.1',    'Ehh, almost, pal.',              'kind',    'Miss'),
  L('charlie.miss.2',    'Not that one — try it again.', 'encouraging', 'Miss'),
  L('charlie.miss.3',    'Close, kid. Real close.',       'sympathetic', 'Miss'),
  L('charlie.miss.4',    'Shake it off. One more time.', 'upbeat', 'Miss'),
  L('charlie.go.1',      'Keep it rollin\'!',       'cheer',   'Mid-game encouragement'),
  L('charlie.go.2',      'You got this, champ.',    'cheer',   'Mid-game encouragement'),

  // ───────────── DR. JELLYBONE — Detective, Ear Quest ─────────────
  L('doctor.tag.detective', 'Mmm… I\'ve got a case for you.',  'noir, inviting', 'Entering Detective'),
  L('doctor.tag.earquest',  'Easy now. Just use those ears.',  'calm',           'Entering Ear Quest'),
  L('doctor.correct.1', 'Case closed, baby.',        'satisfied',   'Correct'),
  L('doctor.correct.2', 'Mmm-hmm. That\'s the one.',         'smug-fun',    'Correct'),
  L('doctor.correct.3', 'Sharp ears. Real sharp.',         'impressed',   'Correct'),
  L('doctor.correct.4', 'Precisely.',          'dry',         'Correct'),
  L('doctor.perfect.1', 'Ohh, that was smooth.', 'delighted', 'Perfect'),
  L('doctor.perfect.2', 'Not a single clue slipped by.', 'proud',    'Perfect'),
  L('doctor.perfect.3', 'Now that… is detective work.',          'warm',        'Perfect'),
  L('doctor.miss.1',    'Mmm, not that note.', 'thoughtful',  'Miss'),
  L('doctor.miss.2',    'A red herring. Listen again.', 'playful', 'Miss'),
  L('doctor.miss.3',    'The clue slipped by. It happens.', 'gentle',      'Miss'),
  L('doctor.miss.4',    'Close. Trust those ears.', 'reassuring', 'Miss'),
  L('doctor.go.1',      'Listen close now…',     'hushed',      'Mid-game'),
  L('doctor.go.2',      'Take your time, detective.',   'coaxing',     'Mid-game'),

  // ───────────── STEW — Stew Kazoo Says, Fun Facts ─────────────
  L('stew.tag.kazoo',    'Stew Kazoo says… PLAY!',       'goofy',    'Entering Stew Kazoo Says'),
  L('stew.tag.funfacts', 'Welcome to the Clubhouse!',    'buzzy',    'Entering Fun Facts Clubhouse'),
  L('stew.correct.1', 'Kazoo-tastic!',          'silly',      'Correct'),
  L('stew.correct.2', 'You remembered!',        'thrilled',   'Correct'),
  L('stew.correct.3', 'Yesss!',                 'squeaky',    'Correct'),
  L('stew.correct.4', 'Bzzz-rilliant!',         'kazoo-buzz', 'Correct'),
  L('stew.perfect.1', 'Every single one! WOW!', 'exploding',  'Perfect'),
  L('stew.perfect.2', 'Perfect memory!',        'proud',      'Perfect'),
  L('stew.perfect.3', 'Stew says: AMAZING!',    'announcer',  'Perfect'),
  L('stew.miss.1',    'Oopsie!',                'cute',       'Miss'),
  L('stew.miss.2',    'Stew says… try again!',  'kind',       'Miss'),
  L('stew.miss.3',    'Almost had it!',         'cheerful',   'Miss'),
  L('stew.miss.4',    'That\'s okay — one more time!', 'warm', 'Miss'),
  L('stew.go.1',      'Watch and listen!',      'eager',      'Mid-game'),
  L('stew.go.2',      'You can do it!',         'cheer',      'Mid-game'),

  // ───────────── JAZZY — Jelly Jukebox, Jam Session ─────────────
  L('jazzy.tag.jukebox', 'JELLY JUKEBOX! Jazzy\'s the name, meow-sic\'s my game!', 'smooth DJ', 'Entering Jelly Jukebox'),
  L('jazzy.tag.jam',     'JAM SESSION! I hope you brought the peanut butter! HA!',     'laid back',  'Entering Jam Session'),
  L('jazzy.correct.1', 'YES! That\'s what I\'m TALKIN\' about!',               'cool',       'Correct / good song'),
  L('jazzy.correct.2', 'You\'re on a ROLL — and I\'m not talkin\' bread! HA!',        'approving',  'Correct'),
  L('jazzy.correct.3', 'Sharp! Like a C-sharp! Get it?!',               'warm',       'Correct'),
  L('jazzy.correct.4', 'THAT\'S the groove — you\'re not kitten around!',   'nodding',    'Correct'),
  L('jazzy.perfect.1', 'PURRRFECT TIMING! Oh, you\'re ON FIRE!',       'impressed',  'Perfect'),
  L('jazzy.perfect.2', 'WOW! That was NOTE-worthy! HA HA!',          'delighted',  'Perfect'),
  L('jazzy.perfect.3', 'You ARE the beat! Can\'t BEAT that!',     'big',        'Perfect'),
  L('jazzy.miss.1',    'Missed it! But hey — catch the next one!', 'easy', 'Miss'),
  L('jazzy.miss.2',    'A little late — fashionably late! HA!', 'chill',   'Miss'),
  L('jazzy.miss.3',    'Oof! Feel it… wait for it…', 'coaching',   'Miss'),
  L('jazzy.miss.4',    'Shake it off! Like a maraca! HA!',         'light',      'Miss'),
  L('jazzy.go.1',      'STAY on that beat!',     'steady',     'Mid-game'),
  L('jazzy.go.2',      'Feel the groove, baby!',      'smooth',     'Mid-game'),

  // ───────────── CHUNK — Beat Lab, Robot Boogie, Who's Got the Rhythm ─────────────
  L('chunk.tag.beatlab', 'Duuude. Welcome to the Beat Lab.',  'deep, warm',  'Entering Beat Lab'),
  L('chunk.tag.robot',   'Robot Boogie, bro! Let\'s dance.', 'rumbly fun', 'Entering Robot Boogie'),
  L('chunk.tag.boom',    'Who\'s got the rhythm, dude?',    'call-out',    "Entering Who's Got the Rhythm"),
  L('chunk.correct.1', 'Gnarly beat, bro!',             'booming',    'Correct'),
  L('chunk.correct.2', 'Booom! Yes, dude!',           'punchy',     'Correct'),
  L('chunk.correct.3', 'That\'s heavy, man.',        'approving',  'Correct'),
  L('chunk.correct.4', 'Right on, bro.',             'calm',       'Correct'),
  L('chunk.perfect.1', 'DUUUDE. Epic.',              'huge',       'Perfect'),
  L('chunk.perfect.2', 'Perfect rhythm! Totally stoked!',       'proud',      'Perfect'),
  L('chunk.perfect.3', 'Boom boom PERFECT, brah!',    'drum-like',  'Perfect'),
  L('chunk.miss.1',    'Whoa, little off, dude.',       'gentle',     'Miss'),
  L('chunk.miss.2',    'Try the rhythm again, bro.', 'patient',    'Miss'),
  L('chunk.miss.3',    'Almost, man. Almost.',     'kind',       'Miss'),
  L('chunk.miss.4',    'Listen to the drums, dude.',  'coaching',   'Miss'),
  L('chunk.go.1',      'Keep the beat, bro!',        'steady',     'Mid-game'),
  L('chunk.go.2',      'Nice and mellow, dude.',      'soothing',   'Mid-game'),

  // ───────────── FINN — Sight-Reading, Name That Note ─────────────
  L('finn.tag.sightread', 'Sight-Reading SPRINT! Oh boy oh boy, ready?!', 'daring',  'Entering Sight-Reading Sprint'),
  L('finn.tag.namenote',  'NAME! THAT! NOTE! Hee-hee!',              'game-show','Entering Name That Note'),
  L('finn.correct.1', 'YES! Ha-HA!',              'snappy',     'Correct'),
  L('finn.correct.2', 'You READ that! Oh, I love it!',        'impressed',  'Correct'),
  L('finn.correct.3', 'Right! Next one, next one!',            'fast',       'Correct'),
  L('finn.correct.4', 'Oh, that\'s SHARP!',                'quick',      'Correct'),
  L('finn.perfect.1', 'PERFECT SCORE! Jumpin\' jellyfish!',        'big',        'Perfect'),
  L('finn.perfect.2', 'Speed reader! HEY, LOOK at you!',         'amazed',     'Perfect'),
  L('finn.perfect.3', 'Nothing gets past you! NOTHING! Ha!','proud',      'Perfect'),
  L('finn.miss.1',    'Nope-nope-nope — look again!',    'quick, kind','Miss'),
  L('finn.miss.2',    'Lines and spaces, lines and spaces!',     'hinting',    'Miss'),
  L('finn.miss.3',    'Not quite — ha! — try again!',            'light',      'Miss'),
  L('finn.miss.4',    'Ooh! Next one, next one!',     'moving on',  'Miss'),
  L('finn.go.1',      'Read ahead, read ahead!',           'urging',     'Mid-game'),
  L('finn.go.2',      'Eyes on the staff! Hee!',    'coach',      'Mid-game'),

  // ───────────── SHARKY — Note Match ─────────────
  L('finn.tag.notematch', 'NOTE MATCH! Find the twins! Oh, I love this one!', 'hip-hop cool', 'Entering Note Match'),

  // ---- Dressing Room: picked as your Jelly / tried on a new outfit ----
  L('charlie.dress.pick',  'Me? You picked ME? Let\'s look sharp!',          'delighted',   'Dressing Room — choosing Charlie'),
  L('charlie.dress.wear',  'Ooh, lookin\' good! Spin around!',                'proud',       'Dressing Room — Charlie changes outfit'),
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

  L('finn.match.1', 'MATCH! Ha-HA!',              'punchy',     'Pair found'),
  L('finn.match.2', 'TWINS! Oh, look at \'em!',              'fun',        'Pair found'),
  L('finn.match.3', 'YES! You found it!',          'cool',       'Pair found'),
  L('finn.match.4', 'That\'s a match! Hee-hee!',           'happy',      'Pair found'),
  L('finn.sweep.1', 'CLEAN SWEEP! Jumpin\' jellyfish!',        'big',        'Round cleared'),
  L('finn.sweep.2', 'Perfect match-up! HEY, LOOK at that!',   'proud',      'Round cleared'),
  L('finn.sweep.3', 'Flawless! FLAWLESS! Ha!',       'thrilled',   'Round cleared'),
  L('finn.mismatch.1',    'Nope! Not twins! Ha!',    'easy',       'Mismatch'),
  L('finn.mismatch.2',    'Ooh, remember that one!',  'hinting',    'Mismatch'),
  L('finn.mismatch.3',    'Try again, try again!',          'chill',      'Mismatch'),
  L('finn.mismatch.4',    'Keep lookin\'! Hee!',       'calm',       'Mismatch'),
  L('finn.gomatch.1',      'Remember the sounds!','coach',      'Mid-game'),
  L('finn.gomatch.2',      'You got this! Oh boy!',       'cool',       'Mid-game'),

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
  L('charlie.howto.jukebox',        'Tap the bell when the note drops into the box, kid!',                                   'coach, upbeat',   'Jelly Jukebox menu — after Jazzy\'s tagline / speaker button'),
  L('charlie.howto.kazoo',          'Watch Stew play his kazoos, then tap \'em back in the same order.',                      'coach, warm',     'Stew Kazoo Says menu / speaker button'),
  L('charlie.howto.earquest',       'Listen to the mystery note, then tap the bell that matches it, pal.',                   'coach, warm',     'Ear Quest menu / speaker button'),
  L('charlie.howto.tempo',          'Two tunes — was the second one faster like a cheetah, or slower like a snail?',         'playful',         'Snail or Cheetah menu / speaker button'),
  L('charlie.howto.notematch',      'Flip two cards and listen — find the ones that sound the same.',                       'coach, warm',     'Note Match menu / speaker button'),
  L('charlie.howto.detective',      'Hear the tune twice, then tap the note that sounds wrong the second time.',             'sly, coach',      'Detective menu / speaker button'),
  L('charlie.howto.sightread',      'Listen to the notes on the staff, then tap those bells in order before time\'s up.',   'coach, quick',    'Sight-Reading Sprint menu / speaker button'),
  L('charlie.howto.namenote.name',  'See the note on the staff? Tap its name, champ.',                                       'coach, warm',     'Name That Note menu — Name It mode / speaker button'),
  L('charlie.howto.namenote.place', 'Read the note\'s name, then drag it home onto the staff.',                              'coach, warm',     'Name That Note menu — Place It mode selected / speaker button'),
  L('charlie.howto.boom.copy',      'Stew plays a rhythm — tap it right back the same way.',                                 'coach, groovy',   'Who\'s Got the Rhythm — Parrot Percussion how-to card'),
  L('charlie.howto.boom.match',     'Hear the rhythm, then tap the card that matches it.',                                   'coach, groovy',   'Who\'s Got the Rhythm — Beat Finder how-to card'),
  L('charlie.howto.boom.trail',     'Follow the rhythm on the trail and tap along in time.',                                 'coach, groovy',   'Who\'s Got the Rhythm — Rhythm Run how-to card'),
  L('charlie.howto.shred',          'Pick a song, then rock the guitar in time with the beat to get the crowd goin\'!',      'rock announcer',  'Shred City intro / speaker button'),
  L('charlie.howto.robot',          'Tap the Club members to get \'em dancin\' — the more you add, the bigger the boogie!',  'party host',      'Robot Boogie — on arrival / speaker button'),
  L('charlie.howto.funfacts',       'Slide the spyglass around to find all the hidden friends, kid.',                        'cozy, curious',   'Fun Facts Clubhouse — on arrival / speaker button'),

  L('finn.quest.q_note_match',     'Clear a round of Note Match! Oh boy oh boy!',        'cool',     'Quest: Note Match'),
  L('charlie.quest.q_shred',         'Play a show in Shred City, kid!',          'rock',     'Quest: Shred City'),
  L('charlie.quest.q_song_save',     'Come write a hit in my studio.',           'creative', 'Quest: Song Studio'),
  L('charlie.quest.q_jmatv',         'Catch a show on JMAtv, pal.',              'TV',       'Quest: JMAtv'),
];

export const VOICE_MAP = Object.fromEntries(VOICE_LINES.map(l => [l.id, l]));

// Which character "owns" a quest's voice line → id for say().
export function questVoiceId(questId) {
  return VOICE_LINES.find(l => l.id.endsWith(`.quest.${questId}`))?.id || null;
}
