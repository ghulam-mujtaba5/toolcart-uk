# Handoff Report: Milestone 1 Native Touch Gestures Adversarial Challenge

- **Agent**: `challenger_m1_1` (Empirical Challenger)
- **Role**: critic, specialist
- **Working Directory**: `e:\ToolCart\.agents\teamwork\challenger_m1_1`
- **Recipient**: `orchestrator_mobile_ux_1` (`90f7f002-2562-4af1-b6d4-ce24843b9dd0`)
- **Milestone**: Milestone 1: Native Touch Gestures & Mobile Sheet Ergonomics
- **Explicit Verdict**: **`REQUEST_CHANGES`**

---

## 1. Observation

Direct code inspections, adversarial stress test authoring (`tests/ui/challenger-touch-gestures.test.tsx`), and test execution commands yield the following verifiable observations:

1. **`src/hooks/use-swipe-to-dismiss.ts` Implementation Analysis**:
   - In lines 129–141, `dragHandleProps` and `sheetProps` only bind `onTouchStart`, `onTouchMove`, and `onTouchEnd`:
     ```ts
     const dragHandleProps = {
       onTouchStart: handleTouchStart,
       onTouchMove: handleTouchMove,
       onTouchEnd: handleTouchEnd,
     };

     const sheetProps = {
       ref: sheetRef,
       style,
       onTouchStart: handleTouchStart,
       onTouchMove: handleTouchMove,
       onTouchEnd: handleTouchEnd,
     };
     ```
   - In lines 143–156, the returned interface exposes no cancellation handler (`handleTouchCancel` is completely missing from the hook).
   - In lines 81–116, `handleTouchEnd` evaluates `if (currentOffset >= threshold || isFlick) { onDismiss(); }`. If `touchcancel` were naively wired to `handleTouchEnd`, an interrupted gesture that crossed 80px would erroneously dismiss rather than aborting.

2. **Storefront Sheet Component Bindings**:
   - All 5 mobile drawer components bind `dragHandleProps`:
     - `src/components/storefront/compare-drawer.tsx` (line 125): `<DragHandle variant="dark" {...dragHandleProps} />`
     - `src/components/storefront/mini-basket.tsx` (line 62): `<DragHandle {...dragHandleProps} />`
     - `src/components/storefront/filter-sidebar.tsx` (line 306): `<DragHandle {...dragHandleProps} />`
     - `src/components/storefront/ai-assistant-drawer.tsx` (line 133): `<DragHandle {...dragHandleProps} />`
     - `src/components/storefront/header.tsx` (line 343): `<DragHandle label="Drag to dismiss navigation menu" {...mobileNavDragProps} />`

3. **Adversarial Stress Test Execution**:
   - Executed `npx vitest run tests/ui/challenger-touch-gestures.test.tsx`:
     ```
     FAIL  tests/ui/challenger-touch-gestures.test.tsx > Adversarial Challenger Suite: Mobile Touch Gestures & Drag Handles > 5. Adversarial TouchCancel & Gesture Cancellation > verifies whether dragHandleProps exposes onTouchCancel or handles touchcancel
     AssertionError: expected false to be true // Object.is equality
     - Expected: true
     + Received: false
     tests/ui/challenger-touch-gestures.test.tsx:617:32

     FAIL  tests/ui/challenger-touch-gestures.test.tsx > Adversarial Challenger Suite: Mobile Touch Gestures & Drag Handles > 5. Adversarial TouchCancel & Gesture Cancellation > resets isDragging to false and translateY to 0 on touchcancel without firing onDismiss
     Error: expect(element).toHaveTextContent()
     Expected element to have text content: false
     Received: true
     tests/ui/challenger-touch-gestures.test.tsx:656:49

     FAIL  tests/ui/challenger-touch-gestures.test.tsx > Adversarial Challenger Suite: Mobile Touch Gestures & Drag Handles > 5. Adversarial TouchCancel & Gesture Cancellation > touchcancel past threshold distance does NOT dismiss the sheet (aborts instead)
     Error: expect(element).toHaveTextContent()
     Expected element to have text content: false
     Received: true
     tests/ui/challenger-touch-gestures.test.tsx:698:49

     Test Files  1 failed (1)
          Tests  3 failed | 16 passed (19)
       Duration  6.32s
     ```

4. **Passing Stress Dimensions (16/19 Passed)**:
   - **Upward Drags (`deltaY < 0`)**: Verified that pure upward drag (clientY 200 -> 50) and aggressive reverse upward drag strictly clamp `translateY = 0` and do not dismiss. Verified leftward drags on horizontal drawer clamp `translateX = 0`. Verified CompareDrawer upward swipe on drag handle leaves modal intact.
   - **Micro-Drags (`deltaY < threshold`)**: Verified that small drags (5px, 20px, 40px) smoothly reset to `translateY = 0` without dismissing. Verified near-boundary slow drag (79px on 80px threshold over 1000ms) does not dismiss. Verified zero-distance tap does not dismiss. Verified MiniBasket micro-drag does not dismiss.
   - **Rapid Swipe Velocity (`velocity > 0.5px/ms`)**: Verified fast flick (55px in 40ms = 1.375px/ms) dismisses even though 55px < 120px threshold. Verified flick guard protects against micro-taps (< minFlickDistance 48px). Verified upward flick does not dismiss. Verified horizontal fast flick dismisses.
   - **Multi-Touch Isolation**: Verified primary drag exclusively tracks finger 0; secondary finger placement at `clientY = 450` does not corrupt or hijack drag coordinates. Verified 3 simultaneous touches handled safely.
   - **Stress Thrashing**: Verified 50 rapid sequential touch cycles complete with zero state drift or memory leakage.

---

## 2. Logic Chain

1. **Premise**: In mobile operating systems (iOS Safari, Android Chrome), touch interactions are frequently interrupted by system events: incoming push notifications, phone calls, palm rejection, control center gestures, home bar navigation gestures, or tab switching. The W3C Touch Events Level 2 specification designates `touchcancel` as the authoritative signal that the user's touch has been cancelled or disrupted.
2. **Defect Mechanism**:
   - As observed in Observation 1, `useSwipeToDismiss` provides `dragHandleProps` and `sheetProps` that omit `onTouchCancel`.
   - When a user touches down and begins dragging a bottom sheet, `isDragging` transitions to `true`, `offset` updates to the active `deltaY` (e.g., 60px), and `style.transition` is set to `'none'`.
   - If an OS `touchcancel` event fires on the `DragHandle` or the sheet, no event listener catches it.
   - Consequently, as proved empirically in Observation 3, `isDragging` remains permanently stuck as `true`, `translateY` remains permanently stuck at `60px`, and the spring return transition never fires.
3. **Blast Radius**:
   - Because all 5 storefront bottom sheets (`CompareDrawer`, `MiniBasket`, `FilterSidebar`, `AIAssistantDrawer`, `Header` mobile menu) rely directly on `dragHandleProps` (Observation 2), any user whose drag is interrupted by an OS gesture or notification will find the modal stuck permanently in a broken, half-dragged state with frozen touch listeners.
4. **Cancellation vs. Dismissal Semantics**:
   - Simply binding `onTouchCancel: handleTouchEnd` would introduce a secondary bug: if the user was dragging past the 80px threshold when the gesture was interrupted, `handleTouchEnd` would fire `onDismiss()`. A cancelled gesture must abort and reset to 0, never trigger modal dismissal.

---

## 3. Caveats

- **No Caveats on Findings**: The defect is 100% reproducible through the automated Vitest harness (`tests/ui/challenger-touch-gestures.test.tsx`).
- **Scope Isolation**: Upward drag clamping, micro-drag spring return, rapid flick velocity detection, and multi-touch isolation all pass cleanly under extreme adversarial stress. The defect is strictly isolated to the omission of `touchcancel` lifecycle management in `src/hooks/use-swipe-to-dismiss.ts`.
- **Review-Only Constraint**: As per project rules, the Challenger does not modify production code directly. The exact fix is documented below for implementation by the Worker or Orchestrator.

---

## 4. Conclusion & Required Remediation

**Explicit Verdict**: **`REQUEST_CHANGES`**

The implementation of `useSwipeToDismiss` and `DragHandle` is robust against upward drags, micro-drags, rapid velocity swipes, and multi-touch inputs, but **fails on `touchcancel` event handling**, causing bottom sheets to freeze in a half-dragged state.

### Actionable Remediation Plan for Worker:
In `src/hooks/use-swipe-to-dismiss.ts`:

1. **Implement `handleTouchCancel`**:
   ```ts
   const handleTouchCancel = useCallback(() => {
     if (!enabled) return;
     startCoord.current = null;
     startTime.current = 0;
     offsetRef.current = 0;
     setIsDragging(false);
     setOffset(0);
   }, [enabled]);
   ```

2. **Attach `onTouchCancel` in `dragHandleProps`**:
   ```ts
   const dragHandleProps = {
     onTouchStart: handleTouchStart,
     onTouchMove: handleTouchMove,
     onTouchEnd: handleTouchEnd,
     onTouchCancel: handleTouchCancel,
   };
   ```

3. **Attach `onTouchCancel` in `sheetProps`**:
   ```ts
   const sheetProps = {
     ref: sheetRef,
     style,
     onTouchStart: handleTouchStart,
     onTouchMove: handleTouchMove,
     onTouchEnd: handleTouchEnd,
     onTouchCancel: handleTouchCancel,
   };
   ```

4. **Export `handleTouchCancel` in the return object**:
   ```ts
   return {
     handleTouchStart,
     handleTouchMove,
     handleTouchEnd,
     handleTouchCancel,
     translateY,
     translateX,
     offset,
     isDragging,
     sheetRef,
     style,
     dragHandleProps,
     sheetProps,
   };
   ```

---

## 5. Verification Method

To independently reproduce and verify this finding:

1. **Run Challenger Stress Test Suite**:
   ```powershell
   npx vitest run tests/ui/challenger-touch-gestures.test.tsx
   ```
   *Current Result*: 16 passed, 3 failed on `touchcancel` tests.
   *Target Result after remediation*: 19 passed (100%).

2. **Run Worker Test Suite**:
   ```powershell
   npx vitest run tests/ui/touch-gestures-sheets.test.tsx
   ```
   *Expected*: 30 passed.

3. **Run TypeScript Check & Static Check**:
   ```powershell
   npm run typecheck
   python qa/check_static.py
   ```
   *Expected*: Both pass with code 0.

4. **Invalidation Conditions**:
   - Any drawer remaining with `isDragging: true` after `fireEvent.touchCancel(handle)`.
   - Any drawer firing `onDismiss()` when cancelled past threshold.
   - Any missing `onTouchCancel` property in `dragHandleProps` or `sheetProps`.
