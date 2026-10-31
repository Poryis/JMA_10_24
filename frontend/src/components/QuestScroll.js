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

function Parchment({ art }) {
  return <img src={`assets/academy/room/quest-scroll-${art}.png`} alt="" draggable={false} className="absolute inset-0 w-full h-full" />;
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
      <Parchment art={spot.art} />
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ left: '13%', right: '13%', top: '21%', bottom: '21%', gap: '4%', opacity: quest.done ? 0.6 : 1 }}>
        <Icon style={{ width: spot.icon, height: spot.icon, color: '#9C3D12', flexShrink: 0 }} strokeWidth={2.4} />
        <div data-testid={`academy-chalk-quest-title-${index}`} style={{ fontFamily: 'Caveat, cursive', fontWeight: 700, color: INK, fontSize: spot.font, lineHeight: 0.95, textWrap: 'balance' }}>
          <span style={{ fontFamily: '"IM Fell English SC", serif', color: '#A3201F', fontSize: '1.45em', lineHeight: 0.8 }}>{first}</span>{brand(rest.join(''))}
        </div>
      </div>
      {quest.done && <WaxSeal />}
    </motion.div>
  );
}

