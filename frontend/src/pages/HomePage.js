// JMA Home — based on the partner's reference image.
// Hero: Finn (cello) - SHIELD - Charlie (guitar) on top, no extra wording.
// Body: three big tappable cards (PLAY · LEARN · CREATE), with the icon as
// the centerpiece and only minimal corner accents.
// Bottom: a single helper pill explaining each section.

import { motion, useAnimationControls } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import RetroTV from '../components/RetroTV';
import BlimpFlyby from '../components/BlimpFlyby';
import UnderwaterBackdrop from '../components/UnderwaterBackdrop';
import { Nebula, Starfield, SPACE_BG_STYLE } from '../components/SpaceBackdrop';
import HomeProgressCard from '../components/HomeProgressCard';
import DailyQuestCard from '../components/DailyQuestCard';
import AcademyRevealCelebration from '../components/AcademyRevealCelebration';
import useUnlocks from '../hooks/useUnlocks';
import usePracticeStreak from '../hooks/usePracticeStreak';
import useDailyQuests from '../hooks/useDailyQuests';
import { say } from '../lib/voice';
import { pickFeaturedEpisode } from '../data/jmatv';
import { SHOW_PARENT_PORTAL } from '../lib/flags';

// Easter-egg animation variants for the shield. Click cycles through them.
const SHIELD_ANIMS = [
  { name: 'wobble',  keyframes: { rotate: [0, -14, 12, -8, 6, 0],         scale: [1, 1.06, 1.08, 1.04, 1.02, 1], y: [0, 0, 0, 0, 0, 0] }, duration: 0.9 },
  { name: 'spin',    keyframes: { rotate: [0, 360],                        scale: [1, 1.1, 1],                 y: [0, -10, 0] },        duration: 0.95 },
  { name: 'pop',     keyframes: { rotate: [0, 0],                          scale: [1, 1.35, 0.9, 1.12, 1],     y: [0, -16, 0, -6, 0] }, duration: 0.85 },
  { name: 'flipx',   keyframes: { rotateY: [0, 360],                       scale: [1, 1.05, 1],                y: [0, -8, 0] },         duration: 0.95 },
  { name: 'shimmy',  keyframes: { x: [0, -10, 10, -7, 7, -4, 4, 0],        rotate: [0, -4, 4, -2, 2, 0, 0, 0], scale: [1, 1.04, 1.04, 1.04, 1.04, 1.02, 1.02, 1] }, duration: 0.95 },
  { name: 'jelly',   keyframes: { scaleX: [1, 1.25, 0.85, 1.12, 0.95, 1],  scaleY: [1, 0.78, 1.22, 0.92, 1.05, 1], y: [0, -4, 4, -2, 0, 0] }, duration: 0.9 },
];

// Floating music notes/stars in the sky strip behind the hero row.
const SKY_DOODLES = [
  { src: 'assets/home/play/note.png',         top: 22, left: 6,   w: 3.0, dur: 3.0, delay: 0.0 },
  { src: 'assets/home/learn/noteaccent.png',  top: 8,  left: 18,  w: 3.4, dur: 2.4, delay: 0.4 },
  { src: 'assets/home/create/note accent.png', top: 18, left: 30, w: 2.8, dur: 3.4, delay: 0.7 },
  { src: 'assets/home/play/note.png',         top: 12, left: 72,  w: 3.0, dur: 2.8, delay: 0.2 },
  { src: 'assets/home/learn/noteaccent1.png', top: 22, left: 82,  w: 3.4, dur: 3.2, delay: 0.5 },
  { src: 'assets/home/create/note accent 2.png', top: 9, left: 92, w: 2.8, dur: 2.6, delay: 0.3 },
];

const CARDS = [
  {
    id: 'play',
    title: 'PLAY',
    subtitle: 'Games & Puzzles',
    path: '/campus?zone=play',
    icon: 'assets/home/play/boombox.png',
    iconAlt: 'Boombox',
    bg: '#FFC83D',
    border: '#0A2540',
    shadow: '#F39C12',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    iconShift: { x: -4, y: 2, rot: -3 },
    iconWidthPct: 90,
    // Watercolor blobs (behind everything)
    blobs: [
      { color: '#FFB300', top: -10, left: -8,  size: 55, opacity: 0.55 },
      { color: '#FFE082', top: 50,  left: 70,  size: 60, opacity: 0.55 },
      { color: '#FF6B35', top: 70,  left: -12, size: 45, opacity: 0.35 },
    ],
    accents: [
      // BEHIND icon (z:1) — soft/large
      { src: 'assets/home/play/note cluster 1.png', top: 8,  left: 58, w: 38, rot: 8,  anim: 'sway',    dur: 3.2, delay: 0.1, z: 1, opacity: 0.85 },
      { src: 'assets/home/play/drum.png',           top: 62, left: -8, w: 38, rot: -10, anim: 'bob',    dur: 3.0, delay: 0.0, z: 1 },
      { src: 'assets/home/play/key cluster.png',    top: 56, left: 70, w: 30, rot: 12, anim: 'sway',    dur: 2.8, delay: 0.4, z: 1, opacity: 0.95 },
      // IN FRONT of icon (z:20)
      { src: 'assets/home/play/stars.png',          top: -6, left: 70, w: 28, rot: 8,  anim: 'twinkle', dur: 1.6, delay: 0.2, z: 20 },
      { src: 'assets/home/play/star.png',           top: 4,  left: -4, w: 16, rot: -14, anim: 'twinkle',dur: 1.4, delay: 0.5, z: 20 },
      { src: 'assets/home/play/note.png',           top: 32, left: 88, w: 14, rot: 18, anim: 'bob',    dur: 2.4, delay: 0.3, z: 20 },
      { src: 'assets/home/play/accent dot.png',     top: 22, left: 8,  w: 7,  rot: 0,  anim: 'twinkle', dur: 1.8, delay: 0.6, z: 20 },
      { src: 'assets/home/play/note.png',           top: 78, left: 38, w: 11, rot: -22, anim: 'bob',   dur: 2.6, delay: 0.2, z: 20 },
    ],
    sfx: 'assets/audio/sfx-home-play.mp3',
  },
  {
    id: 'learn',
    title: 'LEARN',
    subtitle: 'Lessons & Training',
    path: '/campus?zone=learn',
    icon: 'assets/home/learn/storybook no accents.png',
    iconAlt: 'Storybook',
    bg: '#C8A8F2',
    border: '#0A2540',
    shadow: '#9B6DE0',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    // Storybook art has more padding around the subject — boost width AND
    // remove the upward y-shift so it visually centers like the boombox/beat-pad.
    iconShift: { x: 3, y: -10, rot: 2 },
    iconWidthPct: 124,
    blobs: [
      { color: '#7B4FE0', top: -8,  left: 60,  size: 55, opacity: 0.45 },
      { color: '#E6D5FF', top: 35,  left: -15, size: 60, opacity: 0.6 },
      { color: '#BB86FC', top: 70,  left: 65,  size: 50, opacity: 0.4 },
    ],
    accents: [
      // BEHIND
      { src: 'assets/home/learn/starandcircleaccent.png', top: -4,  left: -6, w: 36, rot: -8, anim: 'twinkle', dur: 2.0, delay: 0.1, z: 1 },
      { src: 'assets/home/learn/starandswooshaccent.png', top: 58,  left: 68, w: 40, rot: 12, anim: 'sway',   dur: 2.8, delay: 0.4, z: 1 },
      { src: 'assets/home/learn/accent4.png',             top: 36,  left: 78, w: 26, rot: 14, anim: 'sway',   dur: 3.0, delay: 0.5, z: 1, opacity: 0.9 },
      { src: 'assets/home/learn/accent3.png',             top: 50,  left: -10, w: 24, rot: -20, anim: 'sway', dur: 2.6, delay: 0.2, z: 1, opacity: 0.9 },
      // IN FRONT
      { src: 'assets/home/learn/noteaccent.png',          top: 8,   left: 78, w: 22, rot: 10, anim: 'sway',   dur: 2.4, delay: 0.3, z: 20 },
      { src: 'assets/home/learn/noteaccent1.png',         top: 36,  left: 4,  w: 16, rot: -12, anim: 'bob',   dur: 2.6, delay: 0.5, z: 20 },
      { src: 'assets/home/learn/staraccent.png',          top: 80,  left: 6,  w: 14, rot: -6, anim: 'twinkle',dur: 1.6, delay: 0.6, z: 20 },
      { src: 'assets/home/learn/staraccent.png',          top: 18,  left: 50, w: 9,  rot: 18, anim: 'twinkle',dur: 1.8, delay: 0.2, z: 20 },
    ],
    sfx: 'assets/audio/sfx-home-learn.mp3',
  },
  {
    id: 'create',
    title: 'CREATE',
    subtitle: 'Recording Studio',
    path: '/campus?zone=create',
    icon: 'assets/home/create/beat pad.png',
    iconAlt: 'Beat Pad',
    bg: '#7DD3C0',
    border: '#0A2540',
    shadow: '#3FA68B',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    iconShift: { x: 5, y: -2, rot: -2 },
    iconWidthPct: 95,
    blobs: [
      { color: '#2E9E8B', top: -8,  left: 65,  size: 50, opacity: 0.45 },
      { color: '#B8E8DC', top: 30,  left: -10, size: 55, opacity: 0.6 },
      { color: '#FF8FB1', top: 75,  left: 60,  size: 45, opacity: 0.35 },
    ],
    accents: [
      // BEHIND
      { src: 'assets/home/create/heartbeat 1.png',  top: 56, left: -6,  w: 60, rot: -4, anim: 'pulse',  dur: 1.6, delay: 0.0, z: 1, opacity: 0.85 },
      { src: 'assets/home/create/accent 4.png',     top: 8,  left: 70,  w: 30, rot: 14, anim: 'sway',   dur: 2.8, delay: 0.3, z: 1 },
      { src: 'assets/home/create/accent 1.png',     top: 36, left: 80,  w: 24, rot: -10, anim: 'sway',  dur: 3.0, delay: 0.5, z: 1, opacity: 0.9 },
      { src: 'assets/home/create/dots accent.png',  top: 70, left: 75,  w: 28, rot: 8,  anim: 'twinkle', dur: 1.8, delay: 0.4, z: 1, opacity: 0.85 },
      // IN FRONT
      { src: 'assets/home/create/stars accent.png', top: -4, left: 66,  w: 30, rot: 10, anim: 'twinkle',dur: 1.6, delay: 0.2, z: 20 },
      { src: 'assets/home/create/note accent.png',  top: 4,  left: -2,  w: 22, rot: -16, anim: 'sway',  dur: 2.4, delay: 0.1, z: 20 },
      { src: 'assets/home/create/note accent 2.png',top: 38, left: 6,   w: 14, rot: 16, anim: 'bob',    dur: 2.6, delay: 0.5, z: 20 },
      { src: 'assets/home/create/heartbeat 2.png',  top: 82, left: 30,  w: 18, rot: 0,  anim: 'pulse',  dur: 1.4, delay: 0.3, z: 20, opacity: 0.95 },
    ],
    sfx: 'assets/audio/sfx-home-create.mp3',
  },
];

const ANIMS = {
  bob:     { y: [0, -6, 0] },
  sway:    { rotate: [-5, 5, -5], y: [0, -3, 0] },
  twinkle: { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] },
  pulse:   { scale: [1, 1.06, 1] },
};

function Accent({ a, wide }) {
  // The wide (phone Create banner) card is much wider/shorter than the square
  // cards, so the same width-% blows the art up. Shrink it there, and force
  // every accent BEHIND the icon (z:1) so none float over the hero.
  const w = wide ? a.w * 0.4 : a.w;
  const z = wide ? 1 : (a.z ?? 1);
  return (
    <motion.img
      src={a.src} alt="" draggable={false} loading="lazy"
      className="absolute pointer-events-none select-none"
      style={{
        top: `${a.top}%`, left: `${a.left}%`, width: `${w}%`,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.22))',
        zIndex: z,
        opacity: a.opacity ?? 1,
        rotate: `${a.rot || 0}deg`,
      }}
      animate={ANIMS[a.anim] || ANIMS.bob}
      transition={{ duration: a.dur, delay: a.delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Blob({ b }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${b.top}%`,
        left: `${b.left}%`,
        width: `${b.size}%`,
        aspectRatio: '1 / 1',
        background: `radial-gradient(circle, ${b.color} 0%, ${b.color}00 65%)`,
        opacity: b.opacity ?? 0.5,
        filter: 'blur(8px)',
        zIndex: 0,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

function PrimaryCard({ card, index, navigate, wide = false, locked = false }) {
  const [hovered, setHovered] = useState(false);
  const shake = useAnimationControls();

  const handleClick = () => {
    if (locked) {
      shake.start({ x: [0, -10, 10, -7, 7, -3, 3, 0], transition: { duration: 0.5 } });
      say('charlie.hub.lockbadge');
      return;
    }
    if (card.sfx) {
      try {
        const audio = new Audio(card.sfx);
        // Soft tap-sfx so home-card clicks don't blast — kids tap these a lot
        audio.volume = 0.42;
        audio.play().catch(() => { /* autoplay rejected — proceed without SFX */ });
      } catch { /* ignore */ }
    }
    const delay = card.sfx ? 240 : 0;
    setTimeout(() => navigate(card.path), delay);
  };

  return (
    <motion.button
      type="button"
      data-testid={`home-card-${card.id}`}
      data-locked={locked ? 'true' : 'false'}
      aria-disabled={locked}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-[26px] w-full bg-transparent border-0 p-0 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      initial={{ y: 50, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.18 + index * 0.1, type: 'spring', stiffness: 220 }}
      whileHover={locked ? {} : { y: -6 }}
      whileTap={locked ? {} : { scale: 0.97 }}
    >
      <motion.div
        animate={shake}
        className={`relative rounded-[26px] overflow-hidden flex ${wide ? 'flex-row items-center justify-center gap-4' : 'flex-col items-center justify-end'}`}
        style={{
          background: card.bg,
          border: `5px solid ${card.border}`,
          boxShadow: `0 10px 0 0 ${card.shadow}, 0 13px 0 0 ${card.border}`,
          aspectRatio: wide ? '16 / 6.4' : '1 / 1.05',
          padding: wide ? 'clamp(10px, 3vw, 20px)' : 'clamp(12px, 2.2vw, 22px)',
          filter: locked ? 'grayscale(0.92) brightness(0.82)' : 'none',
          transition: 'filter 0.9s ease',
        }}
      >
        {/* Watercolor blobs (deepest layer) */}
        {(card.blobs || []).map((b, i) => <Blob key={`b-${i}`} b={b} />)}

        {/* Subtle inner radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.32) 0%, transparent 50%)', zIndex: 0 }}
        />

        {/* Decorative accents — shown in both square and wide/banner layouts
            so the phone Create banner keeps its fun elements too. */}
        {card.accents.map((a, i) => <Accent key={`a-${i}`} a={a} wide={wide} />)}

        {/* HUGE primary icon (off-center, per-card sized via iconWidthPct) */}
        <motion.img
          src={card.icon}
          alt={card.iconAlt}
          draggable={false}
          loading="eager"
          className="relative object-contain select-none"
          style={{
            width: wide
              ? 'min(32%, 190px)'
              : `min(${card.iconWidthPct || 100}%, ${Math.round((card.iconWidthPct || 100) * 5.6)}px)`,
            height: 'auto',
            maxHeight: wide ? '128%' : '88%',
            marginBottom: wide ? 0 : 'clamp(2px, 1vw, 10px)',
            filter: 'drop-shadow(0 12px 12px rgba(0,0,0,0.28))',
            zIndex: 10,
            transform: `translate(${card.iconShift?.x || 0}%, ${card.iconShift?.y || 0}%) rotate(${card.iconShift?.rot || 0}deg)`,
          }}
          animate={hovered
            ? { scale: 1.06, y: -6, rotate: (card.iconShift?.rot || 0) - 2 }
            : { y: [0, -6, 0], rotate: card.iconShift?.rot || 0 }
          }
          transition={
            hovered
              ? { type: 'spring', stiffness: 240 }
              : { y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: index * 0.2 } }
          }
        />

        {/* Title + subtitle stack */}
        <div className="relative flex flex-col items-center" style={{ zIndex: 30 }}>
          <h2
            className="font-black font-display leading-none text-center home-card-title"
            style={{
              fontSize: wide ? 'clamp(36px, 10vw, 60px)' : 'clamp(28px, 5.2vw, 56px)',
              color: card.titleColor,
              WebkitTextStroke: `clamp(2px, 0.4vw, 4px) ${card.titleStroke}`,
              paintOrder: 'stroke fill',
              letterSpacing: '0.02em',
            }}
          >
            {card.title}
          </h2>
          {card.subtitle && (
            <span
              className="font-black font-display uppercase text-center leading-none mt-1 home-card-sub"
              style={{
                fontSize: wide ? 'clamp(10px, 2.6vw, 16px)' : 'clamp(8px, 1.5vw, 13px)',
                color: card.titleColor,
                letterSpacing: '0.04em',
                textShadow: '0 1px 0 rgba(255,255,255,0.65)',
                opacity: 0.92,
              }}
            >
              {card.subtitle}
            </span>
          )}
        </div>

        {/* Lock badge — shown until the kid earns their first badge */}
        {locked && (
          <div
            data-testid={`home-card-${card.id}-lock`}
            className="absolute inset-x-0 flex justify-center pointer-events-none"
            style={{ top: wide ? '8%' : '6%', zIndex: 40 }}
          >
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: 'rgba(10,37,64,0.88)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)' }}
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={3} />
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-wide whitespace-nowrap">
                Earn 1 badge to unlock
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.button>
  );
}

function JmatvCrtMobile({ navigate, compact = false }) {
  const featured = useMemo(() => pickFeaturedEpisode(), []);
  const previewSrc = featured
    ? `https://player.vimeo.com/video/${featured.vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&app_id=122963&title=0&byline=0&portrait=0&dnt=1`
    : null;

  return (
    <motion.button
      type="button"
      data-testid="home-card-jmatv"
      onClick={() => navigate('/jmatv')}
      aria-label="Open JMAtv"
      className="relative w-full bg-transparent border-0 p-0 cursor-pointer block text-left"
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 220 }}
      whileTap={{ scale: 0.98, y: 2 }}
    >
      <div
        className={`relative rounded-[22px] overflow-hidden flex items-center ${compact ? 'justify-center gap-5 px-4 py-2' : 'gap-3 px-3 py-3'}`}
        data-testid="home-card-jmatv-space"
        style={{
          ...SPACE_BG_STYLE,
          border: '4px solid var(--jma-dark)',
          boxShadow: '0 8px 0 0 var(--jma-dark)',
        }}
      >
        {/* outer-space sky — same nebula + stars as the JMAtv pages */}
        <Nebula />
        <Starfield />
        {/* CRT */}
        <div className="relative flex-shrink-0" style={{ width: compact ? '24%' : '46%', zIndex: 1 }}>
          {/* Rabbit ears */}
          <div aria-hidden="true" className="absolute" style={{ top: '-14%', left: '50%', transform: 'translateX(-50%)', width: '52%', height: '20%', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: '18%', width: 5, height: '100%', background: '#6B7280', transform: 'rotate(-22deg)', transformOrigin: 'bottom center', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: 0, right: '18%', width: 5, height: '100%', background: '#6B7280', transform: 'rotate(22deg)', transformOrigin: 'bottom center', borderRadius: 4 }} />
          </div>
          {/* Wood body */}
          <div
            className="relative rounded-2xl"
            style={{
              background: 'repeating-linear-gradient(90deg, #A67B4C 0px, #A67B4C 2px, #C89968 2px, #C89968 5px), linear-gradient(180deg, #C89968, #8B6540)',
              backgroundBlendMode: 'multiply',
              border: '4px solid #000',
              boxShadow: '0 6px 0 0 #000',
              padding: '8px',
              zIndex: 1,
            }}
          >
            <div className="relative rounded-lg overflow-hidden" style={{ background: '#0A0A0A', border: '2px solid #1F2937', aspectRatio: '4 / 3' }}>
              {previewSrc ? (
                <iframe
                  key={featured.vimeoId}
                  title="JMAtv preview"
                  src={previewSrc}
                  allow="autoplay; fullscreen; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: '50%', left: '50%', width: '177.77%', height: '100%', transform: 'translate(-50%, -50%)', border: 0, pointerEvents: 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="assets/ui/jmatv-logo-v2.png" alt="JMAtv" className="object-contain" style={{ width: '62%' }} draggable={false} />
                </div>
              )}
              {/* scanlines */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)', mixBlendMode: 'multiply' }} />
              {/* brand bug */}
              <img src="assets/ui/jmatv-logo-v2.png" alt="" aria-hidden="true" draggable={false} className="absolute pointer-events-none" style={{ bottom: 4, right: 4, width: '24%', opacity: 0.92 }} />
            </div>
          </div>
        </div>

        {/* Text side */}
        <div className={`relative flex flex-col min-w-0 ${compact ? 'flex-none items-center text-center' : 'flex-1 items-start'}`} style={{ zIndex: 1 }}>
          <img src="assets/ui/jmatv-logo-v2.png" alt="JMAtv" draggable={false} className="object-contain" style={{ width: compact ? 96 : 'min(80%, 150px)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }} />
          <p className="mt-1 font-black font-display leading-tight" style={{ color: '#FFF9E9', fontSize: compact ? '12px' : 'clamp(14px, 4vw, 18px)', textShadow: '0 2px 0 rgba(0,0,0,0.35)' }}>
            Watch today&apos;s episode!
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span aria-hidden="true" className="inline-block rounded-full" style={{ width: 9, height: 9, backgroundColor: '#FF3B30', boxShadow: '0 0 8px rgba(255,59,48,0.9)', animation: 'jma-pulse 1.4s ease-in-out infinite' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#FFE7C2' }}>Streaming Now</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Phone landscape: short viewport, wide screen → compact home layout.
function useShortLandscape() {
  const calc = () => window.innerHeight < 520 && window.innerWidth > window.innerHeight;
  const [short, setShort] = useState(calc);
  useEffect(() => {
    const f = () => setShort(calc());
    window.addEventListener('resize', f); window.addEventListener('orientationchange', f);
    return () => { window.removeEventListener('resize', f); window.removeEventListener('orientationchange', f); };
  }, []);
  return short;
}

function HomePage() {
  const navigate = useNavigate();
  const shortLandscape = useShortLandscape();
  const shieldControls = useAnimationControls();
  const shieldHitsRef = useRef(0);
  const { unlocked, revealPending, dismissReveal } = useUnlocks();
  // Cards stay greyed while the reveal ceremony is up, then glow open on dismiss.
  const cardsLocked = !unlocked || revealPending;
  const { count: streakCount } = usePracticeStreak();
  const { doneCount, allDone } = useDailyQuests();

  // Charlie greets once per app session (not on every return to Home).
  useEffect(() => {
    if (revealPending) return;
    try { if (sessionStorage.getItem('jma_voice_greeted') === '1') return; sessionStorage.setItem('jma_voice_greeted', '1'); } catch (_) {}
    const hour = new Date().getHours();
    let line = hour < 12 ? 'charlie.hub.morning' : hour < 17 ? 'charlie.hub.afternoon' : 'charlie.hub.evening';
    if (!localStorage.getItem('jma_voice_welcomed')) { line = 'charlie.hub.first'; try { localStorage.setItem('jma_voice_welcomed', '1'); } catch (_) {} }
    else if (allDone) line = 'charlie.hub.alldone';
    else if (streakCount >= 3) line = 'charlie.hub.streak';
    else if (doneCount === 0) line = Math.random() < 0.5 ? 'charlie.hub.quests' : line;
    say(line, { delayMs: 900, minGapMs: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealPending]);

  // Shield intro: tilt-in spring on first paint. After that, clicks replace
  // the animation with one of SHIELD_ANIMS for the easter-egg flourish.
  useEffect(() => {
    shieldControls.start({
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 200 },
    });
  }, [shieldControls]);

  const triggerShieldEasterEgg = () => {
    // Cycle deterministically through the animations so kids get variety
    // every tap without repeating the same one back-to-back.
    const idx = shieldHitsRef.current % SHIELD_ANIMS.length;
    shieldHitsRef.current += 1;
    const anim = SHIELD_ANIMS[idx];
    shieldControls.start({
      ...anim.keyframes,
      transition: { duration: anim.duration, ease: 'easeInOut' },
    });
  };

  return (
    <div
      data-testid="home-page"
      data-layout={shortLandscape ? 'short' : 'normal'}
      className={`min-h-screen w-full flex flex-col items-center px-3 sm:px-6 pb-6 relative overflow-x-hidden ${shortLandscape ? 'home-short pt-1' : 'pt-4'}`}
      style={{
        // Fallback color underneath the underwater layer so the top of
        // the page never flashes white during initial paint / while the
        // PNG is loading. Deep-sea navy.
        backgroundColor: '#02243F',
      }}
    >
      <UnderwaterBackdrop />
      {/* Drifting Jelly Rocks blimp — behind everything */}
      <BlimpFlyby />

      {/* "For Grown-Ups" link hidden pre-launch (SHOW_PARENT_PORTAL flag) —
          flip it back on in lib/flags.js when ready to show the pitch page. */}
      {SHOW_PARENT_PORTAL && (
        <button
          type="button"
          data-testid="home-for-parents-link"
          onClick={() => navigate('/for-parents')}
          className="absolute top-3 right-3 md:top-4 md:right-6 z-20 text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            color: '#5A2989',
            border: '1.5px solid rgba(90,41,137,0.25)',
            backdropFilter: 'blur(4px)',
          }}
        >
          For Grown-Ups
        </button>
      )}

      {/* Sky doodles — float behind the hero */}
      {SKY_DOODLES.map((d, i) => (
        <motion.img
          key={i}
          src={d.src} alt="" draggable={false} loading="lazy"
          className="absolute pointer-events-none select-none opacity-75"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: `${d.w}%`, zIndex: 0 }}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* HERO ROW — Finn · Shield · Charlie */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 mt-1 mb-1 w-full">
        <motion.img
          src="assets/characters/finn-danger.png"
          alt="Finn"
          data-testid="home-finn"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(46px, 10vw, 131px)', height: 'auto' }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{
            x: { delay: 0.2, type: 'spring' },
            opacity: { delay: 0.2 },
            y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />

        <motion.img
          src="assets/ui/logo.png"
          alt="Jelly of the Month Club Music Academy"
          data-testid="jma-logo"
          className="object-contain cursor-pointer"
          style={{
            width: 'clamp(94px, 19vw, 280px)',
            height: 'auto',
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
            transformOrigin: 'center',
          }}
          initial={{ y: -30, opacity: 0, rotate: -4 }}
          animate={shieldControls}
          onClick={triggerShieldEasterEgg}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        />

        <motion.img
          src="assets/characters/charlie.png"
          alt="Charlie"
          data-testid="home-charlie"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(58px, 12vw, 170px)', height: 'auto' }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{
            x: { delay: 0.3, type: 'spring' },
            opacity: { delay: 0.3 },
            y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.4 },
          }}
          whileHover={{ scale: 1.08, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />
      </div>

      {/* Progress strip — rank + streak + stickers in one clean pill.
          PracticeStreakChip is folded INSIDE HomeProgressCard now, so
          the Home page only carries the single-row banner + Next Mission
          + the three big destination cards. */}
      {shortLandscape ? (
        /* ===== PHONE LANDSCAPE — little height, lots of width: progress +
             quests share one row, the three destinations go wide-format in
             one row, and the compact JMAtv card closes it out. */
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-2 px-1" data-testid="home-short-layout">
          <div className="grid grid-cols-2 gap-2 items-start">
            <HomeProgressCard />
            <DailyQuestCard />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CARDS.map((card, idx) => (
              <PrimaryCard key={card.id} card={card} index={idx} navigate={navigate} wide locked={card.id !== 'play' && cardsLocked} />
            ))}
          </div>
          <div className="mx-auto w-full" style={{ maxWidth: 400 }}>
            <JmatvCrtMobile navigate={navigate} compact />
          </div>
        </div>
      ) : (
        <>
      <div className="relative z-10 mb-2 md:mb-4 w-full max-w-4xl">
        <HomeProgressCard />
      </div>

      {/* Today at the Academy — the daily-quest hero. Three bite-sized
          tasks that deep-link into games; the single "do this now" signal. */}
      <div className="relative z-10 mb-3 md:mb-5 w-full max-w-4xl px-1 md:px-2">
        <DailyQuestCard />
      </div>

      <AcademyRevealCelebration open={revealPending} onClose={dismissReveal} />

      {/* ===== PHONE LAYOUT (2 / 1 / 1) — all four destinations above the
           fold: Play+Learn row, full-width Create banner, then the JMAtv
           CRT. Hidden at md+ which keeps the original 3-across + big TV. */}
      <div className="md:hidden relative z-10 w-full max-w-md flex flex-col gap-3 px-1">
        <div className="grid grid-cols-2 gap-3">
          <PrimaryCard card={CARDS[0]} index={0} navigate={navigate} />
          <PrimaryCard card={CARDS[1]} index={1} navigate={navigate} locked={cardsLocked} />
        </div>
        <PrimaryCard card={CARDS[2]} index={2} navigate={navigate} wide locked={cardsLocked} />
        <JmatvCrtMobile navigate={navigate} />
      </div>

      {/* ===== TABLET / DESKTOP LAYOUT — unchanged: 3 cards across with the
           full retro-TV widget below. */}
      <div className="hidden md:block relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-3 gap-6 px-1">
          {CARDS.map((card, idx) => (
            <PrimaryCard key={card.id} card={card} index={idx} navigate={navigate} locked={card.id !== 'play' && cardsLocked} />
          ))}
        </div>
        <RetroTV />
      </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
