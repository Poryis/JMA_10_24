// SetlistPicker — "PLAY MY SONG" sheet on The Stage: the kid's saved Beat Lab
// beats and Song Studio songs, newest first. Picking one starts the show.
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Drum, Music2, Play, X } from 'lucide-react';
import { loadSavedBeats } from '../hooks/useSavedBeats';
import { loadSavedSongs } from '../hooks/useSongLoopPlayer';

export function loadSetlist() {
  return [
    ...loadSavedBeats().map((b) => ({ id: b.id, name: b.name, kind: 'beat', meta: `${b.bpm} BPM · Beat Lab`, at: b.createdAt || 0, data: b })),
    ...loadSavedSongs().map((s) => ({ id: s.id, name: s.name, kind: 'song', meta: 'Song Studio', at: Date.parse(s.createdAt) || 0, data: s })),
  ].sort((a, b) => b.at - a.at);
}

export default function SetlistPicker({ onPick, onClose }) {
  const navigate = useNavigate();
  const tracks = loadSetlist();
  return (
    <motion.div data-testid="stage-setlist" className="fixed inset-0 z-[70] flex items-center justify-center p-3 pt-14" style={{ background: 'rgba(2,36,63,0.6)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative w-full max-w-md rounded-3xl bg-white p-4 max-h-full overflow-y-auto" style={{ border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }} initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-display font-black text-lg md:text-2xl" style={{ color: 'var(--jma-dark)' }}>Tonight&apos;s Setlist</div>
          <button type="button" data-testid="stage-setlist-close" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}><X className="w-4 h-4" strokeWidth={3} style={{ color: 'var(--jma-dark)' }} /></button>
        </div>
        {tracks.length === 0 ? (
          <div data-testid="stage-setlist-empty" className="rounded-2xl p-4 text-center" style={{ background: '#F6F8FB', border: '3px dashed var(--jma-dark)' }}>
            <div className="font-black mb-3" style={{ color: 'var(--jma-dark)' }}>Nothing to play yet — make a track first!</div>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" data-testid="stage-setlist-beatlab" onClick={() => navigate('/loop-studio')} className="chunky-btn px-4 py-2 text-sm font-black text-white flex items-center gap-1.5" style={{ background: '#FF2D85' }}><Drum className="w-4 h-4" strokeWidth={3} /> Beat Lab</button>
              <button type="button" data-testid="stage-setlist-songstudio" onClick={() => navigate('/song-studio')} className="chunky-btn px-4 py-2 text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><Music2 className="w-4 h-4" strokeWidth={3} /> Song Studio</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tracks.map((t) => (
              <button key={t.id} type="button" data-testid={`stage-setlist-${t.id}`} onClick={() => onPick(t)} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-left" style={{ background: '#F6F8FB', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: t.kind === 'beat' ? '#FF2D85' : '#1E9BFF', border: '2.5px solid var(--jma-dark)' }}>{t.kind === 'beat' ? <Drum className="w-4 h-4" strokeWidth={3} /> : <Music2 className="w-4 h-4" strokeWidth={3} />}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-black truncate text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>{t.name}</span>
                  <span className="block text-[11px] font-bold" style={{ color: '#4B5668' }}>{t.meta}</span>
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-black flex items-center gap-1 flex-shrink-0" style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '2.5px solid var(--jma-dark)' }}><Play className="w-3.5 h-3.5" strokeWidth={3} /> PLAY</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
