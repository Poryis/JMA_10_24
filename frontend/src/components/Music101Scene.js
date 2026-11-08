// Music 101 lecture hall: the underwater layers plus the Academy's own room props, each tappable for a surprise.
import { useState } from 'react';
import { motion } from 'framer-motion';
import UnderwaterBackdrop, { UW_ASSETS } from './UnderwaterBackdrop';

const ROOM = 'assets/academy/room/';
const ding = (f, maxMs) => {
  const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = 0.6; a.play().catch(() => {});
  if (maxMs) setTimeout(() => { const fade = setInterval(() => { a.volume = Math.max(0, a.volume - 0.1); if (a.volume <= 0.01) { clearInterval(fade); a.pause(); } }, 30); }, maxMs);
};

const CORAL = [
  { n: '03', left: '1%', width: 'clamp(46px, 5vw, 90px)' }, { n: '01', left: '9%', width: 'clamp(30px, 3vw, 54px)' },
  { n: '04', left: '90%', width: 'clamp(34px, 3.4vw, 60px)' }, { n: '02', left: '94%', width: 'clamp(46px, 4.6vw, 84px)' },
];

function Toy({ src, testId, label, style, tap, sfx, maxMs, idle, className = '', children, onTap }) {
  const [n, setN] = useState(0);
  return (
    <motion.button type="button" data-testid={testId} aria-label={label} className={`fixed p-0 border-0 bg-transparent cursor-pointer z-10 ${className}`}
      style={{ transformOrigin: 'bottom center', ...style }} key={`${testId}-${n}`} animate={n ? tap : idle}
      transition={n ? { duration: 0.8 } : { repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={() => { setN((v) => v + 1); if (sfx) ding(sfx, maxMs); onTap?.(); }}>
      <img src={src} alt="" draggable={false} className="block w-full h-auto pointer-events-none" />
      {children}
    </motion.button>
  );
}

export default function Music101Scene({ next, onNext }) {
  return (
    <>
      <UnderwaterBackdrop />
      {CORAL.map((c) => (
        <img key={c.n} src={`${ROOM}coral-${c.n}.png`} alt="" aria-hidden="true" draggable={false}
          className="fixed z-0 pointer-events-none" style={{ left: c.left, bottom: 'clamp(4px, 2vh, 18px)', width: c.width }} />
      ))}
      <Toy src={`${ROOM}lantern-left.png`} testId="m101-lantern-left" label="Lantern" sfx="sfx-twinkle.mp3" className="hidden lg:block"
        style={{ top: 0, left: '6vw', width: 'clamp(40px, 3.6vw, 70px)', transformOrigin: 'top center' }}
        idle={{ rotate: [-3, 3, -3] }} tap={{ rotate: [0, 22, -16, 10, -5, 0] }} />
      <Toy src={`${ROOM}lantern-right.png`} testId="m101-lantern-right" label="Lantern" sfx="sfx-twinkle.mp3" className="hidden lg:block"
        style={{ top: 0, right: '6vw', width: 'clamp(40px, 3.6vw, 70px)', transformOrigin: 'top center' }}
        idle={{ rotate: [3, -3, 3] }} tap={{ rotate: [0, -22, 16, -10, 5, 0] }} />
      <Toy src={`${ROOM}chalkboard.png`} testId="m101-chalkboard" label={next ? `Next up: ${next.subtitle}` : 'Chalkboard'} sfx="sfx-page.mp3" className="hidden xl:block"
        style={{ left: '2vw', top: '15vh', width: 'clamp(280px, 21vw, 420px)' }}
        tap={{ rotate: [0, -2, 2, -1, 0], y: [0, -6, 0] }} onTap={() => next && setTimeout(() => onNext(next.num), 450)}>
        <span className="absolute flex flex-col items-center justify-center text-center pointer-events-none font-display font-black text-white"
          style={{ left: '12%', right: '12%', top: '22%', bottom: '18%', opacity: 0.92, textShadow: '0 0 6px rgba(255,255,255,0.35)' }}>
          {next ? (
            <>
              <span className="text-xs uppercase tracking-[0.25em] opacity-80">Next up</span>
              <span className="text-2xl leading-tight my-1" data-testid="m101-chalk-next">{next.subtitle}</span>
              <span className="text-[11px] font-bold opacity-75">tap the board to start</span>
            </>
          ) : <span className="text-2xl leading-tight">Class dismissed! You watched them all.</span>}
        </span>
      </Toy>
      <Toy src={`${ROOM}harp.png`} testId="m101-harp" label="Starfish harp" sfx="riffs/harp.mp3" className="hidden md:block"
        style={{ left: 0, bottom: 'clamp(10px, 4vh, 40px)', width: 'clamp(90px, 9vw, 190px)' }}
        tap={{ rotate: [0, -3, 3, -2, 1, 0], y: [0, -8, 0] }} />
      <Toy src={`${ROOM}trumpet.png`} testId="m101-trumpet" label="Seashell trumpet" sfx="sax/C4.mp3" maxMs={450} className="hidden md:block"
        style={{ right: '2vw', bottom: 'clamp(10px, 4vh, 40px)', width: 'clamp(80px, 9vw, 190px)' }}
        tap={{ rotate: [0, -8, 6, -4, 2, 0], scale: [1, 1.1, 1] }} />
      <Toy src={UW_ASSETS.shell2} testId="m101-shell" label="Shell" sfx="sfx-bell-chime.mp3"
        style={{ left: '30%', bottom: 'clamp(4px, 1.5vh, 16px)', width: 'clamp(30px, 3.4vw, 56px)' }}
        tap={{ y: [0, -40, 0, -14, 0], rotate: [0, 180, 360] }} />
    </>
  );
}
