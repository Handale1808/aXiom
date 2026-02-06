// lib/components/about/stats/hooks/useStatCalculation.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculateStat } from '../utils/statCalculations';
import type { StatConfig, CalculationResult } from '../utils/statCalculations';

interface UseStatCalculationOptions {
  animationDelay?: number;
}

interface UseStatCalculationReturn {
  result: CalculationResult | null;
  isCalculating: boolean;
  recalculate: () => void;
}

/**
 * Custom hook to calculate stats with animation state management
 * 
 * Handles:
 * - Calculating stats from genome segments
 * - Animation delay for smooth transitions
 * - Recalculation when genome changes
 * 
 * @param genome - Full 1000-base genome string
 * @param config - Stat configuration
 * @param options - Optional animation delay (default 300ms)
 * @returns Calculation result, loading state, and recalculate function
 */
export function useStatCalculation(
  genome: string,
  config: StatConfig,
  options: UseStatCalculationOptions = {}
): UseStatCalculationReturn {
  const { animationDelay = 300 } = options;
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const performCalculation = useCallback(() => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    setTimeout(() => {
      try {
        const calculationResult = calculateStat(genome, config);
        setResult(calculationResult);
      } catch (error) {
        console.error('Error calculating stat:', error);
        setResult(null);
      } finally {
        setIsCalculating(false);
      }
    }, animationDelay);
  }, [genome, config, animationDelay]);

  // Recalculate when genome or config changes
  useEffect(() => {
    performCalculation();
  }, [performCalculation]);

  const recalculate = useCallback(() => {
    performCalculation();
  }, [performCalculation]);

  return {
    result,
    isCalculating,
    recalculate,
  };
}