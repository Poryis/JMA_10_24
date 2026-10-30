// DailyQuestCard — "Today at the Academy" home-screen hero.
// Three bite-sized quests, each deep-linking into a game. Replaces the old
// Next Mission pill as the single "do this now" signal.

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronDown, ChevronUp, Gem } from 'lucide-react';
import useDailyQuests from '../hooks/useDailyQuests';
import { DOMAIN_MAP } from '../data/achievements';
import { STICKER_MAP } from '../data/stickers';
import { say } from '../lib/voice';
import { questVoiceId } from '../data/voiceLines';
import { brand } from '../lib/brand';

const WEEKDAY = new Date().toLocaleDateString(undefined, { weekday: 'long' });
const SEEN_KEY = 'jma_quest_seen_done_v1'; // { date, done } — last doneCount the kid saw

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

// Starts collapsed everywhere; pops open when a quest was just finished.
function shouldAutoExpand(date, doneCount) {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY));
    return !!seen && seen.date === date && doneCount > seen.done && doneCount < 3;
  } catch (_) { return false; }
}
function rememberSeen(date, done) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify({ date, done })); } catch (_) {}
}

function CompactQuestStrip({ quests, doneCount, allDone, onExpand }) {
  return (
    <motion.button
      type="button"
      data-testid="daily-quest-strip"
      data-all-done={allDone ? 'true' : 'false'}
      onClick={onExpand}
      className="w-full flex items-center gap-2 rounded-2xl px-2.5 text-left touch-manipulation"
      style={{
        height: 58,
        background: allDone
          ? 'linear-gradient(160deg, #FFF4C2 0%, #FFE07A 100%)'
          : 'linear-gradient(180deg, #FFFDF6 0%, #FFF6DD 100%)',
        border: '3px solid var(--jma-dark)',
        boxShadow: '0 4px 0 0 var(--jma-dark)',
      }}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileTap={{ y: 2, boxShadow: '0 2px 0 0 var(--jma-dark)' }}
    >
      <img src="assets/ui/sun.png" alt="" draggable={false} className="flex-shrink-0 object-contain" style={{ width: 30, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.18))' }} />
      <div className="flex flex-col leading-tight flex-1 min-w-0">
        <span className="text-[8px] uppercase tracking-[0.14em] font-black" style={{ color: '#B8860B' }}>Today at the Academy</span>
        <span className="text-[14px] font-black font-display truncate" style={{ color: 'var(--jma-dark)' }} data-testid="daily-quest-strip-heading">
          {allDone ? 'All quests done!' : `${WEEKDAY}'s Quests`}
        </span>
      </div>
      <div className="flex items-center -space-x-1.5 flex-shrink-0" data-testid="daily-quest-strip-dots">
        {quests.map((q, i) => {
          const domain = DOMAIN_MAP[q.domain];
          return (
            <div
              key={q.id}
              data-testid={`daily-quest-strip-dot-${i}`}
              data-done={q.done ? 'true' : 'false'}
              className="relative rounded-full overflow-hidden bg-white flex items-center justify-center"
              style={{ width: 30, height: 30, border: `2px solid ${q.done ? '#34A853' : domain.color}`, filter: q.done ? 'grayscale(0.4)' : 'none' }}
            >
              <img src={domain.icon} alt="" className="w-full h-full object-contain" draggable={false} />
              {q.done && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(52,168,83,0.78)' }}>
                  <Check className="w-4 h-4 text-white" strokeWidth={4} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        data-testid="daily-quest-strip-progress"
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black"
        style={{ backgroundColor: allDone ? '#34A853' : 'var(--jma-dark)', color: 'white' }}
      >
        {doneCount}/{quests.length}
      </div>
      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--jma-dark)' }} strokeWidth={3} />
    </motion.button>
  );
}

function QuestRow({ quest, index, navigate, baseDelay = 0.5 }) {
  const domain = DOMAIN_MAP[quest.domain];
  const { done, progress, target } = quest;
  return (
    <motion.button
      type="button"
      data-testid={`daily-quest-${index}`}
      data-quest-id={quest.id}
      data-done={done ? 'true' : 'false'}
      onClick={() => { if (!done) { const v = questVoiceId(quest.id); if (v) say(v); } navigate(quest.route); }}
      className="w-full flex items-center gap-2.5 md:gap-3 rounded-2xl px-2.5 md:px-3 text-left cursor-pointer touch-manipulation"
      style={{
        height: 54,
        background: done ? '#EAF9EF' : 'white',
        border: `2.5px solid ${done ? '#34A853' : 'var(--jma-dark)'}`,
        boxShadow: done ? 'none' : '0 3px 0 0 var(--jma-dark)',
        opacity: done ? 0.92 : 1,
      }}
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: baseDelay + index * 0.08, type: 'spring', stiffness: 240 }}
      whileHover={done ? {} : { y: -2 }}
      whileTap={{ y: 1, scale: 0.995 }}
    >
      <div
        className="flex-shrink-0 rounded-full overflow-hidden bg-white border-2 flex items-center justify-center"
        style={{ width: 36, height: 36, borderColor: done ? '#34A853' : domain.color, filter: done ? 'grayscale(0.5)' : 'none' }}
      >
        <img src={domain.icon} alt="" className="w-full h-full object-contain" draggable={false} />
      </div>

      <div className="flex flex-col leading-tight flex-1 min-w-0">
        <span
          className="text-[13px] md:text-[15px] font-black font-display truncate"
          style={{ color: 'var(--jma-dark)', textDecoration: done ? 'line-through' : 'none', textDecorationColor: '#34A853' }}
          data-testid={`daily-quest-title-${index}`}
        >
          {brand(quest.title)}
        </span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-wide font-black" style={{ color: done ? '#1F7A36' : domain.color }}>
          {brand(quest.where)}{target > 1 && !done ? ` · ${progress}/${target}` : ''}
        </span>
      </div>

      {done ? (
        <motion.div
          data-testid={`daily-quest-done-${index}`}
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 30, height: 30, backgroundColor: '#34A853', boxShadow: '0 2px 0 0 #1F7A36' }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3.5} />
        </motion.div>
      ) : (
        <div
          className="flex-shrink-0 flex items-center gap-0.5 text-[11px] md:text-xs font-black rounded-full pl-2.5 pr-1.5 py-1"
          style={{ backgroundColor: domain.color, color: 'white', boxShadow: '0 2px 0 0 var(--jma-dark)' }}
        >
          GO <ChevronRight className="w-3.5 h-3.5" />
        </div>
      )}
    </motion.button>
  );
}

export default function DailyQuestCard({ defaultExpanded = false }) {
  const navigate = useNavigate();
  const { date, quests, doneCount, allDone, gem, questDays } = useDailyQuests();
  const gemSticker = gem ? STICKER_MAP[gem] : null;
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(() => defaultExpanded || shouldAutoExpand(date, doneCount));

  useEffect(() => { rememberSeen(date, doneCount); }, [date, doneCount]);

  if (!expanded) {
    return (
      <CompactQuestStrip
        quests={quests}
        doneCount={doneCount}
        allDone={allDone}
        onExpand={() => setExpanded(true)}
      />
    );
  }

  return (
    <motion.section
      data-testid="daily-quest-card"
      data-all-done={allDone ? 'true' : 'false'}
      className="w-full rounded-[22px] p-2.5 md:p-3.5 relative overflow-hidden"
      style={{
        background: allDone
          ? 'linear-gradient(160deg, #FFF4C2 0%, #FFE07A 100%)'
          : 'linear-gradient(180deg, #FFFDF6 0%, #FFF6DD 100%)',
        border: '3px solid var(--jma-dark)',
        boxShadow: '0 5px 0 0 var(--jma-dark)',
      }}
      initial={{ y: 14, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: isDesktop ? 0.42 : 0, type: 'spring', stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-2.5 px-0.5">
        <motion.img
          src="assets/ui/sun.png" alt="" draggable={false}
          className="flex-shrink-0 object-contain"
          style={{ width: 'clamp(30px, 5vw, 42px)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.18))' }}
          animate={{ rotate: [0, 12, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.14em] font-black" style={{ color: '#B8860B' }}>
            Today at the Academy
          </span>
          <span className="text-base md:text-xl font-black font-display truncate" style={{ color: 'var(--jma-dark)' }} data-testid="daily-quest-heading">
            {allDone ? 'All quests done!' : `${WEEKDAY}'s Quests`}
          </span>
        </div>
        <div
          data-testid="daily-quest-progress"
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] md:text-xs font-black"
          style={{
            backgroundColor: allDone ? '#34A853' : 'var(--jma-dark)',
            color: 'white',
            boxShadow: '0 2px 0 0 rgba(0,0,0,0.25)',
          }}
        >
          {allDone ? '3 / 3 ✓' : `${doneCount} / ${quests.length}`}
        </div>
        {(
          <button
            type="button"
            data-testid="daily-quest-collapse"
            aria-label="Collapse quests"
            onClick={() => setExpanded(false)}
            className="flex-shrink-0 rounded-full flex items-center justify-center bg-white"
            style={{ width: 30, height: 30, border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}
          >
            <ChevronUp className="w-4 h-4" style={{ color: 'var(--jma-dark)' }} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Quests */}
      <div className="flex flex-col gap-2">
        {quests.map((q, i) => <QuestRow key={q.id} quest={q} index={i} navigate={navigate} baseDelay={isDesktop ? 0.5 : 0.05} />)}
      </div>

      {/* Footer */}
      {allDone ? (
        <div className="mt-2.5 flex items-center gap-2 px-1" data-testid="daily-quest-done-footer">
          {gemSticker
            ? <img src={gemSticker.icon} alt="" className="w-7 h-7 object-contain" draggable={false} />
            : <Gem className="w-5 h-5" style={{ color: '#B8860B' }} />}
          <span className="text-[11px] md:text-sm font-black" style={{ color: 'var(--jma-dark)' }}>
            {gemSticker ? `${gemSticker.name} earned! ` : ''}New quests tomorrow — free play till then!
          </span>
        </div>
      ) : questDays > 0 ? (
        <div className="mt-2 flex items-center gap-1.5 px-1" data-testid="daily-quest-days">
          <Gem className="w-3.5 h-3.5" style={{ color: '#B8860B' }} />
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wide" style={{ color: 'var(--jma-dark)', opacity: 0.7 }}>
            {questDays} quest {questDays === 1 ? 'day' : 'days'} completed
          </span>
        </div>
      ) : null}
    </motion.section>
  );
}
