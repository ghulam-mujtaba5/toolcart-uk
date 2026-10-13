import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Adversarial Challenge: Brand V3 Storefront Codebase Scan', () => {
  const STOREFRONT_APP_DIR = path.resolve(__dirname, '../../app/(storefront)');
  const STOREFRONT_COMP_DIR = path.resolve(__dirname, '../../src/components/storefront');

  function getFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getFilesRecursively(fullPath));
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allFiles = [
    ...getFilesRecursively(STOREFRONT_APP_DIR),
    ...getFilesRecursively(STOREFRONT_COMP_DIR),
  ];

  it('scans all storefront files ensuring ZERO retired copper (#B84C32 / --tc-copper)', () => {
    expect(allFiles.length).toBeGreaterThan(15);
    const copperViolations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.toLowerCase().includes('#b84c32') || content.includes('--tc-copper')) {
        copperViolations.push(file);
      }
    }

    expect(copperViolations).toEqual([]);
  });

  it('scans all storefront files ensuring ZERO purple, violet, lavender, or teal brand classes', () => {
    const forbiddenColorRegex = /\b(bg|text|border)-(purple|violet|lavender|teal)-/i;
    const colorViolations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (forbiddenColorRegex.test(content)) {
        colorViolations.push(file);
      }
    }

    expect(colorViolations).toEqual([]);
  });

  it('scans all storefront files ensuring ZERO inline styles with forbidden hex colors', () => {
    const forbiddenHexRegex = /style=\{\{[^}]*(#B84C32|#b84c32|purple|teal)[^}]*\}\}/;
    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (forbiddenHexRegex.test(content)) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });

  it('enforces that Action Lime is NEVER paired with white text', () => {
    // Check for combinations where text-white is used directly alongside bg-tc-action-lime
    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Look for lines containing both bg-tc-action-lime and text-white
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (
          line.includes('bg-tc-action-lime') &&
          (line.includes('text-white') || line.includes('#ffffff') || line.includes('#fff')) &&
          !line.includes('border-tc-action-lime') // border is allowed
        ) {
          violations.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
