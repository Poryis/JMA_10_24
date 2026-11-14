// Injected helpers for DJ Turntable playwright tests (reads React refs via fiber)
window.__djRefs = () => {
  const el = document.querySelector('[data-testid=dj-turntable-playing]');
  if (!el) return null;
  const k = Object.keys(el).find((x) => x.startsWith('__reactFiber'));
  let f = el[k];
  while (f && !(f.type && f.type.name === 'DjTurntablePage')) f = f.return;
  if (!f) return null;
  let h = f.memoizedState; const refs = [];
  while (h) { const s = h.memoizedState; if (s && typeof s === 'object' && 'current' in s && Object.keys(s).length === 1) refs.push(s.current); h = h.next; }
  return {
    pat: refs.find((x) => Array.isArray(x) && typeof x[0] === 'string'),
    exp: refs.filter((x) => Array.isArray(x) && (x.length === 0 || typeof x[0] === 'number')).slice(-1)[0],
    start: refs.find((x) => typeof x === 'number' && x > 1e12),
    claimed: refs.find((x) => x instanceof Set),
  };
};
window.__nextNoteDelay = (minAhead = 250) => {
  const r = window.__djRefs(); if (!r || !r.pat) return -1;
  const now = Date.now() - r.start;
  for (let i = 0; i < r.pat.length; i++) {
    if (r.pat[i] === 'rest' || r.claimed.has(i)) continue;
    if (r.exp[i] > now + minAhead) return r.exp[i] - now;
  }
  return -1;
};
// Auto-player: mode 'all' = perfect-tap every note, 'none' = no taps, 'half' = tap every other note
window.__djAuto = { mode: 'none', lastStart: 0, timers: [], taps: 0 };
window.__djTick = () => {
  const A = window.__djAuto; const r = window.__djRefs();
  if (r && r.start && r.start !== A.lastStart && r.pat && r.exp && r.exp.length) {
    A.lastStart = r.start; A.timers.forEach(clearTimeout); A.timers = [];
    if (A.mode !== 'none') {
      let n = 0;
      r.pat.forEach((k, i) => {
        if (k === 'rest') return;
        n++;
        if (A.mode === 'half' && n % 2 === 0) return;
        const at = r.start + r.exp[i] - Date.now();
        A.timers.push(setTimeout(() => {
          A.taps++;
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
        }, Math.max(0, at)));
      });
    }
  }
};
setInterval(() => { try { window.__djTick(); } catch (e) { /* ignore */ } }, 50);
// Phase/round log
window.__djLog = [];
setInterval(() => {
  const p = document.querySelector('[data-testid=dj-turntable-phase]');
  const c = document.querySelector('[data-testid=dj-turntable-complete]');
  const s = c ? 'COMPLETE' : (p ? p.textContent : 'none');
  const L = window.__djLog;
  if (!L.length || L[L.length - 1].s !== s) L.push({ s, t: Date.now() });
}, 100);
// Sparkle + wing/drum counters
window.__djFx = { sparkles: new Set(), wingPress: 0, drumOn: 0 };
new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === 'attributes' && m.attributeName === 'src' && m.target.src && m.target.src.includes('wing-left-press')) window.__djFx.wingPress++;
    for (const n of m.addedNodes || []) {
      if (n.nodeType !== 1) continue;
      const sp = n.matches?.('[data-testid^=dj-turntable-sparkle-]') ? [n] : [...n.querySelectorAll('[data-testid^=dj-turntable-sparkle-]')];
      sp.forEach((e) => window.__djFx.sparkles.add(e.getAttribute('data-testid')));
      const imgs = n.tagName === 'IMG' ? [n] : [...n.querySelectorAll('img')];
      imgs.forEach((i) => { if ((i.getAttribute('src') || '').includes('drum-machine-on')) window.__djFx.drumOn++; });
    }
  }
}).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
