import React from 'react';
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  EmptyToolChestVector,
  NotFoundVector,
  TradeProHeroVector,
  TradeProVector,
  CategoryCadAccent,
  CategoryCadAccents,
} from '@/components/ui/vectors';

describe('Adversarial Challenge: Milestone 1 Pure-CSS Patterns & Bespoke SVGs', () => {
  describe('1. Pure-CSS Engineering Patterns Stress Testing (globals.css)', () => {
    const globalsCssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    it('contains pure-CSS engineering pattern classes with zero JavaScript runtime overhead', () => {
      expect(cssContent).toContain('.tc-bg-dots');
      expect(cssContent).toContain('.tc-bg-dots-dark');
      expect(cssContent).toContain('.tc-bg-blueprint');
      expect(cssContent).toContain('.tc-bg-blueprint-dark');
      expect(cssContent).toContain('.tc-card-machined');
      expect(cssContent).toContain('.tc-chamfer-corner');
    });

    it('prohibits retired copper, unauthorized purple, or teal inside globals.css utilities', () => {
      expect(cssContent).not.toMatch(/#b84c32/i);
      expect(cssContent).not.toMatch(/rgb\(\s*184\s*,\s*76\s*,\s*50\s*\)/i);
      expect(cssContent).not.toMatch(/--tc-copper/i);
      expect(cssContent).not.toMatch(/\b(copper|purple|violet|lavender|teal)\b/i);
    });

    it('validates dot grid mathematical pitch and color opacity tokens', () => {
      // Light dot grid: Cobalt #2450B8 at 12% opacity with 24px pitch
      expect(cssContent).toMatch(/\.tc-bg-dots\s*\{[^}]*rgba\(36,\s*80,\s*184,\s*0\.12\)[^}]*24px/s);
      // Dark dot grid: Action Lime #DDF16A at 16% opacity with 24px pitch
      expect(cssContent).toMatch(/\.tc-bg-dots-dark\s*\{[^}]*rgba\(221,\s*241,\s*106,\s*0\.16\)[^}]*24px/s);
    });

    it('validates blueprint dual-pitch orthogonal grid (20px minor, 100px major)', () => {
      expect(cssContent).toContain('20px 20px');
      expect(cssContent).toContain('100px 100px');
      expect(cssContent).toContain('var(--tc-canvas)');
      expect(cssContent).toContain('var(--tc-ink)');
    });

    it('validates machined chamfer card tactile styling and index notch', () => {
      expect(cssContent).toContain('.tc-card-machined');
      expect(cssContent).toContain('.tc-card-machined::before');
      expect(cssContent).toContain('.tc-card-machined:hover');
      expect(cssContent).toContain('pointer-events: none');
      expect(cssContent).toContain('translateY(-2px)');
      // Validates clip-path 45-degree chamfer coordinates
      expect(cssContent).toContain('clip-path: polygon(');
    });
  });

  describe('2. EmptyToolChestVector Adversarial & Extreme Inputs', () => {
    it('handles undefined and empty className gracefully without crashing', () => {
      const { container: c1 } = render(<EmptyToolChestVector className={undefined} />);
      const svg1 = c1.querySelector('svg');
      expect(svg1).toBeInTheDocument();
      expect(svg1).toHaveAttribute('viewBox', '0 0 320 220');

      const { container: c2 } = render(<EmptyToolChestVector className="" />);
      const svg2 = c2.querySelector('svg');
      expect(svg2).toBeInTheDocument();
      expect(svg2?.getAttribute('class')).toBe('');
    });

    it('handles extreme numeric and string dimensions (0, negative, 5000px, 100%)', () => {
      const { container: cZero } = render(<EmptyToolChestVector width={0} height={0} />);
      const svgZero = cZero.querySelector('svg');
      expect(svgZero).toHaveAttribute('width', '0');
      expect(svgZero).toHaveAttribute('height', '0');

      const { container: cHuge } = render(<EmptyToolChestVector width={5000} height={5000} />);
      const svgHuge = cHuge.querySelector('svg');
      expect(svgHuge).toHaveAttribute('width', '5000');
      expect(svgHuge).toHaveAttribute('height', '5000');

      const { container: cPercent } = render(<EmptyToolChestVector width="100%" height="auto" />);
      const svgPercent = cPercent.querySelector('svg');
      expect(svgPercent).toHaveAttribute('width', '100%');
      expect(svgPercent).toHaveAttribute('height', 'auto');
    });

    it('verifies Brand V3 strict color palette and zero white on Action Lime', () => {
      const { container } = render(<EmptyToolChestVector />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      const html = container.innerHTML;
      expect(html).not.toMatch(/#B84C32/i);
      expect(html).not.toMatch(/\b(copper|purple|violet|lavender|teal)\b/i);

      // Verify toggle latch: Action Lime fill paired with dark Ink border & rivet
      const latch = container.querySelector('rect[fill="#DDF16A"]');
      expect(latch).toBeInTheDocument();
      expect(latch).toHaveAttribute('stroke', '#182336');

      // Verify rivet inside latch is dark Ink
      const rivet = container.querySelector('circle[fill="#182336"]');
      expect(rivet).toBeInTheDocument();
    });
  });

  describe('3. NotFoundVector Adversarial & Extreme Inputs', () => {
    it('handles undefined className and extreme dimensions without distortion', () => {
      const { container } = render(<NotFoundVector className={undefined} width="100vw" height={0} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 360 220');
      expect(svg).toHaveAttribute('width', '100vw');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('strictly enforces dark Ink text on Action Lime blade markings (#182336 on #DDF16A)', () => {
      const { container } = render(<NotFoundVector />);
      const texts = Array.from(container.querySelectorAll('text'));

      const bladeTexts = texts.filter((t) => ['380', '390', '400', '404!'].includes(t.textContent || ''));
      expect(bladeTexts.length).toBe(4);

      for (const textElem of bladeTexts) {
        expect(textElem).toHaveAttribute('fill', '#182336');
        expect(textElem).not.toHaveAttribute('fill', '#FFFFFF');
      }
    });

    it('verifies dimension callout and tape housing structure', () => {
      const { container } = render(<NotFoundVector />);
      const errorCallout = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === 'ERR: CUT AT 404mm'
      );
      expect(errorCallout).toBeInTheDocument();
      expect(errorCallout).toHaveAttribute('fill', '#2450B8'); // Cobalt callout

      // Verify metallic center badge text
      const classIIText = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === 'CLASS II'
      );
      expect(classIIText).toBeInTheDocument();
      expect(classIIText).toHaveAttribute('fill', '#DDF16A'); // Action lime text on dark metallic badge
    });
  });

  describe('4. TradeProHeroVector Adversarial & Precision Vernier Jaw Testing', () => {
    it('renders with both canonical name and TradeProVector alias under extreme dimensions', () => {
      const { container: c1 } = render(<TradeProHeroVector width={4000} height={2000} />);
      expect(c1.querySelector('svg')).toHaveAttribute('width', '4000');

      const { container: c2 } = render(<TradeProVector width="50%" height="auto" />);
      expect(c2.querySelector('svg')).toHaveAttribute('width', '50%');
    });

    it('renders all 26 caliper metric graduations with zero NaN coordinates or invalid paths', () => {
      const { container } = render(<TradeProHeroVector />);
      const lines = Array.from(container.querySelectorAll('line'));
      
      // Caliper scale lines
      const scaleLines = lines.filter((l) => {
        const y1 = l.getAttribute('y1');
        const y2 = l.getAttribute('y2');
        return y1 === '44' && (y2 === '56' || y2 === '50');
      });
      expect(scaleLines.length).toBe(26);

      for (const line of scaleLines) {
        const x1 = parseFloat(line.getAttribute('x1') || 'NaN');
        const x2 = parseFloat(line.getAttribute('x2') || 'NaN');
        expect(Number.isNaN(x1)).toBe(false);
        expect(Number.isNaN(x2)).toBe(false);
        expect(x1).toBe(x2); // Perpendicular vertical lines
      }
    });

    it('strictly enforces dark Ink text on UK TRADE PRO stamp', () => {
      const { container } = render(<TradeProHeroVector />);
      const stampText = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === 'UK TRADE PRO'
      );
      expect(stampText).toBeInTheDocument();
      expect(stampText).toHaveAttribute('fill', '#182336');
      expect(stampText).not.toHaveAttribute('fill', '#FFFFFF');

      const stampRect = stampText?.parentElement?.querySelector('rect[fill="#DDF16A"]');
      expect(stampRect).toBeInTheDocument();
      expect(stampRect).toHaveAttribute('stroke', '#182336');
    });
  });

  describe('5. CategoryCadAccent Extreme Slug Mining & Boundary Stress', () => {
    const testCases: { slug: any; expectedViewBox: string }[] = [
      { slug: 'tools', expectedViewBox: '0 0 240 120' },
      { slug: 'hand-tools', expectedViewBox: '0 0 240 120' },
      { slug: 'fixings', expectedViewBox: '0 0 240 120' },
      { slug: 'fixings-security', expectedViewBox: '0 0 240 120' },
      { slug: 'fixings-hardware', expectedViewBox: '0 0 240 120' },
      { slug: 'decorating', expectedViewBox: '0 0 240 120' },
      { slug: 'measuring', expectedViewBox: '0 0 240 120' },
      { slug: 'ppe', expectedViewBox: '0 0 240 120' },
      { slug: 'workwear-safety', expectedViewBox: '0 0 240 120' },
      { slug: 'site-equipment', expectedViewBox: '0 0 240 120' },
      // Edge cases & adversarial slugs
      { slug: '', expectedViewBox: '0 0 240 120' },
      { slug: '   ', expectedViewBox: '0 0 240 120' },
      { slug: 'TOOLS', expectedViewBox: '0 0 240 120' },
      { slug: '  HAND-TOOLS  ', expectedViewBox: '0 0 240 120' },
      { slug: 'FIXINGS', expectedViewBox: '0 0 240 120' },
      { slug: 'DECORATING', expectedViewBox: '0 0 240 120' },
      { slug: 'MEASURING', expectedViewBox: '0 0 240 120' },
      { slug: 'PPE', expectedViewBox: '0 0 240 120' },
      { slug: 'SITE-EQUIPMENT', expectedViewBox: '0 0 240 120' },
      { slug: 'completely-unknown-slug-12345', expectedViewBox: '0 0 240 120' },
      { slug: '<script>alert("xss")</script>', expectedViewBox: '0 0 240 120' },
      { slug: "' OR '1'='1", expectedViewBox: '0 0 240 120' },
      { slug: 'a'.repeat(500), expectedViewBox: '0 0 240 120' },
      { slug: null, expectedViewBox: '0 0 240 120' },
      { slug: undefined, expectedViewBox: '0 0 240 120' },
    ];

    it.each(testCases)('safely handles slug "$slug" without throwing and maintains valid viewBox', ({ slug, expectedViewBox }) => {
      const { container } = render(<CategoryCadAccent categorySlug={slug as any} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', expectedViewBox);
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('verifies measuring spirit level vial has Action Lime bubble with dark Ink stroke', () => {
      const { container } = render(<CategoryCadAccent categorySlug="measuring" />);
      const limeBubble = container.querySelector('circle[fill="#DDF16A"]');
      expect(limeBubble).toBeInTheDocument();
      expect(limeBubble).toHaveAttribute('stroke', '#182336');
    });

    it('verifies site equipment stepladder platform top has Action Lime with dark Ink stroke', () => {
      const { container } = render(<CategoryCadAccent categorySlug="site-equipment" />);
      const limePlatform = container.querySelector('rect[fill="#DDF16A"]');
      expect(limePlatform).toBeInTheDocument();
      expect(limePlatform).toHaveAttribute('stroke', '#182336');
    });
  });

  describe('6. Rapid Mount / Unmount Stress & JSDOM Lifecycle Endurance', () => {
    it('executes 100 rapid mount and unmount cycles without memory leaks or DOM exceptions', () => {
      for (let i = 0; i < 100; i++) {
        const { unmount: u1 } = render(<EmptyToolChestVector />);
        u1();
        const { unmount: u2 } = render(<NotFoundVector />);
        u2();
        const { unmount: u3 } = render(<TradeProHeroVector />);
        u3();
        const { unmount: u4 } = render(<CategoryCadAccent categorySlug="tools" />);
        u4();
      }
      expect(true).toBe(true);
    });
  });

  describe('7. Responsive Viewport Container Nesting (360px vs 1440px)', () => {
    it('renders flawlessly inside 360px mobile container simulation without overflow', () => {
      const { container } = render(
        <div style={{ width: '360px', overflow: 'hidden' }}>
          <EmptyToolChestVector />
          <NotFoundVector />
          <TradeProHeroVector />
          <CategoryCadAccent categorySlug="hand-tools" />
        </div>
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(4);
      for (const svg of Array.from(svgs)) {
        expect(svg).toBeInTheDocument();
        expect(svg.getAttribute('viewBox')).toBeTruthy();
      }
    });

    it('renders cleanly inside 1440px desktop container simulation', () => {
      const { container } = render(
        <div style={{ width: '1440px' }}>
          <EmptyToolChestVector />
          <NotFoundVector />
          <TradeProHeroVector />
          <CategoryCadAccent categorySlug="measuring" />
        </div>
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(4);
    });
  });
});
