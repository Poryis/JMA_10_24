// AcademyPortal — the living underwater plaza seen through the Academy's coral
// archway (the room plate has a transparent hole; this scene sits behind it).
// Tap it to swim out to the plaza. Locked (dimmed, relabeled) until the kid
// has picked a character — tapping it while locked sends them to the
// Dressing Room instead of out to the plaza.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { UW_ASSETS } from './UnderwaterBackdrop';
import AvatarSprite from './AvatarSprite';

const FISH = [
  { src: UW_ASSETS.fish2, top: '20%', w: '34%', dur: 10, delay: 0 },
  { src: UW_ASSETS.fish1, top: '38%', w: '26%', dur: 13, delay: 5, rev: true },
  { src: UW_ASSETS.fishSchool, top: '8%', w: '48%', dur: 17, delay: 9 },
];
const BUBBLES = Array.from({ length: 9 }, (_, i) => ({ left: `${8 + (i * 10.3) % 84}%`, size: 4 + (i % 4) * 3, dur: 4 + (i % 3) * 1.4, delay: -(i * 0.9) }));

export default function AcademyPortal({ style, onEnter, disabled, avatar, locked, onLocked }) {
  const [open, setOpen] = useState(false);
  const [wiggle, setWiggle] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => { setOpen(true); const a = new Audio(encodeURI('assets/audio/sfx-twinkle.mp3')); a.volume = 0.4; a.play().catch(() => {}); }, 700);
    return () => clearTimeout(t);
  }, []);
  const handleClick = () => {
    if (locked) { setWiggle((w) => w + 1); if (onLocked) setTimeout(onLocked, 450); return; }
    onEnter();
  };
  return (
    <>
      {/* the scene lives BEHIND the room plate (zIndex 1) */}
      <div aria-hidden="true" className="absolute overflow-hidden" style={{ ...style, zIndex: 1, background: 'linear-gradient(180deg, #7FEFFF 0%, #34E0F6 40%, #1AA7D8 72%, #0E7FB8 100%)', filter: locked ? 'grayscale(0.75) brightness(0.6)' : 'none', transition: 'filter 0.5s' }}>
        <motion.div className="absolute" style={{ left: '-50%', top: '-50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, transparent 0 14%, rgba(255,255,255,0.22) 16% 20%, transparent 22% 48%, rgba(255,255,255,0.18) 50% 55%, transparent 57% 80%, rgba(255,255,255,0.2) 82% 86%, transparent 88%)' }}
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }} />
        {FISH.map((f, i) => (
          <motion.img key={i} src={f.src} alt="" draggable={false} className="absolute object-contain" style={{ top: f.top, width: f.w, left: 0, scaleX: f.rev ? -1 : 1 }}
            initial={{ x: f.rev ? '320%' : '-120%' }} animate={{ x: f.rev ? '-120%' : '320%', y: [0, -6, 0, 6, 0] }}
            transition={{ x: { repeat: Infinity, duration: f.dur, ease: 'linear', delay: -f.delay }, y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }} />
        ))}
        <div className="absolute inset-x-0 bottom-0" style={{ height: '22%', background: 'radial-gradient(ellipse at 50% 100%, #F2D9A0 0%, #E3C184 60%, #C9A469 100%)', borderTop: '3px solid rgba(2,36,63,0.35)' }} />
        <motion.img src="assets/plaza/dressing-room.webp" alt="" draggable={false} className="absolute object-contain" style={{ left: '-4%', bottom: '12%', width: '62%', transform: 'scaleX(-1)', filter: 'drop-shadow(0 3px 0 rgba(2,36,63,0.35))' }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }} />
        <motion.img src="assets/plaza/sticker-shack.webp" alt="" draggable={false} className="absolute object-contain" style={{ right: '-2%', bottom: '12%', width: '58%', filter: 'drop-shadow(0 3px 0 rgba(2,36,63,0.35))' }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.7, ease: 'easeInOut', delay: 0.6 }} />
        {[0, 1].map((n) => (
          <motion.img key={n} src={n ? UW_ASSETS.seaweed2 : UW_ASSETS.seaweed1} alt="" draggable={false} className="absolute object-contain object-bottom" style={{ [n ? 'right' : 'left']: '2%', bottom: '4%', width: '30%', transformOrigin: 'bottom center' }}
            animate={{ rotate: n ? [3, -3, 3] : [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 + n, ease: 'easeInOut' }} />
        ))}
        {/* the kid's own Jelly swims past the doorway now and then */}
        {avatar && !locked && (
          <motion.div data-testid="academy-portal-me" className="absolute" style={{ left: 0, bottom: '18%', width: '34%' }}
            initial={{ x: '-130%' }} animate={{ x: ['-130%', '330%'], y: [0, -8, 0, 6, 0] }}
            transition={{ x: { repeat: Infinity, duration: 7, ease: 'linear', repeatDelay: 9, delay: 2.5 }, y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }}>
            <AvatarSprite src={avatar.src} helmet={avatar.helmet} className="w-full h-auto" style={{ filter: 'drop-shadow(0 3px 0 rgba(2,36,63,0.35))', transform: avatar.facesLeft ? 'scaleX(-1)' : undefined }} />
          </motion.div>
        )}
        {BUBBLES.map((b, i) => (
          <motion.span key={i} className="absolute rounded-full" style={{ left: b.left, bottom: '-6%', width: b.size, height: b.size, border: '1.5px solid rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.25)' }}
            animate={{ y: ['0%', '-1600%'], x: [0, i % 2 ? 8 : -8, 0], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: b.dur, delay: b.delay, ease: 'easeOut' }} />
        ))}
        <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.5) 0%, transparent 60%)' }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }} />
        {/* shimmer veil lifts on arrival */}
        <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #BFF7FF 100%)' }} initial={{ opacity: 1 }} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      </div>
      {/* tap target over the archway (above the plate) */}
      <motion.button type="button" data-testid="academy-portal" data-open={open ? 'true' : 'false'} data-locked={locked ? 'true' : 'false'} aria-label={locked ? 'Pick your character first' : 'Go out to the plaza'} onClick={handleClick} disabled={disabled}
        className="absolute p-0 border-0 bg-transparent cursor-pointer" style={{ ...style, zIndex: 4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <motion.span key={wiggle} data-testid="academy-portal-sign" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full font-black font-display" style={{ top: '7%', padding: '4px 14px', fontSize: 'clamp(11px, 1.3vw, 18px)', background: locked ? '#B8233A' : '#FFCC00', color: locked ? 'white' : 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', letterSpacing: '0.06em' }}
          initial={{ opacity: 0, y: -8 }} animate={locked && wiggle ? { opacity: 1, x: [0, -8, 8, -6, 6, 0] } : { opacity: open ? 1 : 0, y: open ? [0, 4, 0] : -8 }} transition={locked && wiggle ? { duration: 0.45 } : { y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.4 } }}>
          {locked ? <><Lock className="w-[0.9em] h-[0.9em]" strokeWidth={3.5} /> PICK A CHARACTER FIRST</> : <>TO THE PLAZA <ArrowRight className="w-[1em] h-[1em]" strokeWidth={3.5} /></>}
        </motion.span>
      </motion.button>
    </>
  );
}
