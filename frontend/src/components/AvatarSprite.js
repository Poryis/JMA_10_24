// AvatarSprite — renders an avatar outfit image; the astronaut outfit adds the
// layered SVG helmet from DrJellyboneAstronaut so it matches the in-game look.
// The helmet layers are sized to the image's *rendered* box (object-fit:
// contain can leave empty space in the wrapper), so the dome always sits on
// his head no matter how the sprite is fitted.
import { useLayoutEffect, useRef, useState } from 'react';
import { HelmetBackShell, HelmetFrontVisor } from './DrJellyboneAstronaut';

function renderedBox(wrap, img, objectPosition = '') {
  const cw = wrap.clientWidth, ch = wrap.clientHeight;
  const nw = img.naturalWidth, nh = img.naturalHeight;
  if (!cw || !ch || !nw || !nh) return null;
  const r = nw / nh;
  let w = cw, h = cw / r;
  if (h > ch) { h = ch; w = ch * r; }
  const bottom = /bottom/.test(objectPosition);
  return { left: (cw - w) / 2, top: bottom ? ch - h : (ch - h) / 2, width: w, height: h };
}

export default function AvatarSprite({ src, helmet = false, width, className = '', style = {}, imgStyle = {}, testId }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    if (!helmet) return undefined;
    const wrap = wrapRef.current, img = imgRef.current;
    if (!wrap || !img) return undefined;
    const measure = () => setBox(renderedBox(wrap, img, imgStyle.objectPosition));
    measure();
    img.addEventListener('load', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(wrap);
    return () => { img.removeEventListener('load', measure); ro?.disconnect(); };
  }, [helmet, src, imgStyle.objectPosition]);

  if (!helmet) {
    return <img src={src} alt="" draggable={false} data-testid={testId} className={className} style={{ width, ...style, ...imgStyle }} />;
  }
  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`} style={{ width, ...style }} data-testid={testId} data-helmet="true">
      <img ref={imgRef} src={src} alt="" draggable={false} className="block w-full h-auto relative" style={{ zIndex: 1, ...imgStyle }} />
      <div aria-hidden="true" className="absolute pointer-events-none" style={box ? { ...box, zIndex: 0 } : { inset: 0, zIndex: 0 }}><HelmetBackShell /></div>
      <div aria-hidden="true" className="absolute pointer-events-none" style={box ? { ...box, zIndex: 3 } : { inset: 0, zIndex: 3 }}><HelmetFrontVisor /></div>
    </div>
  );
}
