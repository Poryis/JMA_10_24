p='/app/frontend/src/pages/ShredLegendPage.js'
s=open(p).read()
old_start=s.index("      style={{\n        backgroundImage: 'url(assets/backgrounds/shred-stage-jma.png)',")
old_end=s.index("      <GameHeader title=\"SHRED CITY\"")
s=s[:old_start]+"""      style={{ backgroundColor: '#8A8F96' }}
    >
      <ShredStage band={band} active={screen === 'playing' || screen === 'encore'} energy={screen === 'encore' ? 1 : energy} hitPulse={hitPulse} interactive={screen === 'intro' || screen === 'result'} />

"""+s[old_end:]
s=s.replace('<main className="shred-main relative z-10 flex-1 flex flex-col items-center justify-end pt-16 pb-2 px-2">','<main className="shred-main relative z-10 flex-1 flex flex-col items-center justify-end pt-16 pb-2 px-2 pointer-events-none">',1)
s=s.replace('className="shred-intro-card max-w-md w-full text-center rounded-3xl px-6 py-7 relative"','className="shred-intro-card max-w-md w-full text-center rounded-3xl px-6 py-7 relative pointer-events-auto"',1)
s=s.replace('<div className="shred-playing w-full max-w-[900px] flex-1 flex flex-col items-center gap-2"','<div className="shred-playing w-full max-w-[900px] flex-1 flex flex-col items-center gap-2 pointer-events-auto"',1)
s=s.replace("import FitBox from '../components/FitBox';","import FitBox from '../components/FitBox';\nimport ShredStage from '../components/ShredStage';",1)
open(p,'w').write(s)
print(s.count('StageLights'))
