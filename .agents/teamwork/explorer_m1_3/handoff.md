# Handoff Report: QA Scripts & Automated Brand Compliance Testing Strategy

- **Author**: Explorer M1 (Instance 3) (`explorer_m1_3`)
- **Date**: 2026-10-12
- **Milestone**: M1 (Foundation & Brand V3 Design System)
- **Scope**: Static QA validation (`qa/check_static.py`), contrast matrix analysis (`qa/contrast_matrix.*`), cross-platform Windows fix, and automated Brand V3 compliance test architecture (Vitest & pytest).

---

## 1. Observation

### 1.1 Verbatim Code & Structure of `qa/check_static.py`
The existing repository script at `qa/check_static.py` (lines 1–34) contains:

```python
1: from pathlib import Path
2: import json,re,subprocess,sys
3: from bs4 import BeautifulSoup
4: root=Path('/mnt/data/toolcart_v3_work')
5: css=(root/'design/tokens.css').read_text()
6: proto=(root/'prototype/index.html').read_text()
7: assert '#B84C32' not in css and '#B84C32' not in proto
8: assert '--tc-copper' not in css and '--tc-copper' not in proto
9: assert 'Worksite Cobalt + Copper' not in proto
10: assert '#DDF16A' in css and '#2450B8' in css
11: assert '#F7F8F5' in css
12: assert 'ToolCart' in proto
13: properties=set(re.findall(r'--tc-[\w-]+(?=\s*:)',css+'\n'+proto))
14: refs=set(re.findall(r'var\((--tc-[\w-]+)',proto))
15: missing=refs-properties
16: assert not missing, f'missing CSS vars: {missing}'
17: soup=BeautifulSoup(proto,'html.parser')
18: assert len(soup.select('button[data-category]'))>=4
19: assert soup.select_one('#productGrid')
20: assert soup.select_one('#main-search')
21: assert soup.select_one('title')
22: scripts=[tag.string for tag in soup.select('script') if tag.string]
23: js='\n'.join(scripts)
24: file=root/'qa/prototype_inline.js';file.write_text(js)
25: if subprocess.call(['which','node'],stdout=subprocess.DEVNULL)==0:
26:  r=subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
27:  assert r.returncode==0, r.stderr
28: results=json.loads((root/'qa/contrast_matrix.json').read_text())
29: for item in results:
30:  if 'do not use' in item['use'].lower(): assert not item['pass_wcag'],item
31:  else: assert item['pass_wcag'],item
32: print('PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix')
33: print('browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified')
```

### 1.2 Direct Reproduction of Runtime Failures on Windows
When executing `python qa/check_static.py` on the target Windows environment (`pwsh` in `e:\ToolCart`):

1. **Hardcoded Root Path Failure**:
   ```
   Traceback (most recent call last):
     File "E:\ToolCart\qa\check_static.py", line 5, in <module>
       css=(root/'design/tokens.css').read_text()
     File "pathlib.py", line 1027, in read_text
       with self.open(mode='r', encoding=encoding, errors=errors) as f:
     File "pathlib.py", line 1013, in open
       return io.open(self, mode, buffering, encoding, errors, newline)
   FileNotFoundError: [Errno 2] No such file or directory: '\\mnt\\data\\toolcart_v3_work\\design\\tokens.css'
   ```
   **Observation**: `root = Path('/mnt/data/toolcart_v3_work')` is an absolute Linux path from an initial sandbox and completely fails in `e:\ToolCart`.

2. **POSIX `which` Command Failure on Windows**:
   When testing line 25 (`subprocess.call(['which', 'node'])`) in Python:
   ```
   Traceback (most recent call last):
     File "<string>", line 1, in <module>
     File "subprocess.py", line 389, in call
       with Popen(*popenargs, **kwargs) as p:
     File "subprocess.py", line 1026, in __init__
       self._execute_child(...)
     File "subprocess.py", line 1538, in _execute_child
       hp, ht, pid, tid = _winapi.CreateProcess(...)
   FileNotFoundError: [WinError 2] The system cannot find the file specified
   ```
   **Observation**: Windows does not have a native `which` binary; calling `['which', 'node']` raises an unhandled `FileNotFoundError` rather than returning a non-zero exit code.
   Conversely, testing `shutil.which('node')` succeeds immediately:
   ```
   C:\Program Files\nodejs\node.EXE
   ```

3. **Platform Default Encoding Risk**:
   `read_text()` and `write_text()` without `encoding='utf-8'` default to system locale (CP1252/ANSI on Windows). If files contain non-ASCII characters (e.g. `£`, `—`, `’`, `Ø`), Python raises `UnicodeDecodeError`.

4. **Temporary File Leak**:
   Line 24 writes `qa/prototype_inline.js` but never removes it, leaving an untracked scratch artifact in the repository.

### 1.3 Analysis of `qa/contrast_matrix.json` and `qa/contrast_matrix.csv`
Both files define 19 color pairings:
- **15 Approved Pairings** (`pass_wcag: true`):
  1. Headings: `#182336` (Ink) on `#FFFFFF` (White) -> Ratio: 15.76 (threshold 4.5)
  2. Body on canvas: `#252D30` (Graphite) on `#F7F8F5` (Workshop White) -> Ratio: 13.16 (threshold 4.5)
  3. Primary CTA: `#FFFFFF` on `#2450B8` (Cobalt) -> Ratio: 7.21 (threshold 4.5)
  4. Cobalt hover: `#FFFFFF` on `#193F99` (Cobalt Deep) -> Ratio: 9.49 (threshold 4.5)
  5. Lime accent CTA: `#182336` (Ink) on `#DDF16A` (Action Lime) -> Ratio: 12.66 (threshold 4.5)
  6. Secondary text on pure white: `#66767A` (Steel Grey) on `#FFFFFF` -> Ratio: 4.73 (threshold 4.5)
  7. Secondary text on workshop: `#596B70` (Steel Text) on `#F7F8F5` -> Ratio: 5.24 (threshold 4.5)
  8. Secondary text on AI panel: `#596B70` (Steel Text) on `#EAF0FF` (Cloud Blue) -> Ratio: 4.89 (threshold 4.5)
  9. Ink on AI panel: `#182336` on `#EAF0FF` (Cloud Blue) -> Ratio: 13.81 (threshold 4.5)
  10. Amber warnings on canvas: `#B45309` on `#F7F8F5` -> Ratio: 4.71 (threshold 4.5)
  11. Success on white: `#176447` on `#FFFFFF` -> Ratio: 7.12 (threshold 4.5)
  12. Error on white: `#B42318` on `#FFFFFF` -> Ratio: 6.57 (threshold 4.5)
  13. Strong border on cloud: `#7C8A94` on `#EAF0FF` -> Ratio: 3.11 (threshold 3.0)
  14. Strong border on white: `#7C8A94` on `#FFFFFF` -> Ratio: 3.55 (threshold 3.0)
  15. Focus ring cobalt on white: `#2450B8` on `#FFFFFF` -> Ratio: 7.21 (threshold 3.0)

- **4 Prohibited Pairings** (`pass_wcag: false`):
  16. Lime alone on white (do not use): `#DDF16A` on `#FFFFFF` -> Ratio: 1.25 (threshold 3.0) -> FAILS (requires 2px dark outline)
  17. Steel Grey on canvas (do not use): `#66767A` on `#F7F8F5` -> Ratio: 4.44 (threshold 4.5) -> FAILS AA body text
  18. Steel Grey on Cloud (do not use): `#66767A` on `#EAF0FF` -> Ratio: 4.15 (threshold 4.5) -> FAILS AA body text
  19. White on Lime (do not use): `#FFFFFF` on `#DDF16A` -> Ratio: 1.25 (threshold 4.5) -> SEVERE FAILS AA body text

### 1.4 Authoritative Brand Directives
- `docs/02_BRAND_IDENTITY.md:30`: `"Main purchase CTA: cobalt with white text (7.21:1). Lime accents: Ink text (12.66:1); lime action on white requires a dark 2px outline. Never use white text on lime (1.25:1). Do not use Steel Grey as ordinary body text on off-white or pale-blue surfaces (fails AA 4.5:1)."`
- `docs/02_BRAND_IDENTITY.md:33`: `"Copper #B84C32 is removed; no purple, violet, lavender, teal-as-brand, AI-neon gradients or invented extra hues."`
- `design/tokens.css:1`: `/* ToolCart brand v3 | single source of truth | no copper/purple/teal. */`
- `design/tokens.css:33`: `.tc-btn-accent {background:var(--tc-action-lime);color:var(--tc-ink);border:2px solid var(--tc-ink)}`
- `design/tokens.json:53-60`: Prohibitions list documents `"Copper #B84C32"`, `"purple and violet hues"`, `"teal-branding"`, `"white text on lime"`.

---

## 2. Logic Chain

### 2.1 Patch Architecture for `qa/check_static.py`
1. **Dynamic Root Resolution**:
   `qa/check_static.py` is located in `<project_root>/qa/check_static.py`.
   `Path(__file__).resolve().parent.parent` resolves to `<project_root>` on all platforms regardless of the current working directory from which python is invoked.
2. **UTF-8 Portability**:
   Replacing `.read_text()` with `.read_text(encoding='utf-8')` and `.write_text(..., encoding='utf-8')` prevents Windows locale encoding crashes.
3. **Cross-Platform Node.js Check**:
   Replacing `subprocess.call(['which', 'node'])` with Python standard library `shutil.which('node')` natively resolves `node.exe` on Windows or `node` on POSIX without spawning a shell or raising `FileNotFoundError`.
4. **Clean Workspace Isolation**:
   Wrapping Node.js syntax verification in a `try...finally` block ensuring `file.unlink(missing_ok=True)` deletes `qa/prototype_inline.js`.

### 2.2 Brand Compliance Test Suite Design
1. **Scope of Code Scanning**:
   Scans all frontend source files (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html`) in:
   - `src/` and `app/` (Next.js components, routes, styles)
   - `components/` and `styles/`
   - `design/` (`tokens.css`)
   - `prototype/` (`index.html`)
   - `public/` (SVGs, static HTML)
   - `tailwind.config.*`
   Excludes:
   - `node_modules`, `.next`, `.git`, `.agents`, `dist`, `coverage`
   - Test definition files themselves and historical documentation notes
2. **Comment Stripping to Prevent False Positives**:
   Observation 1.4 noted `design/tokens.css` contains `/* ... no copper/purple/teal. */`. If tests do a raw regex search for `purple` or `teal`, line 1 triggers a false-positive failure. Therefore, the scanner strips block (`/* ... */`) and line (`// ...`) comments before asserting zero prohibited color names.
3. **Prohibition 1: Retired Copper**:
   - Zero occurrences of `#B84C32` (case-insensitive)
   - Zero occurrences of `--tc-copper`
   - Zero occurrences of `"Worksite Cobalt + Copper"`
   - `design/tokens.json` `palette` contains no copper or `#B84C32`
4. **Prohibition 2: Unauthorized Purple, Violet, Lavender, Teal**:
   - Zero Tailwind utility classes: `\b(text|bg|border|ring|fill|stroke|from|to|via)-(purple|violet|fuchsia|lavender|teal)(-[0-9]+)?\b`
   - Zero CSS property assignments: `:\s*[^;]*\b(purple|violet|lavender|teal)\b`
5. **Prohibition 3: Zero White Text on Action Lime (`#DDF16A`)**:
   - Mathematical proof: $Contrast(\#FFFFFF, \#DDF16A) \approx 1.25:1 < 4.5:1$ (Fails WCAG AA).
   - Ink proof: $Contrast(\#182336, \#DDF16A) \approx 12.66:1 \ge 4.5:1$ (Passes WCAG AA).
   - Markup scan: Prohibits combining `bg-action-lime` / `bg-[#DDF16A]` with `text-white` / `text-[#fff]` in JSX/TSX or CSS.
   - Enforces dark 2px outline on Action Lime buttons: `.tc-btn-accent` must have `color: var(--tc-ink)` and `border: 2px solid var(--tc-ink)`.
6. **Prohibition 4: Active Import & Integrity of `design/tokens.css`**:
   - Verifies `design/tokens.css` exists and defines all 19 required `--tc-*` tokens.
   - Verifies typography `--font-heading: 'Manrope'` and `--font-body: 'IBM Plex Sans'`.
   - Verifies global stylesheet (`app/globals.css` or `src/app/globals.css`) contains `@import` referencing `tokens.css`.
7. **Mathematical WCAG AA Contrast Matrix Verification**:
   - Programmatically recomputes the relative luminance and contrast ratios for all 19 rows in `qa/contrast_matrix.json`.
   - Confirms all 15 intended combinations pass and all 4 prohibited combinations fail.

---

## 3. Caveats

1. **Headless Browser Environment Limitation**:
   As documented in `qa/VALIDATION_RESULTS.md`, headless browser navigation to local files (`file://`) is blocked by admin security policy in the local sandbox (`ERR_BLOCKED_BY_ADMINISTRATOR`). Brand compliance is enforced via static AST/regex scanning, mathematical WCAG formulas, and Node syntax checking rather than automated headless browser rendering.
2. **`tokens.json` Prohibitions Array**:
   `design/tokens.json` contains `"prohibitions": ["Copper #B84C32", ...]`. Tests must verify that the `palette` object is free from copper, while confirming `prohibitions` explicitly lists it.
3. **Windows CLI Invocation**:
   On Windows PowerShell, `pytest` may not be in PATH if Python Scripts directory is not registered. `python -m pytest` is 100% reliable across all Windows systems and should be the documented standard.
4. **App Directory Layout Flexibility**:
   The test suite supports both `src/app/` and root `app/` conventions used by Next.js projects.

---

## 4. Conclusion

### 4.1 Exact Unified Diff Patch for `qa/check_static.py`
This patch is saved at `e:\ToolCart\.agents\teamwork\explorer_m1_3\check_static.py.patch`:

```diff
--- qa/check_static.py
+++ qa/check_static.py
@@ -1,33 +1,41 @@
 from pathlib import Path
-import json,re,subprocess,sys
+import json, re, shutil, subprocess, sys
 from bs4 import BeautifulSoup
-root=Path('/mnt/data/toolcart_v3_work')
-css=(root/'design/tokens.css').read_text()
-proto=(root/'prototype/index.html').read_text()
+
+root = Path(__file__).resolve().parent.parent
+css = (root / 'design/tokens.css').read_text(encoding='utf-8')
+proto = (root / 'prototype/index.html').read_text(encoding='utf-8')
 assert '#B84C32' not in css and '#B84C32' not in proto
 assert '--tc-copper' not in css and '--tc-copper' not in proto
 assert 'Worksite Cobalt + Copper' not in proto
 assert '#DDF16A' in css and '#2450B8' in css
 assert '#F7F8F5' in css
 assert 'ToolCart' in proto
-properties=set(re.findall(r'--tc-[\w-]+(?=\s*:)',css+'\n'+proto))
-refs=set(re.findall(r'var\((--tc-[\w-]+)',proto))
-missing=refs-properties
-assert not missing, f'missing CSS vars: {missing}'
-soup=BeautifulSoup(proto,'html.parser')
-assert len(soup.select('button[data-category]'))>=4
+properties = set(re.findall(r'--tc-[\w-]+(?=\s*:)', css + '\n' + proto))
+refs = set(re.findall(r'var\((--tc-[\w-]+)', proto))
+missing = refs - properties
+assert not missing, f'missing CSS vars: {missing}'
+soup = BeautifulSoup(proto, 'html.parser')
+assert len(soup.select('button[data-category]')) >= 4
 assert soup.select_one('#productGrid')
 assert soup.select_one('#main-search')
 assert soup.select_one('title')
-scripts=[tag.string for tag in soup.select('script') if tag.string]
-js='\n'.join(scripts)
-file=root/'qa/prototype_inline.js';file.write_text(js)
-if subprocess.call(['which','node'],stdout=subprocess.DEVNULL)==0:
- r=subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
- assert r.returncode==0, r.stderr
-results=json.loads((root/'qa/contrast_matrix.json').read_text())
+scripts = [tag.string for tag in soup.select('script') if tag.string]
+js = '\n'.join(scripts)
+file = root / 'qa/prototype_inline.js'
+file.write_text(js, encoding='utf-8')
+try:
+    node_bin = shutil.which('node')
+    if node_bin:
+        r = subprocess.run([node_bin, '--check', str(file)], capture_output=True, text=True)
+        assert r.returncode == 0, r.stderr
+finally:
+    if file.exists():
+        file.unlink()
+results = json.loads((root / 'qa/contrast_matrix.json').read_text(encoding='utf-8'))
 for item in results:
- if 'do not use' in item['use'].lower(): assert not item['pass_wcag'],item
- else: assert item['pass_wcag'],item
+    if 'do not use' in item['use'].lower():
+        assert not item['pass_wcag'], item
+    else:
+        assert item['pass_wcag'], item
 print('PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix')
 print('browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified')
```

### 4.2 Complete Drop-In Replacement File
The complete file is saved at `e:\ToolCart\.agents\teamwork\explorer_m1_3\proposed_check_static.py`.

### 4.3 Automated TypeScript/Vitest Test Suite Specification
The production Vitest test suite is created at `e:\ToolCart\.agents\teamwork\explorer_m1_3\brand_compliance.test.ts`.
Target implementation location: `tests/brand/brand-compliance.test.ts`.

Key assertions:
- `describe('1. Zero Occurrences of Retired Copper')`:
  Scans all files for `#B84C32`, `--tc-copper`, `"Worksite Cobalt + Copper"`, and validates `tokens.json`.
- `describe('2. Zero Unauthorized Purple, Violet, Lavender, or Teal')`:
  Strips comments and checks Tailwind classes and CSS rules.
- `describe('3. Zero White Text on Action Lime')`:
  Calculates contrast (proves 1.25:1 failure vs 12.66:1 Ink pass) and checks markup pairs.
- `describe('4. Active Import & Integrity of design/tokens.css')`:
  Validates all 19 `--tc-*` tokens, fonts, and application `@import`.
- `describe('5. WCAG 2.2 AA Contrast Matrix Validation')`:
  Calculates all 19 ratios against `qa/contrast_matrix.json`.
- `describe('6. Accessible Secondary Text Rules')`:
  Validates Steel Text `#596B70` on off-white surfaces vs Steel Grey `#66767A` on pure white.

### 4.4 Automated Python/pytest Test Suite Specification
The companion pytest suite is created at `e:\ToolCart\.agents\teamwork\explorer_m1_3\test_brand_compliance.py`.
Target implementation location: `tests/brand/test_brand_compliance.py`.
Status: **100% verified (9 tests passed in 0.22s)**.

### 4.5 Test Runner Commands Specification

#### Local Verification Commands (Windows & POSIX)
1. **Python Static Brand QA Check**:
   ```powershell
   python qa/check_static.py
   ```
2. **Python Pytest Brand Suite**:
   ```powershell
   python -m pytest tests/brand/test_brand_compliance.py -v
   ```
3. **Node.js Vitest Brand Test Suite**:
   ```powershell
   npm test tests/brand/brand-compliance.test.ts
   # or via npx:
   npx vitest run tests/brand/brand-compliance.test.ts
   ```
4. **Full Local Pre-Commit Quality Cycle**:
   ```powershell
   python qa/check_static.py
   npm run typecheck
   npm run lint
   npm test
   ```

#### CI Pipeline Specification (GitHub Actions Workflow)
```yaml
name: CI Quality & Brand Compliance Gate

on: [push, pull_request]

jobs:
  brand-and-qa:
    name: Brand Compliance & Static Verification
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Python QA dependencies
        run: pip install beautifulsoup4 pytest

      - name: Run check_static.py
        run: python qa/check_static.py

      - name: Run Pytest Brand Suite
        run: python -m pytest tests/brand/ -v

  frontend-build:
    name: Storefront Build, Typecheck & Vitest
    runs-on: ubuntu-latest
    needs: brand-and-qa
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run Vitest Suite (Brand & Domain)
        run: npm test -- --run

      - name: Production Build
        run: npm run build
```

---

## 5. Verification Method

To independently verify the strategy and code:

1. **Verify `check_static.py` Patched Logic**:
   Run the patched logic in PowerShell:
   ```powershell
   python -c "
   from pathlib import Path
   import json, re, shutil, subprocess
   from bs4 import BeautifulSoup
   root = Path('qa/check_static.py').resolve().parent.parent
   css = (root / 'design/tokens.css').read_text(encoding='utf-8')
   proto = (root / 'prototype/index.html').read_text(encoding='utf-8')
   assert '#B84C32' not in css and '#B84C32' not in proto
   assert '--tc-copper' not in css and '--tc-copper' not in proto
   assert 'Worksite Cobalt + Copper' not in proto
   assert '#DDF16A' in css and '#2450B8' in css
   assert '#F7F8F5' in css
   assert 'ToolCart' in proto
   properties = set(re.findall(r'--tc-[\w-]+(?=\s*:)', css + '\n' + proto))
   refs = set(re.findall(r'var\((--tc-[\w-]+)', proto))
   missing = refs - properties
   assert not missing, f'missing CSS vars: {missing}'
   soup = BeautifulSoup(proto, 'html.parser')
   assert len(soup.select('button[data-category]')) >= 4
   assert soup.select_one('#productGrid')
   assert soup.select_one('#main-search')
   assert soup.select_one('title')
   scripts = [tag.string for tag in soup.select('script') if tag.string]
   js = '\n'.join(scripts)
   file = root / 'qa/prototype_inline.js'
   file.write_text(js, encoding='utf-8')
   try:
       node_bin = shutil.which('node')
       if node_bin:
           r = subprocess.run([node_bin, '--check', str(file)], capture_output=True, text=True)
           assert r.returncode == 0, r.stderr
   finally:
       if file.exists():
           file.unlink()
   results = json.loads((root / 'qa/contrast_matrix.json').read_text(encoding='utf-8'))
   for item in results:
       if 'do not use' in item['use'].lower():
           assert not item['pass_wcag'], item
       else:
           assert item['pass_wcag'], item
   print('PASS: check_static.py verified successfully')
   "
   ```
   **Expected Output**: `PASS: check_static.py verified successfully` and exit code 0.

2. **Verify Python/pytest Brand Compliance Suite**:
   Run the test file from the agent directory:
   ```powershell
   python -m pytest e:\ToolCart\.agents\teamwork\explorer_m1_3\test_brand_compliance.py -v
   ```
   **Expected Output**: 9 passed in ~0.25s, exit code 0.

3. **Verify Contrast Mathematical Precision**:
   Run the relative luminance validator:
   ```powershell
   node -e "
   function sRGBtoLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
   function lum(hex) {
     hex = hex.replace('#', '');
     return 0.2126 * sRGBtoLin(parseInt(hex.substr(0,2),16)) + 0.7152 * sRGBtoLin(parseInt(hex.substr(2,2),16)) + 0.0722 * sRGBtoLin(parseInt(hex.substr(4,2),16));
   }
   function contrast(h1, h2) { const l1 = lum(h1), l2 = lum(h2); return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05); }
   console.log('White on Lime:', contrast('#FFFFFF', '#DDF16A').toFixed(2));
   console.log('Ink on Lime:', contrast('#182336', '#DDF16A').toFixed(2));
   "
   ```
   **Expected Output**:
   ```
   White on Lime: 1.25
   Ink on Lime: 12.66
   ```

4. **Invalidation Conditions**:
   - If any new file in `src/`, `app/`, `components/`, `styles/`, or `public/` includes `#B84C32` or `--tc-copper`, the brand compliance suite fails.
   - If any Tailwind class introduces `text-purple-*`, `bg-purple-*`, `text-violet-*`, `bg-violet-*`, `text-teal-*`, or `bg-teal-*`, the suite fails.
   - If any JSX element combines `bg-action-lime` with `text-white`, the suite fails.
   - If `design/tokens.css` is renamed or missing any of the 19 `--tc-*` tokens, the suite fails.
