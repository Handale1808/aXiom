// lib/about/genome/useGenomeAnimation.ts

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGenomeAnimationReturn {
  progress: number;
  isAnimating: boolean;
  isComplete: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Custom hook to manage genome generation animation state
 * Handles base-by-base reveal animation with play/pause/reset controls
 * 
 * @param totalBases - Total number of bases to animate (default 1000)
 * @param speed - Milliseconds per base (default 3ms = 3 second total animation)
 * @returns Animation state and control functions
 */
export function useGenomeAnimation(
  totalBases: number = 1000,
  speed: number = 3
): UseGenomeAnimationReturn {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const isComplete = progress >= totalBases;

  const play = useCallback(() => {
    if (progress >= totalBases) {
      return;
    }
    setIsAnimating(true);
    lastUpdateRef.current = performance.now();
  }, [progress, totalBases]);

  const pause = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnimating(false);
    setProgress(0);
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastUpdateRef.current;

      if (elapsed >= speed) {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= totalBases) {
            setIsAnimating(false);
            return totalBases;
          }
          return next;
        });
        lastUpdateRef.current = currentTime;
      }

      if (progress < totalBases) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, progress, speed, totalBases]);

  return {
    progress,
    isAnimating,
    isComplete,
    play,
    pause,
    reset,
  };
}