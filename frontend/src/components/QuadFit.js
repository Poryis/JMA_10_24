// Warps its children onto a 4-corner area (e.g. a tilted screen or easel canvas) with a CSS homography.
import { useLayoutEffect, useRef, useState } from 'react';

const B = 200;
function squareToQuad([x0, y0, x1, y1, x2, y2, x3, y3]) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const a13 = (dx3 * dy2 - dx2 * dy3) / det, a23 = (dx1 * dy3 - dx3 * dy1) / det;
  const a11 = x1 - x0 + a13 * x1, a21 = x3 - x0 + a23 * x3;
  const a12 = y1 - y0 + a13 * y1, a22 = y3 - y0 + a23 * y3;
  return [a11 / B, a12 / B, 0, a13 / B, a21 / B, a22 / B, 0, a23 / B, 0, 0, 1, 0, x0, y0, 0, 1];
}

// quad: [[x,y] TL, TR, BR, BL] in % of the parent box.
export default function QuadFit({ quad, children, testId }) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const m = size && squareToQuad(quad.flatMap(([x, y]) => [x / 100 * size.w, y / 100 * size.h]));
  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" data-testid={testId}>
      {m && <div className="absolute left-0 top-0" style={{ width: B, height: B, transformOrigin: '0 0', transform: `matrix3d(${m.join(',')})` }}>{children}</div>}
    </div>
  );
}
