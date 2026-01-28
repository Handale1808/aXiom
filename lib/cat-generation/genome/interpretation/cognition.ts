// lib/genome/interpretation/cognition.ts

import type { IBehavior } from '@/models/Cats';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS, MOTIFS } from '../regions';
import {
  extractRegion,
  countUniqueMotifs,
  calculateEntropy,
  detectTandemRepeats,
  countSymbolRuns,
  countRareSymbols,
  createDebugInfo
} from './utils';

/**
 * Interpret Intelligence Core subregion → intelligence stat
 * 
 * Uses standard stat formula:
 * - Factor A: Motif presence (+1 per unique motif, cap at +3)
 * - Factor B: Symbol diversity (entropy score, 0-3)
 * - Factor C: Repeating patterns (+1 per unique repeat, cap at +2)
 * - Total: base 1 + bonuses, cap at 10
 */
function interpretIntelligence(
  genome: string,
  debug: boolean
): { intelligence: number; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.INTELLIGENCE;
  const segment = extractRegion(genome, start, end);
  
  // Factor A: Motif presence (+1 per unique motif, cap at +3)
  const motifCount = countUniqueMotifs(segment, MOTIFS.INTELLIGENCE);
  const motifBonus = Math.min(3, motifCount);
  
  // Factor B: Symbol diversity (entropy score, 0-3)
  const entropy = calculateEntropy(segment);
  const diversityBonus = entropy > 2.5 ? 3 : entropy > 2.0 ? 2 : entropy > 1.0 ? 1 : 0;
  
  // Factor C: Repeating patterns (+1 per unique repeat, cap at +2)
  const repeats = detectTandemRepeats(segment);
  const repeatBonus = Math.min(2, repeats.length);
  
  // Total intelligence: base 1 + bonuses, cap at 10
  const intelligence = Math.min(10, 1 + motifBonus + diversityBonus + repeatBonus);
  
  const result: { intelligence: number; debugInfo?: DebugInfo } = { intelligence };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Intelligence Core', segment, {
      motifs: MOTIFS.INTELLIGENCE,
      includeEntropy: true,
      includeRepeats: true
    });
    result.debugInfo.derivedValue = {
      intelligence,
      breakdown: { motifBonus, diversityBonus, repeatBonus }
    };
  }
  
  return result;
}

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
  const intelligenceResult = interpretIntelligence(genome, debug);
  const behaviorResult = interpretBehavior(genome, debug);
  
  const result: InterpretationResult<{ intelligence: number; behavior: IBehavior }> = {
    value: {
      intelligence: intelligenceResult.intelligence,
      behavior: behaviorResult.behavior
    }
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Cognition (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: result.value
    };
  }
  
  return result;
}