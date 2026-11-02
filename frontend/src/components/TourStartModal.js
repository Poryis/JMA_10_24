// TourStartModal — a friendly popup that nudges a brand-new kid to pick a
// character BEFORE anything else. Mounted globally (App.js). Shows once the
// audio-unlock + name-prompt overlays are out of the way, as long as the
// Academy Tour is active and the "Choose your character" step isn't done
// yet. It has a close (X) so it isn't a hard block, but it reappears on the
// next visit/refresh until a character is picked — "more or less forced".

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import useDailyQuests from '../hooks/useDailyQuests';
import usePlayer from '../hooks/usePlayer';
import useAudioUnlock from '../hooks/useAudioUnlock';

const NAME_SKIPPED_KEY = 'jma_player_name_skipped_v1';
function nameSkipped() {
  try { return localStorage.getItem(NAME_SKIPPED_KEY) === '1'; } catch { return false; }
}

export default function TourStartModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tour, tourDone, quests } = useDailyQuests();
  const { player } = usePlayer();
  const { needsUnlock } = useAudioUnlock();
  const [dismissed, setDismissed] = useState(false);

  // The name-prompt's "skip" flag is a same-tab localStorage write (no
  // 'storage' event fires), so re-check it on the next tap/click anywhere —
  // that's always the gesture right after a kid dismisses the name prompt.
  const [, bump] = useState(0);
  useEffect(() => {
    // Bubble-phase 'click' (not 'pointerdown') so this runs AFTER the
    // triggering button's own onClick (e.g. the name-prompt's skip button)
    // has already written its localStorage flag.
    const retick = () => bump((n) => n + 1);
    document.addEventListener('click', retick);
    return () => document.removeEventListener('click', retick);
  }, []);

  const step = quests.find((q) => q.id === 't_character');
  const isMarketingPage = location.pathname === '/for-parents';
  const show = tour && !tourDone && !!step && !step.done && !needsUnlock && (!!player || nameSkipped()) && !isMarketingPage && !dismissed;

  const go = () => { setDismissed(true); navigate(step.route); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="tour-start-modal"
          className="fixed inset-0 z-[140] flex items-center justify-center p-4"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(10,37,64,0.55) 0%, rgba(10,37,64,0.85) 100%)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-3xl border-4 p-6 md:p-8 max-w-sm w-full text-center"
            style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
            initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <button type="button" data-testid="tour-start-modal-close" aria-label="Close" onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#F6F8FB', border: '2px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>
              <X className="w-4 h-4" strokeWidth={3} />
            </button>

            <motion.img
              src="assets/characters/charlie.png" alt="" draggable={false}
              className="mx-auto mb-2" style={{ width: 96, filter: 'drop-shadow(0 6px 0 rgba(2,36,63,0.25))' }}
              animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <h1 className="text-xl md:text-2xl font-black font-display mb-1" style={{ color: 'var(--jma-dark)' }}>
              Welcome to the Academy!
            </h1>
            <p className="text-sm md:text-base font-bold mb-5" style={{ color: 'var(--jma-dark)', opacity: 0.8 }}>
              First things first — let&apos;s pick your character so everyone at school knows who you are!
            </p>
            <button
              type="button" data-testid="tour-start-modal-go" onClick={go}
              className="chunky-btn w-full px-5 py-3 flex items-center justify-center gap-2 text-base font-black text-white"
              style={{ backgroundColor: 'var(--jma-green)' }}
            >
              Pick My Character <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
