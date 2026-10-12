/**
 * Brand V3 Automated Compliance & Accessibility Test Suite
 * Test Framework: Vitest / TypeScript
 *
 * Enforces:
 * 1. Zero occurrences of retired copper (#B84C32, --tc-copper, 'Worksite Cobalt + Copper')
 * 2. Zero unauthorized purple, violet, lavender, or teal
 * 3. Zero white text on Action Lime (#DDF16A) & mathematical WCAG contrast proof
 * 4. Active import and structural integrity of design/tokens.css
 * 5. Full WCAG 2.2 AA contrast matrix mathematical validation (qa/contrast_matrix.json)
 * 6. Accessible secondary text rule (Steel Text #596B70 vs Steel Grey #66767A)
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Resolve project root by walking upward until design/tokens.css is found
function findProjectRoot(startDir: string = __dirname): string {
  let cur = path.resolve(startDir);
  while (cur !== path.dirname(cur)) {
    if (fs.existsSync(path.join(cur, 'design', 'tokens.css'))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return path.resolve(startDir, '..', '..');
}

const ROOT = findProjectRoot();

// Helper to recursively collect files matching specific extensions
function getFilesRecursively(dir: string, extensions: string[], excludeDirs: string[] = []): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) continue;
      results = results.concat(getFilesRecursively(fullPath, extensions, excludeDirs));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// Strips block comments (/* ... */) and line comments (// ...) from source code
function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1');
}

// Calculates sRGB linear luminance for a single 8-bit color channel
function sRGBtoLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

// Calculates WCAG 2.2 relative luminance for a given hex string
function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '').trim();
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

// Calculates WCAG 2.2 contrast ratio between two hex colors
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Brand V3 Automated Compliance Suite', () => {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html'];
  const excludedDirs = ['node_modules', '.next', '.git', '.agents', 'dist', 'out', 'coverage'];

  const targetDirs = [
    path.join(ROOT, 'src'),
    path.join(ROOT, 'app'),
    path.join(ROOT, 'components'),
    path.join(ROOT, 'styles'),
    path.join(ROOT, 'design'),
    path.join(ROOT, 'prototype'),
    path.join(ROOT, 'public'),
  ];

  const projectSourceFiles = targetDirs.flatMap((dir) =>
    getFilesRecursively(dir, codeExtensions, excludedDirs)
  );

  describe('1. Zero Occurrences of Retired Copper (#B84C32 / --tc-copper)', () => {
    it('must have ZERO occurrences of #B84C32 in all source and stylesheet files', () => {
      const violations: { file: string; line: number; text: string }[] = [];

      for (const file of projectSourceFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/#B84C32/i.test(line)) {
            violations.push({
              file: path.relative(ROOT, file),
              line: idx + 1,
              text: line.trim(),
            });
          }
        });
      }

      expect(
        violations,
        `Found retired copper hex #B84C32 in source files:\n${violations
          .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
          .join('\n')}`
      ).toEqual([]);
    });

    it('must have ZERO occurrences of --tc-copper in all CSS and component files', () => {
      const violations: { file: string; line: number; text: string }[] = [];

      for (const file of projectSourceFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/--tc-copper/i.test(line)) {
            violations.push({
              file: path.relative(ROOT, file),
              line: idx + 1,
              text: line.trim(),
            });
          }
        });
      }

      expect(
        violations,
        `Found retired CSS variable --tc-copper in files:\n${violations
          .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
          .join('\n')}`
      ).toEqual([]);
    });

    it('must NOT contain the legacy string "Worksite Cobalt + Copper" in any prototype or markup', () => {
      const violations: string[] = [];
      for (const file of projectSourceFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/Worksite Cobalt \+ Copper/i.test(content)) {
          violations.push(path.relative(ROOT, file));
        }
      }
      expect(violations).toEqual([]);
    });

    it('design/tokens.json palette must NOT contain copper or #B84C32', () => {
      const tokensPath = path.join(ROOT, 'design', 'tokens.json');
      expect(fs.existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
      const paletteString = JSON.stringify(tokens.palette || {});
      expect(paletteString).not.toMatch(/#B84C32/i);
      expect(paletteString).not.toMatch(/copper/i);

      // Verify that prohibitions list explicitly documents copper as prohibited
      expect(tokens.prohibitions).toContain('Copper #B84C32');
    });
  });

  describe('2. Zero Unauthorized Purple, Violet, Lavender, or Teal', () => {
    it('must NOT use purple, violet, lavender, or teal in CSS styles or Tailwind classes', () => {
      const violations: { file: string; line: number; text: string }[] = [];

      // Prohibited Tailwind color utilities: text-, bg-, border-, ring-, fill-, stroke-, from-, to-
      const prohibitedTailwindClass = /\b(?:text|bg|border|ring|fill|stroke|from|to|via)-(?:purple|violet|fuchsia|lavender|teal)(?:-[0-9]+)?\b/i;

      // Prohibited named CSS colors in property declarations: color: purple, background: teal, etc.
      const prohibitedCssProperty = /:\s*[^;]*(?:\b(?:purple|violet|lavender|teal)\b)/i;

      for (const file of projectSourceFiles) {
        const rawContent = fs.readFileSync(file, 'utf-8');
        // Strip comments first to avoid matching explanatory prohibition comments
        const cleanContent = stripComments(rawContent);
        const lines = cleanContent.split('\n');

        lines.forEach((line, idx) => {
          if (prohibitedTailwindClass.test(line) || prohibitedCssProperty.test(line)) {
            violations.push({
              file: path.relative(ROOT, file),
              line: idx + 1,
              text: line.trim(),
            });
          }
        });
      }

      expect(
        violations,
        `Found unauthorized purple/violet/lavender/teal color usage:\n${violations
          .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
          .join('\n')}`
      ).toEqual([]);
    });
  });

  describe('3. Zero White Text on Action Lime (#DDF16A)', () => {
    it('mathematical proof: White on Action Lime fails WCAG AA (ratio ~1.25:1 < 4.5:1)', () => {
      const contrast = getContrastRatio('#FFFFFF', '#DDF16A');
      const rounded = Math.round(contrast * 100) / 100;
      expect(rounded).toBeCloseTo(1.25, 1);
      expect(contrast).toBeLessThan(4.5); // Severe WCAG AA failure
    });

    it('mathematical proof: Ink on Action Lime passes WCAG AA (ratio ~12.66:1 >= 4.5:1)', () => {
      const contrast = getContrastRatio('#182336', '#DDF16A');
      const rounded = Math.round(contrast * 100) / 100;
      expect(rounded).toBeGreaterThanOrEqual(12.0);
      expect(contrast).toBeGreaterThanOrEqual(4.5); // Robust WCAG AA pass
    });

    it('must NEVER pair white text with Action Lime in CSS classes or components', () => {
      const violations: { file: string; line: number; text: string }[] = [];

      for (const file of projectSourceFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const cleanContent = stripComments(content);
        const lines = cleanContent.split('\n');

        lines.forEach((line, idx) => {
          // Detect dangerous combinations on the same line/element
          const hasLimeBg = /bg-action-lime|bg-\[#DDF16A\]|--tc-action-lime/i.test(line);
          const hasWhiteText = /text-white|text-\[#fff(?:fff)?\]|color:\s*#fff(?:fff)?|color:\s*white/i.test(line);

          if (hasLimeBg && hasWhiteText) {
            violations.push({
              file: path.relative(ROOT, file),
              line: idx + 1,
              text: line.trim(),
            });
          }
        });
      }

      expect(
        violations,
        `Detected white text paired with Action Lime:\n${violations
          .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
          .join('\n')}`
      ).toEqual([]);
    });

    it('enforces 2px dark outline requirement for .tc-btn-accent in tokens.css', () => {
      const cssPath = path.join(ROOT, 'design', 'tokens.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      // .tc-btn-accent must have color: var(--tc-ink) and border: 2px solid var(--tc-ink)
      expect(css).toMatch(/\.tc-btn-accent\s*\{[^}]*color:\s*var\(--tc-ink\)/);
      expect(css).toMatch(/\.tc-btn-accent\s*\{[^}]*border:\s*2px solid var\(--tc-ink\)/);
    });
  });

  describe('4. Active Import & Integrity of design/tokens.css', () => {
    it('design/tokens.css must exist and declare all 19 authoritative --tc-* CSS custom properties', () => {
      const tokensCssPath = path.join(ROOT, 'design', 'tokens.css');
      expect(fs.existsSync(tokensCssPath)).toBe(true);

      const content = fs.readFileSync(tokensCssPath, 'utf-8');

      const expectedTokens = [
        '--tc-ink',
        '--tc-primary',
        '--tc-primary-hover',
        '--tc-action-lime',
        '--tc-lime-hover',
        '--tc-canvas',
        '--tc-chalk',
        '--tc-surface',
        '--tc-surface-soft',
        '--tc-blue-light',
        '--tc-graphite',
        '--tc-text-secondary',
        '--tc-steel-grey-on-white-only',
        '--tc-border',
        '--tc-border-strong',
        '--tc-warning',
        '--tc-success',
        '--tc-error',
        '--tc-focus',
      ];

      for (const token of expectedTokens) {
        expect(content, `Missing required CSS token ${token}`).toContain(`${token}:`);
      }
    });

    it('typography tokens must define Manrope headings and IBM Plex Sans body', () => {
      const tokensCssPath = path.join(ROOT, 'design', 'tokens.css');
      const content = fs.readFileSync(tokensCssPath, 'utf-8');

      expect(content).toContain("--font-heading: 'Manrope'");
      expect(content).toContain("--font-body: 'IBM Plex Sans'");
    });

    it('application stylesheet must actively import tokens.css or tokens must be linked', () => {
      // Look for globals.css in src/ or app/
      const possibleGlobals = [
        path.join(ROOT, 'src', 'app', 'globals.css'),
        path.join(ROOT, 'app', 'globals.css'),
        path.join(ROOT, 'src', 'styles', 'globals.css'),
        path.join(ROOT, 'styles', 'globals.css'),
      ];

      const foundGlobal = possibleGlobals.find((p) => fs.existsSync(p));
      if (foundGlobal) {
        const content = fs.readFileSync(foundGlobal, 'utf-8');
        const importsTokens = /@import\s+['"][^'"]*tokens\.css['"]/i.test(content) ||
                              content.includes('tokens.css');
        expect(importsTokens, `Global stylesheet ${foundGlobal} must import design/tokens.css`).toBe(true);
      }
    });
  });

  describe('5. WCAG 2.2 AA Contrast Matrix Validation (qa/contrast_matrix.json)', () => {
    it('verifies all 19 contrast combinations in contrast_matrix.json match calculated ratios', () => {
      const matrixPath = path.join(ROOT, 'qa', 'contrast_matrix.json');
      expect(fs.existsSync(matrixPath)).toBe(true);

      const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'));
      expect(matrix.length).toBe(19);

      for (const item of matrix) {
        const calculated = getContrastRatio(item.foreground, item.background);
        const rounded = Math.round(calculated * 100) / 100;

        // Discrepancy between matrix recorded value and mathematical formula must not exceed 0.05
        expect(
          Math.abs(rounded - item.ratio),
          `Contrast ratio mismatch for "${item.use}": expected ${item.ratio}, got ${rounded}`
        ).toBeLessThanOrEqual(0.05);

        if (item.use.toLowerCase().includes('do not use')) {
          expect(item.pass_wcag, `Prohibited combination "${item.use}" must have pass_wcag: false`).toBe(false);
          expect(calculated).toBeLessThan(item.threshold);
        } else {
          expect(item.pass_wcag, `Approved combination "${item.use}" must have pass_wcag: true`).toBe(true);
          expect(calculated).toBeGreaterThanOrEqual(item.threshold);
        }
      }
    });
  });

  describe('6. Accessible Secondary Text Rules (Steel Text vs Steel Grey)', () => {
    it('Steel Grey (#66767A) on canvas (#F7F8F5) fails AA (4.44:1 < 4.5:1)', () => {
      const ratio = getContrastRatio('#66767A', '#F7F8F5');
      expect(ratio).toBeLessThan(4.5);
    });

    it('Steel Text (#596B70) on canvas (#F7F8F5) passes AA (5.24:1 >= 4.5:1)', () => {
      const ratio = getContrastRatio('#596B70', '#F7F8F5');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Steel Text (#596B70) on Cloud Blue (#EAF0FF) passes AA (4.89:1 >= 4.5:1)', () => {
      const ratio = getContrastRatio('#596B70', '#EAF0FF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
