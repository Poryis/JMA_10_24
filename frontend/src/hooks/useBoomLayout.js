import { useLayoutEffect, useRef } from 'react';
import useVisibleViewport from './useVisibleViewport';

// Safari's address/tool bars consume visual viewport space, not necessarily vh.
// Keep this local to the rhythm room: other games retain their own fit rules.
export default function useBoomLayout(mode) {
  const viewport = useVisibleViewport();
  const stewZoneRef = useRef(null);

  useLayoutEffect(() => {
    const zone = stewZoneRef.current;
    if (!zone) return undefined;
    const measure = () => {
      // Shared tight art bounds (816 × 1070), plus room for his streak and hint.
      const height = Math.max(0, Math.min(zone.clientHeight - 58, (zone.clientWidth - 24) * 1070 / 816, 620));
      zone.style.setProperty('--boom-stew-height', `${height}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(zone);
    measure();
    return () => observer.disconnect();
  }, [mode]);

  return { viewport, stewZoneRef };
}