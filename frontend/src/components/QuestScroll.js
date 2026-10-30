// Hand-inked parchment scroll pinned to the Academy chalkboard (one per quest).
import { motion } from 'framer-motion';
import { Search, Piano, Disc3, Ear, BookOpen, Drum, Music, Bot, Sparkles, Tv, Headphones, Mic, Guitar, Shirt, Gamepad2 } from 'lucide-react';
import { brand } from '../lib/brand';

const ICONS = {
  detective: Search, stew: Piano, jukebox: Disc3, notematch: Ear, sightread: BookOpen, beatlab: Drum,
  jam: Music, robot: Bot, facts: Sparkles, jmatv: Tv, boom: Drum, namenote: Music, lessons: BookOpen,
  songstudio: Mic, shred: Guitar, earquest: Headphones, t_character: Shirt, t_first_game: Gamepad2,
};
const INK = '#4A2A0C';

function Parchment({ uid }) {
  return (
    <svg viewBox="0 0 100 130" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`p-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3D1" /><stop offset="0.55" stopColor="#F6E1AE" /><stop offset="1" stopColor="#E7C88A" />
        </linearGradient>
        <linearGradient id={`r-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3D9A0" /><stop offset="0.5" stopColor="#D9B06A" /><stop offset="1" stopColor="#A8793B" />
        </linearGradient>
      </defs>
      <path d="M8 12 Q50 17 92 12 L90 40 Q94 65 90 90 L92 118 Q50 113 8 118 L10 90 Q6 65 10 40 Z" fill={`url(#p-${uid})`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 24 Q50 27 84 24 M16 106 Q50 103 84 106" stroke="#C9A365" strokeWidth="1" fill="none" strokeDasharray="2 3" />
      {[8, 118].map((y) => (
        <g key={y}>
          <rect x="2" y={y - 6} width="96" height="12" rx="6" fill={`url(#r-${uid})`} stroke={INK} strokeWidth="2.2" />
          <circle cx="4" cy={y} r="5" fill="#8B5A2B" stroke={INK} strokeWidth="2" />
          <circle cx="96" cy={y} r="5" fill="#8B5A2B" stroke={INK} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function WaxSeal() {
  return (
    <motion.div className="absolute flex items-center justify-center rounded-full" style={{ right: '-12%', bottom: '-6%', width: '30%', aspectRatio: '1', background: 'radial-gradient(circle at 35% 30%, #F0646A, #B3202A 70%)', border: `0.6cqw solid #7A1018`, boxShadow: '0 0.6cqw 0 rgba(0,0,0,0.25)', color: '#FFE9C2', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '7cqw' }}
      initial={{ scale: 2.2, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ type: 'spring', stiffness: 260, damping: 13 }} data-testid="quest-scroll-seal">
      ✓
    </motion.div>
  );
}

export default function QuestScroll({ quest, spot, isNext, index }) {
  const Icon = ICONS[quest.game] || ICONS[quest.id] || Sparkles;
  const [first, ...rest] = quest.title;
  return (
    <motion.div data-testid={`academy-chalk-quest-${index}`} data-done={quest.done ? 'true' : 'false'} data-next={isNext ? 'true' : 'false'} className="absolute"
      style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height, transformOrigin: 'top center', filter: isNext ? 'drop-shadow(0 0 1.2cqw rgba(255,214,90,0.9))' : 'drop-shadow(0 0.6cqw 0 rgba(0,0,0,0.3))' }}
      initial={{ rotate: spot.rot }}
      animate={isNext ? { rotate: [spot.rot - 2, spot.rot + 2, spot.rot - 2], filter: ['drop-shadow(0 0 0.6cqw rgba(255,214,90,0.6))', 'drop-shadow(0 0 2cqw rgba(255,214,90,1))', 'drop-shadow(0 0 0.6cqw rgba(255,214,90,0.6))'] } : { rotate: spot.rot }}
      transition={isNext ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' } : { duration: 0.4 }}>
      <Parchment uid={`${index}`} />
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ left: '14%', right: '14%', top: '17%', bottom: '17%', gap: '4%', opacity: quest.done ? 0.6 : 1 }}>
        <Icon style={{ width: spot.icon, height: spot.icon, color: '#9C3D12', flexShrink: 0 }} strokeWidth={2.4} />
        <div data-testid={`academy-chalk-quest-title-${index}`} style={{ fontFamily: 'Caveat, cursive', fontWeight: 700, color: INK, fontSize: spot.font, lineHeight: 0.95, textWrap: 'balance' }}>
          <span style={{ fontFamily: '"IM Fell English SC", serif', color: '#A3201F', fontSize: '1.45em', lineHeight: 0.8 }}>{first}</span>{brand(rest.join(''))}
        </div>
      </div>
      {quest.done && <WaxSeal />}
    </motion.div>
  );
}

