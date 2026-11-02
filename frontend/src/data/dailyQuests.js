// Daily Quest catalog + deterministic daily picker.
//
// Three bite-sized quests per day, drawn from games that already exist.
// Slots 1-2 are seeded by the calendar date (every kid gets the same two →
// "did you get today's?" chatter). Slot 3 is the curriculum nudge: it pulls
// from the kid's weakest achievement domain so the daily ritual quietly
// balances their music diet.
//
// While the Academy is still locked (no badge yet), every slot comes from
// the three starter games so a brand-new kid is never sent to a locked room.

import { ACHIEVEMENT_DOMAINS, summarizeAchievements } from './achievements';

export const STARTER_PATHS = ['/detective', '/simon-says', '/rhythm-game'];

// `when` = minimum payload values required for the event to count.
// `target` > 1 turns the quest into a counter (one tick per matching event).
export const QUEST_POOL = [
  { id: 'q_detective_case', event: 'detective_case', game: 'detective', domain: 'ear',      starter: true,  title: 'Crack a case with Dr. Jellybone',  where: 'Detective Dr. Jellybone', route: '/detective?quest=easy' },
  { id: 'q_detective_3',    event: 'detective_case', game: 'detective', domain: 'ear',      starter: true,  title: 'Crack 3 cases with Dr. Jellybone', where: 'Detective Dr. Jellybone', route: '/detective?quest=easy', target: 3 },
  { id: 'q_stew_2',         event: 'stew_level',     game: 'stew',      domain: 'keyboard', starter: true,  title: 'Beat Stew Kazoo Says level 2',     where: 'Stew Kazoo Says',         route: '/simon-says?quest=easy', when: { level: 2 } },
  { id: 'q_stew_4',         event: 'stew_level',     game: 'stew',      domain: 'keyboard', starter: false, title: 'Beat Stew Kazoo Says level 4',     where: 'Stew Kazoo Says',         route: '/simon-says?quest=easy', when: { level: 4 } },
  { id: 'q_jukebox_song',   event: 'jukebox_song',   game: 'jukebox',   domain: 'rhythm',   starter: true,  title: 'Finish a song in Jelly Jukebox',   where: 'Jelly Jukebox',           route: '/rhythm-game' },
  { id: 'q_jukebox_streak', event: 'jukebox_streak', game: 'jukebox',   domain: 'rhythm',   starter: false, title: 'Hit a 10-streak in Jelly Jukebox', where: 'Jelly Jukebox',           route: '/rhythm-game', when: { maxStreak: 10 } },
  { id: 'q_note_match',     event: 'note_match',     game: 'notematch', domain: 'ear',      starter: false, title: 'Clear a Note Match round',         where: 'Note Match',              route: '/note-match?quest=easy' },
  { id: 'q_sight_read',     event: 'sight_read',     game: 'sightread', domain: 'scholar',  starter: false, title: 'Run a Sight-Reading Sprint',       where: 'Sight-Reading Sprint',    route: '/sight-reading?quest=cadet' },
  { id: 'q_beat_loop',      event: 'beat_loop',      game: 'beatlab',   domain: 'beat',     starter: false, title: 'Make a loop in the Beat Lab',      where: 'Beat Lab',                route: '/loop-studio' },
  { id: 'q_beat_3',         event: 'beat_loop',      game: 'beatlab',   domain: 'beat',     starter: false, title: 'Build a 3-track loop',             where: 'Beat Lab',                route: '/loop-studio', when: { tracks: 3 } },
  { id: 'q_jam_8',          event: 'jam_note',       game: 'jam',       domain: 'keyboard', starter: false, title: 'Play 8 notes in Jam Session',      where: 'Jam Session',             route: '/free-play', target: 8 },
  { id: 'q_robot_4',        event: 'robot_dancers',  game: 'robot',     domain: 'beat',     starter: false, title: 'Get 4 friends dancing',            where: 'Robot Boogie',            route: '/robot-boogie', when: { count: 4 } },
  { id: 'q_facts_3',        event: 'fun_fact',       game: 'facts',     domain: 'scholar',  starter: false, title: 'Find 3 friends in the Clubhouse',  where: 'Fun Facts Clubhouse',     route: '/fun-facts', target: 3 },
  { id: 'q_jmatv',          event: 'jmatv_watch',    game: 'jmatv',     domain: 'scholar',  starter: false, title: 'Watch a show on JMAtv',            where: 'JMAtv',                   route: '/jmatv/live' },
  { id: 'q_boom',           event: 'boom_round',     game: 'boom',      domain: 'rhythm',   starter: false, title: "Pass a round in Who's Got the Rhythm", where: "Who's Got the Rhythm", route: '/boom-garden' },
  { id: 'q_name_note',      event: 'name_note',      game: 'namenote',  domain: 'scholar',  starter: false, title: 'Score 8/10 in Name That Note',     where: 'Name That Note',          route: '/name-that-note' },
  { id: 'q_lesson',         event: 'lesson',         game: 'lessons',   domain: 'scholar',  starter: false, title: 'Watch a Music 101 lesson',         where: 'Music 101',               route: '/lessons' },
  { id: 'q_song_save',      event: 'song_saved',     game: 'songstudio',domain: 'song',     starter: false, title: "Save a song in Charlie's Studio",  where: "Charlie's Song Studio",   route: '/song-studio' },
  { id: 'q_shred',          event: 'shred_show',     game: 'shred',     domain: 'rhythm',   starter: false, title: 'Play a show in Shred City',        where: 'Shred City',            route: '/shred-legend' },
  { id: 'q_ear_quest',      event: 'ear_quest',      game: 'earquest',  domain: 'ear',      starter: false, title: 'Get 5 right in Ear Quest',         where: 'Ear Quest',               route: '/ear-trainer', when: { correct: 5 } },
];

export const QUEST_MAP = Object.fromEntries(QUEST_POOL.map(q => [q.id, q]));

// The Academy Tour — a one-time first set shown before daily quests begin.
// Routes walk the kid out through the plaza (`go=` makes their Jelly swim to that door).
export const TOUR_QUESTS = [
  { id: 't_character',  event: 'avatar_chosen', title: 'Choose your character',          where: 'Dressing Room', route: '/home?go=dressing-room' },
  { id: 't_first_game', event: 'jukebox_song',  title: 'Finish a song in Jelly Jukebox', where: 'Jelly Jukebox', route: '/campus?zone=play&go=jelly-jukebox' },
];
export const TOUR_MAP = Object.fromEntries(TOUR_QUESTS.map(q => [q.id, q]));

// Easier domains first — mirrors useNextMission's CADET_PREFERENCE.
const DOMAIN_PREFERENCE = ['ear', 'keyboard', 'rhythm', 'beat', 'scholar', 'song'];

export function questMatches(quest, payload = {}) {
  if (!quest.when) return true;
  return Object.entries(quest.when).every(([k, min]) => (payload[k] ?? 0) >= min);
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function weakestDomain(earnedSet) {
  const { perDomain } = summarizeAchievements(earnedSet);
  return [...ACHIEVEMENT_DOMAINS]
    .sort((a, b) =>
      (perDomain[a.id].highestTier - perDomain[b.id].highestTier) ||
      (DOMAIN_PREFERENCE.indexOf(a.id) - DOMAIN_PREFERENCE.indexOf(b.id)))[0].id;
}

// Returns 3 quest ids for the given date key ('yyyy-mm-dd').
export function pickDailyQuests(dateKey, earnedSet, locked) {
  const rand = mulberry32(hashString(dateKey));
  const pool = locked ? QUEST_POOL.filter(q => q.starter) : QUEST_POOL;
  const shuffled = seededShuffle(pool, rand);

  const picked = [];
  const usedGames = new Set();
  for (const q of shuffled) {
    if (picked.length >= 2) break;
    if (usedGames.has(q.game)) continue;
    picked.push(q); usedGames.add(q.game);
  }

  let third = null;
  if (!locked) {
    const dom = weakestDomain(earnedSet);
    third = shuffled.find(q => q.domain === dom && !usedGames.has(q.game)) || null;
  }
  if (!third) third = shuffled.find(q => !usedGames.has(q.game)) || shuffled.find(q => !picked.includes(q));
  if (third) picked.push(third);
  return picked.map(q => q.id);
}

// Daily Gem milestones — number of fully-completed quest days → sticker id.
export const GEM_MILESTONES = { 1: 'gem_1', 3: 'gem_3', 7: 'gem_7', 14: 'gem_14', 30: 'gem_30' };
