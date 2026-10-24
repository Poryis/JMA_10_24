// Avatars — the kid's own Jelly and the outfits they can earn.
// Outfit art already exists; unlocks lean on badges, ranks and stickers.

export const AVATAR_KEY = 'jma_avatar_v1'; // { character, outfit }

// unlock kinds: free | badge (any Cadet badge → rank ≠ polliwog) | rank (id) | sticker (id)
const FIRST_BADGE = { kind: 'badge', hint: 'Earn your first badge' };
const APPRENTICE  = { kind: 'rank', value: 'apprentice', hint: 'Reach Apprentice rank' };
const RHYTHM_PRO  = { kind: 'sticker', value: 'ach_rhythm_pro', hint: 'Earn the Rhythm Pro badge' };
const STREAK_3    = { kind: 'sticker', value: 'practice_buddy_3', hint: 'Practice 3 days in a row' };
const GEM_3       = { kind: 'sticker', value: 'gem_3', hint: 'Finish the daily quests on 3 days' };
const SHRED       = { kind: 'sticker', value: 'shred_legend', hint: 'Max the crowd in Shred City' };
const SONG        = { kind: 'sticker', value: 'ach_song_cadet', hint: 'Save a song in Charlie\'s Studio' };
const LESSON      = { kind: 'sticker', value: 'lesson_graduate', hint: 'Finish Music 101' };
const DETECTIVE   = { kind: 'sticker', value: 'ach_ear_pro', hint: 'Earn the Ear Pro badge' };
const BEAT_PRO    = { kind: 'sticker', value: 'ach_beat_pro', hint: 'Earn the Beat Pro badge' };
const DAPPER      = { kind: 'sticker', value: 'gem_7', hint: 'Finish the daily quests on 7 days' };

const C = 'assets/characters/';
const outfit = (id, name, file, unlock = { kind: 'free' }) => ({ id, name, src: `${C}${file}.png`, unlock });
const wfit = (id, name, file, unlock = { kind: 'free' }) => ({ id, name, src: `${C}${file}.webp`, unlock });

export const AVATARS = [
  { id: 'charlie', name: 'Charlie',       color: '#FFCC00', outfits: [
    outfit('classic',   'Classic',       'charlie'),
    outfit('disco',     'Disco',         'charlie-disco', FIRST_BADGE),
    outfit('surf',      'Surf',          'charlie-surf', STREAK_3),
    outfit('punk',      'Punk',          'charlie-punk', SHRED),
    outfit('zoot',      'Zoot Suit',     'charlie-zoot', APPRENTICE),
    outfit('rundmc',    'Old School',    'charlie-rundmc', RHYTHM_PRO),
    outfit('steampunk', 'Steampunk',     'charlie-steampunk', GEM_3),
    outfit('studio',    'Producer',      'charlie-studio', SONG),
    outfit('drummajor', 'Drum Major',    'charlie-drum-major', BEAT_PRO),
    outfit('grad',      'Graduate',      'charlie-grad', LESSON),
    wfit('captain',     'Captain',       'charlie-captain', { kind: 'rank', value: 'soloist', hint: 'Reach Soloist rank' }),
    wfit('pinstripes',  'Pinstripes',    'charlie-pinstripes', { kind: 'sticker', value: 'ach_song_pro', hint: 'Earn the Song Pro badge' }),
    wfit('reggae',      'Reggae',        'charlie-reggae', { kind: 'sticker', value: 'jmatv-first-watch', hint: 'Watch something on JMAtv' }),
    wfit('zebra',       'Zebra',         'charlie-zebra', { kind: 'sticker', value: 'ach_streak_10', hint: 'Hit a 10-note streak in Jelly Jukebox' }),
  ] },
  { id: 'finn',    name: 'Finn',          color: '#4285F4', outfits: [
    outfit('classic',   'Daredevil', 'finn-danger'),
    outfit('plain',     'Classic',   'shark'),
    outfit('disco',     'Disco',     'finn-disco', FIRST_BADGE),
    outfit('hiphop',    'Hip-Hop',   'sharky-hiphop', FIRST_BADGE),
    outfit('snorkel',   'Snorkel',   'sharky-snorkel', STREAK_3),
    outfit('zoot',      'Zoot Suit', 'sharky-zoot', APPRENTICE),
    wfit('electrician', 'Electrician', 'finn-electrician', { kind: 'sticker', value: 'ach_beat_cadet', hint: 'Earn the Beat Cadet badge' }),
    wfit('dapper',      'Dapper',    'finn-dapper', DAPPER),
  ] },
  { id: 'chunk',   name: 'Chunk',         color: '#34A853', outfits: [
    outfit('classic',   'Classic',   'chunk'),
    outfit('disco',     'Disco',     'chunk-disco', FIRST_BADGE),
    outfit('marching',  'Marching',  'chunk-marching', BEAT_PRO),
    outfit('steampunk', 'Dapper',    'chunk-steampunk', GEM_3),
  ] },
  { id: 'jazzy',   name: 'Jazzy',         color: '#AF52DE', outfits: [
    outfit('classic',  'Classic',  'jazzy'),
    outfit('disco',    'Disco',    'jazzy-disco', FIRST_BADGE),
    outfit('marching', 'Marching', 'jazzy-marching', RHYTHM_PRO),
    wfit('showtime',   'Showtime', 'jazzy-showtime', { kind: 'sticker', value: 'ach_keyboard_pro', hint: 'Earn the Keyboard Pro badge' }),
    wfit('tiger',      'Tiger Stripes', 'jazzy-tiger', { kind: 'sticker', value: 'shred_encore', hint: 'Play a flawless set in Shred City' }),
    wfit('roadtrip',   'Road Trip', 'jazzy-roadtrip', { kind: 'sticker', value: 'practice_buddy_14', hint: 'Practice 14 days in a row' }),
    wfit('dapper',     'Dapper',   'jazzy-dapper', DAPPER),
  ] },
  { id: 'stew',    name: 'Stew',          color: '#FF9500', outfits: [
    outfit('classic',  'Classic',   'stew'),
    { id: 'kazoo', name: 'Kazoo', src: 'assets/stew/stew-neutral.png', unlock: { kind: 'sticker', value: 'ach_keyboard_cadet', hint: 'Earn the Keyboard Cadet badge' } },
    outfit('drumline', 'Drum Line', 'stew-drumline', RHYTHM_PRO),
  ] },
  { id: 'doctor',  name: 'Dr. Jellybone', color: '#0FA3B1', outfits: [
    outfit('classic',   'Classic',   'dr-jellybone'),
    outfit('detective', 'Detective', 'dr-jellybone-detective', DETECTIVE),
    { ...outfit('astro', 'Astronaut', 'dr-jellybone-astro-1', GEM_3), helmet: true },
    wfit('disco',       'Disco',     'dr-jellybone-disco', FIRST_BADGE),
    wfit('dapper',      'Dapper',    'dr-jellybone-dapper', DAPPER),
  ] },
  { id: 'lou',     name: 'Lou',           color: '#8E8E93', outfits: [
    outfit('classic', 'Classic', 'lou'),
    outfit('disco',   'Disco',   'lou-disco', FIRST_BADGE),
    wfit('tea',       'Tea Time', 'lou-tea', { kind: 'sticker', value: 'lesson_1', hint: 'Finish Lesson 1' }),
    wfit('spitfire',  'Spitfire', 'lou-spitfire', { kind: 'sticker', value: 'ach_rhythm_master', hint: 'Earn the Rhythm Master badge' }),
    wfit('dapper',    'Dapper',  'lou-dapper', DAPPER),
  ] },
  // ---- Secret Friends: hidden until found. Each has one look and a character-level unlock. ----
  { id: 'dolphin', name: 'Dolphin',         color: '#1E9BFF', secret: true, unlock: { kind: 'sticker', value: 'ach_fact_finder', hint: 'Learn 10 fun facts' }, outfits: [wfit('classic', 'Classic', 'dolphin')] },
  { id: 'pete',    name: 'Pepperoni Pete',  color: '#E74C3C', secret: true, unlock: { kind: 'sticker', value: 'lesson_6', hint: 'Finish Lesson 6' }, outfits: [wfit('classic', 'Classic', 'pepperoni-pete')] },
  { id: 'gil',     name: 'Goldfish Gil',    color: '#FF9500', secret: true, unlock: { kind: 'covers', value: 2, hint: 'Design 2 album covers' }, outfits: [wfit('classic', 'Classic', 'goldfish-gil')] },
  { id: 'sal',     name: 'Seahorse Sal',    color: '#FF2D85', secret: true, unlock: { kind: 'sticker', value: 'lesson_3', hint: 'Finish Lesson 3' }, outfits: [wfit('classic', 'Classic', 'seahorse-sal')] },
  { id: 'sun',     name: 'The Sun',         color: '#FFCC00', secret: true, unlock: { kind: 'sticker', value: 'practice_buddy_7', hint: 'Practice 7 days in a row' }, outfits: [wfit('classic', 'Classic', 'the-sun')] },
  { id: 'gerald',  name: 'Elephant Gerald', color: '#8E8E93', secret: true, unlock: { kind: 'flag', value: 'tempo_changed', hint: 'Change the tempo in Beat Lab' }, outfits: [wfit('classic', 'Classic', 'elephant-gerald')] },
];

export const AVATAR_MAP = Object.fromEntries(AVATARS.map(a => [a.id, a]));
export const SECRET_AVATARS = AVATARS.filter(a => a.secret);

// Small "did this once" flags set by pages (Beat Lab tempo etc.) — read by unlocks.
export const FLAGS_KEY = 'jma_flags_v1';
export function readFlags() { try { return JSON.parse(localStorage.getItem(FLAGS_KEY) || '{}') || {}; } catch { return {}; } }
export function setFlag(name) {
  const f = readFlags();
  if (f[name]) return;
  f[name] = 1;
  try { localStorage.setItem(FLAGS_KEY, JSON.stringify(f)); } catch { /* ignore */ }
}
function coverCount() { try { return Object.keys(JSON.parse(localStorage.getItem('jma_album_covers_v1') || '{}')).length; } catch { return 0; } }

export function isUnlocked(u, { earned, rankIndex, rankIds }) {
  if (!u || u.kind === 'free') return true;
  if (u.kind === 'badge') return rankIndex > 0;
  if (u.kind === 'rank') return rankIndex >= rankIds.indexOf(u.value);
  if (u.kind === 'sticker') return !!earned[u.value];
  if (u.kind === 'flag') return !!readFlags()[u.value];
  if (u.kind === 'covers') return coverCount() >= u.value;
  return false;
}
export function isCharacterUnlocked(a, ctx) { return !a.secret || isUnlocked(a.unlock, ctx); }
export function isOutfitUnlocked(o, ctx) { return isUnlocked(o.unlock, ctx); }
