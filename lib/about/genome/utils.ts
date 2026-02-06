// lib/components/about/genome/utils.ts

import type { GenomeSymbol } from '@/lib/cat-generation/genome/types';
import { GENOME_REGIONS } from '@/lib/cat-generation/genome/regions';

/**
 * Color palette for genome symbols
 * Cat DNA (ATCG) uses warmer, organic colors
 * Alien DNA (WXYZ) uses cosmic, electric colors
 */
const SYMBOL_COLORS: Record<GenomeSymbol, string> = {
  // Cat DNA
  A: '#FF6B9D', // pink
  T: '#4ECDC4', // teal
  C: '#FFE66D', // yellow
  G: '#95E1D3', // mint
  // Alien DNA
  W: '#B388FF', // purple
  X: '#FF6E40', // orange-red
  Y: '#00E5FF', // cyan
  Z: '#76FF03', // lime
};

/**
 * Color palette for genome regions
 */
export const REGION_COLORS: Record<string, string> = {
  MORPHOLOGY: '#30D6D6', // cyan
  METABOLISM: '#FFE66D', // yellow
  COGNITION: '#B388FF', // purple
  POWER: '#FF6E40', // orange
};

/**
 * Returns the hex color for a given genome symbol
 */
export function getSymbolColor(symbol: GenomeSymbol): string {
  return SYMBOL_COLORS[symbol];
}

/**
 * Returns true if symbol is alien DNA (WXYZ)
 */
export function isAlienBase(symbol: GenomeSymbol): boolean {
  return symbol === 'W' || symbol === 'X' || symbol === 'Y' || symbol === 'Z';
}

/**
 * Returns true if symbol is cat DNA (ATCG)
 */
export function isCatBase(symbol: GenomeSymbol): boolean {
  return symbol === 'A' || symbol === 'T' || symbol === 'C' || symbol === 'G';
}

/**
 * Given a base position (0-999), returns which region and subregion it belongs to
 */
export function getRegionForPosition(position: number): {
  region: string;
  regionName: string;
  subregion: string;
  description: string;
} {
  // Find which major region this position falls into
  for (const [key, region] of Object.entries(GENOME_REGIONS)) {
    if (position >= region.start && position <= region.end) {
      // Find which subregion within this region
      if (region.subregions) {
        for (const subregion of region.subregions) {
          if (position >= subregion.start && position <= subregion.end) {
            return {
              region: key,
              regionName: region.name,
              subregion: subregion.name,
              description: subregion.purpose,
            };
          }
        }
      }
      
      // If no subregion found, return just the region
      return {
        region: key,
        regionName: region.name,
        subregion: 'Unknown',
        description: region.description,
      };
    }
  }
  
  // Should never reach here if position is valid
  return {
    region: 'UNKNOWN',
    regionName: 'Unknown',
    subregion: 'Unknown',
    description: 'Position out of range',
  };
}

/**
 * Analyzes a segment of the genome and returns composition statistics
 */
export function calculateRegionComposition(
  genome: string,
  start: number,
  end: number
): {
  cat: number;
  alien: number;
  catPercentage: number;
  alienPercentage: number;
  total: number;
} {
  const segment = genome.slice(start, end + 1);
  let catCount = 0;
  let alienCount = 0;
  
  for (const char of segment) {
    if (isCatBase(char as GenomeSymbol)) {
      catCount++;
    } else if (isAlienBase(char as GenomeSymbol)) {
      alienCount++;
    }
  }
  
  const total = segment.length;
  
  return {
    cat: catCount,
    alien: alienCount,
    catPercentage: Math.round((catCount / total) * 100),
    alienPercentage: Math.round((alienCount / total) * 100),
    total,
  };
}

/**
 * Returns a human-readable description of what a region controls
 */
export function getRegionDescription(regionKey: string): string {
  const region = GENOME_REGIONS[regionKey];
  return region ? region.description : 'Unknown region';
}

/**
 * Returns the color for a given region key
 */
export function getRegionColor(regionKey: string): string {
  return REGION_COLORS[regionKey] || '#30D6D6';
}

/**
 * Formats a base position for display (adds leading zeros)
 */
export function formatPosition(position: number): string {
  return position.toString().padStart(4, '0');
}

/**
 * Returns the classification label based on hybrid ratio
 */
export function getClassificationLabel(hybridRatio: number): string {
  if (hybridRatio < 0.3) return 'CAT_DOMINANT';
  if (hybridRatio < 0.7) return 'BALANCED_SPLICE';
  if (hybridRatio < 1.2) return 'HEAVY_SPLICE';
  return 'ALIEN_DOMINANT';
}