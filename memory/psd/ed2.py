p='/app/frontend/src/pages/ShredLegendPage.js'
s=open(p).read()
a=s.index("const LIGHT_PALETTES = {")
a=s.rindex("\n\n", 0, a)+2
b=s.index("export default function ShredLegendPage()")
print(repr(s[a:a+120])); print(repr(s[b-60:b]))
s=s[:a]+s[b:]
s=s.replace('data-testid="shred-result-card"\n              className="max-w-md w-full text-center rounded-3xl px-6 py-7"','data-testid="shred-result-card"\n              className="max-w-md w-full text-center rounded-3xl px-6 py-7 pointer-events-auto"',1)
open(p,'w').write(s)
