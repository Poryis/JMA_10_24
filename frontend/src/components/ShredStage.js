// Shred City stage rebuilt from the user's layered PSD: speaker cones thump on the beat,
// lamps sway and throw coloured beams that grow with the crowd meter, curtains breathe.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const W = 2528, H = 1696;
const A = 'assets/shred/';
const box = (x, y, w, h) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%` });

const LAMPS = [
  { x: 357, w: 242, h: 262, c: '231,36,40' }, { x: 599, w: 213, h: 259, c: '240,197,5' },
  { x: 812, w: 212, h: 258, c: '1,170,175' }, { x: 1024, w: 198, h: 256, c: '71,183,46' },
  { x: 1222, w: 192, h: 257, c: '168,90,195' }, { x: 1414, w: 209, h: 258, c: '2,170,175' },
  { x: 1623, w: 211, h: 258, c: '240,193,3' }, { x: 1834, w: 235, h: 260, c: '229,23,27' },
];
const CONES = [
  { id: 'lt', x: 471, y: 949, s: 44 }, { id: 'rt', x: 720, y: 940, s: 44 },
  { id: 'lb', x: 469, y: 1083, s: 63 }, { id: 'rb', x: 720, y: 1067, s: 63 },
];

const play = (f, vol = 0.6) => { const a = new Audio(encodeURI(`assets/audio/${f}`)); a.volume = vol; a.play().catch(() => {}); };
const Img = ({ src, b, className = '', style }) => (
  <img src={`${A}${src}.webp`} alt="" draggable={false} className={`absolute pointer-events-none select-none ${className}`} style={{ ...b, ...style }} />
);

function Lamp({ l, i, interactive, flash, onTap }) {
  return (
    <motion.button type="button" data-testid={`shred-lamp-${i}`} aria-label="Stage light" disabled={!interactive}
      className="shred-lamp absolute p-0 border-0 bg-transparent" style={{ ...box(l.x, -8, l.w, l.h), transformOrigin: '50% 4%', cursor: interactive ? 'pointer' : 'default', pointerEvents: interactive ? 'auto' : 'none' }}
      animate={{ rotate: [-2.5, 2.5, -2.5] }} transition={{ repeat: Infinity, duration: 3 + (i % 3) * 0.6, delay: i * 0.25, ease: 'easeInOut' }}
      onClick={onTap}>
      <img src={`${A}lamp-${i}.webp`} alt="" draggable={false} className="w-full h-full pointer-events-none" />
      <motion.span key={flash} className="absolute rounded-full pointer-events-none" initial={{ opacity: flash ? 1 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }}
        style={{ left: '30%', top: '58%', width: '50%', height: '36%', background: `radial-gradient(circle, rgba(255,255,255,0.95), rgba(${l.c},0.6) 45%, rgba(${l.c},0) 72%)`, filter: 'blur(2px)' }} />
    </motion.button>
  );
}

function Beam({ l, i, energy, show, flash }) {
  const spread = 6 + energy * 14;
  const lensX = l.x + l.w * 0.55, lensY = 190;
  return (
    <motion.div className="absolute" style={{ left: `${((lensX - 230) / W) * 100}%`, top: `${(lensY / H) * 100}%`, width: `${(460 / W) * 100}%`, height: `${(1250 / H) * 100}%`, transformOrigin: '50% 0%' }}
      animate={{ rotate: [i % 2 ? spread : -spread, i % 2 ? -spread : spread, i % 2 ? spread : -spread] }}
      transition={{ repeat: Infinity, duration: Math.max(2.2, 5.2 - energy * 2.8) + (i % 3) * 0.4, ease: 'easeInOut' }}>
      <motion.div className="w-full h-full" key={flash}
        style={{ clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', background: `linear-gradient(180deg, rgba(${l.c},0.85) 0%, rgba(${l.c},0.35) 45%, rgba(${l.c},0) 92%)`, filter: 'blur(5px)' }}
        initial={{ opacity: flash ? 0.95 : show }} animate={{ opacity: show }} transition={{ duration: flash ? 1 : 0.6 }} />
    </motion.div>
  );
}

export default function ShredStage({ band, active, energy = 0, hitPulse = 0, interactive = false }) {
  const rootRef = useRef(null);
  const hitRef = useRef(0);
  const [flashes, setFlashes] = useState(() => LAMPS.map(() => 0));
  const [coneTap, setConeTap] = useState(0);
  const [sway, setSway] = useState({ left: 0, right: 0 });

  useEffect(() => { if (hitPulse) hitRef.current = 1; }, [hitPulse]);

  // Drive --kick / --ph straight on the DOM every frame (no React re-render).
  useEffect(() => {
    let raf;
    const tick = () => {
      const el = rootRef.current;
      if (el) {
        const ph = active ? band.beatPhase() : -1;
        const beatKick = ph >= 0 ? Math.pow(1 - ph, 3) : 0;
        hitRef.current *= 0.88;
        el.style.setProperty('--kick', Math.min(1, beatKick + hitRef.current * 0.6).toFixed(3));
        el.style.setProperty('--ph', ph >= 0 ? ph.toFixed(3) : '1');
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, band]);

  const tapLamp = (i) => { setFlashes((f) => f.map((v, j) => (j === i ? v + 1 : v))); play('sfx-twinkle.mp3', 0.5); };
  const tapSpeaker = () => { setConeTap((n) => n + 1); hitRef.current = 1; play('Bass drum - kick.mp3', 0.8); };
  const tapMarshall = () => { hitRef.current = 1; play('guitar-crunch/E3.mp3', 0.6); };
  const tapCurtain = (side) => { setSway((s) => ({ ...s, [side]: s[side] + 1 })); play('sfx-page.mp3', 0.4); };

  const beamShow = active ? 0.3 + energy * 0.6 : 0.2;
  const tap = (fn, testId, b, label) => interactive && (
    <button type="button" data-testid={testId} aria-label={label} onClick={fn} className="absolute p-0 border-0 bg-transparent cursor-pointer" style={{ ...b, pointerEvents: 'auto' }} />
  );

  return (
    <div className="absolute inset-0" style={{ zIndex: 0, background: '#8A8F96', overflow: 'clip' }} data-testid="shred-stage">
      <div ref={rootRef} className="shred-art absolute" style={{ '--kick': 0, '--ph': 1 }}>
        <Img src="background" b={box(0, 0, W, H)} />
        <Img src="back-curtains" b={box(-91, -158, 2710, 1533)} />
        <Img src="top-curtain" b={box(-67, -1040, 2436, 1349)} />
        {/* floor pools of light grow with the crowd */}
        {[{ x: 700, c: LAMPS[0].c }, { x: 1264, c: LAMPS[4].c }, { x: 1830, c: LAMPS[2].c }].map((p, i) => (
          <motion.div key={i} className="absolute pointer-events-none rounded-[50%]" style={{ ...box(p.x - 420, 1080, 840, 300), background: `radial-gradient(ellipse, rgba(${p.c},0.55), rgba(${p.c},0) 70%)`, mixBlendMode: 'screen' }}
            animate={{ opacity: [beamShow * 0.7, beamShow * 1.2, beamShow * 0.7] }} transition={{ repeat: Infinity, duration: 1.6 + i * 0.4 }} />
        ))}
        <Img src="riser" b={box(882, 920, 833, 298)} />
        <div className="absolute" style={{ ...box(1771, 668, 456, 585), transformOrigin: '50% 100%', transform: 'scaleY(calc(1 + var(--kick) * 0.012))' }}>
          <img src={`${A}marshall.webp`} alt="" draggable={false} className="w-full h-full pointer-events-none" />
          <span className="absolute rounded-full" style={{ left: '74%', top: '10.5%', width: '3%', height: '3%', background: '#FF3B30', boxShadow: '0 0 calc(4px + var(--kick) * 14px) #FF3B30', opacity: 'calc(0.5 + var(--kick) * 0.5)' }} />
        </div>
        <Img src="wedge-right" b={box(1773, 1278, 569, 319)} style={{ transformOrigin: '50% 100%', transform: 'scale(calc(1 + var(--kick) * 0.015))' }} />
        <Img src="amps" b={box(258, 689, 631, 568)} style={{ transformOrigin: '50% 100%', transform: 'scaleY(calc(1 + var(--kick) * 0.012))' }} />
        {CONES.map((c) => (
          <div key={c.id} className="absolute pointer-events-none" style={box(c.x, c.y, c.s, c.s)} data-testid={`shred-cone-${c.id}`}>
            {/* sound rings ripple out once per beat */}
            <span className="absolute inset-0 rounded-full" style={{ border: '3px solid rgba(255,255,255,0.75)', transform: 'scale(calc(1 + var(--ph) * 2.6))', opacity: `calc((1 - var(--ph)) * ${active ? 0.7 : 0})` }} />
            <motion.img key={coneTap} src={`${A}cone-${c.id}.webp`} alt="" draggable={false} className="absolute inset-0 w-full h-full"
              style={{ scale: 1 }} animate={coneTap ? { scale: [1, 1.5, 0.9, 1.15, 1] } : {}} transition={{ duration: 0.5 }} />
            <span className="absolute inset-0 rounded-full" style={{ background: 'rgba(30,30,34,0.0)', boxShadow: 'inset 0 0 0 calc(var(--kick) * 6px) rgba(255,255,255,0.18)', transform: 'scale(calc(1 + var(--kick) * 0.4))' }} />
          </div>
        ))}
        <Img src="wedge-left" b={box(189, 1278, 703, 322)} style={{ transformOrigin: '50% 100%', transform: 'scale(calc(1 + var(--kick) * 0.015))' }} />
        {[['left', 0, 405], ['right', 2076, 452]].map(([side, x, w]) => (
          <motion.div key={`${side}-${sway[side]}`} className="absolute" style={{ ...box(x, 0, w, 1456), transformOrigin: side === 'left' ? '0% 0%' : '100% 0%' }}
            animate={sway[side] ? { skewX: [0, side === 'left' ? 4 : -4, side === 'left' ? -2.5 : 2.5, 1, 0] } : { skewX: [0, side === 'left' ? 0.8 : -0.8, 0] }}
            transition={sway[side] ? { duration: 1.4 } : { repeat: Infinity, duration: 6, ease: 'easeInOut' }}>
            <img src={`${A}curtain-${side}.webp`} alt="" draggable={false} className="w-full h-full pointer-events-none" />
            {interactive && <button type="button" data-testid={`shred-curtain-${side}`} aria-label="Curtain" onClick={() => tapCurtain(side)} className="absolute inset-0 p-0 border-0 bg-transparent cursor-pointer" />}
          </motion.div>
        ))}
        {/* house lights dim when the show is on so the beams pop */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: '#0A1426', opacity: active ? 0.32 : 0.12, transition: 'opacity 0.8s ease' }} />
        <div className="shred-lightrig absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ mixBlendMode: 'screen' }} data-testid="shred-beams">
          {LAMPS.map((l, i) => <Beam key={i} l={l} i={i} energy={active ? energy : 0} show={beamShow} flash={flashes[i]} />)}
        </div>
        <div className="shred-rig">
          <Img src="light-bar" b={box(326, 0, 1917, 18)} />
          {LAMPS.map((l, i) => <Lamp key={i} l={l} i={i} interactive={interactive} flash={flashes[i]} onTap={() => tapLamp(i)} />)}
        </div>
        </div>
        {tap(tapSpeaker, 'shred-tap-amps', box(258, 689, 631, 568), 'Speakers')}
        {tap(tapMarshall, 'shred-tap-marshall', box(1771, 668, 456, 585), 'Guitar amp')}
        {tap(tapSpeaker, 'shred-tap-wedge-left', box(189, 1278, 703, 322), 'Monitor')}
        {tap(tapSpeaker, 'shred-tap-wedge-right', box(1773, 1278, 569, 319), 'Monitor')}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(10,20,32,0) 0%, rgba(10,20,32,0) 55%, rgba(10,20,32,0.35) 100%)' }} />
    </div>
  );
}
