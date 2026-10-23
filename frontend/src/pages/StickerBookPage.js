// Sticker Book — three top-level sections:
//   🏅 Achievement Badges (bronze/silver/gold enamel — drive rank)
//   🎭 Meet the Band       (characters)
//   🎁 Collection          (everything else — outfits, instruments, bells, songs, etc.)
//
// Achievement badges visually distinct (enamel + tier ribbon) so kids/teachers
// can instantly tell skill badges from flair. Round Collection stickers keep
// their old look.

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Trophy, GraduationCap, Printer, Settings, Shirt } from 'lucide-react';
import { STICKER_MAP, COLLECTION_STICKERS, STICKER_CATEGORIES } from '../data/stickers';
import { ACHIEVEMENT_DOMAINS, ACHIEVEMENT_TIERS, achievementId, DOMAIN_MAP } from '../data/achievements';
import useStickers from '../hooks/useStickers';
import { MISSIONS } from '../hooks/useNextMission';
import RankBadge from '../components/RankBadge';
import AchievementBadge from '../components/AchievementBadge';
import HarpIcon from '../components/HarpIcon';
import FitBox from '../components/FitBox';
import PrintReport from '../components/PrintReport';
import ManageDataModal from '../components/ManageDataModal';
import HowRanksWorkModal from '../components/HowRanksWorkModal';

const TEACHER_VIEW_KEY = 'jma_teacher_view_v1';

// Detail modal for ANY sticker (round or badge).
// Prerequisite tier lookup — Cadet has no prereq; Pro requires Cadet;
// Master requires Pro. Used to gate the "how to earn" reveal on locked
// achievement badges so we never surface a task for a tier the kid
// hasn't unlocked yet.
const TIER_PREREQ = { cadet: null, pro: 'cadet', master: 'pro' };

function StickerDetailModal({ sticker, earned, allEarned, teacherView, onClose, onNavigate }) {
  if (!sticker) return null;
  const isEarned = !!earned;
  const isAchievement = sticker.category === 'achievements';

  // Achievement-only extras: domain metadata, kid-facing earn instruction,
  // and the teacher-facing pedagogical description. Both are sourced from
  // existing data (no new copy) so the source of truth stays with the
  // MISSIONS catalog and ACHIEVEMENT_DOMAINS.
  const mission = isAchievement ? MISSIONS[sticker.id] : null;
  const domain = isAchievement ? DOMAIN_MAP[sticker.domain] : null;

  // Gate: don't reveal an earn-instruction for a tier the kid has not
  // unlocked yet. Cadet is always safe; Pro needs Cadet earned; Master
  // needs Pro earned. Earned badges always reveal (that's the "you did
  // this by…" moment).
  let showKidEarnLine = false;
  if (isAchievement && mission) {
    if (isEarned) {
      showKidEarnLine = true;
    } else {
      const prereqTier = TIER_PREREQ[sticker.tier];
      if (!prereqTier) {
        showKidEarnLine = true; // Cadet — no prereq
      } else {
        const prereqId = achievementId(sticker.domain, prereqTier);
        showKidEarnLine = !!(allEarned && allEarned[prereqId]);
      }
    }
  }

  const accentColor = isEarned ? (sticker.color || 'var(--jma-dark)') : '#64748b';

  // Portal to <body>: inside FitStage's transformed stage, `fixed` would pin to the top of the
  // scrolled page (off-screen on landscape phones) instead of the real viewport.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      data-testid="sticker-detail-modal"
    >
      <FitBox className="w-full max-w-sm">
      <motion.div
        className="relative bg-white rounded-3xl border-4 w-full p-6 text-center shadow-2xl"
        style={{
          borderColor: accentColor,
          boxShadow: `0 10px 0 0 ${accentColor}`,
        }}
        initial={{ scale: 0.7, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white border-3 border-[var(--jma-dark)] flex items-center justify-center shadow-md"
          aria-label="Close">
          <X className="w-4 h-4" style={{ color: 'var(--jma-dark)' }} />
        </button>
        {isAchievement ? (
          <div className="flex justify-center"><AchievementBadge domain={sticker.domain} tier={sticker.tier} earned={isEarned} size="lg" showName={false} /></div>
        ) : (
          <img src={sticker.icon} alt={sticker.name} draggable={false}
            className="w-32 h-32 object-contain mx-auto"
            style={{ filter: isEarned ? 'drop-shadow(0 2px 0 rgba(0,0,0,0.2))' : 'brightness(0) opacity(0.3)' }} />
        )}
        <h3 className="text-2xl font-black mt-2" style={{ color: accentColor }}>
          {isEarned ? sticker.name : 'Locked'}
        </h3>
        <p className="text-sm mt-2 font-medium" style={{ color: 'var(--jma-dark)' }}>
          {isEarned ? `Earned on ${new Date(earned.earnedAt).toLocaleDateString()}` : sticker.hint}
        </p>

        {/* Achievement-only: teacher description (always shown when
            teacher view is on — sourced per-domain, not per-tier, so it
            never leaks tier-specific info) OR kid-facing earn instruction
            (gated by prerequisite tier). */}
        {isAchievement && teacherView && domain && (
          <div
            data-testid="badge-teacher-desc"
            className="mt-4 rounded-2xl border-2 p-3 text-left"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: '#F5F7FB',
            }}
          >
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1" style={{ color: 'var(--jma-dark)' }}>
              Skill demonstrated
            </div>
            <div className="text-xs md:text-sm font-medium leading-snug" style={{ color: 'var(--jma-dark)' }}>
              {domain.teacherDescription}
            </div>
          </div>
        )}
        {isAchievement && !teacherView && showKidEarnLine && mission && (
          <div
            data-testid="badge-earn-line"
            className="mt-4 rounded-2xl border-2 p-3 text-left"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: '#FFF8D6',
            }}
          >
            <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1" style={{ color: 'var(--jma-dark)' }}>
              {isEarned ? 'Earned by' : 'How to earn'}
            </div>
            <div className="text-xs md:text-sm font-bold leading-snug" style={{ color: 'var(--jma-dark)' }}>
              {mission.instruction}
            </div>
            {!isEarned && onNavigate && (
              <button
                data-testid="badge-try-now"
                onClick={() => { onNavigate(mission.route); onClose(); }}
                className="chunky-btn mt-2 px-3 py-1.5 text-xs font-black touch-manipulation"
                style={{
                  backgroundColor: sticker.color || 'var(--jma-yellow, #FFCC00)',
                  color: 'white',
                  borderColor: 'var(--jma-dark)',
                }}
              >
                Try this now →
              </button>
            )}
          </div>
        )}
      </motion.div>
      </FitBox>
    </motion.div>,
    document.body
  );
}

// Round collection-sticker tile (kept from the original design).
function CollectionStickerCard({ sticker, earned, onOpen, index = 0 }) {
  const isEarned = !!earned;
  const tilt = isEarned ? [-4, 3, -2, 4, -3][index % 5] : 0;
  return (
    <motion.button
      data-testid={`sticker-${sticker.id}`}
      onClick={() => onOpen(sticker)}
      whileHover={{ scale: 1.08, rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center rounded-2xl p-2 md:p-3 cursor-pointer"
      style={{
        rotate: tilt,
        border: isEarned ? '4px solid white' : '3px dashed rgba(255,255,255,0.22)',
        background: isEarned ? `radial-gradient(circle at 40% 30%, white 0%, ${sticker.color}33 100%)` : 'rgba(255,255,255,0.06)',
        boxShadow: isEarned ? `0 5px 0 0 ${sticker.color}, 0 0 14px ${sticker.color}66` : 'none',
      }}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
        <img
          src={sticker.icon}
          alt={sticker.name}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none"
          style={{ filter: isEarned ? 'drop-shadow(0 2px 0 rgba(0,0,0,0.2))' : 'brightness(0) invert(1) opacity(0.3)' }}
        />
      </div>
      <span
        className="text-[10px] md:text-xs font-black text-center mt-1 leading-tight"
        style={{ color: isEarned ? 'var(--jma-dark)' : 'rgba(255,255,255,0.5)' }}
      >
        {isEarned ? sticker.name : '?'}
      </span>
      {isEarned && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-300 rounded-full w-6 h-6 flex items-center justify-center border-2 border-[var(--jma-dark)] shadow-md"
          initial={{ rotate: -15, scale: 0.8 }}
          animate={{ rotate: [-15, 15, -15], scale: 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="w-3 h-3 text-[var(--jma-dark)]" />
        </motion.div>
      )}
    </motion.button>
  );
}

export default function StickerBookPage() {
  const navigate = useNavigate();
  const { earned, achievementCount, collectionCount } = useStickers();
  const [openSticker, setOpenSticker] = useState(null);
  const [printReportOpen, setPrintReportOpen] = useState(() => window.location.hash.includes('print=1'));
  const [manageDataOpen, setManageDataOpen] = useState(false);
  const [howRanksOpen, setHowRanksOpen] = useState(false);
  // Teacher View — when on, the achievement section swaps kid blurbs for
  // standards-aligned skill descriptions. Persisted so a teacher demo'ing the
  // app to a principal can leave it on between visits.
  const [teacherView, setTeacherView] = useState(() => {
    try { return localStorage.getItem(TEACHER_VIEW_KEY) === '1'; } catch { return false; }
  });
  const toggleTeacherView = () => {
    setTeacherView((v) => {
      const next = !v;
      try { localStorage.setItem(TEACHER_VIEW_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  const totalAchievements = 18;
  const totalCollection = COLLECTION_STICKERS.length;

  // Group collection stickers by category (achievements live in their own section)
  const collectionByCategory = useMemo(() => {
    const map = {};
    STICKER_CATEGORIES.filter(c => c.kind === 'collection').forEach(c => { map[c.id] = []; });
    for (const s of COLLECTION_STICKERS) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    return map;
  }, []);

  const handleStickerClick = (s) => setOpenSticker(s);

  return (
    <div className="min-h-screen flex flex-col relative" data-testid="sticker-book-page"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #2F6A8A 0%, #163A55 45%, #0B2238 100%)' }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none shack-pegboard" />
      <div className="fixed top-0 left-0 right-0 backdrop-blur-md border-b-4 border-[var(--jma-dark)] px-4 py-2 flex items-center gap-3 z-40" style={{ background: 'rgba(10,37,64,0.92)' }}>
        <button data-testid="sticker-home-btn" onClick={() => navigate('/')}
          aria-label="Home"
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0">
          <div
            className="rounded-2xl border-3 border-white/70 shadow-[0_3px_0_0_rgba(255,255,255,0.5)] group-hover:shadow-[0_5px_0_0_rgba(255,255,255,0.5)] transition-shadow p-1"
            style={{ backgroundColor: 'var(--jma-dark)' }}
          >
            <HarpIcon size={34} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wide mt-0.5 px-1.5 rounded-full"
            style={{ color: 'white', backgroundColor: 'var(--jma-dark)' }}>
            Home
          </span>
        </button>
        <h1 className="text-xl md:text-2xl font-black font-display flex-1 text-center" style={{ color: '#FFCC00', textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}>
          Sticker Shack
        </h1>
        <div className="text-xs md:text-sm font-bold whitespace-nowrap text-right leading-tight mr-10 md:mr-12 text-white">
          <div>🏅 {achievementCount}/{totalAchievements}</div>
          <div>🎁 {collectionCount}/{totalCollection}</div>
        </div>
      </div>


      <main className="relative flex-1 pt-20 pb-10 px-3 md:px-6 max-w-6xl mx-auto w-full">
          {/* Rank badge with progress meter inside it, plus a compact
              "How ranks work?" affordance. Passive help — not a
              notification, so no bounce or red dot. */}
        <div className="flex justify-center items-end gap-3 mt-4 mb-6">
          <RankBadge showProgress clickable={false} />
          <button
            data-testid="open-how-ranks"
            onClick={() => setHowRanksOpen(true)}
            aria-label="How ranks work"
            className="chunky-btn flex flex-col items-center justify-center px-3 py-2 md:px-4 md:py-2.5 touch-manipulation flex-shrink-0"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--jma-dark)',
              color: 'var(--jma-dark)',
            }}
          >
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider leading-none opacity-70">Ranks</span>
            <span className="text-sm md:text-base font-black font-display leading-none mt-0.5">HOW?</span>
          </button>
        </div>

        <HowRanksWorkModal open={howRanksOpen} onClose={() => setHowRanksOpen(false)} teacherView={teacherView} />

        {/* ============ ACHIEVEMENT BADGES (top — the rank-driving section) ============ */}
        <section className="mb-10" data-testid="category-achievements">
          <div className="flex items-center justify-between gap-2 mb-3 px-1">
            <h2 className="shack-sign text-base md:text-lg font-black font-display">
              <Trophy className="w-5 h-5" />
              Achievement Medals
              <span className="text-xs font-bold opacity-70">({achievementCount}/{totalAchievements})</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                data-testid="open-dressing-room"
                onClick={() => navigate('/dressing-room')}
                className="chunky-btn px-2 py-1 flex items-center gap-1 text-[10px] md:text-xs font-bold touch-manipulation"
                style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)' }}
                title="Dressing Room"
              >
                <Shirt className="w-3.5 h-3.5" /> Dressing Room
              </button>
              {/* Teacher View toggle — swaps kid blurbs for standards-aligned descriptions */}
              <button
                data-testid="teacher-view-toggle"
                onClick={toggleTeacherView}
                className="chunky-btn px-2 py-1 flex items-center gap-1 text-[10px] md:text-xs font-bold touch-manipulation"
                style={{
                  backgroundColor: teacherView ? '#4285F4' : 'white',
                  color: teacherView ? 'white' : 'var(--jma-dark)',
                  borderColor: 'var(--jma-dark)',
                }}
                aria-pressed={teacherView}
                title="Toggle teacher view"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {teacherView ? 'Kid View' : 'Teacher View'}
              </button>
              {/* Print Report — only shows when Teacher View is on. Opens a
                  one-page printable summary with rank, streaks, play time and
                  per-domain skill demonstrations. */}
              {teacherView && (
                <>
                  <button
                    data-testid="open-print-report"
                    onClick={() => setPrintReportOpen(true)}
                    className="chunky-btn px-2 py-1 flex items-center gap-1 text-[10px] md:text-xs font-bold touch-manipulation"
                    style={{
                      backgroundColor: 'var(--jma-green)',
                      color: 'white',
                      borderColor: 'var(--jma-dark)',
                    }}
                    title="Print student progress report"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Report
                  </button>
                  {/* Manage Data — gear icon for the destructive actions
                      (Backup / Restore / Reset). Only visible in Teacher View
                      so kids don't see it during normal play. */}
                  <button
                    data-testid="open-manage-data"
                    onClick={() => setManageDataOpen(true)}
                    className="chunky-btn flex items-center justify-center w-8 h-8 touch-manipulation"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--jma-dark)',
                      borderColor: 'var(--jma-dark)',
                    }}
                    title="Manage progress data (backup · restore · reset)"
                    aria-label="Manage progress data"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* One row per domain, three badges across (Cadet · Pro · Master) */}
          <div className="rounded-2xl border-3 border-[var(--jma-dark)] divide-y-2 divide-white/10 overflow-hidden text-white" style={{ background: 'linear-gradient(180deg, rgba(30,58,82,0.92) 0%, rgba(16,36,56,0.95) 100%)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.1), 0 6px 0 0 var(--jma-dark)' }}>
            {ACHIEVEMENT_DOMAINS.map((dom) => (
              <div key={dom.id} className="flex items-start gap-2 md:gap-4 p-2.5 md:p-4" data-testid={`domain-row-${dom.id}`}>
                {/* Domain label column — width grows in teacher view so the
                    longer skill description has somewhere to live. */}
                <div className={`flex-shrink-0 ${teacherView ? 'w-[180px] md:w-[260px]' : 'w-[110px] md:w-[150px]'} transition-all`}>
                  <div className="flex items-start gap-2">
                    <div
                      className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex-shrink-0 mt-0.5"
                      style={{ borderColor: dom.color, backgroundColor: `${dom.color}33`, overflow: 'hidden' }}
                    >
                      <img src={dom.icon} alt={dom.label} className="w-full h-full object-contain" draggable={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs md:text-sm font-black font-display leading-tight text-white">{dom.label}</div>
                      {teacherView ? (
                        <div
                          data-testid={`domain-teacher-desc-${dom.id}`}
                          className="text-[10px] md:text-[11px] opacity-80 leading-tight mt-0.5 text-white"
                        >
                          {dom.teacherDescription}
                        </div>
                      ) : (
                        <div
                          data-testid={`domain-blurb-${dom.id}`}
                          className="text-[9px] md:text-[10px] opacity-60 leading-tight text-white"
                        >
                          {dom.blurb}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Three tier badges */}
                <div className="flex-1 flex justify-around gap-1 md:gap-2 items-center min-h-[60px]">
                  {ACHIEVEMENT_TIERS.map((t) => {
                    const sticker = STICKER_MAP[achievementId(dom.id, t.id)];
                    const isEarned = !!earned[sticker.id];
                    return (
                      <AchievementBadge
                        key={t.id}
                        domain={dom.id}
                        tier={t.id}
                        earned={isEarned}
                        size="sm"
                        showName={false}
                        onClick={() => handleStickerClick(sticker)}
                        testId={`badge-${sticker.id}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ COLLECTION SECTIONS ============ */}
        {STICKER_CATEGORIES.filter(c => c.kind === 'collection').map(cat => {
          const stickers = collectionByCategory[cat.id] || [];
          const earnedHere = stickers.filter(s => earned[s.id]).length;
          return (
            <section key={cat.id} className="mb-8" data-testid={`category-${cat.id}`}>
              <h2 className="shack-sign text-base md:text-lg font-black font-display mb-3">
                {cat.label}
                <span className="text-xs font-bold opacity-70">({earnedHere}/{stickers.length})</span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.22)', border: '3px solid rgba(0,0,0,0.35)', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.35)' }}>
                {stickers.map((s, i) => (
                  <CollectionStickerCard
                    key={s.id}
                    sticker={s}
                    earned={earned[s.id]}
                    onOpen={handleStickerClick}
                    index={i}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {/* End-of-page padding — destructive actions (reset/backup/restore)
            now live behind the gear icon in Teacher View so kids don't see them. */}
        <div className="mt-8 mb-2" />
      </main>

      <AnimatePresence>
        {openSticker && (
          <StickerDetailModal
            sticker={openSticker}
            earned={earned[openSticker.id]}
            allEarned={earned}
            teacherView={teacherView}
            onClose={() => setOpenSticker(null)}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* Print-report modal — opens via the Teacher-View Print button */}
      <PrintReport open={printReportOpen} onClose={() => setPrintReportOpen(false)} />
      {/* Manage Data modal — gear icon in Teacher View, holds the 3 destructive actions */}
      <ManageDataModal open={manageDataOpen} onClose={() => setManageDataOpen(false)} />
    </div>
  );
}
