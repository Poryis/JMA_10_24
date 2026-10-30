import re, os
os.chdir('/app/frontend/src')
IMP = "import { brand, JmaTv } from '%s/lib/brand';\n"
edits = {
  'pages/CampusMapPage.js': [("<span>{b.sign}</span>", "<span>{brand(b.sign)}</span>"), (": b.sign}", ": brand(b.sign)}")],
  'components/QuestScroll.js': [("{rest.join('')}", "{brand(rest.join(''))}")],
  'pages/AcademyPage.js': [("textDecoration: q.done ? 'line-through' : 'none' }}>{q.title}</span>", "textDecoration: q.done ? 'line-through' : 'none' }}>{brand(q.title)}</span>"), ("{q.where}{q.target > 1", "{brand(q.where)}{q.target > 1")],
  'components/DailyQuestCard.js': [("          {quest.title}\n", "          {brand(quest.title)}\n"), ("{quest.where}{target", "{brand(quest.where)}{target")],
  'pages/StickerBookPage.js': [(": sticker.hint}", ": brand(sticker.hint)}")],
  'pages/DressingRoomPage.js': [("/>{o.unlock.hint}</span>", "/>{brand(o.unlock.hint)}</span>"), ("Earn it: {ghost.unlock.hint}", "Earn it: {brand(ghost.unlock.hint)}")],
  'pages/JMAtvHomePage.js': [("              JMAtv Live Channel\n", "              <JmaTv /> Live Channel\n")],
  'pages/JMAtvPlayerPage.js': [("              JMAtv\n            </span>", "              <JmaTv />\n            </span>"), ("            Back to JMAtv\n", "            Back to <JmaTv />\n")],
  'pages/JMAtvChannelPage.js': [("            Back to JMAtv\n", "            Back to <JmaTv />\n")],
  'pages/ForParentsPage.js': [("<span>{f}</span>", "<span>{brand(f)}</span>"), ("}}>{v.title}</h3>", "}}>{brand(v.title)}</h3>")],
}
depth = {'pages': '..', 'components': '..'}
for f, reps in edits.items():
    s = open(f).read()
    for a, b in reps:
        n = s.count(a)
        if n == 0: print('MISS', f, a[:50])
        s = s.replace(a, b)
    if "lib/brand'" not in s:
        idx = s.find('\nimport ')
        last = [m.end() for m in re.finditer(r"^import .*?;\n", s, re.M | re.S)][-1]
        s = s[:last] + IMP % '..' + s[last:]
    open(f, 'w').write(s)
print('ok')
