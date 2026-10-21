// Beat Lab audio engine — loads & plays every Beat Lab voice (drums, scratch
// FX, and the melodic instruments: sax, bass, piano, guitar power chords).
//
// Melodic notes are GATED: each note gets a gain envelope whose length is
// passed in by the sequencer (derived from the gap to the note's next hit),
// so notes don't ring their full sample length. Single-voice instruments
// (sax, bass, guitar) are MONOPHONIC — a new note fast-fades the previous one
// so they never stack two notes. Piano is polyphonic (chords allowed). Drums
// stay full one-shots. Everything routes through the shared master node so the
// MP3 recorder captures it.
import { useCallback, useRef } from 'react';

const noteFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const DRUM_FILES = {
  kick: 'assets/audio/Bass drum - kick.mp3',
  snare: 'assets/audio/Snare.mp3',
  hihat: 'assets/audio/Hi Hat closed.mp3',
  crash: 'assets/audio/Crash cymbal.mp3',
  push: 'assets/audio/scratch-push.mp3',
  pushpull: 'assets/audio/scratch-push-pull.mp3',
};

const SAX_NOTES = ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'];
const BASS_NOTES = ['A2','B2','C3','D3','E3','F3','G3','A3','B3','C4'];
const PIANO_NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6'];

const MELODY_FILES = {
  sax: SAX_NOTES.reduce((m, n) => { m[n] = `assets/audio/sax/${n}.mp3`; return m; }, {}),
  bass: BASS_NOTES.reduce((m, n) => { m[n] = `assets/audio/bass/${n}.mp3`; return m; }, {}),
  piano: PIANO_NOTES.reduce((m, n) => { m[n] = `assets/audio/${n}.mp3`; return m; }, {}),
};

const GUITAR_SEMITONES = [
  { midi: 48, file: 'C3.mp3' },  { midi: 49, file: 'Db3.mp3' }, { midi: 50, file: 'D3.mp3' },
  { midi: 51, file: 'Eb3.mp3' }, { midi: 52, file: 'E3.mp3' },  { midi: 53, file: 'F3.mp3' },
  { midi: 54, file: 'Gb3.mp3' }, { midi: 55, file: 'G3.mp3' },  { midi: 56, file: 'Ab3.mp3' },
  { midi: 57, file: 'A3.mp3' },  { midi: 58, file: 'Bb3.mp3' }, { midi: 59, file: 'B3.mp3' },
  { midi: 60, file: 'C4.mp3' },  { midi: 61, file: 'Db4.mp3' }, { midi: 62, file: 'D4.mp3' },
  { midi: 63, file: 'Eb4.mp3' }, { midi: 64, file: 'E4.mp3' },  { midi: 65, file: 'F4.mp3' },
  { midi: 66, file: 'Gb4.mp3' }, { midi: 67, file: 'G4.mp3' },  { midi: 68, file: 'Ab4.mp3' },
  { midi: 69, file: 'A4.mp3' },  { midi: 70, file: 'Bb4.mp3' }, { midi: 71, file: 'B4.mp3' },
  { midi: 72, file: 'C5.mp3' },  { midi: 74, file: 'D5.mp3' },  { midi: 76, file: 'E5.mp3' },
].map((s) => ({ ...s, freq: noteFreq(s.midi) }));

export const GUITAR_CHORDS = {
  Em: [82.41, 123.47, 164.81],
  F:  [87.31, 130.81, 174.61],
  G:  [98.00, 146.83, 196.00],
  Am: [110.00, 164.81, 220.00],
  C:  [130.81, 196.00, 261.63],
  Dm: [146.83, 220.00, 293.66],
};

function nearestGuitar(freq) {
  let best = GUITAR_SEMITONES[0], bestDist = Infinity;
  for (const s of GUITAR_SEMITONES) {
    const d = Math.abs(Math.log2(freq / s.freq));
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best;
}

// Instruments that play one note/chord at a time (a new one cuts the previous).
// Only guitar is mono — stacking two power chords sounds muddy. Sax/bass/piano
// are polyphonic so kids can play notes two-at-a-time.
const MONO = new Set(['guitar']);

export default function useBeatLabAudio(getAudioGraph, initAudioContext) {
  const buffersRef = useRef({});
  const loadedRef = useRef(new Set());
  const activeRef = useRef({});   // inst -> [{ src, g }] currently sounding (mono voices)

  const decode = useCallback(async (ctx, url) => {
    const resp = await fetch(url);
    const arr = await resp.arrayBuffer();
    return ctx.decodeAudioData(arr);
  }, []);

  const loadMap = useCallback(async (prefix, fileMap) => {
    if (loadedRef.current.has(prefix)) return;
    loadedRef.current.add(prefix);
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) { loadedRef.current.delete(prefix); return; }
    await Promise.all(Object.entries(fileMap).map(async ([note, url]) => {
      try { buffersRef.current[`${prefix}:${note}`] = await decode(graph.ctx, url); }
      catch (e) { /* missing sample — silent */ }
    }));
  }, [getAudioGraph, decode]);

  const preloadDrums = useCallback(() => loadMap('drum', DRUM_FILES), [loadMap]);

  const preloadInstrument = useCallback((inst) => {
    if (inst === 'guitar') {
      const map = GUITAR_SEMITONES.reduce((m, s) => { m[s.file.replace('.mp3', '')] = `assets/audio/guitar-crunch/${s.file}`; return m; }, {});
      return loadMap('gtr', map);
    }
    if (MELODY_FILES[inst]) return loadMap(inst, MELODY_FILES[inst]);
    return Promise.resolve();
  }, [loadMap]);

  // A pitched note with a gain envelope: quick attack, hold, then a short
  // release so the note lasts ~durationMs instead of the whole sample.
  const startVoice = useCallback((ctx, masterNode, buffer, { rate = 1, gain = 0.8, durationMs = 600, startAt = 0, attack = 0.006, at }) => {
    if (!buffer) return null;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    const t = (at ?? ctx.currentTime) + startAt;
    const dur = Math.max(0.12, durationMs / 1000);
    const atk = Math.min(attack, dur * 0.4);
    const tail = 0.22; // only fades at the very END (last note); mid-line notes are cut by the next note's cross-fade
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + atk);
    // Hold FULL volume through the whole note so a line stays connected — the
    // next note's cross-fade (cutVoice) takes over before this ever decays.
    g.gain.setValueAtTime(gain, t + dur + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05 + tail);
    src.connect(g); g.connect(masterNode);
    src.start(t);
    try { src.stop(t + dur + 0.05 + tail + 0.03); } catch (_) {}
    return { src, g, gain };
  }, []);

  // Fast-fade a mono voice so a new note overlaps it (legato), not a hard cut.
  // `at` lets a scheduled note cut its predecessor at the exact future time.
  const cutVoice = useCallback((ctx, v, at) => {
    if (!v) return;
    const now = at ?? ctx.currentTime;
    try {
      v.g.gain.cancelScheduledValues(now);
      v.g.gain.setValueAtTime(Math.max(0.0001, at != null ? v.gain : v.g.gain.value), now);
      v.g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      v.src.stop(now + 0.22);
    } catch (_) {}
  }, []);

  const playDrum = useCallback((id, when) => {
    if (initAudioContext) initAudioContext();
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const buffer = buffersRef.current[`drum:${id}`];
    if (!buffer) return;
    const { ctx, masterNode } = graph;
    const gainMap = { kick: 0.95, snare: 0.85, hihat: 0.7, crash: 0.7, push: 0.8, pushpull: 0.8 };
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer;
    const t = when ?? ctx.currentTime;
    g.gain.setValueAtTime(gainMap[id] ?? 0.8, t);
    src.connect(g); g.connect(masterNode);
    src.start(t);
  }, [getAudioGraph, initAudioContext]);

  const playNote = useCallback((inst, note, durationMs = 600, when) => {
    if (initAudioContext) initAudioContext();
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const { ctx, masterNode } = graph;
    const at = when ?? ctx.currentTime;
    const mono = MONO.has(inst);
    if (mono && activeRef.current[inst]) {
      activeRef.current[inst].forEach((v) => cutVoice(ctx, v, when));
      activeRef.current[inst] = [];
    }
    const created = [];
    if (inst === 'guitar') {
      const freqs = GUITAR_CHORDS[note];
      if (!freqs) return;
      freqs.forEach((f, i) => {
        const s = nearestGuitar(f);
        const v = startVoice(ctx, masterNode, buffersRef.current[`gtr:${s.file.replace('.mp3', '')}`], { rate: f / s.freq, gain: 0.5 - i * 0.03, durationMs, startAt: i * 0.015, attack: 0.008, at });
        if (v) created.push(v);
      });
    } else {
      // Softer onsets on wind/keys so a mono line flows like one breath
      // instead of each note sounding re-tongued.
      const gainMap = { sax: 0.8, bass: 0.95, piano: 0.75 };
      const attackMap = { sax: 0.055, bass: 0.014, piano: 0.004 };
      const v = startVoice(ctx, masterNode, buffersRef.current[`${inst}:${note}`], { gain: gainMap[inst] ?? 0.8, durationMs, attack: attackMap[inst] ?? 0.01, at });
      if (v) created.push(v);
    }
    if (mono) activeRef.current[inst] = created;
  }, [getAudioGraph, initAudioContext, startVoice, cutVoice]);

  // Cut any still-sounding mono voices (called when the loop stops).
  const releaseAll = useCallback(() => {
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const { ctx } = graph;
    Object.values(activeRef.current).forEach((arr) => (arr || []).forEach((v) => cutVoice(ctx, v)));
    activeRef.current = {};
  }, [getAudioGraph, cutVoice]);

  return { preloadDrums, preloadInstrument, playDrum, playNote, releaseAll };
}
