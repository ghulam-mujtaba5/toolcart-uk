import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { DragHandle } from '@/components/ui/drag-handle';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { Header } from '@/components/storefront/header';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/tools',
}));

const mockProduct: PublicProductDTO = {
  id: 'prod-challenge-001',
  slug: 'dewalt-drill-challenge',
  title: 'DeWalt 18V Brushless Combi Drill Challenger',
  description: 'Adversarial testing product for mobile gesture suites.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'DeWalt',
  gtin: '5012345678999',
  supplier_sku: 'DEW-CHALLENGE-01',
  supplier_id: 'sup-status-001',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 180.0,
  retail_price_ex_vat_gbp: 150.0,
  units_per_pack: 1,
  units_per_case: 2,
  case_pack_description: 'Box of 2',
  stock_quantity: 15,
  availability_status: 'in_stock',
  lead_time_days: '1 day',
  weight_grams: 1750,
  images: ['/images/products/DEW-CHALLENGE.png'],
  specifications: { Voltage: '18V', Chuck: '13mm', Speed: '2000 RPM' },
  compliance_verified: true,
  image_license_verified: true,
};

describe('Adversarial Challenger Suite: Mobile Touch Gestures & Drag Handles', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Upward Drags (deltaY < 0)
  // =========================================================================
  describe('1. Adversarial Upward Drags (deltaY < 0)', () => {
    it('strictly clamps translateY and offset to 0 during pure upward drag', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 200, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.isDragging).toBe(true);

      // Drag UPWARD by 150px (clientY goes from 200 to 50)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 50, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);
      expect(result.current.style.transform).toBe('translateY(0px)');

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 50, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);
      expect(result.current.isDragging).toBe(false);
    });

    it('clamps back to 0 when user pulls down then aggressively reverses upward past start point', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 200, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      // Pull down 60px
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 260, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(60);
      expect(result.current.translateY).toBe(60);

      // Reverse upward past starting position (clientY = 150, deltaY = -50)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 150, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 150, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
    });

    it('strictly clamps translateX to 0 when user drags left on rightward slide-out drawer', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'right' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      // Drag LEFT by 80px (clientX = 120, deltaX = -80)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientX: 120, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(0);
      expect(result.current.translateX).toBe(0);
      expect(result.current.style.transform).toBe('translateX(0px)');

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 120, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('swiping up on CompareDrawer DragHandle does not dismiss or misplace the modal', () => {
      function CompareHarness() {
        const { addProduct, openCompare } = useCompare();
        return (
          <button
            type="button"
            onClick={() => {
              addProduct(mockProduct);
              openCompare();
            }}
          >
            Open Compare
          </button>
        );
      }

      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareHarness />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare' }));
      const dialog = screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i });
      expect(dialog).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 300, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 100, clientX: 100 }] });

      expect(screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. Micro-Drags (deltaY < threshold)
  // =========================================================================
  describe('2. Adversarial Micro-Drags (deltaY < threshold)', () => {
    it('resets translateY to 0 without dismissal on small downward micro-drags (5px, 20px, 40px)', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      // Micro-drag 1: 5px
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 105, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.translateY).toBe(5);
      act(() => {
        result.current.handleTouchEnd();
      });
      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.translateY).toBe(0);

      // Micro-drag 2: 40px
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 140, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.translateY).toBe(40);
      act(() => {
        result.current.handleTouchEnd();
      });
      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.translateY).toBe(0);
    });

    it('does not dismiss when dragging to near-threshold boundary (79px with threshold 80px)', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      const fakeStartTime = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(fakeStartTime);

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 179, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(79);

      // Simulate slow drag: 1000ms elapsed -> velocity = 79 / 1000 = 0.079 < 0.5
      vi.spyOn(Date, 'now').mockReturnValue(fakeStartTime + 1000);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 179, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);
      expect(result.current.style.transform).toBe('translateY(0px)');
    });

    it('zero-distance tap does not fire dismissal or leave non-zero offset', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 150, clientX: 150 }],
        } as unknown as React.TouchEvent);
      });
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 150, clientX: 150 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
      expect(result.current.isDragging).toBe(false);
    });

    it('micro-drag on MiniBasket drag handle does not dismiss basket', () => {
      function CartHarness() {
        const { addItem } = useCart();
        return (
          <button type="button" onClick={() => addItem(mockProduct, 1)}>
            Open Cart
          </button>
        );
      }

      render(
        <VatProvider>
          <CartProvider>
            <CartHarness />
            <MiniBasket />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Cart' }));
      expect(screen.getByRole('dialog', { name: /Your Basket/i })).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 135, clientX: 100 }] });
      fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 135, clientX: 100 }] });

      expect(screen.getByRole('dialog', { name: /Your Basket/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. Rapid Swipe Velocity (Flick Gestures)
  // =========================================================================
  describe('3. Adversarial Rapid Swipe Velocity', () => {
    it('triggers onDismiss on fast flick (velocity > 0.5px/ms) even when total distance is below threshold', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({
          onDismiss,
          threshold: 120, // High threshold
          velocityThreshold: 0.5,
          direction: 'down',
        })
      );

      const t0 = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(t0);

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      // Drag 55px (well below 120px threshold, but >= minFlickDistance = min(120*0.6, 50) = 50)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 155, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      // 40ms elapsed -> velocity = 55 / 40 = 1.375 px/ms > 0.5 px/ms
      vi.spyOn(Date, 'now').mockReturnValue(t0 + 40);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 155, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('protects against accidental dismissal on ultra-fast micro-flicks (< minFlickDistance)', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({
          onDismiss,
          threshold: 80,
          velocityThreshold: 0.5,
          direction: 'down',
        })
      );

      const t0 = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(t0);

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      // Quick 25px twitch in 10ms -> velocity = 2.5 px/ms, but 25px < minFlickDistance (48px)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 125, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      vi.spyOn(Date, 'now').mockReturnValue(t0 + 10);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 125, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('rejects rapid upward flick (-100px in 20ms) and never calls onDismiss', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({
          onDismiss,
          threshold: 80,
          velocityThreshold: 0.5,
          direction: 'down',
        })
      );

      const t0 = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(t0);

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 200, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      vi.spyOn(Date, 'now').mockReturnValue(t0 + 20);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('triggers dismissal on fast rightward flick on horizontal drawer', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({
          onDismiss,
          threshold: 100,
          velocityThreshold: 0.5,
          direction: 'right',
        })
      );

      const t0 = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(t0);

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 50, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientX: 110, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      vi.spyOn(Date, 'now').mockReturnValue(t0 + 30); // 60px / 30ms = 2.0 px/ms

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 110, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 4. Multi-Touch Fingers Isolation
  // =========================================================================
  describe('4. Adversarial Multi-Touch Fingers Isolation', () => {
    it('primary drag tracks finger 0 and ignores second finger placement coordinates', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      // Finger 1 touches down at clientY = 100
      act(() => {
        result.current.handleTouchStart({
          touches: [
            { identifier: 0, clientY: 100, clientX: 50 },
          ],
        } as unknown as React.TouchEvent);
      });

      // Finger 2 touches down at clientY = 450, finger 1 moves slightly to clientY = 130
      act(() => {
        result.current.handleTouchMove({
          touches: [
            { identifier: 0, clientY: 130, clientX: 50 },
            { identifier: 1, clientY: 450, clientX: 300 },
          ],
        } as unknown as React.TouchEvent);
      });

      // Offset must track finger 0 (130 - 100 = 30), NOT finger 1 (450 - 100 = 350)
      expect(result.current.offset).toBe(30);
      expect(result.current.translateY).toBe(30);

      // Finger 2 moves dramatically to clientY = 600 while finger 1 stays at clientY = 130
      act(() => {
        result.current.handleTouchMove({
          touches: [
            { identifier: 0, clientY: 130, clientX: 50 },
            { identifier: 1, clientY: 600, clientX: 300 },
          ],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(30);
      expect(result.current.translateY).toBe(30);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ identifier: 0, clientY: 130, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
    });

    it('survives three simultaneous finger touches without exception or displacement error', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [
            { identifier: 0, clientY: 100, clientX: 50 },
            { identifier: 1, clientY: 200, clientX: 150 },
            { identifier: 2, clientY: 300, clientX: 250 },
          ],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [
            { identifier: 0, clientY: 140, clientX: 50 },
            { identifier: 1, clientY: 280, clientX: 150 },
            { identifier: 2, clientY: 400, clientX: 250 },
          ],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(40);
      expect(result.current.translateY).toBe(40);
    });
  });

  // =========================================================================
  // 5. TouchCancel Events & Drag State Cancellation
  // =========================================================================
  describe('5. Adversarial TouchCancel & Gesture Cancellation', () => {
    it('verifies whether dragHandleProps exposes onTouchCancel or handles touchcancel', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      // Verify what properties dragHandleProps provides
      expect(result.current.dragHandleProps).toBeDefined();
      expect(typeof result.current.dragHandleProps.onTouchStart).toBe('function');
      expect(typeof result.current.dragHandleProps.onTouchMove).toBe('function');
      expect(typeof result.current.dragHandleProps.onTouchEnd).toBe('function');

      // Check whether onTouchCancel is wired into dragHandleProps
      const hasOnTouchCancel = 'onTouchCancel' in result.current.dragHandleProps;

      // In empirical challenge, if onTouchCancel is missing from dragHandleProps,
      // dispatching touchCancel on a component with dragHandleProps will leave the
      // dragging state stuck.
      expect(hasOnTouchCancel).toBe(true);
    });

    it('resets isDragging to false and translateY to 0 on touchcancel without firing onDismiss', () => {
      const onDismiss = vi.fn();

      function TouchHarness() {
        const { dragHandleProps, isDragging, translateY } = useSwipeToDismiss({
          onDismiss,
          threshold: 80,
          direction: 'down',
        });

        return (
          <div {...dragHandleProps} data-testid="gesture-harness">
            <span data-testid="is-dragging">{String(isDragging)}</span>
            <span data-testid="translate-y">{translateY}</span>
          </div>
        );
      }

      render(<TouchHarness />);
      const harness = screen.getByTestId('gesture-harness');

      // Start drag and move down 60px
      fireEvent.touchStart(harness, {
        touches: [{ clientY: 100, clientX: 50 }],
      });
      fireEvent.touchMove(harness, {
        touches: [{ clientY: 160, clientX: 50 }],
      });

      expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
      expect(screen.getByTestId('translate-y')).toHaveTextContent('60');

      // System interrupts touch gesture with touchcancel
      fireEvent.touchCancel(harness);

      // Harness must smoothly reset to neutral and NOT remain stuck in dragging state
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
      expect(screen.getByTestId('translate-y')).toHaveTextContent('0');
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('touchcancel past threshold distance does NOT dismiss the sheet (aborts instead)', () => {
      const onDismiss = vi.fn();

      function TouchHarnessPastThreshold() {
        const { dragHandleProps, isDragging, translateY } = useSwipeToDismiss({
          onDismiss,
          threshold: 80,
          direction: 'down',
        });

        return (
          <div {...dragHandleProps} data-testid="gesture-harness-past">
            <span data-testid="is-dragging">{String(isDragging)}</span>
            <span data-testid="translate-y">{translateY}</span>
          </div>
        );
      }

      render(<TouchHarnessPastThreshold />);
      const harness = screen.getByTestId('gesture-harness-past');

      // User drags down 100px (> 80px threshold)
      fireEvent.touchStart(harness, {
        touches: [{ clientY: 100, clientX: 50 }],
      });
      fireEvent.touchMove(harness, {
        touches: [{ clientY: 200, clientX: 50 }],
      });

      expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
      expect(screen.getByTestId('translate-y')).toHaveTextContent('100');

      // Touch gets cancelled by incoming call or OS gesture
      fireEvent.touchCancel(harness);

      // Must abort without triggering onDismiss
      expect(onDismiss).not.toHaveBeenCalled();
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
      expect(screen.getByTestId('translate-y')).toHaveTextContent('0');
    });
  });

  // =========================================================================
  // 6. Rapid Stress Thrashing & Resilience
  // =========================================================================
  describe('6. Rapid Stress Thrashing & Edge Cases', () => {
    it('survives 50 rapid sequential touch cycles without state drift or memory leakage', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.handleTouchStart({
            touches: [{ clientY: 100, clientX: 50 }],
          } as unknown as React.TouchEvent);
        });
        act(() => {
          result.current.handleTouchMove({
            touches: [{ clientY: 130, clientX: 50 }],
          } as unknown as React.TouchEvent);
        });
        act(() => {
          result.current.handleTouchEnd();
        });
        expect(result.current.isDragging).toBe(false);
        expect(result.current.offset).toBe(0);
        expect(result.current.translateY).toBe(0);
      }

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('safely handles empty or missing touches arrays without throwing', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      // Malformed touch events
      expect(() => {
        act(() => {
          result.current.handleTouchStart({} as unknown as React.TouchEvent);
          result.current.handleTouchMove({} as unknown as React.TouchEvent);
          result.current.handleTouchEnd({} as unknown as React.TouchEvent);
        });
      }).not.toThrow();

      expect(result.current.isDragging).toBe(false);
      expect(result.current.offset).toBe(0);
    });
  });
});
