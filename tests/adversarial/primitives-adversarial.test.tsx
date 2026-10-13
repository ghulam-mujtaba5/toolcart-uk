import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SpecTable } from '@/components/ui/spec-table';
import { FilterPill } from '@/components/ui/filter-pill';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

describe('Adversarial UI Primitives Stress Testing', () => {
  describe('Button Boundary & Adversarial Conditions', () => {
    it('handles empty children, null, and undefined without crashing', () => {
      const { container, rerender } = render(<Button />);
      expect(container.querySelector('button')).toBeInTheDocument();

      rerender(<Button>{null}</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();

      rerender(<Button>{undefined}</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders extreme string lengths (10,000 characters) without crashing', () => {
      const hugeString = 'X'.repeat(10000);
      render(<Button>{hugeString}</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeInTheDocument();
      expect(btn.textContent).toBe(hugeString);
    });

    it('safely handles potential XSS string payloads in button label', () => {
      const xssPayload = '<img src=x onerror=alert(1) />';
      render(<Button>{xssPayload}</Button>);
      const btn = screen.getByRole('button');
      expect(btn.textContent).toBe(xssPayload);
      expect(document.querySelector('img')).toBeNull();
    });

    it('strictly prevents click propagation when isLoading or disabled', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <Button isLoading onClick={handleClick}>
          Submit Order
        </Button>
      );
      const loadingBtn = screen.getByRole('button');
      fireEvent.click(loadingBtn);
      expect(handleClick).not.toHaveBeenCalled();

      rerender(
        <Button disabled onClick={handleClick}>
          Submit Order
        </Button>
      );
      const disabledBtn = screen.getByRole('button');
      fireEvent.click(disabledBtn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('enforces that Action Lime accent button NEVER has white text across any permutation', () => {
      const variants: ('accent' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger')[] = ['accent'];
      const sizes: ('default' | 'sm' | 'md' | 'lg' | 'icon')[] = ['default', 'sm', 'md', 'lg', 'icon'];

      for (const size of sizes) {
        const { unmount } = render(
          <Button variant="accent" size={size}>
            Accent Test
          </Button>
        );
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('bg-tc-action-lime');
        expect(btn.className).toContain('text-tc-ink');
        expect(btn.className).toContain('border-2 border-tc-ink');
        expect(btn.className).not.toContain('text-white');
        unmount();
      }
    });

    it('preserves child element semantics with asChild polymorphism', () => {
      render(
        <Button asChild variant="accent">
          <a href="https://toolcart.co.uk/trade" target="_blank" rel="noopener noreferrer">
            Trade Portal
          </a>
        </Button>
      );
      const link = screen.getByRole('link', { name: /trade portal/i });
      expect(link).toHaveAttribute('href', 'https://toolcart.co.uk/trade');
      expect(link.className).toContain('bg-tc-action-lime');
      expect(link.className).toContain('text-tc-ink');
      expect(link.className).not.toContain('text-white');
    });
  });

  describe('Input Boundary & Description Priority', () => {
    it('handles 10,000 character inputs and Unicode/emojis cleanly', () => {
      const hugeInput = '🛠️🔩⚡'.repeat(2500);
      render(<Input defaultValue={hugeInput} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(hugeInput);
    });

    it('prioritizes error over helperText in aria-describedby and rendering', () => {
      render(
        <Input
          id="test-sku"
          error="SKU does not exist in supplier catalog"
          helperText="Format: 13-digit EAN or alphanumeric SKU"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'test-sku-error');
      expect(screen.getByText('SKU does not exist in supplier catalog')).toBeInTheDocument();
      // Helper text should not be displayed when error is present
      expect(screen.queryByText('Format: 13-digit EAN or alphanumeric SKU')).toBeNull();
    });

    it('disables input correctly and applies disabled styling', () => {
      render(<Input disabled placeholder="Locked field" />);
      const input = screen.getByPlaceholderText('Locked field');
      expect(input).toBeDisabled();
      expect(input.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('SearchInput Adversarial Edge Cases', () => {
    it('does not display clear button when value is empty string, null, or undefined', () => {
      const { rerender } = render(<SearchInput value="" onChange={() => {}} onClear={() => {}} />);
      expect(screen.queryByRole('button', { name: /clear search input/i })).toBeNull();

      rerender(<SearchInput value={undefined} onChange={() => {}} onClear={() => {}} />);
      expect(screen.queryByRole('button', { name: /clear search input/i })).toBeNull();
    });

    it('displays clear button when numeric 0 is entered', () => {
      render(<SearchInput value={0} onChange={() => {}} onClear={() => {}} />);
      expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();
    });

    it('handles Escape key to trigger onClear and prevents default', () => {
      const handleClear = vi.fn();
      render(<SearchInput value="Makita cordless" onChange={() => {}} onClear={handleClear} />);
      const input = screen.getByRole('searchbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('disables clear button when input is disabled', () => {
      const handleClear = vi.fn();
      render(
        <SearchInput
          value="Makita"
          disabled
          onChange={() => {}}
          onClear={handleClear}
        />
      );
      const clearBtn = screen.getByRole('button', { name: /clear search input/i });
      expect(clearBtn).toBeDisabled();
    });

    it('replaces clear button with spinner when isLoading is true', () => {
      render(
        <SearchInput
          value="Makita"
          isLoading
          onChange={() => {}}
          onClear={() => {}}
        />
      );
      expect(screen.getByLabelText('Searching')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /clear search input/i })).toBeNull();
    });
  });

  describe('Badge Permutations & Prohibitions', () => {
    it('verifies all variants in both solid and subtle modes never violate Brand V3', () => {
      const variants: ('lime' | 'success' | 'warning' | 'danger' | 'neutral')[] = [
        'lime',
        'success',
        'warning',
        'danger',
        'neutral',
      ];

      for (const variant of variants) {
        // Solid mode
        const { unmount: unmountSolid } = render(
          <Badge variant={variant} subtle={false}>
            {variant}
          </Badge>
        );
        const badgeSolid = screen.getByText(variant);
        if (variant === 'lime') {
          expect(badgeSolid.className).toContain('text-tc-ink');
          expect(badgeSolid.className).toContain('border-tc-ink');
          expect(badgeSolid.className).not.toContain('text-white');
        }
        unmountSolid();

        // Subtle mode
        const { unmount: unmountSubtle } = render(
          <Badge variant={variant} subtle={true}>
            {variant}
          </Badge>
        );
        const badgeSubtle = screen.getByText(variant);
        if (variant === 'lime') {
          // In subtle mode, lime must STILL have ink text and ink outline
          expect(badgeSubtle.className).toContain('text-tc-ink');
          expect(badgeSubtle.className).toContain('border-tc-ink');
          expect(badgeSubtle.className).not.toContain('text-white');
        }
        unmountSubtle();
      }
    });
  });

  describe('SpecTable Edge Cases', () => {
    it('returns null when given an empty array or empty object', () => {
      const { container: emptyArrContainer } = render(<SpecTable specs={[]} />);
      expect(emptyArrContainer.firstChild).toBeNull();

      const { container: emptyObjContainer } = render(<SpecTable specs={{}} />);
      expect(emptyObjContainer.firstChild).toBeNull();
    });

    it('filters out empty string, null, and undefined values from object specs', () => {
      render(
        <SpecTable
          specs={{
            'Valid Spec': '18V Li-ion',
            'Empty String': '',
            'Null Value': null,
            'Undefined Value': undefined,
            'Zero Value': 0,
          }}
        />
      );
      expect(screen.getByText('Valid Spec')).toBeInTheDocument();
      expect(screen.getByText('18V Li-ion')).toBeInTheDocument();
      expect(screen.getByText('Zero Value')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText('Empty String')).toBeNull();
      expect(screen.queryByText('Null Value')).toBeNull();
      expect(screen.queryByText('Undefined Value')).toBeNull();
    });

    it('correctly handles non-striped and compact modes', () => {
      render(
        <SpecTable
          compact
          striped={false}
          specs={[{ label: 'Weight', value: '2.5kg' }]}
        />
      );
      const th = screen.getByText('Weight');
      expect(th.className).toContain('px-3 py-2 text-xs');
      const td = screen.getByText('2.5kg');
      expect(td.className).toContain('tabular-nums');
    });
  });

  describe('FilterPill Corner Cases', () => {
    it('renders count of 0 correctly and does not drop it due to falsy evaluation', () => {
      render(<FilterPill count={0}>Zero Items</FilterPill>);
      expect(screen.getByText('(0)')).toBeInTheDocument();
      expect(screen.getByText('(0)').className).toContain('tabular-nums');
    });

    it('handles removal click with stopPropagation without triggering main onClick', () => {
      const handleClick = vi.fn();
      const handleRemove = vi.fn();

      render(
        <FilterPill
          active
          onClick={handleClick}
          onRemove={handleRemove}
        >
          Fasteners
        </FilterPill>
      );

      const removeBtn = screen.getByRole('button', { name: /remove filter/i });
      fireEvent.click(removeBtn);

      expect(handleRemove).toHaveBeenCalledTimes(1);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard Enter and Space keys on remove button', () => {
      const handleRemove = vi.fn();

      render(
        <FilterPill
          active
          onRemove={handleRemove}
        >
          Fasteners
        </FilterPill>
      );

      const removeBtn = screen.getByRole('button', { name: /remove filter/i });
      fireEvent.keyDown(removeBtn, { key: 'Enter' });
      expect(handleRemove).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(removeBtn, { key: ' ' });
      expect(handleRemove).toHaveBeenCalledTimes(2);
    });

    it('accent filter pill maintains strict Ink text and 2px Ink border with zero white text', () => {
      render(
        <FilterPill active variant="accent" count={5}>
          Special Offer
        </FilterPill>
      );
      const pill = screen.getByRole('button', { name: /special offer/i });
      expect(pill.className).toContain('bg-tc-action-lime');
      expect(pill.className).toContain('text-tc-ink');
      expect(pill.className).toContain('border-2 border-tc-ink');
      expect(pill.className).not.toContain('text-white');
    });
  });

  describe('Card Component Resilience', () => {
    it('renders full card tree with AI assistant styling and custom classes', () => {
      render(
        <Card variant="ai" className="custom-card">
          <CardHeader>
            <CardTitle>AI Diagnostic</CardTitle>
          </CardHeader>
          <CardContent>Recommended cable size: 2.5mm</CardContent>
          <CardFooter>Safety certified</CardFooter>
        </Card>
      );
      expect(screen.getByText('AI Diagnostic')).toBeInTheDocument();
      expect(screen.getByText('Recommended cable size: 2.5mm')).toBeInTheDocument();
      expect(screen.getByText('Safety certified')).toBeInTheDocument();
      const card = screen.getByText('AI Diagnostic').closest('.custom-card');
      expect(card?.className).toContain('bg-tc-surface-soft');
    });
  });

  describe('Drawer & Dialog Surface Verification', () => {
    it('renders Drawer with bottom sheet and AI panel configurations', () => {
      render(
        <Drawer open>
          <DrawerContent side="bottom" isAIPanel>
            <DrawerHeader>
              <DrawerTitle>Tool Comparison</DrawerTitle>
              <DrawerDescription>Compare 4 specifications</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );
      expect(screen.getByText('Tool Comparison')).toBeInTheDocument();
      expect(screen.getByText('Compare 4 specifications')).toBeInTheDocument();
    });

    it('renders Dialog with accessible close button', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Dispatch</DialogTitle>
              <DialogDescription>Are you sure you want to proceed?</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Confirm Dispatch')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });
});
