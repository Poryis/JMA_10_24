p='/app/frontend/src/components/ShredStage.js'
s=open(p).read()
s=s.replace("""        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' }} data-testid="shred-beams">""","""        <div className="shred-lightrig absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ mixBlendMode: 'screen' }} data-testid="shred-beams">""",1)
i=s.index('<div className="shred-rig">')
j=s.index("        </div>\n", i)+len("        </div>\n")
s=s[:j]+"        </div>\n"+s[j:]
open(p,'w').write(s)
