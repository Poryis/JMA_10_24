// Saved Jam Session recordings (My Album). Metadata lives in localStorage
// (tiny, synchronous — same pattern as useSavedBeats/useSongLoopPlayer) but
// the actual MP3 audio is a Blob stored in IndexedDB, since a handful of
// ~1MB recordings would blow past localStorage's quota and risk corrupting
// every other save (stickers, progress, covers...) sharing that origin.
const KEY = 'jma_saved_jams_v1';
const MAX_JAMS = 6;
const DB_NAME = 'jma_media_v1';
const STORE = 'jams';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putBlob(id, blob) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlob(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteBlob(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (_) { /* ignore */ }
}

export function loadSavedJams() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

// `blob` is the recorded MP3 Blob. `sourceName` (optional) is what the kid
// was jamming to (a beat/song/Jelly Song name) so the album card can say
// "Jammed over: ...".
export async function saveJam({ name, blob, sourceName }) {
  const jams = loadSavedJams();
  const id = `j${Date.now()}`;
  const jam = { id, name: name || 'My Jam', sourceName: sourceName || null, createdAt: Date.now() };
  const next = [jam, ...jams];
  const kept = next.slice(0, MAX_JAMS);
  const evicted = next.slice(MAX_JAMS);
  try { localStorage.setItem(KEY, JSON.stringify(kept)); } catch (_) { /* ignore */ }
  await putBlob(id, blob);
  await Promise.all(evicted.map((j) => deleteBlob(j.id)));
  return jam;
}

// Returns an object URL for the recording's audio (caller should
// URL.revokeObjectURL it when done), or null if the blob is missing.
export async function getJamAudioUrl(id) {
  try {
    const blob = await getBlob(id);
    return blob ? URL.createObjectURL(blob) : null;
  } catch (_) {
    return null;
  }
}

export function deleteSavedJam(id) {
  const next = loadSavedJams().filter((j) => j.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (_) { /* ignore */ }
  deleteBlob(id);
  return next;
}

export function renameSavedJam(id, name) {
  const next = loadSavedJams().map((j) => (j.id === id ? { ...j, name } : j));
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (_) { /* ignore */ }
  return next;
}
