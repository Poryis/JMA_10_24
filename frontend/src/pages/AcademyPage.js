// AcademyPage — inside the clock-tower schoolhouse. Where every visit starts.
//   Quest Board    → the Academy Tour, then 3 daily quests with ONE start button
//   The Portal     → the giant round door in the clock that leads out to the plaza
//   My Album       → the kid's saved Beat Lab / Song Studio tracks as records
//   Yearbook       → rank, next-rank meter, badges, attendance stamps
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, Stamp, Star, Printer, CircleHelp, Music2, Drum, Palette, X, Camera, Music, Sparkles } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import HowRanksWorkModal from '../components/HowRanksWorkModal';
import AvatarSprite from '../components/AvatarSprite';
import { Poster, PosterModal, loadPosters } from '../components/StagePoster';
import CoverDesigner, { Sleeve, SLEEVES, loadCovers, saveCover, normalizeCover } from '../components/CoverDesigner';
import AcademyPortal from '../components/AcademyPortal';
import QuestScroll from '../components/QuestScroll';
import { Bubbles } from '../components/UnderwaterBackdrop';
import { CORAL } from '../data/academyRoom';
import { useStreetMusic } from './CampusMapPage';
import useDailyQuests from '../hooks/useDailyQuests';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import usePlayer from '../hooks/usePlayer';
import { readAvatarOutfit } from '../hooks/useAvatar';
import { loadSavedBeats } from '../hooks/useSavedBeats';
import { ACHIEVEMENT_STICKERS } from '../data/achievements';
import { RANKS } from '../data/ranks';
import { journeyTo } from '../data/campus';
import { say } from '../lib/voice';

function loadSongs() { try { return JSON.parse(localStorage.getItem('jma_songs_v1') || '[]'); } catch { return []; } }

function Card({ children, className = '', testId }) {
  return <div data-testid={testId} className={`rounded-3xl bg-white p-4 md:p-5 ${className}`} style={{ border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}>{children}</div>;
}

function TodaysClass() {
  const navigate = useNavigate();
  const { quests, doneCount, allDone, questDays, tour, tourDone, finishTour } = useDailyQuests();
  const next = quests.find((q) => !q.done);
  return (
    <Card testId="academy-class" className="w-full max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="font-display font-black text-lg md:text-2xl" style={{ color: 'var(--jma-dark)' }} data-testid="academy-class-title">{tour ? 'Academy Tour' : 'Quest Board'}</div>
          <div className="text-xs md:text-sm font-bold" style={{ color: '#4B5668' }}>{tour ? 'First things first — two quick quests to get you set up!' : 'Three quests a day. Finish all three, earn today\'s stamp.'}</div>
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
            {!q.done && <button type="button" data-testid={`academy-quest-go-${i}`} onClick={() => navigate(journeyTo(q.route))} className="chunky-btn px-3 py-1 text-xs font-black" style={{ background: 'white', color: 'var(--jma-dark)' }}>Go</button>}
          </li>
        ))}
      </ol>
      {tour && tourDone ? (
        <motion.button type="button" data-testid="academy-tour-done" onClick={finishTour} className="chunky-btn w-full py-3 text-base md:text-lg font-black flex items-center justify-center gap-2" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }} animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Sparkles className="w-5 h-5" strokeWidth={3} /> Tour complete! Show me today's quests
        </motion.button>
      ) : allDone ? (
        <div data-testid="academy-class-done" className="rounded-2xl px-4 py-3 text-center font-black" style={{ background: '#FFCC00', border: '3px solid var(--jma-dark)', color: 'var(--jma-dark)' }}>Class complete! Stamp #{questDays} is in your Yearbook. Free play till tomorrow!</div>
      ) : (
        <motion.button type="button" data-testid="academy-start-class" onClick={() => next && navigate(journeyTo(next.route))} className="chunky-btn w-full py-3 text-base md:text-lg font-black text-white flex items-center justify-center gap-2" style={{ background: '#1E9BFF' }} animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Play className="w-5 h-5" strokeWidth={3} fill="white" /> {tour ? (doneCount === 0 ? 'Start the tour!' : 'Next stop!') : doneCount === 0 ? 'Start class!' : 'Keep going!'}
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
  const coverFor = (t, i) => normalizeCover(covers[t.id], SLEEVES[i % SLEEVES.length]);
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
                <Sleeve cover={c} avatar={avatar} kind={t.kind} title={t.name} className="transition-transform group-hover:-translate-y-1" />
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
  const [openPoster, setOpenPoster] = useState(null);
  const posters = useMemo(() => loadPosters(), []);
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
      {/* Stage posters snapped on The Stage */}
      <div className="mt-3 rounded-2xl px-3 py-2" data-testid="academy-posters" style={{ background: '#F6F8FB', border: '3px solid var(--jma-dark)' }}>
        <div className="flex items-center justify-between">
          <div className="font-black text-xs md:text-sm flex items-center gap-1.5" style={{ color: 'var(--jma-dark)' }}><Camera className="w-4 h-4" strokeWidth={3} /> Stage Posters</div>
          {posters.length === 0 && <button type="button" data-testid="academy-posters-go" onClick={() => navigate('/rank-hall')} className="text-[11px] font-black underline" style={{ color: '#FF2D85' }}>Snap one on The Stage →</button>}
        </div>
        {posters.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {posters.map((p) => (
              <button key={p.id} type="button" data-testid={`academy-poster-${p.id}`} onClick={() => setOpenPoster(p)} className="flex-shrink-0 rounded-md overflow-hidden" style={{ transform: 'rotate(-2deg)' }}><Poster poster={p} width={84} /></button>
            ))}
          </div>
        )}
      </div>
      <HowRanksWorkModal open={how} onClose={() => setHow(false)} />
      <AnimatePresence>{openPoster && <PosterModal key="poster" poster={openPoster} onClose={() => setOpenPoster(null)} testId="academy-poster-modal" />}</AnimatePresence>
    </Card>
  );
}

const WELCOME = ["Welcome to the Academy! Tap things around the room.", 'The chalkboard is your Quest Board.', 'The coral archway takes you out to the plaza!', 'Design your album covers at the art table!', 'The big book on the stand is your Yearbook.'];
const ACADEMY_TRACKS = [{ src: 'assets/music/magic.mp3', title: 'Magic' }, { src: 'assets/music/brand-new-friend.mp3', title: 'Brand New Friend' }];
// Layer positions (% of the 1920x1080 room) measured straight from the PSD export.
const ROOM = 'assets/academy/room/';
const L = {
  hole: { left: '46.9%', top: '27.9%', width: '17.8%', height: '40%' },
  chalkboard: { left: '4.73%', top: '18.88%', width: '27.84%' }, doodles: { left: '7.66%', top: '27.41%', width: '21.25%' },
  shield: { left: '77%', top: '11.52%', width: '19.19%' }, lectern: { left: '32.45%', top: '48.57%', width: '11.5%' }, book: { left: '32.05%', top: '42.84%', width: '11.79%' },
  harp: { left: '0%', top: '57.94%', width: '14.62%' }, trumpet: { left: '19.08%', top: '64.71%', width: '11.9%' },
  lanternL: { left: '34.29%', top: '24.93%', width: '3.88%' }, lanternR: { left: '73.74%', top: '24.93%', width: '3.88%' },
  art: { left: '69.27%', top: '49.67%', width: '23.99%' }, guitar: { left: '86.63%', top: '49.35%', width: '13.22%' },
};
const MOTES = Array.from({ length: 12 }, (_, i) => ({ left: `${44 + (i * 7.3) % 24}%`, top: `${62 + (i * 5.1) % 30}%`, size: 3 + (i % 3) * 2, dur: 5 + (i % 4) * 1.5, delay: -(i * 0.7) }));
const HALL = { w: 1920, h: 1080 };

// The two parchment scrolls drawn on the chalkboard carry the next two unfinished
// quests (finished ones stay until there's something new to show, with a chalk tick).
const SCROLL_SPOTS = [
  { left: '0.5%', top: '57%', width: '26.5%', height: '42%', rot: -3, font: '4.3cqw', icon: '8cqw' },
  { left: '75%', top: '36%', width: '23.5%', height: '32%', rot: 3, font: '3.6cqw', icon: '6.5cqw' },
];
function ChalkScrolls() {
  const { quests } = useDailyQuests();
  // open quests first so a finished one makes room for the next
  const shown = [...quests.filter((q) => !q.done), ...quests.filter((q) => q.done)].slice(0, SCROLL_SPOTS.length);
  return (
    <motion.div aria-hidden="true" className="absolute pointer-events-none" style={{ ...L.doodles, aspectRatio: '408 / 327', zIndex: 4, containerType: 'inline-size' }} data-testid="academy-chalk-scrolls"
      animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}>
      {shown.map((q, i) => <QuestScroll key={q.id} quest={q} spot={SCROLL_SPOTS[i]} index={i} isNext={!q.done && i === 0} />)}
    </motion.div>
  );
}

// The two easels on the art table show the kid's two latest record sleeves
// (or a "make one!" hint) so the station explains itself.
const EASELS = [{ left: '26%', top: '21%', width: '17.5%', rot: -4 }, { left: '54.5%', top: '22.5%', width: '20%', rot: 3 }];
function Easels() {
  const avatar = readAvatarOutfit();
  const latest = useMemo(() => {
    const tracks = [...loadSavedBeats().map((b) => ({ id: b.id, name: b.name, kind: 'beat', at: b.createdAt || 0 })), ...loadSongs().map((t) => ({ id: t.id, name: t.name, kind: 'song', at: Date.parse(t.createdAt) || 0 }))];
    const covers = loadCovers();
    return tracks.filter((t) => covers[t.id]).sort((a, b) => b.at - a.at).slice(0, 2).map((t) => ({ ...t, cover: normalizeCover(covers[t.id], SLEEVES[0]) }));
  }, []);
  return (
    <div aria-hidden="true" className="absolute pointer-events-none" style={{ ...L.art, aspectRatio: '461 / 392', zIndex: 5 }} data-testid="academy-easels">
      {EASELS.map((e, i) => {
        const t = latest[i];
        return (
          <motion.div key={i} className="absolute" style={{ left: e.left, top: e.top, width: e.width, rotate: e.rot }} animate={{ y: [0, -1.5, 0] }} transition={{ repeat: Infinity, duration: 3 + i, ease: 'easeInOut' }}>
            {t ? <Sleeve cover={t.cover} avatar={avatar} kind={t.kind} title={t.name} className="w-full" />
              : <div className="w-full aspect-square flex flex-col items-center justify-center gap-0.5 text-center" style={{ color: '#B8233A' }}>
                  <Palette className="w-[40%] h-[40%]" strokeWidth={2.5} />
                  <span className="font-black leading-none" style={{ fontSize: 'clamp(6px, 0.55vw, 11px)' }}>{i === 0 ? 'ALBUM' : 'COVERS'}</span>
                </div>}
          </motion.div>
        );
      })}
    </div>
  );
}

// A painted prop layer pinned to the room; `wiggle` replays its tap animation.
function Prop({ id, pos, z = 2, idle, tap, wiggle = 0, onClick, label, testId, className = '' }) {
  const img = <motion.img src={`${ROOM}${id}.png`} alt="" draggable={false} className="block w-full h-auto" animate={idle} transition={idle ? { repeat: Infinity, duration: 3.4, ease: 'easeInOut' } : undefined} />;
  if (!onClick) return <div aria-hidden="true" className={`absolute pointer-events-none ${className}`} style={{ ...pos, zIndex: z }}>{img}</div>;
  return (
    <motion.button type="button" data-testid={testId || `academy-${id}`} aria-label={label} onClick={onClick} className={`absolute p-0 border-0 bg-transparent cursor-pointer ${className}`} style={{ ...pos, zIndex: z, transformOrigin: 'bottom center' }}
      key={`${id}-${wiggle}`} animate={wiggle ? tap : {}} transition={{ duration: 0.7 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {img}
    </motion.button>
  );
}
const PANELS = { class: TodaysClass, album: MyAlbum, yearbook: Yearbook };
const ding = (f, maxMs) => {
  const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = 0.6; a.play().catch(() => {});
  if (maxMs) setTimeout(() => { const fade = setInterval(() => { a.volume = Math.max(0, a.volume - 0.1); if (a.volume <= 0.01) { clearInterval(fade); a.pause(); } }, 30); }, maxMs);
};

// Hotspot pinned to a % of the painted hall, with a pulsing ring + label so kids find it.
function Hotspot({ id, x, y, w, h, label, color, onClick, children, testId }) {
  return (
    <motion.button type="button" data-testid={testId || `academy-room-${id}`} aria-label={label} onClick={onClick} className="absolute flex flex-col items-center justify-end group" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, zIndex: 4 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {children}
      <motion.span aria-hidden="true" className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: `3px solid ${color}`, boxShadow: `0 0 0 3px rgba(255,255,255,0.6)` }} animate={{ opacity: [0.25, 0.85, 0.25], scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} />
      {label && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 font-black text-[10px] md:text-xs" style={{ background: color, color: id === 'class' || id === 'album' ? 'white' : 'var(--jma-dark)', border: '2.5px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}>{label}</span>}
    </motion.button>
  );
}

export default function AcademyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [panel, setPanel] = useState(() => { const p = new URLSearchParams(location.search).get('panel'); return PANELS[p] ? p : null; });
  const [leaving, setLeaving] = useState(false);
  useStreetMusic(ACADEMY_TRACKS);
  const [line, setLine] = useState(0);
  const [wiggle, setWiggle] = useState({ harp: 0, trumpet: 0, guitar: 0, shield: 0, lanternL: 0, lanternR: 0 });
  const [box, setBox] = useState({ w: HALL.w, h: HALL.h, left: 0, top: 0 });
  useEffect(() => { say('charlie.academy.welcome', { minGapMs: 4000 }); }, []);
  // Size the hall like background-size: cover (anchored bottom-center) so % hotspots stay glued to the art.
  useLayoutEffect(() => {
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sc = Math.max(vw / HALL.w, vh / HALL.h);
      const w = HALL.w * sc, h = HALL.h * sc;
      setBox({ w, h, left: (vw - w) / 2, top: (vh - h) * 0.6 });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const Panel = panel ? PANELS[panel] : null;
  const poke = (k, sfx, maxMs) => { setWiggle((o) => ({ ...o, [k]: o[k] + 1 })); if (sfx) ding(sfx, maxMs); };
  const goOut = () => { if (leaving) return; setLeaving(true); setTimeout(() => navigate('/home'), 650); };

  return (
    <div data-testid="academy-page" className="fixed inset-0 overflow-hidden" style={{ background: '#F7D9A8' }}>
      <GameHeader title="The Academy" showHomeButton={true} backTo="/home" />
      <motion.div data-testid="academy-hall" data-leaving={leaving ? 'true' : 'false'} className="absolute" style={{ width: box.w, height: box.h, left: box.left, top: box.top, transformOrigin: '55.8% 48%' }}
        initial={{ scale: 1.08, opacity: 0 }} animate={leaving ? { scale: 3.2, opacity: 0 } : { scale: 1, opacity: 1 }} transition={leaving ? { duration: 0.65, ease: [0.6, 0, 0.8, 1] } : { duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}>
        {/* the plaza, alive, seen through the archway (behind the plate) */}
        <AcademyPortal style={L.hole} onEnter={goOut} disabled={leaving} avatar={readAvatarOutfit()} />
        {/* the painted room — the archway is a transparent hole in this plate */}
        <img src={`${ROOM}plate.webp`} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }} />
        <Bubbles className="absolute inset-0 z-[3]" density={3} />
        {/* every coral accent breathes very slightly on its own layer */}
        {CORAL.map((c, i) => (
          <motion.img key={c.id} src={`${ROOM}${c.id}.png`} alt="" draggable={false} aria-hidden="true" className="absolute pointer-events-none" style={{ left: c.left, top: c.top, width: c.width, zIndex: 2, transformOrigin: 'bottom center' }}
            animate={{ scale: [1, 1.025, 1], rotate: [0, i % 2 ? 0.8 : -0.8, 0] }} transition={{ repeat: Infinity, duration: 3.6 + (i % 5) * 0.5, delay: -(i * 0.7), ease: 'easeInOut' }} />
        ))}
        {/* light spilling from the archway onto the floor + drifting motes */}
        <motion.div aria-hidden="true" className="absolute pointer-events-none" style={{ left: '32%', top: '64%', width: '48%', height: '36%', zIndex: 2, background: 'radial-gradient(ellipse at 50% 0%, rgba(127,239,255,0.5) 0%, rgba(52,224,246,0.22) 35%, transparent 70%)', mixBlendMode: 'screen', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%)', maskImage: 'linear-gradient(180deg, transparent 0%, black 30%)' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }} />
        {MOTES.map((m, i) => (
          <motion.span key={i} aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ left: m.left, top: m.top, width: m.size, height: m.size, background: 'white', boxShadow: '0 0 6px 2px rgba(127,239,255,0.8)', zIndex: 2 }}
            animate={{ y: [0, -40, -80], x: [0, i % 2 ? 10 : -10, 0], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: m.dur, delay: m.delay, ease: 'easeOut' }} />
        ))}

        {/* chalkboard → Quest Board (chalk doodles shimmer on their own layer) */}
        <Prop id="chalkboard" pos={L.chalkboard} />
        <Prop id="chalk-doodles" pos={L.doodles} z={3} idle={{ opacity: [0.85, 1, 0.85], y: [0, -2, 0] }} />
        <ChalkScrolls />
        {[0, 1, 2].map((n) => (
          <motion.span key={n} aria-hidden="true" className="absolute pointer-events-none" style={{ left: `${9 + n * 6}%`, top: '26%', color: ['#FFFFFF', '#FFCC00', '#7FEFFF'][n], zIndex: 3 }}
            animate={{ y: [0, -60 - n * 15], x: [0, (n % 2 ? 1 : -1) * 14], opacity: [0, 0.9, 0], rotate: [0, n % 2 ? 20 : -20] }} transition={{ repeat: Infinity, duration: 3 + n * 0.6, delay: n * 1.1, ease: 'easeOut' }}>
            <Music className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
          </motion.span>
        ))}
        <Hotspot id="class" x={5} y={20} w={27} h={42} label="Quest Board" color="#1E9BFF" onClick={() => setPanel('class')} />

        {/* lanterns sway and glow */}
        {[['lanternL', 'lantern-left'], ['lanternR', 'lantern-right']].map(([k, id], i) => (
          <Prop key={k} id={id} testId={`academy-${id}`} pos={L[k]} z={3} className="origin-top" label="Lantern" wiggle={wiggle[k]} tap={{ rotate: [0, -12, 10, -6, 3, 0] }} onClick={() => poke(k, 'sfx-bell-chime.mp3')}
            idle={{ rotate: i ? [2.5, -2.5, 2.5] : [-2.5, 2.5, -2.5] }} />
        ))}
        {[L.lanternL, L.lanternR].map((p, i) => (
          <motion.span key={i} aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ left: `calc(${p.left} - 2%)`, top: `calc(${p.top} + 3%)`, width: '8%', aspectRatio: '1 / 1', zIndex: 2, background: 'radial-gradient(circle, rgba(170,255,120,0.55) 0%, transparent 65%)', mixBlendMode: 'screen' }}
            animate={{ opacity: [0.4, 1, 0.5, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 3.1 + i * 0.4, ease: 'easeInOut' }} />
        ))}

        {/* JMA shield plaque — tap for a twinkle */}
        <Prop id="shield" pos={L.shield} z={3} label="JMA shield" wiggle={wiggle.shield} tap={{ rotate: [0, -3, 3, -2, 1, 0], scale: [1, 1.04, 1] }} onClick={() => poke('shield', 'sfx-twinkle.mp3')} />
        <motion.div aria-hidden="true" className="absolute pointer-events-none" style={{ ...L.shield, height: '40%', zIndex: 3, background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)', backgroundSize: '300% 100%', mixBlendMode: 'soft-light' }} animate={{ backgroundPosition: ['200% 0', '-100% 0'] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', repeatDelay: 3 }} />

        {/* achievement book on its lectern → Yearbook */}
        <Prop id="lectern" pos={L.lectern} z={3} />
        <Prop id="book" pos={L.book} z={4} idle={{ y: [0, -4, 0] }} />
        <Hotspot id="yearbook" x={31.5} y={43} w={13} h={30} label="Yearbook" color="#FFCC00" onClick={() => setPanel('yearbook')} />

        {/* instruments — tap to play them */}
        <Prop id="harp" pos={L.harp} z={5} label="Starfish harp" wiggle={wiggle.harp} tap={{ rotate: [0, -3, 3, -2, 1, 0], y: [0, -8, 0] }} onClick={() => poke('harp', 'sfx-arpeggio.mp3')} />
        <Prop id="trumpet" pos={L.trumpet} z={5} label="Seashell trumpet" wiggle={wiggle.trumpet} tap={{ rotate: [0, -8, 6, -4, 2, 0], scale: [1, 1.1, 1] }} onClick={() => poke('trumpet', 'sax/C4.mp3', 450)} />
        <Prop id="guitar" pos={L.guitar} z={5} label="Coral double-neck guitar" wiggle={wiggle.guitar} tap={{ rotate: [0, -4, 4, -3, 2, 0] }} onClick={() => poke('guitar', 'guitar-crunch/A3.mp3', 900)} />

        {/* seashell art table → Album Cover Studio (latest sleeves sit on the easels) */}
        <Prop id="art-station" pos={L.art} z={4} />
        <Easels />
        <Hotspot id="album" x={70} y={50} w={23} h={36} label="Album Cover Studio" color="#FF2D85" onClick={() => setPanel('album')} />

        {/* Charlie on the rug */}
        <button type="button" data-testid="academy-charlie" onClick={() => setLine((l) => (l + 1) % WELCOME.length)} aria-label="Talk to Charlie" className="absolute flex flex-col items-center" style={{ left: '57%', bottom: '4%', width: '9%', zIndex: 6 }}>
          <AnimatePresence mode="wait">
            <motion.span key={line} data-testid="academy-charlie-bubble" className="mb-1 rounded-2xl px-3 py-1.5 text-[10px] md:text-xs font-black text-center bg-white" style={{ color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)', minWidth: '160%' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>{WELCOME[line]}</motion.span>
          </AnimatePresence>
          <motion.img src="assets/characters/charlie-grad.png" alt="" draggable={false} className="w-full h-auto" style={{ filter: 'drop-shadow(0 6px 0 rgba(2,36,63,0.25))' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        </button>
      </motion.div>
      {leaving && <motion.div data-testid="academy-door-transition" className="fixed inset-0 pointer-events-none" style={{ background: 'var(--jma-dark)', zIndex: 60 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} />}

      <AnimatePresence>
      </AnimatePresence>

      <AnimatePresence>
        {Panel && (
          <motion.div data-testid={`academy-panel-${panel}`} className="fixed inset-0 z-[60] flex items-center justify-center p-3 pt-14 md:pt-20" style={{ background: 'rgba(2,36,63,0.55)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(null)}>
            <motion.div className="relative w-full flex justify-center max-h-full overflow-y-auto" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full flex justify-center">
                <Panel />
                <button type="button" data-testid="academy-panel-close" onClick={() => setPanel(null)} aria-label="Close" className="absolute top-2 right-2 md:right-auto md:left-[calc(50%+21.5rem)] w-10 h-10 rounded-full bg-white flex items-center justify-center" style={{ border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)', zIndex: 2 }}><X className="w-5 h-5" strokeWidth={3} style={{ color: 'var(--jma-dark)' }} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
