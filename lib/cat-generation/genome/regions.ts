// lib/genome/regions.ts

import { GenomeRegion, GenomeSubregion } from './types';

/**
 * Total length of genome string
 */
export const GENOME_LENGTH = 1000;

/**
 * Complete genome region architecture
 * Defines all functional regions and their subregions
 */
export const GENOME_REGIONS: Record<string, GenomeRegion> = {
  MORPHOLOGY: {
    name: 'Morphology',
    start: 0,
    end: 399,
    description: 'Controls physical structure and appearance',
    subregions: [
      {
        name: 'Body Plan',
        start: 0,
        end: 99,
        purpose: 'Determines legs, tails, size'
      },
      {
        name: 'Sensory',
        start: 100,
        end: 199,
        purpose: 'Determines eyes, perception stat'
      },
      {
        name: 'Locomotion',
        start: 200,
        end: 299,
        purpose: 'Determines wings, agility stat'
      },
      {
        name: 'Defense',
        start: 300,
        end: 399,
        purpose: 'Determines skinType, claws, fangs, endurance, color'
      }
    ]
  },
  METABOLISM: {
    name: 'Metabolism',
    start: 400,
    end: 599,
    description: 'Controls internal systems and resistances',
    subregions: [
      {
        name: 'Toxin Processing',
        start: 400,
        end: 499,
        purpose: 'Determines poison, acid resistances'
      },
      {
        name: 'Thermal Regulation',
        start: 500,
        end: 599,
        purpose: 'Determines fire, cold resistances'
      }
    ]
  },
  COGNITION: {
    name: 'Cognition',
    start: 600,
    end: 799,
    description: 'Controls mental attributes and behavior',
    subregions: [
      {
        name: 'Intelligence Core',
        start: 600,
        end: 699,
        purpose: 'Determines intelligence stat'
      },
      {
        name: 'Behavioral Drivers',
        start: 700,
        end: 799,
        purpose: 'Determines aggression, curiosity, loyalty, chaos'
      }
    ]
  },
  POWER: {
    name: 'Power',
    start: 800,
    end: 999,
    description: 'Controls raw attributes',
    subregions: [
      {
        name: 'Physical Power',
        start: 800,
        end: 899,
        purpose: 'Determines strength stat'
      },
      {
        name: 'Psychic Potential',
        start: 900,
        end: 999,
        purpose: 'Determines psychic stat, psychic/radiation resistances'
      }
    ]
  }
};

/**
 * Subregion quick access constants
 * Used for extracting specific genome segments during interpretation
 */
export const SUBREGIONS = {
  BODY_PLAN: { start: 0, end: 99 },
  SENSORY: { start: 100, end: 199 },
  LOCOMOTION: { start: 200, end: 299 },
  DEFENSE: { start: 300, end: 399 },
  TOXIN: { start: 400, end: 499 },
  THERMAL: { start: 500, end: 599 },
  INTELLIGENCE: { start: 600, end: 699 },
  BEHAVIOR: { start: 700, end: 799 },
  PHYSICAL_POWER: { start: 800, end: 899 },
  PSYCHIC: { start: 900, end: 999 }
};

/**
 * Motif definitions for pattern matching
 * Each motif is a short sequence that, when found, influences trait expression
 */
export const MOTIFS = {
  // Boolean trait motifs
  CLAWS: ['ATG', 'WXZ'],
  FANGS: ['CGT', 'YXW'],
  
  // Stat motifs (finding these increases stat value)
  STRENGTH: ['ATG', 'GTA', 'TAG', 'WXYZ', 'XYZW'],
  AGILITY: ['AGT', 'GAT', 'TGA', 'WYXZ', 'XWZY'],
  ENDURANCE: ['CAG', 'GCA', 'ACG', 'YWX', 'XYW'],
  INTELLIGENCE: ['GCG', 'CGC', 'GCGC', 'ZYZ', 'YZY'],
  PERCEPTION: ['TAC', 'ACT', 'CTA', 'XWY', 'WYX'],
  PSYCHIC: ['CGAT', 'ATCG', 'YXWZ', 'WZYX'],
  
  // Resistance motifs (finding these increases resistance value)
  POISON: ['ATT', 'TTA', 'AAT', 'WXX', 'XXW'],
  ACID: ['CGG', 'GGC', 'CCG', 'YZZ', 'ZZY'],
  FIRE: ['GGG', 'GGGG', 'ZZZ', 'ZZZZ'],
  COLD: ['AAA', 'AAAA', 'WWW', 'WWWW'],
  PSYCHIC_RESISTANCE: ['CGCG', 'GCGC', 'YXYX', 'XYXY'],
  RADIATION: ['ATCG', 'GCTA', 'WXYZ', 'ZYXW']
};

/**
 * Symbol mappings for categorical traits
 * Maps genome symbols to categorical trait values
 */
export const SYMBOL_MAPPINGS = {
  /**
   * Skin type mapping based on dominant symbol in Defense region
   */
  SKIN_TYPE: {
    A: 'fur',
    T: 'scales',
    C: 'chitin',
    G: 'skin',
    W: 'fur',
    X: 'scales',
    Y: 'chitin',
    Z: 'skin'
  } as const,
  
  /**
   * Size thresholds based on dominant symbol frequency in Body Plan region
   * Frequency is measured as count of dominant symbol out of 100 bases
   */
  SIZE_THRESHOLDS: [
    { min: 0, max: 19, size: 'tiny' },
    { min: 20, max: 39, size: 'small' },
    { min: 40, max: 59, size: 'medium' },
    { min: 60, max: 79, size: 'large' },
    { min: 80, max: 100, size: 'massive' }
  ] as const,
  
  /**
   * Color component mapping for direct base mapping
   * Each symbol maps to a value 0-255 for RGB components
   */
  COLOR_VALUES: {
    A: 0, 
    T: 64, 
    C: 192, 
    G: 255,
    W: 0, 
    X: 64, 
    Y: 192, 
    Z: 255
  } as const
};