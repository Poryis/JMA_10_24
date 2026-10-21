// Loops a saved Beat Lab pattern through useAudio so kids can jam over it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createStepScheduler } from '../lib/stepScheduler';

// `lab` (useBeatLabAudio) replays the EXACT Beat Lab voices (sax, bass, guitar,
// piano, drums, scratches) via each track's id (= Beat Lab key, e.g. 'sax:C4').
// Steps are scheduled on the audio clock so the groove never sags.
export default function useBeatLoopPlayer({ playBellNote, playDrumSound, initAudioContext, lab }) {
  const [playingId, setPlayingId] = useState(null);
  const schedulerRef = useRef(null);

  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    schedulerRef.current = null;
    setPlayingId(null);
  }, []);

  const start = useCallback(async (beat) => {
    stop();
    if (!beat || !beat.tracks?.length) return;
    const ctx = initAudioContext();
    const useLab = !!lab && beat.tracks.every((t) => typeof t.id === 'string');
    if (useLab) {
      const insts = [...new Set(beat.tracks.filter((t) => t.id.includes(':')).map((t) => t.id.split(':')[0]))];
      try { await Promise.all([lab.preloadDrums(), ...insts.map((i) => lab.preloadInstrument(i))]); } catch (_) { /* play what loaded */ }
    }
    const playStep = (step, when) => {
      beat.tracks.forEach((t) => {
        if (!t.steps[step]) return;
        if (useLab) {
          if (t.id.includes(':')) { const [inst, note] = t.id.split(':'); lab.playNote(inst, note, undefined, when); }
          else lab.playDrum(t.id, when);
          return;
        }
        // Legacy bell/drum beats have no scheduled API — fire at the right wall-clock moment.
        const delay = Math.max(0, (when - ctx.currentTime) * 1000);
        setTimeout(() => (t.type === 'bell' ? playBellNote(t.note) : playDrumSound(t.note)), delay);
      });
    };
    schedulerRef.current = createStepScheduler({
      ctx,
      getSecPerStep: () => 60 / beat.bpm / 4,
      getTotalSteps: () => beat.totalSteps,
      onSchedule: playStep,
    });
    schedulerRef.current.start(0);
    setPlayingId(beat.id);
  }, [stop, initAudioContext, playBellNote, playDrumSound, lab]);

  useEffect(() => stop, [stop]);

  return { start, stop, playingId };
}
