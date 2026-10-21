import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Plus, Minus, Circle, Download, Drum, Music2, ChevronLeft, ChevronRight, Eraser, Headphones } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import useAudio from '../hooks/useAudio';
import useBeatLabAudio from '../hooks/useBeatLabAudio';
import useMp3Recorder from '../hooks/useMp3Recorder';
import usePlayer from '../hooks/usePlayer';
import { earnSticker, earnAchievement, earnAchievementUpTo } from '../hooks/useStickers';
import { reportQuestEvent } from '../hooks/useDailyQuests';
import { say } from '../lib/voice';
import { createStepScheduler } from '../lib/stepScheduler';
import useVoiceTagline from '../hooks/useVoiceTagline';
import { saveBeat, loadSavedBeats, renameSavedBeat } from '../hooks/useSavedBeats';

const DEFAULT_BPM = 100;

// --- Rhythm lanes (fixed, always these six) ---
const DRUMS = [
  { key: 'kick',     label: 'Kick',      color: '#E74C3C' },
  { key: 'snare',    label: 'Snare',     color: '#3498DB' },
  { key: 'hihat',    label: 'Hat',       color: '#F1C40F' },
  { key: 'crash',    label: 'Crash',     color: '#E67E22' },
  { key: 'push',     label: 'Push',      color: '#16A085' },
  { key: 'pushpull', label: 'Push/Pull', color: '#2ECC71' },
];

const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'So', A: 'La', B: 'Ti' };

// --- Melodic instruments. Each note is its own lane; `windows` chunks the
// range into one-octave screens so little kids only ever see ~7-8 lanes. ---
const INSTRUMENTS = {
  sax: {
    label: 'Sax', color: '#FF9500',
    windows: [
      ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'],
      ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    ],
    winLabels: ['Low', 'High'],
  },
  bass: {
    label: 'Bass', color: '#8E44AD',
    windows: [['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']],
    winLabels: [''],
  },
  piano: {
    label: 'Piano', color: '#4285F4',
    windows: [
      ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'],
    ],
    winLabels: ['Low', 'High'],
  },
  guitar: {
    label: 'Guitar', color: '#E74C3C', chords: true,
    windows: [['Em', 'F', 'G', 'Am', 'C', 'Dm']],
    winLabels: [''],
  },
};
const MELODY_ORDER = ['sax', 'bass', 'piano', 'guitar'];

// 16-char strings -> step arrays ('x' = hit).
const P = (s) => s.split('').map((c) => (c === 'x' ? 1 : 0));
// Build an N-step pattern from hit positions (handy for 2-bar / 32-step presets).
const H = (len, pos) => Array.from({ length: len }, (_, i) => (pos.includes(i) ? 1 : 0));

// Steps until the next hit of ANY of the instrument's lanes (wrapping the loop).
// Returns `total` when the instrument never hits again, so a lone note/chord can
// be held for the whole measure. Drives note length for all melodic voices.
const NOTE_CAP_STEPS = 8;
function stepsUntilNextForInstrument(gridObj, inst, from, total) {
  const prefix = `${inst}:`;
  for (let d = 1; d <= total; d++) {
    const s = (from + d) % total;
    for (const k in gridObj) { if (k.startsWith(prefix) && gridObj[k][s]) return d; }
  }
  return total;
}

const LOOP_PRESETS = {
  'Basic Beat': {
    kick:  P('x...x...x...x...'),
    snare: P('....x.......x...'),
    hihat: P('x.x.x.x.x.x.x.x.'),
  },
  'Four on Floor': {
    kick:  P('x...x...x...x...'),
    snare: P('....x.......x...'),
    hihat: P('..x...x...x...x.'),
  },
  'Hip Hop': {
    kick:  H(32, [0, 6, 16, 19, 22]),
    snare: H(32, [4, 12, 20, 28]),
    hihat: H(32, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]),
    push:  H(32, [31]),
  },
  'Sax Hook': {
    // Syncopated C-pentatonic lick (no corny F/B): G A G E G E D
    'sax:G3': P('x.....x...x.....'),
    'sax:A3': P('...x............'),
    'sax:E3': P('........x...x...'),
    'sax:D3': P('..............x.'),
    kick:  P('x...x...x...x...'),
    snare: P('....x.......x...'),
    hihat: P('x.x.x.x.x.x.x.x.'),
  },
  'Smooth Jazz': {
    // 2-bar I-vi-ii-V turnaround, each 7th chord held 2 beats
    'piano:C4': H(32, [0]),
    'piano:E4': H(32, [0]),
    'piano:G4': H(32, [0, 24]),
    'piano:B4': H(32, [0, 24]),
    'piano:A4': H(32, [8, 16]),
    'piano:C5': H(32, [8, 16]),
    'piano:E5': H(32, [8]),
    'piano:G5': H(32, [8]),
    'piano:D4': H(32, [16]),
    'piano:F4': H(32, [16]),
    'piano:D5': H(32, [24]),
    'piano:F5': H(32, [24]),
    // walking upright bass: C E A C D F G B
    'bass:C3': H(32, [0, 12]),
    'bass:E3': H(32, [4]),
    'bass:A2': H(32, [8]),
    'bass:D3': H(32, [16]),
    'bass:F3': H(32, [20]),
    'bass:G3': H(32, [24]),
    'bass:B3': H(32, [28]),
    // breathy bari-sax guide line
    'sax:G3': H(32, [0]),
    'sax:A3': H(32, [8]),
    'sax:F3': H(32, [16]),
    'sax:D3': H(32, [24]),
    kick:  H(32, [0, 16]),
    hihat: H(32, [0, 4, 8, 12, 16, 20, 24, 28]),
  },
  'Funky Bass': {
    'bass:C3': P('x..x....x..x....'),
    'bass:E3': P('......x.........'),
    'bass:G3': P('............x...'),
    'bass:A3': P('..............x.'),
    kick:  P('x..x....x..x....'),
    snare: P('....x.......x...'),
    hihat: P('x.x.x.x.x.x.x.x.'),
    pushpull: P('..............x.'),
  },
  'Rock Power': {
    // 2 bars, one power chord per bar so they don't rush: Em then C
    'guitar:Em': H(32, [0]),
    'guitar:C':  H(32, [16]),
    kick:  H(32, [0, 4, 8, 12, 16, 20, 24, 28]),
    snare: H(32, [4, 12, 20, 28]),
    crash: H(32, [0]),
  },
  'Scratch Jam': {
    push:     P('x...x...x...x...'),
    pushpull: P('..x...x...x...x.'),
    kick:     P('x.......x.......'),
    hihat:    P('x.x.x.x.x.x.x.x.'),
    'bass:C3': P('x.......x.......'),
  },
};

const MEASURE_OPTIONS = [
  { label: '1 Bar', steps: 16 },
  { label: '2 Bars', steps: 32 },
  { label: '4 Bars', steps: 64 },
];

// Parse a voice key into a friendly lane label.
function laneInfo(key) {
  if (!key.includes(':')) {
    const d = DRUMS.find((x) => x.key === key);
    return { label: d?.label || key, sub: '', color: d?.color || '#888' };
  }
  const [inst, note] = key.split(':');
  const cfg = INSTRUMENTS[inst];
  if (cfg?.chords) return { label: note, sub: 'chord', color: cfg.color };
  const letter = note.replace(/[0-9]/g, '');
  const oct = note.replace(/[^0-9]/g, '');
  return { label: SOLFEGE[letter] || letter, sub: `${letter}${oct}`, color: cfg?.color || '#888' };
}

// Map a Beat Lab voice to a saved-beat track the Jam Session re-player can read
// (it only knows 'drum'/'scratch'/'bell'). Best-effort: melody -> bell letter.
function toSavedTrack(key, steps) {
  if (!key.includes(':')) {
    const note = key === 'push' ? 'scratchPush' : key === 'pushpull' ? 'scratchPushPull' : key;
    const type = key === 'push' || key === 'pushpull' ? 'scratch' : 'drum';
    return { id: key, type, note, steps };
  }
  const [inst, note] = key.split(':');
  if (INSTRUMENTS[inst]?.chords) return { id: key, type: 'bell', note: note.replace('m', '').replace(/[0-9]/g, '') || 'C', steps };
  const letter = note.replace(/[0-9]/g, '');
  return { id: key, type: 'bell', note: letter === 'C' && note.includes('5') ? 'High C' : letter, steps };
}

// ---------------------------------------------------------------------------
// Memoized lane row — depends only on its own pattern + mute, NOT on the
// playhead, so the moving playhead doesn't re-render every cell each tick.
// ---------------------------------------------------------------------------
const StepRow = memo(function StepRow({ voiceKey, color, steps, totalSteps, muted, scroll, onToggle }) {
  return (
    <div className="flex" data-testid={`track-${voiceKey}`} style={{ height: 'var(--lane-h)' }}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const active = steps[i];
        const beatStart = i % 4 === 0;
        return (
          <button
            key={i}
            data-testid={`cell-${voiceKey}-${i}`}
            onPointerDown={(e) => { e.preventDefault(); onToggle(voiceKey, i); }}
            className="beatlab-cell"
            style={{
              flex: scroll ? 'none' : 1,
              width: scroll ? 32 : undefined,
              marginLeft: beatStart && i > 0 ? 5 : 1,
              background: active
                ? color
                : (beatStart ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.045)'),
              boxShadow: active ? `inset 0 0 0 2px rgba(255,255,255,0.35), 0 0 10px ${color}99` : 'none',
              opacity: muted ? 0.4 : 1,
            }}
          />
        );
      })}
    </div>
  );
});

function LoopStudioPage() {
  useVoiceTagline('chunk.tag.beatlab');
  const navigate = useNavigate();
  const { getAudioGraph, initAudioContext } = useAudio();
  const lab = useBeatLabAudio(getAudioGraph, initAudioContext);
  const recorder = useMp3Recorder(getAudioGraph);
  const { player } = usePlayer();
  const playerName = player?.displayName || '';

  const [tab, setTab] = useState('drums');
  const [melodyInst, setMelodyInst] = useState('sax');
  const [octaves, setOctaves] = useState({ sax: 0, bass: 0, piano: 0, guitar: 0 });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [totalSteps, setTotalSteps] = useState(16);
  const [grid, setGrid] = useState({});
  const [muted, setMuted] = useState(new Set());

  const schedulerRef = useRef(null);
  const gridRef = useRef(grid);
  const mutedRef = useRef(muted);
  const totalStepsRef = useRef(totalSteps);
  const bpmRef = useRef(bpm);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { totalStepsRef.current = totalSteps; }, [totalSteps]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Preload samples: drums + sax immediately, others on demand.
  useEffect(() => { lab.preloadDrums(); lab.preloadInstrument('sax'); }, [lab]);
  useEffect(() => { lab.preloadInstrument(melodyInst); }, [lab, melodyInst]);

  const IDLE_MESSAGES = ['READY?', 'TAP PADS', 'MAKE BEATS', 'LETS JAM'];
  const [idleMsgIndex, setIdleMsgIndex] = useState(0);
  useEffect(() => {
    if (isPlaying) return;
    const t = setInterval(() => setIdleMsgIndex((i) => (i + 1) % IDLE_MESSAGES.length), 1600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const playVoice = useCallback((key) => {
    if (key.includes(':')) { const [inst, note] = key.split(':'); lab.playNote(inst, note); }
    else lab.playDrum(key);
  }, [lab]);

  const playStep = useCallback((step, when) => {
    const g = gridRef.current;
    const m = mutedRef.current;
    const msPerStep = (60 / bpmRef.current / 4) * 1000;
    Object.entries(g).forEach(([key, steps]) => {
      if (m.has(key)) return;
      if (!steps[step]) return;
      if (key.includes(':')) {
        const [inst, note] = key.split(':');
        const total = totalStepsRef.current;
        // Every melodic note rings until the instrument's next hit; guitar lets
        // a lone chord fill the whole measure, others cap at 2 beats.
        const gap = stepsUntilNextForInstrument(g, inst, step, total);
        const cap = inst === 'guitar' ? total : NOTE_CAP_STEPS;
        const durationMs = Math.min(gap, cap) * msPerStep;
        lab.playNote(inst, note, durationMs, when);
      } else {
        lab.playDrum(key, when);
      }
    });
  }, [lab]);

  const stopPlayback = useCallback(() => {
    schedulerRef.current?.stop();
    schedulerRef.current = null;
    lab.releaseAll();
    setIsPlaying(false);
    setCurrentStep(-1);
  }, [lab]);

  const startPlayback = useCallback(() => {
    const ctx = initAudioContext();
    setIsPlaying(true);
    earnAchievement('beat', 'cadet');
    const activeCount = Object.values(gridRef.current).filter((s) => s.some(Boolean)).length;
    reportQuestEvent('beat_loop', { tracks: activeCount });
    say(activeCount >= 3 ? 'chunk.perfect' : 'chunk.correct', { minGapMs: 8000 });
    if (activeCount >= 3) earnAchievementUpTo('beat', 'pro');
    if (activeCount >= 4 && bpm >= 140) earnAchievementUpTo('beat', 'master');
    try {
      const n = parseInt(localStorage.getItem('jma_loops_played_v1') || '0', 10) + 1;
      localStorage.setItem('jma_loops_played_v1', String(n));
      if (n >= 3) earnSticker('fit_charlie_surf');
    } catch (_) {}
    if (bpm >= 140) earnSticker('fit_charlie_disco');
    // Audio-clock scheduler: BPM / length changes are picked up live via refs.
    schedulerRef.current?.stop();
    schedulerRef.current = createStepScheduler({
      ctx,
      getSecPerStep: () => 60 / bpmRef.current / 4,
      getTotalSteps: () => totalStepsRef.current,
      onSchedule: playStep,
      onStepUI: setCurrentStep,
    });
    schedulerRef.current.start(0);
  }, [bpm, initAudioContext, playStep]);

  useEffect(() => () => { schedulerRef.current?.stop(); }, []);

  const toggleCell = useCallback((key, step) => {
    setGrid((prev) => {
      const next = { ...prev };
      const row = [...(next[key] || new Array(totalStepsRef.current).fill(0))];
      const was = row[step];
      row[step] = was ? 0 : 1;
      next[key] = row;
      if (!was) playVoice(key);
      return next;
    });
  }, [playVoice]);

  // --- recording / saving ---
  const [savedBeatName, setSavedBeatName] = useState(null);
  const [savedBeatId, setSavedBeatId] = useState(null);
  const [namingBeat, setNamingBeat] = useState(null);
  const [beatNameInput, setBeatNameInput] = useState('');

  const startRecording = useCallback(() => {
    initAudioContext();
    setSavedBeatName(null);
    setNamingBeat(null);
    recorder.start();
    if (!isPlaying) startPlayback();
  }, [initAudioContext, recorder, isPlaying, startPlayback]);

  const stopRecording = useCallback(async () => {
    stopPlayback();
    await recorder.stop();
    const tracks = Object.entries(gridRef.current)
      .filter(([key, steps]) => !mutedRef.current.has(key) && steps.some(Boolean))
      .map(([key, steps]) => toSavedTrack(key, steps));
    if (tracks.length === 0) return;
    const n = loadSavedBeats().length + 1;
    const name = `${playerName ? `${playerName}'s ` : ''}Beat ${n}`;
    const beat = saveBeat({ name, bpm, totalSteps: totalStepsRef.current, tracks });
    setNamingBeat(beat);
    setBeatNameInput('');
  }, [stopPlayback, recorder, playerName, bpm]);

  const togglePlay = useCallback(() => {
    if (recorder.isRecording) { stopRecording(); return; }
    if (isPlaying) stopPlayback(); else startPlayback();
  }, [recorder.isRecording, stopRecording, isPlaying, stopPlayback, startPlayback]);

  const confirmBeatName = useCallback(() => {
    if (!namingBeat) return;
    const name = beatNameInput.trim().slice(0, 24) || namingBeat.name;
    if (name !== namingBeat.name) renameSavedBeat(namingBeat.id, name);
    setSavedBeatName(name);
    setSavedBeatId(namingBeat.id);
    setNamingBeat(null);
  }, [namingBeat, beatNameInput]);

  // Spacebar = play/stop
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  const loadPreset = useCallback((name) => {
    const preset = LOOP_PRESETS[name];
    if (!preset) return;
    // Preload any instruments the preset touches.
    new Set(Object.keys(preset).filter((k) => k.includes(':')).map((k) => k.split(':')[0]))
      .forEach((inst) => lab.preloadInstrument(inst));
    // Grow the grid to fit the preset (e.g. a 32-step preset switches to 2 bars).
    const longest = Math.max(16, ...Object.values(preset).map((s) => s.length));
    const target = longest > 32 ? 64 : longest > 16 ? 32 : 16;
    if (isPlaying) stopPlayback();
    setTotalSteps(target);
    setGrid(() => {
      const next = {};
      Object.entries(preset).forEach(([key, steps]) => {
        const extended = [];
        for (let i = 0; i < target; i++) extended.push(steps[i % steps.length]);
        next[key] = extended;
      });
      return next;
    });
  }, [lab, isPlaying, stopPlayback]);

  // First visit — start with Basic Beat so the grid isn't empty.
  useEffect(() => {
    const KEY = 'jma_beat_lab_first_visit_v2';
    if (typeof window === 'undefined' || localStorage.getItem(KEY)) return;
    const t = setTimeout(() => { try { loadPreset('Basic Beat'); localStorage.setItem(KEY, '1'); } catch (_) {} }, 80);
    return () => clearTimeout(t);
  }, [loadPreset]);

  const clearAll = useCallback(() => setGrid({}), []);

  // Clear only the lanes shown on the current tab (all drums, or the current
  // melodic instrument's notes). The big top Clear still wipes everything.
  const clearPage = useCallback(() => {
    setGrid((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const keep = tab === 'drums' ? !k.includes(':') : k.startsWith(`${melodyInst}:`);
        if (keep) delete next[k];
      });
      return next;
    });
  }, [tab, melodyInst]);

  const toggleMute = useCallback((key) => {
    setMuted((prev) => { const s = new Set(prev); if (s.has(key)) s.delete(key); else s.add(key); return s; });
  }, []);

  const changeMeasures = useCallback((newSteps) => {
    if (isPlaying) stopPlayback();
    setTotalSteps(newSteps);
    setGrid((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, steps]) => {
        const out = [];
        for (let i = 0; i < newSteps; i++) out.push(steps[i % steps.length]);
        next[key] = out;
      });
      return next;
    });
  }, [isPlaying, stopPlayback]);

  // Which lanes are visible for the active tab.
  const instCfg = INSTRUMENTS[melodyInst];
  const octIdx = Math.min(octaves[melodyInst] || 0, (instCfg.windows.length - 1));
  const visibleKeys = useMemo(() => (tab === 'drums'
    ? DRUMS.map((d) => d.key)
    : [...instCfg.windows[octIdx]].reverse().map((n) => `${melodyInst}:${n}`)),
    [tab, melodyInst, octIdx, instCfg]);

  const scroll = totalSteps > 16;
  const playheadPct = currentStep >= 0 ? (currentStep / totalSteps) * 100 : 0;

  // Stable empty-lane array so unused StepRows keep their memo (don't re-render
  // every tick just because `new Array().fill(0)` made a fresh reference).
  const zeros = useMemo(() => new Array(totalSteps).fill(0), [totalSteps]);

  // Preset pills never change — build once.
  const presetButtons = useMemo(() => Object.keys(LOOP_PRESETS).map((name, i) => {
    const colors = ['#FFCC00', '#FF6B6B', '#4CD964', '#61E8DA', '#FF9500', '#AF52DE'];
    const bg = colors[i % colors.length];
    const rot = ((i * 37) % 5) - 2;
    return (
      <button key={name} data-testid={`preset-${name.replace(/\s/g, '-')}`} className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: bg, color: '#0A1626', border: '2px solid #0A1626', boxShadow: '0 2px 0 rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)', transform: `rotate(${rot}deg)` }} onClick={() => loadPreset(name)}>{name}</button>
    );
  }), [loadPreset]);

  // Static beat-marker dots (position is shown by the moving playhead, so these
  // don't depend on currentStep and never rebuild during playback).
  const stepDots = useMemo(() => (
    <div className="flex h-3 items-center">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} style={{ flex: scroll ? 'none' : 1, width: scroll ? 32 : undefined, marginLeft: i % 4 === 0 && i > 0 ? 5 : 1 }} className="flex justify-center">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: i % 4 === 0 ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.14)' }} />
        </div>
      ))}
    </div>
  ), [totalSteps, scroll]);

  // Label column rebuilds only when lanes/mutes change, not on every tick.
  const labelColumn = useMemo(() => visibleKeys.map((key) => {
    const info = laneInfo(key);
    const isMuted = muted.has(key);
    return (
      <div key={`lbl-${key}`} className="flex items-center gap-1.5" style={{ height: 'var(--lane-h)' }} data-testid={`track-label-${key}`}>
        <button className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: info.color, boxShadow: isMuted ? 'inset 0 0 6px rgba(0,0,0,0.7)' : `0 0 10px ${info.color}`, opacity: isMuted ? 0.4 : 1, border: '1.5px solid rgba(0,0,0,0.7)' }} onPointerDown={(e) => { e.preventDefault(); playVoice(key); }} data-testid={`preview-${key}`} title={`Preview ${info.label}`} />
        <button className="flex-1 min-w-0 px-1.5 py-1 rounded-lg text-left leading-none" style={{ background: isMuted ? '#131F30' : '#243854', border: `2px solid ${info.color}` }} onClick={() => toggleMute(key)} data-testid={`mute-${key}`}>
          <span className="block font-black truncate" style={{ color: isMuted ? '#5E7899' : '#E8F4FF', fontSize: 13 }}>{info.label}</span>
          {info.sub && <span className="block font-bold truncate" style={{ color: isMuted ? '#43566e' : info.color, fontSize: 9 }}>{info.sub}</span>}
        </button>
      </div>
    );
  }), [visibleKeys, muted, playVoice, toggleMute]);

  // Lane rows rebuild only when the pattern/lanes/mutes change (grid updates on
  // tap, not on tick), so playback does no per-cell work.
  const laneRows = useMemo(() => visibleKeys.map((key) => (
    <StepRow key={`row-${key}`} voiceKey={key} color={laneInfo(key).color} steps={grid[key] || zeros} totalSteps={totalSteps} muted={muted.has(key)} scroll={scroll} onToggle={toggleCell} />
  )), [visibleKeys, grid, muted, totalSteps, scroll, toggleCell, zeros]);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      data-testid="loop-studio-page"
      style={{ background: 'radial-gradient(circle at 50% 8%, #243B5C 0%, #0A1626 72%)' }}
    >
      <GameHeader title="Beat Lab" showHomeButton={true} backLink={{ to: '/create', label: 'Create' }} />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(97, 232, 218, 0.18) 1.2px, transparent 1.2px)',
          backgroundSize: '26px 26px', opacity: 0.3,
        }}
      />

      <main className="relative pt-20 md:pt-24 pb-6 px-2 md:px-4 beatlab-deck">
        <div
          className="max-w-5xl mx-auto rounded-[28px] border-[3px] p-2.5 md:p-4 relative"
          style={{
            background: 'linear-gradient(180deg, #33507A 0%, #1B2B44 100%)',
            borderColor: '#050C18',
            boxShadow: '0 10px 0 rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.08), inset 0 -6px 0 rgba(0,0,0,0.35)',
          }}
        >
          {/* TRANSPORT */}
          <div
            className="rounded-2xl border-2 p-2 md:p-3 flex flex-wrap items-center gap-2"
            style={{ background: 'linear-gradient(180deg, #1B2A3F 0%, #0F1A2E 100%)', borderColor: '#000' }}
          >
            <motion.button
              data-testid="loop-play-button"
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-base md:text-lg"
              style={{
                backgroundColor: isPlaying ? '#FF3B30' : '#4CD964', color: '#0A1626', border: '3px solid #000',
                boxShadow: '0 5px 0 rgba(0,0,0,0.6), inset 0 -3px 0 rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.45)', minWidth: 118,
              }}
            >
              {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'STOP' : 'PLAY'}
            </motion.button>

            <div
              className="rounded-lg px-3 py-1.5 flex items-center gap-3"
              style={{ background: '#061019', border: '2px solid #000', color: '#61E8DA', fontFamily: 'ui-monospace, Menlo, monospace', boxShadow: 'inset 0 0 12px rgba(97,232,218,0.15)' }}
            >
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[9px] uppercase opacity-70">BPM</span>
                <span className="text-base md:text-lg font-bold tabular-nums">{String(bpm).padStart(3, '0')}</span>
              </div>
              <div className="w-px h-8" style={{ background: '#61E8DA', opacity: 0.3 }} />
              <div className="flex flex-col items-center leading-tight" style={{ minWidth: 80 }}>
                <span className="text-[9px] uppercase opacity-70">{isPlaying ? 'STEP' : 'STATUS'}</span>
                <span className="text-base md:text-lg font-bold tabular-nums">
                  {isPlaying && currentStep >= 0 ? `${String(currentStep + 1).padStart(2, '0')}/${totalSteps}` : IDLE_MESSAGES[idleMsgIndex]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#3E5471', color: '#E8F4FF', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={() => setBpm((b) => Math.max(60, b - 10))} data-testid="bpm-minus"><Minus className="w-4 h-4" /></button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#3E5471', color: '#E8F4FF', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={() => setBpm((b) => Math.min(200, b + 10))} data-testid="bpm-plus"><Plus className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: '#3E5471', border: '2px solid #000' }}>
              {MEASURE_OPTIONS.map((opt) => (
                <button key={opt.steps} data-testid={`measure-${opt.steps}`} onClick={() => changeMeasures(opt.steps)} className="px-2 py-1 rounded text-xs font-black" style={{ background: totalSteps === opt.steps ? '#61E8DA' : 'transparent', color: totalSteps === opt.steps ? '#0A1626' : '#E8F4FF' }}>{opt.label}</button>
              ))}
            </div>

            <button className="h-9 px-3 rounded-lg flex items-center justify-center" style={{ background: '#3E5471', color: '#FF6B6B', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={clearAll} data-testid="clear-all"><span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Clear</span></button>

            <div className="flex-1 min-w-0" />

            <div className="flex items-center gap-1">
              {!recorder.isRecording ? (
                <button data-testid="loop-record-btn" className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs md:text-sm font-black" style={{ background: '#FF3B30', color: '#fff', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={startRecording} disabled={recorder.isProcessing}><Circle className="w-3 h-3 fill-current" /> REC</button>
              ) : (
                <button data-testid="loop-stop-rec-btn" className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs md:text-sm font-black animate-pulse" style={{ background: '#0A1626', color: '#fff', border: '2px solid #FF3B30', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={stopRecording}><Square className="w-3 h-3 fill-current" /> STOP {recorder.secondsLeft}s</button>
              )}
              {recorder.isProcessing && <span className="text-[10px] font-bold opacity-70 text-white">Saving...</span>}
              {namingBeat && !recorder.isRecording && !recorder.isProcessing && (
                <form data-testid="beat-name-form" className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); confirmBeatName(); }}>
                  <input data-testid="beat-name-input" autoFocus maxLength={24} value={beatNameInput} onChange={(e) => setBeatNameInput(e.target.value)} placeholder={`Name it! (${namingBeat.name})`} className="px-2 py-1 rounded-lg text-xs font-bold w-32 md:w-40 outline-none" style={{ background: '#fff', color: '#0A1626', border: '2px solid #FFCC00' }} />
                  <button type="submit" data-testid="beat-name-save" className="px-2 py-1 rounded-lg text-xs font-black" style={{ background: '#FFCC00', color: '#0A1626', border: '2px solid #000', boxShadow: '0 2px 0 rgba(0,0,0,0.55)' }}>Save</button>
                </form>
              )}
              {savedBeatName && !namingBeat && !recorder.isRecording && !recorder.isProcessing && (
                <motion.button type="button" data-testid="loop-jam-on-it" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs md:text-sm font-black whitespace-nowrap touch-manipulation"
                  style={{ background: '#FFCC00', color: '#0A1626', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }}
                  onClick={() => { say('charlie.jam.takeit', { minGapMs: 0 }); try { sessionStorage.setItem('jma_just_saved_beat_v1', '1'); } catch (_) {} navigate(`/free-play?beat=${savedBeatId}`); }}>
                  <Headphones className="w-3.5 h-3.5" /> Jam on it! →
                </motion.button>
              )}
              {recorder.lastMp3Url && !recorder.isRecording && !recorder.isProcessing && (
                <button data-testid="loop-download-mp3" className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs md:text-sm font-black" style={{ background: '#4CD964', color: '#0A1626', border: '2px solid #000', boxShadow: '0 3px 0 rgba(0,0,0,0.55)' }} onClick={() => recorder.download(`my-loop-${Date.now()}.mp3`)}><Download className="w-3 h-3" /> MP3</button>
              )}
            </div>
          </div>

          {/* PRESETS */}
          <div className="mt-2.5 flex gap-2 flex-wrap justify-center">
            {presetButtons}
          </div>

          {/* TAB BAR */}
          <div className="mt-3 flex items-center justify-center">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#0F1A2E', border: '2px solid #000' }}>
              <button data-testid="tab-drums" onClick={() => setTab('drums')} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-colors" style={{ background: tab === 'drums' ? '#61E8DA' : 'transparent', color: tab === 'drums' ? '#0A1626' : '#9DB4CC' }}><Drum className="w-4 h-4" /> Drums</button>
              <button data-testid="tab-melody" onClick={() => setTab('melody')} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-colors" style={{ background: tab === 'melody' ? '#FFCC00' : 'transparent', color: tab === 'melody' ? '#0A1626' : '#9DB4CC' }}><Music2 className="w-4 h-4" /> Melody</button>
            </div>
          </div>

          {/* MELODY SUB-BAR: instrument picker + octave toggle */}
          {tab === 'melody' && (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0F1A2E', border: '2px solid #000' }}>
                {MELODY_ORDER.map((inst) => (
                  <button key={inst} data-testid={`inst-${inst}`} onClick={() => setMelodyInst(inst)} className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-colors" style={{ background: melodyInst === inst ? INSTRUMENTS[inst].color : 'transparent', color: melodyInst === inst ? '#0A1626' : '#9DB4CC' }}>{INSTRUMENTS[inst].label}</button>
                ))}
              </div>
              {instCfg.windows.length > 1 && (
                <div className="flex items-center gap-1 rounded-xl px-1 py-1" style={{ background: '#0F1A2E', border: '2px solid #000' }}>
                  <button data-testid="octave-down" onClick={() => setOctaves((o) => ({ ...o, [melodyInst]: Math.max(0, (o[melodyInst] || 0) - 1) }))} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#3E5471', color: '#E8F4FF' }}><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-[11px] font-black uppercase tracking-wider px-1" style={{ color: '#61E8DA', minWidth: 42, textAlign: 'center' }}>{instCfg.winLabels[octIdx] || 'Oct'}</span>
                  <button data-testid="octave-up" onClick={() => setOctaves((o) => ({ ...o, [melodyInst]: Math.min(instCfg.windows.length - 1, (o[melodyInst] || 0) + 1) }))} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#3E5471', color: '#E8F4FF' }}><ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          )}

          {/* SEQUENCER */}
          <div className="mt-2 flex justify-end">
            <button
              data-testid="clear-page"
              onClick={clearPage}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
              style={{ background: 'transparent', color: '#9DB4CC', border: '2px solid #3E5471' }}
            >
              <Eraser className="w-3.5 h-3.5" /> Clear {tab === 'drums' ? 'Drums' : INSTRUMENTS[melodyInst].label}
            </button>
          </div>
          <div className="mt-1.5 rounded-2xl border-2 p-2 md:p-2.5" style={{ background: 'linear-gradient(180deg, #0F1A2E 0%, #0A1424 100%)', borderColor: '#000', boxShadow: 'inset 0 3px 0 rgba(0,0,0,0.35)' }}>
            <div className="flex gap-1.5">
              {/* Frozen label column */}
              <div className="flex-shrink-0 flex flex-col gap-1" style={{ width: 'clamp(76px, 22vw, 116px)' }}>
                <div className="h-3" aria-hidden="true" />
                {labelColumn}
              </div>

              {/* Steps (scrolls only when > 1 bar) */}
              <div className={`flex-1 min-w-0 ${scroll ? 'overflow-x-auto beatlab-scroll' : ''}`}>
                <div className="relative" style={{ minWidth: scroll ? `${totalSteps * 37}px` : '100%' }}>
                  {/* Static beat-marker dots */}
                  {stepDots}
                  {/* Lane rows */}
                  <div className="flex flex-col gap-1 mt-1 relative">
                    {laneRows}
                    {/* Playhead overlay — one element that moves, so cells don't re-render each tick */}
                    {isPlaying && currentStep >= 0 && (
                      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${playheadPct}%`, width: `${100 / totalSteps}%`, background: 'rgba(255,204,0,0.14)', borderLeft: '2px solid rgba(255,204,0,0.65)', borderRadius: 4 }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {playerName && (
            <div className="mt-2 text-center">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded" style={{ background: '#61E8DA', color: '#0A1626', border: '2px solid #0A1626' }}>Made by {playerName}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LoopStudioPage;
