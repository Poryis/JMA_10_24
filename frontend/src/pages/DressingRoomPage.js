// DressingRoomPage — backstage. Your Jelly stands in a lit vanity mirror; outfits
// hang on the rail. Tap one → it flies onto you with a sparkle poof and a pose.
// Locked outfits can be tried on for 3 s as a ghost. New unlocks arrive as gift
// boxes to unwrap. The camera takes a 3-2-1 Polaroid for the photo wall.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Lock, Camera, Sparkles, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import AvatarSprite from '../components/AvatarSprite';
import Confetti from '../components/Confetti';
import useAvatar from '../hooks/useAvatar';
import { AVATARS } from '../data/avatars';
import { VOICE_MAP } from '../data/voiceLines';
import { say } from '../lib/voice';
import { playFanfare } from './RankHallPage';

const SEEN_KEY = 'jma_outfits_seen_v1';
const PHOTOS_KEY = 'jma_polaroids_v1';
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const seenId = (charId, outfitId) => `${charId}:${outfitId}`;

const SPARKS = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, d: 70 + (i % 3) * 30, s: 0.6 + (i % 4) * 0.2 }));
function Poof({ id, ghost }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 7 }} aria-hidden="true">
      {SPARKS.map((p, i) => (
        <motion.span key={`${id}-${i}`} className="absolute" style={{ color: ghost ? '#B8C4D0' : i % 2 ? '#FFCC00' : '#FF2D85' }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }} animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d, scale: [0, p.s * 1.3, 0], opacity: [1, 1, 0] }} transition={{ duration: 0.75, ease: 'easeOut' }}>
          <Sparkles className="w-6 h-6" strokeWidth={2.5} />
        </motion.span>
      ))}
    </div>
  );
}

function HangerCard({ o, worn, color, isNew, onTap, cardRef }) {
  const mystery = !!o.hidden && !o.unlocked;
  return (
    <motion.button type="button" ref={cardRef} data-testid={`outfit-${o.id}`} data-locked={o.unlocked ? 'false' : 'true'} data-new={isNew ? 'true' : 'false'} onClick={() => onTap(o)}
      className="dr-hanger relative flex-shrink-0 flex flex-col items-center bg-transparent border-0 p-0 cursor-pointer" style={{ width: 'clamp(86px, 9.5vw, 120px)' }}
      whileHover={{ y: -4, rotate: worn ? 0 : -2 }} whileTap={{ scale: 0.95 }} animate={isNew ? { rotate: [0, -4, 4, -3, 3, 0] } : { rotate: 0 }} transition={isNew ? { repeat: Infinity, duration: 1.6, repeatDelay: 1.2 } : {}}>
      <span aria-hidden="true" className="block rounded-full" style={{ width: 12, height: 12, border: '3px solid #2B1A0C', borderBottomColor: 'transparent', marginBottom: -3 }} />
      <span aria-hidden="true" className="block" style={{ width: 54, height: 10, borderTop: '3px solid #2B1A0C', borderLeft: '3px solid #2B1A0C', borderRight: '3px solid #2B1A0C', borderRadius: '10px 10px 0 0' }} />
      <div className="w-full rounded-2xl flex flex-col items-center pt-1 pb-1.5 px-1" style={{ background: worn ? `linear-gradient(180deg, #fff 0%, ${color}33 100%)` : mystery ? '#2A1638' : 'rgba(255,255,255,0.92)', border: `3px solid ${worn ? color : 'var(--jma-dark)'}`, boxShadow: worn ? `0 0 0 3px #FFCC00, 0 4px 0 0 var(--jma-dark)` : '0 4px 0 0 var(--jma-dark)' }}>
        {isNew ? (
          <img src="assets/dressing/gift.png" alt="New outfit!" draggable={false} className="object-contain" style={{ height: 'clamp(54px, 6.5vw, 84px)' }} />
        ) : (
          <AvatarSprite src={o.src} helmet={!!o.helmet} className="w-full" imgStyle={{ width: '100%', height: 'clamp(54px, 6.5vw, 84px)', objectFit: 'contain', filter: o.unlocked ? 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))' : mystery ? 'brightness(0) opacity(0.9)' : 'grayscale(1) brightness(0.55) opacity(0.6)' }} />
        )}
        <span className="mt-0.5 text-[10px] md:text-xs font-black leading-tight text-center" style={{ color: mystery ? '#FFCC00' : 'var(--jma-dark)' }}>{isNew ? 'NEW!' : mystery ? '???' : o.name}</span>
        {!o.unlocked && !isNew && <span className="flex items-center gap-0.5 text-[8px] md:text-[9px] font-bold leading-tight text-center" style={{ color: mystery ? '#FFE48A' : 'var(--jma-dark)', opacity: mystery ? 0.95 : 0.7 }}><Lock className="w-2.5 h-2.5 flex-shrink-0" />{o.unlock.hint}</span>}
        {worn && <span className="absolute -top-1 right-1 rounded-full px-1.5 text-[8px] font-black" style={{ background: '#FFCC00', border: '2px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>ON</span>}
      </div>
    </motion.button>
  );
}

// The rail only shows ~5 hangers at a time; arrows on the posts page through the rest.
function RailArrows({ railRef, deps }) {
  const [can, setCan] = useState({ l: false, r: false });
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    const update = () => setCan({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const t = setTimeout(update, 300);
    return () => { el.removeEventListener('scroll', update); ro?.disconnect(); clearTimeout(t); };
  }, [railRef, deps]);
  const page = (dir) => railRef.current?.scrollBy({ left: dir * railRef.current.clientWidth * 0.8, behavior: 'smooth' });
  const btn = 'absolute rounded-full flex items-center justify-center cursor-pointer';
  const style = { width: 'clamp(26px, 3vw, 38px)', height: 'clamp(26px, 3vw, 38px)', top: '44%', zIndex: 5, background: '#FFCC00', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)', color: 'var(--jma-dark)' };
  return (
    <>
      <AnimatePresence>{can.l && <motion.button key="l" type="button" data-testid="rail-prev" aria-label="Previous outfits" onClick={() => page(-1)} className={btn} style={{ ...style, left: '0.5%' }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} whileTap={{ scale: 0.9 }}><ChevronLeft className="w-[70%] h-[70%]" strokeWidth={3.5} /></motion.button>}</AnimatePresence>
      <AnimatePresence>{can.r && <motion.button key="r" type="button" data-testid="rail-next" aria-label="More outfits" onClick={() => page(1)} className={btn} style={{ ...style, right: '0.5%' }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} whileTap={{ scale: 0.9 }}><ChevronRight className="w-[70%] h-[70%]" strokeWidth={3.5} /></motion.button>}</AnimatePresence>
    </>
  );
}

export default function DressingRoomPage() {
  const { character, outfit, outfits, choose, wear, unlockedFor, totalUnlocked, totalOutfits } = useAvatar();
  const [preview, setPreview] = useState(character.id);
  const previewChar = AVATARS.find(a => a.id === preview) || character;
  const isCurrent = previewChar.id === character.id;
  const previewOutfits = isCurrent ? outfits : previewChar.outfits.map(o => ({ ...o, unlocked: o.unlock.kind === 'free' || unlockedFor({ outfits: [o] }) > 0 }));
  // previewing another character shows their first *unlocked* look (Secret Friends may have none → silhouette)
  const worn = isCurrent ? outfit : (previewOutfits.find(o => o.unlocked) || previewOutfits[0]);

  const [seen, setSeen] = useState(() => {
    const cur = readJSON(SEEN_KEY, null);
    if (cur) return cur;
    const init = {};
    AVATARS.forEach(a => a.outfits.forEach(o => { if (o.unlock.kind === 'free' || unlockedFor({ outfits: [o] }) > 0) init[seenId(a.id, o.id)] = 1; }));
    writeJSON(SEEN_KEY, init); return init;
  });
  const isNew = (o) => o.unlocked && o.unlock.kind !== 'free' && !seen[seenId(previewChar.id, o.id)];

  const [ghost, setGhost] = useState(null);       // locked outfit being tried on
  const [poof, setPoof] = useState(0);
  const [flash, setFlash] = useState(0);
  const [pose, setPose] = useState(0);
  const [flyer, setFlyer] = useState(null);       // { src, from: DOMRect }
  const [bubble, setBubble] = useState(null);
  const [confetti, setConfetti] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [polaroid, setPolaroid] = useState(null);
  const [photos, setPhotos] = useState(() => readJSON(PHOTOS_KEY, []));
  const poseCtl = useAnimationControls();
  useEffect(() => {
    if (!pose) return;
    poseCtl.start({ y: [0, -18, 0, -8, 0], rotate: [0, -8, 6, -3, 0], scale: [1, 1.08, 1], transition: { duration: 0.9 } });
  }, [pose, poseCtl]);
  const mirrorRef = useRef(null);
  const railRef = useRef(null);
  const cardRefs = useRef({});
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const speak = useCallback((charId, group) => {
    const id = `${charId}.dress.${group}`;
    const line = VOICE_MAP[id];
    setBubble(line ? line.text : (charId === 'lou' ? '…' : null));
    if (line) say(id, { minGapMs: 0 });
    later(() => setBubble(null), 3200);
  }, []);

  const celebrate = () => { setPoof(p => p + 1); setFlash(f => f + 1); setPose(p => p + 1); };

  const pickCharacter = (a) => {
    setPreview(a.id); setGhost(null);
    if (a.id === character.id) return;
    const first = a.secret ? a.outfits.find(o => unlockedFor({ outfits: [o] }) > 0) : a.outfits[0];
    if (!first) {
      setBubble('Secret friends hide in here! Find them around the Academy.'); setPoof(p => p + 1);
      later(() => setBubble(null), 3200);
      return;
    }
    choose(a.id, first.id); celebrate(); speak(a.secret ? first.id : a.id, 'pick');
  };

  const tapOutfit = (o) => {
    const card = cardRefs.current[o.id];
    const from = card ? card.getBoundingClientRect() : null;
    if (isNew(o)) {
      const next = { ...seen, [seenId(previewChar.id, o.id)]: 1 }; setSeen(next); writeJSON(SEEN_KEY, next);
      setConfetti(c => c + 1); playFanfare();
    }
    if (!o.unlocked) {
      setGhost(o); setPoof(p => p + 1);
      later(() => setGhost(g => (g && g.id === o.id ? null : g)), 3000);
      return;
    }
    setGhost(null);
    if (!isCurrent) choose(previewChar.id, o.id); else wear(o.id);
    if (from) { setFlyer({ src: o.src, from, key: Date.now() }); later(() => setFlyer(null), 520); }
    later(() => { celebrate(); speak(previewChar.secret ? o.id : previewChar.id, 'wear'); }, 380);
  };

  const snap = () => {
    if (countdown !== null) return;
    setCountdown(3);
    later(() => setCountdown(2), 800); later(() => setCountdown(1), 1600);
    later(() => { setCountdown(null); setPose(p => p + 1); setFlash(f => f + 1); }, 2400);
    later(() => setPolaroid({ src: worn.src, helmet: !!worn.helmet, name: plateName, outfit: plateSub, at: Date.now() }), 2900);
  };
  const keepPhoto = () => { const next = [polaroid, ...photos].slice(0, 6); setPhotos(next); writeJSON(PHOTOS_KEY, next); setPolaroid(null); };

  const wornHidden = (!!worn.hidden && !worn.unlocked) || (!!ghost && !!ghost.hidden);
  const plateName = previewChar.secret ? (wornHidden ? '???' : worn.name) : previewChar.name;
  const plateSub = previewChar.secret ? 'Secret Friend' : worn.name;
  const shownSrc = ghost ? ghost.src : worn.src;
  const shownHelmet = ghost ? !!ghost.helmet : !!worn.helmet;
  const mirrorRect = mirrorRef.current ? mirrorRef.current.getBoundingClientRect() : null;

  return (
    <div className="dr-room relative overflow-hidden flex flex-col" data-testid="dressing-room-page" style={{ height: '100dvh', minHeight: '100vh', background: 'linear-gradient(180deg, #3B1F4E 0%, #2A1638 60%, #1B0F26 100%)' }}>
      {/* backstage wall: vertical stripes + warm bulb glow; floor boards */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 28px, transparent 28px 56px)' }} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '14%', background: 'repeating-linear-gradient(90deg, #A67B4C 0 64px, #8B6540 64px 66px)', borderTop: '4px solid var(--jma-dark)', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.35)' }} />
      <GameHeader title="DRESSING ROOM" showHomeButton={true} backLink={{ to: '/sticker-book', label: 'Stickers' }} />

      <div className="dr-grid relative flex-1 min-h-0 flex items-stretch gap-3 px-3 md:px-6 pt-20 md:pt-24 pb-[12%] max-w-6xl mx-auto w-full" style={{ zIndex: 2 }}>
        {/* ---------- the mirror ---------- */}
        <div className="dr-mirror-col relative flex flex-col items-center justify-end flex-shrink-0" style={{ width: '34%' }}>
          <div ref={mirrorRef} className="relative h-full" style={{ aspectRatio: '738 / 1150', maxWidth: '100%' }} data-testid="dressing-mirror">
            <img src="assets/dressing/mirror.png" alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ zIndex: 3, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))' }} />
            {/* glass contents: the Jelly, posed */}
            <div className="absolute flex items-end justify-center" style={{ left: '18%', right: '18%', top: '9%', bottom: '22%', zIndex: 4 }}>
              <motion.div className="dr-bob absolute inset-x-0 bottom-0 h-[92%]" style={{ transformOrigin: 'bottom center' }} animate={poseCtl}>
                <AvatarSprite src={shownSrc} helmet={shownHelmet} className="block w-full h-full" testId="dressing-mirror-avatar"
                  imgStyle={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: ghost && ghost.hidden ? 'brightness(0) opacity(0.8)' : ghost ? 'grayscale(1) opacity(0.55) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : wornHidden ? 'brightness(0) opacity(0.8)' : 'drop-shadow(0 6px 0 rgba(0,0,0,0.3))', transition: 'filter 0.3s' }} />
              </motion.div>
              {poof > 0 && <Poof key={poof} id={poof} ghost={!!ghost} />}
              <AnimatePresence>{flash > 0 && <motion.div key={flash} className="absolute inset-0 rounded-2xl bg-white pointer-events-none" style={{ zIndex: 8 }} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}</AnimatePresence>
              <AnimatePresence>
                {ghost && (
                  <motion.div key="ghost" data-testid="dressing-ghost-hint" className="absolute left-1/2 -translate-x-1/2 bottom-1 rounded-xl px-2 py-1 text-[10px] md:text-xs font-black text-center whitespace-nowrap" style={{ zIndex: 9, background: 'var(--jma-dark)', color: '#FFCC00', border: '2px solid #FFCC00' }}
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                    <Lock className="inline w-3 h-3 -mt-0.5 mr-1" />Earn it: {ghost.unlock.hint}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>{countdown !== null && <motion.div key={countdown} data-testid="dressing-countdown" className="absolute inset-0 flex items-center justify-center font-black font-display text-white pointer-events-none" style={{ zIndex: 9, fontSize: 'clamp(48px, 10vw, 120px)', textShadow: '0 4px 0 var(--jma-dark)' }} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>{countdown}</motion.div>}</AnimatePresence>
            </div>
            {/* name plate on the vanity shelf */}
            <div className="absolute left-1/2 -translate-x-1/2 rounded-lg px-2 py-0.5 text-center whitespace-nowrap" style={{ bottom: '3%', zIndex: 5, background: '#FFCC00', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }} data-testid="dressing-nameplate">
              <span className="font-black font-display text-[11px] md:text-sm" style={{ color: 'var(--jma-dark)' }}>{plateName}</span>
              <span className="ml-1.5 text-[9px] md:text-[11px] font-bold opacity-70" style={{ color: 'var(--jma-dark)' }}>{ghost ? (ghost.hidden ? '???' : ghost.name) : plateSub}</span>
            </div>
            {/* speech bubble */}
            <AnimatePresence>
              {bubble && (
                <motion.div key={bubble} data-testid="dressing-bubble" className="absolute rounded-2xl px-3 py-1.5 text-[11px] md:text-sm font-bold leading-snug bg-white" style={{ right: '-8%', top: '2%', zIndex: 10, width: 'clamp(140px, 16vw, 220px)', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
                  initial={{ scale: 0.6, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>{bubble}</motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button type="button" data-testid="dressing-camera" onClick={snap} aria-label="Take a photo" className="dr-camera absolute flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] md:text-sm font-black" style={{ left: '-4%', bottom: '2%', zIndex: 6, background: '#FF2D85', color: 'white', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} animate={{ rotate: [-6, -6, 6, -6] }} transition={{ repeat: Infinity, duration: 3, times: [0, 0.8, 0.9, 1] }}>
            <Camera className="w-4 h-4" strokeWidth={3} /> SNAP!
          </motion.button>
        </div>

        {/* ---------- cast wall + rail ---------- */}
        <div className="relative flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg px-2 py-0.5 text-[10px] md:text-xs font-black whitespace-nowrap" style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>THE CAST</span>
            <div className="flex-1 flex gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-1" data-testid="dressing-cast">
              {AVATARS.map((a, idx) => {
                const active = a.id === previewChar.id;
                return (
                  <motion.button key={a.id} type="button" data-testid={`avatar-pick-${a.id}`} onClick={() => pickCharacter(a)} className="relative flex-shrink-0 rounded-xl flex flex-col items-center p-0.5" style={{ width: 'clamp(46px, 5.2vw, 64px)', border: `3px solid ${active ? a.color : 'var(--jma-dark)'}`, boxShadow: active ? `0 0 0 2px #FFCC00, 0 3px 0 0 var(--jma-dark)` : '0 3px 0 0 var(--jma-dark)', transform: `rotate(${[-3, 2, -2, 3, -1, 2, -3][idx % 7]}deg)`, background: a.secret ? '#17103A' : 'white' }}
                    whileHover={{ scale: 1.08, rotate: 0 }} whileTap={{ scale: 0.95 }}>
                    <span aria-hidden="true" className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.2)' }} />
                    <img src={a.cardSrc || a.outfits[0].src} alt={a.name} draggable={false} className="w-full object-contain" style={{ height: 'clamp(30px, 3.6vw, 46px)' }} />
                    <span className="text-[8px] md:text-[9px] font-black leading-none" style={{ color: a.secret ? '#FFCC00' : 'var(--jma-dark)' }}>{a.secret ? 'Secret' : a.name.split(' ')[0]}</span>
                    {active && <span className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#34A853', border: '2px solid var(--jma-dark)' }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={4} /></span>}
                  </motion.button>
                );
              })}
            </div>
            <span className="text-[10px] md:text-xs font-black text-white/80 whitespace-nowrap" data-testid="dressing-unlocked-count">{totalUnlocked}/{totalOutfits} outfits</span>
          </div>

          <div className="relative w-full" data-testid="dressing-rail" style={{ aspectRatio: '1110 / 558' }}>
            <img src="assets/dressing/rail.png" alt="" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.3))' }} />
            <div ref={railRef} className="dr-hangers absolute flex gap-1.5 md:gap-3 overflow-x-auto no-scrollbar px-[2%] pt-2" style={{ top: '14%', left: '7%', right: '7%', zIndex: 2, scrollSnapType: 'x proximity', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%)' }}>
              {previewOutfits.map(o => <HangerCard key={o.id} o={o} worn={isCurrent && o.id === outfit.id} color={previewChar.color} isNew={isNew(o)} onTap={tapOutfit} cardRef={(el) => { cardRefs.current[o.id] = el; }} />)}
            </div>
            <RailArrows railRef={railRef} deps={previewChar.id} />
          </div>

          {/* photo wall */}
          {photos.length > 0 && (
            <div className="dr-photos absolute right-0 bottom-0 flex gap-1" data-testid="dressing-photo-wall" style={{ zIndex: 3 }}>
              {photos.slice(0, 4).map((ph, i) => (
                <div key={ph.at} className="bg-white p-0.5 pb-2 shadow" style={{ width: 42, transform: `rotate(${[-6, 4, -3, 5][i]}deg)`, border: '1px solid rgba(0,0,0,0.25)' }}>
                  <div className="w-full flex items-end justify-center overflow-hidden" style={{ height: 40, background: '#CFE8EF' }}><img src={ph.src} alt="" className="w-full h-full object-contain object-bottom" /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* outfit flying from the rail into the mirror */}
      <AnimatePresence>
        {flyer && mirrorRect && (
          <motion.img key={flyer.key} src={flyer.src} alt="" className="fixed pointer-events-none object-contain" style={{ zIndex: 50, height: 90 }}
            initial={{ left: flyer.from.left + flyer.from.width / 2 - 30, top: flyer.from.top + 20, scale: 0.8, opacity: 1, rotate: 0 }}
            animate={{ left: mirrorRect.left + mirrorRect.width / 2 - 30, top: mirrorRect.top + mirrorRect.height * 0.35, scale: 1.6, opacity: 0, rotate: 360 }}
            transition={{ duration: 0.5, ease: 'easeIn' }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>

      {/* the Polaroid slides out */}
      <AnimatePresence>
        {polaroid && (
          <motion.div key="polaroid" data-testid="dressing-polaroid" className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 60, background: 'rgba(2,36,63,0.6)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPolaroid(null)}>
            <motion.div className="relative bg-white p-3 pb-10 shadow-2xl" style={{ width: 'min(300px, 70vw)', border: '2px solid rgba(0,0,0,0.2)' }} initial={{ y: 300, rotate: -12, scale: 0.6 }} animate={{ y: 0, rotate: -3, scale: 1 }} exit={{ y: 300, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 18 }} onClick={(e) => e.stopPropagation()}>
              <div className="w-full flex items-end justify-center overflow-hidden" style={{ aspectRatio: '1', background: 'radial-gradient(circle at 50% 30%, #E7F6FA 0%, #9ED3E0 100%)' }}>
                <AvatarSprite src={polaroid.src} helmet={polaroid.helmet} className="block w-full h-[88%]" imgStyle={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />
              </div>
              <div className="absolute left-0 right-0 bottom-2 text-center font-black font-display" style={{ color: '#2B2B3B', fontSize: 'clamp(12px, 2vw, 18px)' }}>{polaroid.name} · {polaroid.outfit}</div>
              <button type="button" aria-label="Close" data-testid="dressing-polaroid-close" onClick={() => setPolaroid(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FF2D85', color: 'white', border: '3px solid var(--jma-dark)' }}><X className="w-4 h-4" strokeWidth={3} /></button>
              <button type="button" data-testid="dressing-polaroid-keep" onClick={keepPhoto} className="absolute left-1/2 -translate-x-1/2 chunky-btn px-4 py-1.5 text-xs md:text-sm font-black whitespace-nowrap" style={{ top: 'calc(100% + 10px)', background: '#FFCC00', color: 'var(--jma-dark)' }}>Pin it on the wall</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {confetti > 0 && <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 55 }}><Confetti key={confetti} mega testId="dressing-confetti" /></div>}
    </div>
  );
}
