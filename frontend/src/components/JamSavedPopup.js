// Jam Session "save to album" popup: step 1 name it, step 2 choose what to do with it next.
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Disc3, Palette, Mic2, Music } from 'lucide-react';

const card = { background: '#FFF9E6', border: '4px solid var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)', color: 'var(--jma-dark)' };

function Choice({ testId, icon: Icon, label, sub, color, onClick }) {
  return (
    <button type="button" data-testid={testId} onClick={onClick}
      className="chunky-btn flex items-center gap-3 w-full text-left px-4 py-3 text-white touch-manipulation" style={{ background: color }}>
      <Icon className="w-7 h-7 flex-shrink-0" strokeWidth={2.5} />
      <span className="leading-tight"><span className="block text-base font-black">{label}</span><span className="block text-xs font-bold opacity-90">{sub}</span></span>
    </button>
  );
}

export default function JamSavedPopup({ naming, value, onChange, onSave, saved, onClose, onCover, onStage, onAlbum }) {
  const open = !!naming || !!saved;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div data-testid="jam-save-popup" className="fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto p-4"
          style={{ background: 'rgba(10,37,64,0.6)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative w-full max-w-sm sm:max-w-xl rounded-3xl p-5 my-auto" style={card} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
            {naming ? (
              <form data-testid="jam-name-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div className="flex items-center gap-2 mb-3"><Disc3 className="w-7 h-7" style={{ color: '#1E9BFF' }} /><h2 className="text-2xl font-black font-display">Name your jam!</h2></div>
                <input data-testid="jam-name-input" autoFocus maxLength={24} value={value} onChange={(e) => onChange(e.target.value)} placeholder={naming.name}
                  className="w-full px-4 py-3 rounded-2xl text-lg font-bold outline-none mb-4" style={{ background: '#fff', border: '3px solid var(--jma-dark)' }} />
                <button type="submit" data-testid="jam-name-save" className="chunky-btn w-full py-3 text-lg font-black bg-[var(--jma-yellow)] text-[var(--jma-dark)] touch-manipulation">Save to My Album</button>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-black font-display mb-1" data-testid="jam-saved-title">“{saved}” is saved!</h2>
                <p className="text-sm font-bold opacity-75 mb-4">What do you want to do next?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Choice testId="jam-next-cover" icon={Palette} label="Design the album cover" sub="Make the art for your jam" color="#FF2D85" onClick={onCover} />
                  <Choice testId="jam-next-stage" icon={Mic2} label="Play it on the Main Stage" sub="The crowd's waiting!" color="#8A4FFF" onClick={onStage} />
                  <Choice testId="jam-next-album" icon={Disc3} label="Open My Album" sub="See all your songs" color="#1E9BFF" onClick={onAlbum} />
                  <Choice testId="jam-next-keep" icon={Music} label="Keep jamming" sub="Back to the instruments" color="#34A853" onClick={onClose} />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
