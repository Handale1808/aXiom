// lib/components/about/genome/hardcodedGenome.ts

import type { GenomeSymbol } from '@/lib/cat-generation/genome/types';

/**
 * Pre-generated demo genome for consistent visualization
 * Generated using the same logic as generateGenome()
 * 1000 bases with random distribution of ATCG (cat) and WXYZ (alien) symbols
 */
export const DEMO_GENOME = "TAYAWZWYGGYGGXAWCCTZTWTWTYCZYXCTAYXWGWCGGATYGXWGGXCYATWACGAGWCCCAZYWAGYAXGWCAYYGZGGCZZAZYAGCZXXZTYAGAYYYWWXYYTTTGGATZCXWZXCTGZATWTGXZWYTZXGZZYAAWZYTCCXCAYATGGGCTYCYZZTWZYXZTWTTYYWGXAXTWXTWGZWXXZGTZGTAXXTZXZXTACTXZAYGCTTWCTXZAXZWWTTWGZWGCGAZXTZTGZTAZTTATCAZZGATYYAGGWGYGWCXWZXXWGAXTCTZAZWGACAWTZGTZYAXCWGGTXWATAWGCXWXAWYXWATZXTAYWCAWGACCGTTTWCGZWAAAGWWTXGYGGZWGCZTWAZGTWGZWXWZGWAZYYGGXWYZAYZGYGZGXXZCGZGYXTCTTCGTXXGTCZTZYGAZXAWGCGAZXZXCWGXTAWGAZWCYGZZWYGAYZAGCZGXGACCXXTCWXZZACWWGZTAWTCTAGXYXATWZWACYATTGYWXYCTTXGAACXCWCXCCZZGCGCTCAAYACAACYGGYYYCZXXGCCYZTTYZAAAWGCGTXZCCZWZTGXCGZCCYXCTAXXXYYTYXATWWCTACZYAGGYTCCXXAXZWZTGAZTTWATYAZCXZWYAAXTWACYWXWGZTACGWYYCWXTTAZXYCTTGGTAXWXYTZZAACGYCAZTYZGWYTZCCGYCZWTAYXWAWAYGWZACTYYXCTYXGYCWGTZCTWGWGCGWCGCZTZWWCWGWTATWYGGXTZCXGAZWGTTGXAYYWTTTCAXXXCAGATCCAZXCXGTWTAYXWZXCTAGAGYCWTXGCWXCCGXXYYCYWGCAGAAAZGZYGTYZXTZGYXXCZACGYYWYZATAWYAAAGACATWTXTGCZWZWXYGZAZGWAGGACZGATTCYCXCCZYAYTXTGXZCGCXGCZXYZCTGXWZZTACWCYGGWTCAGTTTTTTYGWCZYTCAATZAXWWYXXTGZWGAYXZCGZYXXYYZTACYTZZX";

/**
 * Optimized demo genome for demonstrating stats variation
 * Engineered to produce diverse stat values for better demonstration:
 * - Strength region (800-899): EXTREME homogeneity (all A's) → High strength (9-10)
 * - Agility region (200-299): Palindromes and symmetry → High agility (7-8)
 * - Intelligence region (600-699): High entropy with all 8 symbols → High intelligence (8-9)
 * - Psychic region (900-999): Balanced cat/alien DNA → Moderate psychic (5-7)
 * - Other regions: Mixed patterns → Moderate stats (3-6)
 */
export const STATS_DEMO_GENOME = 
  // Morphology (0-399) - Mixed patterns for variety
  // Body Plan (0-99): Moderate patterns
  "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG" +
  // Sensory (100-199): Balanced for perception
  "AATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATTCCGGAATT" +
  // Locomotion (200-299): Palindromes for HIGH agility
  "ATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTATCGCGTA" +
  // Defense (300-399): Consistent patterns for endurance
  "CAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGACAGA" +
  
  // Metabolism (400-599) - Moderate resistances
  // Poison (400-449): Some poison motifs (ATT, TTA)
  "ATTATTATTATTATTATTATTATTATTATTATTATTATTATTAT" +
  // Acid (450-499): Some acid motifs (CGG, GGC)
  "CGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGGCGG" +
  // Fire (500-549): Some G runs for moderate resistance
  "GGGGAAAGGGGTTTGGGGCCCGGGGAAAGGGGTTTGGGGCCCGGG" +
  // Cold (550-599): Some A runs for moderate resistance
  "AAAATTTAAAACCCAAAAGGGAAAATTTAAAACCCAAAAGGGAAA" +
  
  // Cognition (600-799) - High intelligence, mixed behavior
  // Intelligence (600-699): HIGH entropy - all 8 symbols evenly mixed
  "ATCGWXYZTGCAXWZYACGTWXYZTAGCXWYZCGATWXYZTACGXWYZGCATXWYZATGCXWYZCTGAXWYZGATCXWYZTGCAXWZYACGTWXYZTA" +
  // Behavior regions (700-799): Mixed for variety
  // Aggression (700-749)
  "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA" +
  // Curiosity/Loyalty/Chaos (750-799)
  "TGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCAT" +
  
  // Power (800-999) - Demonstrate extreme values
  // Physical Power (800-899): EXTREME homogeneity for MAXIMUM strength (all A's)
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  // Psychic (900-999): Balanced 50/50 cat/alien DNA for moderate-high psychic
  "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGWXYZWXYZWXYZWXYZWXYZWXYZWXYZWXYZWXYZWXYZATCGATCGATCGATCGATC";

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