// Big "CASE SOLVED!" celebration that bursts over the Detective board on a correct guess.
import { motion } from 'framer-motion';
import Confetti from './Confetti';

const CHEERS = ['CASE SOLVED!', 'GOT IT!', 'SUPER SLEUTH!', 'ELEMENTARY!'];

export default function CaseSolvedBurst({ solved }) {
  const cheer = solved.streak >= 3 ? 'SUPER SLEUTH!' : CHEERS[solved.key % 2 ? 1 : 0];
  return (
    <motion.div data-testid="detective-case-solved" className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,214,90,0.55) 0%, rgba(10,37,64,0.35) 45%, rgba(10,37,64,0.2) 100%)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div aria-hidden="true" className="absolute rounded-full" style={{ width: 'min(70vh, 70vw)', aspectRatio: '1', background: 'repeating-conic-gradient(rgba(255,255,255,0.35) 0 10deg, transparent 10deg 20deg)' }}
        initial={{ scale: 0.3, rotate: 0, opacity: 0 }} animate={{ scale: 1, rotate: 60, opacity: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }} />
      <Confetti count={40} size={380} mega={solved.streak >= 3} testId="detective-solved-confetti" />
      <div className="relative flex flex-col items-center">
        <motion.img src="assets/characters/dr-jellybone-detective.png" alt="" draggable={false}
          className="w-[clamp(90px,16vh,150px)] h-auto drop-shadow-[0_6px_0_rgba(10,37,64,0.35)]"
          initial={{ y: 60, scale: 0.4, rotate: -20 }} animate={{ y: [60, -18, 0], scale: [0.4, 1.1, 1], rotate: [-20, 8, 0] }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        <motion.div className="font-display font-black whitespace-nowrap rounded-2xl px-5 py-2 -mt-2"
          style={{ fontSize: 'clamp(26px, 6vh, 48px)', background: '#FFCC00', color: 'var(--jma-dark)', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)', letterSpacing: '0.03em' }}
          initial={{ scale: 2.4, rotate: -14, opacity: 0 }} animate={{ scale: 1, rotate: -4, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.15 }}>
          {cheer}
        </motion.div>
        <motion.div data-testid="detective-solved-points" className="mt-2 font-display font-black rounded-full px-3 py-0.5"
          style={{ fontSize: 'clamp(16px, 3.4vh, 26px)', background: '#34A853', color: 'white', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
          initial={{ y: 10, opacity: 0 }} animate={{ y: [10, 0, -6], opacity: 1 }} transition={{ delay: 0.35, duration: 0.6 }}>
          +{solved.points}{solved.streak >= 2 ? ` · ${solved.streak} in a row!` : ''}
        </motion.div>
      </div>
    </motion.div>
  );
}
