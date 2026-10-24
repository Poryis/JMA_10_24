// useAvatar — the kid's chosen Jelly + outfit, with unlock state.
import { useCallback, useEffect, useState } from 'react';
import { AVATARS, AVATAR_MAP, AVATAR_KEY, isOutfitUnlocked, isCharacterUnlocked } from '../data/avatars';
import { RANKS } from '../data/ranks';
import useRank from './useRank';
import useStickers, { readEarnedStickers } from './useStickers';

const RANK_IDS = RANKS.map(r => r.id);
const listeners = new Set();
const notify = () => listeners.forEach(fn => { try { fn(); } catch (_) {} });

export function readAvatar() {
  try {
    const v = JSON.parse(localStorage.getItem(AVATAR_KEY));
    if (v && v.character === 'sharky') { v.character = 'finn'; if (v.outfit === 'classic') v.outfit = 'plain'; } // Sharky merged into Finn
    if (v && AVATAR_MAP[v.character]) return { chosen: true, character: v.character, outfit: v.outfit || 'classic' };
  } catch (_) {}
  return { chosen: false, character: 'charlie', outfit: 'classic' };
}

export function readAvatarOutfit() {
  const { character, outfit } = readAvatar();
  const a = AVATAR_MAP[character];
  return a.outfits.find(o => o.id === outfit) || a.outfits[0];
}
export function readAvatarSrc() { return readAvatarOutfit().src; }

function writeAvatar(character, outfit) {
  try { localStorage.setItem(AVATAR_KEY, JSON.stringify({ character, outfit })); } catch (_) {}
  notify();
}

export default function useAvatar() {
  const [state, setState] = useState(readAvatar);
  const { currentRank } = useRank();
  const { earned } = useStickers();

  useEffect(() => {
    const refresh = () => setState(readAvatar());
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, []);

  const ctx = { earned: earned || readEarnedStickers(), rankIndex: RANK_IDS.indexOf(currentRank.id), rankIds: RANK_IDS };
  const savedChar = AVATAR_MAP[state.character];
  // a secret friend that got re-locked (e.g. cleared data) falls back to Charlie
  const character = isCharacterUnlocked(savedChar, ctx) ? savedChar : AVATAR_MAP.charlie;
  const outfits = character.outfits.map(o => ({ ...o, unlocked: isOutfitUnlocked(o, ctx) }));
  const outfit = outfits.find(o => o.id === state.outfit && o.unlocked) || outfits[0];
  const totalUnlocked = AVATARS.reduce((n, a) => n + a.outfits.filter(o => isCharacterUnlocked(a, ctx) && isOutfitUnlocked(o, ctx)).length, 0);
  const totalOutfits = AVATARS.reduce((n, a) => n + a.outfits.length, 0);

  const choose = useCallback((characterId, outfitId = 'classic') => writeAvatar(characterId, outfitId), []);
  const wear = useCallback((outfitId) => writeAvatar(state.character, outfitId), [state.character]);
  const unlockedFor = useCallback((a) => a.outfits.filter(o => isOutfitUnlocked(o, ctx)).length, [ctx.earned, ctx.rankIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const characterUnlocked = useCallback((a) => isCharacterUnlocked(a, ctx), [ctx.earned, ctx.rankIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return { chosen: state.chosen, character, outfit, outfits, src: outfit.src, choose, wear, unlockedFor, characterUnlocked, totalUnlocked, totalOutfits };
}
