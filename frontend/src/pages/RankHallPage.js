// RankHallPage — inside the Bandstand. The kid's own avatar stands center stage
// under a spotlight, the band cheers from the pit, the trophy shelf of ranks sits
// behind, and "TAKE A BOW!" sets off the crowd. Tap a trophy → Charlie explains it.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, BookOpen, Hand, Heart, Music, VolumeX, ListMusic, Square, Zap, Camera } from 'lucide-react';
import { ACHIEVEMENT_STICKERS } from '../data/achievements';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import usePlayer from '../hooks/usePlayer';
import { useAudio } from '../hooks/useAudio';
import useBeatLabAudio from '../hooks/useBeatLabAudio';
import useBeatLoopPlayer from '../hooks/useBeatLoopPlayer';
import useSongLoopPlayer from '../hooks/useSongLoopPlayer';
import { TOTAL_SLOTS, MOODS } from '../data/songStudio';
import stageLayout from '../data/stageLayout.json';
import { useStreetMusic } from './CampusMapPage';
import { readAvatarOutfit } from '../hooks/useAvatar';
import AvatarSprite from '../components/AvatarSprite';
import Confetti from '../components/Confetti';
import { GameHeader } from '../components/GameUI';
import SetlistPicker from '../components/SetlistPicker';
import { PosterModal, savePoster } from '../components/StagePoster';
import { CrowdRow, CROWD_SHOUTS } from './ShredLegendPage';

const FANFARE = ['C4', 'E4', 'G4', 'C5'];
const STAGE = stageLayout;
const RIG_SWING = [9, 7, 6, 6, 7, 9];
// Tap a lamp → cycle its gel. 0 = natural (plain beam), then colored gels via CSS filter.
const GELS = [null, 0, 35, 60, 110, 170, 215, 290];
const gelFilter = (g) => (g == null ? 'none' : `sepia(1) saturate(5) hue-rotate(${g}deg) brightness(1.1)`);
const NO_TRACKS = [];
// layout json is in 1920x1080 px → % so the scene box can be any size
const pos = (m) => ({ left: `${m.x / 19.2}%`, top: `${m.y / 10.8}%`, width: `${m.w / 19.2}%`, height: `${m.h / 10.8}%` });
const SFX = (file, vol, delay) => setTimeout(() => { const a = new Audio(encodeURI(`assets/audio/${file}`)); a.volume = vol; a.play().catch(() => {}); }, delay);
const HALL_TRACKS = [{ src: 'assets/music/magic.mp3', title: 'Magic' }, { src: 'assets/music/brand-new-friend.mp3', title: 'Brand New Friend' }];
const OVATION_AT = 3;

// Camera flashes + hearts/notes rising from the pit on every bow.
function CrowdBurst({ id, big }) {
  const n = big ? 27 : 9;
  const items = Array.from({ length: n }, (_, i) => ({ x: 6 + ((i * 37 + id * 13) % 88), d: (i % 5) * 0.12, heart: i % 3 !== 0 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 8 }} aria-hidden="true">
      {items.map((it, i) => (
        <motion.span key={`${id}-${i}`} className="absolute" style={{ left: `${it.x}%`, bottom: '16%', color: it.heart ? '#FF2D85' : '#FFCC00' }}
          initial={{ y: 0, opacity: 0, scale: 0.4 }} animate={{ y: [0, -140 - (i % 4) * 40], opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 0.8], x: [0, (i % 2 ? 1 : -1) * (12 + (i % 3) * 10)] }} transition={{ duration: 1.5 + it.d, delay: it.d, ease: 'easeOut' }}>
          {it.heart ? <Heart className="w-5 h-5" fill="currentColor" strokeWidth={0} /> : <Music className="w-5 h-5" strokeWidth={3} />}
        </motion.span>
      ))}
      {Array.from({ length: big ? 15 : 5 }, (_, i) => (
        <motion.span key={`f${id}-${i}`} className="absolute rounded-full bg-white" style={{ left: `${10 + ((i * 53 + id * 7) % 80)}%`, bottom: `${3 + (i % 3) * 5}%`, width: 14, height: 14, boxShadow: '0 0 24px 10px rgba(255,255,255,0.9)' }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.25, delay: 0.15 + i * 0.18 }} />
      ))}
    </div>
  );
}

// Hand-drawn curtain-opening frames from the PSD: closed → 4 bunching frames,
// then the overlay unmounts and the permanent LC/RC side curtains remain.
const CURTAIN_HOLD = 700;
const CURTAIN_STEP = 150;
function CurtainReveal({ scene, onDone }) {
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const loaded = useRef(0);
  const onLoad = () => { loaded.current += 1; if (loaded.current >= 10) setReady(true); };
  // Safety: start anyway if some frame is slow (the solid backdrop hides the stage meanwhile)
  useEffect(() => { const t = setTimeout(() => setReady(true), 2500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!ready) return undefined;
    const ids = [];
    ids.push(setTimeout(() => SFX('Crash cymbal.mp3', 0.3, 0), CURTAIN_HOLD - 80));
    for (let i = 1; i <= 4; i++) ids.push(setTimeout(() => setFrame(i), CURTAIN_HOLD + (i - 1) * CURTAIN_STEP));
    ids.push(setTimeout(onDone, CURTAIN_HOLD + 4 * CURTAIN_STEP));
    return () => ids.forEach(clearTimeout);
  }, [ready, onDone]);
  return (
    <>
      {/* solid blackout under the frames so nothing shows while the art is still downloading */}
      {frame === 0 && <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 19, background: '#7A1218' }} />}
      <div aria-hidden="true" data-testid="rank-hall-curtain-reveal" data-frame={frame} data-ready={ready ? 'true' : 'false'} className="absolute pointer-events-none" style={{ width: scene.w, height: scene.h, left: scene.left, top: scene.top, zIndex: 20 }}>
        {STAGE.curtainLeft.map((m, i) => <img key={`l${i}`} src={`assets/stage/cl-${i}.webp`} alt="" draggable={false} onLoad={onLoad} className="absolute" style={{ ...pos(m), visibility: i === frame ? 'visible' : 'hidden' }} />)}
        {STAGE.curtainRight.map((m, i) => <img key={`r${i}`} src={`assets/stage/cr-${i}.webp`} alt="" draggable={false} onLoad={onLoad} className="absolute" style={{ ...pos(m), visibility: i === frame ? 'visible' : 'hidden' }} />)}
      </div>
    </>
  );
}

// Scrolling ticker of the badges this kid has actually earned.
function BadgeTicker({ names }) {
  const text = names.length ? names.map((n) => `★ ${n}`).join('   ') + '   ' : '★ Earn badges in the games to light up this hall   ';
  return (
    <div className="absolute right-0 overflow-hidden pointer-events-none" style={{ left: 96, top: 'calc(13% + 6px)', height: 18, zIndex: 3 }} data-testid="rank-hall-ticker">
      <motion.div className="whitespace-nowrap font-black text-[11px] tracking-wider" style={{ color: '#FFE8A3', textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}
        animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: Math.max(14, names.length * 4), ease: 'linear' }}>
        {text}{text}
      </motion.div>
    </div>
  );
}

// Kick → crunchy guitar C-E-G-C → crash. Rock fanfare, not a recital.
export function playFanfare() {
  SFX('Bass drum - kick.mp3', 0.9, 0);
  FANFARE.forEach((n, i) => SFX(`guitar-crunch/${n}.mp3`, 0.55, 60 + i * 120));
  SFX('Crash cymbal.mp3', 0.6, 60 + FANFARE.length * 120);
}

export default function RankHallPage() {
  const navigate = useNavigate();
  const { currentRank } = useRank();
  const { earned } = useStickers();
  const { player } = usePlayer();
  const badgeNames = ACHIEVEMENT_STICKERS.filter((a) => earned[a.id]).map((a) => a.name);
  const avatar = readAvatarOutfit();
  const [bow, setBow] = useState(0);
  const [energy, setEnergy] = useState(0.3);
  const [shouts, setShouts] = useState([]);
  const [confetti, setConfetti] = useState(0);
  const [hype, setHype] = useState(0);
  const [ovation, setOvation] = useState(false);
  const [curtain, setCurtain] = useState(true);
  const curtainDone = useCallback(() => setCurtain(false), []);
  const timers = useRef([]);
  const hypeTimer = useRef(null);
  // light show: per-lamp gel index + a running "show" that cycles them and strobes
  const [gels, setGels] = useState([0, 0, 0, 0, 0, 0]);
  const [show, setShow] = useState(false);
  const showTimer = useRef(null);
  // performing one of the kid's own tracks
  const [picker, setPicker] = useState(false);
  const [perf, setPerf] = useState(null);
  const [perfPct, setPerfPct] = useState(0);
  const perfTimer = useRef(null);
  const lastSong = useRef(null);
  const { playBellNote, playDrumSound, initAudioContext, getAudioGraph } = useAudio();
  const lab = useBeatLabAudio(getAudioGraph, initAudioContext);
  const beatPlayer = useBeatLoopPlayer({ playBellNote, playDrumSound, initAudioContext, lab });
  const songPlayer = useSongLoopPlayer();
  const { nowPlaying, muted, toggleMute } = useStreetMusic(perf ? NO_TRACKS : HALL_TRACKS);
  // SNAP! poster
  const [flash, setFlash] = useState(0);
  const [poster, setPoster] = useState(null);
  // The painted stage (JELLY STAGE.psd → assets/stage/*): 16:9 plate sized like background-size: cover, bottom-anchored.
  const [scene, setScene] = useState({ w: 1920, h: 1080, left: 0, top: 0 });
  useLayoutEffect(() => {
    const fit = () => { const vw = window.innerWidth, vh = window.innerHeight; const sc = Math.max(vw / 1920, vh / 1080); const w = 1920 * sc, h = 1080 * sc; setScene({ w, h, left: (vw - w) / 2, top: (vh - h) * 0.45 }); };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(hypeTimer.current); clearInterval(showTimer.current); clearInterval(perfTimer.current); }, []);

  const cheer = useCallback((big) => {
    setBow((b) => b + 1); setEnergy(1); setConfetti((c) => c + 1); playFanfare();
    if (big) { timers.current.push(setTimeout(playFanfare, 500)); setOvation(true); timers.current.push(setTimeout(() => setOvation(false), 3200)); }
    const members = big ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 2, 4, 6];
    setShouts(members.map((m, i) => ({ id: Date.now() + i, member: m, text: CROWD_SHOUTS[(m + i + bow) % CROWD_SHOUTS.length] })));
    timers.current.push(setTimeout(() => { setEnergy(0.3); setShouts([]); }, big ? 4200 : 2600));
  }, [bow]);

  const takeBow = useCallback(() => {
    const nextHype = hype + 1;
    const big = nextHype >= OVATION_AT;
    cheer(big);
    setHype(big ? 0 : nextHype);
    clearTimeout(hypeTimer.current); hypeTimer.current = setTimeout(() => setHype(0), 7000);
  }, [hype, cheer]);

  // Light show: every lamp steps to the next gel on a beat, strobe on the wall, rigs swing fast.
  const cycleGel = useCallback((i) => setGels((g) => g.map((v, k) => (k === i ? (v + 1) % GELS.length : v))), []);
  const startShow = useCallback((ms) => {
    clearInterval(showTimer.current);
    setShow(true); setEnergy(1);
    showTimer.current = setInterval(() => setGels((g) => g.map((v, k) => ((v + 1 + (k % 2)) % (GELS.length - 1)) + 1)), 180);
    if (ms) timers.current.push(setTimeout(() => { clearInterval(showTimer.current); setShow(false); setEnergy(0.3); }, ms));
  }, []);
  const stopShow = useCallback(() => { clearInterval(showTimer.current); setShow(false); }, []);
  const lightShow = useCallback(() => { if (show) { stopShow(); setEnergy(0.3); } else startShow(6000); }, [show, startShow, stopShow]);

  // Perform: play the kid's track for a few passes (~20s), lights + crowd go, then a big cheer.
  const endPerf = useCallback((early) => {
    clearInterval(perfTimer.current);
    beatPlayer.stop(); songPlayer.stop();
    stopShow();
    setPerf(null); setPerfPct(0);
    cheer(!early);
  }, [beatPlayer, songPlayer, stopShow, cheer]);
  const perform = useCallback(async (t) => {
    setPicker(false);
    initAudioContext();
    const passSec = t.kind === 'beat' ? (60 / t.data.bpm / 4) * t.data.totalSteps : TOTAL_SLOTS * 60 / (t.data.bpm || MOODS[t.data.moodId]?.bpm || 100);
    const total = Math.max(2, Math.round(20 / passSec)) * passSec * 1000;
    lastSong.current = t.name;
    setPerf({ name: t.name, total });
    if (t.kind === 'beat') await beatPlayer.start(t.data); else await songPlayer.start(t.data);
    startShow();
    const t0 = Date.now();
    clearInterval(perfTimer.current);
    perfTimer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - t0) / total) * 100);
      setPerfPct(pct);
      if (pct >= 100) endPerf(false);
    }, 200);
  }, [initAudioContext, beatPlayer, songPlayer, startShow, endPerf]);

  // SNAP! camera flash → poster saved for the Yearbook wall.
  const snap = useCallback(() => {
    setFlash((f) => f + 1);
    SFX('xylo High c.mp3', 0.5, 0);
    const p = savePoster({ name: player?.displayName || 'Student', rank: currentRank.title, rankColor: currentRank.color, avatarSrc: avatar.src, helmet: !!avatar.helmet, song: lastSong.current });
    timers.current.push(setTimeout(() => setPoster(p), 450));
  }, [player, currentRank, avatar]);


  return (
    <div className="relative overflow-hidden" data-testid="rank-hall-page" style={{ height: '100dvh', minHeight: '100vh', background: '#6E7480' }}>
      {/* painted stage (JELLY STAGE.psd): gradient wall, floor, 6 swinging light rigs, podium, top curtain */}
      <div aria-hidden="true" data-testid="rank-hall-scene" className="absolute pointer-events-none" style={{ width: scene.w, height: scene.h, left: scene.left, top: scene.top, zIndex: 1, background: 'radial-gradient(ellipse at 50% 35%, #4A5570 0%, #2E3650 45%, #1A2038 80%, #10141F 100%)' }}>
        <img src="assets/stage/floor.webp" alt="" draggable={false} className="absolute" style={pos(STAGE.floor)} />
        {STAGE.rigs.map((r, i) => (
          <motion.img key={i} src={`assets/stage/rig-${i + 1}.webp`} alt="" draggable={false} data-testid={`rank-hall-rig-${i + 1}`} data-gel={gels[i]} className="absolute" style={{ ...pos(r), transformOrigin: `${r.px}% ${r.py}%`, filter: gelFilter(GELS[gels[i]]), transition: 'filter 120ms linear' }}
            animate={{ rotate: [-RIG_SWING[i], RIG_SWING[i], -RIG_SWING[i]] }} transition={{ repeat: Infinity, duration: energy > 0.5 ? 1.6 + i * 0.15 : 3.2 + i * 0.35, ease: 'easeInOut', delay: i * 0.3 }} />
        ))}
        {/* strobe on the back wall during a light show */}
        {show && <motion.div data-testid="rank-hall-strobe" className="absolute inset-0" style={{ background: 'white', mixBlendMode: 'overlay' }} animate={{ opacity: [0, 0.55, 0] }} transition={{ repeat: Infinity, duration: 0.36, ease: 'linear' }} />}
        <img src="assets/stage/riser.webp" alt="" draggable={false} className="absolute" style={pos(STAGE.riser)} />
        <img src="assets/stage/tc.webp" alt="" draggable={false} className="absolute" style={{ ...pos(STAGE.tc), zIndex: 3 }} />
        <img src="assets/stage/lc.webp" alt="" draggable={false} data-testid="rank-hall-curtain-left" className="absolute" style={{ ...pos(STAGE.lc), zIndex: 3 }} />
        <img src="assets/stage/rc.webp" alt="" draggable={false} data-testid="rank-hall-curtain-right" className="absolute" style={{ ...pos(STAGE.rc), zIndex: 3 }} />
      </div>
      <BadgeTicker names={badgeNames} />
      {/* tap a lamp head to change its gel */}
      {STAGE.rigs.map((r, i) => (
        <button key={`lamp-${i}`} type="button" data-testid={`rank-hall-lamp-${i + 1}`} aria-label={`Stage light ${i + 1}`} onClick={() => cycleGel(i)}
          className="absolute rounded-full bg-transparent border-0 p-0 cursor-pointer"
          style={{ left: scene.left + scene.w * (r.x + r.w * r.px / 100) / 1920 - scene.w * 0.03, top: scene.top + scene.h * (r.y + r.h * r.py / 100) / 1080 - scene.w * 0.03, width: scene.w * 0.06, height: scene.w * 0.06, zIndex: 4 }} />
      ))}
      {curtain && <CurtainReveal scene={scene} onDone={curtainDone} />}
      <GameHeader title="The Stage" showHomeButton={true} backTo="/home" />

      {/* marquee: your rank in lights */}
      <motion.div className="absolute left-1/2 flex items-center gap-2 rounded-full px-4 py-1 whitespace-nowrap" data-testid="rank-hall-marquee"
        style={{ x: '-50%', top: '13%', marginTop: -16, zIndex: 6, background: 'radial-gradient(circle, #FFF2A8 0 2.5px, rgba(255,255,255,0) 3.5px) 1px 1px / 14px 14px, var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <span className="rounded-full px-3 py-0.5 font-black font-display text-sm md:text-base flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}>
          <Star className="inline w-4 h-4 -mt-0.5" strokeWidth={3} />
          {player?.displayName && <span data-testid="rank-hall-marquee-name" className="truncate" style={{ maxWidth: '40vw' }}>{player.displayName.toUpperCase()}<span className="opacity-50 mx-1">·</span></span>}
          {currentRank.title.toUpperCase()}
          <Star className="inline w-4 h-4 -mt-0.5" strokeWidth={3} />
        </span>
        {perf && (
          <span data-testid="rank-hall-now-performing" className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 flex flex-col items-center whitespace-nowrap">
            <span className="rounded-full px-3 py-0.5 text-[10px] md:text-xs font-black text-white" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }}>NOW PLAYING: {perf.name}</span>
            <span className="mt-1 h-1.5 w-40 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid var(--jma-dark)' }}><span className="block h-full" style={{ width: `${perfPct}%`, background: '#FFCC00' }} /></span>
          </span>
        )}
      </motion.div>

      {/* now playing / mute */}
      {nowPlaying && (
        <button type="button" data-testid="rank-hall-now-playing" data-muted={muted ? 'true' : 'false'} onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="rank-hall-music absolute flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black cursor-pointer" style={{ right: '2%', top: 'calc(13% + 28px)', zIndex: 6, background: 'rgba(10,37,64,0.85)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)', opacity: muted ? 0.7 : 1 }}>
          {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={3} /> : <motion.span animate={{ rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}><Music className="w-3.5 h-3.5" strokeWidth={3} /></motion.span>}
          <span style={{ textDecoration: muted ? 'line-through' : 'none' }}>{nowPlaying}</span>
        </button>
      )}

      <motion.button type="button" data-testid="rank-hall-you" onClick={takeBow} aria-label="Take a bow"
        className="rank-hall-you absolute bg-transparent border-0 p-0 cursor-pointer flex flex-col items-center" style={{ left: scene.left + scene.w * 0.505, top: scene.top + scene.h * 0.70, transform: 'translate(-50%, -100%)', height: scene.h * 0.3, zIndex: 5 }}>
        <motion.div key={bow} className="h-full flex items-end" style={{ transformOrigin: 'bottom center' }}
          animate={bow ? { rotate: [0, 0, -22, -22, 0], y: [0, -26, 0, 0, 0] } : { y: [0, -4, 0] }} transition={bow ? { duration: 1.4, times: [0, 0.2, 0.45, 0.8, 1] } : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
          <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} className="h-full w-auto" imgStyle={{ height: '100%', width: 'auto', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.45))' }} />
        </motion.div>
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-black text-white whitespace-nowrap" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }}>YOU</span>
      </motion.button>

      {/* buttons on the lip of the stage */}
      <div className="rank-hall-actions absolute left-1/2 -translate-x-1/2 flex flex-nowrap justify-center gap-2 whitespace-nowrap" style={{ bottom: '20%', zIndex: 6 }}>
        <motion.button type="button" data-testid="rank-hall-bow" onClick={takeBow} className="chunky-btn px-4 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FF2D85', color: 'white' }}
          animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}><Hand className="w-4 h-4" strokeWidth={3} /> TAKE A BOW!
          <span className="flex items-center gap-0.5 ml-1" data-testid="rank-hall-hype" data-hype={hype}>{Array.from({ length: OVATION_AT }, (_, i) => <Heart key={i} className="w-3 h-3" fill={i < hype ? 'white' : 'none'} strokeWidth={3} />)}</span></motion.button>
        {perf ? (
          <button type="button" data-testid="rank-hall-stop-song" onClick={() => endPerf(true)} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5 text-white animate-pulse" style={{ background: 'var(--jma-dark)' }}><Square className="w-4 h-4 fill-current" strokeWidth={3} /> STOP</button>
        ) : (
          <button type="button" data-testid="rank-hall-play-song" onClick={() => setPicker(true)} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5 text-white" style={{ background: '#1E9BFF' }}><ListMusic className="w-4 h-4" strokeWidth={3} /> PLAY MY SONG</button>
        )}
        <button type="button" data-testid="rank-hall-light-show" data-on={show ? 'true' : 'false'} onClick={lightShow} disabled={!!perf} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: show ? 'var(--jma-dark)' : '#8E44AD', color: 'white', opacity: perf ? 0.6 : 1 }}><Zap className="w-4 h-4" strokeWidth={3} fill={show ? 'currentColor' : 'none'} /> LIGHT SHOW</button>
        <button type="button" data-testid="rank-hall-snap" onClick={snap} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: 'white', color: 'var(--jma-dark)' }}><Camera className="w-4 h-4" strokeWidth={3} /> SNAP!</button>
        <button type="button" data-testid="rank-hall-academy" onClick={() => navigate('/academy')} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><BookOpen className="w-4 h-4" strokeWidth={3} /> My Yearbook</button>
      </div>

      {/* the band cheers from the pit */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '20%', zIndex: 7 }}>
        <CrowdRow energy={energy} burstId={bow} shouts={shouts} extras={false} />
      </div>

      {bow > 0 && <CrowdBurst key={`burst-${bow}`} id={bow} big={ovation} />}
      <AnimatePresence>
        {ovation && (
          <motion.div key="ovation" data-testid="rank-hall-ovation" className="absolute left-1/2 px-6 py-2 rounded-2xl font-black font-display text-2xl md:text-4xl whitespace-nowrap"
            style={{ x: '-50%', top: '26%', zIndex: 30, background: '#FFCC00', color: 'var(--jma-dark)', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}
            initial={{ scale: 0, rotate: -8 }} animate={{ scale: [0, 1.2, 1], rotate: [-8, 4, -2] }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.6 }}>
            STANDING OVATION!
          </motion.div>
        )}
      </AnimatePresence>
      {confetti > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
          <Confetti key={confetti} mega testId="rank-hall-confetti" />
          {ovation && [-30, 30].map((dx) => (
            <div key={`${confetti}-${dx}`} className="absolute inset-0" style={{ transform: `translateX(${dx}%)` }}><Confetti mega /></div>
          ))}
        </div>
      )}
      {/* SNAP! camera flash */}
      <AnimatePresence>
        {flash > 0 && <motion.div key={`flash-${flash}`} data-testid="rank-hall-flash" className="fixed inset-0 pointer-events-none bg-white" style={{ zIndex: 75 }} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} />}
      </AnimatePresence>
      <AnimatePresence>
        {picker && <SetlistPicker key="setlist" onPick={perform} onClose={() => setPicker(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {poster && <PosterModal key="poster" poster={poster} onClose={() => setPoster(null)} />}
      </AnimatePresence>
    </div>
  );
}
