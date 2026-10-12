import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SpecTable } from '@/components/ui/spec-table';
import { FilterPill } from '@/components/ui/filter-pill';

describe('Brand V3 UI Primitives', () => {
  describe('Button', () => {
    it('renders primary button with Cobalt background and white text', () => {
      render(<Button variant="primary">Add to Basket</Button>);
      const button = screen.getByRole('button', { name: /add to basket/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('bg-tc-primary');
      expect(button.className).toContain('text-white');
    });

    it('renders accent button with Action Lime, Ink text, and 2px solid Ink border', () => {
      render(<Button variant="accent">Trade Checkout</Button>);
      const button = screen.getByRole('button', { name: /trade checkout/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('bg-tc-action-lime');
      expect(button.className).toContain('text-tc-ink');
      expect(button.className).toContain('border-2 border-tc-ink');
      // Prohibit white text on lime
      expect(button.className).not.toContain('text-white');
    });

    it('renders in loading state with aria-busy and spinner', () => {
      render(<Button isLoading>Processing</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('supports asChild polymorphism', () => {
      render(
        <Button asChild>
          <a href="/trade">Trade Application</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: /trade application/i });
      expect(link).toBeInTheDocument();
      expect(link.className).toContain('bg-tc-primary');
    });
  });

  describe('Input', () => {
    it('renders with 1.8px strong border and accessible placeholder', () => {
      render(<Input placeholder="Enter supplier SKU" />);
      const input = screen.getByPlaceholderText('Enter supplier SKU');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('border-[1.8px]');
      expect(input.className).toContain('border-tc-border-strong');
    });

    it('renders error message and aria-invalid attribute', () => {
      render(<Input error="Invalid barcode format" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Invalid barcode format')).toBeInTheDocument();
    });
  });

  describe('SearchInput', () => {
    it('renders with role="searchbox" and clear button when value is present', () => {
      const handleClear = vi.fn();
      render(
        <SearchInput
          value="DeWalt"
          onChange={() => {}}
          onClear={handleClear}
          placeholder="Search..."
        />
      );
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('DeWalt');

      const clearBtn = screen.getByRole('button', { name: /clear search input/i });
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Badge', () => {
    it('renders lime badge with Ink text and dark outline', () => {
      render(<Badge variant="lime">UKCA Approved</Badge>);
      const badge = screen.getByText('UKCA Approved');
      expect(badge.className).toContain('bg-tc-action-lime');
      expect(badge.className).toContain('text-tc-ink');
      expect(badge.className).toContain('border-tc-ink');
      expect(badge.className).not.toContain('text-white');
    });

    it('renders success, warning, and danger badges', () => {
      const { rerender } = render(<Badge variant="success">In Stock</Badge>);
      expect(screen.getByText('In Stock').className).toContain('bg-tc-success');

      rerender(<Badge variant="warning">Low Stock</Badge>);
      expect(screen.getByText('Low Stock').className).toContain('bg-tc-warning');

      rerender(<Badge variant="danger">Discontinued</Badge>);
      expect(screen.getByText('Discontinued').className).toContain('bg-tc-error');
    });
  });

  describe('Card', () => {
    it('renders with 14px card radius and white surface by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Power Tools</CardTitle>
          </CardHeader>
          <CardContent>Cordless Drills &amp; Drivers</CardContent>
        </Card>
      );
      expect(screen.getByText('Power Tools')).toBeInTheDocument();
      const card = screen.getByText('Power Tools').closest('.rounded-\\[var\\(--radius-card\\)\\]');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('bg-white');
    });

    it('renders AI variant with Cloud Blue surface', () => {
      render(
        <Card variant="ai">
          <CardHeader>
            <CardTitle>AI Project Advisor</CardTitle>
          </CardHeader>
        </Card>
      );
      const card = screen.getByText('AI Project Advisor').closest('.rounded-\\[var\\(--radius-card\\)\\]');
      expect(card?.className).toContain('bg-tc-surface-soft');
    });
  });

  describe('SpecTable', () => {
    it('renders specification rows with tabular numbers', () => {
      render(
        <SpecTable
          caption="Technical Specifications"
          specs={[
            { label: 'Voltage', value: '18V' },
            { label: 'Weight', value: '1.4 kg' },
            { label: 'Barcode', value: '5012345678901' },
          ]}
        />
      );
      expect(screen.getByText('Technical Specifications')).toBeInTheDocument();
      expect(screen.getByText('Voltage')).toBeInTheDocument();
      const weightCell = screen.getByText('1.4 kg');
      expect(weightCell).toBeInTheDocument();
      expect(weightCell.className).toContain('tabular-nums');
    });
  });

  describe('FilterPill', () => {
    it('toggles between inactive and active states with aria-pressed', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <FilterPill active={false} count={12} onClick={handleClick}>
          Electrical
        </FilterPill>
      );

      const pill = screen.getByRole('button', { name: /electrical/i });
      expect(pill).toHaveAttribute('aria-pressed', 'false');
      expect(pill.className).toContain('bg-white');
      expect(pill.className).toContain('text-tc-ink');

      fireEvent.click(pill);
      expect(handleClick).toHaveBeenCalledTimes(1);

      rerender(
        <FilterPill active={true} variant="primary" count={12} onClick={handleClick}>
          Electrical
        </FilterPill>
      );
      expect(pill).toHaveAttribute('aria-pressed', 'true');
      expect(pill.className).toContain('bg-tc-primary');
      expect(pill.className).toContain('text-white');
    });

    it('renders active accent pill with Action Lime and 2px Ink border', () => {
      render(
        <FilterPill active={true} variant="accent">
          Trade Only
        </FilterPill>
      );
      const pill = screen.getByRole('button', { name: /trade only/i });
      expect(pill.className).toContain('bg-tc-action-lime');
      expect(pill.className).toContain('text-tc-ink');
      expect(pill.className).toContain('border-2 border-tc-ink');
    });
  });
});
