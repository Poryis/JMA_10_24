// FitStage — phone-landscape "fit to screen". Games were laid out for
// portrait / desktop heights; on a short landscape viewport (< 520px tall)
// we measure the page's natural height and scale the whole stage down so
// everything is visible without scrolling. `fixed` children (headers,
// banners) stay aligned because the transformed stage is their viewport.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MIN_SCALE = 0.55;
// Pages with their own landscape layout are left alone.
const EXCLUDED = ['/', '/home', '/campus', '/fun-facts', '/rhythm-game', '/free-play', '/boom-garden', '/name-that-note'];
// Rooms that would rather be small than scroll (Robot Boogie needs dance room).
const MIN_BY_ROUTE = { '/robot-boogie': 0.4 };
const isShort = () => window.innerHeight < 520 && window.innerWidth > window.innerHeight;

export default function FitStage({ children }) {
  const location = useLocation();
  const ref = useRef(null);
  const probeRef = useRef(null); // 100vh in px — stable while the mobile URL bar shows/hides (innerHeight is not)
  const [active, setActive] = useState(isShort);
  const [scale, setScale] = useState(1);
  const sRef = useRef(1);
  const steps = useRef(0);
  const prevRef = useRef(-1);
  const lockRef = useRef(null);

  useEffect(() => {
    const f = () => { setActive(isShort()); steps.current = 0; lockRef.current = null; prevRef.current = -1; };
    window.addEventListener('resize', f); window.addEventListener('orientationchange', f);
    window.visualViewport?.addEventListener('resize', f);
    // iOS can report stale window dimensions for a moment right after a home-screen
    // launch (especially landscape) — self-correct shortly after mount instead of
    // waiting for the user to physically rotate the device to fix it.
    const t1 = setTimeout(f, 150);
    const t2 = setTimeout(f, 600);
    return () => {
      window.removeEventListener('resize', f); window.removeEventListener('orientationchange', f);
      window.visualViewport?.removeEventListener('resize', f);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, []);

  // New page → start from 1 and let the observer settle.
  useLayoutEffect(() => { sRef.current = 1; setScale(1); steps.current = 0; lockRef.current = null; prevRef.current = -1; }, [location.pathname]);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const el = ref.current;
    let raf = 0;
    const measure = () => {
      raf = 0;
      // Measure the page's own height (min-height:100% fill is lifted while measuring, so
      // the scale can grow back when content shrinks — e.g. intro after a tall game screen).
      el.classList.add('fit-measuring');
      let natural = 0;
      for (const c of el.children) {
        if (getComputedStyle(c).position === 'fixed') continue;
        natural = Math.max(natural, c.offsetTop + c.offsetHeight);
      }
      if (el.scrollHeight > el.clientHeight) natural = Math.max(natural, el.scrollHeight);
      el.classList.remove('fit-measuring');
      const floor = MIN_BY_ROUTE[location.pathname] || MIN_SCALE;
      const vh = probeRef.current?.offsetHeight || window.innerHeight;
      let target = Math.max(floor, Math.min(1, vh / Math.max(1, natural)));
      if (target > 0.97) target = 1; // dead zone: a few px of overflow isn't worth a visible jump
      if (Math.abs(target - sRef.current) <= 0.01) return;
      // ping-pong guard: rescaling changes the stage width, which can flip the target back — settle on the smaller scale
      const lock = lockRef.current;
      if (lock && lock.some((v) => Math.abs(v - target) <= 0.01)) return;
      if (Math.abs(target - prevRef.current) <= 0.01) {
        lockRef.current = [target, sRef.current];
        target = Math.min(target, sRef.current);
        if (Math.abs(target - sRef.current) <= 0.01) return;
      } else if (steps.current >= 4) return;
      steps.current += 1;
      prevRef.current = sRef.current;
      sRef.current = target; setScale(target);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(() => { steps.current = Math.min(steps.current, 3); schedule(); });
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    const mo = new MutationObserver(() => { steps.current = 0; schedule(); });
    mo.observe(el, { childList: true, subtree: true, attributes: false });
    schedule();
    return () => { ro.disconnect(); mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [active, location.pathname]);

  const probe = <div ref={probeRef} aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: 0, height: '100vh', visibility: 'hidden', pointerEvents: 'none' }} />;
  if (!active || EXCLUDED.includes(location.pathname)) return <>{probe}{children}</>;
  const pct = 100 / scale;
  return (
    <div data-testid="fit-stage" data-scale={scale.toFixed(2)} className="fixed inset-0 overflow-hidden" style={{ background: '#02243F', '--stage-scale': scale }}>
      {probe}
      <div ref={ref} className="fit-stage-inner overflow-y-auto overflow-x-hidden"
        style={{ width: `${pct}vw`, height: `${pct}vh`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
