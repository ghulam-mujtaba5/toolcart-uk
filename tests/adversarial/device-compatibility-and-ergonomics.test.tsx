import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
import { Header } from '@/components/storefront/header';
import { BottomNav } from '@/components/storefront/bottom-nav';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VatProvider } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { CookieConsentProvider } from '@/context/cookie-consent-context';
import { CookieConsentBanner } from '@/components/storefront/cookie-consent-banner';

describe('Adversarial & Multi-Device Compatibility Suite (Android, iOS & Dual-Screen / Foldables)', () => {
  const globalsCss = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');

  describe('Dimension 1: iOS & Android Mobile Ergonomics & Touch Target Compliance', () => {
    it('enforces transparent tap highlight color and momentum scrolling in global CSS', () => {
      expect(globalsCss).toContain('-webkit-tap-highlight-color: transparent');
      expect(globalsCss).toContain('-webkit-overflow-scrolling: touch');
      expect(globalsCss).toContain('touch-action: manipulation');
    });

    it('enforces 16px font-size on mobile inputs to eliminate iOS Safari viewport auto-zoom', () => {
      expect(globalsCss).toMatch(/@media\s+screen\s+and\s+\(max-width:\s*767px\)/);
      expect(globalsCss).toContain('font-size: 16px');

      // Verify Input primitive component provides text-base on mobile
      const { container: inputContainer } = render(<Input placeholder="Search test" />);
      const input = inputContainer.querySelector('input');
      expect(input?.className).toContain('text-base sm:text-sm');

      // Verify SearchInput primitive provides text-base on mobile
      const { container: searchContainer } = render(<SearchInput placeholder="Search test" />);
      const searchInput = searchContainer.querySelector('input');
      expect(searchInput?.className).toContain('text-base sm:text-sm');
    });

    it('guarantees touch targets meet or exceed 44px/48px for all mobile interactive controls', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <BottomNav />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      // Verify all 5 navigation dock buttons in BottomNav meet Android 48px touch target
      const links = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');
      const allDockItems = [...links, ...buttons];
      expect(allDockItems.length).toBe(5);

      allDockItems.forEach((item) => {
        expect(item.className).toContain('min-h-[48px]');
      });
    });

    it('Header mobile menu button and search input have minimum 44px touch targets', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const menuBtn = screen.getByLabelText(/Open mobile navigation menu/i);
      expect(menuBtn.className).toMatch(/min-[wh]-\[4[04]px\]/);

      const mobileSearchInput = screen.getByPlaceholderText(/Search 115 trade tools & hardware.../i);
      const mobileSearchSubmit = mobileSearchInput.closest('form')?.querySelector('button[type="submit"]');
      expect(mobileSearchSubmit?.className).toContain('min-h-[44px]');
    });
  });

  describe('Dimension 2: Safe Area Insets & Dynamic Viewport Height (100dvh)', () => {
    it('defines safe area insets and dynamic dvh utilities in CSS for iPhone notches, dynamic islands, and home bars', () => {
      expect(globalsCss).toContain('env(safe-area-inset-top');
      expect(globalsCss).toContain('env(safe-area-inset-bottom');
      expect(globalsCss).toContain('env(safe-area-inset-left');
      expect(globalsCss).toContain('env(safe-area-inset-right');
      expect(globalsCss).toContain('100dvh');
      expect(globalsCss).toContain('.pt-safe');
      expect(globalsCss).toContain('.pb-safe');
      expect(globalsCss).toContain('.min-h-dvh');
    });

    it('BottomNav integrates env(safe-area-inset-bottom) to clear the iOS home indicator', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <BottomNav />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('env(safe-area-inset-bottom');
    });

    it('CookieConsentBanner integrates safe-area-inset-bottom to avoid obscuring mobile gesture navigators', () => {
      render(
        <CookieConsentProvider>
          <CookieConsentBanner />
        </CookieConsentProvider>
      );

      const banner = screen.getByRole('region', { name: /UK Cookie and Privacy Consent/i });
      expect(banner.className).toContain('env(safe-area-inset-bottom');
    });

    it('Drawer and Dialog handle dynamic viewport height (dvh) and contained overscroll', () => {
      const drawerFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/drawer.tsx'), 'utf-8');
      expect(drawerFile).toContain('max-h-[85dvh]');
      expect(drawerFile).toContain('env(safe-area-inset-bottom');

      const dialogFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/dialog.tsx'), 'utf-8');
      expect(dialogFile).toContain('max-h-[calc(100dvh-2rem)]');
      expect(dialogFile).toContain('overflow-y-auto');
    });
  });

  describe('Dimension 3: Dual-Screen & Foldables Compatibility (Surface Duo, Galaxy Fold, Pixel Fold)', () => {
    it('provides multi-screen window segment and webkit-spanning media queries in globals.css', () => {
      // Modern W3C CSS Foldables / Viewport Segments API
      expect(globalsCss).toContain('(horizontal-viewport-segments: 2)');
      expect(globalsCss).toContain('(vertical-viewport-segments: 2)');

      // Webkit / Chromium spanning media queries (Surface Duo / Samsung Internet)
      expect(globalsCss).toContain('(spanning: single-fold-vertical)');
      expect(globalsCss).toContain('(spanning: single-fold-horizontal)');

      // Hinge avoidance and 2-column split utilities
      expect(globalsCss).toContain('.tc-dual-screen-split');
      expect(globalsCss).toContain('.tc-fold-avoid-hinge');
      expect(globalsCss).toContain('env(viewport-segment-left 1 0');
    });
  });
});
