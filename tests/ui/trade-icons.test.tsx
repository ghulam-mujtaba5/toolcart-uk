import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  IconToolbox,
  IconCaliper,
  IconTradeVerified,
  IconTapeMeasure,
  IconBolt,
  IconSpiritLevel,
  IconStockRadar,
  IconTruckFreight,
  TradeIcon,
  tradeIconMap,
  TradeIconSize,
} from '@/components/ui/trade-icons';

const allIcons = [
  { name: 'IconToolbox', Component: IconToolbox, title: 'Toolbox' },
  { name: 'IconCaliper', Component: IconCaliper, title: 'Vernier Caliper' },
  { name: 'IconTradeVerified', Component: IconTradeVerified, title: 'Trade Verified' },
  { name: 'IconTapeMeasure', Component: IconTapeMeasure, title: 'Tape Measure' },
  { name: 'IconBolt', Component: IconBolt, title: 'High-Tensile Hex Bolt' },
  { name: 'IconSpiritLevel', Component: IconSpiritLevel, title: 'Spirit Level' },
  { name: 'IconStockRadar', Component: IconStockRadar, title: 'Stock Telemetry Radar' },
  { name: 'IconTruckFreight', Component: IconTruckFreight, title: 'Freight Logistics Truck' },
];

const opticalSizes: TradeIconSize[] = [16, 20, 24, 32];

describe('Brand V3 Adaptive Duotone Icon System', () => {
  describe('Optical Sizing & ViewBox Alignment across all 8 icons', () => {
    allIcons.forEach(({ name, Component }) => {
      describe(name, () => {
        opticalSizes.forEach((size) => {
          it(`renders optical size ${size}px with correct viewBox and dimensions`, () => {
            const { container } = render(<Component size={size} data-testid={`${name}-${size}`} />);
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg?.getAttribute('viewBox')).toBe(`0 0 ${size} ${size}`);
            expect(svg?.getAttribute('width')).toBe(String(size));
            expect(svg?.getAttribute('height')).toBe(String(size));
          });
        });

        it('defaults to 24px optical size when size prop is omitted', () => {
          const { container } = render(<Component />);
          const svg = container.querySelector('svg');
          expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
          expect(svg?.getAttribute('width')).toBe('24');
          expect(svg?.getAttribute('height')).toBe('24');
        });
      });
    });
  });

  describe('Duotone Layering & Variant Behavior', () => {
    it('renders both primary and secondary duotone groups', () => {
      const { container } = render(<IconToolbox size={24} />);
      const primaryGroup = container.querySelector('.tc-duotone-primary');
      const secondaryGroup = container.querySelector('.tc-duotone-secondary');

      expect(primaryGroup).toBeInTheDocument();
      expect(secondaryGroup).toBeInTheDocument();
      expect(secondaryGroup?.getAttribute('fill-opacity')).toBe('0.22');
    });

    it('sets secondary opacity to 0 when variant="outline"', () => {
      const { container } = render(<IconCaliper variant="outline" />);
      const secondaryGroup = container.querySelector('.tc-duotone-secondary');
      expect(secondaryGroup?.getAttribute('fill-opacity')).toBe('0');
    });

    it('sets secondary opacity to 0.85 when variant="solid"', () => {
      const { container } = render(<IconBolt variant="solid" />);
      const secondaryGroup = container.querySelector('.tc-duotone-secondary');
      expect(secondaryGroup?.getAttribute('fill-opacity')).toBe('0.85');
    });

    it('allows custom secondary opacity override', () => {
      const { container } = render(<IconSpiritLevel secondaryOpacity={0.4} />);
      const secondaryGroup = container.querySelector('.tc-duotone-secondary');
      expect(secondaryGroup?.getAttribute('fill-opacity')).toBe('0.4');
    });

    it('applies custom primary and secondary colors', () => {
      const { container } = render(
        <IconTruckFreight primaryColor="#2450B8" secondaryColor="#DDF16A" />
      );
      const primaryGroup = container.querySelector('.tc-duotone-primary');
      const secondaryGroup = container.querySelector('.tc-duotone-secondary');

      expect(primaryGroup?.getAttribute('stroke')).toBe('#2450B8');
      expect(secondaryGroup?.getAttribute('fill')).toBe('#DDF16A');
    });
  });

  describe('Dynamic TradeIcon Loader', () => {
    Object.keys(tradeIconMap).forEach((iconKey) => {
      it(`dynamically renders icon "${iconKey}" via TradeIcon wrapper`, () => {
        const { container } = render(
          <TradeIcon name={iconKey as keyof typeof tradeIconMap} size={20} />
        );
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg?.getAttribute('viewBox')).toBe('0 0 20 20');
      });
    });
  });

  describe('Accessibility & Semantics', () => {
    it('renders with aria-hidden when no accessible label is specified', () => {
      const { container } = render(<IconToolbox aria-hidden={true} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders with role="img" and accessible aria-label', () => {
      render(<IconTapeMeasure aria-label="Tape measure tool" />);
      const svg = screen.getByLabelText('Tape measure tool');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName.toLowerCase()).toBe('svg');
    });

    it('renders title element for screen readers when title prop is provided', () => {
      const { container } = render(<IconTradeVerified title="Verified UKCA Crest" />);
      const titleEl = container.querySelector('title');
      expect(titleEl).toBeInTheDocument();
      expect(titleEl?.textContent).toBe('Verified UKCA Crest');
    });
  });

  describe('Brand V3 Color Compliance', () => {
    allIcons.forEach(({ name, Component }) => {
      it(`${name} contains zero retired copper, purple, or teal color codes in DOM output`, () => {
        const { container } = render(<Component size={32} />);
        const html = container.innerHTML.toLowerCase();

        // Retired Copper
        expect(html).not.toContain('#b84c32');
        expect(html).not.toContain('rgb(184, 76, 50)');
        expect(html).not.toContain('copper');

        // Unauthorized Purple / Teal
        expect(html).not.toContain('purple');
        expect(html).not.toContain('violet');
        expect(html).not.toContain('teal');
      });
    });
  });
});
