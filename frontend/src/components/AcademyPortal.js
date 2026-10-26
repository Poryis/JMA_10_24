// AcademyPortal — the giant round door in the clock tower. Two wooden half-doors
// swing open on arrival to reveal the living underwater plaza; tap to go through.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { UW_ASSETS } from './UnderwaterBackdrop';

const FISH = [
  { src: UW_ASSETS.fish2, top: '22%', w: '20%', dur: 11, delay: 0 },
  { src: UW_ASSETS.fish1, top: '40%', w: '15%', dur: 14, delay: 4, rev: true },
  { src: UW_ASSETS.fishSchool, top: '12%', w: '30%', dur: 19, delay: 8 },
];
const BUBBLES = Array.from({ length: 10 }, (_, i) => ({ left: `${8 + (i * 9.3) % 84}%`, size: 4 + (i % 4) * 3, dur: 4 + (i % 3) * 1.4, delay: -(i * 0.9) }));
const door = (side) => ({ position: 'absolute', top: 0, bottom: 0, width: '50.5%', [side]: 0, transformOrigin: `${side} center`, background: 'linear-gradient(90deg, #7A4A22 0%, #A66A33 40%, #8B5A2B 100%)', boxShadow: 'inset 0 0 0 3px #3B2412, inset 0 0 40px rgba(0,0,0,0.35)', backfaceVisibility: 'hidden' });

export default function AcademyPortal({ style, onEnter, disabled }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setOpen(true); ['xylo G.mp3', 'xylo High c.mp3'].forEach((f, i) => setTimeout(() => { const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = 0.45; a.play().catch(() => {}); }, i * 180)); }, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.button type="button" data-testid="academy-portal" data-open={open ? 'true' : 'false'} aria-label="Go out to the plaza" onClick={onEnter} disabled={disabled}
      className="absolute p-0 border-0 bg-transparent cursor-pointer" style={{ ...style, zIndex: 3, perspective: 600 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #7FEFFF 0%, #34E0F6 35%, #0E7FB8 75%, #063A66 100%)', boxShadow: 'inset 0 0 0 5px #C9962E, inset 0 0 50px rgba(0,40,80,0.45)' }}>
        {/* light rays */}
        <motion.div aria-hidden="true" className="absolute" style={{ left: '-50%', top: '-50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, transparent 0 14%, rgba(255,255,255,0.22) 16% 20%, transparent 22% 48%, rgba(255,255,255,0.18) 50% 55%, transparent 57% 80%, rgba(255,255,255,0.2) 82% 86%, transparent 88%)' }}
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }} />
        {/* sea floor + the plaza peeking through */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0" style={{ height: '26%', background: 'radial-gradient(ellipse at 50% 100%, #F2D9A0 0%, #E3C184 60%, #C9A469 100%)', borderTop: '3px solid rgba(2,36,63,0.35)' }} />
        <motion.img src="assets/plaza/dressing-room.png" alt="" draggable={false} className="absolute object-contain" style={{ left: '4%', bottom: '14%', width: '42%', transform: 'scaleX(-1)', filter: 'drop-shadow(0 3px 0 rgba(2,36,63,0.35))' }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }} />
        <motion.img src="assets/plaza/sticker-shack.png" alt="" draggable={false} className="absolute object-contain" style={{ right: '6%', bottom: '14%', width: '40%', filter: 'drop-shadow(0 3px 0 rgba(2,36,63,0.35))' }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.7, ease: 'easeInOut', delay: 0.6 }} />
        {[0, 1].map((n) => (
          <motion.img key={n} src={n ? UW_ASSETS.seaweed2 : UW_ASSETS.seaweed1} alt="" draggable={false} className="absolute object-contain object-bottom" style={{ [n ? 'right' : 'left']: '2%', bottom: '6%', width: '22%', transformOrigin: 'bottom center' }}
            animate={{ rotate: n ? [3, -3, 3] : [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 + n, ease: 'easeInOut' }} />
        ))}
        {FISH.map((f, i) => (
          <motion.img key={i} src={f.src} alt="" draggable={false} className="absolute object-contain" style={{ top: f.top, width: f.w, left: 0, scaleX: f.rev ? -1 : 1 }}
            initial={{ x: f.rev ? '520%' : '-120%' }} animate={{ x: f.rev ? '-120%' : '520%', y: [0, -6, 0, 6, 0] }}
            transition={{ x: { repeat: Infinity, duration: f.dur, ease: 'linear', delay: -f.delay }, y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }} />
        ))}
        {BUBBLES.map((b, i) => (
          <motion.span key={i} aria-hidden="true" className="absolute rounded-full" style={{ left: b.left, bottom: '-6%', width: b.size, height: b.size, border: '1.5px solid rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.25)' }}
            animate={{ y: ['0%', '-1400%'], x: [0, i % 2 ? 8 : -8, 0], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: b.dur, delay: b.delay, ease: 'easeOut' }} />
        ))}
        {/* breathing glow */}
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.45) 0%, transparent 60%)' }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }} />
        {/* wooden doors swing open */}
        {['left', 'right'].map((side) => (
          <motion.div key={side} aria-hidden="true" style={door(side)} initial={{ rotateY: 0 }} animate={{ rotateY: open ? (side === 'left' ? -112 : 112) : 0 }} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}>
            <span className="absolute rounded-full" style={{ top: '48%', [side === 'left' ? 'right' : 'left']: '10%', width: '12%', aspectRatio: '1 / 1', background: '#E0B341', border: '2px solid #3B2412' }} />
            <span className="absolute inset-[12%] rounded-[40%]" style={{ border: '3px solid rgba(59,36,18,0.55)' }} />
          </motion.div>
        ))}
      </div>
      {/* sign under the door */}
      <motion.span data-testid="academy-portal-sign" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full font-black font-display" style={{ bottom: '-9%', padding: '4px 14px', fontSize: 'clamp(11px, 1.3vw, 18px)', background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', letterSpacing: '0.06em' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: open ? 1 : 0, y: open ? [0, -4, 0] : 8 }} transition={{ y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.4 } }}>
        TO THE PLAZA <ArrowRight className="w-[1em] h-[1em]" strokeWidth={3.5} />
      </motion.span>
    </motion.button>
  );
}
