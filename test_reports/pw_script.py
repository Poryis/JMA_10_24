import json

page.on("console", lambda msg: print(f"CONSOLE[{msg.type}]: {msg.text}") if msg.type in ("error","warning") else None)

BASE = "https://jma-music-academy--3kmrs26q.preview.emergentagent.com/#"

async def setup(p, viewport, coarse=False):
    await p.set_viewport_size(viewport)
    if coarse:
        await p.add_init_script("""
        (() => {
          const orig = window.matchMedia;
          window.matchMedia = (q) => {
            if (String(q).includes('coarse')) {
              return { matches: true, media:q, onchange:null, addListener:()=>{}, removeListener:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{}, dispatchEvent:()=>false };
            }
            return orig ? orig(q) : { matches:false, media:q, onchange:null, addListener:()=>{}, removeListener:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{}, dispatchEvent:()=>false };
          };
        })();
        """)
    await p.add_init_script("""
    try {
      localStorage.setItem('jma_unlock_all_v1','1');
      localStorage.setItem('jma_reveal_seen_v1','1');
      localStorage.setItem('jma_player_name_skipped_v1','1');
      sessionStorage.setItem('jma_portrait_ok_v1','1');
    } catch(e){}
    """)

async def dismiss(p):
    await p.wait_for_timeout(500)
    try:
        await p.mouse.click(10,10)
    except: pass
    try:
        btns = await p.query_selector_all("button, a")
        for b in btns:
            try:
                txt = (await b.text_content() or "").strip()
                if "add my name later" in txt.lower():
                    await b.click(force=True)
                    break
            except: pass
    except: pass
    try:
        od = await p.query_selector('[data-testid*="orientation-dismiss"]')
        if od: await od.click(force=True)
    except: pass
    await p.wait_for_timeout(400)

results = {}

# TEST 1: Phone Jukebox
print("\n===== TEST 1: Phone Jukebox =====")
await setup(page, {"width":844,"height":390})
await page.goto(f"{BASE}/home", wait_until="domcontentloaded")
await dismiss(page)
await page.goto(f"{BASE}/rhythm-game", wait_until="domcontentloaded")
await page.wait_for_timeout(1500)
await dismiss(page)
await page.wait_for_timeout(600)

info = await page.evaluate("""() => {
  const fs = document.querySelector('.fit-stage, [data-fit-stage]');
  const bells = Array.from(document.querySelectorAll('.rhythm-lane .instrument-frame-idle'));
  const bellBoxes = bells.map(b => { const r=b.getBoundingClientRect(); return {t:r.top,b:r.bottom,l:r.left,r:r.right,w:r.width,h:r.height}; });
  const target = document.querySelector('.lane-target');
  const titlePill = document.querySelector('.game-title-pill');
  const board = document.querySelector('.rhythm-board');
  const backBtn = Array.from(document.querySelectorAll('button,a')).find(e=>(e.textContent||'').trim().toUpperCase()==='BACK');
  return {
    hasFitStage: !!fs,
    bellCount: bells.length,
    bellBoxes,
    maxBellBottom: bellBoxes.length ? Math.max(...bellBoxes.map(b=>b.b)) : null,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    targetBox: target ? target.getBoundingClientRect() : null,
    titlePillShown: titlePill ? getComputedStyle(titlePill).display !== 'none' : false,
    backBtnVisible: !!backBtn && !!backBtn.offsetParent,
    boardRect: board ? {top:board.getBoundingClientRect().top, bottom:board.getBoundingClientRect().bottom, h:board.getBoundingClientRect().height} : null,
  };
}""")
print("Jukebox info:", json.dumps(info, indent=2, default=str))

# Start the game
try:
    for text in ["Play One, Skip One","Start","Begin","Play"]:
        btns = await page.query_selector_all("button")
        for b in btns:
            try:
                t = (await b.text_content() or "").strip()
                if t == text and await b.is_visible():
                    await b.click(force=True)
                    print(f"Clicked {text}")
                    await page.wait_for_timeout(1800)
                    raise StopIteration
            except StopIteration:
                raise
            except: pass
except StopIteration: pass
except: pass

note_info = await page.evaluate("""() => {
  const notes = Array.from(document.querySelectorAll('.falling-note, [class*="falling-note"], .rhythm-note, [class*="rhythm-note"]'));
  const board = document.querySelector('.rhythm-board');
  return {
    noteCount: notes.length,
    firstNoteTop: notes.length ? notes[0].getBoundingClientRect().top : null,
    boardTop: board ? board.getBoundingClientRect().top : null,
  };
}""")
results["jukebox_phone"] = {**info, **note_info}
print("Notes:", json.dumps(note_info, indent=2))

try:
    bell = await page.query_selector('.rhythm-lane .instrument-frame-idle')
    if bell:
        await bell.click(force=True)
        await page.wait_for_timeout(400)
        print("Tapped bell OK")
except Exception as e:
    print("Bell tap error:", e)

# TEST 2: Detective
print("\n===== TEST 2: Detective Phone =====")
await page.goto(f"{BASE}/detective", wait_until="domcontentloaded")
await page.wait_for_timeout(1200)
await dismiss(page)
det = await page.evaluate("""() => {
  const fs = document.querySelector('.fit-stage, [data-fit-stage]');
  const inner = document.querySelector('.fit-stage-inner');
  const firstChild = inner ? inner.firstElementChild : null;
  return {
    hasFitStage: !!fs,
    fitStageScale: fs ? fs.getAttribute('data-scale') : null,
    innerFirstChildBottom: firstChild ? firstChild.getBoundingClientRect().bottom : null,
    innerFirstChildMinHeight: firstChild ? getComputedStyle(firstChild).minHeight : null,
    innerHeight: window.innerHeight,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
}""")
await page.screenshot(path="/app/test_reports/detective_phone.png", quality=40, full_page=False)
results["detective_phone"] = det
print(json.dumps(det, indent=2, default=str))

# TEST 3: Robot Boogie
print("\n===== TEST 3: Robot Boogie Phone =====")
await page.goto(f"{BASE}/robot-boogie", wait_until="domcontentloaded")
await page.wait_for_timeout(1200)
await dismiss(page)
rb = await page.evaluate("""() => {
  const fs = document.querySelector('.fit-stage, [data-fit-stage]');
  const inner = document.querySelector('.fit-stage-inner');
  const titlePill = document.querySelector('.game-title-pill');
  return {
    hasFitStage: !!fs,
    scale: fs ? parseFloat(fs.getAttribute('data-scale')) : null,
    overflow: inner ? inner.scrollHeight - inner.clientHeight : null,
    titleShown: titlePill ? getComputedStyle(titlePill).display !== 'none' : false,
  };
}""")
try:
    pre = await page.evaluate("document.querySelectorAll('[data-testid*=\"stage-robot\"], .stage-robot, [data-testid*=\"robot-on\"]').length")
    members = await page.query_selector_all('[data-testid*="club-member"], .club-member, [data-testid*="member"]')
    if members:
        await members[0].click(force=True)
        await page.wait_for_timeout(800)
    post = await page.evaluate("document.querySelectorAll('[data-testid*=\"stage-robot\"], .stage-robot, [data-testid*=\"robot-on\"]').length")
    rb["pre"] = pre; rb["post"] = post; rb["robot_added"] = post > pre
except Exception as e:
    rb["err"] = str(e)
results["robot_boogie"] = rb
print(json.dumps(rb, indent=2, default=str))

# TEST 4: Campus
print("\n===== TEST 4: Campus Phone =====")
await page.goto(f"{BASE}/campus?zone=play", wait_until="domcontentloaded")
await page.wait_for_timeout(1500)
await dismiss(page)
cam = await page.evaluate("""() => {
  const bldg = document.querySelector('[data-testid="campus-building-jelly-jukebox"]');
  const you = document.querySelector('[data-testid="campus-you"]');
  const leftSign = document.querySelector('[data-testid="campus-sign-left"]');
  const keepTitle = document.querySelector('.keep-title');
  const bb = (el) => el ? { l:el.getBoundingClientRect().left, r:el.getBoundingClientRect().right, t:el.getBoundingClientRect().top, b:el.getBoundingClientRect().bottom, w:el.getBoundingClientRect().width, h:el.getBoundingClientRect().height } : null;
  const bbRaw = (el) => el ? el.getBoundingClientRect() : null;
  const a = bbRaw(leftSign), b2 = bbRaw(you);
  const intersect = a && b2 && !(a.right<b2.left||a.left>b2.right||a.bottom<b2.top||a.top>b2.bottom);
  return {
    buildingWidth: bb(bldg)?.w,
    youBox: bb(you),
    leftSignBox: bb(leftSign),
    signYouOverlap: !!intersect,
    titleVisible: !!keepTitle && getComputedStyle(keepTitle).display !== 'none',
    keepTitleText: keepTitle ? keepTitle.textContent.trim() : null,
  };
}""")
results["campus"] = cam
print(json.dumps(cam, indent=2, default=str))

# TEST 5: Fun Facts (coarse pointer) - new page
print("\n===== TEST 5: Fun Facts Phone + coarse =====")
context = page.context
page2 = await context.new_page()
page2.on("console", lambda msg: print(f"CONSOLE2[{msg.type}]: {msg.text}") if msg.type=="error" else None)
await setup(page2, {"width":844,"height":390}, coarse=True)
await page2.goto(f"{BASE}/home", wait_until="domcontentloaded")
await dismiss(page2)
await page2.goto(f"{BASE}/fun-facts", wait_until="domcontentloaded")
await page2.wait_for_timeout(1500)
await dismiss(page2)
try:
    btns = await page2.query_selector_all("button")
    for b in btns:
        t = (await b.text_content() or "")
        if "find them" in t.lower():
            await b.click(force=True)
            break
except: pass
await page2.wait_for_timeout(700)

ff = await page2.evaluate("""() => {
  const fs = document.querySelector('.fit-stage, [data-fit-stage]');
  const scroller = document.querySelector('.funfacts-scene-scroller');
  const scene = document.querySelector('.funfacts-scene');
  const pad = document.querySelector('.funfacts-scroller-pad');
  const porthole = document.querySelector('.porthole-frame');
  const chars = Array.from(document.querySelectorAll('[data-testid^="funfacts-character-"]'));
  return {
    hasFitStage: !!fs,
    scrollerExists: !!scroller,
    scrollerScrollW: scroller?.scrollWidth,
    scrollerClientW: scroller?.clientWidth,
    scrollerScrollH: scroller?.scrollHeight,
    scrollerClientH: scroller?.clientHeight,
    sceneWidth: scene?.getBoundingClientRect().width,
    sceneClasses: scene?.className,
    padExists: !!pad,
    docScrollH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
    porthole: !!porthole,
    portholeDisplay: porthole ? getComputedStyle(porthole).display : null,
    charCount: chars.length,
    charIds: chars.map(c=>c.getAttribute('data-testid')),
  };
}""")
results["funfacts"] = ff
print(json.dumps(ff, indent=2, default=str))

reach = await page2.evaluate("""() => {
  const scroller = document.querySelector('.funfacts-scene-scroller');
  if (!scroller) return null;
  const chars = Array.from(document.querySelectorAll('[data-testid^="funfacts-character-"]'));
  const cx = scroller.clientWidth/2;
  const cy = scroller.clientHeight/2;
  const maxScrollX = scroller.scrollWidth - scroller.clientWidth;
  const maxScrollY = scroller.scrollHeight - scroller.clientHeight;
  return chars.map(c => {
    const r = c.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    const relCx = (r.left - sr.left) + scroller.scrollLeft + r.width/2;
    const relCy = (r.top - sr.top) + scroller.scrollTop + r.height/2;
    const desiredScrollX = relCx - cx;
    const desiredScrollY = relCy - cy;
    const clampedX = Math.max(0, Math.min(maxScrollX, desiredScrollX));
    const clampedY = Math.max(0, Math.min(maxScrollY, desiredScrollY));
    const residualX = desiredScrollX - clampedX;
    const residualY = desiredScrollY - clampedY;
    const dist = Math.hypot(residualX, residualY);
    return {id: c.getAttribute('data-testid'), dist, reachable: dist<=120};
  });
}""")
results["funfacts_reach"] = reach
print("Reach:", json.dumps(reach, indent=2))

# Click all 7
for i in range(10):
    chars = await page2.query_selector_all('[data-testid^="funfacts-character-"]')
    if not chars: break
    tid = await chars[0].get_attribute('data-testid')
    await page2.evaluate("""(sel) => {
      const c = document.querySelector(sel);
      const s = document.querySelector('.funfacts-scene-scroller');
      if (c && s) {
        const sr = s.getBoundingClientRect(); const r = c.getBoundingClientRect();
        s.scrollLeft += (r.left - sr.left) - (s.clientWidth/2 - r.width/2);
        s.scrollTop += (r.top - sr.top) - (s.clientHeight/2 - r.height/2);
      }
    }""", f'[data-testid="{tid}"]')
    await page2.wait_for_timeout(250)
    try:
        await page2.click(f'[data-testid="{tid}"]', force=True)
    except Exception as e:
        print("click err", tid, e)
        break
    await page2.wait_for_timeout(600)
    # dismiss modal
    try:
        btns = await page2.query_selector_all("button")
        for b in btns:
            t = (await b.text_content() or "").strip().lower()
            if t in ("got it!","close","awesome!","cool!","ok","next","got it"):
                if await b.is_visible():
                    await b.click(force=True)
                    break
    except: pass
    await page2.wait_for_timeout(400)

final_ff = await page2.evaluate("""() => {
  const scene = document.querySelector('.funfacts-scene');
  const porthole = document.querySelector('.porthole-frame');
  return {
    sceneClasses: scene?.className,
    sceneHasWFull: !!scene?.classList.contains('w-full'),
    portholeExists: !!porthole,
    portholeHidden: !porthole || getComputedStyle(porthole).display==='none' || porthole.offsetParent===null,
  };
}""")
results["funfacts_final"] = final_ff
print("final funfacts:", json.dumps(final_ff, indent=2))

# TEST 6: Free Play phone
print("\n===== TEST 6: Free Play Phone =====")
await page.goto(f"{BASE}/free-play", wait_until="domcontentloaded")
await page.wait_for_timeout(1200)
await dismiss(page)

jam = await page.evaluate("""() => {
  const fs = document.querySelector('.fit-stage, [data-fit-stage]');
  const hint = document.querySelector('.jam-controls-hint');
  const hintTextFound = Array.from(document.querySelectorAll('*')).some(e => (e.textContent||'').trim().startsWith('Controls:') && e.children.length===0);
  return {
    hasFitStage: !!fs,
    hintEl: !!hint,
    hintVisible: hint ? getComputedStyle(hint).display!=='none' : false,
    hintTextFound,
    innerH: window.innerHeight,
    docSH: document.documentElement.scrollHeight,
  };
}""")
bells = await page.evaluate("""() => {
  const row = document.querySelector('.jelly-bells-row, [data-testid="jelly-bells-row"]');
  return {
    rowWidth: row ? row.getBoundingClientRect().width : null,
    rowExists: !!row,
    docSH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
  };
}""")
# Click Guitar tab
try:
    btns = await page.query_selector_all("button")
    for b in btns:
        t = (await b.text_content() or "").strip()
        if t.lower() == "guitar" and await b.is_visible():
            await b.click(force=True)
            await page.wait_for_timeout(700)
            break
except: pass
guitar = await page.evaluate("""() => {
  const g = document.querySelector('.guitar-instrument, [data-testid="guitar-instrument"]');
  const bend = document.querySelector('.bend-bar, [data-testid*="bend"]');
  const frets = document.querySelectorAll('.fret-button, [data-testid*="fret"]');
  return {
    guitarExists: !!g,
    guitarBottom: g ? g.getBoundingClientRect().bottom : null,
    bendExists: !!bend,
    bendBottom: bend ? bend.getBoundingClientRect().bottom : null,
    fretCount: frets.length,
    innerH: window.innerHeight,
    docSH: document.documentElement.scrollHeight,
  };
}""")
try:
    btns = await page.query_selector_all("button")
    for b in btns:
        t = (await b.text_content() or "").strip()
        if t.lower() == "xylophone" and await b.is_visible():
            await b.click(force=True)
            await page.wait_for_timeout(600)
            break
except: pass
xyl = await page.evaluate("""() => {
  const x = document.querySelector('.xylophone, [data-testid*="xylophone"]');
  return { xylExists: !!x };
}""")
results["freeplay"] = {**jam, "bells": bells, "guitar": guitar, "xyl": xyl}
print(json.dumps(results["freeplay"], indent=2, default=str))

# TEST 7: Desktop
print("\n===== TEST 7: Desktop 1280x800 =====")
page3 = await context.new_page()
await setup(page3, {"width":1280,"height":800})
await page3.goto(f"{BASE}/home", wait_until="domcontentloaded")
await dismiss(page3)

await page3.goto(f"{BASE}/rhythm-game", wait_until="domcontentloaded")
await page3.wait_for_timeout(1200)
await dismiss(page3)
desk_r = await page3.evaluate("""() => {
  const lanes = Array.from(document.querySelectorAll('.rhythm-lane'));
  const bells = Array.from(document.querySelectorAll('.rhythm-lane .instrument-frame-idle'));
  const fs = document.querySelector('.fit-stage,[data-fit-stage]');
  const titlePill = document.querySelector('.game-title-pill');
  return {
    hasFitStage: !!fs,
    laneMinHeights: lanes.map(l => parseFloat(getComputedStyle(l).minHeight) || l.getBoundingClientRect().height),
    bellHeights: bells.map(b => b.getBoundingClientRect().height),
    titleVisible: titlePill ? getComputedStyle(titlePill).display !== 'none' : false,
  };
}""")

await page3.goto(f"{BASE}/free-play", wait_until="domcontentloaded")
await page3.wait_for_timeout(1000)
await dismiss(page3)
desk_f = await page3.evaluate("""() => {
  const fs = document.querySelector('.fit-stage,[data-fit-stage]');
  const hint = document.querySelector('.jam-controls-hint');
  const hintTextFound = Array.from(document.querySelectorAll('*')).some(e => (e.textContent||'').trim().startsWith('Controls:') && e.children.length===0);
  return {
    hasFitStage: !!fs,
    hintVisible: hint ? getComputedStyle(hint).display!=='none' : false,
    hintTextFound,
  };
}""")

await page3.goto(f"{BASE}/fun-facts", wait_until="domcontentloaded")
await page3.wait_for_timeout(1500)
await dismiss(page3)
try:
    btns = await page3.query_selector_all("button")
    for b in btns:
        t = (await b.text_content() or "")
        if "find them" in t.lower():
            await b.click(force=True)
            break
except: pass
await page3.wait_for_timeout(500)
desk_ff = await page3.evaluate("""() => {
  const fs = document.querySelector('.fit-stage,[data-fit-stage]');
  const scroller = document.querySelector('.funfacts-scene-scroller');
  const scene = document.querySelector('.funfacts-scene');
  const porthole = document.querySelector('.desktop-porthole, .porthole-frame');
  const spyglass = document.querySelector('.spyglass, [class*="spyglass"]');
  return {
    hasFitStage: !!fs,
    hasScroller: !!scroller,
    sceneClasses: scene?.className,
    sceneWFull: !!scene?.classList.contains('w-full'),
    portholeVisible: porthole ? getComputedStyle(porthole).display!=='none' : false,
    spyglassExists: !!spyglass,
    docSH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
  };
}""")
results["desktop"] = {"rhythm": desk_r, "freeplay": desk_f, "funfacts": desk_ff}
print(json.dumps(results["desktop"], indent=2, default=str))

# TEST 8: Portrait
print("\n===== TEST 8: Portrait 390x844 =====")
page4 = await context.new_page()
await setup(page4, {"width":390,"height":844})
await page4.goto(f"{BASE}/home", wait_until="domcontentloaded")
await page4.wait_for_timeout(800)
await dismiss(page4)

await page4.goto(f"{BASE}/fun-facts", wait_until="domcontentloaded")
await page4.wait_for_timeout(1500)
await dismiss(page4)
try:
    btns = await page4.query_selector_all("button")
    for b in btns:
        t = (await b.text_content() or "")
        if "find them" in t.lower():
            await b.click(force=True)
            break
except: pass
await page4.wait_for_timeout(400)
p_ff = await page4.evaluate("""() => {
  const scene = document.querySelector('.funfacts-scene');
  const fs = document.querySelector('.fit-stage,[data-fit-stage]');
  const scroller = document.querySelector('.funfacts-scene-scroller');
  return { sceneWidth: scene?.getBoundingClientRect().width, hasFitStage: !!fs, scrollerExists: !!scroller };
}""")
await page4.goto(f"{BASE}/rhythm-game", wait_until="domcontentloaded")
await page4.wait_for_timeout(1200)
await dismiss(page4)
p_r = await page4.evaluate("""() => {
  const fs = document.querySelector('.fit-stage,[data-fit-stage]');
  const bells = Array.from(document.querySelectorAll('.rhythm-lane .instrument-frame-idle'));
  return { hasFitStage: !!fs, bellHeights: bells.map(b=>b.getBoundingClientRect().height) };
}""")
results["portrait"] = {"funfacts": p_ff, "rhythm": p_r}
print(json.dumps(results["portrait"], indent=2, default=str))

print("\n===== ALL RESULTS =====")
print(json.dumps(results, indent=2, default=str))
