// lib/genome/interpretation/cognition.ts

import type { IBehavior } from '@/models/Cats';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS } from '../regions';
import { extractRegion } from './utils';
import {
  interpretIntelligenceStat,
  interpretAggression,
  interpretCuriosity,
  interpretLoyalty,
  interpretChaos
} from './interpreters';

/**
 * Main cognition interpreter
 * Interprets entire Cognition region (600-799) → Intelligence + Behavior
 */
export function interpretCognition(
  genome: string,
  debug: boolean = false
): InterpretationResult<{ intelligence: number; behavior: IBehavior }> {
  // Intelligence Core subregion (600-699) → intelligence stat
  const { start, end } = SUBREGIONS.INTELLIGENCE;
  const intelligenceSegment = extractRegion(genome, start, end);
  
  const intelligenceResult = interpretIntelligenceStat(intelligenceSegment, debug);
  const intelligence = intelligenceResult.value;
  
  // Behavioral Drivers subregion (700-799) → behavior traits
  const behaviorSegment = extractRegion(genome, SUBREGIONS.BEHAVIOR.start, SUBREGIONS.BEHAVIOR.end);
  
  const aggressionResult = interpretAggression(behaviorSegment, debug);
  const curiosityResult = interpretCuriosity(behaviorSegment, debug);
  const loyaltyResult = interpretLoyalty(behaviorSegment, debug);
  const chaosResult = interpretChaos(behaviorSegment, debug);
  
  const behavior: IBehavior = {
    aggression: aggressionResult.value,
    curiosity: curiosityResult.value,
    loyalty: loyaltyResult.value,
    chaos: chaosResult.value
  };
  
  const result: InterpretationResult<{ intelligence: number; behavior: IBehavior }> = {
    value: {
      intelligence,
      behavior
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
        behavior,
        behaviorBreakdowns: {
          aggression: aggressionResult.debugInfo,
          curiosity: curiosityResult.debugInfo,
          loyalty: loyaltyResult.debugInfo,
          chaos: chaosResult.debugInfo
        }
      }
    };
  }
  
  return result;
}