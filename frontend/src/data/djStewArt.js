// DJ Stew's Turntable — sprite layout, exported from the user's layered PSD.
// Every piece's (x, y, w, h) is relative to the same STAGE canvas, so they
// all line up perfectly when positioned absolutely as percentages of it.

const A = 'assets/dj-stew/';

export const STAGE = { w: 3232, h: 2269 };

export const PIECES = {
  body:               { x: 1001, y: 800,  w: 631, h: 802, file: `${A}body.png` },
  turntable_outline:  { x: 0,    y: 1237, w: 3232, h: 1032, file: `${A}turntable-outline.png` },
  disc_left:          { x: 199,  y: 1292, w: 772, h: 245, file: `${A}disc-left.png` },
  disc_right:         { x: 1732, y: 1279, w: 803, h: 254, file: `${A}disc-right.png` },
  // 4-frame glint cycle per turntable — toggling these fakes the spin
  // instead of literally rotating the (perspective-angled) disc artwork.
  spin_left_1:        { x: 321,  y: 1438, w: 210, h: 64, file: `${A}spin-left-1.png` },
  spin_left_2:        { x: 281,  y: 1314, w: 211, h: 64, file: `${A}spin-left-2.png` },
  spin_left_3:        { x: 675,  y: 1316, w: 211, h: 63, file: `${A}spin-left-3.png` },
  spin_left_4:        { x: 674,  y: 1438, w: 212, h: 64, file: `${A}spin-left-4.png` },
  spin_right_1:       { x: 1858, y: 1430, w: 220, h: 66, file: `${A}spin-right-1.png` },
  spin_right_2:       { x: 1817, y: 1302, w: 219, h: 66, file: `${A}spin-right-2.png` },
  spin_right_3:       { x: 2228, y: 1303, w: 219, h: 66, file: `${A}spin-right-3.png` },
  spin_right_4:       { x: 2228, y: 1431, w: 219, h: 65, file: `${A}spin-right-4.png` },
  needle_left:        { x: 2197, y: 1337, w: 338, h: 165, file: `${A}needle-left.png` },
  needle_right:       { x: 115,  y: 1346, w: 338, h: 165, file: `${A}needle-right.png` },
  drum_off:           { x: 958,  y: 1264, w: 796, h: 319, file: `${A}drum-machine-off.png` },
  drum_on:            { x: 958,  y: 1264, w: 796, h: 319, file: `${A}drum-machine-on.png` },
  head_base:          { x: 827,  y: 0,    w: 827, h: 907, file: `${A}head-base.png` },
  eyes:               { x: 1012, y: 256,  w: 299, h: 339, file: `${A}eyes.png` },
  wing_right_idle:    { x: 513,  y: 861,  w: 532, h: 572, file: `${A}wing-right-idle.png` },
  wing_right_scratch: { x: 519,  y: 871,  w: 526, h: 591, file: `${A}wing-right-scratch.png` },
  wing_left_idle:     { x: 1514, y: 302,  w: 402, h: 899, file: `${A}wing-left-idle.png` },
  wing_left_press1:   { x: 1076, y: 907,  w: 556, h: 591, file: `${A}wing-left-press1.png` },
  wing_left_press2:   { x: 1040, y: 865,  w: 593, h: 555, file: `${A}wing-left-press2.png` },
  wing_left_press3:   { x: 1079, y: 885,  w: 554, h: 524, file: `${A}wing-left-press3.png` },
};

// Convert a piece's absolute PSD coords into CSS percentages of the stage.
export function pct(piece) {
  return {
    left: `${(piece.x / STAGE.w) * 100}%`,
    top: `${(piece.y / STAGE.h) * 100}%`,
    width: `${(piece.w / STAGE.w) * 100}%`,
    height: `${(piece.h / STAGE.h) * 100}%`,
  };
}
