import re

with open("src/constants/instruments.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Match each object in INSTRUMENT_CATALOG
blocks = re.findall(r'\{\s*symbol:\s*\'([^\']+)\'(.*?)\}', text, re.DOTALL)

for sym, body in blocks:
    cat_match = re.search(r'category:\s*\'([^\']+)\'', body)
    if not cat_match:
        continue
    cat = cat_match.group(1)
    if cat in ['indices', 'deriv_synthetics']:
        ts = re.search(r'tickSize:\s*([0-9\.]+)', body)
        tv = re.search(r'tickValue:\s*([0-9\.]+)', body)
        minl = re.search(r'minLot:\s*([0-9\.]+)', body)
        step = re.search(r'lotStep:\s*([0-9\.]+)', body)
        maxl = re.search(r'maxLot:\s*([0-9\.]+)', body)
        
        ts_v = float(ts.group(1)) if ts else None
        tv_v = float(tv.group(1)) if tv else None
        min_v = float(minl.group(1)) if minl else None
        step_v = float(step.group(1)) if step else None
        max_v = float(maxl.group(1)) if maxl else None
        
        pt_mult = tv_v / ts_v if (ts_v and tv_v) else 1.0
        print(f"{sym:26} | {cat:16} | mult: {pt_mult:5.2f} | min: {min_v} | step: {step_v} | max: {max_v}")
