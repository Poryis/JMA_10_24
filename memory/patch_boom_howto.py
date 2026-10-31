p = '/app/frontend/src/pages/BoomGardenPage.js'
s = open(p).read()
S = '[@media(max-height:520px)]:'
R = [
 ('className="rounded-3xl border-4 px-6 py-5 md:px-8 md:py-7 flex flex-col items-center gap-4 max-w-md w-full bg-white relative"',
  f'className="rounded-3xl border-4 px-6 py-5 md:px-8 md:py-7 flex flex-col items-center gap-4 max-w-md w-full bg-white relative {S}flex-row {S}max-w-2xl {S}py-3 {S}px-4"'),
 ('''                {/* Mode header chip + character */}
                <div
                  className="rounded-full border-3''', f'''                <div className="flex flex-col items-center gap-4 {S}gap-2 {S}w-[36%] flex-shrink-0">
                {{/* Mode header chip + character */}}
                <div
                  className="rounded-full border-3'''),
 ('<h2 className="text-3xl md:text-4xl font-black font-display leading-none text-center">',
  f'<h2 className="text-3xl md:text-4xl {S}text-2xl font-black font-display leading-none text-center">'),
 ('''                    className="object-contain pointer-events-none select-none"
                    style={{ maxHeight: 130, filter: 'drop-shadow(0 4px 0 rgba(10,37,64,0.25))' }}
                  />
                )}
''', f'''                    className="object-contain pointer-events-none select-none {S}!max-h-[110px]"
                    style={{{{ maxHeight: 130, filter: 'drop-shadow(0 4px 0 rgba(10,37,64,0.25))' }}}}
                  />
                )}}
                </div>
                <div className="w-full flex flex-col items-center gap-4 {S}gap-2">
'''),
 ('className="flex items-center gap-3 rounded-2xl border-3 px-3 py-2"', f'className="flex items-center gap-3 rounded-2xl border-3 px-3 py-2 {S}py-1 {S}gap-2"'),
]
for a, b in R:
    assert a in s, a[:60]
    s = s.replace(a, b, 1)
open(p, 'w').write(s)
print('ok')
