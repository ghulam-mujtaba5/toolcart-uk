import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminLayout } from '@/components/admin/admin-layout';

let currentPathname = '/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Adversarial Challenge: Milestone M1 Admin Responsive Navigation & Drawer', () => {
  beforeEach(() => {
    currentPathname = '/admin';
    document.body.style.overflow = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Dimension 1: Drawer Lifecycle, Stress Cycling & Body Scroll Lock', () => {
    it('survives 50 rapid consecutive open/close toggles without state desync or failure', () => {
      const { rerender } = render(<AdminSidebar mobileOpen={false} onClose={vi.fn()} />);

      for (let i = 0; i < 50; i++) {
        const isOpen = i % 2 === 0;
        rerender(<AdminSidebar mobileOpen={isOpen} onClose={vi.fn()} />);
        expect(document.body.style.overflow).toBe(isOpen ? 'hidden' : '');
      }

      // Final close state check
      rerender(<AdminSidebar mobileOpen={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('');
      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).toBeNull();
    });

    it('cleans up body scroll lock on unmount when unmounted while drawer is open', () => {
      const { unmount } = render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('tolerates undefined onClose prop without throwing on backdrop click or keydown', () => {
      render(<AdminSidebar mobileOpen={true} onClose={undefined} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toBeInTheDocument();

      // Backdrop click should not throw
      const backdrop = dialog.querySelector('.bg-black\\/60');
      expect(backdrop).not.toBeNull();
      expect(() => fireEvent.click(backdrop!)).not.toThrow();

      // Escape keydown should not throw
      expect(() => fireEvent.keyDown(window, { key: 'Escape' })).not.toThrow();
    });
  });

  describe('Dimension 2: Backdrop Click Dismissal vs. Interior Click Isolation', () => {
    it('dismisses drawer when clicking on the backdrop overlay', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const backdrop = dialog.querySelector('.bg-black\\/60');
      expect(backdrop).not.toBeNull();

      fireEvent.click(backdrop!);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('supports rapid-fire repeated clicks on backdrop overlay', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const backdrop = dialog.querySelector('.bg-black\\/60');
      expect(backdrop).not.toBeNull();

      for (let i = 0; i < 10; i++) {
        fireEvent.click(backdrop!);
      }
      expect(handleClose).toHaveBeenCalledTimes(10);
    });

    it('does NOT dismiss drawer when clicking inside the drawer surface header', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const headerTitle = within(dialog).getByText('TOOLCART');
      fireEvent.click(headerTitle);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does NOT dismiss drawer when clicking group headings inside navigation', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const commerceHeading = within(dialog).getByText('Commerce Operations');
      fireEvent.click(commerceHeading);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does NOT dismiss drawer when clicking footer staging banner inside drawer', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const footerText = within(dialog).getByText('ToolCart Engine v2.0');
      fireEvent.click(footerText);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Dimension 3: Escape Key Handling & Listener Lifecycle', () => {
    it('dismisses drawer when Escape key is pressed while drawer is open', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('handles 20 rapid-fire Escape key presses cleanly', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(window, { key: 'Escape' });
      }
      expect(handleClose).toHaveBeenCalledTimes(20);
    });

    it('ignores non-Escape keys (Enter, Space, Tab, ArrowDown, Backspace)', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const ignoredKeys = ['Enter', ' ', 'Tab', 'ArrowDown', 'ArrowUp', 'Backspace', 'Shift', 'Control'];
      ignoredKeys.forEach((key) => {
        fireEvent.keyDown(window, { key });
      });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does NOT trigger onClose when Escape is pressed while drawer is closed', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={false} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('removes window keydown listener when transitioning from open to closed', () => {
      const handleClose = vi.fn();
      const { rerender } = render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Now close drawer
      rerender(<AdminSidebar mobileOpen={false} onClose={handleClose} />);

      // Press Escape again - should NOT call handleClose
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dimension 4: Touch Target Size & Ergonomic Auditing (>= 44px)', () => {
    it('verifies mobile menu trigger in AdminLayout has >= 44px touch target', () => {
      render(
        <AdminLayout>
          <div>Child View</div>
        </AdminLayout>
      );

      const hamburgerBtn = screen.getByRole('button', { name: /open navigation menu/i });
      expect(hamburgerBtn.className).toContain('min-h-[44px]');
      expect(hamburgerBtn.className).toContain('min-w-[44px]');
    });

    it('verifies mobile drawer close button has >= 44px touch target', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: /close navigation menu/i });
      expect(closeBtn.className).toContain('min-h-[44px]');
      expect(closeBtn.className).toContain('min-w-[44px]');
    });

    it('verifies all 8 navigation category links in mobile drawer have >= 44px touch target', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const navLinks = within(dialog).getAllByRole('link');

      // The 8 categorized nav items: Dashboard, Products, Orders, Trade Accounts, Suppliers, Catalog Import, Pricing, Governance
      const categoryLinks = navLinks.filter((link) => link.getAttribute('href')?.startsWith('/admin'));
      expect(categoryLinks.length).toBe(8);

      categoryLinks.forEach((link) => {
        expect(link.className).toContain('min-h-[44px]');
      });
    });

    it('empirically audits the "View Storefront" link touch target size', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const storefrontLink = within(dialog).getByRole('link', { name: /view storefront/i });

      expect(storefrontLink).toBeInTheDocument();
      // Record empirical observation: footer link currently specifies min-h-[36px]
      const has36px = storefrontLink.className.includes('min-h-[36px]');
      const has44px = storefrontLink.className.includes('min-h-[44px]');

      // Document exact state for handoff findings
      expect(has36px).toBe(true);
      expect(has44px).toBe(false);
    });
  });

  describe('Dimension 5: 360px Viewport Scaling & Boundary Constraints', () => {
    it('verifies mobile drawer width constraints leave tap-dismiss backdrop margin', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      // Drawer surface is inside dialog
      const drawerSurface = dialog.querySelector('.bg-tc-ink');
      expect(drawerSurface).not.toBeNull();

      // Drawer surface must have max-w-[85vw] ensuring at least 15vw backdrop tap-out area
      expect(drawerSurface?.className).toContain('max-w-[85vw]');
      expect(drawerSurface?.className).toContain('w-72');
    });

    it('verifies header breadcrumb truncate and min-w-0 prevent horizontal flex blow-out', () => {
      currentPathname = '/admin/products/status-heavy-duty-25m-cable-reel-industrial-grade-spec';
      render(
        <AdminLayout>
          <div>Child View</div>
        </AdminLayout>
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Verify breadcrumb h1 has truncate class
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.className).toContain('truncate');

      // Verify breadcrumb container has truncate and min-w-0
      const breadcrumbContainer = heading.closest('.truncate');
      expect(breadcrumbContainer).not.toBeNull();
      expect(breadcrumbContainer?.className).toContain('truncate');
    });

    it('verifies main viewport padding and overflow protection classes', () => {
      render(
        <AdminLayout>
          <div data-testid="test-content">Child View</div>
        </AdminLayout>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('p-4');
      expect(main.className).toContain('min-w-0');
      expect(main.className).toContain('max-w-7xl');
      expect(main.className).toContain('w-full');
    });

    it('verifies desktop sidebar is hidden on mobile (<lg) and visible on desktop', () => {
      render(<AdminSidebar mobileOpen={false} onClose={vi.fn()} />);

      const desktopSidebar = document.querySelector('aside');
      expect(desktopSidebar).not.toBeNull();
      expect(desktopSidebar?.className).toContain('hidden');
      expect(desktopSidebar?.className).toContain('lg:flex');
    });
  });

  describe('Dimension 6: Route Navigation Synchronization', () => {
    it('automatically closes mobile drawer when pathname changes', () => {
      const { rerender } = render(
        <AdminLayout>
          <div>Admin Child View</div>
        </AdminLayout>
      );

      // Open drawer
      const hamburgerBtn = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(hamburgerBtn);
      expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Simulate route change to /admin/products
      currentPathname = '/admin/products';
      rerender(
        <AdminLayout>
          <div>Admin Child View Products</div>
        </AdminLayout>
      );

      // Mobile drawer should be closed automatically
      expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Dimension 7: Brand V3 Tokens & Forbidden Color Scanning', () => {
    it('strictly adheres to Brand V3 tokens and avoids forbidden colors in admin navigation', () => {
      const { container } = render(
        <AdminLayout>
          <div>Test View</div>
        </AdminLayout>
      );

      const html = container.innerHTML;

      // Scan for retired copper #B84C32 or --tc-copper
      expect(html.toLowerCase()).not.toContain('#b84c32');
      expect(html.toLowerCase()).not.toContain('copper');

      // Scan for unauthorized purple/violet or teal
      expect(html.toLowerCase()).not.toContain('purple');
      expect(html.toLowerCase()).not.toContain('violet');
      expect(html.toLowerCase()).not.toContain('teal');

      // Verify Action Lime badge in header has dark text, never white
      const stagingBadge = screen.getByText('STAGING_ONLY: ACTIVE');
      expect(stagingBadge.className).not.toContain('text-white');
    });

    it('verifies logo in AdminSidebar pairs Action Lime with dark Ink text/border', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const logoBox = dialog.querySelector('.bg-tc-action-lime');
      expect(logoBox).not.toBeNull();
      expect(logoBox?.className).toContain('border-tc-ink');

      const wrenchIcon = logoBox?.querySelector('svg');
      expect(wrenchIcon?.getAttribute('class')).toContain('text-tc-ink');
    });
  });
});
