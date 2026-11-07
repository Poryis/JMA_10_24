// Single-channel voice player for the Academy's character blurbs.
//
// say('doctor.correct')  → random take among doctor.correct.1..n
// say('charlie.hub.morning') → that exact line
// Files: public/assets/voice/<id>.mp3. Missing files are remembered and
// skipped silently, so lines can land one recording session at a time.

import { VOICE_MAP, VOICE_LINES } from '../data/voiceLines';

export const VOICE_KEY = 'jma_voice_v1'; // '0' = character voices off
const BASE = 'assets/voice/';
// bump when re-importing recordings so phones fetch the new takes
const VOICE_VERSION = 2;

const missing = new Set();
const lastSpokenAt = {};
const lastVariant = {};
let current = null;

// Kudos (cheers, misses, "keep going", Shred crowd calls) share one clock: at most one every 15 s, across every game.
const KUDOS = /\.(correct|perfect|miss|go|match|mismatch|gomatch|sweep)(\.\d+)?$|^charlie\.shred\.(opening|headliner|legend|toowild)$/;
const KUDOS_GAP_MS = 15000;
let lastKudosAt = 0;

export function voiceEnabled() {
  try { return localStorage.getItem(VOICE_KEY) !== '0'; } catch (_) { return true; }
}
export function setVoiceEnabled(on) {
  try { localStorage.setItem(VOICE_KEY, on ? '1' : '0'); } catch (_) {}
  if (!on) stopVoice();
}

export function stopVoice() {
  if (current) { try { current.pause(); } catch (_) {} current = null; }
}

function resolve(idOrGroup) {
  if (VOICE_MAP[idOrGroup]) return VOICE_MAP[idOrGroup];
  const takes = VOICE_LINES.filter(l => l.id.startsWith(`${idOrGroup}.`) && !missing.has(l.id));
  if (!takes.length) return null;
  const pool = takes.length > 1 ? takes.filter(l => l.id !== lastVariant[idOrGroup]) : takes;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  lastVariant[idOrGroup] = pick.id;
  return pick;
}

// Returns true if a line started playing. onDone fires when it ends/fails.
export function say(idOrGroup, { interrupt = true, minGapMs = 900, delayMs = 0, volume = 0.95, onDone } = {}) {
  if (!voiceEnabled()) return false;
  const now = Date.now();
  if (lastSpokenAt[idOrGroup] && now - lastSpokenAt[idOrGroup] < minGapMs) return false;
  const kudos = KUDOS.test(idOrGroup);
  if (kudos && now - lastKudosAt < KUDOS_GAP_MS) return false;
  const line = resolve(idOrGroup);
  if (!line || missing.has(line.id)) return false;
  if (current && !current.ended && !interrupt) return false;
  lastSpokenAt[idOrGroup] = now;
  if (kudos) lastKudosAt = now;

  const play = () => {
    stopVoice();
    const a = new Audio(`${BASE}${line.id}.mp3?v=${VOICE_VERSION}`);
    a.volume = volume;
    let done = false;
    const finish = (ok) => { if (done) return; done = true; if (current === a) current = null; onDone?.(ok); };
    a.onerror = () => { missing.add(line.id); finish(false); };
    a.onended = () => finish(true);
    current = a;
    a.play().catch(() => finish(false));
  };
  if (!audioUnlocked()) { deferUntilGesture(play); return true; }
  if (delayMs > 0) setTimeout(play, delayMs); else play();
  return true;
}

// Before the kid's first tap (the "Tap to Start the Music" gate) browsers
// refuse to play audio. Hold the latest line and fire it on that first tap.
function audioUnlocked() {
  try { return sessionStorage.getItem('jma_audio_unlocked_v1') === '1'; } catch (_) { return true; }
}
let deferred = null;
function deferUntilGesture(play) {
  const first = !deferred;
  deferred = play;
  if (!first) return;
  const handler = () => { const p = deferred; deferred = null; if (p) setTimeout(p, 350); };
  document.addEventListener('pointerdown', handler, { once: true, capture: true });
}

export function voiceFileUrl(id) { return `${BASE}${id}.mp3`; }
