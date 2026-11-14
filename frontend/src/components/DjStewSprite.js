// DJ Stew's Turntable — the layered character + DJ booth scene.
// Every piece is absolutely positioned (as % of a fixed stage) so the PSD's
// original registration lines up perfectly no matter the screen size.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PIECES, STAGE, pct } from '../data/djStewArt';

const Piece = ({ id, style, ...rest }) => {
  const p = PIECES[id];
  return (
    <img
      src={p.file}
      alt=""
      draggable={false}
      className="absolute object-contain pointer-events-none select-none"
      style={{ ...pct(p), ...style }}
      {...rest}
    />
  );
};

export default function DjStewSprite({ scratchTick = 0, beatTick = 0, className = '' }) {
  const [blinking, setBlinking] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [pressFrame, setPressFrame] = useState(0); // 0 idle, 1-3 button-press poses
  const [drumFlash, setDrumFlash] = useState(0);
  const scratchTimer = useRef(null);
  const pressTimer = useRef(null);

  // Preload every pose frame once so wing/eye swaps never show a blank
  // flash while the browser fetches a PNG it hasn't needed yet.
  useEffect(() => {
    Object.values(PIECES).forEach((p) => { const img = new Image(); img.src = p.file; });
  }, []);

  // Blink at a random interval — feels alive without being distracting.
  useEffect(() => {
    let alive = true;
    const schedule = () => {
      const delay = 2200 + Math.random() * 2400;
      return setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        setTimeout(() => { if (alive) setBlinking(false); }, 110);
        timer = schedule();
      }, delay);
    };
    let timer = schedule();
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  // A correct scratch swings the right wing onto the record + wiggles the needle.
  useEffect(() => {
    if (scratchTick === 0) return;
    setScratching(true);
    clearTimeout(scratchTimer.current);
    scratchTimer.current = setTimeout(() => setScratching(false), 240);
    return () => clearTimeout(scratchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scratchTick]);

  // Every backing-beat: the left wing presses a drum pad + the pads flash.
  useEffect(() => {
    if (beatTick === 0) return;
    setPressFrame((f) => (f % 3) + 1);
    setDrumFlash((f) => f + 1);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressFrame(0), 260);
    return () => clearTimeout(pressTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatTick]);

  const leftWingId = pressFrame === 0 ? 'wing_left_idle' : `wing_left_press${pressFrame}`;

  return (
    <div
      data-testid="dj-stew-sprite"
      className={`relative w-full ${className}`}
      style={{ paddingTop: `${(STAGE.h / STAGE.w) * 100}%` }}
    >
      <div className="absolute inset-0">
        {/* Body + head breathe together */}
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -4, 0], scale: [1, 1.012, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 90%' }}
        >
          <Piece id="body" style={{ zIndex: 1 }} />
          <Piece id="head_base" style={{ zIndex: 2 }} />
          <img
            src={PIECES.eyes.file}
            alt=""
            draggable={false}
            className="absolute object-contain pointer-events-none select-none"
            style={{ ...pct(PIECES.eyes), zIndex: 3, opacity: blinking ? 0 : 1, transition: 'opacity 0.06s' }}
          />
        </motion.div>

        <Piece id="turntable_outline" style={{ zIndex: 4 }} />

        <motion.img
          src={PIECES.record_left.file}
          alt=""
          draggable={false}
          className="absolute object-contain pointer-events-none select-none"
          style={{ ...pct(PIECES.record_left), zIndex: 5 }}
          animate={{ rotate: 360 }}
          transition={{ duration: scratching ? 0.5 : 3.6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.img
          src={PIECES.record_right.file}
          alt=""
          draggable={false}
          className="absolute object-contain pointer-events-none select-none"
          style={{ ...pct(PIECES.record_right), zIndex: 5 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
        />

        <motion.img
          src={PIECES.needle_left.file}
          alt=""
          draggable={false}
          className="absolute object-contain pointer-events-none select-none"
          style={{ ...pct(PIECES.needle_left), zIndex: 6, transformOrigin: '85% 15%' }}
          animate={scratching ? { rotate: [0, -9, 7, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        />
        <Piece id="needle_right" style={{ zIndex: 6 }} />

        {/* Drum machine: lit layer flashes on top of the unlit base each beat */}
        <Piece id="drum_off" style={{ zIndex: 7 }} />
        {drumFlash > 0 && (
          <motion.img
            key={drumFlash}
            src={PIECES.drum_on.file}
            alt=""
            draggable={false}
            className="absolute object-contain pointer-events-none select-none"
            style={{ ...pct(PIECES.drum_on), zIndex: 8 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}

        <Piece id={scratching ? 'wing_right_scratch' : 'wing_right_idle'} style={{ zIndex: 9 }} />
        <Piece id={leftWingId} style={{ zIndex: 10 }} />
      </div>
    </div>
  );
}
