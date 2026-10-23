// AcademyPage — inside the clock-tower schoolhouse. Three rooms, one job each:
//   Today's Class  → the 3 daily quests with ONE start button (no menus)
//   My Album       → the kid's saved Beat Lab / Song Studio tracks as records
//   Yearbook       → rank, next-rank meter, badges, attendance stamps
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Disc3, BookOpen, Play, Check, Stamp, Star, Printer, CircleHelp, Music2, Drum, Palette, X } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import HowRanksWorkModal from '../components/HowRanksWorkModal';
import AvatarSprite from '../components/AvatarSprite';
import useDailyQuests from '../hooks/useDailyQuests';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import usePlayer from '../hooks/usePlayer';
import { readAvatarOutfit } from '../hooks/useAvatar';
import { loadSavedBeats } from '../hooks/useSavedBeats';
import { ACHIEVEMENT_STICKERS } from '../data/achievements';
import { RANKS } from '../data/ranks';
import { COLLECTION_STICKERS } from '../data/stickers';
import { say } from '../lib/voice';

const ROOMS = [
  { id: 'class', label: "Today's Class", Icon: CalendarCheck, color: '#1E9BFF' },
  { id: 'album', label: 'My Album', Icon: Disc3, color: '#FF2D85' },
  { id: 'yearbook', label: 'Yearbook', Icon: BookOpen, color: '#FFCC00' },
];
const SLEEVES = ['#FF2D85', '#1E9BFF', '#34A853', '#FF9500', '#8E5BFF', '#00B8D9'];

const COVERS_KEY = 'jma_album_covers_v1';
const COVER_STICKERS = COLLECTION_STICKERS.filter((st) => st.icon).slice(0, 16);
function loadCovers() { try { return JSON.parse(localStorage.getItem(COVERS_KEY) || '{}'); } catch { return {}; } }
function saveCover(id, cover) { const all = loadCovers(); all[id] = cover; try { localStorage.setItem(COVERS_KEY, JSON.stringify(all)); } catch { /* ignore */ } }

function Sleeve({ color, stickerSrc, avatar, kind, className = '' }) {
  return (
    <div className={`relative aspect-square rounded-xl overflow-hidden flex items-end justify-center ${className}`} style={{ background: color, border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>
      <span className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-black/80 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-white" /></span>
      {stickerSrc
        ? <img src={stickerSrc} alt="" className="h-[78%] w-auto object-contain object-bottom" />
        : <AvatarSprite src={avatar.src} helmet={avatar.helmet} className="h-[78%] w-auto object-contain object-bottom" />}
      <span className="absolute left-1.5 bottom-1.5 text-[9px] font-black uppercase px-1.5 rounded-full bg-white" style={{ color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{kind}</span>
    </div>
  );
}

function CoverDesigner({ track, cover, avatar, onSave, onClose, onOpen }) {
  const [color, setColor] = useState(cover?.color || SLEEVES[0]);
  const [sticker, setSticker] = useState(cover?.sticker || null);
  const stickerSrc = COVER_STICKERS.find((st) => st.id === sticker)?.icon || null;
  return (
    <motion.div data-testid="cover-designer" className="fixed inset-0 z-[80] flex items-center justify-center p-3" style={{ background: 'rgba(2,36,63,0.7)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative w-full max-w-lg rounded-3xl bg-white p-4 max-h-[94vh] overflow-y-auto" style={{ border: '4px solid var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }} initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.96 }} onClick={(e) => e.stopPropagation()}>
        <button type="button" data-testid="cover-close" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center"><X className="w-4 h-4" strokeWidth={3} style={{ color: 'var(--jma-dark)' }} /></button>
        <div className="font-display font-black text-lg pr-8 truncate" style={{ color: 'var(--jma-dark)' }}>{track.name}</div>
        <div className="text-xs font-bold mb-3" style={{ color: '#4B5668' }}>Design your record sleeve</div>
        <div className="flex gap-4">
          <div className="w-32 md:w-40 flex-shrink-0"><Sleeve color={color} stickerSrc={stickerSrc} avatar={avatar} kind={track.kind} /></div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase mb-1" style={{ color: '#4B5668' }}>Color</div>
            <div className="flex flex-wrap gap-1.5 mb-3" data-testid="cover-colors">
              {SLEEVES.map((c) => <button key={c} type="button" data-testid={`cover-color-${c.slice(1)}`} aria-pressed={color === c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ background: c, border: '3px solid var(--jma-dark)', transform: color === c ? 'scale(1.15)' : 'none', boxShadow: color === c ? '0 0 0 3px white, 0 0 0 5px var(--jma-dark)' : 'none' }} />)}
            </div>
            <div className="text-[11px] font-black uppercase mb-1" style={{ color: '#4B5668' }}>Sticker</div>
            <div className="grid grid-cols-5 gap-1.5" data-testid="cover-stickers">
              <button type="button" data-testid="cover-sticker-me" aria-pressed={!sticker} onClick={() => setSticker(null)} className="aspect-square rounded-lg flex items-center justify-center overflow-hidden" style={{ background: '#F6F8FB', border: `3px solid ${!sticker ? '#FF9500' : 'var(--jma-dark)'}` }}><AvatarSprite src={avatar.src} helmet={avatar.helmet} className="h-[80%] w-auto object-contain" /></button>
              {COVER_STICKERS.map((st) => <button key={st.id} type="button" data-testid={`cover-sticker-${st.id}`} aria-pressed={sticker === st.id} onClick={() => setSticker(st.id)} className="aspect-square rounded-lg flex items-center justify-center overflow-hidden" style={{ background: '#F6F8FB', border: `3px solid ${sticker === st.id ? '#FF9500' : 'var(--jma-dark)'}` }}><img src={st.icon} alt={st.name} className="h-[80%] w-auto object-contain" /></button>)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" data-testid="cover-save" onClick={() => onSave({ color, sticker })} className="chunky-btn flex-1 py-2 text-sm font-black text-white flex items-center justify-center gap-1.5" style={{ background: '#34A853' }}><Check className="w-4 h-4" strokeWidth={3} /> Save cover</button>
          <button type="button" data-testid="cover-open" onClick={onOpen} className="chunky-btn flex-1 py-2 text-sm font-black flex items-center justify-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><Play className="w-4 h-4" strokeWidth={3} /> Open in {track.kind === 'beat' ? 'Beat Lab' : 'Song Studio'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function loadSongs() { try { return JSON.parse(localStorage.getItem('jma_songs_v1') || '[]'); } catch { return []; } }

function Card({ children, className = '', testId }) {
  return <div data-testid={testId} className={`rounded-3xl bg-white p-4 md:p-5 ${className}`} style={{ border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}>{children}</div>;
}

function TodaysClass() {
  const navigate = useNavigate();
  const { quests, doneCount, allDone, questDays } = useDailyQuests();
  const next = quests.find((q) => !q.done);
  return (
    <Card testId="academy-class" className="w-full max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="font-display font-black text-lg md:text-2xl" style={{ color: 'var(--jma-dark)' }}>Today's Class</div>
          <div className="text-xs md:text-sm font-bold" style={{ color: '#4B5668' }}>Three things. Finish all three, earn today's stamp.</div>
        </div>
        <div data-testid="academy-stamps" className="flex items-center gap-1 rounded-full px-3 py-1 font-black text-sm" style={{ background: '#FFF4D6', border: '3px solid var(--jma-dark)', color: 'var(--jma-dark)' }}><Stamp className="w-4 h-4" strokeWidth={3} /> {questDays}</div>
      </div>
      <ol className="space-y-2 mb-4">
        {quests.map((q, i) => (
          <li key={q.id} data-testid={`academy-quest-${i}`} data-done={q.done} className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: q.done ? '#E8F8EE' : '#F6F8FB', border: '3px solid var(--jma-dark)', opacity: q.done ? 0.85 : 1 }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white" style={{ background: q.done ? '#34A853' : 'var(--jma-dark)' }}>{q.done ? <Check className="w-5 h-5" strokeWidth={4} /> : i + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm md:text-base font-black leading-tight truncate" style={{ color: 'var(--jma-dark)', textDecoration: q.done ? 'line-through' : 'none' }}>{q.title}</span>
              <span className="block text-[11px] md:text-xs font-bold" style={{ color: '#4B5668' }}>{q.where}{q.target > 1 ? ` · ${q.progress}/${q.target}` : ''}</span>
            </span>
            {!q.done && <button type="button" data-testid={`academy-quest-go-${i}`} onClick={() => navigate(q.route)} className="chunky-btn px-3 py-1 text-xs font-black" style={{ background: 'white', color: 'var(--jma-dark)' }}>Go</button>}
          </li>
        ))}
      </ol>
      {allDone ? (
        <div data-testid="academy-class-done" className="rounded-2xl px-4 py-3 text-center font-black" style={{ background: '#FFCC00', border: '3px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>Class complete! Stamp #{questDays} is in your Yearbook. Free play till tomorrow!</div>
      ) : (
        <motion.button type="button" data-testid="academy-start-class" onClick={() => next && navigate(next.route)} className="chunky-btn w-full py-3 text-base md:text-lg font-black text-white flex items-center justify-center gap-2" style={{ background: '#1E9BFF' }} animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Play className="w-5 h-5" strokeWidth={3} fill="white" /> {doneCount === 0 ? 'Start class!' : 'Keep going!'}
        </motion.button>
      )}
    </Card>
  );
}

function MyAlbum() {
  const navigate = useNavigate();
  const avatar = readAvatarOutfit();
  const [covers, setCovers] = useState(loadCovers);
  const [editing, setEditing] = useState(null);
  const tracks = useMemo(() => [
    ...loadSavedBeats().map((b) => ({ id: b.id, name: b.name, kind: 'beat', meta: `${b.bpm} BPM · Beat Lab`, route: '/loop-studio', at: b.createdAt || 0 })),
    ...loadSongs().map((s) => ({ id: s.id, name: s.name, kind: 'song', meta: 'Song Studio', route: '/song-studio', at: Date.parse(s.createdAt) || 0 })),
  ].sort((a, b) => b.at - a.at), []);
  const coverFor = (t, i) => covers[t.id] || { color: SLEEVES[i % SLEEVES.length], sticker: null };
  return (
    <Card testId="academy-album" className="w-full max-w-3xl">
      <div className="font-display font-black text-lg md:text-2xl mb-1" style={{ color: 'var(--jma-dark)' }}>My Album</div>
      <div className="text-xs md:text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: '#4B5668' }}><Palette className="w-4 h-4" strokeWidth={3} /> Tap a record to design its cover.</div>
      {tracks.length === 0 ? (
        <div data-testid="academy-album-empty" className="rounded-2xl p-4 text-center" style={{ background: '#F6F8FB', border: '3px dashed var(--jma-dark)' }}>
          <div className="font-black mb-3" style={{ color: 'var(--jma-dark)' }}>No tracks yet — go make your first one!</div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" data-testid="academy-album-beatlab" onClick={() => navigate('/loop-studio')} className="chunky-btn px-4 py-2 text-sm font-black text-white flex items-center gap-1.5" style={{ background: '#FF2D85' }}><Drum className="w-4 h-4" strokeWidth={3} /> Beat Lab</button>
            <button type="button" data-testid="academy-album-songstudio" onClick={() => navigate('/song-studio')} className="chunky-btn px-4 py-2 text-sm font-black text-white flex items-center gap-1.5" style={{ background: '#FF9500' }}><Music2 className="w-4 h-4" strokeWidth={3} /> Song Studio</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {tracks.map((t, i) => {
            const c = coverFor(t, i);
            return (
              <button key={t.id} type="button" data-testid={`academy-track-${i}`} onClick={() => setEditing(t)} className="text-left group">
                <Sleeve color={c.color} stickerSrc={COVER_STICKERS.find((st) => st.id === c.sticker)?.icon || null} avatar={avatar} kind={t.kind} className="transition-transform group-hover:-translate-y-1" />
                <div className="mt-1 text-xs font-black truncate" style={{ color: 'var(--jma-dark)' }}>{t.name}</div>
                <div className="text-[10px] font-bold truncate" style={{ color: '#4B5668' }}>{t.meta}</div>
              </button>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {editing && (
          <CoverDesigner track={editing} cover={covers[editing.id]} avatar={avatar} onClose={() => setEditing(null)} onOpen={() => navigate(editing.route)}
            onSave={(cover) => { saveCover(editing.id, cover); setCovers(loadCovers()); setEditing(null); }} />
        )}
      </AnimatePresence>
    </Card>
  );
}

function Yearbook() {
  const navigate = useNavigate();
  const { currentRank, nextRank, progress, achievementCount } = useRank();
  const { earned } = useStickers();
  const { questDays } = useDailyQuests();
  const { player } = usePlayer();
  const [how, setHow] = useState(false);
  const avatar = readAvatarOutfit();
  const curIdx = RANKS.findIndex((r) => r.id === currentRank.id);
  const badges = ACHIEVEMENT_STICKERS.filter((a) => earned[a.id]);
  return (
    <Card testId="academy-yearbook" className="w-full max-w-3xl">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col items-center flex-shrink-0 rounded-2xl p-3" style={{ background: currentRank.badgeBg, border: '3px solid var(--jma-dark)', minWidth: 170 }}>
          <AvatarSprite src={avatar.src} helmet={avatar.helmet} className="h-28 md:h-36 w-auto object-contain" testId="academy-yearbook-avatar" />
          <div className="mt-2 font-display font-black text-base md:text-lg text-center leading-tight" style={{ color: 'var(--jma-dark)' }}>{player?.displayName || 'Student'}</div>
          <div data-testid="academy-yearbook-rank" className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-1 font-black text-xs md:text-sm text-white" style={{ background: currentRank.color, border: '2px solid var(--jma-dark)' }}><Star className="w-3.5 h-3.5" strokeWidth={3} /> {currentRank.title}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-lg md:text-2xl" style={{ color: 'var(--jma-dark)' }}>Yearbook</div>
          <div className="flex gap-1.5 my-2 flex-wrap" data-testid="academy-rank-ladder">
            {RANKS.map((r, i) => (
              <span key={r.id} title={r.title} className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ background: i <= curIdx ? r.badgeBg : '#E5E9F0', border: `2.5px solid ${i <= curIdx ? r.color : '#B8C0CC'}`, opacity: i <= curIdx ? 1 : 0.6 }}>
                <img src={r.icon} alt="" className="w-[80%] h-[80%] object-contain" style={{ filter: i <= curIdx ? 'none' : 'grayscale(1)' }} />
              </span>
            ))}
          </div>
          {nextRank ? (
            <div data-testid="academy-next-rank" className="rounded-2xl px-3 py-2" style={{ background: '#F6F8FB', border: '3px solid var(--jma-dark)' }}>
              <div className="flex items-center justify-between text-xs md:text-sm font-black" style={{ color: 'var(--jma-dark)' }}><span>Next: {nextRank.title}</span><span style={{ color: '#FF9500' }}>{progress.current}/{progress.target}</span></div>
              <div className="mt-1.5 h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E9F0' }}><motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FFCC00, #FF9500)' }} initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ duration: 0.8 }} /></div>
              <div className="mt-1 text-[11px] font-bold" style={{ color: '#4B5668' }}>{nextRank.requirement.label}</div>
            </div>
          ) : <div className="rounded-2xl px-3 py-2 font-black text-sm" style={{ background: '#FFF4D6', border: '3px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>Maestro — every rank earned!</div>}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div data-testid="academy-badge-count" className="rounded-2xl px-3 py-2 text-center" style={{ background: '#F6F8FB', border: '3px solid var(--jma-dark)' }}><div className="font-display font-black text-xl" style={{ color: 'var(--jma-dark)' }}>{achievementCount}</div><div className="text-[11px] font-bold" style={{ color: '#4B5668' }}>music badges</div></div>
            <div data-testid="academy-stamp-count" className="rounded-2xl px-3 py-2 text-center" style={{ background: '#F6F8FB', border: '3px solid var(--jma-dark)' }}><div className="font-display font-black text-xl" style={{ color: 'var(--jma-dark)' }}>{questDays}</div><div className="text-[11px] font-bold" style={{ color: '#4B5668' }}>class stamps</div></div>
          </div>
          {badges.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap" data-testid="academy-badges">
              {badges.map((b) => <span key={b.id} className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: '#FFF4D6', border: '2px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>{b.name}</span>)}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" data-testid="academy-how-ranks" onClick={() => setHow(true)} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: 'white', color: 'var(--jma-dark)' }}><CircleHelp className="w-4 h-4" strokeWidth={3} /> How do ranks work?</button>
            <button type="button" data-testid="academy-print" onClick={() => navigate('/sticker-book?print=1')} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: 'white', color: 'var(--jma-dark)' }}><Printer className="w-4 h-4" strokeWidth={3} /> Grown-ups: print report</button>
          </div>
        </div>
      </div>
      <HowRanksWorkModal open={how} onClose={() => setHow(false)} />
    </Card>
  );
}

const WELCOME = ["Welcome to the Academy! Today's class is on the board.", 'Finish all three and stamp your card!', 'Your records live on the shelf in My Album.', 'Rank up and a new friend pops out of the clock!'];

export default function AcademyPage() {
  const [room, setRoom] = useState('class');
  const [line, setLine] = useState(0);
  useEffect(() => { say('charlie.academy.welcome', { minGapMs: 4000 }); }, []);
  return (
    <div data-testid="academy-page" className="min-h-screen flex flex-col items-center jma-safe-center p-4 pt-20 md:pt-24 pb-8 relative" style={{ backgroundImage: 'url(assets/academy/hall.jpg)', backgroundSize: 'cover', backgroundPosition: 'center bottom', backgroundColor: '#F7D9A8' }}>
      <GameHeader title="The Academy" showHomeButton={true} backTo="/home" />
      <button type="button" data-testid="academy-charlie" onClick={() => setLine((l) => (l + 1) % WELCOME.length)} aria-label="Talk to Charlie" className="academy-charlie absolute hidden md:flex flex-col items-center" style={{ left: '3%', bottom: '4%', width: 'clamp(120px, 14vw, 220px)', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.span key={line} data-testid="academy-charlie-bubble" className="mb-1 rounded-2xl px-3 py-1.5 text-[11px] md:text-xs font-black text-center bg-white" style={{ color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>{WELCOME[line]}</motion.span>
        </AnimatePresence>
        <motion.img src="assets/characters/charlie-grad.png" alt="" draggable={false} className="w-full h-auto" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
      </button>
      <div className="relative z-[1] flex gap-2 mb-4 flex-wrap justify-center" data-testid="academy-rooms">
        {ROOMS.map(({ id, label, Icon, color }) => (
          <button key={id} type="button" data-testid={`academy-room-${id}`} aria-pressed={room === id} onClick={() => setRoom(id)} className="chunky-btn px-3 md:px-4 py-2 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: room === id ? color : 'white', color: room === id && id !== 'yearbook' ? 'white' : 'var(--jma-dark)' }}>
            <Icon className="w-4 h-4" strokeWidth={3} /> {label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={room} className="relative z-[1] w-full flex justify-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          {room === 'class' && <TodaysClass />}
          {room === 'album' && <MyAlbum />}
          {room === 'yearbook' && <Yearbook />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
