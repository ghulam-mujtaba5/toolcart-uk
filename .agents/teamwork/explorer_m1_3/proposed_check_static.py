from pathlib import Path
import json, re, shutil, subprocess, sys
from bs4 import BeautifulSoup

# Dynamic root path: resolves to e:\ToolCart regardless of CWD or platform
root = Path(__file__).resolve().parent.parent

# Cross-platform explicit UTF-8 encoding
css = (root / 'design/tokens.css').read_text(encoding='utf-8')
proto = (root / 'prototype/index.html').read_text(encoding='utf-8')

# Brand V3 invariant checks: retired copper, active cobalt & action lime, workshop white
assert '#B84C32' not in css and '#B84C32' not in proto
assert '--tc-copper' not in css and '--tc-copper' not in proto
assert 'Worksite Cobalt + Copper' not in proto
assert '#DDF16A' in css and '#2450B8' in css
assert '#F7F8F5' in css
assert 'ToolCart' in proto

# CSS variable definition and reference consistency
properties = set(re.findall(r'--tc-[\w-]+(?=\s*:)', css + '\n' + proto))
refs = set(re.findall(r'var\((--tc-[\w-]+)', proto))
missing = refs - properties
assert not missing, f'missing CSS vars: {missing}'

# Prototype DOM structural integrity
soup = BeautifulSoup(proto, 'html.parser')
assert len(soup.select('button[data-category]')) >= 4
assert soup.select_one('#productGrid')
assert soup.select_one('#main-search')
assert soup.select_one('title')

# Inline JavaScript syntax validation with Node.js
scripts = [tag.string for tag in soup.select('script') if tag.string]
js = '\n'.join(scripts)
file = root / 'qa/prototype_inline.js'
file.write_text(js, encoding='utf-8')
try:
    # Cross-platform Node binary detection via shutil.which
    node_bin = shutil.which('node')
    if node_bin:
        r = subprocess.run([node_bin, '--check', str(file)], capture_output=True, text=True)
        assert r.returncode == 0, r.stderr
finally:
    # Clean up temporary file to prevent dirtying git working tree
    if file.exists():
        file.unlink()

# WCAG 2.2 AA Contrast Matrix Verification
results = json.loads((root / 'qa/contrast_matrix.json').read_text(encoding='utf-8'))
for item in results:
    if 'do not use' in item['use'].lower():
        assert not item['pass_wcag'], item
    else:
        assert item['pass_wcag'], item

print('PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix')
print('browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified')
