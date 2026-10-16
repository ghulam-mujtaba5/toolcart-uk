'use client';

import { useState, useRef, useCallback } from 'react';

export interface UseSwipeToDismissOptions {
  onDismiss: () => void;
  threshold?: number;
  velocityThreshold?: number;
  direction?: 'down' | 'right';
  enabled?: boolean;
}

/**
 * useSwipeToDismiss: Reusable gesture hook for mobile bottom sheets and slide-over drawers.
 * Tracks touch movement, enforces directional dragging (downward for sheets, rightward for side drawers),
 * triggers dismissal on threshold or flick velocity, and smoothly springs back on release.
 */
export function useSwipeToDismiss({
  onDismiss,
  threshold = 80,
  velocityThreshold = 0.5,
  direction = 'down',
  enabled = true,
}: UseSwipeToDismissOptions) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startCoord = useRef<{ x: number; y: number } | null>(null);
  const startTime = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const isScrollingContent = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches?.[0];
      if (!touch) return;
      startCoord.current = {
        x: touch.clientX ?? 0,
        y: touch.clientY ?? 0,
      };
      startTime.current = Date.now();
      isScrollingContent.current = false;
      setIsDragging(true);
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!enabled || !startCoord.current) return;
      const touch = e.touches?.[0];
      if (!touch) return;

      const clientX = touch.clientX ?? 0;
      const clientY = touch.clientY ?? 0;
      const deltaX = clientX - startCoord.current.x;
      const deltaY = clientY - startCoord.current.y;

      if (direction === 'down') {
        // Only allow downward dragging (deltaY > 0)
        if (deltaY > 0) {
          offsetRef.current = deltaY;
          setOffset(deltaY);
        } else {
          offsetRef.current = 0;
          setOffset(0);
        }
      } else if (direction === 'right') {
        // Only allow rightward dragging (deltaX > 0)
        if (deltaX > 0) {
          offsetRef.current = deltaX;
          setOffset(deltaX);
        } else {
          offsetRef.current = 0;
          setOffset(0);
        }
      }
    },
    [direction, enabled]
  );

  const handleTouchEnd = useCallback(
    (e?: React.TouchEvent | TouchEvent) => {
      if (!enabled || !startCoord.current) return;
      setIsDragging(false);

      let currentOffset = offsetRef.current;
      if (e?.changedTouches?.[0]) {
        const touch = e.changedTouches[0];
        const clientX = touch.clientX ?? 0;
        const clientY = touch.clientY ?? 0;
        if (direction === 'down') {
          const deltaY = clientY - startCoord.current.y;
          if (deltaY > 0) currentOffset = Math.max(currentOffset, deltaY);
        } else if (direction === 'right') {
          const deltaX = clientX - startCoord.current.x;
          if (deltaX > 0) currentOffset = Math.max(currentOffset, deltaX);
        }
      }

      const elapsedMs = Math.max(1, Date.now() - startTime.current);
      const velocity = currentOffset / elapsedMs;
      const minFlickDistance = Math.min(threshold * 0.6, 50);
      const isFlick = currentOffset >= minFlickDistance && velocity > velocityThreshold;

      startCoord.current = null;
      startTime.current = 0;
      isScrollingContent.current = false;

      if (currentOffset >= threshold || isFlick) {
        onDismiss();
      }

      offsetRef.current = 0;
      setOffset(0);
    },
    [direction, enabled, onDismiss, threshold, velocityThreshold]
  );

  const handleTouchCancel = useCallback(
    (_e?: React.TouchEvent | TouchEvent) => {
      if (!enabled) return;
      setIsDragging(false);
      startCoord.current = null;
      startTime.current = 0;
      isScrollingContent.current = false;
      offsetRef.current = 0;
      setOffset(0);
    },
    [enabled]
  );

  const translateY = direction === 'down' ? Math.max(0, offset) : 0;
  const translateX = direction === 'right' ? Math.max(0, offset) : 0;

  const style: React.CSSProperties = {
    transform:
      direction === 'down'
        ? `translateY(${translateY}px)`
        : `translateX(${translateX}px)`,
    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const dragHandleProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };

  const sheetProps = {
    ref: sheetRef,
    style,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };

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
}
