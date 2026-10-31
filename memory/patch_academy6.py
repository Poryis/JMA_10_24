p = '/app/frontend/src/pages/AcademyPage.js'
s = open(p).read()
R = [
 ("import { Play, Check, Stamp, Star, Printer, CircleHelp, Music2, Drum, Palette, X, Camera, Music, Sparkles } from 'lucide-react';",
  "import { Play, Check, Stamp, Star, Printer, CircleHelp, Music2, Drum, Palette, X, Camera, Music, Sparkles, Volume2, VolumeX } from 'lucide-react';"),
 ("style={{ color: 'var(--jma-dark)' }}>Yearbook</div>", "style={{ color: 'var(--jma-dark)' }}>Achievement Book</div>"),
 ("'The big book on the stand is your Yearbook.'", "'The big book on the stand is your Achievement Book.'"),
 ('label="Yearbook" pill={false}', 'label="Achievement Book" pill={false}'),
 ("""function Easels() {
  const avatar = readAvatarOutfit();""", """function Easels({ onEmpty }) {
  const avatar = readAvatarOutfit();
  const [idx, setIdx] = useState(0);"""),
 (".sort((a, b) => b.at - a.at).slice(0, 1).map(", ".sort((a, b) => b.at - a.at).map("),
 ("""  const t = latest[0];
  return (""", """  const t = latest[idx % Math.max(latest.length, 1)];
  const flip = () => (latest.length ? setIdx((i) => (i + 1) % latest.length) : onEmpty());
  return ("""),
 ("""      <QuadFit quad={EASEL_QUAD} testId="academy-easel-canvas">
        {t ? <Sleeve cover={t.cover} avatar={avatar} kind={t.kind} title={t.name} className="w-full" />""",
  """      <button type="button" data-testid="academy-easel-flip" aria-label={latest.length > 1 ? 'Flip to your next album cover' : 'Album cover easel'} onClick={flip}
        className="absolute pointer-events-auto cursor-pointer border-0 p-0 bg-transparent" style={{ left: '62.9%', top: '23.6%', width: '20.7%', height: '29%', clipPath: 'polygon(24% 0, 100% 7%, 78% 100%, 0 85%)' }} />
      <QuadFit quad={EASEL_QUAD} testId="academy-easel-canvas">
        {t ? <motion.div key={`${t.id}-${idx}`} style={{ transformOrigin: 'left center' }} initial={latest.length > 1 ? { rotateY: -90, opacity: 0 } : false} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
              <Sleeve cover={t.cover} avatar={avatar} kind={t.kind} title={t.name} className="w-full" />
            </motion.div>"""),
 ("        <Easels />", "        <Easels onEmpty={() => setPanel('album')} />"),
 ("style={{ left: '57%', bottom: '4%', width: '9%', zIndex:", "style={{ left: '55.5%', bottom: '3%', width: '12.5%', zIndex:"),
 ('src="assets/characters/charlie-grad.png"', 'src="assets/characters/charlie.png"'),
 ("  useStreetMusic(ACADEMY_TRACKS);", "  const { muted, toggleMute } = useStreetMusic(ACADEMY_TRACKS);"),
 ("""      <GameHeader title="The Academy" showHomeButton={true} backTo="/home" />""",
  """      <GameHeader title="The Academy" showHomeButton={true} backTo="/home" />
      <motion.button type="button" data-testid="academy-mute" data-muted={muted ? 'true' : 'false'} aria-label={muted ? 'Unmute music' : 'Mute music'} onClick={toggleMute} whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-black cursor-pointer"
        style={{ background: 'rgba(10,37,64,0.85)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)' }}>
        {muted ? <VolumeX className="w-4 h-4" strokeWidth={3} /> : <Volume2 className="w-4 h-4" strokeWidth={3} />}
        {muted ? 'Music off' : 'Music on'}
      </motion.button>"""),
]
for a, b in R:
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
open(p, 'w').write(s)
p = '/app/frontend/src/pages/RankHallPage.js'
s = open(p).read()
s = s.replace('/> My Yearbook</button>', '/> My Achievement Book</button>')
open(p, 'w').write(s)
print('ok')
