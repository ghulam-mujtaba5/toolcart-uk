import React from 'react';
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

describe('Bespoke Brand V3 SVG Vector Scenes', () => {
  describe('EmptyToolChestVector', () => {
    it('renders an SVG with correct viewBox, default classes, and accessibility attributes', () => {
      const { container } = render(<EmptyToolChestVector />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 320 220');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.getAttribute('class')).toContain('w-56');
    });

    it('accepts custom className, width, and height', () => {
      const { container } = render(
        <EmptyToolChestVector className="custom-chest" width={300} height={200} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '300');
      expect(svg).toHaveAttribute('height', '200');
      expect(svg?.getAttribute('class')).toContain('custom-chest');
    });

    it('renders cantilever chest elements and dashed tool cutouts', () => {
      const { container } = render(<EmptyToolChestVector />);
      const html = container.innerHTML;
      // High-vis Action Lime toggle latch
      expect(html).toContain('#DDF16A');
      // Dark Ink base
      expect(html).toContain('#182336');
      // Cobalt primary accents
      expect(html).toContain('#2450B8');
      // Dashed tool silhouette stroke
      expect(html).toContain('stroke-dasharray');
      // Prohibits retired copper or unauthorized purple/teal
      expect(html).not.toMatch(/#B84C32/i);
      expect(html).not.toMatch(/\b(purple|violet|lavender|teal)\b/i);
    });
  });

  describe('NotFoundVector', () => {
    it('renders an SVG with 360x220 viewBox and 404 tape measure fracture', () => {
      const { container } = render(<NotFoundVector />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 360 220');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders blade markings, snapped 404 tip, and callout', () => {
      const { container } = render(<NotFoundVector />);
      const textContents = Array.from(container.querySelectorAll('text')).map(
        (t) => t.textContent
      );
      expect(textContents).toContain('TC-5M');
      expect(textContents).toContain('CLASS II');
      expect(textContents).toContain('380');
      expect(textContents).toContain('390');
      expect(textContents).toContain('400');
      expect(textContents).toContain('404!');
      expect(textContents).toContain('ERR: CUT AT 404mm');
    });

    it('strictly avoids white text on Action Lime blade markings', () => {
      const { container } = render(<NotFoundVector />);
      const text380 = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === '380'
      );
      expect(text380).toHaveAttribute('fill', '#182336'); // Dark Ink text on Lime blade
      expect(text380).not.toHaveAttribute('fill', '#FFFFFF');

      const text404 = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === '404!'
      );
      expect(text404).toHaveAttribute('fill', '#182336');
    });
  });

  describe('TradeProHeroVector', () => {
    it('renders caliper assembly clamped to trade crest with Net 30 dimension', () => {
      const { container } = render(<TradeProHeroVector />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 340 220');
      expect(svg).toHaveAttribute('aria-hidden', 'true');

      const texts = Array.from(container.querySelectorAll('text')).map(
        (t) => t.textContent
      );
      expect(texts).toContain('VERIFIED');
      expect(texts).toContain('30.00mm (NET 30)');
      expect(texts).toContain('UK TRADE PRO');
    });

    it('exports TradeProVector alias matching TradeProHeroVector', () => {
      expect(TradeProVector).toBe(TradeProHeroVector);
    });

    it('enforces Action Lime stamp paired with dark Ink text', () => {
      const { container } = render(<TradeProHeroVector />);
      const stampText = Array.from(container.querySelectorAll('text')).find(
        (t) => t.textContent === 'UK TRADE PRO'
      );
      expect(stampText).toHaveAttribute('fill', '#182336');
      expect(stampText).not.toHaveAttribute('fill', '#FFFFFF');
    });
  });

  describe('CategoryCadAccent', () => {
    it('renders Hand Tools wireframe for "tools" and "hand-tools"', () => {
      const { container: c1 } = render(<CategoryCadAccent categorySlug="tools" />);
      expect(c1.innerHTML).toContain('15°');

      const { container: c2 } = render(<CategoryCadAccent categorySlug="hand-tools" />);
      expect(c2.innerHTML).toContain('15°');
    });

    it('renders Fixings wireframe with M10 bolt and padlock', () => {
      const { container } = render(<CategoryCadAccent categorySlug="fixings" />);
      // Renders hex bolt polygon and padlock
      expect(container.querySelectorAll('polygon').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('line').length).toBeGreaterThan(5);
    });

    it('renders Decorating wireframe with roller cage and tape core Ø76 callout', () => {
      const { container } = render(<CategoryCadAccent categorySlug="decorating" />);
      expect(container.innerHTML).toContain('Ø76');
    });

    it('renders Measuring wireframe with spirit level vials and millimeter scale', () => {
      const { container } = render(<CategoryCadAccent categorySlug="measuring" />);
      // Spirit level bubble in Action Lime
      expect(container.innerHTML).toContain('#DDF16A');
      expect(container.querySelectorAll('line').length).toBeGreaterThan(15);
    });

    it('renders PPE wireframe with safety goggles and EN166 marking', () => {
      const { container } = render(<CategoryCadAccent categorySlug="ppe" />);
      expect(container.innerHTML).toContain('EN166 • 1F CE');
    });

    it('renders Site Equipment A-frame stepladder for "site-equipment" and unknown slugs', () => {
      const { container: c1 } = render(
        <CategoryCadAccent categorySlug="site-equipment" />
      );
      expect(c1.innerHTML).toContain('#DDF16A');

      // Graceful fallback
      const { container: c2 } = render(
        <CategoryCadAccent categorySlug="unknown-category" />
      );
      expect(c2.innerHTML).toContain('#DDF16A');
    });

    it('exports CategoryCadAccents alias', () => {
      expect(CategoryCadAccents).toBe(CategoryCadAccent);
    });

    it('prohibits forbidden colors across all category variants', () => {
      const categories = [
        'tools',
        'hand-tools',
        'fixings',
        'decorating',
        'measuring',
        'ppe',
        'site-equipment',
      ];
      for (const cat of categories) {
        const { container } = render(<CategoryCadAccent categorySlug={cat} />);
        const html = container.innerHTML;
        expect(html).not.toMatch(/#B84C32/i);
        expect(html).not.toMatch(/\b(purple|violet|lavender|teal)\b/i);
      }
    });
  });
});
