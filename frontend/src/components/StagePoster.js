// StagePoster — the "SNAP!" concert poster a kid takes on The Stage. Stored in
// localStorage so the Yearbook can show a poster wall; printable via the
// existing .jma-print-report print rules.
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Printer, X, Star } from 'lucide-react';
import AvatarSprite from './AvatarSprite';

const KEY = 'jma_stage_posters_v1';
const MAX = 12;

export function loadPosters() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}
export function savePoster(p) {
  const poster = { id: `p${Date.now()}`, at: Date.now(), ...p };
  try { localStorage.setItem(KEY, JSON.stringify([poster, ...loadPosters()].slice(0, MAX))); } catch { /* ignore */ }
  return poster;
}

const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Pure DOM poster, 3:4. `width` in px drives every size via em.
export function Poster({ poster, width = 300, testId }) {
  const fs = width / 20;
  return (
    <div data-testid={testId} className="relative overflow-hidden select-none" style={{ width, height: width * 4 / 3, fontSize: fs, background: 'repeating-linear-gradient(90deg, #C8102E 0 1.6em, #A50D25 1.6em 2.2em, #E01A3A 2.2em 3em)', border: '0.45em solid #FFCC00', boxShadow: 'inset 0 0 0 0.2em var(--jma-dark), 0 0.5em 0 0 var(--jma-dark)', color: 'white', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      <div className="absolute inset-x-0" style={{ top: '0.9em', textAlign: 'center' }}>
        <div className="font-display font-black" style={{ fontSize: '0.9em', letterSpacing: '0.2em', color: '#FFE48A', textShadow: '0.08em 0.08em 0 var(--jma-dark)' }}>JELLY OF THE MONTH CLUB PRESENTS</div>
        <div className="font-display font-black leading-none" style={{ fontSize: '2.3em', textShadow: '0.07em 0.07em 0 var(--jma-dark)', marginTop: '0.15em' }}>LIVE ON STAGE</div>
      </div>
      <div className="absolute" style={{ left: '50%', top: '21%', width: '70%', height: '48%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,236,160,0.95) 0%, rgba(255,236,160,0.35) 45%, rgba(255,236,160,0) 72%)' }} />
      <div className="absolute flex items-end justify-center" style={{ left: '50%', top: '22%', height: '44%', transform: 'translateX(-50%)' }}>
        <AvatarSprite src={poster.avatarSrc} helmet={!!poster.helmet} className="h-full w-auto" imgStyle={{ height: '100%', width: 'auto', filter: 'drop-shadow(0 0.3em 0 rgba(0,0,0,0.45))' }} />
      </div>
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: '67%' }}>
        <div className="font-display font-black leading-none truncate px-2" style={{ fontSize: '2em', maxWidth: '100%', textShadow: '0.07em 0.07em 0 var(--jma-dark)' }}>{poster.name}</div>
        <div className="flex items-center gap-1 font-black rounded-full px-3" style={{ fontSize: '0.95em', marginTop: '0.4em', background: poster.rankColor || '#FFCC00', color: 'var(--jma-dark)', border: '0.18em solid var(--jma-dark)', padding: '0.15em 0.9em' }}><Star style={{ width: '1em', height: '1em' }} strokeWidth={3} /> {poster.rank}</div>
        {poster.song && <div className="font-bold truncate px-3" style={{ fontSize: '0.85em', marginTop: '0.5em', maxWidth: '100%', color: '#FFE48A' }}>performing “{poster.song}”</div>}
        <div className="font-bold" style={{ fontSize: '0.8em', marginTop: '0.35em', opacity: 0.9 }}>{fmtDate(poster.at)} · The Stage</div>
      </div>
      <div className="absolute font-display font-black" style={{ right: '-0.6em', top: '44%', transform: 'rotate(-18deg)', fontSize: '1.2em', letterSpacing: '0.08em', color: 'var(--jma-dark)', background: '#FFCC00', border: '0.2em solid var(--jma-dark)', padding: '0.1em 0.6em', boxShadow: '0.15em 0.15em 0 0 var(--jma-dark)' }}>SOLD OUT</div>
    </div>
  );
}

export function PosterModal({ poster, onClose, testId = 'stage-poster-modal' }) {
  if (!poster) return null;
  const w = Math.min(320, Math.round(Math.min(window.innerWidth * 0.8, (window.innerHeight - 120) * 0.75)));
  return createPortal(
    <motion.div data-testid={testId} className="fixed inset-0 z-[80] flex items-center justify-center p-3" style={{ background: 'rgba(2,36,63,0.7)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="jma-print-report relative flex flex-col items-center gap-2" initial={{ scale: 0.6, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} onClick={(e) => e.stopPropagation()}>
        <Poster poster={poster} width={w} testId="stage-poster" />
        <div className="no-print flex gap-2 mt-1">
          <button type="button" data-testid="stage-poster-print" onClick={() => window.print()} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: 'white', color: 'var(--jma-dark)' }}><Printer className="w-4 h-4" strokeWidth={3} /> Print</button>
          <button type="button" data-testid="stage-poster-close" onClick={onClose} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5 text-white" style={{ background: '#FF2D85' }}><X className="w-4 h-4" strokeWidth={3} /> Done</button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
