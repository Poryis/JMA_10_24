"""Verify shared crop contains every animation frame's nontransparent art."""
import json
from pathlib import Path
from PIL import Image

results=[]
for path in sorted(Path('/app/frontend/public/assets/animations/stew-drum').glob('*.png')):
    image=Image.open(path).convert('RGBA')
    box=image.getchannel('A').getbbox()
    intact=box[0]>=607 and box[1]>=0 and box[2]<=1423 and box[3]<=1070
    results.append({'frame':path.name,'original':image.size,'alpha_bounds':box,'crop_intact':intact})
    print(path.name,box,'PASS' if intact else 'FAIL')
Path('/app/test_reports/boom_sprite_results.json').write_text(json.dumps(results,indent=2))
assert len(results)==8 and all(item['crop_intact'] for item in results)