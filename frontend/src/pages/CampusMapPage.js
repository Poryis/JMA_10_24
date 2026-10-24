// Campus Map — an underwater panorama per street built from the user's own
// scene layers (water, wave bands, sand dunes, seaweed, shells, fish).
// Pan sideways along the sea floor; every room is a building with its host
// Jelly at the door. Locked rooms go dark. Tap an open door and YOUR Jelly
// swims over, shrinks into the doorway, then the camera zooms in.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, ChevronsRight, ArrowLeft, ArrowRight, X, VolumeX, Sparkles } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import BlimpFlyby from '../components/BlimpFlyby';
import { Bubbles, Swimmer, SandStrip, Seaweed, UW_ASSETS, UNDERWATER_WATER, FRONT_TROUGH } from '../components/UnderwaterBackdrop';
import AvatarSprite from '../components/AvatarSprite';
import DailyQuestCard from '../components/DailyQuestCard';
import FitBox from '../components/FitBox';
import { CAMPUS_ZONES, CAMPUS_BUILDINGS, PLAZA_ZONE, PLAZA_BUILDINGS } from '../data/campus';
import useUnlocks from '../hooks/useUnlocks';
import useRank from '../hooks/useRank';
import usePracticeStreak from '../hooks/usePracticeStreak';
import useDailyQuests from '../hooks/useDailyQuests';
import { readAvatarOutfit } from '../hooks/useAvatar';
import { loadSavedBeats } from '../hooks/useSavedBeats';
import { loadSavedSongs } from '../hooks/useSongLoopPlayer';
import { say, voiceEnabled } from '../lib/voice';
import { pickFeaturedEpisode } from '../data/jmatv';

// Shelf layout scales with the viewport: a building is ~46% of the screen
// height (capped by width) and everything else is derived from that.
const layoutFor = (w, h) => {
  const bw = Math.round(Math.max(120, Math.min(h * (h < 520 ? 0.62 : 0.46), w * 0.55, 440)));
  const k = bw / 230;
  return { bw, k, slot: Math.round(bw * 1.3), left: Math.round(bw * 1.05), sandBack: Math.round(bw * 0.8), sandFront: Math.round(bw * 0.5), floor: Math.round(bw * 0.24), lift: k, you: Math.round(Math.max(44, Math.min(72, bw * 0.28))) };
};
const SHOUTS = ['Hey!', 'Come in!', 'Over here!', 'Woo!', 'Jam time!', 'Psst!'];

function isNight() { const h = new Date().getHours(); return h >= 20 || h < 5; }

// Street music: a Jelly instrumental playlist per street. Shuffles, fades
// in, never repeats the same track back-to-back, stops when you leave.
const MUTE_KEY = 'jma_street_music_muted';
export function useStreetMusic(tracks) {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; } });
  const audioRef = useRef(null);
  const toggleMute = () => setMuted((m) => { const next = !m; try { localStorage.setItem(MUTE_KEY, next ? '1' : '0'); } catch (_) { /* ignore */ } return next; });
  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);
  useEffect(() => {
    setNowPlaying(null);
    if (!tracks || !tracks.length || !voiceEnabled()) return undefined;
    const a = new Audio(); a.preload = 'auto'; a.volume = 0; a.muted = muted; audioRef.current = a;
    let last = -1; let fade = null; let armed = false; let alive = true;
    const pick = () => { let i; do { i = Math.floor(Math.random() * tracks.length); } while (tracks.length > 1 && i === last); last = i; return tracks[i]; };
    const fadeIn = () => { clearInterval(fade); fade = setInterval(() => { if (!alive) return clearInterval(fade); a.volume = Math.min(0.16, a.volume + 0.02); if (a.volume >= 0.16) clearInterval(fade); }, 80); };
    const start = () => { if (!alive) return; const t = pick(); a.src = t.src; a.play().then(() => { fadeIn(); setNowPlaying(t.title); }).catch(() => {}); };
    a.addEventListener('ended', start);
    // Leaving the app / switching tabs: music stops (and quietly fades back in on return).
    const onVis = () => { if (document.hidden) { clearInterval(fade); a.pause(); } else if (a.src && a.paused) { a.volume = 0; a.play().then(fadeIn).catch(() => {}); } };
    const onHide = () => { clearInterval(fade); a.pause(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    try { if (sessionStorage.getItem('jma_audio_unlocked_v1') === '1') start(); else { armed = true; document.addEventListener('pointerdown', start, { once: true, capture: true }); } } catch (_) { start(); }
    return () => { alive = false; clearInterval(fade); a.pause(); a.src = ''; audioRef.current = null; document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', onHide); if (armed) document.removeEventListener('pointerdown', start, { capture: true }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);
  return { nowPlaying, muted, toggleMute };
}

// Chunky signpost at either end of the street pointing to the next one.
function StreetSign({ zone, dir, onClick, style }) {
  const Arrow = dir === 'left' ? ArrowLeft : ArrowRight;
  return (
    <motion.button type="button" data-testid={`campus-sign-${dir}`} aria-label={`Go to ${zone.label}`} onClick={onClick}
      className="absolute flex flex-col items-center bg-transparent border-0 p-0 cursor-pointer touch-manipulation" style={style}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} animate={{ y: [0, -4, 0] }} transition={{ y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }}>
      <span className="flex items-center gap-2 rounded-2xl px-3.5 py-2 font-black font-display text-sm md:text-lg whitespace-nowrap"
        style={{ background: zone.color, color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>
        {dir === 'left' && <Arrow className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3.5} />}
        {zone.label}
        {dir === 'right' && <Arrow className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3.5} />}
      </span>
      <span aria-hidden="true" className="block -mt-1 rounded-b-md" style={{ width: 10, height: 'clamp(40px, 9vh, 90px)', background: '#8B5A2B', border: '3px solid var(--jma-dark)', borderTop: 0 }} />
    </motion.button>
  );
}

function Host({ src, shout, pos }) {
  return (
    <motion.div className="absolute pointer-events-none flex flex-col items-center" style={pos || { left: '-12%', bottom: 6, height: '34%', zIndex: 4 }}
      animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
      <AnimatePresence>
        {shout && (
          <motion.div key={shout.id} className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-2 py-0.5 text-[10px] md:text-xs font-black font-display"
            style={{ bottom: '104%', background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}
            initial={{ opacity: 0, y: 8, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>{shout.text}</motion.div>
        )}
      </AnimatePresence>
      <img src={src} alt="" draggable={false} className="h-full w-auto object-contain object-bottom" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
      <span aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ bottom: -4, width: '70%', height: '7%', background: 'rgba(2,36,63,0.35)', filter: 'blur(3px)', zIndex: -1 }} />
    </motion.div>
  );
}

// Tiny air bubbles leaking from the roofline — it's underwater after all.
function RoofBubbles({ index }) {
  return (
    <div aria-hidden="true" className="absolute pointer-events-none" style={{ left: '50%', top: '6%', zIndex: 3 }}>
      {[0, 1, 2].map((n) => (
        <motion.span key={n} className="absolute rounded-full" style={{ width: 5 + n * 3, height: 5 + n * 3, left: (n - 1) * 10, border: '1.5px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.25)' }}
          animate={{ y: [0, -70 - n * 15], x: [0, (n % 2 ? 8 : -8), 0], opacity: [0, 0.9, 0] }}
          transition={{ repeat: Infinity, duration: 3.6 + n * 0.7, delay: n * 1.1 + (index % 4) * 0.5, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

// Plaza: the JMAtv drive-in screen — outer-space billboard on two posts.
function DriveIn({ live }) {
  const featured = useMemo(() => pickFeaturedEpisode(), []);
  const previewSrc = featured ? `https://player.vimeo.com/video/${featured.vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&app_id=122963&title=0&byline=0&portrait=0&dnt=1` : null;
  // Screen hole of assets/plaza/crt-tv.png (transparent in the art), as % of the square image. TV art is mirrored to face the stage.
  const screen = { left: '8.8%', top: '32.3%', width: '46.5%', height: '47.8%' };
  return (
    <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }} data-testid="plaza-drive-in">
      <div className="relative" style={{ width: '100%', aspectRatio: '1 / 1' }}>
        {/* behind the glass */}
        <div className="absolute overflow-hidden" style={{ ...screen, zIndex: 1, borderRadius: '10% / 12%', background: 'radial-gradient(ellipse at 30% 20%, #2A1B5E 0%, #0B1033 55%, #05071C 100%)' }}>
          {[...Array(14)].map((_, i) => (
            <motion.span key={i} className="absolute rounded-full bg-white" style={{ width: 2 + (i % 3), height: 2 + (i % 3), left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 + (i % 4) * 0.6, delay: (i % 5) * 0.3 }} />
          ))}
          {previewSrc && (
            <iframe key={featured.vimeoId} title="JMAtv preview" src={previewSrc} allow="autoplay; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" data-testid="plaza-drive-in-preview"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '180%', height: '100%', border: 0 }} />
          )}
          <span aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px)', mixBlendMode: 'multiply' }} />
          <span aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
          <img src="assets/ui/jmatv-logo-v2.png" alt="JMAtv" draggable={false} className={`absolute object-contain ${previewSrc ? 'bottom-[6%] right-[6%] w-[26%]' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%]'}`} style={{ filter: 'drop-shadow(0 3px 0 rgba(0,0,0,0.5))' }} />
          <motion.span className="absolute top-[7%] left-[7%] flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] md:text-[11px] font-black text-white" style={{ background: '#E11D48', border: '2px solid white' }} animate={{ opacity: [1, 0.55, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> {live || 'LIVE'}
          </motion.span>
        </div>
        <img src="assets/plaza/crt-tv.png" alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ zIndex: 2, transform: 'scaleX(-1)', filter: 'drop-shadow(0 8px 0 rgba(2,36,63,0.45))' }} />
      </div>
    </div>
  );
}

// Plaza: brand marquee above the bandstand + the kid's rank pennant.
function BrandMarquee() {
  return (
    <>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '28%', left: '58%', top: '18%', zIndex: 5 }}>
        <motion.img src="assets/ui/jma-stylized-logo.png" alt="Jelly of the Month Club Music Academy" draggable={false} data-testid="plaza-logo"
          className="w-full object-contain" style={{ filter: 'drop-shadow(0 2px 0 rgba(2,36,63,0.35))' }}
          animate={{ scale: [0.9, 1.14, 0.9] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }} />
      </div>
    </>
  );
}

// Clammo the clam sits on the sand. Every 8–15s he blinks to his state-2 art
// for a beat; tapping him snaps him shut (with a click) and he pops back open.
function Clammo({ left, width, bottom }) {
  const [shut, setShut] = useState(false);
  const tRef = useRef(null);
  const loopRef = useRef(() => {});
  useEffect(() => {
    let alive = true;
    const loop = () => {
      tRef.current = setTimeout(() => {
        if (!alive) return;
        setShut(true);
        tRef.current = setTimeout(() => { if (alive) { setShut(false); loop(); } }, 650);
      }, 8000 + Math.random() * 7000);
    };
    loopRef.current = loop;
    loop();
    return () => { alive = false; clearTimeout(tRef.current); };
  }, []);
  const snap = () => {
    clearTimeout(tRef.current);
    const a = new Audio(encodeURI('assets/audio/Hi Hat closed.mp3')); a.volume = 0.6; a.play().catch(() => {});
    setShut(true);
    tRef.current = setTimeout(() => { setShut(false); loopRef.current(); }, 450);
  };
  return (
    <motion.button type="button" data-testid="plaza-clammo" data-shut={shut ? 'true' : 'false'} aria-label="Clammo the clam" onClick={snap}
      className="absolute p-0 border-0 bg-transparent cursor-pointer" style={{ left, width, bottom, zIndex: 8 }} whileTap={{ scale: 0.92 }}>
      <img src="assets/plaza/clammo-1.webp" alt="" draggable={false} className="block w-full h-auto" style={{ display: shut ? 'none' : 'block', filter: 'drop-shadow(0 4px 0 rgba(2,36,63,0.35))' }} />
      <img src="assets/plaza/clammo-2.webp" alt="" draggable={false} className="block w-full h-auto" style={{ display: shut ? 'block' : 'none', filter: 'drop-shadow(0 4px 0 rgba(2,36,63,0.35))' }} />
    </motion.button>
  );
}


// The Academy's cuckoo: the kid's current rank character pops out onto the
// clock-tower ledge (assets/plaza/academy.png — door ≈ x 61.6%, ledge y 31%).
// The first time a NEW rank shows up here, the doors swing open with a chime.
const CUCKOO_SEEN_KEY = 'jma_cuckoo_seen_rank_v1';
const CHIME = ['xylo G.mp3', 'xylo b.mp3', 'xylo High c.mp3'];
function Cuckoo() {
  const { currentRank } = useRank();
  const [out, setOut] = useState(false);
  const [moment, setMoment] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    setOut(false);
    const isNew = localStorage.getItem(CUCKOO_SEEN_KEY) !== currentRank.id && currentRank.id !== 'polliwog';
    // Bring the Academy on screen first so the moment is actually seen (after the plaza's own scroll reset).
    const s = isNew ? setTimeout(() => rootRef.current?.closest('[data-testid^="campus-building-"]')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 350) : null;
    const t = setTimeout(() => {
      setOut(true);
      if (!isNew) return;
      setMoment(true);
      CHIME.forEach((f, i) => setTimeout(() => { const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = 0.7; a.play().catch(() => {}); }, i * 160));
      say('charlie.academy.rankup', { delayMs: 700 });
      localStorage.setItem(CUCKOO_SEEN_KEY, currentRank.id);
      setTimeout(() => setMoment(false), 4000);
    }, isNew ? 2200 : 900);
    return () => { clearTimeout(t); if (s) clearTimeout(s); };
  }, [currentRank.id]);
  const door = { position: 'absolute', top: 0, bottom: 0, width: '50%', background: 'linear-gradient(90deg, #8B5A2B, #A66A33)', border: '2px solid var(--jma-dark)', boxSizing: 'border-box' };
  return (
    <div ref={rootRef} aria-hidden="true" data-testid="academy-cuckoo" data-rank={currentRank.id} data-moment={moment ? 'true' : 'false'} className="absolute pointer-events-none" style={{ left: '55%', width: '13.5%', top: '18%', height: '13.2%', zIndex: 2, perspective: 300 }}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.img src={currentRank.icon} alt="" className="absolute left-1/2 bottom-0 h-[82%] w-auto object-contain object-bottom"
          initial={false} animate={out ? { y: '0%', x: '-50%', scale: moment ? [1, 1.15, 1] : 1 } : { y: '110%', x: '-50%', scale: 0.8 }} transition={moment ? { type: 'spring', stiffness: 260, damping: 14, scale: { repeat: 3, duration: 0.5 } } : { type: 'spring', stiffness: 260, damping: 18 }} />
      </div>
      <AnimatePresence>
        {moment && (
          <motion.div key="doors" className="absolute pointer-events-none" style={{ left: '14%', right: '14%', top: '6%', bottom: '28%', borderRadius: '45% 45% 6% 6% / 35% 35% 6% 6%', overflow: 'hidden', zIndex: 3 }} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <motion.span style={{ ...door, left: 0, transformOrigin: 'left center' }} initial={{ rotateY: 0 }} animate={{ rotateY: -110 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            <motion.span style={{ ...door, right: 0, transformOrigin: 'right center' }} initial={{ rotateY: 0 }} animate={{ rotateY: 110 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {moment && (
          <motion.span key="rankup" data-testid="academy-cuckoo-banner" className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-display font-black" style={{ top: '-45%', fontSize: 'clamp(10px, 1.1vw, 15px)', background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }} initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>
            <Sparkles className="inline w-[1em] h-[1em] -mt-0.5 mr-1" strokeWidth={3} /> {currentRank.title.toUpperCase()}!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function GateRibbon({ ribbon, fontSize }) {
  const text = <span className="font-black font-display whitespace-nowrap" style={{ fontSize, lineHeight: 1.25, color: ribbon.color, letterSpacing: '0.06em', textShadow: ribbon.color === 'white' ? '0 2px 0 rgba(0,0,0,0.35)' : 'none' }}>{ribbon.text}</span>;
  return (
    <span className="flex justify-center w-full" style={{ background: ribbon.bg, padding: '4px 26px', borderRadius: 12, border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark), inset 0 -4px 0 rgba(0,0,0,0.18), inset 0 3px 0 rgba(255,255,255,0.3)' }}>{text}</span>
  );
}

function Building({ b, index, locked, onEnter, onLocked, shout, L, entering, badge, x }) {
  const [shake, setShake] = useState(0);
  const lift = b.flat ? (b.lift ? 58 * b.lift : 0) : index % 3 === 1 ? 54 : index % 3 === 2 ? 22 : 0; // varied depth on the shelf
  const scale = b.flat ? 1 : index % 3 === 1 ? 0.86 : 1;
  const drop = b.drop || 0;
  const handle = () => {
    if (locked) { setShake((s) => s + 1); say('charlie.hub.lockbadge'); if (onLocked) setTimeout(() => onLocked(b), 500); return; }
    onEnter(b);
  };
  return (
    <motion.button
      type="button"
      data-testid={`campus-building-${b.id}`}
      data-locked={locked ? 'true' : 'false'}
      aria-disabled={locked}
      aria-label={b.name}
      onClick={handle}
      className={`absolute bottom-0 flex flex-col items-center bg-transparent border-0 p-0 touch-manipulation ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ left: x ?? (L.left + index * L.slot), width: Math.round(L.bw * b.size * scale), marginBottom: L.floor + lift * L.lift, zIndex: b.flat ? (b.portal ? 7 : 10) : 10 - (index % 3) }}
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, scale: entering ? 1.04 : 1 }} transition={{ delay: entering ? 0 : 0.1 + index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={locked ? {} : { y: -6 }} whileTap={locked ? {} : { scale: 0.97 }}
    >
      <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.45 }} className="relative w-full">
        <motion.div className="relative w-full" style={{ aspectRatio: '1 / 1', filter: locked && !b.flat ? 'brightness(0.3) saturate(0.4)' : 'none', transition: 'filter 0.6s' }}
          animate={locked ? {} : { y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 + (index % 3), ease: 'easeInOut' }}>
          {b.portal && (
            <div data-testid={`campus-building-${b.id}-portal`} className="absolute overflow-hidden pointer-events-none" style={{ left: `${b.portal.box.left}%`, width: `${b.portal.box.width}%`, top: `${b.portal.box.top + drop}%`, bottom: `${b.portal.box.bottom - drop}%`, borderRadius: '50% 50% 0 0 / 45% 45% 0 0', background: b.portal.bg, zIndex: 0, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.45)', filter: locked ? 'grayscale(1) brightness(0.55)' : 'none', transition: 'filter 0.6s' }}>
              <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(255,255,255,0.35) 0%, transparent 60%)' }} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }} />
              {b.portal.art.map((name, i) => (
                <motion.img key={name} src={`assets/campus/${name}.png`} alt="" draggable={false} className="absolute object-contain" style={{ bottom: `${4 + drop * 100 / (100 - b.portal.box.top - b.portal.box.bottom)}%`, width: `${54 * (b.portal.artScale || 1)}%`, left: `${(i ? 44 : 2) * (b.portal.artScale || 1) + (1 - (b.portal.artScale || 1)) * 50}%`, zIndex: i ? 1 : 2, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))' }}
                  animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.2 + i * 0.5, ease: 'easeInOut' }} />
              ))}
            </div>
          )}
          {b.custom === 'tv'
            ? <DriveIn />
            : <img src={b.art} alt="" draggable={false} className="relative z-[1] w-full h-full object-contain object-bottom" style={{ filter: locked && b.flat ? 'grayscale(0.9) brightness(0.8) drop-shadow(0 8px 0 rgba(2,36,63,0.35))' : 'drop-shadow(0 8px 0 rgba(2,36,63,0.35))', transition: 'filter 0.6s', transform: [drop ? `translateY(${drop}%)` : '', b.flip ? 'scaleX(-1)' : ''].join(' ').trim() || undefined }} />}
          {b.custom === 'academy' && <Cuckoo />}
          {b.sign && (
            <span data-testid={`campus-building-${b.id}-sign`} className="absolute -translate-x-1/2 -translate-y-1/2 font-black font-display whitespace-nowrap pointer-events-none"
              style={{ left: `${b.signPos.x}%`, top: `${b.signPos.y}%`, fontSize: Math.round(L.bw * b.size * (b.sign.length > 8 ? 0.055 : 0.085) * (b.signScale || 1)), color: 'var(--jma-dark)', zIndex: 5, letterSpacing: '0.04em',
                ...(b.signColor ? { background: b.signColor, border: '3px solid var(--jma-dark)', borderRadius: 999, padding: '2px 10px', boxShadow: '0 3px 0 0 var(--jma-dark)' } : {}) }}>
              {b.signSub ? <span className="flex flex-col items-center" style={{ lineHeight: 0.95 }}><span>{b.sign}</span><span style={{ fontSize: '0.5em', letterSpacing: '0.18em', opacity: 0.85 }}>{b.signSub}</span></span> : b.sign}
            </span>
          )}
          {b.hangSign && (
            <div data-testid={`campus-building-${b.id}-hang-sign`} className="absolute -translate-x-1/2 pointer-events-none" style={{ left: `${b.hangSign.x ?? 50}%`, top: `${b.hangSign.y}%`, zIndex: 5 }}>
            <motion.div className="flex flex-col items-center" style={{ transformOrigin: 'top center' }}
              animate={{ rotate: [-2.5, 2.5, -2.5] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}>
              <span className="flex justify-between" style={{ width: Math.round(L.bw * b.size * 0.24) }}>
                {[0, 1].map((n) => <span key={n} className="block" style={{ width: 4, height: Math.round(L.bw * b.size * 0.07), background: '#2F3A4A', border: '1.5px solid var(--jma-dark)' }} />)}
              </span>
              <span className="font-black font-display whitespace-nowrap rounded-md" style={{ fontSize: Math.round(L.bw * b.size * 0.085), color: '#FFF4D6', background: '#B8783F', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', padding: '2px 12px', letterSpacing: '0.05em', textShadow: '0 2px 0 rgba(0,0,0,0.35)' }}>
                {b.hangSign.text}
              </span>
            </motion.div>
            </div>
          )}
          {b.ribbon && (
            <div data-testid={`campus-building-${b.id}-ribbon`} className="absolute flex justify-center pointer-events-none" style={{ bottom: `${-5 + (b.ribbonLift || 0)}%`, left: `${b.portal.box.left + 5}%`, width: `${b.portal.box.width}%`, zIndex: 6, filter: locked ? 'grayscale(0.7) brightness(0.85)' : 'none', transition: 'filter 0.6s' }}>
              <GateRibbon ribbon={b.ribbon} fontSize={Math.round(L.bw * b.size * 0.085)} />
            </div>
          )}
          {b.custom === 'bandstand' && <BrandMarquee />}
          {!locked && b.custom !== 'tv' && <RoofBubbles index={index} />}
          {/* floating notes from the door */}
          {!locked && [0, 1, 2].map((n) => (
            <motion.span key={n} className="absolute pointer-events-none" style={{ left: `${44 + n * 10}%`, bottom: '22%', color: ['#FFCC00', '#FF2D85', '#4FC3F7'][n] }}
              animate={{ y: [0, -90 - n * 20], x: [0, (n % 2 ? 1 : -1) * 18], opacity: [0, 1, 0], rotate: [0, n % 2 ? 25 : -25] }}
              transition={{ repeat: Infinity, duration: 2.4 + n * 0.5, delay: n * 0.8 + (index % 3) * 0.4, ease: 'easeOut' }}>
              <Music className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
            </motion.span>
          ))}
          {(!locked || b.flat) && b.host && <Host src={b.host} shout={shout} pos={b.custom === 'bandstand' ? { left: '30%', bottom: '21%', height: '36%', zIndex: 4 } : b.portal ? { left: '-10%', bottom: '2%', height: '34%', zIndex: 4 } : undefined} />}
        </motion.div>
        {!locked && badge && (
          <motion.span data-testid={`campus-building-${b.id}-badge`} className="absolute -top-3 right-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] md:text-xs font-black whitespace-nowrap"
            style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)', zIndex: 6 }}
            initial={{ scale: 0 }} animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <Music className="w-3 h-3" strokeWidth={3} /> {badge}
          </motion.span>
        )}
        {locked && b.flat && b.portal && (
          <div aria-hidden="true" data-testid={`campus-building-${b.id}-closed-sign`} className="absolute -translate-x-1/2 pointer-events-none" style={{ left: `${b.portal.box.left + b.portal.box.width / 2 + 2}%`, top: `${b.portal.box.top + drop + 6}%`, zIndex: 5 }}>
            <motion.div className="flex flex-col items-center" style={{ transformOrigin: 'top center' }} animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}>
              <span className="flex justify-between" style={{ width: Math.round(L.bw * b.size * 0.2) }}>
                {[0, 1].map((n) => <span key={n} className="block" style={{ width: 3, height: Math.round(L.bw * b.size * 0.16), background: 'repeating-linear-gradient(180deg, #8A96A8 0 4px, #4B5668 4px 8px)', border: '1px solid var(--jma-dark)' }} />)}
              </span>
              <span className="flex items-center gap-1.5 font-black font-display whitespace-nowrap rounded-md" style={{ fontSize: Math.round(L.bw * b.size * 0.075), color: 'var(--jma-dark)', background: '#FFCC00', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark), inset 0 3px 0 rgba(255,255,255,0.35)', padding: '3px 14px', letterSpacing: '0.06em' }}>
                <Sparkles style={{ width: '0.9em', height: '0.9em' }} strokeWidth={3} /> UNLOCK ME!
              </span>
            </motion.div>
          </div>
        )}
        {locked && (
          <span data-testid={`campus-building-${b.id}-lock`} className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-black text-white whitespace-nowrap" style={{ background: 'rgba(10,37,64,0.92)', border: '2px solid white', zIndex: 6 }}>
            <Music className="w-3 h-3" strokeWidth={3} /> Earn 1 badge to open
          </span>
        )}
      </motion.div>
    </motion.button>
  );
}

export default function CampusMapPage({ plaza = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlocked } = useUnlocks();
  const { count: streakCount } = usePracticeStreak();
  const { quests, doneCount, allDone } = useDailyQuests();
  const [questsOpen, setQuestsOpen] = useState(false);
  const scroller = useRef(null);
  const shelfRef = useRef(null);
  const [leaving, setLeaving] = useState(null);
  const [swim, setSwim] = useState(null); // { x, y, dur, buildingId }
  const [scrollX, setScrollX] = useState(0);
  const [shout, setShout] = useState(null); // { id, buildingId, text }
  const [hint, setHint] = useState(true);
  const zoneId = new URLSearchParams(location.search).get('zone') || 'play';
  const zone = plaza ? PLAZA_ZONE : (CAMPUS_ZONES.find((z) => z.id === zoneId) || CAMPUS_ZONES[0]);
  const rawBuildings = useMemo(() => (plaza ? PLAZA_BUILDINGS : CAMPUS_BUILDINGS.filter((b) => b.zone === zone.id)), [plaza, zone.id]);
  const night = useMemo(isNight, []);
  const avatar = useMemo(readAvatarOutfit, []);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => { const f = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const L = layoutFor(vp.w, vp.h);
  // Plaza: the tall props (bandstand) must still clear the header on short phones.
  const buildings = useMemo(() => (plaza ? rawBuildings.map((b) => ({ ...b, size: Math.min(b.size, Math.max(0.9, (vp.h * 0.78 - L.floor) / L.bw)) })) : rawBuildings), [plaza, rawBuildings, vp.h, L.floor, L.bw]);
  const { slot, sandBack, sandFront, floor } = L;
  const acc = Math.min(1.4, L.k); // accent art scale
  // Plaza props vary a lot in width, so pack them by size instead of fixed slots.
  const xs = useMemo(() => {
    if (!plaza) return null;
    const out = []; let x = Math.round(L.left * 0.15);
    buildings.forEach((b) => { out.push(Math.round(x)); x += L.bw * b.size + L.bw * (b.id === 'quest-board' ? 0.7 : 0.14); });
    return out;
  }, [plaza, buildings, L.left, L.bw]);
  const width = plaza
    ? xs[xs.length - 1] + Math.round(L.bw * buildings[buildings.length - 1].size) + Math.round(L.bw * 0.75)
    : L.left + (buildings.length - 1) * slot + L.bw + Math.round(L.bw * 0.75);
  const zi = CAMPUS_ZONES.findIndex((z) => z.id === zone.id);
  const nextZone = CAMPUS_ZONES[(zi + 1) % CAMPUS_ZONES.length];
  const prevZone = CAMPUS_ZONES[(zi + CAMPUS_ZONES.length - 1) % CAMPUS_ZONES.length];
  const youBottom = floor + 2;
  const YOU_W = L.you;
  // plaza: quest board → YOU → gates; streets: sign → YOU → first building
  const YOU_LEFT = plaza ? xs[0] + Math.round(L.bw * buildings[0].size) + Math.round(L.bw * 0.06) : Math.round(L.bw * 0.45);
  const { nowPlaying, muted: musicMuted, toggleMute: toggleMusic } = useStreetMusic(zone.tracks);
  const jamCount = useMemo(() => loadSavedBeats().length + loadSavedSongs().length, []);
  const jamBadge = jamCount > 0 ? `${jamCount} to jam` : null;
  const badgeFor = (b) => {
    if (b.id === 'jam-session') return jamBadge;
    if (b.id === 'quest-board') return `${doneCount}/${quests.length} today`;
    return null;
  };
  // Plaza: Charlie greets the kid at the bandstand (time-of-day / first visit / quests).
  useEffect(() => {
    if (!plaza) return undefined;
    const hour = new Date().getHours();
    let line = hour < 12 ? 'charlie.hub.morning' : hour < 17 ? 'charlie.hub.afternoon' : 'charlie.hub.evening';
    if (!localStorage.getItem('jma_voice_welcomed')) { line = 'charlie.hub.first'; try { localStorage.setItem('jma_voice_welcomed', '1'); } catch (_) { /* ignore */ } }
    else if (allDone) line = 'charlie.hub.alldone';
    else if (streakCount >= 3) line = 'charlie.hub.streak';
    else if (doneCount === 0 && Math.random() < 0.5) line = 'charlie.hub.quests';
    say(line, { delayMs: 900, minGapMs: 0 });
    const s = { id: Date.now(), buildingId: 'bandstand', text: hour < 12 ? 'Mornin\', kid!' : 'Welcome back!' };
    const t1 = setTimeout(() => setShout(s), 700);
    const t2 = setTimeout(() => setShout((cur) => (cur && cur.id === s.id ? null : cur)), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plaza]);
  // Just saved a beat? Chunk points next door.
  useEffect(() => {
    let flag = null;
    try { flag = sessionStorage.getItem('jma_just_saved_beat_v1'); } catch (_) { /* ignore */ }
    if (!flag || zone.id !== 'create') return undefined;
    const s = { id: Date.now(), buildingId: 'beat-lab', text: 'Take your beat next door!' };
    // consume the flag inside the timer so StrictMode's effect re-run can't eat the one-shot
    const t1 = setTimeout(() => { try { sessionStorage.removeItem('jma_just_saved_beat_v1'); } catch (_) { /* ignore */ } setShout(s); }, 900);
    const t2 = setTimeout(() => setShout((cur) => (cur && cur.id === s.id ? null : cur)), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [zone.id]);
  // New street: start at the near end (or the far end when walking in from the right).
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    const atEnd = location.state && location.state.enterAt === 'end';
    el.scrollLeft = atEnd ? el.scrollWidth : 0; setScrollX(el.scrollLeft);
  }, [zone.id, location.state]);
  const goStreet = (z, enterAt) => navigate(`/campus?zone=${z.id}`, { state: { enterAt } });

  // Hosts shout now and then.
  useEffect(() => {
    const iv = setInterval(() => {
      const open = buildings.filter((b) => unlocked || b.starter);
      if (!open.length) return;
      const b = open[Math.floor(Math.random() * open.length)];
      const s = { id: Date.now(), buildingId: b.id, text: SHOUTS[Math.floor(Math.random() * SHOUTS.length)] };
      setShout(s);
      setTimeout(() => setShout((cur) => (cur && cur.id === s.id ? null : cur)), 1600);
    }, 3200);
    return () => clearInterval(iv);
  }, [buildings, unlocked]);

  // Desktop drag-to-pan (touch uses native scrolling).
  const drag = useRef(null);
  const dragged = useRef(false); // a real drag must not count as a tap on whatever is under the cursor
  const onPointerDown = (e) => { if (e.pointerType === 'mouse') { drag.current = { x: e.clientX, left: scroller.current.scrollLeft }; dragged.current = false; } };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 6) { dragged.current = true; e.currentTarget.style.cursor = 'grabbing'; }
    scroller.current.scrollLeft = drag.current.left - dx;
  };
  const onPointerUp = (e) => { drag.current = null; e.currentTarget.style.cursor = 'grab'; };
  const onClickCapture = (e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); dragged.current = false; } };

  const zoomIn = (b) => {
    const el = document.querySelector(`[data-testid="campus-building-${b.id}"]`);
    const r = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    setLeaving({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setTimeout(() => navigate(b.path), 520);
  };

  // Your Jelly swims from the street entrance to the tapped door, then we go in.
  const enter = (b) => {
    if (swim || leaving) return;
    if (b.action === 'quests') { setQuestsOpen(true); return; }
    const el = shelfRef.current && shelfRef.current.querySelector(`[data-testid="campus-building-${b.id}"]`);
    if (!el) { zoomIn(b); return; }
    const door = { x: el.offsetLeft + el.offsetWidth * 0.5, bottom: (parseFloat(el.style.marginBottom) || 0) + el.offsetWidth * 0.1 };
    const dx = door.x - (YOU_LEFT + YOU_W / 2);
    const dy = -(door.bottom - youBottom);
    const dur = Math.min(1.5, Math.max(0.75, Math.abs(dx) / 800));
    setSwim({ x: dx, y: dy, dur, buildingId: b.id });
    setTimeout(() => zoomIn(b), dur * 1000 + 120);
  };

  const backAccents = useMemo(() => {
    const items = [];
    const n = Math.ceil((width + 400) / slot);
    for (let i = 0; i < n; i++) {
      const x = i * slot + (i % 2 ? 40 : 160);
      if (i % 2 === 0 && (!plaza || (i > 0 && i % 4 === 0))) items.push({ kind: 'weed', src: UW_ASSETS.seaweed2, x, w: Math.round(100 * acc), bottom: sandBack * 0.5, delay: i * 0.5 });
      else items.push({ kind: 'shell', src: UW_ASSETS.shell1, x, w: Math.round(90 * acc), bottom: sandBack * 0.42 });
    }
    return items;
  }, [width, slot, acc, sandBack, plaza]);

  const frontAccents = useMemo(() => {
    const items = [];
    const n = Math.ceil((width + 600) / (slot * 1.5));
    for (let i = 0; i < n; i++) {
      const x = i * slot * 1.5 + 200;
      if (!plaza || i % 2 === 0) items.push({ kind: 'weed', src: UW_ASSETS.seaweed1, x, w: Math.round(70 * acc), bottom: 0, delay: i * 0.7 });
      if (i % 2) items.push({ kind: 'shell', src: UW_ASSETS.shell2, x: x + Math.round(120 * acc), w: Math.round(36 * acc), bottom: 10 });
    }
    return items;
  }, [width, slot, acc, plaza]);

  return (
    <div className="h-screen relative overflow-hidden" style={{ background: UNDERWATER_WATER }} data-testid="campus-map-page" data-zone={zone.id} data-plaza={plaza ? 'true' : 'false'} data-sky={night ? 'night' : 'day'}>
      {/* water + wave bands (user's layers) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '82%', zIndex: 0, backgroundImage: `url(${UW_ASSETS.bands})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'center bottom' }} />
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '32vh', zIndex: 0, background: 'linear-gradient(180deg, rgba(2,36,63,0.45) 0%, rgba(2,36,63,0.12) 60%, transparent 100%)' }} />
      {/* layer order: water → fish (1) → shield (2) → bubbles + blimp (3) → strollers (4) → buildings (5) */}
      {plaza && (
        <motion.img src="assets/ui/logo.png" alt="Jelly of the Month Club Music Academy" draggable={false} data-testid="plaza-shield" className="absolute object-contain pointer-events-none"
          data-shrunk={scrollX > 40 ? 'true' : 'false'}
          style={{ top: 'clamp(8px, 2vh, 20px)', left: 'clamp(8px, 1.5vw, 24px)', height: 'clamp(120px, 35vh, 307px)', zIndex: 2, transformOrigin: 'top left', filter: 'drop-shadow(0 6px 0 rgba(2,36,63,0.35))' }}
          animate={{ scale: 1 - 0.7 * Math.min(1, scrollX / 320), opacity: 1 - Math.min(1, scrollX / 320) }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      )}
      <Bubbles className="absolute inset-0 z-[3]" />
      <BlimpFlyby zIndex={3} />
      <GameHeader title={plaza ? '' : zone.label} showHomeButton={!plaza} backTo="/home" keepTitle />
      {plaza && (
        <button type="button" data-testid="home-for-parents-link" onClick={() => navigate('/for-parents')}
          className="absolute top-3 right-3 md:top-4 md:right-6 z-20 text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#5A2989', border: '1.5px solid rgba(90,41,137,0.25)' }}>
          For Grown-Ups
        </button>
      )}


      {/* the user's fish — every sprite faces the way it swims */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} data-testid="campus-fish">
        <Swimmer src={UW_ASSETS.fishSchool} top="11%" dur={64} delay={18} width="clamp(90px, 10vw, 170px)" />
        <Swimmer src={UW_ASSETS.fish1} top="30%" dur={30} delay={6} width="clamp(40px, 5vw, 80px)" dir="left" />
        <Swimmer src={UW_ASSETS.fish2} top="20%" dur={24} delay={2} width="clamp(44px, 5vw, 84px)" />
        <Swimmer src={UW_ASSETS.fish1} top="44%" dur={38} delay={16} width="clamp(32px, 4vw, 64px)" />
      </div>

      {/* Surf Charlie paddles right, Snorkel Finn swims left */}
      {(zone.strollers || []).slice(0, 2).map((st, i) => { const src = typeof st === 'string' ? st : st.src; return (
        <Swimmer key={src} src={src} facing={typeof st === 'string' ? 'right' : st.facing} top={`${24 + i * 14}%`} dur={40 + i * 8} delay={i * 13} width="clamp(56px, 8vw, 100px)" dir={i ? 'left' : 'right'} bob={14} zIndex={4}
          style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25))' }} />
      ); })}

      {night && <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(2,20,45,0.32)', zIndex: 4 }} />}

      {/* panorama scroller */}
      <motion.div
        ref={scroller}
        data-testid="campus-panorama"
        className="absolute inset-x-0 bottom-0 overflow-x-auto overflow-y-hidden"
        style={{ top: 0, zIndex: 5, transformOrigin: leaving ? `${leaving.x}px ${leaving.y}px` : 'center', scrollbarWidth: 'none', cursor: 'grab', touchAction: 'pan-x' }}
        onScroll={(e) => { setScrollX(e.currentTarget.scrollLeft); if (hint) setHint(false); }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} onClickCapture={onClickCapture}
        animate={leaving ? { scale: 2.6, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.8, 1] }}
      >
        <div ref={shelfRef} className="relative h-full overflow-hidden" style={{ width, minWidth: '100vw' }} data-testid="campus-shelf">
          {/* back dune + its accents (parallax: drifts slower than the street) */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: width + 400, height: sandBack, transform: `translateX(${scrollX * 0.3}px)`, zIndex: 1 }} data-testid="campus-sand-back">
            <SandStrip src={UW_ASSETS.sandBack} height={sandBack} />
            {backAccents.map((a, i) => a.kind === 'weed'
              ? <Seaweed key={i} src={a.src} left={a.x} width={a.w} bottom={a.bottom} delay={a.delay} zIndex={2} />
              : <img key={i} src={a.src} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: a.x, width: a.w, bottom: a.bottom, zIndex: 2 }} />)}
          </div>
          {/* front dune — the street everyone stands on */}
          <SandStrip src={UW_ASSETS.sandFront} height={sandFront} shift={FRONT_TROUGH} style={{ zIndex: 3 }} />
          {/* the kid's Jelly at the street entrance — swims to the tapped door */}
          <motion.div className="absolute flex flex-col items-center" style={{ left: YOU_LEFT, bottom: youBottom, width: YOU_W, zIndex: 11 }} data-testid="campus-you" data-swimming={swim ? 'true' : 'false'}
            animate={swim ? { x: swim.x, y: swim.y, scale: [1, 0.9, 0.28], opacity: [1, 1, 1, 0] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
            transition={swim ? { duration: swim.dur, ease: 'easeInOut', scale: { duration: swim.dur, times: [0, 0.7, 1] }, opacity: { duration: swim.dur, times: [0, 0.7, 0.92, 1] } } : { duration: 0 }}>
            <motion.span className="rounded-full px-1.5 text-[9px] font-black text-white mb-0.5" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }} animate={{ opacity: swim ? 0 : 1 }}>YOU</motion.span>
            <motion.div animate={swim ? { y: [0, -8, 0, -8, 0], rotate: [0, 6, 0, 6, 0] } : { y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: swim ? 0.7 : 1.6, ease: 'easeInOut' }}>
              <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} width={Math.round((avatar.helmet ? 44 : 60) * (YOU_W / 64))} imgStyle={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
            </motion.div>
          </motion.div>
          {/* street signs → previous / next street */}
          {!plaza && <StreetSign zone={prevZone} dir="left" onClick={() => goStreet(prevZone, 'end')} style={{ left: 10, bottom: Math.round(sandBack * 0.95), zIndex: 2 }} />}
          {!plaza && <StreetSign zone={nextZone} dir="right" onClick={() => goStreet(nextZone, 'start')} style={{ left: width - Math.round(L.bw * 0.62), bottom: floor + 4, zIndex: 11 }} />}
          {/* buildings */}
          {buildings.map((b, i) => (
            <Building key={b.id} b={b} index={i} L={L} x={xs ? xs[i] : undefined} badge={badgeFor(b)} locked={!unlocked && !b.starter} onEnter={enter} onLocked={() => setQuestsOpen(true)} entering={!!swim && swim.buildingId === b.id} shout={shout && shout.buildingId === b.id ? shout : null} />
          ))}
          {/* Clammo: blinks shut every so often; tap him and he snaps */}
          {plaza && <Clammo left={Math.round(L.left - L.bw * 0.27)} width={Math.round(L.bw * 0.22)} bottom={Math.round(sandFront * 0.26)} />}
          {/* near seaweed + shells (parallax, in front) */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: width + 600, height: sandFront + 120, transform: `translateX(${-scrollX * 0.2}px)`, zIndex: 7 }} data-testid="campus-front-accents">
            {frontAccents.map((a, i) => a.kind === 'weed'
              ? <Seaweed key={i} src={a.src} left={a.x} width={a.w} bottom={a.bottom} delay={a.delay} />
              : <img key={i} src={a.src} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: a.x, width: a.w, bottom: a.bottom }} />)}
          </div>
        </div>
      </motion.div>

      {/* now playing */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.button key={nowPlaying} type="button" data-testid="campus-now-playing" data-muted={musicMuted ? 'true' : 'false'} aria-label={musicMuted ? 'Unmute street music' : 'Mute street music'} onClick={toggleMusic}
            className="absolute bottom-4 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] md:text-xs font-black cursor-pointer"
            style={{ background: 'rgba(10,37,64,0.85)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)', opacity: musicMuted ? 0.7 : 1 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: musicMuted ? 0.7 : 1, y: 0 }} exit={{ opacity: 0, y: 10 }} whileTap={{ scale: 0.92 }}>
            {musicMuted
              ? <VolumeX className="w-3.5 h-3.5" strokeWidth={3} />
              : <motion.span animate={{ rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}><Music className="w-3.5 h-3.5" strokeWidth={3} /></motion.span>}
            <span style={{ textDecoration: musicMuted ? 'line-through' : 'none' }}>{nowPlaying}</span>
            {musicMuted && <span className="opacity-80">· tap for sound</span>}
          </motion.button>
        )}
      </AnimatePresence>

      {/* swipe hint */}
      <AnimatePresence>
        {hint && buildings.length > 3 && (
          <motion.div data-testid="campus-swipe-hint" className="absolute bottom-5 right-16 md:right-20 z-20 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black pointer-events-none" style={{ background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, 8, 0] }} exit={{ opacity: 0 }} transition={{ x: { repeat: Infinity, duration: 1.2 } }}>
            Swipe to explore <ChevronsRight className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {leaving && (
        <motion.div data-testid="campus-door-transition" className="fixed inset-0 pointer-events-none" style={{ background: 'var(--jma-dark)', zIndex: 60 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
      )}

      {/* Plaza: the Quest Board opens today's quests */}
      <AnimatePresence>
        {questsOpen && (
          <motion.div data-testid="plaza-quests-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,36,63,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuestsOpen(false)}>
            <FitBox className="w-full max-w-md">
              <motion.div className="relative" initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <button type="button" data-testid="plaza-quests-close" aria-label="Close" onClick={() => setQuestsOpen(false)}
                  className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FF2D85', color: 'white', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}>
                  <X className="w-5 h-5" strokeWidth={3} />
                </button>
                <DailyQuestCard defaultExpanded />
              </motion.div>
            </FitBox>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
