// CoverDesigner — the kid's record-sleeve studio (My Album in the Academy).
// Choices: 12 colors, 6 patterns, 3 sticker slots (big / top-left / bottom-right)
// drawn from every sticker they've earned, 4 frames and a vinyl label color.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Check, X, Shuffle, User } from 'lucide-react';
import AvatarSprite from './AvatarSprite';
import useStickers from '../hooks/useStickers';
import { COLLECTION_STICKERS, STICKER_CATEGORIES } from '../data/stickers';

export const SLEEVES = ['#FF2D85', '#1E9BFF', '#34A853', '#FF9500', '#8E5BFF', '#00B8D9', '#FFCC00', '#FF3B30', '#2EC4B6', '#F76FB8', '#1E2A47', '#F6F8FB'];
export const LABELS = ['#111111', '#FFFFFF', '#FF2D85', '#1E9BFF', '#FFCC00', '#34A853', '#FF9500', '#8E5BFF'];
const STAR = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path fill="rgba(255,255,255,.4)" d="M14 3l3 8h8l-6.5 5 2.5 8-7-5-7 5 2.5-8L3 11h8z"/></svg>');
const WAVE = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><path fill="none" stroke="rgba(255,255,255,.4)" stroke-width="3" d="M0 10c5-8 15-8 20 0s15 8 20 0"/></svg>');
export const PATTERNS = [
  { id: 'solid',   name: 'Solid',   css: {} },
  { id: 'stripes', name: 'Stripes', css: { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.28) 0 10px, transparent 10px 20px)' } },
  { id: 'dots',    name: 'Dots',    css: { backgroundImage: 'radial-gradient(rgba(255,255,255,.4) 3px, transparent 3.5px)', backgroundSize: '16px 16px' } },
  { id: 'stars',   name: 'Stars',   css: { backgroundImage: `url("data:image/svg+xml,${STAR}")`, backgroundSize: '28px 28px' } },
  { id: 'waves',   name: 'Waves',   css: { backgroundImage: `url("data:image/svg+xml,${WAVE}")`, backgroundSize: '40px 20px' } },
  { id: 'checker', name: 'Checks',  css: { backgroundImage: 'conic-gradient(rgba(255,255,255,.28) 25%, transparent 0 50%, rgba(255,255,255,.28) 0 75%, transparent 0)', backgroundSize: '22px 22px' } },
];
export const FRAMES = [
  { id: 'none',  name: 'None',  style: null },
  { id: 'white', name: 'White', style: { border: '5px solid white' } },
  { id: 'gold',  name: 'Gold',  style: { border: '5px solid #FFCC00' } },
  { id: 'candy', name: 'Candy', style: { border: '5px dashed white' } },
];
export const SLOTS = [
  { id: 'main', name: 'Big' },
  { id: 'tl',   name: 'Top left' },
  { id: 'br',   name: 'Bottom right' },
];

const COVERS_KEY = 'jma_album_covers_v1';
export function loadCovers() { try { return JSON.parse(localStorage.getItem(COVERS_KEY) || '{}'); } catch { return {}; } }
export function saveCover(id, cover) { const all = loadCovers(); all[id] = cover; try { localStorage.setItem(COVERS_KEY, JSON.stringify(all)); } catch { /* ignore */ } }

// Old covers were { color, sticker } with sticker=null meaning "my avatar".
export function normalizeCover(c, fallbackColor) {
  if (!c) return { color: fallbackColor, pattern: 'solid', frame: 'none', label: '#111111', stickers: { main: 'me', tl: null, br: null } };
  return { color: c.color || fallbackColor, pattern: c.pattern || 'solid', frame: c.frame || 'none', label: c.label || '#111111', stickers: c.stickers || { main: c.sticker || 'me', tl: null, br: null } };
}

const ICON_OF = Object.fromEntries(COLLECTION_STICKERS.filter((s) => s.icon).map((s) => [s.id, s.icon]));

function SlotArt({ value, avatar, className }) {
  if (!value) return null;
  if (value === 'me') return <AvatarSprite src={avatar.src} helmet={avatar.helmet} className={className} />;
  const src = ICON_OF[value];
  return src ? <img src={src} alt="" className={className} /> : null;
}

export function Sleeve({ cover, avatar, kind, className = '', activeSlot, onSlot }) {
  const pat = PATTERNS.find((p) => p.id === cover.pattern) || PATTERNS[0];
  const frame = FRAMES.find((f) => f.id === cover.frame) || FRAMES[0];
  const ring = (id) => (onSlot && activeSlot === id ? { outline: '3px dashed #FF9500', outlineOffset: 2, borderRadius: 8 } : {});
  const slot = (id, cls, imgCls) => {
    const art = <SlotArt value={cover.stickers[id]} avatar={avatar} className={imgCls} />;
    return onSlot
      ? <button type="button" data-testid={`sleeve-slot-${id}`} aria-pressed={activeSlot === id} onClick={() => onSlot(id)} className={`absolute flex ${cls}`} style={ring(id)}>{art}</button>
      : <span className={`absolute flex ${cls}`}>{art}</span>;
  };
  return (
    <div data-testid="sleeve" className={`relative aspect-square rounded-xl overflow-hidden ${className}`} style={{ background: cover.color, ...pat.css, border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>
      {frame.style && <span className="absolute inset-1 rounded-lg pointer-events-none" style={frame.style} />}
      <span data-testid="sleeve-label" className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: cover.label, border: '2px solid var(--jma-dark)' }}><span className="w-2 h-2 rounded-full" style={{ background: cover.label === '#111111' ? 'white' : 'var(--jma-dark)' }} /></span>
      {slot('main', 'inset-x-0 bottom-0 h-[76%] items-end justify-center', 'h-full w-auto max-w-[70%] object-contain object-bottom')}
      {slot('tl', 'left-1.5 top-1.5 w-[30%] h-[30%] items-center justify-center', 'h-full w-full object-contain')}
      {slot('br', 'right-1.5 bottom-7 w-[30%] h-[30%] items-center justify-center', 'h-full w-full object-contain')}
      <span className="absolute left-1.5 bottom-1.5 text-[9px] font-black uppercase px-1.5 rounded-full bg-white" style={{ color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{kind}</span>
    </div>
  );
}

const TABS = [{ id: 'color', name: 'Color' }, { id: 'pattern', name: 'Pattern' }, { id: 'stickers', name: 'Stickers' }, { id: 'frame', name: 'Frame' }];
const sel = (on) => ({ border: `3px solid ${on ? '#FF9500' : 'var(--jma-dark)'}`, boxShadow: on ? '0 0 0 3px white, 0 0 0 5px #FF9500' : 'none' });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function Swatches({ list, value, onPick, prefix }) {
  return <div className="flex flex-wrap gap-2" data-testid={`${prefix}s`}>{list.map((c) => <button key={c} type="button" data-testid={`${prefix}-${c.slice(1)}`} aria-pressed={value === c} onClick={() => onPick(c)} className="w-10 h-10 rounded-full" style={{ background: c, ...sel(value === c) }} />)}</div>;
}

function StickerPicker({ cover, avatar, slot, setSlot, onPick }) {
  const { earned } = useStickers();
  const [cat, setCat] = useState('all');
  const avail = COLLECTION_STICKERS.filter((s) => s.icon && (earned[s.id] || s.category === 'characters'));
  const cats = STICKER_CATEGORIES.filter((c) => avail.some((s) => s.category === c.id));
  const shown = cat === 'all' ? avail : avail.filter((s) => s.category === cat);
  const cur = cover.stickers[slot];
  const tile = (on) => ({ background: '#F6F8FB', ...sel(on) });
  return (
    <div>
      <div className="flex gap-1.5 mb-2" data-testid="cover-slots">
        {SLOTS.map((s) => <button key={s.id} type="button" data-testid={`cover-slot-${s.id}`} aria-pressed={slot === s.id} onClick={() => setSlot(s.id)} className="flex-1 py-1 rounded-full text-[11px] font-black" style={{ background: slot === s.id ? '#FF9500' : 'white', color: slot === s.id ? 'white' : 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{s.name}</button>)}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2 no-scrollbar" data-testid="cover-categories">
        {[{ id: 'all', label: 'All' }, ...cats].map((c) => <button key={c.id} type="button" data-testid={`cover-cat-${c.id}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap" style={{ background: cat === c.id ? 'var(--jma-dark)' : '#F6F8FB', color: cat === c.id ? 'white' : 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{c.label}</button>)}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5" data-testid="cover-stickers">
        <button type="button" data-testid="cover-sticker-none" aria-pressed={!cur} onClick={() => onPick(null)} className="aspect-square rounded-lg flex items-center justify-center" style={tile(!cur)}><X className="w-5 h-5" strokeWidth={3} style={{ color: '#4B5668' }} /></button>
        <button type="button" data-testid="cover-sticker-me" aria-pressed={cur === 'me'} onClick={() => onPick('me')} className="aspect-square rounded-lg flex items-center justify-center overflow-hidden" style={tile(cur === 'me')}><AvatarSprite src={avatar.src} helmet={avatar.helmet} className="h-[80%] w-auto object-contain" /></button>
        {shown.map((st) => <button key={st.id} type="button" data-testid={`cover-sticker-${st.id}`} aria-pressed={cur === st.id} onClick={() => onPick(st.id)} className="aspect-square rounded-lg flex items-center justify-center overflow-hidden" style={tile(cur === st.id)}><img src={st.icon} alt={st.name} title={st.name} className="h-[80%] w-auto object-contain" /></button>)}
      </div>
      <div className="text-[10px] font-bold mt-2 flex items-center gap-1" style={{ color: '#4B5668' }}><User className="w-3 h-3" strokeWidth={3} /> Earn more stickers in games to unlock more choices.</div>
    </div>
  );
}

export default function CoverDesigner({ track, cover: saved, avatar, onSave, onClose, onOpen }) {
  const [cover, setCover] = useState(() => normalizeCover(saved, SLEEVES[0]));
  const [tab, setTab] = useState('color');
  const [slot, setSlot] = useState('main');
  const set = (patch) => setCover((c) => ({ ...c, ...patch }));
  const setSticker = (v) => setCover((c) => ({ ...c, stickers: { ...c.stickers, [slot]: v } }));
  const shuffle = () => {
    const ids = COLLECTION_STICKERS.filter((s) => s.icon).map((s) => s.id);
    set({ color: pick(SLEEVES), pattern: pick(PATTERNS).id, frame: pick(FRAMES).id, label: pick(LABELS), stickers: { main: pick(['me', 'me', ...ids]), tl: pick([null, ...ids]), br: pick([null, ...ids]) } });
  };
  return (
    <motion.div data-testid="cover-designer" className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-3" style={{ background: 'rgba(2,36,63,0.7)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative w-full max-w-2xl rounded-3xl bg-white p-3 sm:p-4 max-h-[96vh] overflow-y-auto" style={{ border: '4px solid var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }} initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.96 }} onClick={(e) => e.stopPropagation()}>
        <button type="button" data-testid="cover-close" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center"><X className="w-4 h-4" strokeWidth={3} style={{ color: 'var(--jma-dark)' }} /></button>
        <div className="font-display font-black text-lg pr-8 truncate" style={{ color: 'var(--jma-dark)' }}>{track.name}</div>
        <div className="text-xs font-bold mb-3" style={{ color: '#4B5668' }}>Design your record sleeve — tap a spot on the cover to put a sticker there.</div>
        <div className="flex gap-3 sm:gap-4">
          <div className="w-36 sm:w-44 md:w-52 flex-shrink-0">
            <Sleeve cover={cover} avatar={avatar} kind={track.kind} activeSlot={tab === 'stickers' ? slot : null} onSlot={(id) => { setSlot(id); setTab('stickers'); }} />
            <button type="button" data-testid="cover-shuffle" onClick={shuffle} className="chunky-btn w-full mt-3 py-1.5 text-xs font-black flex items-center justify-center gap-1.5" style={{ background: '#8E5BFF', color: 'white' }}><Shuffle className="w-4 h-4" strokeWidth={3} /> Surprise me!</button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 mb-3" data-testid="cover-tabs">
              {TABS.map((t) => <button key={t.id} type="button" data-testid={`cover-tab-${t.id}`} aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="flex-1 py-1.5 rounded-full text-[11px] sm:text-xs font-black" style={{ background: tab === t.id ? 'var(--jma-dark)' : '#F6F8FB', color: tab === t.id ? 'white' : 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{t.name}</button>)}
            </div>
            <div className="min-h-[9rem]">
              {tab === 'color' && <Swatches list={SLEEVES} value={cover.color} onPick={(color) => set({ color })} prefix="cover-color" />}
              {tab === 'pattern' && (
                <div className="grid grid-cols-3 gap-2" data-testid="cover-patterns">
                  {PATTERNS.map((p) => <button key={p.id} type="button" data-testid={`cover-pattern-${p.id}`} aria-pressed={cover.pattern === p.id} onClick={() => set({ pattern: p.id })} className="rounded-xl h-14 flex items-end justify-center pb-1 text-[10px] font-black text-white" style={{ background: cover.color, ...p.css, textShadow: '0 1px 0 var(--jma-dark), 0 0 3px var(--jma-dark)', ...sel(cover.pattern === p.id) }}>{p.name}</button>)}
                </div>
              )}
              {tab === 'stickers' && <StickerPicker cover={cover} avatar={avatar} slot={slot} setSlot={setSlot} onPick={setSticker} />}
              {tab === 'frame' && (
                <div>
                  <div className="text-[11px] font-black uppercase mb-1" style={{ color: '#4B5668' }}>Frame</div>
                  <div className="grid grid-cols-4 gap-2 mb-3" data-testid="cover-frames">
                    {FRAMES.map((f) => <button key={f.id} type="button" data-testid={`cover-frame-${f.id}`} aria-pressed={cover.frame === f.id} onClick={() => set({ frame: f.id })} className="relative rounded-xl h-14 overflow-hidden flex items-end justify-center pb-1 text-[10px] font-black text-white" style={{ background: cover.color, textShadow: '0 1px 0 var(--jma-dark), 0 0 3px var(--jma-dark)', ...sel(cover.frame === f.id) }}>{f.style && <span className="absolute inset-1 rounded-lg pointer-events-none" style={f.style} />}<span className="relative">{f.name}</span></button>)}
                  </div>
                  <div className="text-[11px] font-black uppercase mb-1" style={{ color: '#4B5668' }}>Record label</div>
                  <Swatches list={LABELS} value={cover.label} onPick={(label) => set({ label })} prefix="cover-label" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" data-testid="cover-save" onClick={() => onSave(cover)} className="chunky-btn flex-1 py-2 text-sm font-black text-white flex items-center justify-center gap-1.5" style={{ background: '#34A853' }}><Check className="w-4 h-4" strokeWidth={3} /> Save cover</button>
          <button type="button" data-testid="cover-open" onClick={onOpen} className="chunky-btn flex-1 py-2 text-sm font-black flex items-center justify-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><Play className="w-4 h-4" strokeWidth={3} /> Open in {track.kind === 'beat' ? 'Beat Lab' : 'Song Studio'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
