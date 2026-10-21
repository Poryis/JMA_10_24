// Lookahead step sequencer on the AudioContext clock ("A Tale of Two Clocks").
// A coarse JS timer only QUEUES steps ~120ms ahead; the audio thread fires them
// at exact times, so busy main threads / mobile throttling can't drag the tempo.
export function createStepScheduler({ ctx, getSecPerStep, getTotalSteps, onSchedule, onStepUI, lookahead = 0.18, tickMs = 25 }) {
  let step = 0;
  let nextTime = 0;
  let timer = null;
  let raf = null;
  const queue = [];

  const tick = () => {
    while (nextTime < ctx.currentTime + lookahead) {
      onSchedule(step, nextTime);
      queue.push({ step, time: nextTime });
      nextTime += getSecPerStep();
      step = (step + 1) % getTotalSteps();
    }
  };

  const draw = () => {
    const now = ctx.currentTime;
    let last = null;
    while (queue.length && queue[0].time <= now) last = queue.shift();
    if (last) onStepUI(last.step);
    raf = requestAnimationFrame(draw);
  };

  return {
    start(fromStep = 0) {
      step = fromStep;
      nextTime = ctx.currentTime + 0.03;
      queue.length = 0;
      tick();
      timer = setInterval(tick, tickMs);
      if (onStepUI) raf = requestAnimationFrame(draw);
    },
    stop() {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      timer = null;
      queue.length = 0;
    },
  };
}
