// InstallCard — iPhone Safari can't go fullscreen, so this sheet walks the
// grown-up through Share → Add to Home Screen (true fullscreen + an icon).
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, Smartphone, X } from 'lucide-react';

const STEPS = [
  { Icon: Share, text: <>Tap Safari's <b>Share</b> button (the square with an arrow)</> },
  { Icon: PlusSquare, text: <>Scroll down and tap <b>Add to Home Screen</b></> },
  { Icon: Smartphone, text: <>Open <b>JMA</b> from your home screen — no address bar, just music!</> },
];

export function InstallCard({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div data-testid="install-card-overlay" className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: 'rgba(2,36,63,0.72)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div data-testid="install-card" className="relative w-full max-w-md rounded-3xl p-4 text-left max-h-[94vh] overflow-y-auto" style={{ background: '#FFF8E7', border: '4px solid var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }} initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" data-testid="install-card-close" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center">
              <X className="w-4 h-4" strokeWidth={3} style={{ color: 'var(--jma-dark)' }} />
            </button>
            <div className="font-display font-black text-lg md:text-xl pr-8" style={{ color: 'var(--jma-dark)' }}>Make JMA full screen</div>
            <p className="text-xs md:text-sm font-bold mt-1" style={{ color: '#4B5668' }}>iPhones don't let websites go full screen — but the home-screen version does. Takes 10 seconds:</p>
            <ol className="mt-2 space-y-1.5">
              {STEPS.map(({ Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3 rounded-2xl px-3 py-1.5 bg-white border-2 border-[var(--jma-dark)]">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black" style={{ background: '#1E9BFF', border: '2px solid var(--jma-dark)' }}>{i + 1}</span>
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} style={{ color: 'var(--jma-dark)' }} />
                  <span className="text-xs md:text-sm font-bold" style={{ color: 'var(--jma-dark)' }}>{text}</span>
                </li>
              ))}
            </ol>
            <button type="button" data-testid="install-card-done" onClick={onClose} className="chunky-btn mt-3 w-full py-1.5 font-black text-sm md:text-base" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}>Got it!</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallCard;
