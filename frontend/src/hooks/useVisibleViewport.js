import { useLayoutEffect, useState } from 'react';

const readViewport = () => {
  const viewport = window.visualViewport;
  const unzoomed = !viewport || Math.abs(viewport.scale - 1) < 0.01;
  return {
    width: unzoomed && viewport ? viewport.width : window.innerWidth,
    height: unzoomed && viewport ? viewport.height : window.innerHeight,
  };
};

// Safari chrome reduces the visible viewport. Never shrink the UI under a pinch zoom.
export default function useVisibleViewport() {
  const [viewport, setViewport] = useState(readViewport);
  useLayoutEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01) return;
        const next = readViewport();
        setViewport((old) => old.width === next.width && old.height === next.height ? old : next);
      });
    };
    const visual = window.visualViewport;
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    visual?.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      visual?.removeEventListener('resize', update);
    };
  }, []);
  return viewport;
}