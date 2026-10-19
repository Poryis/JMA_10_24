// Fullscreen + landscape helpers. Browsers can't truly force orientation on
// a plain web page — the best we can do is: go fullscreen (hides the URL bar
// on Android / iPad), lock landscape where the API exists (Android), and on
// iPhone Safari (no fullscreen API) point at "Add to Home Screen".

export function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) || window.navigator.standalone === true;
}

export function isTouchDevice() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

export function isIOS() {
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
}

export function isIPhone() {
  return /iPhone|iPod/.test(window.navigator.userAgent);
}

export function canFullscreen() {
  const el = document.documentElement;
  return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) && !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement) || isStandalone();
}

export async function enterFullscreen() {
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch (_) { /* not allowed here — fine */ }
  try {
    if (window.screen.orientation && window.screen.orientation.lock) await window.screen.orientation.lock('landscape');
  } catch (_) { /* lock needs fullscreen + Android; ignore */ }
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
  } catch (_) { /* ignore */ }
  try { if (window.screen.orientation && window.screen.orientation.unlock) window.screen.orientation.unlock(); } catch (_) { /* ignore */ }
}

export function onFullscreenChange(fn) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
  return () => { document.removeEventListener('fullscreenchange', fn); document.removeEventListener('webkitfullscreenchange', fn); };
}
