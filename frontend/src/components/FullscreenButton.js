// FullscreenButton — floating bottom-right toggle, mounted once at App root.
// Goes fullscreen AND asks for landscape (Android). On iPhone Safari (no
// fullscreen API) it opens the Add-to-Home-Screen card instead, with a
// one-time nudge bubble on the Plaza. Hidden once installed / standalone.
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { canFullscreen, enterFullscreen, exitFullscreen, isFullscreen, isIPhone, isStandalone, onFullscreenChange } from '../lib/fullscreen';
import { InstallCard } from './InstallCard';

const NUDGE_KEY = 'jma_install_nudge_seen';
const onPlaza = () => ['', '#', '#/', '#/home'].includes(window.location.hash);

function IPhoneInstallButton() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(NUDGE_KEY)) return;
    let t;
    const check = () => { clearTimeout(t); if (onPlaza()) t = setTimeout(() => setNudge(true), 2500); else setNudge(false); };
    check();
    window.addEventListener('hashchange', check);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', check); };
  }, []);

  const dismissNudge = () => { setNudge(false); localStorage.setItem(NUDGE_KEY, '1'); };
  const openCard = () => { dismissNudge(); setOpen(true); };

  return (
    <>
      <AnimatePresence>
        {nudge && (
          <motion.button type="button" data-testid="install-nudge" onClick={openCard} className="fixed bottom-3 right-14 md:right-16 z-50 rounded-2xl px-3 py-1.5 text-xs font-black whitespace-nowrap" style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
            Want JMA full screen? Tap here →
          </motion.button>
        )}
      </AnimatePresence>
      <motion.button type="button" data-testid="fullscreen-button" className="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-50 chunky-btn bg-white p-1 md:p-2" onClick={openCard} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Full Screen" aria-label="How to make JMA full screen">
        <Maximize className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: 'var(--jma-dark)' }} />
      </motion.button>
      <InstallCard open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function FullscreenButton() {
  const [full, setFull] = useState(isFullscreen());
  useEffect(() => onFullscreenChange(() => setFull(isFullscreen())), []);
  if (isStandalone()) return null;
  if (!canFullscreen()) return isIPhone() ? <IPhoneInstallButton /> : null;

  return (
    <motion.button
      type="button"
      data-testid="fullscreen-button"
      className="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-50 chunky-btn bg-white p-1 md:p-2"
      onClick={() => (full ? exitFullscreen() : enterFullscreen())}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={full ? 'Exit Fullscreen' : 'Fullscreen'}
      aria-label={full ? 'Exit fullscreen' : 'Go fullscreen'}
    >
      {full ? (
        <Minimize className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: 'var(--jma-dark)' }} />
      ) : (
        <Maximize className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: 'var(--jma-dark)' }} />
      )}
    </motion.button>
  );
}

export default FullscreenButton;
