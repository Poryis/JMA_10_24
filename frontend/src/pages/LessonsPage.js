// Chalkboard-themed lessons hub. Charlie introduces 7 Vimeo lessons.
// Each lesson tile is locked until the previous one is watched.
// Tapping an unlocked tile → /lessons/:num where the Vimeo player lives.
//
// Layout: centered column of lesson cards over the underwater lecture hall (Music101Scene).

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useVoiceTagline from '../hooks/useVoiceTagline';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { LESSONS } from '../data/lessons';
import { useLessonsProgress } from '../hooks/useLessonsProgress';
import Music101Scene from '../components/Music101Scene';

function LessonCard({ lesson, index, locked, watched, onPlay }) {
  return (
    <motion.button
      type="button"
      data-testid={`lesson-${lesson.num}`}
      disabled={locked}
      onClick={() => !locked && onPlay(lesson.num)}
      className={`relative w-full rounded-3xl border-4 flex items-center gap-4 md:gap-5 text-left ${
        locked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        borderColor: 'var(--jma-dark)',
        backgroundColor: locked ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.98)',
        boxShadow: locked ? '0 5px 0 0 rgba(0,0,0,0.45)' : '0 9px 0 0 var(--jma-dark)',
        filter: locked ? 'grayscale(0.55)' : 'none',
        padding: 'clamp(12px, 2vw, 20px)',
      }}
      initial={{ y: 30, opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={{ y: 0, opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.06, type: 'spring', stiffness: 200 }}
      whileHover={!locked ? { y: -3, boxShadow: '0 12px 0 0 var(--jma-dark)' } : {}}
      whileTap={!locked ? { y: 2, boxShadow: '0 4px 0 0 var(--jma-dark)' } : {}}
    >
      {/* Big lesson number badge on the left */}
      <div
        className="flex-shrink-0 rounded-2xl border-4 flex items-center justify-center"
        style={{
          width: 'clamp(52px, 7.5vw, 76px)',
          height: 'clamp(52px, 7.5vw, 76px)',
          backgroundColor: locked ? '#9CA3AF' : '#34A853',
          borderColor: 'var(--jma-dark)',
          boxShadow: '0 4px 0 0 var(--jma-dark)',
        }}
      >
        <span
          className="font-black font-display leading-none"
          style={{
            fontSize: 'clamp(26px, 3.8vw, 40px)',
            color: 'white',
          }}
        >
          {lesson.num}
        </span>
      </div>

      {/* Title column — the lesson's actual name, all caps NES style. */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-1"
          style={{ color: locked ? '#6B7280' : 'var(--jma-orange)' }}
        >
          {locked ? 'Locked' : `Lesson ${lesson.num}`}
        </p>
        <h3
          className="font-black font-display leading-[0.9] uppercase"
          style={{
            fontSize: 'clamp(18px, 3vw, 30px)',
            color: 'var(--jma-dark)',
            letterSpacing: '0.01em',
            wordBreak: 'break-word',
          }}
        >
          {lesson.subtitle}
        </h3>
      </div>

      {/* Status badge on the right */}
      <div className="flex-shrink-0 mr-1">
        {watched ? (
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center"
            style={{ backgroundColor: '#34A853', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-watched`}
          >
            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
        ) : locked ? (
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center"
            style={{ backgroundColor: '#6B7280', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-locked`}
          >
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        ) : (
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center"
            style={{ backgroundColor: '#FFCC00', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-unlocked`}
          >
            <PlayCircle className="w-6 h-6 md:w-7 md:h-7" style={{ color: 'var(--jma-dark)' }} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function LessonsPage() {
  useVoiceTagline('charlie.tag.music101');
  const navigate = useNavigate();
  const { isUnlocked, isWatched, watched } = useLessonsProgress();
  const total = LESSONS.length;
  const watchedCount = watched.length;

  const next = LESSONS.find((l) => isUnlocked(l.num) && !isWatched(l.num)) || null;

  return (
    <div data-testid="lessons-page" className="min-h-screen relative overflow-x-hidden" style={{ background: '#02243F' }}>
      <Music101Scene next={next} onNext={(num) => navigate(`/lessons/${num}`)} />
      <GameHeader showHomeButton={true} />

      {/* ─── Content column ─────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 min-h-screen pointer-events-none">
        <div className="w-full flex flex-col items-center pointer-events-auto" style={{ maxWidth: '620px' }}>
          <motion.div
            className="text-center mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1
              className="text-5xl md:text-7xl font-black font-display leading-none uppercase"
              style={{
                color: 'white',
                WebkitTextStroke: 'clamp(3px, 0.5vw, 5px) var(--jma-dark)',
                paintOrder: 'stroke fill',
                textShadow:
                  '4px 4px 0 var(--jma-dark), 7px 7px 0 #0B6E8A, 10px 10px 22px rgba(0,0,0,0.5)',
              }}
            >
              Music 101
            </h1>
            <p
              className="mt-2 text-sm md:text-base font-black uppercase tracking-widest inline-block px-3 py-1 rounded-full"
              style={{
                color: 'white',
                backgroundColor: 'var(--jma-dark)',
                border: '2px solid #FFCC00',
                boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)',
              }}
            >
              Watch each lesson to unlock the next
            </p>
          </motion.div>

          {/* Progress pill */}
          <motion.div
            data-testid="lessons-progress"
            className="mb-5 px-4 py-2 rounded-full border-3 flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.96)',
              borderColor: 'var(--jma-dark)',
              boxShadow: '0 4px 0 0 var(--jma-dark)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: '#34A853' }} />
            <span className="text-sm md:text-base font-black" style={{ color: 'var(--jma-dark)' }}>
              {watchedCount} / {total} watched
            </span>
          </motion.div>

          {/* Vertical column of lesson cards */}
          <div className="w-full flex flex-col gap-3 md:gap-4">
            {LESSONS.map((lesson, i) => (
              <LessonCard
                key={lesson.num}
                lesson={lesson}
                index={i}
                locked={!isUnlocked(lesson.num)}
                watched={isWatched(lesson.num)}
                onPlay={(num) => navigate(`/lessons/${num}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
