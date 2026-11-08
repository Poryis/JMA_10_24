// Music 101 lecture hall: the underwater layers, a chalkboard (tap → next lesson) and the starfish harp.
import { useState } from 'react';
import { motion } from 'framer-motion';
import UnderwaterBackdrop from './UnderwaterBackdrop';

const ROOM = 'assets/academy/room/';
const ding = (f, maxMs) => {
  const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = 0.6; a.play().catch(() => {});
  if (maxMs) setTimeout(() => { const fade = setInterval(() => { a.volume = Math.max(0, a.volume - 0.1); if (a.volume <= 0.01) { clearInterval(fade); a.pause(); } }, 30); }, maxMs);
};

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
      <Toy src={`${ROOM}chalkboard.png`} testId="m101-chalkboard" label={next ? `Next up: ${next.subtitle}` : 'Chalkboard'} sfx="sfx-page.mp3" className="hidden xl:block"
        style={{ left: '2vw', top: '15vh', width: 'clamp(280px, 21vw, 420px)' }}
        tap={{ rotate: [0, -2, 2, -1, 0], y: [0, -6, 0] }} onTap={() => next && setTimeout(() => onNext(next.num), 450)}>
        <span className="absolute flex flex-col items-center justify-center text-center pointer-events-none font-display font-black text-white"
          style={{ left: '12%', right: '12%', top: '22%', bottom: '18%', opacity: 0.92, textShadow: '0 0 6px rgba(255,255,255,0.35)' }}>
          {next ? (
            <>
              <span className="text-base uppercase tracking-[0.25em]">Next up</span>
              <span className="text-3xl leading-tight my-1" data-testid="m101-chalk-next">{next.subtitle}</span>
              <span className="text-sm font-bold">tap the board to start</span>
            </>
          ) : <span className="text-2xl leading-tight">Class dismissed! You watched them all.</span>}
        </span>
      </Toy>
      <Toy src={`${ROOM}harp.png`} testId="m101-harp" label="Starfish harp" sfx="riffs/harp.mp3" className="hidden md:block"
        style={{ left: 0, bottom: 'clamp(10px, 4vh, 40px)', width: 'clamp(90px, 9vw, 190px)' }}
        tap={{ rotate: [0, -3, 3, -2, 1, 0], y: [0, -8, 0] }} />
    </>
  );
}
