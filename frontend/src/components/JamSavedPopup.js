// Shared "save it" popup (Jam Session, Beat Lab, Song Studio): step 1 name it, step 2 choose what to do next.
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Disc3 } from 'lucide-react';

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

export default function JamSavedPopup({ naming, value, onChange, onSave, saved, choices, title = 'Name your jam!', saveLabel = 'Save to My Album', onCancel, testPrefix = 'jam' }) {
  const open = !!naming || !!saved;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div data-testid={`${testPrefix}-save-popup`} className="fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto p-4"
          style={{ background: 'rgba(10,37,64,0.6)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative w-full max-w-sm sm:max-w-xl rounded-3xl p-5 my-auto" style={card} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
            {naming ? (
              <form data-testid={`${testPrefix}-name-form`} onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div className="flex items-center gap-2 mb-3"><Disc3 className="w-7 h-7" style={{ color: '#1E9BFF' }} /><h2 className="text-2xl font-black font-display">{title}</h2></div>
                <input data-testid={`${testPrefix}-name-input`} autoFocus maxLength={24} value={value} onChange={(e) => onChange(e.target.value)} placeholder={naming.name}
                  className="w-full px-4 py-3 rounded-2xl text-lg font-bold outline-none mb-4" style={{ background: '#fff', border: '3px solid var(--jma-dark)' }} />
                <div className="flex gap-2">
                  {onCancel && <button type="button" data-testid={`${testPrefix}-name-cancel`} onClick={onCancel} className="chunky-btn px-4 py-3 text-lg font-black bg-white text-[var(--jma-dark)] touch-manipulation">Cancel</button>}
                  <button type="submit" data-testid={`${testPrefix}-name-save`} className="chunky-btn flex-1 py-3 text-lg font-black bg-[var(--jma-yellow)] text-[var(--jma-dark)] touch-manipulation">{saveLabel}</button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-black font-display mb-1" data-testid={`${testPrefix}-saved-title`}>“{saved}” is saved!</h2>
                <p className="text-sm font-bold opacity-75 mb-4">What do you want to do next?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {choices.map((c) => <Choice key={c.testId} {...c} />)}
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
