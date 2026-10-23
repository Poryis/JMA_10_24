import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FitBox from '../components/FitBox';
import { Play, RotateCcw, ChevronLeft, Star, Flame } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import Confetti from '../components/Confetti';
import GuitarInstrument from '../components/GuitarInstrument';
import useAudio from '../hooks/useAudio';
import useShredBand, { SONGS } from '../hooks/useShredBand';
import useGamePaused from '../hooks/useGamePause';
import { earnAchievementUpTo, earnSticker } from '../hooks/useStickers';
import { reportQuestEvent } from '../hooks/useDailyQuests';
import { say } from '../lib/voice';
import useVoiceTagline from '../hooks/useVoiceTagline';
import HowToVoiceButton from '../components/HowToVoiceButton';
import { readAvatarOutfit } from '../hooks/useAvatar';
import AvatarSprite from '../components/AvatarSprite';
import { useNavigate } from 'react-router-dom';

const SONG_SECONDS = 45;
const ENCORE_SECONDS = 10;
const ENCORE_TEMPO = 1.2;
const ENCORE_COLOR = '#FF2D85';

// Crowd/rank tiers keyed off the Crowd Meter (0-100).
const TIERS = [
  { min: 0,  label: 'Garage Band', color: '#9DA3A8' },
  { min: 22, label: 'Opening Act', color: '#0FA3B1' },
  { min: 58, label: 'Headliner',   color: '#FF9500' },
  { min: 90, label: 'SHRED LEGEND', color: '#FFCC00' },
];

function tierFor(meter) {
  let t = TIERS[0];
  for (const tier of TIERS) if (meter >= tier.min) t = tier;
  return t;
}

// The crowd is built from the JMA band's own characters (one each — no dupes)
// so it's 100% in the app's hand-drawn style. Per-character `scale` balances
// the wildly different source-PNG proportions so nobody towers over everyone.
const CROWD_MEMBERS = [
  { src: 'assets/characters/finn-danger.png', scale: 0.92 },
  { src: 'assets/characters/chunk.png',        scale: 1.00 },
  { src: 'assets/characters/jazzy.png',        scale: 0.88 },
  { src: 'assets/characters/charlie-punk.png', scale: 0.96 },
  { src: 'assets/characters/lou.png',          scale: 0.90 },
  { src: 'assets/characters/stew.png',         scale: 0.98 },
  { src: 'assets/characters/dr-jellybone.png', scale: 1.00 },
];

// Back row that shows up once the show gets good — the crowd literally grows.
const CROWD_BACK_ROW = [
  { src: 'assets/characters/charlie-disco.png', scale: 0.9 },
  { src: 'assets/characters/sharky-hiphop.png', scale: 0.95 },
  { src: 'assets/characters/finn-disco.png',    scale: 0.88 },
  { src: 'assets/characters/lou-disco.png',     scale: 0.9 },
  { src: 'assets/characters/chunk-disco.png',   scale: 0.95 },
  { src: 'assets/characters/jazzy-disco.png',   scale: 0.86 },
];

export const CROWD_SHOUTS = ['WOOO!', 'YEAH!', 'ROCK ON!', 'ENCORE!', 'SHRED!', 'GO GO GO!', 'SO GOOD!'];

function CrowdMember({ m, i, lift, dur, tilt, burstId, shout, glow }) {
  const you = !!m.you;
  const delay = (i % 4) * 0.07;
  return (
    <motion.div
      key={burstId}
      className="relative h-full flex items-end"
      style={{ height: '100%' }}
      initial={{ y: 0 }}
      animate={burstId ? { y: [0, -70, 0, -36, 0], rotate: [0, i % 2 ? 10 : -10, 0, i % 2 ? -6 : 6, 0] } : { y: 0 }}
      transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
    >
      <AnimatePresence>
        {shout && (
          <motion.div
            key={shout.id}
            className="absolute left-1/2 font-black font-display whitespace-nowrap px-2 py-0.5 rounded-xl"
            style={{ top: '-18%', background: 'white', color: '#0A1420', border: '2px solid #0A1420', fontSize: 'clamp(9px, 1.4vw, 13px)', boxShadow: '0 2px 0 0 #0A1420', zIndex: 5 }}
            initial={{ opacity: 0, y: 10, scale: 0.6, x: '-50%' }}
            animate={{ opacity: 1, y: -6, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -24, scale: 0.8, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          >
            {shout.text}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {glow && (
          <motion.div
            className="absolute left-1/2 pointer-events-none"
            style={{ top: '-6%', width: 6, height: '34%', borderRadius: 4, background: 'linear-gradient(180deg, #FFF7B0, #FFCC00)', boxShadow: '0 0 10px 3px rgba(255,204,0,0.75)', transformOrigin: 'bottom center', marginLeft: i % 2 ? 14 : -18 }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1, rotate: [-22, 22, -22] }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ rotate: { repeat: Infinity, duration: Math.max(0.5, dur * 1.6), ease: 'easeInOut', delay }, opacity: { duration: 0.3 } }}
          />
        )}
      </AnimatePresence>
      {you && (
        <span data-testid="shred-crowd-you" className="absolute left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] md:text-[10px] font-black text-white whitespace-nowrap" style={{ top: '-30%', background: '#FF2D85', border: '2px solid #0A1420', zIndex: 6 }}>YOU</span>
      )}
      {m.helmet ? (
        <motion.div className="flex items-end" style={{ height: `${Math.round(m.scale * 100)}%`, transformOrigin: 'bottom center', filter: 'drop-shadow(0 0 8px rgba(255,45,133,0.8))' }}
          animate={{ y: [0, -lift, 0], rotate: [0, tilt, 0] }} transition={{ repeat: Infinity, duration: dur, delay, ease: 'easeInOut' }}>
          <AvatarSprite src={m.src} helmet width={54} />
        </motion.div>
      ) : (
      <motion.img
        src={m.src}
        alt=""
        draggable={false}
        className="object-contain object-bottom"
        style={{ width: 'auto', height: `${Math.round(m.scale * 100)}%`, transformOrigin: 'bottom center', willChange: 'transform', filter: you ? 'drop-shadow(0 0 8px rgba(255,45,133,0.8))' : 'none' }}
        animate={{ y: [0, -lift, 0], rotate: [0, tilt, 0] }}
        transition={{ repeat: Infinity, duration: dur, delay, ease: 'easeInOut' }}
      />
      )}
    </motion.div>
  );
}

// Which Jelly a sprite is, from its file name (finn-disco → finn, sharky-* → finn …).
function charOf(src = '') {
  const f = src.split('/').pop().replace(/\.png$/, '');
  if (/^(sharky|shark|finn)/.test(f)) return 'finn';
  if (f.startsWith('dr-jellybone')) return 'jellybone';
  return f.split('-')[0];
}

export function CrowdRow({ energy, burstId = 0, shouts = [], avatarSrc, avatarHelmet = false, extras = true }) {
  // The front row never repeats a character — drop whoever the kid IS from the regulars.
  const members = useMemo(() => {
    if (!avatarSrc) return CROWD_MEMBERS.slice(0, 7);
    const rest = CROWD_MEMBERS.filter((m) => charOf(m.src) !== charOf(avatarSrc)).slice(0, 6);
    return [...rest.slice(0, 3), { src: avatarSrc, scale: 1.08, you: true, helmet: avatarHelmet }, ...rest.slice(3, 6)];
  }, [avatarSrc, avatarHelmet]);
  // Bucket the energy so the jump height/speed only change at a few
  // thresholds — continuously-changing framer targets caused the taller
  // sprites (Finn, Lou) to jitter/glitch while celebrating.
  const e = Math.round(energy * 3) / 3;
  const lift = 6 + e * 42;
  const dur = Math.max(0.28, 0.72 - e * 0.4);
  const glow = energy >= 0.55;
  const backRow = energy >= 0.55;
  const shoutFor = (idx) => shouts.find((s) => s.member === idx) || null;
  return (
    <div className="relative w-full h-full pointer-events-none select-none" data-testid="shred-crowd-row" data-back-row={backRow ? 'true' : 'false'}>
      <CameraFlashes energy={energy} />
      {extras && <CrowdExtras energy={energy} />}
      <AnimatePresence>
        {backRow && (
          <motion.div
            className="absolute inset-x-0 flex items-end justify-center gap-2 md:gap-5"
            style={{ bottom: '28%', height: '72%', filter: 'brightness(0.42) saturate(0.55)', opacity: 0.8, zIndex: 0 }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          >
            {CROWD_BACK_ROW.map((m, i) => (
              <motion.img
                key={i} src={m.src} alt="" draggable={false}
                className="object-contain object-bottom"
                style={{ width: 'auto', height: `${Math.round(m.scale * 100)}%`, transformOrigin: 'bottom center' }}
                animate={{ y: [0, -(lift * 0.7), 0], rotate: [0, (i % 2 ? -1 : 1) * e * 4, 0] }}
                transition={{ repeat: Infinity, duration: dur * 1.1, delay: (i % 3) * 0.09, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative w-full h-full flex items-end justify-center gap-1 md:gap-3" style={{ zIndex: 1 }}>
        {members.map((m, i) => (
          <CrowdMember
            key={i} m={m} i={i} lift={lift} dur={dur}
            tilt={e * 5 * (i % 2 === 0 ? 1 : -1)}
            burstId={burstId}
            shout={shoutFor(i)}
            glow={glow}
          />
        ))}
      </div>
    </div>
  );
}

// Camera flashes popping in the crowd once the show heats up.
function CameraFlashes({ energy }) {
  const [flashes, setFlashes] = useState([]);
  const rate = energy >= 0.9 ? 160 : energy >= 0.58 ? 320 : 0;
  useEffect(() => {
    if (!rate) { setFlashes([]); return; }
    const iv = setInterval(() => {
      const id = Date.now() + Math.random();
      setFlashes((f) => [...f.slice(-8), { id, x: 5 + Math.random() * 90, y: 10 + Math.random() * 70 }]);
      setTimeout(() => setFlashes((f) => f.filter((x) => x.id !== id)), 380);
    }, rate);
    return () => clearInterval(iv);
  }, [rate]);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }} data-testid="shred-camera-flashes">
      <AnimatePresence>
        {flashes.map((f) => (
          <motion.div
            key={f.id}
            className="absolute rounded-full"
            style={{ left: `${f.x}%`, top: `${f.y}%`, width: 14, height: 14, background: 'white', boxShadow: '0 0 18px 8px rgba(255,255,255,0.9), 0 0 40px 16px rgba(255,255,255,0.35)' }}
            initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1.4 }} exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.18 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Beach ball bouncing over the crowd (Headliner+), Surf Charlie crowd-surfing
// and stage pyro at SHRED LEGEND.
function CrowdExtras({ energy }) {
  const ball = energy >= 0.58;
  const legend = energy >= 0.9;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 4 }} data-testid="shred-crowd-extras" data-legend={legend ? 'true' : 'false'}>
      <AnimatePresence>
        {ball && (
          <motion.div
            key="ball"
            className="absolute"
            style={{ top: '-10%', width: 'clamp(26px, 4vw, 40px)', aspectRatio: '1 / 1', borderRadius: '50%', border: '3px solid #0A1420', background: 'conic-gradient(#FF3B30 0 60deg, #FFCC00 60deg 120deg, #4285F4 120deg 180deg, #FF3B30 180deg 240deg, #FFCC00 240deg 300deg, #4285F4 300deg 360deg)', boxShadow: '0 4px 0 0 rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0, left: '-6%' }}
            animate={{ opacity: 1, left: ['-6%', '96%', '-6%'], y: [0, -46, 0, -46, 0, -46, 0, -46, 0], rotate: [0, 720] }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ left: { repeat: Infinity, duration: 7, ease: 'linear' }, y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }, rotate: { repeat: Infinity, duration: 3.5, ease: 'linear' }, opacity: { duration: 0.4 } }}
          />
        )}
        {legend && ['4%', '92%'].map((left, side) => (
          <div key={`pyro-${side}`} className="absolute bottom-0" style={{ left, width: 24, height: 1 }} data-testid="shred-pyro">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ left: 10, bottom: 0, width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2, background: i % 2 ? '#FFCC00' : '#FFF4B0', boxShadow: '0 0 8px 2px rgba(255,204,0,0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ y: [0, -(110 + (i % 5) * 22)], x: [0, (i % 2 ? 1 : -1) * (6 + (i * 7) % 34)], opacity: [1, 1, 0], scale: [1, 0.9, 0.2] }}
                transition={{ repeat: Infinity, duration: 0.85 + (i % 4) * 0.12, delay: i * 0.07, ease: 'easeOut' }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const LIGHT_PALETTES = {
  // per song STYLE: beam colors + glow + how fast/strobe-y
  punk:     { beams: ['rgba(255,40,40,0.40)', 'rgba(255,255,255,0.32)', 'rgba(255,40,40,0.40)'], glow: 'rgba(255,60,60,0.26)', strobe: true,  speed: 0.6 },
  surf:     { beams: ['rgba(15,180,190,0.34)', 'rgba(255,140,0,0.30)',  'rgba(15,180,190,0.34)'], glow: 'rgba(255,150,0,0.22)',  strobe: false, speed: 1.0 },
  halftime: { beams: ['rgba(120,90,255,0.34)', 'rgba(60,120,255,0.30)', 'rgba(170,80,255,0.32)'], glow: 'rgba(130,90,255,0.22)', strobe: false, speed: 1.3 },
  rock:     { beams: ['rgba(255,80,80,0.30)', 'rgba(255,204,0,0.28)',  'rgba(15,163,177,0.30)'], glow: 'rgba(255,204,0,0.22)',  strobe: false, speed: 1.0 },
};

export function StageLights({ energy, style = 'rock' }) {
  const pal = LIGHT_PALETTES[style] || LIGHT_PALETTES.rock;
  const beams = [
    { color: pal.beams[0], x: '18%', delay: 0 },
    { color: pal.beams[1], x: '50%', delay: pal.strobe ? 0.12 : 0.6 },
    { color: pal.beams[2], x: '82%', delay: pal.strobe ? 0.06 : 1.2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2, mixBlendMode: 'screen' }}>
      {beams.map((b, i) => (
        <motion.div
          key={i}
          className="absolute top-[-10%]"
          style={{
            left: b.x,
            width: '42vw',
            height: '120%',
            transformOrigin: 'top center',
            background: `linear-gradient(180deg, ${b.color} 0%, rgba(0,0,0,0) 72%)`,
            filter: 'blur(6px)',
          }}
          animate={pal.strobe
            ? { opacity: [0.2, 1, 0.2], rotate: i % 2 === 0 ? -12 : 12 }
            : { rotate: [i % 2 === 0 ? -16 : 16, i % 2 === 0 ? 16 : -16, i % 2 === 0 ? -16 : 16] }}
          transition={pal.strobe
            ? { repeat: Infinity, duration: Math.max(0.16, (0.4 - energy * 0.2) * pal.speed), delay: b.delay, ease: 'linear' }
            : { repeat: Infinity, duration: Math.max(2.4, (5 - energy * 2.4) * pal.speed), delay: b.delay, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute left-1/2 top-[20%]"
        style={{
          width: '70vw', height: '55vh', transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at center, ${pal.glow} 0%, rgba(0,0,0,0) 65%)`,
        }}
        animate={{ opacity: [0.35 + energy * 0.5, 0.6 + energy * 0.4, 0.35 + energy * 0.5] }}
        transition={{ repeat: Infinity, duration: Math.max(0.5, 1.2 - energy), ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function ShredLegendPage() {
  useVoiceTagline('charlie.tag.shred', 'charlie.howto.shred');
  const navigate = useNavigate();
  const { getAudioGraph, initAudioContext } = useAudio();
  const band = useShredBand(getAudioGraph, initAudioContext);
  const paused = useGamePaused();

  const [screen, setScreen] = useState('intro');   // intro | ready | playing | result
  const [meter, setMeter] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SONG_SECONDS);
  const [floats, setFloats] = useState([]);         // floating feedback words
  const [readyCount, setReadyCount] = useState(3);
  const [songIndex, setSongIndex] = useState(() => Math.floor(Math.random() * SONGS.length));
  const [tierFlash, setTierFlash] = useState(null);   // { label, color, id } tier-up banner
  const [burst, setBurst] = useState(null);           // { id, mega } confetti burst on tier-up
  const [shouts, setShouts] = useState([]);           // crowd speech bubbles [{ id, member, text }]
  const [crowdBurst, setCrowdBurst] = useState(0);    // bumps → whole crowd does a jump wave
  const [hitPulse, setHitPulse] = useState(0);        // bumps on every scored hit (meter pop)

  const meterRef = useRef(0);
  const comboRef = useRef(0);
  const peakRef = useRef(0);
  const inPocketRef = useRef(0);
  const reachedLegendRef = useRef(false);
  const lastTierRef = useRef('Garage Band');
  const holdingRef = useRef(false);          // a note is being sustained
  const lastOnsetRef = useRef(0);            // time of last note hit (ms)
  const lastScoredRef = useRef(0);           // time of last hit that EARNED meter (ms)
  const onsetsRef = useRef([]);              // recent onset times (ms) — mash guard
  const holdStartRef = useRef(0);            // when the current sustain began (ms)
  const timeLeftRef = useRef(SONG_SECONDS);
  const encoreRef = useRef({ played: false, hits: 0, misses: 0 });
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Preload the app's drum + bass samples up front so the groove is ready.
  useEffect(() => { band.preload(); }, [band]);

  // ---- crowd cheer SFX (synth noise swell) ----
  const cheer = useCallback((big = false) => {
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const { ctx, masterNode } = graph;
    const len = Math.floor(ctx.sampleRate * (big ? 1.1 : 0.6));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = big ? 1400 : 1000; bp.Q.value = 0.6;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(big ? 0.5 : 0.3, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + (big ? 1.0 : 0.55));
    src.connect(bp); bp.connect(g); g.connect(masterNode);
    src.start(t); src.stop(t + (big ? 1.1 : 0.6));
  }, [getAudioGraph]);

  const pushFloat = useCallback((text, color, big = false) => {
    const id = Date.now() + Math.random();
    const dx = Math.round((Math.random() - 0.5) * 180);
    setFloats((f) => [...f.slice(-5), { id, text, color, big, dx }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), big ? 850 : 700);
  }, []);

  const pushShout = useCallback((count) => {
    const members = [...Array(CROWD_MEMBERS.length).keys()].sort(() => Math.random() - 0.5).slice(0, count);
    const batch = members.map((member) => ({ id: Date.now() + Math.random(), member, text: CROWD_SHOUTS[Math.floor(Math.random() * CROWD_SHOUTS.length)] }));
    setShouts((prev) => [...prev.filter((p) => !members.includes(p.member)), ...batch]);
    setTimeout(() => setShouts((prev) => prev.filter((p) => !batch.includes(p))), 1100);
  }, []);

  // ---- guitar NOTE HIT (onset) → always adds energy; a little extra sparkle
  // if it lands on the beat. The crowd just loves that you're PLAYING. ----
  const onGuitarPlay = useCallback(() => {
    if ((screen !== 'playing' && screen !== 'encore') || pausedRef.current) return;
    const inEncore = screen === 'encore';
    const now = performance.now();
    lastOnsetRef.current = now;
    const beatMs = band.beatMs();
    const eighthMs = beatMs / 2;
    onsetsRef.current = onsetsRef.current.filter((t) => now - t < beatMs).concat(now);

    // Mash guard: a quick 3-note run inside one beat is cool; FOUR or more is
    // button-mashing. It scores nothing, breaks the combo and bleeds meter.
    if (onsetsRef.current.length > 3) {
      comboRef.current = 0; setCombo(0);
      meterRef.current = Math.max(0, meterRef.current - 1.5); setMeter(meterRef.current);
      if (inEncore) encoreRef.current.misses += 1;
      pushFloat('TOO WILD!', '#FF3B30');
      say('charlie.shred.toowild', { minGapMs: 4000 });
      return;
    }

    // Timing windows scale with tempo so fast songs aren't a free ride.
    const off = band.nearestEighthOffsetMs();
    const perfectWin = Math.max(28, eighthMs * 0.18);
    const niceWin = Math.max(55, eighthMs * 0.36);
    if (off > niceWin) {
      comboRef.current = 0; setCombo(0);
      if (inEncore) encoreRef.current.misses += 1;
      pushFloat('OFF BEAT', '#9DA3A8');
      return;
    }
    const perfect = off <= perfectWin;

    // ONE score per 8th-note — extra notes inside the same 8th earn nothing.
    const beatIdx = band.nearestEighthIndex();
    if (beatIdx === lastScoredRef.current) return;
    lastScoredRef.current = beatIdx;

    comboRef.current += 1; inPocketRef.current += 1;
    if (inEncore) encoreRef.current.hits += 1;
    setCombo(comboRef.current);
    const mult = comboRef.current >= 12 ? 2 : comboRef.current >= 6 ? 1.5 : 1;
    bumpMeter((perfect ? 1.2 : 0.6) * mult);
    setHitPulse((p) => p + 1);
    pushFloat(perfect ? 'PERFECT!' : 'NICE!', perfect ? '#FFCC00' : '#0FA3B1', perfect);
    if (perfect && comboRef.current >= 3 && comboRef.current % 4 === 0) pushShout(1 + (comboRef.current >= 12 ? 1 : 0));
    if (comboRef.current >= 8 && comboRef.current % 8 === 0) setCrowdBurst(Date.now());
  }, [screen, band, pushFloat, pushShout]);

  // Shared meter-raise + tier/cheer handling.
  const bumpMeter = useCallback((raw) => {
    // Easy to get the crowd warmed up (Opening Act), then each tier is a
    // steeper climb — the meter is a curve, not a straight line.
    const m = meterRef.current;
    const zone = m < 22 ? 1.6 : m < 58 ? 1.0 : m < 90 ? 0.72 : 0.55;
    const amount = raw * zone;
    meterRef.current = Math.min(100, meterRef.current + amount);
    setMeter(meterRef.current);
    if (meterRef.current > peakRef.current) peakRef.current = meterRef.current;
    const tier = tierFor(meterRef.current).label;
    if (tier !== lastTierRef.current) {
      const prevIdx = TIERS.findIndex((t) => t.label === lastTierRef.current);
      const newIdx = TIERS.findIndex((t) => t.label === tier);
      if (newIdx > prevIdx) {
        cheer(tier === 'SHRED LEGEND');
        const color = TIERS[newIdx].color;
        const id = Date.now();
        setTierFlash({ label: tier, color, id });
        setTimeout(() => setTierFlash((f) => (f && f.id === id ? null : f)), 1500);
        setBurst({ id, mega: newIdx >= 2 });
        setCrowdBurst(id);
        say(newIdx >= 3 ? 'charlie.shred.legend' : newIdx === 2 ? 'charlie.shred.headliner' : 'charlie.shred.opening', { delayMs: 350 });
        setTimeout(() => setBurst((b) => (b && b.id === id ? null : b)), 2600);
        pushShout(newIdx >= 2 ? CROWD_MEMBERS.length : 3);
      }
      lastTierRef.current = tier;
    }
    if (meterRef.current >= 100 && !reachedLegendRef.current) {
      reachedLegendRef.current = true;
      cheer(true);
    }
  }, [cheer, pushShout]);

  // Parent gets told when a note is held (sustained) vs released.
  const onGuitarActive = useCallback((active) => {
    if (active && !holdingRef.current) holdStartRef.current = performance.now();
    holdingRef.current = active;
  }, []);

  // ---- song loop: countdown timer + sustain fill / idle decay ----
  useEffect(() => {
    if (screen !== 'playing' && screen !== 'encore') return;
    if (process.env.NODE_ENV !== 'production') {
      // Dev-only hook so automated tests can drive the Crowd Meter.
      window.__shredSetMeter = (v) => { meterRef.current = Math.max(0, Math.min(100, v)); bumpMeter(0); };
      window.__shredSetTimeLeft = (v) => { timeLeftRef.current = v; setTimeLeft(v); };
    }
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      const now = performance.now();
      const recentlyPlayed = now - lastOnsetRef.current < 600;
      if (holdingRef.current) {
        // A sustained note is a flourish, not a strategy: it only feeds the
        // meter for its first 1.5 s (~3.75 total), then just rings.
        if (now - holdStartRef.current < 1500) bumpMeter(0.25);
      } else if (!recentlyPlayed) {
        meterRef.current = Math.max(0, meterRef.current - 0.5); // ~5/sec idle
        setMeter(meterRef.current);
      }
    }, 100);
    const sec = setInterval(() => {
      if (pausedRef.current) return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(sec);
        if (screen === 'playing' && reachedLegendRef.current && !encoreRef.current.played) startEncore();
        else endSong();
      }
    }, 1000);
    return () => { clearInterval(iv); clearInterval(sec); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const startSong = useCallback((idx) => {
    initAudioContext();
    const chosen = (typeof idx === 'number') ? idx : Math.floor(Math.random() * SONGS.length);
    setSongIndex(chosen);
    meterRef.current = 0; comboRef.current = 0; peakRef.current = 0;
    inPocketRef.current = 0; reachedLegendRef.current = false; lastTierRef.current = 'Garage Band';
    holdingRef.current = false; lastOnsetRef.current = 0; lastScoredRef.current = -1;
    onsetsRef.current = []; holdStartRef.current = 0; setTierFlash(null); setBurst(null); setShouts([]); setCrowdBurst(0);
    encoreRef.current = { played: false, hits: 0, misses: 0 };
    timeLeftRef.current = SONG_SECONDS;
    setMeter(0); setCombo(0); setTimeLeft(SONG_SECONDS);
    setScreen('ready'); setReadyCount(3);
  }, [initAudioContext]);

  // The crowd wants MORE: a 10-second encore with the band kicked up a notch.
  const startEncore = useCallback(() => {
    encoreRef.current = { played: true, hits: 0, misses: 0 };
    timeLeftRef.current = ENCORE_SECONDS;
    setTimeLeft(ENCORE_SECONDS);
    comboRef.current = 0; setCombo(0);
    band.setTempoScale(ENCORE_TEMPO);
    cheer(true);
    const id = Date.now();
    setTierFlash({ label: 'ENCORE', color: ENCORE_COLOR, id });
    setTimeout(() => setTierFlash((f) => (f && f.id === id ? null : f)), 1500);
    setBurst({ id, mega: true });
    setTimeout(() => setBurst((b) => (b && b.id === id ? null : b)), 2600);
    setCrowdBurst(id);
    pushShout(CROWD_MEMBERS.length);
    say('charlie.shred.encore', { delayMs: 300 });
    setScreen('encore');
  }, [band, cheer, pushShout]);

  // ready countdown 3-2-1 then start band + play
  useEffect(() => {
    if (screen !== 'ready') return;
    if (readyCount <= 0) {
      band.start(songIndex);
      setScreen('playing');
      return;
    }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [screen, readyCount, band, songIndex]);

  const endSong = useCallback(() => {
    band.stop();
    setScreen('result');
    reportQuestEvent('shred_show', { inPocket: inPocketRef.current });
    // Award rhythm achievement ladder + the Shred Legend collectible.
    if (inPocketRef.current >= 8) earnAchievementUpTo('rhythm', 'cadet');
    if (peakRef.current >= 60) earnAchievementUpTo('rhythm', 'pro');
    if (reachedLegendRef.current) {
      earnAchievementUpTo('rhythm', 'master');
      earnSticker('shred_legend');
    }
    // Flawless encore (no OFF BEAT / TOO WILD, at least 8 timed hits) = double stickers.
    const enc = encoreRef.current;
    if (enc.played && enc.misses === 0 && enc.hits >= 8) { earnSticker('shred_encore'); say('charlie.shred.flawless', { delayMs: 600 }); }
  }, [band]);

  useEffect(() => () => band.stop(), [band]);

  const currentTier = tierFor(meter);
  const energy = Math.min(1, meter / 100);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      data-testid="shred-legend-page"
      style={{
        backgroundImage: 'url(assets/backgrounds/shred-stage-jma.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundColor: '#8A8F96',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,20,32,0) 0%, rgba(10,20,32,0) 55%, rgba(10,20,32,0.35) 100%)' }} />

      {(screen === 'playing' || screen === 'ready' || screen === 'encore') && <StageLights energy={screen === 'encore' ? 1 : energy} style={screen === 'encore' ? 'punk' : SONGS[songIndex].style} />}

      <GameHeader title="SHRED CITY" showHomeButton={true} backLink={{ to: '/play', label: 'Play' }} />

      {/* Crowd during the 3-2-1 countdown (sits on stage, bottom layer) */}
      {screen === 'ready' && (
        <div className="absolute left-0 right-0 bottom-0" style={{ height: '38vh', maxHeight: 300, zIndex: 6 }}>
          <CrowdRow energy={0.15} />
        </div>
      )}

      {/* Floating feedback */}
      <AnimatePresence>
        {floats.map((f) => (
          <motion.div
            key={f.id}
            className="absolute left-1/2 top-[38%] font-black font-display pointer-events-none"
            style={{ color: f.color, textShadow: '0 3px 0 #0A1420, 0 0 18px rgba(0,0,0,0.5)', fontSize: f.big ? '40px' : '26px', zIndex: 30, marginLeft: f.dx }}
            initial={{ y: 0, opacity: 0, scale: 0.5, x: '-50%', rotate: f.big ? -8 : 0 }}
            animate={{ y: f.big ? -70 : -50, opacity: 1, scale: f.big ? 1.25 : 1.05, x: '-50%', rotate: f.big ? 4 : 0 }}
            exit={{ opacity: 0, y: -90, scale: 0.9 }}
            transition={{ duration: 0.45, type: 'spring', stiffness: 260, damping: 16 }}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Tier-up banner + screen flash */}
      <AnimatePresence>
        {tierFlash && (
          <motion.div
            key={tierFlash.id}
            data-testid="shred-tier-flash"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 35 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: tierFlash.color, mixBlendMode: 'screen' }}
              initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }}
            />
            <motion.div
              className="relative px-6 py-3 rounded-2xl font-black font-display text-center"
              style={{ background: 'rgba(16,24,38,0.92)', border: `4px solid ${tierFlash.color}`, color: tierFlash.color, boxShadow: `0 0 40px ${tierFlash.color}`, fontSize: 'clamp(28px, 7vw, 56px)', textShadow: '0 3px 0 #0A1420' }}
              initial={{ scale: 0.4, rotate: -10, y: 40 }}
              animate={{ scale: [0.4, 1.15, 1], rotate: [-10, 3, 0], y: 0 }}
              exit={{ scale: 1.2, opacity: 0, y: -40 }}
              transition={{ duration: 0.55 }}
            >
              <div className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-white/80 mb-1">The crowd says</div>
              {tierFlash.label}!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {burst && (
        <div key={burst.id} className="absolute left-1/2 top-[35%] pointer-events-none" style={{ zIndex: 36 }} data-testid="shred-confetti-burst">
          <Confetti mega={burst.mega} count={burst.mega ? 40 : 26} testId="shred-confetti" />
        </div>
      )}

      <main className="shred-main relative z-10 flex-1 flex flex-col items-center justify-end pt-16 pb-2 px-2">
        {/* INTRO */}
        {screen === 'intro' && (
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            <motion.div
              data-testid="shred-intro-card"
              className="shred-intro-card max-w-md w-full text-center rounded-3xl px-6 py-7 relative"
              style={{ background: 'rgba(16,24,38,0.92)', border: '4px solid #FFCC00', boxShadow: '0 8px 0 0 #0A1420', maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              <HowToVoiceButton lineId="charlie.howto.shred" className="absolute top-3 right-3 z-10" dark />
              <img src="assets/characters/charlie-punk.png" alt="" className="w-28 h-28 object-contain mx-auto mb-1" />
              <h1 className="font-black font-display text-white text-4xl leading-none mb-2">SHRED CITY</h1>
              <p className="text-xs mb-3" style={{ color: '#9DB4CC' }}>
                Pick your jam, then <span style={{ color: '#FFCC00' }}>solo</span> on the strip (no wrong notes!). Play <b>in time</b> to fill the <b>Crowd Meter</b> — keep a streak going for <span style={{ color: '#FF9500' }}>×2</span>. Quick runs are cool — but mashing makes the crowd boo!
              </p>
              <div className="grid grid-cols-1 gap-2 mb-2" data-testid="shred-song-picker">
                {SONGS.map((s, i) => (
                  <button
                    key={s.name}
                    data-testid={`shred-song-${i}`}
                    onClick={() => startSong(i)}
                    className="w-full rounded-xl px-4 py-2.5 flex items-center justify-between font-black touch-manipulation border-2"
                    style={{ background: '#243854', borderColor: '#FFCC00', color: '#E8F4FF' }}
                  >
                    <span className="flex items-center gap-2"><Play className="w-4 h-4 fill-current" style={{ color: '#FFCC00' }} /> {s.name}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#9DB4CC' }}>{s.bpm} bpm</span>
                  </button>
                ))}
              </div>
              <button
                data-testid="shred-start-btn"
                onClick={() => startSong()}
                className="chunky-btn text-[var(--jma-dark)] w-full px-6 py-3 flex items-center justify-center gap-2 text-lg font-black touch-manipulation"
                style={{ backgroundColor: '#FFCC00' }}
              >
                <Play className="w-5 h-5 fill-current" /> Surprise Me!
              </button>
            </motion.div>
          </div>
        )}

        {/* READY countdown */}
        {screen === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <motion.div
              key={readyCount}
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ opacity: 0 }}
              className="font-black font-display text-white"
              style={{ fontSize: '120px', textShadow: '0 4px 0 #0A1420' }}
              data-testid="shred-ready-count"
            >
              {readyCount > 0 ? readyCount : 'GO!'}
            </motion.div>
          </div>
        )}

        {/* PLAYING HUD + crowd + guitar */}
        {(screen === 'playing' || screen === 'encore') && (
          <div className="w-full max-w-[900px] flex-1 flex flex-col items-center gap-2" data-encore={screen === 'encore' ? 'true' : 'false'}>
            {/* Crowd meter */}
            <div className="w-full max-w-[640px]" data-testid="shred-crowd-meter">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-white/90" data-testid="shred-song-name">
                  ♪ {SONGS[songIndex].name}
                </span>
                {screen === 'encore' ? (
                  <motion.span
                    className="text-sm md:text-base font-black uppercase tracking-wider"
                    style={{ color: ENCORE_COLOR, textShadow: '0 0 12px rgba(255,45,133,0.8)' }}
                    data-testid="shred-encore-label"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    ENCORE! {encoreRef.current.misses === 0 ? 'FLAWLESS' : ''}
                  </motion.span>
                ) : (
                  <span className="text-sm font-black uppercase tracking-wider" style={{ color: currentTier.color }} data-testid="shred-tier-label">
                    {currentTier.label}
                  </span>
                )}
                <span className="text-xs font-black" style={{ color: screen === 'encore' ? ENCORE_COLOR : 'rgba(255,255,255,0.9)' }} data-testid="shred-timeleft">{timeLeft}s</span>
              </div>
              <motion.div
                className="relative w-full h-6 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(10,20,32,0.8)',
                  border: '3px solid #0A1420',
                  boxShadow: `0 0 ${Math.round(4 + energy * 22)}px rgba(255,204,0,${(0.15 + energy * 0.65).toFixed(2)})`,
                }}
                key={hitPulse}
                initial={{ scale: 1 }}
                animate={{ scale: hitPulse ? [1.035, 1] : 1 }}
                transition={{ duration: 0.22 }}
              >
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ background: screen === 'encore' ? `linear-gradient(90deg, #FF2D85, #FF6B9D, #FFCC00)` : `linear-gradient(90deg, #0FA3B1, #FF9500, #FFCC00)` }}
                  animate={{ width: `${meter}%` }}
                  transition={{ duration: 0.12 }}
                  data-testid="shred-meter-fill"
                >
                  <div
                    className="absolute inset-y-0 w-1/3"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                      animation: `submenuSheen ${Math.max(0.9, 2.6 - energy * 1.6)}s linear infinite`,
                    }}
                  />
                </motion.div>
                {TIERS.slice(1).map((t) => (
                  <div key={t.label} className="absolute top-0 bottom-0" style={{ left: `${t.min}%`, width: 2, background: 'rgba(255,255,255,0.4)' }} />
                ))}
              </motion.div>
              {combo >= 3 && (
                <motion.div
                  className="flex items-center justify-center gap-2 mt-1"
                  data-testid="shred-combo"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <span className="text-xs md:text-sm font-black font-display" style={{ color: '#FFCC00', textShadow: '0 2px 0 #0A1420' }}>
                    {combo} IN A ROW!
                  </span>
                  {combo >= 6 && (
                    <motion.span
                      data-testid="shred-multiplier"
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] md:text-xs font-black"
                      style={{ background: combo >= 12 ? '#FF3B30' : '#FF9500', color: 'white', boxShadow: '0 2px 0 0 #0A1420' }}
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: combo >= 12 ? 0.5 : 0.8 }}
                    >
                      <Flame className="w-3 h-3" fill="currentColor" /> {combo >= 12 ? '×2 ON FIRE' : '×1.5'}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Reacting crowd (their own band characters) — fixed-height band
                pushed to sit right above the guitar so sizes stay consistent
                and nobody balloons while the guitar samples load. */}
            <div
              className="w-full mt-auto flex items-end justify-center"
              style={{ height: 'clamp(84px, 17vh, 140px)' }}
              data-testid="shred-crowd"
            >
              <CrowdRow energy={energy} burstId={crowdBurst} shouts={shouts} avatarSrc={readAvatarOutfit().src} avatarHelmet={!!readAvatarOutfit().helmet} />
            </div>

            {/* Guitar */}
            <GuitarInstrument
              initAudioContext={initAudioContext}
              getAudioGraph={getAudioGraph}
              onPlay={onGuitarPlay}
              onActiveChange={onGuitarActive}
            />
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && (
          <div className="flex-1 flex items-center justify-center w-full">
            <FitBox className="w-full max-w-md">
            <motion.div
              data-testid="shred-result-card"
              className="max-w-md w-full text-center rounded-3xl px-6 py-7"
              style={{ background: 'rgba(16,24,38,0.95)', border: `4px solid ${tierFor(peakRef.current).color}`, boxShadow: '0 8px 0 0 #0A1420' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              {reachedLegendRef.current && (
                <>
                  <div className="absolute left-1/2 top-1/3 pointer-events-none"><Confetti mega testId="shred-result-confetti" /></div>
                  <motion.img
                    src="assets/characters/charlie-punk.png" alt="" className="w-32 h-32 object-contain mx-auto mb-1"
                    animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.9 }}
                  />
                </>
              )}
              <div className="flex items-center justify-center gap-1 mb-2" data-testid="shred-result-stars">
                {[30, 60, 90].map((min, i) => (
                  <motion.span
                    key={min}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.25 + i * 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <Star className="w-8 h-8" style={{ color: peakRef.current >= min ? '#FFCC00' : '#3A4A60' }} fill={peakRef.current >= min ? '#FFCC00' : 'transparent'} strokeWidth={2.5} />
                  </motion.span>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#9DB4CC' }}>You played the</p>
              <h1 className="font-black font-display text-4xl leading-none mb-2" style={{ color: tierFor(peakRef.current).color }} data-testid="shred-result-tier">
                {tierFor(peakRef.current).label}
              </h1>
              <p className="text-sm font-bold text-white mb-1">
                {reachedLegendRef.current
                  ? 'You maxed the Crowd Meter — the place went NUTS!'
                  : `${inPocketRef.current} notes right in the pocket.`}
              </p>
              {encoreRef.current.played && (
                <p className="text-sm font-black mb-1" style={{ color: ENCORE_COLOR }} data-testid="shred-result-encore">
                  {encoreRef.current.misses === 0 && encoreRef.current.hits >= 8
                    ? `FLAWLESS ENCORE — ${encoreRef.current.hits} notes, zero misses! Double stickers!`
                    : `Encore: ${encoreRef.current.hits} notes in time, ${encoreRef.current.misses} slip${encoreRef.current.misses === 1 ? '' : 's'}.`}
                </p>
              )}
              <p className="text-xs mb-4" style={{ color: '#9DB4CC' }}>
                {reachedLegendRef.current
                  ? (encoreRef.current.misses === 0 && encoreRef.current.hits >= 8 ? 'Shred Legend + Encore! stickers unlocked!' : 'Shred Legend sticker unlocked! Play a flawless encore for a second sticker.')
                  : 'Play in time and keep your streak going for ×2 to fill the meter!'}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  data-testid="shred-again-btn"
                  onClick={() => startSong()}
                  className="chunky-btn text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                  style={{ backgroundColor: '#FFCC00' }}
                >
                  <RotateCcw className="w-5 h-5" /> Random
                </button>
                <button
                  data-testid="shred-pick-btn"
                  onClick={() => setScreen('intro')}
                  className="chunky-btn bg-white text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                >
                  <Play className="w-4 h-4 fill-current" /> Pick Song
                </button>
                <button
                  data-testid="shred-back-btn"
                  onClick={() => navigate('/play')}
                  className="chunky-btn bg-white text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              </div>
            </motion.div>
            </FitBox>
          </div>
        )}
      </main>
    </div>
  );
}
