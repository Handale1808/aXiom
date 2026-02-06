// lib/components/about/genome/hardcodedGenome.ts

import type { GenomeSymbol } from '@/lib/cat-generation/genome/types';

/**
 * Pre-generated demo genome for consistent visualization
 * Generated using the same logic as generateGenome()
 * 1000 bases with random distribution of ATCG (cat) and WXYZ (alien) symbols
 */
export const DEMO_GENOME = "TAYAWZWYGGYGGXAWCCTZTWTWTYCZYXCTAYXWGWCGGATYGXWGGXCYATWACGAGWCCCAZYWAGYAXGWCAYYGZGGCZZAZYAGCZXXZTYAGAYYYWWXYYTTTGGATZCXWZXCTGZATWTGXZWYTZXGZZYAAWZYTCCXCAYATGGGCTYCYZZTWZYXZTWTTYYWGXAXTWXTWGZWXXZGTZGTAXXTZXZXTACTXZAYGCTTWCTXZAXZWWTTWGZWGCGAZXTZTGZTAZTTATCAZZGATYYAGGWGYGWCXWZXXWGAXTCTZAZWGACAWTZGTZYAXCWGGTXWATAWGCXWXAWYXWATZXTAYWCAWGACCGTTTWCGZWAAAGWWTXGYGGZWGCZTWAZGTWGZWXWZGWAZYYGGXWYZAYZGYGZGXXZCGZGYXTCTTCGTXXGTCZTZYGAZXAWGCGAZXZXCWGXTAWGAZWCYGZZWYGAYZAGCZGXGACCXXTCWXZZACWWGZTAWTCTAGXYXATWZWACYATTGYWXYCTTXGAACXCWCXCCZZGCGCTCAAYACAACYGGYYYCZXXGCCYZTTYZAAAWGCGTXZCCZWZTGXCGZCCYXCTAXXXYYTYXATWWCTACZYAGGYTCCXXAXZWZTGAZTTWATYAZCXZWYAAXTWACYWXWGZTACGWYYCWXTTAZXYCTTGGTAXWXYTZZAACGYCAZTYZGWYTZCCGYCZWTAYXWAWAYGWZACTYYXCTYXGYCWGTZCTWGWGCGWCGCZTZWWCWGWTATWYGGXTZCXGAZWGTTGXAYYWTTTCAXXXCAGATCCAZXCXGTWTAYXWZXCTAGAGYCWTXGCWXCCGXXYYCYWGCAGAAAZGZYGTYZXTZGYXXCZACGYYWYZATAWYAAAGACATWTXTGCZWZWXYGZAZGWAGGACZGATTCYCXCCZYAYTXTGXZCGCXGCZXYZCTGXWZZTACWCYGGWTCAGTTTTTTYGWCZYTCAATZAXWWYXXTGZWGAYXZCGZYXXYYZTACYTZZX";

/**
 * Metadata about the demo genome
 */
export const DEMO_GENOME_METADATA = {
  totalBases: 1000,
  catBases: 538,
  alienBases: 462,
  hybridRatio: 0.86,
  classification: "BALANCED_SPLICE" as const,
  
  symbolCounts: {
    A: 130,
    T: 140,
    C: 125,
    G: 143,
    W: 114,
    X: 114,
    Y: 109,
    Z: 125,
  },
  
  regions: {
    morphology: {
      start: 0,
      end: 399,
      catPercentage: 52,
      alienPercentage: 48,
      catCount: 208,
      alienCount: 192,
    },
    metabolism: {
      start: 400,
      end: 599,
      catPercentage: 56,
      alienPercentage: 44,
      catCount: 113,
      alienCount: 87,
    },
    cognition: {
      start: 600,
      end: 799,
      catPercentage: 55,
      alienPercentage: 45,
      catCount: 110,
      alienCount: 90,
    },
    power: {
      start: 800,
      end: 999,
      catPercentage: 54,
      alienPercentage: 47,
      catCount: 107,
      alienCount: 93,
    },
  },
};

/**
 * Type definitions for region metadata
 */
export interface RegionMetadata {
  start: number;
  end: number;
  catPercentage: number;
  alienPercentage: number;
  catCount: number;
  alienCount: number;
}

export type RegionName = 'morphology' | 'metabolism' | 'cognition' | 'power';