// useDailyQuests — localStorage-backed "Today at the Academy" state.
//
// Games call `reportQuestEvent(event, payload)` from the same spots where
// they already award stickers. The hook re-renders consumers (home card,
// celebration overlay) whenever progress changes.

import { useEffect, useState, useCallback } from 'react';
import { QUEST_MAP, TOUR_QUESTS, GEM_MILESTONES, pickDailyQuests, questMatches } from '../data/dailyQuests';
import { earnSticker, readEarnedStickers } from './useStickers';
import { readUnlockedSync } from './useUnlocks';
import { AVATAR_KEY } from '../data/avatars';

export const QUESTS_KEY = 'jma_daily_quests_v1';   // { date, ids, progress, completedAt, celebrated, gem }
export const QUEST_DAYS_KEY = 'jma_quest_days_v1'; // { total, lastDate }
export const TOUR_KEY = 'jma_tour_v1';             // { done: {id: true}, completedAt, seen }

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
}
function writeJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

const listeners = new Set();
function notify() { listeners.forEach(fn => { try { fn(); } catch (_) {} }); }

// Returns today's quest state, building a fresh set when the date rolls over.
export function ensureToday() {
  const today = todayKey();
  const cur = readJson(QUESTS_KEY, null);
  if (cur && cur.date === today && Array.isArray(cur.ids) && cur.ids.every(id => QUEST_MAP[id])) return cur;
  const earnedSet = new Set(Object.keys(readEarnedStickers()));
  const next = {
    date: today,
    ids: pickDailyQuests(today, earnedSet, !readUnlockedSync()),
    progress: {},
    completedAt: null,
    celebrated: false,
    gem: null,
  };
  writeJson(QUESTS_KEY, next);
  return next;
}

// The one-time Academy Tour. Kids who already picked a character / earned a
// sticker before the tour existed get those steps credited automatically.
export function readTour() {
  const t = readJson(TOUR_KEY, null);
  if (t) return t;
  const done = {};
  try { if (localStorage.getItem(AVATAR_KEY)) done.t_character = true; } catch (_) {}
  if (Object.keys(readEarnedStickers()).length > 0) done.t_first_game = true;
  const all = TOUR_QUESTS.every(q => done[q.id]);
  const next = { done, completedAt: all ? new Date().toISOString() : null, seen: all };
  writeJson(TOUR_KEY, next);
  return next;
}
export function tourActive() { const t = readTour(); return !t.completedAt || !t.seen; }
export function markTourSeen() { const t = readTour(); if (t.seen) return; t.seen = true; writeJson(TOUR_KEY, t); notify(); }

function reportTourEvent(event) {
  const t = readTour();
  if (t.completedAt) return;
  let changed = false;
  for (const q of TOUR_QUESTS) { if (q.event === event && !t.done[q.id]) { t.done[q.id] = true; changed = true; } }
  if (!changed) return;
  if (TOUR_QUESTS.every(q => t.done[q.id])) t.completedAt = new Date().toISOString();
  writeJson(TOUR_KEY, t);
  notify();
}

export function readQuestDays() {
  return readJson(QUEST_DAYS_KEY, { total: 0, lastDate: null });
}

export function reportQuestEvent(event, payload = {}) {
  reportTourEvent(event);
  const st = ensureToday();
  let changed = false;
  for (const id of st.ids) {
    const q = QUEST_MAP[id];
    if (!q || q.event !== event || !questMatches(q, payload)) continue;
    const target = q.target || 1;
    const cur = st.progress[id] || 0;
    if (cur >= target) continue;
    st.progress[id] = target > 1 ? cur + 1 : target;
    changed = true;
  }
  if (!changed) return;
  const allDone = st.ids.every(id => (st.progress[id] || 0) >= (QUEST_MAP[id].target || 1));
  if (allDone && !st.completedAt) {
    st.completedAt = new Date().toISOString();
    const days = readQuestDays();
    if (days.lastDate !== st.date) {
      days.total = (days.total || 0) + 1;
      days.lastDate = st.date;
      writeJson(QUEST_DAYS_KEY, days);
    }
    const gemId = GEM_MILESTONES[days.total];
    if (gemId && earnSticker(gemId)) st.gem = gemId;
  }
  writeJson(QUESTS_KEY, st);
  notify();
}

export function markQuestCelebrated() {
  const st = ensureToday();
  if (st.celebrated) return;
  st.celebrated = true;
  writeJson(QUESTS_KEY, st);
  notify();
}

function buildView(st) {
  const tour = readTour();
  if (!tour.completedAt || !tour.seen) {
    const quests = TOUR_QUESTS.map(q => ({ ...q, target: 1, progress: tour.done[q.id] ? 1 : 0, done: !!tour.done[q.id] }));
    return { date: st.date, tour: true, quests, doneCount: quests.filter(q => q.done).length, allDone: false, tourDone: !!tour.completedAt, completedAt: null, celebrated: true, gem: null, questDays: readQuestDays().total || 0 };
  }
  const quests = st.ids.map(id => {
    const q = QUEST_MAP[id];
    const target = q.target || 1;
    const progress = Math.min(st.progress[id] || 0, target);
    return { ...q, target, progress, done: progress >= target };
  });
  return {
    date: st.date,
    tour: false,
    quests,
    doneCount: quests.filter(q => q.done).length,
    allDone: quests.length > 0 && quests.every(q => q.done),
    completedAt: st.completedAt,
    celebrated: st.celebrated,
    gem: st.gem,
    questDays: readQuestDays().total || 0,
  };
}

export default function useDailyQuests() {
  const [view, setView] = useState(() => buildView(ensureToday()));
  useEffect(() => {
    const refresh = () => setView(buildView(ensureToday()));
    listeners.add(refresh);
    // Catch a midnight rollover while the tab stays open.
    const t = setInterval(refresh, 60 * 1000);
    return () => { listeners.delete(refresh); clearInterval(t); };
  }, []);
  const dismissCelebration = useCallback(() => markQuestCelebrated(), []);
  const finishTour = useCallback(() => markTourSeen(), []);
  return { ...view, dismissCelebration, finishTour };
}
