// UnderwaterBackdrop — the user's underwater scene rebuilt from its
// individual layers (assets/underwater/*): flat water, translucent wave
// bands, back sand dune, accents (seaweed + shells), front sand, fish,
// plus the rising bubbles. Layered so every piece can move on its own.
import { motion } from 'framer-motion';

const UW = `${process.env.PUBLIC_URL || ''}/assets/underwater/`;
export const UNDERWATER_WATER = '#34E0F6';
export const UW_ASSETS = {
  bands: `${UW}bands.png`,
  sandBack: `${UW}sand-back-tile.png`,
  sandFront: `${UW}sand-front-tile.png`,
  seaweed1: `${UW}seaweed-1.png`,
  seaweed2: `${UW}seaweed-2.png`,
  shell1: `${UW}shell-1.png`,
  shell2: `${UW}shell-2.png`,
  fish1: `${UW}fish-1.png`,
  fish2: `${UW}fish-2.png`,
  fishSchool: `${UW}fish-school.png`,
};

const BUBBLES = [
  { left: '3%',  size: 10, dur: 13, delay: 0 },
  { left: '8%',  size: 16, dur: 15, delay: 3 },
  { left: '14%', size: 8,  dur: 11, delay: 6.5 },
  { left: '18%', size: 22, dur: 18, delay: 1.5 },
  { left: '24%', size: 12, dur: 14, delay: 4 },
  { left: '30%', size: 6,  dur: 10, delay: 8 },
  { left: '36%', size: 18, dur: 16, delay: 2 },
  { left: '42%', size: 10, dur: 12, delay: 5.5 },
  { left: '48%', size: 24, dur: 19, delay: 0.5 },
  { left: '54%', size: 8,  dur: 11, delay: 7 },
  { left: '60%', size: 14, dur: 14, delay: 3.5 },
  { left: '66%', size: 20, dur: 17, delay: 1 },
  { left: '72%', size: 10, dur: 13, delay: 6 },
  { left: '78%', size: 6,  dur: 10, delay: 2.5 },
  { left: '84%', size: 16, dur: 15, delay: 4.5 },
  { left: '89%', size: 12, dur: 12, delay: 8.5 },
  { left: '94%', size: 22, dur: 18, delay: 0 },
  { left: '97%', size: 8,  dur: 11, delay: 5 },
];

// `density` repeats the set with shifted lefts/timings for busier water (e.g. the Academy).
export function Bubbles({ className = 'fixed inset-0 z-0', density = 1 }) {
  const all = Array.from({ length: density }, (_, d) => BUBBLES.map((b) => ({ ...b, left: `${(parseFloat(b.left) + d * 37) % 100}%`, size: Math.max(6, b.size - d * 2), dur: b.dur + d * 1.7, delay: b.delay + d * 4.3 }))).flat();
  return (
    <div aria-hidden="true" className={`${className} pointer-events-none overflow-hidden`}>
      {all.map((b, i) => {
        // Negative delay seeds every bubble mid-rise so the water is alive from t=0.
        const preRun = ((b.delay + b.dur * 0.5) % b.dur).toFixed(2);
        return (
          <span key={i} className="home-underwater-bubble"
            style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `-${preRun}s` }} />
        );
      })}
    </div>
  );
}

// A user-drawn fish (all art faces RIGHT). dir='left' flips it so it
// always faces the way it swims. Positions are viewport-relative.
export function Swimmer({ src, top, dur, delay = 0, width, dir = 'right', bob = 10, zIndex = 1, style = {}, facing = 'right' }) {
  const left = dir === 'right';
  const flip = (left ? 1 : -1) * (facing === 'left' ? -1 : 1); // art drawn facing left needs the opposite mirror
  return (
    <motion.img src={src} alt="" draggable={false} className="absolute pointer-events-none object-contain"
      style={{ top, width, left: 0, zIndex, ...style }}
      initial={{ x: left ? '-20vw' : '110vw', scaleX: flip }}
      animate={{ x: left ? '110vw' : '-20vw', y: [0, -bob, 0, bob * 0.6, 0] }}
      transition={{ x: { repeat: Infinity, duration: dur, ease: 'linear', delay: -delay }, y: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' } }} />
  );
}

// Sand dune strips tile sideways (mirror-tiled PNGs so there is no seam).
// `shift` slides the tile so the left edge lands in a dune trough instead of
// a half-dune (the front tile starts mid-slope, which read as a hard cut).
const TILE_ASPECT = { 'sand-front-tile': 3840 / 176, 'sand-back-tile': 3840 / 268 };
export const FRONT_TROUGH = 0.249;
export function SandStrip({ src, height, shift = 0, className = '', style = {} }) {
  const key = Object.keys(TILE_ASPECT).find((k) => src.includes(k));
  const h = typeof height === 'number' ? `${height}px` : height;
  const posX = shift && key ? `calc(${(-shift * TILE_ASPECT[key]).toFixed(3)} * ${h})` : 'left';
  return (
    <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 pointer-events-none ${className}`}
      style={{ height, backgroundImage: `url(${src})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: `${posX} bottom`, ...style }} />
  );
}

export function Seaweed({ src = UW_ASSETS.seaweed1, left, width, bottom = 0, delay = 0, zIndex = 1, style = {} }) {
  return (
    <motion.img src={src} alt="" draggable={false} className="absolute pointer-events-none object-contain object-bottom"
      style={{ left, width, bottom, zIndex, transformOrigin: 'bottom center', ...style }}
      animate={{ rotate: [-3, 3, -3], skewX: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 4.2, delay, ease: 'easeInOut' }} />
  );
}

export default function UnderwaterBackdrop({ deep = false, calm = false } = {}) {
  // `deep` = mid-ocean: no sand floor (Jam Session floats its instruments). `calm` = slower fish, fewer bubbles (lesson videos).
  const k = calm ? 2.4 : 1;
  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" style={{ background: UNDERWATER_WATER }} />
      <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none home-underwater-bg-layer overflow-hidden">
        <div className="absolute inset-x-0 bottom-0" style={{ height: '80%', backgroundImage: `url(${UW_ASSETS.bands})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'center bottom' }} />
        {!deep && (
          <>
            <SandStrip src={UW_ASSETS.sandBack} height="clamp(110px, 20vh, 240px)" />
            <Seaweed src={UW_ASSETS.seaweed2} left="27%" width="clamp(70px, 9vw, 150px)" bottom="clamp(40px, 7vh, 90px)" />
            <img src={UW_ASSETS.shell1} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '63%', bottom: 'clamp(30px, 5vh, 64px)', width: 'clamp(80px, 9vw, 150px)' }} />
            <SandStrip src={UW_ASSETS.sandFront} height="clamp(70px, 12vh, 150px)" shift={FRONT_TROUGH} />
            <img src={UW_ASSETS.shell2} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '44%', bottom: 'clamp(6px, 1.5vh, 20px)', width: 'clamp(34px, 4vw, 64px)' }} />
            <Seaweed src={UW_ASSETS.seaweed1} left="82%" width="clamp(90px, 11vw, 190px)" bottom="clamp(4px, 1vh, 14px)" delay={1.3} />
          </>
        )}
        {!calm && <Swimmer src={UW_ASSETS.fishSchool} top="6%" dur={70} delay={20} width="clamp(90px, 10vw, 170px)" />}
        <Swimmer src={UW_ASSETS.fish1} top="38%" dur={34 * k} delay={8} width="clamp(40px, 5vw, 80px)" dir="left" />
        <Swimmer src={UW_ASSETS.fish2} top="24%" dur={26 * k} delay={3} width="clamp(44px, 5vw, 84px)" />
      </div>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 pointer-events-none"
        style={{ height: '32vh', background: 'linear-gradient(180deg, rgba(2,36,63,0.55) 0%, rgba(2,36,63,0.15) 60%, transparent 100%)' }} />
      <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none home-underwater-shafts" />
      {calm ? <Bubbles className="fixed inset-0 z-0 opacity-50" /> : <Bubbles />}
    </>
  );
}

// Deep-sea navy fallback for page roots so nothing flashes white while art loads.
export const UNDERWATER_BG_COLOR = '#02243F';
