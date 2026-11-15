// DJ Stew's Turntable — neon dance-club background, built from the layered
// "DJ Stew's Turntable bg kit" PSD. Pieces are placed by percentage on a
// fixed STAGE canvas, then individually animated with CSS (disco ball spin +
// sway, EQ bars bouncing, speakers thumping, sign flicker, floor sparkles).
import { memo } from 'react';

const STAGE = { w: 5016, h: 2823 };
const A = 'assets/dj-stew-bg/';

const pct = (p) => ({
  left: `${(p.x / STAGE.w) * 100}%`,
  top: `${(p.y / STAGE.h) * 100}%`,
  width: `${(p.w / STAGE.w) * 100}%`,
  height: `${(p.h / STAGE.h) * 100}%`,
});

const PIECES = [
  { id: 'base', file: 'neon-purple-tiled-dance-room', x: 4, y: 2, w: 5008, h: 2819, z: 1 },
  { id: 'panel', file: 'behind-the-note-accents-to-make-the-note-pop-out-of-wall', x: 0, y: 229, w: 5010, h: 1248, z: 2 },
  { id: 'note-left', file: 'tied-eighth-notes-decoration', x: 297, y: 589, w: 476, h: 544, z: 3, anim: 'djbg-note-float', dur: '3.2s' },
  { id: 'note-right', file: 'tied-eighth-notes-decoration-copy', x: 4195, y: 518, w: 476, h: 544, z: 3, anim: 'djbg-note-float', dur: '3.6s', delay: '0.4s' },
  { id: 'stage', file: 'stage', x: 1922, y: 1847, w: 1564, h: 387, z: 4, anim: 'djbg-stage-glow', dur: '1.5s' },
  { id: 'accent-lightning', file: 'random-accents-without-a-home-layer-5', x: 849, y: 2210, w: 265, h: 455, z: 5, anim: 'djbg-lightning-flicker', dur: '4.6s' },
  { id: 'accent-star', file: 'random-accents-without-a-home-layer-6', x: 1146, y: 2188, w: 404, h: 407, z: 5, anim: 'djbg-note-float', dur: '3.4s', delay: '0.2s' },
  { id: 'accent-sparkle-big', file: 'random-accents-without-a-home-layer-8', x: 1552, y: 2041, w: 206, h: 236, z: 5, anim: 'djbg-twinkle', dur: '1.8s' },
  { id: 'accent-sparkle-small', file: 'random-accents-without-a-home-layer-7', x: 1550, y: 2541, w: 149, h: 185, z: 5, anim: 'djbg-twinkle', dur: '1.8s', delay: '0.7s' },
  { id: 'eq-right', file: 'equalizer-bars-copy', x: 4348, y: 1596, w: 624, h: 390, z: 6, anim: 'djbg-eq-bounce-a', dur: '1.4s', origin: 'bottom' },
  { id: 'eq-left', file: 'equalizer-bars-copy-2', x: 5, y: 1622, w: 626, h: 397, z: 6, anim: 'djbg-eq-bounce-b', dur: '1.65s', origin: 'bottom' },
  { id: 'sign', file: 'sign', x: 1891, y: -34, w: 1447, h: 954, z: 8, anim: 'djbg-sign-flicker', dur: '4s' },
  { id: 'speaker-left', file: 'speaker', x: 625, y: 991, w: 854, h: 1172, z: 9, anim: 'djbg-speaker-thump', dur: '0.75s' },
  { id: 'speaker-right', file: 'speaker-copy', x: 3584, y: 956, w: 849, h: 1165, z: 9, anim: 'djbg-speaker-thump', dur: '0.75s', delay: '0.1s' },
  { id: 'scaffolding', file: 'light-scaffolding', x: 566, y: -556, w: 4105, h: 911, z: 10 },
];

const DISCO = { x: 2413, y: -25, w: 568, h: 778 };

function DjStewBackground({ className = '' }) {
  return (
    <div
      data-testid="dj-turntable-background"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: -1, backgroundColor: '#190E33' }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ minWidth: '100%', minHeight: '100%', aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
      >
        {PIECES.map((p) => (
          <img
            key={p.id}
            src={`${A}${p.file}.png`}
            alt=""
            draggable={false}
            className="absolute object-contain"
            style={{
              ...pct(p),
              zIndex: p.z,
              transformOrigin: p.origin,
              animation: p.anim ? `${p.anim} ${p.dur || '2.2s'} ease-in-out infinite` : undefined,
              animationDelay: p.delay,
            }}
          />
        ))}
        {/* Disco ball: outer div sways like a pendulum, inner image spins continuously */}
        <div
          className="absolute"
          style={{ ...pct(DISCO), zIndex: 7, transformOrigin: '50% 8%', animation: 'djbg-disco-sway 4.2s ease-in-out infinite' }}
        >
          <img
            src={`${A}disco-ball.png`}
            alt=""
            draggable={false}
            className="w-full h-full object-contain"
            style={{ animation: 'djbg-disco-spin 9s linear infinite', transformOrigin: '50% 18%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(DjStewBackground);
