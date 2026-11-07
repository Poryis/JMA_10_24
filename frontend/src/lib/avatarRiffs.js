// Each Jelly's signature riff — plays when picked in the Dressing Room and when taking a bow on stage.
import { readAvatar } from '../hooks/useAvatar';

const A = 'assets/audio/';

const RIFFS = {
  charlie: [['riffs/charlie.mp3', 0]],
  finn: [['riffs/finn.mp3', 0]],
  lou: [[['riffs/lou-1.mp3', 0]], [['riffs/lou-2.mp3', 0]], [['riffs/lou-3.mp3', 0]]],
  jazzy: [['riffs/jazzy.mp3', 0]],
  chunk: [['riffs/chunk.mp3', 0]],
};

// Outfits with their own riff (file riffs/<character>-<outfit>.mp3).
const OUTFIT_RIFFS = new Set(['chunk-disco', 'chunk-marching', 'chunk-steampunk', 'charlie-grad', 'charlie-drummajor', 'charlie-rundmc']);

// Charlie's guitar licks (riffs/guitar/gl-NN.mp3), picked at random per outfit.
const g = (...n) => n.map((x) => `riffs/guitar/gl-${String(x).padStart(2, '0')}.mp3`);
const METAL = g(1, 2, 3, 4, 5, 6, 7), FUNKY = g(25, 26, 27, 29, 30, 31, 32), SURF = g(16, 17), PUNK = g(35);
const BORIS = g(22, 23, 24), CUCINA = g(20, 21), REGGAE = g(36, 37), FRESH = g(10, 11, 12, 13, 15, 19, 28);
const STEW = (o, n) => Array.from({ length: n }, (_, i) => `riffs/stew-${o}-${i + 1}.mp3`);
const SAX = (...n) => n.map((x) => `riffs/doctor-sax-${x}.mp3`);
const POOLS = {
  'doctor-classic': SAX(1), 'doctor-detective': SAX(2), 'doctor-astro': SAX(3), 'doctor-disco': SAX(4), 'doctor-dapper': SAX(1, 2, 3, 4),
  'stew-classic': STEW('classic', 3), 'stew-kazoo': STEW('kazoo', 2), 'stew-drumline': STEW('drumline', 2),
  'charlie-disco': [1, 2, 3, 4, 5].map((n) => `riffs/charlie-disco-${n}.mp3`),
  'charlie-classic': METAL, 'charlie-captain': METAL, 'charlie-surf': SURF, 'charlie-punk': PUNK,
  'charlie-zoot': BORIS, 'charlie-pinstripes': CUCINA, 'charlie-reggae': REGGAE,
  'charlie-zebra': [...METAL, ...FUNKY, ...SURF, ...PUNK, ...BORIS, ...CUCINA, ...REGGAE],
  'charlie-studio': FRESH, 'charlie-steampunk': FRESH,
  'dolphin-dolphin': g(18),
  // Finn's bass fills (riffs/bass/fb-NN.mp3)
  ...Object.fromEntries([['classic', [1, 9]], ['plain', [2, 10]], ['disco', [3]], ['hiphop', [4]], ['snorkel', [5]], ['zoot', [6]], ['electrician', [7]], ['dapper', [8]]]
    .map(([o, ns]) => [`finn-${o}`, ns.map((n) => `riffs/bass/fb-${String(n).padStart(2, '0')}.mp3`)])),
};
// every usable lick — the coral guitar in the Academy
export const ALL_LICKS = [...new Set([...POOLS['charlie-zebra'], ...FRESH])];
const lastPick = {};
export const pickLick = (key, pool) => {
  const opts = pool.length > 1 ? pool.filter((f) => f !== lastPick[key]) : pool;
  return (lastPick[key] = opts[Math.floor(Math.random() * opts.length)]);
};

let playing = [];

export function playRiff(id, outfit, vol = 0.8) {
  const key = `${id}-${outfit}`;
  let r = POOLS[key] ? [[pickLick(key, POOLS[key]), 0]] : OUTFIT_RIFFS.has(key) ? [[`riffs/${key}.mp3`, 0]] : RIFFS[id] || [[`riffs/${id}.mp3`, 0]];
  if (Array.isArray(r[0][0])) r = r[Math.floor(Math.random() * r.length)];
  playing.forEach((a) => { try { a.pause(); } catch (_) { /* ignore */ } });
  playing = [];
  r.forEach(([file, delay]) => setTimeout(() => {
    const a = new Audio(encodeURI(A + file) + '?v=2'); a.volume = vol; playing.push(a); a.play().catch(() => {});
  }, delay));
}

// Secret friends each have their own riff, keyed by outfit id.
export function playMyRiff() {
  const { character, outfit } = readAvatar();
  playRiff(character === 'secret' ? outfit : character, outfit);
}

// Coral guitar in the Academy: a random lick, cutting off the previous one.
export function playAcademyLick() {
  playing.forEach((a) => { try { a.pause(); } catch (_) { /* ignore */ } });
  const a = new Audio(encodeURI(A + pickLick('academy', ALL_LICKS))); a.volume = 0.7; playing = [a]; a.play().catch(() => {});
}
