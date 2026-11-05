// "Tricky one?" nudge shown after a lost round — opens the Music 101 lesson that teaches that skill.
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { getLesson } from '../data/lessons';

export default function LessonHelper({ lesson, className = '', floating = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const l = getLesson(lesson);
  if (!l) return null;
  return (
    <button
      type="button"
      data-testid="lesson-helper"
      onClick={() => navigate(`/lessons/${l.num}`, { state: { helper: true, from: pathname } })}
      className={`lesson-helper ${floating ? 'lesson-helper-floating fixed z-[60]' : 'mx-auto'} flex items-center gap-2 rounded-2xl px-3 py-2 text-left transition-transform hover:scale-[1.03] active:scale-95 ${className}`}
      style={{ background: '#FFF9E6', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', maxWidth: 340 }}
    >
      <PlayCircle className="w-7 h-7 flex-shrink-0" style={{ color: '#FF2D85' }} strokeWidth={2.5} />
      <span className="leading-tight">
        <span className="block text-xs md:text-sm font-black">Tricky one? {l.title} can help!</span>
        <span className="block text-[11px] md:text-xs font-bold opacity-70">Watch “{l.subtitle}” in Music 101</span>
      </span>
    </button>
  );
}
