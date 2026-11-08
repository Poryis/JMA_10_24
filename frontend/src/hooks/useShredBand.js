// useShredBand — the Shred Legend backing band. Uses the app's OWN recorded
// drum samples (Bass drum, Snare, Hi-Hat, Crash) and a bass voiced from the
// app's clean-guitar sample pitched down an octave, so it sounds like the
// JMA world — not generic synth. One song ("Giant Stomp") keeps the punchy
// synth kit on purpose for variety. Everything is scheduled on a Web-Audio
// lookahead clock so it stays perfectly in time, and every song's chords live
// in A-minor to match the guitar's pentatonic Notes strip.

import { useCallback, useEffect, useRef } from 'react';

const SEC = (bpm) => 60 / bpm;
const STEPS_PER_BAR = 16;
const BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * BARS; // 64

// A-minor friendly chords. Roots are NOTE NAMES mapped to the uploaded bass
// samples (A2..A3), so the bass is the real recorded instrument — no pitch
// shifting. Each song cycles 4 chords, one per bar.
export const SONGS = [
  { name: 'Garage Stomp',    bpm: 96,  style: 'rock',     kit: 'samples', roots: ['A', 'F', 'C', 'G'] },
  { name: 'Surf Riot',       bpm: 126, style: 'surf',     kit: 'samples', roots: ['A', 'C', 'G', 'F'] },
  { name: "Berto's Barn Burner", bpm: 82,  style: 'halftime', kit: 'synth',   roots: ['A', 'G', 'F', 'G'] },
  { name: "Finn's Face Melter", bpm: 168, style: 'punk',     kit: 'samples', roots: ['A', 'A', 'F', 'G'] },
  { name: 'Alley Cat Strut', bpm: 104, style: 'rock',     kit: 'samples', roots: ['A', 'F', 'G', 'C'] },
];

const DRUM_URLS = {
  kick:  'assets/audio/Bass drum - kick.mp3',
  snare: 'assets/audio/Snare.mp3',
  hihat: 'assets/audio/Hi Hat closed.mp3',
  crash: 'assets/audio/Crash cymbal.mp3',
};
// Recorded bass notes (one low octave) keyed by note name.
const BASS_URLS = {
  A: 'assets/audio/bass/A2.mp3',
  B: 'assets/audio/bass/B2.mp3',
  C: 'assets/audio/bass/C3.mp3',
  D: 'assets/audio/bass/D3.mp3',
  E: 'assets/audio/bass/E3.mp3',
  F: 'assets/audio/bass/F3.mp3',
  G: 'assets/audio/bass/G3.mp3',
};

function noiseBuffer(ctx) {
  const len = Math.floor(ctx.sampleRate * 0.3);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export default function useShredBand(getAudioGraph, initAudioContext) {
  const ctxRef = useRef(null);
  const outRef = useRef(null);
  const noiseRef = useRef(null);
  const buffersRef = useRef({});        // decoded samples
  const loadedRef = useRef(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const stepRef = useRef(0);
  const playingRef = useRef(false);
  const songRef = useRef(SONGS[0]);
  const stepSecRef = useRef(SEC(96) / 4);

  // ---- load the app's own samples (idempotent) ----
  const preload = useCallback(async () => {
    if (loadedRef.current) return;
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const ctx = graph.ctx;
    const all = {
      ...Object.fromEntries(Object.entries(DRUM_URLS).map(([k, u]) => [`drum_${k}`, u])),
      ...Object.fromEntries(Object.entries(BASS_URLS).map(([k, u]) => [`bass_${k}`, u])),
    };
    try {
      const entries = await Promise.all(
        Object.entries(all).map(async ([k, url]) => {
          const res = await fetch(url);
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr);
          return [k, buf];
        }),
      );
      entries.forEach(([k, buf]) => { buffersRef.current[k] = buf; });
      loadedRef.current = true;
    } catch (_) { /* fall back to synth */ }
  }, [getAudioGraph]);

  const playSample = useCallback((buf, t, gain = 1, rate = 1, dur = null) => {
    if (!buf) return;
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g); g.connect(out);
    src.start(t);
    if (dur) { try { src.stop(t + dur); } catch (_) {} }
  }, []);

  // ---- synthesized kit (fallback + 'Giant Stomp') ----
  const synthKick = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(out); osc.start(t); osc.stop(t + 0.22);
  }, []);
  const synthSnare = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource(); src.buffer = noiseRef.current;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(bp); bp.connect(g); g.connect(out); src.start(t); src.stop(t + 0.16);
    const osc = ctx.createOscillator(); const g2 = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(180, t);
    g2.gain.setValueAtTime(0.25, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g2); g2.connect(out); osc.start(t); osc.stop(t + 0.11);
  }, []);
  const synthHat = useCallback((t, open = false) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource(); src.buffer = noiseRef.current;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); const dur = open ? 0.12 : 0.04;
    g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(g); g.connect(out); src.start(t); src.stop(t + dur + 0.02);
  }, []);

  // ---- drum voices route to samples or synth depending on the song's kit ----
  const kick = useCallback((t) => {
    const b = buffersRef.current.drum_kick;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.9);
    else synthKick(t);
  }, [playSample, synthKick]);
  const snare = useCallback((t) => {
    const b = buffersRef.current.drum_snare;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.75);
    else synthSnare(t);
  }, [playSample, synthSnare]);
  const hat = useCallback((t, open = false) => {
    const b = buffersRef.current.drum_hihat;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, open ? 0.45 : 0.3);
    else synthHat(t, open);
  }, [playSample, synthHat]);
  const crash = useCallback((t) => {
    const b = buffersRef.current.drum_crash;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.45);
  }, [playSample]);

  // ---- bass: the uploaded recorded bass notes, played at true pitch ----
  const synthBass = useCallback((t, freq, dur = 0.3) => {
    const ctx = ctxRef.current, out = outRef.current;
    const sub = ctx.createOscillator(); const body = ctx.createOscillator();
    sub.type = 'sine'; sub.frequency.setValueAtTime(freq, t);
    body.type = 'triangle'; body.frequency.setValueAtTime(freq, t);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.0;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.6, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(lp); body.connect(lp); lp.connect(g); g.connect(out);
    sub.start(t); body.start(t); sub.stop(t + dur + 0.05); body.stop(t + dur + 0.05);
  }, []);

  // SYNTH_BASS_FREQ: fallback frequency per note name if samples absent.
  const SYNTH_FREQ = { A: 110.0, B: 123.47, C: 130.81, D: 146.83, E: 164.81, F: 174.61, G: 196.0 };
  const bass = useCallback((t, name, dur = 0.3) => {
    const b = buffersRef.current[`bass_${name}`];
    if (b) {
      const ctx = ctxRef.current, out = outRef.current;
      const src = ctx.createBufferSource(); src.buffer = b;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, t); g.gain.linearRampToValueAtTime(0.95, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
      src.connect(g); g.connect(out);
      src.start(t); try { src.stop(t + dur + 0.35); } catch (_) {}
    } else {
      synthBass(t, SYNTH_FREQ[name] || 110, dur);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthBass]);

  const scheduleStep = useCallback((step, t) => {
    const song = songRef.current;
    const inBar = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const root = song.roots[bar];

    if (song.style === 'punk') {
      // Fast driving punk: hats on 8ths, kick 1 & 3 + pickup, snare 2 & 4,
      // crash on the downbeat of bar 1.
      if (inBar % 2 === 0) hat(t);
      if (inBar === 0 || inBar === 8 || inBar === 14) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (step === 0) crash(t);
      if (inBar === 0 || inBar === 8) bass(t, root, 0.26);
      if (inBar === 4 || inBar === 12) bass(t, root, 0.2);
    } else if (song.style === 'surf') {
      hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 2 || inBar === 10) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (step === 0) crash(t);
      if (inBar === 0 || inBar === 8) bass(t, root, 0.3);
      if (inBar === 6 || inBar === 14) bass(t, root, 0.18);
    } else if (song.style === 'halftime') {
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 10) kick(t);
      if (inBar === 8) snare(t);
      if (inBar === 0) bass(t, root, 0.55);
      if (inBar === 8) bass(t, root, 0.4);
      if (inBar === 12) bass(t, root, 0.22);
    } else {
      // rock
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 11) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (inBar === 0) bass(t, root, 0.4);
      if (inBar === 8) bass(t, root, 0.3);
      if (inBar === 11) bass(t, root, 0.2);
      if (inBar === 14) bass(t, root, 0.2);
    }
  }, [hat, kick, snare, crash, bass]);

  const tick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return;
    const lookahead = 0.12;
    while (nextStepTimeRef.current < ctx.currentTime + lookahead) {
      scheduleStep(stepRef.current % TOTAL_STEPS, nextStepTimeRef.current);
      nextStepTimeRef.current += stepSecRef.current;
      stepRef.current += 1;
    }
  }, [scheduleStep]);

  const start = useCallback((songIndex = 0) => {
    if (initAudioContext) initAudioContext();
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    ctxRef.current = graph.ctx;
    outRef.current = graph.masterNode;
    if (!noiseRef.current) noiseRef.current = noiseBuffer(graph.ctx);
    if (!loadedRef.current) preload();
    const song = SONGS[songIndex % SONGS.length];
    songRef.current = song;
    stepSecRef.current = SEC(song.bpm) / 4;
    const t0 = graph.ctx.currentTime + 0.12;
    startTimeRef.current = t0;
    nextStepTimeRef.current = t0;
    stepRef.current = 0;
    playingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 25);
    tick();
  }, [getAudioGraph, initAudioContext, preload, tick]);

  // Speed the groove up/down mid-song. Re-anchors the start time to the next
  // scheduled step so the 8th-note grid used for scoring stays aligned.
  const setTempoScale = useCallback((scale) => {
    const song = songRef.current;
    if (!song || !playingRef.current) return;
    const newStep = SEC(song.bpm * scale) / 4;
    startTimeRef.current = nextStepTimeRef.current - stepRef.current * newStep;
    stepSecRef.current = newStep;
  }, []);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const nearestEighthOffsetMs = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return 9999;
    const eighth = stepSecRef.current * 2;
    const elapsed = ctx.currentTime - startTimeRef.current;
    const nearest = Math.round(elapsed / eighth) * eighth;
    return Math.abs(elapsed - nearest) * 1000;
  }, []);

  // Which 8th-note of the groove we're nearest to (integer index). Used to
  // cap scoring at one hit per beat so button-mashing can't fill the meter.
  const nearestEighthIndex = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return -1;
    const eighth = stepSecRef.current * 2;
    const elapsed = ctx.currentTime - startTimeRef.current;
    return Math.round(elapsed / eighth);
  }, []);

  const beatPhase = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return -1;
    const beat = stepSecRef.current * 4;
    const elapsed = ctx.currentTime - startTimeRef.current;
    if (elapsed < 0) return -1;
    return (elapsed % beat) / beat;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const apiRef = useRef(null);
  if (!apiRef.current) apiRef.current = {};
  Object.assign(apiRef.current, {
    start, stop, preload, nearestEighthOffsetMs, nearestEighthIndex, beatPhase,
    beatMs: () => stepSecRef.current * 4000,
    setTempoScale,
    isPlaying: () => playingRef.current,
    songs: SONGS,
  });
  return apiRef.current;
}
