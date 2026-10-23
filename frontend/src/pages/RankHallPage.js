// RankHallPage — inside the Bandstand. The kid's own avatar stands center stage
// under a spotlight, the band cheers from the pit, the trophy shelf of ranks sits
// behind, and "TAKE A BOW!" sets off the crowd. Tap a trophy → Charlie explains it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, BookOpen, Hand, Heart, Music, VolumeX } from 'lucide-react';
import { ACHIEVEMENT_STICKERS } from '../data/achievements';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import { useStreetMusic } from './CampusMapPage';
import { readAvatarOutfit } from '../hooks/useAvatar';
import AvatarSprite from '../components/AvatarSprite';
import Confetti from '../components/Confetti';
import { GameHeader } from '../components/GameUI';
import { StageLights, CrowdRow, CROWD_SHOUTS } from './ShredLegendPage';

const CURTAIN = 'repeating-linear-gradient(90deg, #C2173A 0 18px, #8E0C22 18px 36px)';
const FANFARE = ['C4', 'E4', 'G4', 'C5'];
const SFX = (file, vol, delay) => setTimeout(() => { const a = new Audio(encodeURI(`assets/audio/${file}`)); a.volume = vol; a.play().catch(() => {}); }, delay);
const HALL_TRACKS = [{ src: 'assets/music/magic.mp3', title: 'Magic' }, { src: 'assets/music/brand-new-friend.mp3', title: 'Brand New Friend' }];
const OVATION_AT = 3;

// Camera flashes + hearts/notes rising from the pit on every bow.
function CrowdBurst({ id, big }) {
  const n = big ? 27 : 9;
  const items = Array.from({ length: n }, (_, i) => ({ x: 6 + ((i * 37 + id * 13) % 88), d: (i % 5) * 0.12, heart: i % 3 !== 0 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 8 }} aria-hidden="true">
      {items.map((it, i) => (
        <motion.span key={`${id}-${i}`} className="absolute" style={{ left: `${it.x}%`, bottom: '16%', color: it.heart ? '#FF2D85' : '#FFCC00' }}
          initial={{ y: 0, opacity: 0, scale: 0.4 }} animate={{ y: [0, -140 - (i % 4) * 40], opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 0.8], x: [0, (i % 2 ? 1 : -1) * (12 + (i % 3) * 10)] }} transition={{ duration: 1.5 + it.d, delay: it.d, ease: 'easeOut' }}>
          {it.heart ? <Heart className="w-5 h-5" fill="currentColor" strokeWidth={0} /> : <Music className="w-5 h-5" strokeWidth={3} />}
        </motion.span>
      ))}
      {Array.from({ length: big ? 15 : 5 }, (_, i) => (
        <motion.span key={`f${id}-${i}`} className="absolute rounded-full bg-white" style={{ left: `${10 + ((i * 53 + id * 7) % 80)}%`, bottom: `${3 + (i % 3) * 5}%`, width: 14, height: 14, boxShadow: '0 0 24px 10px rgba(255,255,255,0.9)' }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.25, delay: 0.15 + i * 0.18 }} />
      ))}
    </div>
  );
}

// Scrolling ticker of the badges this kid has actually earned.
function BadgeTicker({ names }) {
  const text = names.length ? names.map((n) => `★ ${n}`).join('   ') + '   ' : '★ Earn badges in the games to light up this hall   ';
  return (
    <div className="absolute right-0 overflow-hidden pointer-events-none" style={{ left: 96, top: 'calc(13% + 6px)', height: 18, zIndex: 3 }} data-testid="rank-hall-ticker">
      <motion.div className="whitespace-nowrap font-black text-[11px] tracking-wider" style={{ color: '#FFE8A3', textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}
        animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: Math.max(14, names.length * 4), ease: 'linear' }}>
        {text}{text}
      </motion.div>
    </div>
  );
}

// Kick → crunchy guitar C-E-G-C → crash. Rock fanfare, not a recital.
export function playFanfare() {
  SFX('Bass drum - kick.mp3', 0.9, 0);
  FANFARE.forEach((n, i) => SFX(`guitar-crunch/${n}.mp3`, 0.55, 60 + i * 120));
  SFX('Crash cymbal.mp3', 0.6, 60 + FANFARE.length * 120);
}

export default function RankHallPage() {
  const navigate = useNavigate();
  const { currentRank } = useRank();
  const { earned } = useStickers();
  const badgeNames = ACHIEVEMENT_STICKERS.filter((a) => earned[a.id]).map((a) => a.name);
  const { nowPlaying, muted, toggleMute } = useStreetMusic(HALL_TRACKS);
  const avatar = readAvatarOutfit();
  const host = /charlie/.test(avatar.src) ? { src: 'assets/characters/dr-jellybone.png', name: 'Dr. Jellybone' } : { src: 'assets/characters/charlie.png', name: 'Charlie' };
  const [bow, setBow] = useState(0);
  const [energy, setEnergy] = useState(0.3);
  const [shouts, setShouts] = useState([]);
  const [confetti, setConfetti] = useState(0);
  const [bubble, setBubble] = useState(`The stage is yours, ${currentRank.title}! Take a bow!`);
  const [hype, setHype] = useState(0);
  const [ovation, setOvation] = useState(false);
  const timers = useRef([]);
  const hypeTimer = useRef(null);
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(hypeTimer.current); }, []);

  const takeBow = useCallback(() => {
    const nextHype = hype + 1;
    const big = nextHype >= OVATION_AT;
    setBow((b) => b + 1); setEnergy(1); setConfetti((c) => c + 1); playFanfare();
    if (big) { timers.current.push(setTimeout(playFanfare, 500)); setOvation(true); setHype(0); timers.current.push(setTimeout(() => setOvation(false), 3200)); }
    else setHype(nextHype);
    clearTimeout(hypeTimer.current); hypeTimer.current = setTimeout(() => setHype(0), 7000);
    const members = big ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 2, 4, 6];
    setShouts(members.map((m, i) => ({ id: Date.now() + i, member: m, text: CROWD_SHOUTS[(m + i + bow) % CROWD_SHOUTS.length] })));
    setBubble(big ? 'STANDING OVATION! They love you!' : ['The crowd goes wild!', 'Encore! Encore!', 'That bow had STYLE, kid.', 'Hear that? That\'s all for you.', 'One more and they\'ll stand up!'][Math.min(hype, 4)]);
    timers.current.push(setTimeout(() => { setEnergy(0.3); setShouts([]); }, big ? 4200 : 2600));
  }, [bow, hype]);


  return (
    <div className="relative overflow-hidden" data-testid="rank-hall-page" style={{ height: '100dvh', minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 20%, #1E3A5C 0%, #0B1E33 55%, #060F1C 100%)' }}>
      <StageLights energy={energy} style="halftime" />
      <BadgeTicker names={badgeNames} />
      <GameHeader title="The Stage" showHomeButton={true} backTo="/home" />

      {/* curtain valance */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '13%', background: CURTAIN, borderBottom: '4px solid #FFCC00', boxShadow: 'inset 0 -16px 24px rgba(0,0,0,0.45)', zIndex: 2 }} />

      {/* marquee: your rank in lights */}
      <motion.div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1 whitespace-nowrap" data-testid="rank-hall-marquee"
        style={{ top: '13%', marginTop: -16, zIndex: 6, background: 'radial-gradient(circle, #FFF2A8 0 2.5px, rgba(255,255,255,0) 3.5px) 1px 1px / 14px 14px, var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <span className="rounded-full px-3 py-0.5 font-black font-display text-sm md:text-base" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}>
          <Star className="inline w-4 h-4 -mt-0.5 mr-1" strokeWidth={3} />{currentRank.title.toUpperCase()}<Star className="inline w-4 h-4 -mt-0.5 ml-1" strokeWidth={3} />
        </span>
      </motion.div>

      {/* now playing / mute */}
      {nowPlaying && (
        <button type="button" data-testid="rank-hall-now-playing" data-muted={muted ? 'true' : 'false'} onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="rank-hall-music absolute flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black cursor-pointer" style={{ right: '2%', top: 'calc(13% + 28px)', zIndex: 6, background: 'rgba(10,37,64,0.85)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)', opacity: muted ? 0.7 : 1 }}>
          {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={3} /> : <motion.span animate={{ rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}><Music className="w-3.5 h-3.5" strokeWidth={3} /></motion.span>}
          <span style={{ textDecoration: muted ? 'line-through' : 'none' }}>{nowPlaying}</span>
        </button>
      )}

      {/* stage floor */}
      <div aria-hidden="true" className="absolute inset-x-0 pointer-events-none" style={{ bottom: '18%', height: '16%', background: 'repeating-linear-gradient(90deg, #A67B4C 0 60px, #8B6540 60px 62px)', borderTop: '4px solid var(--jma-dark)', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.35)', zIndex: 2 }} />

      {/* spotlight + YOU */}
      <motion.div aria-hidden="true" className="absolute left-1/2 pointer-events-none" style={{ bottom: '30%', width: 'min(60vw, 520px)', height: '62%', transformOrigin: 'top center', zIndex: 3, clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', background: ovation ? 'linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.4) 60%, rgba(255,240,180,0.6) 100%)' : 'linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.22) 60%, rgba(255,240,180,0.35) 100%)' }}
        animate={{ x: ['-50%', '-46%', '-54%', '-50%'] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} />
      <motion.button type="button" data-testid="rank-hall-you" onClick={takeBow} aria-label="Take a bow"
        className="rank-hall-you absolute left-1/2 -translate-x-1/2 bg-transparent border-0 p-0 cursor-pointer flex flex-col items-center" style={{ bottom: '31%', zIndex: 5, height: '40%' }}>
        <motion.div key={bow} className="h-full flex items-end" style={{ transformOrigin: 'bottom center' }}
          animate={bow ? { rotate: [0, 0, -22, -22, 0], y: [0, -26, 0, 0, 0] } : { y: [0, -4, 0] }} transition={bow ? { duration: 1.4, times: [0, 0.2, 0.45, 0.8, 1] } : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
          <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} className="h-full w-auto" imgStyle={{ height: '100%', width: 'auto', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.45))' }} />
        </motion.div>
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-black text-white whitespace-nowrap" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }}>YOU</span>
      </motion.button>

      {/* Charlie, the host, with a speech bubble */}
      <div className="rank-hall-host absolute flex items-end gap-2" style={{ left: '3%', bottom: '31%', zIndex: 5, height: '34%' }}>
        <img src={host.src} alt={host.name} draggable={false} className="h-full w-auto object-contain" style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))' }} />
        <AnimatePresence mode="wait">
          <motion.div key={bubble} data-testid="rank-hall-bubble" className="rank-hall-bubble relative mb-[55%] rounded-2xl px-3 py-2 text-[11px] md:text-sm font-bold leading-snug bg-white" style={{ color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', width: 'clamp(150px, 20vw, 240px)' }}
            initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
            {bubble}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* buttons on the lip of the stage */}
      <div className="rank-hall-actions absolute left-1/2 -translate-x-1/2 flex flex-nowrap justify-center gap-2 whitespace-nowrap" style={{ bottom: '19.5%', zIndex: 6 }}>
        <motion.button type="button" data-testid="rank-hall-bow" onClick={takeBow} className="chunky-btn px-4 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FF2D85', color: 'white' }}
          animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}><Hand className="w-4 h-4" strokeWidth={3} /> TAKE A BOW!
          <span className="flex items-center gap-0.5 ml-1" data-testid="rank-hall-hype" data-hype={hype}>{Array.from({ length: OVATION_AT }, (_, i) => <Heart key={i} className="w-3 h-3" fill={i < hype ? 'white' : 'none'} strokeWidth={3} />)}</span></motion.button>
        <button type="button" data-testid="rank-hall-academy" onClick={() => navigate('/academy')} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><BookOpen className="w-4 h-4" strokeWidth={3} /> My Yearbook</button>
      </div>

      {/* the band cheers from the pit */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '20%', zIndex: 7 }}>
        <CrowdRow energy={energy} burstId={bow} shouts={shouts} />
      </div>

      {bow > 0 && <CrowdBurst key={`burst-${bow}`} id={bow} big={ovation} />}
      <AnimatePresence>
        {ovation && (
          <motion.div key="ovation" data-testid="rank-hall-ovation" className="absolute left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl font-black font-display text-2xl md:text-4xl whitespace-nowrap"
            style={{ top: '38%', zIndex: 30, background: '#FFCC00', color: 'var(--jma-dark)', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}
            initial={{ scale: 0, rotate: -8 }} animate={{ scale: [0, 1.2, 1], rotate: [-8, 4, -2] }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.6 }}>
            STANDING OVATION!
          </motion.div>
        )}
      </AnimatePresence>
      {confetti > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
          <Confetti key={confetti} mega testId="rank-hall-confetti" />
          {ovation && [-30, 30].map((dx) => (
            <div key={`${confetti}-${dx}`} className="absolute inset-0" style={{ transform: `translateX(${dx}%)` }}><Confetti mega /></div>
          ))}
        </div>
      )}
    </div>
  );
}
