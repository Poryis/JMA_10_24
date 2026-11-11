import re
p='/app/frontend/src/lib/voice.js'
s=open(p).read()
s=s.replace("""if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (current && current._route !== routeKey() && Date.now() - current._at > CARRY_MS) stopVoice();
  });
}
""","""export function cutVoiceOnRouteChange() {
  if (current && current._route !== routeKey() && Date.now() - current._at > CARRY_MS) stopVoice();
}
""",1)
open(p,'w').write(s)

p='/app/frontend/src/components/ScrollToTop.js'
s=open(p).read()
s=s.replace("import { useLocation } from 'react-router-dom';","import { useLocation } from 'react-router-dom';\nimport { cutVoiceOnRouteChange } from '../lib/voice';",1)
s=s.replace("""  useEffect(() => {
    try {""","""  useEffect(() => {
    cutVoiceOnRouteChange(); // leaving a building silences its how-to line
    try {""",1)
open(p,'w').write(s)

for p, m in [('/app/frontend/src/pages/CampusMapPage.js','musicMuted'), ('/app/frontend/src/pages/RankHallPage.js','muted')]:
    s=open(p).read()
    i=s.index("{nowPlaying && (")
    j=s.index("</button>", i)
    blk=s[i:j]
    blk=blk.replace("{nowPlaying && (", f"{{(nowPlaying || {m}) && (",1)
    blk=blk.replace("key={nowPlaying}", f"key={{nowPlaying || 'off'}}")
    blk=blk.replace(">{nowPlaying}<", f">{{nowPlaying || 'Music off'}}<")
    s=s[:i]+blk+s[j:]
    open(p,'w').write(s)
    print(blk.count("Music off"))
