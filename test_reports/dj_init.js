(() => {
  try { localStorage.setItem('jma_player_name_skipped_v1','1'); } catch(e){}
  window.__srcStarts = [];
  const orig = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function(...a){ window.__srcStarts.push(Math.round(performance.now())); return orig.apply(this,a); };
  window.__taps = [];
  window.__autoTap = true;
  window.__phaseLog = [];
  let last = '';
  const obs = new MutationObserver(() => {
    const b = document.querySelector('[data-testid="dj-turntable-phase"]');
    if (!b) { last = ''; return; }
    const txt = b.textContent;
    if (txt === last) return;
    last = txt;
    window.__phaseLog.push([txt, Math.round(performance.now())]);
    if (txt.startsWith('Get ready') && window.__autoTap) {
      const blocks = [...document.querySelectorAll('[data-testid^="dj-turntable-block-"]')].filter(el => !el.dataset.testid.includes('barline'));
      const ws = blocks.map(el => parseFloat(el.style.width));
      const total = window.__totalBeats || 4;
      let acc = 0;
      blocks.forEach((el, i) => {
        const beats = ws[i] / 100 * total;
        const isRest = el.querySelector('img')?.alt === 'rest';
        const start = acc; acc += beats;
        if (isRest) return;
        setTimeout(() => {
          const tgt = document.querySelector('[data-testid="dj-turntable-tap-target"]');
          tgt && tgt.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true}));
          window.__taps.push(Math.round(performance.now()));
        }, 3000 + start * 750 + (window.__tapOffset || 0));
      });
    }
  });
  document.addEventListener('DOMContentLoaded', () => obs.observe(document.body, {subtree: true, childList: true, characterData: true}));
})();
