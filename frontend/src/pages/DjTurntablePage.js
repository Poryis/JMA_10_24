// DJ Stew's Turntable — Guitar-Hero-style sight-reading rhythm game.
// Notation scrolls continuously toward a strike line (ScrollingRhythmStrip,
// the same engine as Who's Got the Rhythm's Tap Trail); the kid scratches
// the turntable as each note crosses it. Each round chains several TRAIL
// phrases back-to-back so the scroll never stops mid-round, and a boom-bap
// backing loop runs underneath on the same beat clock the whole time, so a
// kid who scratches on time is genuinely playing in the pocket of the song.

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Disc3, Trophy, Play, RotateCcw, Star } from 'lucide-react';
import { GameHeader, FeedbackPopup } from '../components/GameUI';
import Confetti from '../components/Confetti';
import ScrollingRhythmStrip from '../components/ScrollingRhythmStrip';
import CountInOverlay from '../components/CountInOverlay';
import DjStewSprite from '../components/DjStewSprite';
import useAudio from '../hooks/useAudio';
import { reportGameWin } from '../lib/lessonHelperReward';
import { earnAchievement, earnAchievementUpTo, earnSticker } from '../hooks/useStickers';
import { say } from '../lib/voice';
import {
  TRAIL_PATTERNS, DIFFICULTIES, BEAT_MS, TOLERANCE_MS,
  patternBeats, noteStartTimes, ROUNDS_PER_SESSION,
} from '../data/rhythms';

// Each round chains this many TRAIL phrases back-to-back, unbroken, so the
// highway keeps flowing like one continuous run instead of a single bar.
const PHRASES_PER_ROUND = 2;

function randomRun(level) {
  const pool = TRAIL_PATTERNS[level] || TRAIL_PATTERNS.cadet;
  const run = [];
  for (let i = 0; i < PHRASES_PER_ROUND; i++) {
    run.push(...pool[Math.floor(Math.random() * pool.length)]);
  }
  return run;
}

// One bar of boom-bap in eighth-note slots (0-7). Hi-hat on the off-beats,
// kick/snare on the classic "boots & cats" grid.
const KICK_SLOTS = new Set([0, 4, 5]);
const SNARE_SLOTS = new Set([2, 6]);
const HIHAT_SLOTS = new Set([1, 3, 5, 7]);
const BEAT_TICK_SLOTS = new Set([0, 2, 4, 6]); // quarter-beats, for the sprite

const COUNT_IN_BEATS = ScrollingRhythmStrip.COUNT_IN_BEATS;

export default function DjTurntablePage() {
  const navigate = useNavigate();
  const { playDrumSound, playCountInBeep, playFeedbackSound, initAudioContext } = useAudio();

  const [screen, setScreen] = useState('menu'); // menu | playing | session-complete
  const [level, setLevel] = useState('cadet');
  const [phase, setPhase] = useState('countin'); // countin | input | reveal
  const [pattern, setPattern] = useState([]);
  const [roundKey, setRoundKey] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionStats, setSessionStats] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [metronomeStartMs, setMetronomeStartMs] = useState(0);
  const [scratchTick, setScratchTick] = useState(0);
  const [beatTick, setBeatTick] = useState(0);

  const timeoutsRef = useRef([]);
  const patternRef = useRef([]);
  const claimedRef = useRef(new Set());
  const tapResultsRef = useRef({});
  const expectedStartsRef = useRef([]);
  const inputStartRef = useRef(0);
  const sessionTallyRef = useRef({ correct: 0, total: 0 });
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  useEffect(() => clearTimeouts, [clearTimeouts]);

  // ---- Backing boom-bap loop — runs continuously on the same beat clock
  // as the notation, so an on-time scratch really is on-time with the song.
  // Each bar is scheduled relative to the moment IT starts (not an
  // ever-growing absolute offset), so the loop never drifts or drops bars.
  const scheduleBackingLoop = useCallback(() => {
    const eighth = BEAT_MS / 2;
    for (let slot = 0; slot < 8; slot++) {
      const t = setTimeout(() => {
        if (KICK_SLOTS.has(slot)) playDrumSound('kick');
        if (SNARE_SLOTS.has(slot)) playDrumSound('snare');
        if (HIHAT_SLOTS.has(slot)) playDrumSound('hihat');
        if (BEAT_TICK_SLOTS.has(slot)) setBeatTick((b) => b + 1);
      }, slot * eighth);
      timeoutsRef.current.push(t);
    }
    const next = setTimeout(() => scheduleBackingLoop(), 8 * eighth);
    timeoutsRef.current.push(next);
  }, [playDrumSound]);

  // ---- Round lifecycle ----
  const finishRoundRef = useRef(null);

  const finishRound = useCallback(() => {
    clearTimeouts();
    const pat = patternRef.current;
    const results = tapResultsRef.current;
    const playable = pat.map((k, i) => (k !== 'rest' ? i : null)).filter((i) => i !== null);
    const correct = playable.filter((i) => results[i] && results[i] !== 'miss').length;
    const total = playable.length;
    sessionTallyRef.current.correct += correct;
    sessionTallyRef.current.total += total;
    setMetronomeRunning(false);
    setPhase('reveal');

    const passed = correct >= Math.max(1, Math.ceil(total * 0.7));
    if (passed) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
      setShowCelebration(true);
      timeoutsRef.current.push(setTimeout(() => setShowCelebration(false), 1800));
      setFeedback('perfect');
      reportGameWin();
      say('stew.perfect');
      try {
        earnAchievement('rhythm', 'cadet');
        if (level === 'pro') earnAchievementUpTo('rhythm', 'pro');
        if (level === 'master') earnAchievementUpTo('rhythm', 'master');
      } catch (_) { /* ignore */ }
    } else {
      setStreak(0);
      setFeedback('miss');
      say('stew.miss');
    }
    timeoutsRef.current.push(setTimeout(() => setFeedback(null), 500));

    const isLastRound = currentRound >= ROUNDS_PER_SESSION;
    const next = setTimeout(() => {
      if (isLastRound) {
        const { correct: c, total: t } = sessionTallyRef.current;
        setSessionStats({ correct: c, total: t, score: scoreRef.current });
        if (t > 0 && c / t >= 0.7) earnSticker('dj_stew_scratch');
        setScreen('session-complete');
        return;
      }
      setCurrentRound((r) => r + 1);
      startRoundRef.current?.();
    }, 2600);
    timeoutsRef.current.push(next);
  }, [clearTimeouts, level, currentRound]);
  useEffect(() => { finishRoundRef.current = finishRound; }, [finishRound]);

  const startRound = useCallback(() => {
    initAudioContext();
    clearTimeouts();
    const pat = randomRun(level);
    setPattern(pat);
    patternRef.current = pat;
    claimedRef.current = new Set();
    tapResultsRef.current = {};
    setRoundKey((k) => k + 1);
    setPhase('countin');

    // Backing loop starts now and runs uninterrupted through the whole round.
    scheduleBackingLoop();

    const countInMs = COUNT_IN_BEATS * BEAT_MS;
    const totalBeats = patternBeats(pat);
    for (let b = 0; b < COUNT_IN_BEATS; b++) {
      const isLast = b === COUNT_IN_BEATS - 1;
      const t = setTimeout(() => playCountInBeep(isLast), b * BEAT_MS);
      timeoutsRef.current.push(t);
    }
    setMetronomeStartMs(Date.now());
    setMetronomeRunning(true);
    const stopT = setTimeout(() => setMetronomeRunning(false), (COUNT_IN_BEATS + 0.5) * BEAT_MS);
    timeoutsRef.current.push(stopT);

    // Open the tap window now so anticipatory taps on the last count-in beat
    // land within tolerance of beat 1 of the run.
    inputStartRef.current = Date.now();
    expectedStartsRef.current = noteStartTimes(pat, BEAT_MS).map((t) => t + countInMs);

    const handoff = setTimeout(() => {
      setPhase('input');
      const failsafe = setTimeout(() => finishRoundRef.current?.(), totalBeats * BEAT_MS + 800);
      timeoutsRef.current.push(failsafe);
    }, countInMs);
    timeoutsRef.current.push(handoff);
  }, [level, initAudioContext, clearTimeouts, scheduleBackingLoop, playCountInBeep]);
  const startRoundRef = useRef(null);
  useEffect(() => { startRoundRef.current = startRound; }, [startRound]);

  // ---- Tap handling ----
  const handleScratchTap = useCallback(() => {
    if (phase !== 'input' && phase !== 'countin') return;
    const tapTime = Date.now() - inputStartRef.current;
    const pat = patternRef.current;
    const expectedStarts = expectedStartsRef.current;
    const claimed = claimedRef.current;
    const tol = TOLERANCE_MS[level] ?? TOLERANCE_MS.cadet;

    let targetIdx = -1;
    let autoMissed = false;
    for (let i = 0; i < pat.length; i++) {
      if (pat[i] === 'rest' || claimed.has(i)) continue;
      if (expectedStarts[i] >= tapTime - tol) { targetIdx = i; break; }
      claimed.add(i);
      tapResultsRef.current[i] = 'miss';
      autoMissed = true;
    }
    if (targetIdx === -1) {
      if (autoMissed) { setStreak(0); playFeedbackSound('miss'); }
      return;
    }
    const diff = Math.abs(tapTime - expectedStarts[targetIdx]);
    if (diff > tol) return; // too early — leave the note open for a real attempt

    claimed.add(targetIdx);
    const tier = diff <= tol * 0.3 ? 'perfect' : diff <= tol * 0.6 ? 'great' : 'good';
    tapResultsRef.current[targetIdx] = tier;
    const mult = streakRef.current >= 7 ? 3 : streakRef.current >= 5 ? 2 : streakRef.current >= 3 ? 1.5 : 1;
    const base = tier === 'perfect' ? 25 : tier === 'great' ? 15 : 10;
    setScore((s) => s + Math.round(base * mult));
    setStreak((s) => s + 1);
    setScratchTick((s) => s + 1);
    setFeedback(tier);
    timeoutsRef.current.push(setTimeout(() => setFeedback(null), 350));
    const scratchSound = tier === 'perfect' && streakRef.current >= 5
      ? 'scratchPushPull'
      : (targetIdx % 2 === 0 ? 'scratchPush' : 'scratchPull');
    playDrumSound(scratchSound);
  }, [phase, level, playDrumSound, playFeedbackSound]);

  const onScratchDown = useCallback((e) => {
    e.preventDefault();
    handleScratchTap();
  }, [handleScratchTap]);

  const startSession = useCallback((pickedLevel) => {
    const lvl = pickedLevel || level;
    setLevel(lvl);
    setScore(0);
    setStreak(0);
    setCurrentRound(1);
    sessionTallyRef.current = { correct: 0, total: 0 };
    setScreen('playing');
    setTimeout(() => startRoundRef.current?.(), 50);
  }, [level]);

  // ===== MENU =====
  if (screen === 'menu') {
    return (
      <div
        data-testid="dj-turntable-menu"
        className="min-h-screen flex flex-col items-center justify-center jma-safe-center p-4 pt-20 md:pt-24 lg:pt-32 pb-8 relative"
        style={{ background: 'radial-gradient(circle at 50% 0%, #3A2366 0%, #190E33 70%)' }}
      >
        <GameHeader showHomeButton={true} backTo="/campus?zone=play" />
        <motion.h1
          className="text-3xl md:text-5xl font-black mb-2 text-center font-display uppercase"
          style={{ color: '#FFF3A6', WebkitTextStroke: '3px #0A2540', paintOrder: 'stroke fill' }}
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        >
          DJ Stew&apos;s Turntable
        </motion.h1>
        <p className="text-base md:text-lg font-bold mb-4 text-center text-white">
          Read the rhythm as it rolls by. Scratch it right on the beat!
        </p>

        <div className="w-full max-w-sm mb-4">
          <DjStewSprite scratchTick={0} beatTick={0} />
        </div>

        <div className="game-card p-4 mb-4 max-w-md text-center">
          <Disc3 className="w-8 h-8 mx-auto mb-2" style={{ color: '#AF52DE' }} />
          <h2 className="text-lg font-bold mb-2 font-display">How to Play</h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Notes roll in from the right, just like a song<br />
            2. Tap the turntable the instant each note hits the gold line<br />
            3. A real beat plays underneath — stay in the pocket!<br />
            4. Clear 5 runs to win the session.
          </p>
        </div>

        <div className="grid gap-2 w-full max-w-md mb-2">
          {DIFFICULTIES.map((d, idx) => (
            <motion.button
              key={d.id}
              data-testid={`dj-turntable-difficulty-${d.id}`}
              className="level-card p-3 text-left flex items-center justify-between"
              onClick={() => startSession(d.id)}
              initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.08 * idx }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-lg font-bold font-display">{d.label}</h3>
                <p className="text-xs opacity-60">{d.description}</p>
              </div>
              <Play className="w-5 h-5" style={{ color: d.color }} />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ===== SESSION COMPLETE =====
  if (screen === 'session-complete' && sessionStats) {
    const acc = sessionStats.total > 0 ? sessionStats.correct / sessionStats.total : 0;
    const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
    return (
      <div
        data-testid="dj-turntable-complete"
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(circle at 50% 0%, #3A2366 0%, #190E33 70%)' }}
      >
        <Confetti count={48} size={420} mega={stars === 3} />
        <motion.div
          className="bg-white rounded-3xl border-4 p-6 max-w-md w-full text-center relative z-10"
          style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
          initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }}
        >
          <Trophy className="w-12 h-12 mx-auto mb-2" style={{ color: '#FFD700' }} />
          <h2 className="text-2xl md:text-3xl font-black font-display mb-1" style={{ color: 'var(--jma-dark)' }}>
            Set Complete!
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2" data-testid="dj-turntable-stars">
            {[0, 1, 2].map((i) => (
              <Star key={i} className="w-8 h-8" style={{ color: i < stars ? '#FFCC00' : '#D1D5DB', fill: i < stars ? '#FFCC00' : '#E5E7EB' }} strokeWidth={2.2} />
            ))}
          </div>
          <p className="font-bold mb-4" style={{ color: 'var(--jma-dark)' }}>
            {sessionStats.correct}/{sessionStats.total} on time · <span className="font-black">{sessionStats.score} pts</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button data-testid="dj-turntable-play-again" onClick={() => startSession(level)} className="chunky-btn bg-[var(--jma-green)] text-white px-4 py-2 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button data-testid="dj-turntable-change-level" onClick={() => setScreen('menu')} className="chunky-btn bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2">
              Change Level
            </button>
            <button data-testid="dj-turntable-home" onClick={() => navigate('/')} className="chunky-btn bg-white text-[var(--jma-dark)] px-4 py-2">
              Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== PLAYING =====
  const levelInfo = DIFFICULTIES.find((d) => d.id === level) || DIFFICULTIES[0];
  return (
    <div
      data-testid="dj-turntable-playing"
      className="min-h-screen flex flex-col relative"
      style={{ background: 'radial-gradient(circle at 50% 0%, #3A2366 0%, #190E33 70%)' }}
    >
      <GameHeader title="DJ Stew's Turntable" subtitle={levelInfo.label} score={score} streak={streak} showHomeButton={true} backTo="/campus?zone=play" />
      <AnimatePresence>{feedback && <FeedbackPopup feedback={feedback} />}</AnimatePresence>

      <main className="flex-1 flex flex-col items-center pt-24 md:pt-28 lg:pt-32 pb-6 px-3">
        <div className="flex items-center justify-center gap-2 mb-2" data-testid="dj-turntable-round-dots">
          {Array.from({ length: ROUNDS_PER_SESSION }).map((_, i) => (
            <div
              key={i}
              className="rounded-full border-2"
              style={{
                width: 18, height: 18,
                backgroundColor: i + 1 < currentRound || (i + 1 === currentRound && phase === 'reveal')
                  ? '#34A853' : i + 1 === currentRound ? '#FFCC00' : 'rgba(255,255,255,0.35)',
                borderColor: '#0A2540',
              }}
            />
          ))}
        </div>

        <div
          data-testid="dj-turntable-phase"
          className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-black border-2 mb-3"
          style={{
            backgroundColor: phase === 'reveal' ? 'var(--jma-purple)' : 'var(--jma-yellow)',
            color: phase === 'reveal' ? 'white' : 'var(--jma-dark)',
            borderColor: 'var(--jma-dark)',
          }}
        >
          {phase === 'countin' && 'Get ready...'}
          {phase === 'input' && 'Scratch it as it rolls in!'}
          {phase === 'reveal' && 'Run complete!'}
        </div>

        <div className="w-full max-w-2xl mb-2">
          <ScrollingRhythmStrip key={roundKey} pattern={pattern} kickOff={phase === 'countin' || phase === 'input' || phase === 'reveal'} beatMs={BEAT_MS} />
        </div>

        {phase === 'countin' && (
          <CountInOverlay running={metronomeRunning} startAtMs={metronomeStartMs} beatMs={BEAT_MS} />
        )}

        <button
          data-testid="dj-turntable-tap-target"
          type="button"
          aria-label="Scratch the turntable"
          onPointerDown={onScratchDown}
          className="w-full max-w-md relative border-0 bg-transparent p-0"
          style={{ touchAction: 'none' }}
        >
          <DjStewSprite scratchTick={scratchTick} beatTick={beatTick} />
        </button>
      </main>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <Confetti count={36} size={360} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
