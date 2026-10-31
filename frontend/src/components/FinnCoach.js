import { motion, AnimatePresence } from 'framer-motion';

export const FinnCoach = ({ text, mood, compact }) => {
  const hop = compact ? 8 : 18;
  const animation = {
    idle: { y: [0, -4, 0], rotate: 0, scale: 1 },
    cheer: { y: [0, -hop, 0], rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] },
    shrug: { y: 0, rotate: [0, -6, 4, 0], scale: [1, 0.96, 1] },
    party: { y: [0, -hop, 0, -hop, 0], rotate: [0, -6, 6, -6, 0], scale: [1, 1.04, 1, 1.04, 1] },
  }[mood];
  return (
    <aside className="ntn-coach" data-testid="ntn-finn-row">
      <div className="ntn-speech-slot" data-testid="ntn-speech-slot">
        <AnimatePresence mode="wait">
          <motion.div key={text} data-testid="ntn-bubble"
            className="ntn-speech rounded-2xl border-3 font-black leading-snug"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}>
            {text}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ntn-finn-art" data-testid="ntn-finn-art">
        <motion.img
          data-testid="ntn-finn-image"
          key={mood === 'party' ? 'disco' : 'danger'}
          src={mood === 'party' ? 'assets/characters/fit/finn-disco.webp' : 'assets/characters/finn-danger.png'}
          alt="Finn" draggable={false}
          animate={animation}
          transition={{ duration: mood === 'idle' ? 2.2 : 0.8, repeat: mood === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
        />
      </div>
    </aside>
  );
};