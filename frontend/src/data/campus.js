// The Academy campus — every room as a building on the map.
// Every building has illustrated art; `kiosk` remains supported as a fallback.

const MU = 'assets/music/'; // Jelly instrumentals — each street spins its own playlist
const T = (file, title) => ({ src: `${MU}${file}.mp3`, title });
const CH = 'assets/characters/';

export const CAMPUS_ZONES = [
  { id: 'play',   label: 'PLAY',   street: 'Jelly Jam Boulevard', color: '#FFCC00', ground: '#9BE27A', tracks: [T('play-one-skip-one', 'Play One, Skip One'), T('goody-bag', 'Goody Bag'), T('food-fight', 'Food Fight')],   strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
  { id: 'learn',  label: 'LEARN',  street: 'Music 101 Lane',      color: '#C8A8F2', ground: '#7FD1B9', tracks: [T('magic', 'Magic'), T('brand-new-friend', 'Brand New Friend')],  strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
  { id: 'create', label: 'CREATE', street: 'Studio Row',          color: '#7DD3C0', ground: '#F2C878', tracks: [T('faster-as-we-go', 'Faster As We Go'), T('food-fight', 'Food Fight'), T('goody-bag', 'Goody Bag')], strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
];

export const CAMPUS_BUILDINGS = [
  // PLAY
  { id: 'bandstand',           zone: 'play',   name: 'Main Stage',           path: '/rank-hall',      art: 'assets/plaza/bandstand.png',          host: `${CH}charlie.png`,               starter: true,  size: 1.15, flat: true, custom: 'bandstand' },
  { id: 'jelly-jukebox',       zone: 'play',   name: 'Jelly Jukebox',        path: '/rhythm-game',    art: 'assets/campus/jukebox-diner.png',     host: `${CH}jazzy.png`,                 starter: true,  size: 1.0 },
  { id: 'shred-legend',        zone: 'play',   name: 'Shred City',           path: '/shred-legend',   art: 'assets/campus/shred-club.png',        host: `${CH}charlie-punk.png`,          starter: false, size: 1.0 },
  { id: 'stew-kazoo',          zone: 'play',   name: 'Stew Kazoo Says',      path: '/simon-says',     art: 'assets/campus/stew-room-kazoo.png',         host: `${CH}stew.png`,                  starter: true,  size: 0.95 },
  { id: 'note-match',          zone: 'play',   name: 'Note Match',           path: '/note-match',     art: 'assets/campus/note-match.png',        host: `${CH}sharky-hiphop.png`,         starter: false, size: 0.85 },
  { id: 'detective-jellybone', zone: 'play',   name: "Dr. Jellybone's Office", path: '/detective',    art: 'assets/campus/detective-office.png',  host: `${CH}dr-jellybone-detective.png`, starter: true, size: 1.0 },
  { id: 'sight-reading',       zone: 'play',   name: 'Sight-Reading Sprint', path: '/sight-reading',  art: 'assets/campus/sight-reading.png',     host: `${CH}finn-danger.png`,           starter: false, size: 0.9 },
  { id: 'robot-boogie',        zone: 'play',   name: 'Robot Boogie',         path: '/robot-boogie',   art: 'assets/campus/robot-boogie.png',      host: 'assets/robot-boogie/robot1-card-hero.png', starter: false, size: 0.9 },
  // LEARN
  { id: 'lessons',             zone: 'learn',  name: 'Music 101',            path: '/lessons',        art: 'assets/campus/music-101.png',         host: `${CH}charlie-grad.png`,          size: 1.0 },
  { id: 'fun-facts',           zone: 'learn',  name: 'Fun Facts Clubhouse',  path: '/fun-facts',      art: 'assets/campus/fun-facts.png',         host: `${CH}stew.png`,                  size: 0.9 },
  { id: 'boom-garden',         zone: 'learn',  name: "Who's Got the Rhythm", path: '/boom-garden',    art: 'assets/campus/football-field.png',    host: `${CH}chunk-marching.png`,        size: 1.05 },
  { id: 'ear-quest',           zone: 'learn',  name: 'Ear Quest',            path: '/ear-trainer',    art: 'assets/campus/ear-quest.png',         host: `${CH}dr-jellybone.png`,          size: 0.9 },
  { id: 'name-that-note',      zone: 'learn',  name: 'Name That Note',       path: '/name-that-note', art: 'assets/campus/name-that-note.png',    host: `${CH}finn-danger.png`,           size: 0.9 },
  // CREATE
  { id: 'beat-lab',            zone: 'create', name: 'Beat Lab',             path: '/loop-studio',    art: 'assets/campus/beat-lab.png',          host: `${CH}chunk.png`,                 size: 0.95 },
  { id: 'jam-session',         zone: 'create', name: 'Jam Session',          path: '/free-play',      art: 'assets/campus/jam-session.png',       host: `${CH}jazzy-disco.png`,           size: 0.95 },
  { id: 'song-studio',         zone: 'create', name: "Charlie's Song Studio", path: '/song-studio',   art: 'assets/campus/song-studio.png',       host: `${CH}charlie-studio.png`,        size: 1.0 },
];

// A quest route → the street/plaza URL that swims the kid into that game's door
// first (the camera follows), then continues to the route itself.
export function journeyTo(route) {
  if (!route) return route;
  if (route.includes('go=')) return route;
  const path = route.split('?')[0];
  const b = CAMPUS_BUILDINGS.find((x) => x.path === path) || PLAZA_BUILDINGS.find((x) => x.path && !x.path.includes('?') && path.startsWith(x.path));
  if (!b) return route;
  const base = b.zone === 'plaza' ? '/home?' : `/campus?zone=${b.zone}&`;
  return `${base}go=${b.id}&dest=${encodeURIComponent(route)}`;
}

// Academy Plaza — the town square where the three streets meet. Home.
const PZ = 'assets/plaza/';
export const PLAZA_ZONE = {
  id: 'plaza', label: 'ACADEMY PLAZA', street: 'Academy Plaza', color: '#FFCC00', ground: '#9BE27A',
  tracks: [T('goody-bag', 'Goody Bag'), T('magic', 'Magic'), T('faster-as-we-go', 'Faster As We Go'), T('brand-new-friend', 'Brand New Friend')],
  strollers: [{ src: `${CH}dr-jellybone.png`, facing: 'left' }, `${CH}sharky-snorkel.png`],
};
export const PLAZA_BUILDINGS = [
  // The journey, left to right: Academy → Dressing Room → Sticker Shack → the three street gates → JMAtv.
  { id: 'academy',       zone: 'plaza', name: 'The Academy',   path: '/academy',             art: `${PZ}academy.webp`,  starter: true, size: 2.2, flat: true, hero: true, aspect: 0.914, custom: 'academy', sign: 'THE ACADEMY', signPos: { x: 50, y: 104 }, signColor: '#FFCC00' },
  { id: 'dressing-room', zone: 'plaza', name: 'Dressing Room', path: '/dressing-room',       art: `${PZ}dressing-room.webp`, starter: true,  size: 1.55, flat: true, sign: 'DRESSING ROOM', signPos: { x: 50, y: 104 }, signColor: '#F9A8D4' },
  { id: 'sticker-shack', zone: 'plaza', name: 'Sticker Shack', path: '/sticker-book',        art: `${PZ}sticker-shack.webp`, host: `${CH}stew.png`,         starter: true,  size: 1.4, flat: true, sign: 'STICKER SHACK', signPos: { x: 50, y: 104 }, signColor: '#FF2D85' },
  { id: 'gate-play',     zone: 'plaza', name: 'Play Street',   path: '/campus?zone=play',    art: `${PZ}gate-play.png`,      host: `${CH}chunk-disco.png`,  starter: true,  size: 1.45, flat: true, drop: 4, ribbon: { text: 'PLAY', bg: '#FFCC00', color: 'var(--jma-dark)' },
    portal: { box: { left: 27, width: 54, top: 14, bottom: 4 }, bg: 'radial-gradient(ellipse at 50% 85%, #FF2D85 0%, #5B1C8A 45%, #140B2E 100%)', art: ['jukebox-diner', 'shred-club'] } },
  { id: 'gate-learn',    zone: 'plaza', name: 'Learn Street',  path: '/campus?zone=learn',   art: `${PZ}gate-learn.png`,     host: `${CH}jazzy-marching.png`, starter: false, size: 1.45, flat: true, drop: 4, ribbon: { text: 'LEARN', bg: '#8E5BD9', color: 'white' },
    portal: { box: { left: 19, width: 62, top: 22, bottom: 4 }, bg: 'radial-gradient(ellipse at 50% 90%, #7ED957 0%, #2E7D32 40%, #0B2E4F 100%)', art: ['football-field', 'music-101'] } },
  { id: 'gate-create',   zone: 'plaza', name: 'Create Street', path: '/campus?zone=create',  art: `${PZ}gate-create.png`,    host: `${CH}sharky-hiphop.png`, starter: false, size: 1.45, flat: true, ribbonLift: 5, ribbon: { text: 'CREATE', bg: '#1FA38C', color: 'white' },
    portal: { box: { left: 17, width: 66, top: 8, bottom: 10 }, bg: 'radial-gradient(ellipse at 50% 85%, #FF4D4D 0%, #7A1E2E 35%, #120A1E 100%)', art: ['song-studio', 'beat-lab'], artScale: 0.8 } },
  { id: 'jmatv',         zone: 'plaza', name: 'JMAtv',         path: '/jmatv',               art: null, custom: 'tv',                                       starter: true,  size: 1.4, flat: true, sign: 'JMATV', signPos: { x: 50, y: 104 }, signColor: '#1E9BFF' },
];
