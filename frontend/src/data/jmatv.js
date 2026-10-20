// JMAtv — the in-app TV channel.
//
// Four "channels" (categories) of Vimeo-hosted videos:
//   - FUN FACTS            — short fact bites, kept unlabelled by NUMBER on
//                            purpose so we don't spoil the surprise.
//   - PUNS WITH FINN DANGER — short comedy bits with Finn.
//   - JMA MUSIC VIDEOS     — longer-form music videos from Jelly of the Month
//                            Club.
//   - VARIETY SHOW         — variety-show segments. Placeholder until
//                            episodes are uploaded.
//
// Each channel ID is the URL slug (/jmatv/:channelId). Episodes are ordered
// in the array they're listed in; that order shows up in the channel page.
// Title / subtitle are kid-facing — keep them snack-sized.
// Titles are ALL CAPS to match the NES-cartridge tile aesthetic across the app.

export const JMATV_CHANNELS = [
  {
    id: 'jma-music-videos',
    title: 'OFFICIAL MUSIC VIDEOS',
    tagline: 'Full-length jams from Jelly of the Month Club',
    color: '#FF3B30',
    accent: '#B82A20',
    icon: 'assets/characters/llama-lou-stew.png',
    badgeBg: '#FFD9D6',
    // Order per user request: Robot Boogie + Goody Bag pinned to the
    // top; the rest keep their original chronological order below.
    episodes: [
      { vimeoId: '1237507858', title: 'The Magic Is in the Music' },
      { vimeoId: '1200951612', title: 'Robot Boogie' },
      { vimeoId: '1200949757', title: 'Goody Bag' },
      { vimeoId: '1200947216', title: 'Jelly Jamboree' },
      { vimeoId: '1200949215', title: 'Play One, Skip One' },
      { vimeoId: '1200949216', title: 'Lemonade Standoff' },
      { vimeoId: '1200949994', title: 'Seahorse Siesta' },
      { vimeoId: '1200949952', title: 'Epic Drum Battle' },
      { vimeoId: '1200949768', title: 'Peanut Butter Jellyfish Sandwich' },
      { vimeoId: '1200949704', title: 'Cubs, Cubs, Cubs' },
      { vimeoId: '1200949703', title: 'Brand New Friend' },
      { vimeoId: '1200949702', title: 'A Shellfish Elf' },
      { vimeoId: '1200949701', title: 'A Llama’s Life for Me' },
      { vimeoId: '1200951610', title: 'Dough is in Pizza' },
      { vimeoId: '1200951609', title: 'Faster as We Go' },
      { vimeoId: '1200951611', title: 'High and Low' },
      { vimeoId: '1200951769', title: 'We Groovin’ Freeze Dance' },
      { vimeoId: '1200951835', title: 'We Mosh Freeze Dance' },
      { vimeoId: '1200951872', title: 'Who’s Got the Rhythm' },
    ],
  },
  {
    id: 'puns-finn-danger',
    title: 'PUNS WITH FINN DANGER',
    tagline: 'Groan-worthy zingers from your favorite cellist',
    color: '#4285F4',
    accent: '#1A4FAB',
    icon: 'assets/characters/finn-danger.png',
    badgeBg: '#D7E4FF',
    episodes: [
      { vimeoId: '1200946368', title: 'Stuck Forever' },
      { vimeoId: '1200946258', title: 'Tongue-Tied' },
      { vimeoId: '1200946257', title: 'Sole Mates' },
      { vimeoId: '1200946256', title: 'Round Trip' },
      { vimeoId: '1200946167', title: 'Blind Spot' },
      { vimeoId: '1200946168', title: 'Fried' },
      { vimeoId: '1200946169', title: 'Spin Cycle' },
    ],
  },
  {
    id: 'fun-facts',
    title: 'FUN FACTS 4 KIDS',
    tagline: 'Quick brain-bites about music & weird stuff',
    color: '#FF9500',
    accent: '#C26200',
    icon: 'assets/characters/charlie-grad.png',
    badgeBg: '#FFE7C2',
    episodes: [
      { vimeoId: '1200919220', title: 'Mighty Molars' },
      { vimeoId: '1200919210', title: 'Nitro Nuts' },
      { vimeoId: '1200919169', title: 'Hello?' },
      { vimeoId: '1200919209', title: 'Muscles' },
      { vimeoId: '1200919203', title: 'Crazy Carrots' },
      { vimeoId: '1200919170', title: 'Scary Words' },
      { vimeoId: '1200919168', title: 'No Licking!' },
      { vimeoId: '1200919167', title: 'Teenage Mutant Ninja Monkeys?' },
    ],
  },
  {
    id: 'variety-show',
    title: 'VARIETY SHOW',
    tagline: 'Sketches, skits & silliness — the full variety show!',
    color: '#AF52DE',
    accent: '#6D2E96',
    icon: 'assets/characters/jelly-rap-trio.png',
    badgeBg: '#EEDDFF',
    episodes: [
      { vimeoId: '1233079709', title: 'The JOTMC Variety Show' },
    ],
  },
];

export function getChannel(channelId) {
  return JMATV_CHANNELS.find((c) => c.id === channelId) || null;
}

export function getEpisode(channelId, episodeIndex) {
  const ch = getChannel(channelId);
  if (!ch) return null;
  const idx = Number(episodeIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= ch.episodes.length) return null;
  return { ...ch.episodes[idx], index: idx, channelId };
}

// Used by RetroTV on the homepage to pick a "now playing" preview from any
// channel that has episodes. Stable per-session so the TV doesn't flicker
// between picks on every render.
export function pickFeaturedEpisode() {
  const playable = JMATV_CHANNELS.filter((c) => c.episodes.length > 0);
  if (playable.length === 0) return null;
  const ch = playable[Math.floor(Math.random() * playable.length)];
  const idx = Math.floor(Math.random() * ch.episodes.length);
  return { ...ch.episodes[idx], channelId: ch.id, index: idx };
}

// ---- JMAtv LIVE ----------------------------------------------------------
// The LIVE channel is one continuously-running produced "variety show" video.
// We join it mid-stream by the wall-clock and loop it, so it feels like a TV
// channel that's always on — and because it's a SINGLE video, sound only has
// to be turned on once (no tap-for-sound on every clip).
export const LIVE_VARIETY = {
  vimeoId: '1233079709',
  title: 'The JOTMC Variety Show',
  durationSec: 928,
};


export function buildLivePlaylist() {
  const playable = JMATV_CHANNELS.filter((c) => c.episodes.length > 0);
  const queues = playable.map((c) => ({
    channelId: c.id,
    channelTitle: c.title,
    color: c.color,
    accent: c.accent,
    eps: [...c.episodes],
    i: 0,
  }));
  const out = [];
  let remaining = queues.reduce((n, q) => n + q.eps.length, 0);
  while (remaining > 0) {
    for (const q of queues) {
      if (q.i < q.eps.length) {
        const ep = q.eps[q.i++];
        out.push({
          vimeoId: ep.vimeoId,
          title: ep.title,
          channelId: q.channelId,
          channelTitle: q.channelTitle,
          color: q.color,
          accent: q.accent,
        });
        remaining -= 1;
      }
    }
  }
  return out;
}

// Average segment length (seconds) used only to pick a CLOCK-BASED starting
// index, so tuning in at different times lands on different content and the
// feed appears to roll forward on its own. The exact mid-video offset is
// computed from the real player duration once it loads.
const LIVE_AVG_SEGMENT_SEC = 75;
export function getLiveStartIndex(playlistLength) {
  if (!playlistLength) return 0;
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.floor(nowSec / LIVE_AVG_SEGMENT_SEC) % playlistLength;
}
