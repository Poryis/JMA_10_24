// RankUpCelebration: full-screen overlay that fires once when the kid
// crosses into a new rank. Confetti + character + warm message.
// Hooked into App.js so it works from any page.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useRank from '../hooks/useRank';
import { setOverlayActive } from '../hooks/useGamePause';
import Confetti from './Confetti';
import { say } from '../lib/voice';

export default function RankUpCelebration() {
  const { rankUp, dismissRankUp } = useRank({ withCelebration: true });
  const navigate = useNavigate();

  // Freeze any game underneath while the full-screen celebration is up.
  useEffect(() => {
    setOverlayActive('rank-up', !!rankUp);
    if (rankUp) say('charlie.meta.rankup', { delayMs: 500 });
    return () => setOverlayActive('rank-up', false);
  }, [rankUp]);

  return (
    <AnimatePresence>
      {rankUp && (
        <motion.div
          data-testid="rank-up-overlay"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissRankUp}
        >
          <Confetti mega={true} testId="rank-confetti" />
          <motion.div
            data-testid="rank-up-card"
            className="relative bg-white rounded-3xl border-4 max-w-sm w-full p-6 text-center"
            style={{ borderColor: rankUp.color, boxShadow: `0 10px 0 0 ${rankUp.color}` }}
            initial={{ scale: 0.5, y: 50, rotate: -8 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.p
              className="text-xs uppercase tracking-widest font-black mb-1"
              style={{ color: rankUp.color }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              You ranked up!
            </motion.p>
            <motion.h2
              className="text-3xl md:text-4xl font-black font-display"
              style={{ color: 'var(--jma-dark)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              {rankUp.title}
            </motion.h2>
            <p className="text-sm font-bold mb-4" style={{ color: rankUp.color }}>
              {rankUp.subtitle}
            </p>
            <motion.div
              className="w-28 h-28 mx-auto mb-3 rounded-full border-4 overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: rankUp.badgeBg, borderColor: rankUp.color }}
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.6 }}
            >
              <img src={rankUp.icon} alt={rankUp.title} className="w-full h-full object-contain" />
            </motion.div>
            <motion.p
              className="text-base font-bold mb-3 leading-snug"
              style={{ color: 'var(--jma-dark)' }}
            >
              {rankUp.blurb}
            </motion.p>
            {/* Dynamic context line — sourced from ranks.js so the copy
                is always accurate to the specific rank threshold the kid
                just crossed. On the first-ever badge (Polliwog → Tadpole)
                this becomes the coordinated "your first music badge"
                moment — no competing overlays. */}
            {rankUp.celebrationHint && (
              <motion.p
                data-testid="rank-up-hint"
                className="text-sm font-bold mb-4 leading-snug px-2 py-2 rounded-xl"
                style={{
                  color: 'var(--jma-dark)',
                  backgroundColor: `${rankUp.color}22`,
                  border: `2px solid ${rankUp.color}55`,
                }}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                {rankUp.celebrationHint}
              </motion.p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                data-testid="rank-up-stage"
                onClick={() => { dismissRankUp(); navigate('/rank-hall'); }}
                className="chunky-btn text-white px-5 py-2 text-base font-bold"
                style={{ backgroundColor: rankUp.color }}
              >
                Take a bow on stage!
              </button>
              <button
                data-testid="rank-up-dismiss"
                onClick={dismissRankUp}
                className="chunky-btn px-5 py-2 text-base font-bold"
                style={{ background: 'white', color: 'var(--jma-dark)' }}
              >
                Keep playing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
