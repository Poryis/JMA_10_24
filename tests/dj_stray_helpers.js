// iteration_84: stray-tap regression helpers (inject AFTER dj_helpers.js)
// __djAllRefs(): ordered list of all useRef values in DjTurntablePage
window.__djAllRefs = () => {
  const el = document.querySelector('[data-testid=dj-turntable-playing]');
  if (!el) return null;
  const k = Object.keys(el).find((x) => x.startsWith('__reactFiber'));
  let f = el[k];
  while (f && !(f.type && f.type.name === 'DjTurntablePage')) f = f.return;
  if (!f) return null;
  let h = f.memoizedState; const refs = [];
  while (h) { const s = h.memoizedState; if (s && typeof s === 'object' && 'current' in s && Object.keys(s).length === 1) refs.push(s.current); h = h.next; }
  return refs;
};
// strayCountRef = the ref right after roundEndedRef (the only boolean ref)
window.__djStrayCount = () => {
  const refs = window.__djAllRefs(); if (!refs) return null;
  const bi = refs.findIndex((x) => typeof x === 'boolean');
  return bi >= 0 ? refs[bi + 1] : null;
};
// tapResultsRef = plain object after the claimed Set
window.__djTapResults = () => {
  const refs = window.__djAllRefs(); if (!refs) return null;
  const si = refs.findIndex((x) => x instanceof Set);
  return si >= 0 ? JSON.parse(JSON.stringify(refs[si + 1])) : null;
};
// One stray Space per round. mode: 'countin' (start+2250ms) | 'mid23' (midpoint of playable note 2 & 3)
window.__djStray = { mode: null, lastStart: 0, rounds: [] };
setInterval(() => {
  const S = window.__djStray; if (!S.mode) return;
  const r = window.__djRefs();
  if (!r || !r.start || r.start === S.lastStart || !r.pat || !r.exp || !r.exp.length) return;
  S.lastStart = r.start;
  const playable = r.pat.map((p, i) => (p === 'rest' ? null : i)).filter((x) => x !== null);
  let at;
  if (S.mode === 'countin') at = 2250;
  else at = (r.exp[playable[1]] + r.exp[playable[2]]) / 2;
  const rec = { start: r.start, pat: r.pat.slice(), exp: r.exp.slice(), strayAt: at, playable: playable.length };
  S.rounds.push(rec);
  setTimeout(() => {
    rec.firedAt = Date.now() - r.start;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
  }, Math.max(0, r.start + at - Date.now()));
}, 20);
// Per-round snapshot on reveal: tap results + stray count + dot colors
window.__djRoundSnaps = [];
setInterval(() => {
  const p = document.querySelector('[data-testid=dj-turntable-phase]');
  if (!p || !p.textContent.includes('Run complete')) return;
  const r = window.__djRefs(); if (!r) return;
  const L = window.__djRoundSnaps;
  if (L.length && L[L.length - 1].start === r.start) return;
  const dots = [...document.querySelectorAll('[data-testid^=dj-turntable-round-dot-]')].map((d) => d.style.backgroundColor);
  L.push({ start: r.start, results: window.__djTapResults(), stray: window.__djStrayCount(), dots, playable: r.pat.filter((x) => x !== 'rest').length });
}, 100);
