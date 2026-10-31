// useSongLoopPlayer — replays a saved Song Studio song (16 melody slots +
// mood chords + mood drum loop) on an endless loop so a kid can jam over it.
import { useCallback, useEffect, useRef, useState } from 'react';
import usePianoAudio from './usePianoAudio';
import { MOODS, TOTAL_SLOTS, SLOTS_PER_ROW } from '../data/songStudio';

const REST = 'REST';

export default function useSongLoopPlayer(getAudioGraph) {
  const piano = useRef(null);
  piano.current = usePianoAudio(getAudioGraph);
  const [playingId, setPlayingId] = useState(null);
  const st = useRef({ timer: null, sources: [], drum: null, token: 0 });

  const stop = useCallback(() => {
    const s = st.current;
    s.token += 1;
    clearTimeout(s.timer); s.timer = null;
    s.sources.forEach((src) => { try { src.stop(); } catch (_) { /* already ended */ } });
    s.sources = [];
    if (s.drum) { try { s.drum.stop(); } catch (_) { /* ignore */ } s.drum = null; }
    setPlayingId(null);
  }, []);

  const start = useCallback(async (song) => {
    stop();
    const s = st.current; const token = s.token;
    const p = piano.current;
    p.initContext();
    await p.preload();
    const mood = MOODS[song.moodId] || MOODS.happy;
    const drumBuf = mood.drumLoop ? await p.preloadLoop(mood.drumLoop) : null;
    if (s.token !== token) return;
    const beatSec = 60 / (song.bpm || mood.bpm);
    const passSec = TOTAL_SLOTS * beatSec;
    let passStart = p.now() + 0.12;
    if (drumBuf) s.drum = p.playLoop(drumBuf, 0.4, passStart);
    const schedulePass = (t0) => {
      for (let beat = 0; beat < TOTAL_SLOTS; beat++) {
        const t = t0 + beat * beatSec;
        const measureIdx = Math.floor(beat / SLOTS_PER_ROW);
        if (beat % SLOTS_PER_ROW === 0 && mood.chordProgression) {
          const chord = mood.chordProgression[measureIdx];
          if (chord) chord.notes.forEach((n) => { const src = p.playPianoNote(n, 0.3, t); if (src) s.sources.push(src); });
        }
        const id = song.slots[beat];
        if (id && id !== REST) { const src = p.playPianoNote(id, 0.8, t); if (src) s.sources.push(src); }
      }
      // forget sources that have already finished so the list stays small
      if (s.sources.length > 400) s.sources = s.sources.slice(-200);
    };
    schedulePass(passStart);
    const tick = () => {
      if (s.token !== token) return;
      passStart += passSec;
      schedulePass(passStart);
      s.timer = setTimeout(tick, passSec * 1000);
    };
    s.timer = setTimeout(tick, (passSec - 0.35) * 1000);
    setPlayingId(song.id);
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { start, stop, playingId };
}

export const SONGS_KEY = 'jma_songs_v1';
export function loadSavedSongs() {
  try { return JSON.parse(localStorage.getItem(SONGS_KEY) || '[]'); } catch (_) { return []; }
}
