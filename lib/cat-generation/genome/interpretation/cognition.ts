// lib/genome/interpretation/cognition.ts

import type { IBehavior } from '@/models/Cats';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS } from '../regions';
import {
  extractRegion,
  countSymbolRuns,
  countRareSymbols,
  detectTandemRepeats,
  calculateEntropy,
  createDebugInfo
} from './utils';
import { interpretIntelligenceStat } from './statInterpreters';

/**
 * Interpret Behavioral Drivers subregion → aggression, curiosity, loyalty, chaos
 * 
 * Each behavior uses a unique algorithm:
 * - Aggression: count dominant symbol runs (3+ consecutive identical symbols)
 * - Curiosity: count rare symbols (appearing <5 times)
 * - Loyalty: count unique tandem repeats
 * - Chaos: calculate entropy (symbol diversity)
 */
function interpretBehavior(
  genome: string,
  debug: boolean
): { behavior: IBehavior; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.BEHAVIOR;
  const segment = extractRegion(genome, start, end);
  
  // Aggression: count dominant symbol runs (3+ consecutive identical symbols)
  const runs = countSymbolRuns(segment, 3);
  const aggression = Math.min(10, 1 + Math.floor(runs / 2));
  
  // Curiosity: count rare symbols (appearing <5 times)
  const rareCount = countRareSymbols(segment, 5);
  const curiosity = Math.min(10, 1 + rareCount);
  
  // Loyalty: count unique tandem repeats
  const repeats = detectTandemRepeats(segment);
  const loyalty = Math.min(10, 1 + repeats.length);
  
  // Chaos: calculate entropy
  const entropy = calculateEntropy(segment);
  const chaos = Math.min(10, 1 + Math.floor(entropy * 3));
  
  const behavior: IBehavior = {
    aggression,
    curiosity,
    loyalty,
    chaos
  };
  
  const result: { behavior: IBehavior; debugInfo?: DebugInfo } = { behavior };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Behavioral Drivers', segment, {
      includeEntropy: true,
      includeRepeats: true
    });
    result.debugInfo.derivedValue = {
      behavior,
      breakdown: { 
        runs, 
        rareCount, 
        repeatCount: repeats.length, 
        entropy 
      }
    };
  }
  
  return result;
}

/**
 * Main cognition interpreter
 * Interprets entire Cognition region (600-799) → Intelligence + Behavior
 */
export function interpretCognition(
  genome: string,
  debug: boolean = false
): InterpretationResult<{ intelligence: number; behavior: IBehavior }> {
  const { start, end } = SUBREGIONS.INTELLIGENCE;
  const segment = extractRegion(genome, start, end);
  
  // Intelligence stat: use new opposing forces interpreter
  const intelligenceResult = interpretIntelligenceStat(segment, debug);
  const intelligence = intelligenceResult.value;
  
  // Behavior: unchanged logic
  const behaviorResult = interpretBehavior(genome, debug);
  
  const result: InterpretationResult<{ intelligence: number; behavior: IBehavior }> = {
    value: {
      intelligence,
      behavior: behaviorResult.behavior
    }
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Cognition (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: {
        intelligence,
        intelligenceBreakdown: intelligenceResult.debugInfo,
        behavior: behaviorResult.behavior
      }
    };
  }
  
  return result;
}