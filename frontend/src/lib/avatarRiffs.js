// Each Jelly's signature riff — plays when picked in the Dressing Room and when taking a bow on stage.
import { readAvatar } from '../hooks/useAvatar';

const A = 'assets/audio/';
const seq = (dir, notes, gap) => notes.map((n, i) => [`${dir}/${n}.mp3`, i * gap]);

const RIFFS = {
  charlie: [['riffs/charlie.mp3', 0]],
  finn: [['riffs/finn.mp3', 0]],
  stew: seq('kazoos', ['kazoo-C', 'kazoo-E', 'kazoo-G', 'kazoo-HighC'], 150),
  lou: [[['riffs/lou-1.mp3', 0]], [['riffs/lou-2.mp3', 0]], [['riffs/lou-3.mp3', 0]]],
  jazzy: [['riffs/jazzy.mp3', 0]],
  doctor: seq('sax', ['C4', 'D4', 'E4', 'G4'], 170),
  chunk: [['sfx-drum-fill.mp3', 0]],
};

let playing = [];

export function playRiff(id, vol = 0.8) {
  let r = RIFFS[id] || [[`riffs/${id}.mp3`, 0]];
  if (Array.isArray(r[0][0])) r = r[Math.floor(Math.random() * r.length)];
  playing.forEach((a) => { try { a.pause(); } catch (_) { /* ignore */ } });
  playing = [];
  r.forEach(([file, delay]) => setTimeout(() => {
    const a = new Audio(encodeURI(A + file)); a.volume = vol; playing.push(a); a.play().catch(() => {});
  }, delay));
}

// Secret friends each have their own riff, keyed by outfit id.
export function playMyRiff(vol) {
  const { character, outfit } = readAvatar();
  playRiff(character === 'secret' ? outfit : character, vol);
}
