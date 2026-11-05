// Lesson Helper comeback reward: tap the helper, watch the lesson, then win that game → that lesson's comeback sticker.
import { earnSticker } from '../hooks/useStickers';

const KEY = 'jma_lesson_helper_v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const write = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch { /* ignore */ } };
const currentPath = () => window.location.hash.replace(/^#/, '').split('?')[0] || '/';

export function noteHelperOpened(lesson, from) { write({ lesson, from, watched: false }); }

export function noteLessonWatched(lesson) {
  const p = read();
  if (p && p.lesson === lesson) write({ ...p, watched: true });
}

export function reportGameWin() {
  const p = read();
  if (!p || !p.watched || p.from !== currentPath()) return;
  write(null);
  earnSticker(`comeback_${p.lesson}`);
}
