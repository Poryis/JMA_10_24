// Each Jelly's signature riff — plays when picked in the Dressing Room and when taking a bow on stage.
import { readAvatar } from '../hooks/useAvatar';

const A = 'assets/audio/';

const RIFFS = {
  charlie: [['riffs/charlie.mp3', 0]],
  finn: [['riffs/finn.mp3', 0]],
  lou: [[['riffs/lou-1.mp3', 0]], [['riffs/lou-2.mp3', 0]], [['riffs/lou-3.mp3', 0]]],
  jazzy: [['riffs/jazzy.mp3', 0]],
  chunk: [['sfx-drum-fill.mp3', 0]],
};

// Outfits with their own riff (file riffs/<character>-<outfit>.mp3).
const OUTFIT_RIFFS = new Set(['stew-kazoo', 'stew-drumline', 'doctor-detective', 'doctor-astro', 'doctor-disco', 'doctor-dapper', 'chunk-disco', 'chunk-marching', 'chunk-steampunk']);

let playing = [];

export function playRiff(id, outfit, vol = 0.8) {
  const key = `${id}-${outfit}`;
  let r = OUTFIT_RIFFS.has(key) ? [[`riffs/${key}.mp3`, 0]] : RIFFS[id] || [[`riffs/${id}.mp3`, 0]];
  if (Array.isArray(r[0][0])) r = r[Math.floor(Math.random() * r.length)];
  playing.forEach((a) => { try { a.pause(); } catch (_) { /* ignore */ } });
  playing = [];
  r.forEach(([file, delay]) => setTimeout(() => {
    const a = new Audio(encodeURI(A + file)); a.volume = vol; playing.push(a); a.play().catch(() => {});
  }, delay));
}

// Secret friends each have their own riff, keyed by outfit id.
export function playMyRiff() {
  const { character, outfit } = readAvatar();
  playRiff(character === 'secret' ? outfit : character, outfit);
}
