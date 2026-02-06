// lib/components/about/stats/StatsCategorySection.tsx

'use client';

import { useState } from 'react';
import type { StatConfig } from './utils/statCalculations';
import StatAccordion from './StatAccordion';
import { STATS_DEMO_GENOME } from '@/lib/about/genome/hardcodedGenome';

interface StatsCategorySectionProps {
  category: 'stats' | 'resistances' | 'behaviors';
  title: string;
  items: StatConfig[];
}

export default function StatsCategorySection({
  category,
  title,
  items,
}: StatsCategorySectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentGenome, setCurrentGenome] = useState<string>(STATS_DEMO_GENOME);

  const handleToggle = (itemId: string) => {
    setExpandedId(expandedId === itemId ? null : itemId);
  };

  const handleResetGenome = () => {
    setCurrentGenome(STATS_DEMO_GENOME);
  };

  return (
    <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      {/* Category Header */}
      <h3 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
        {title}
      </h3>

      {/* Category Description */}
      <p className="text-sm text-cyan-100/70 leading-relaxed mb-6">
        {getCategoryDescription(category)}
      </p>

      {/* Accordion List */}
      <div className="space-y-3">
        {items.map((item) => (
          <StatAccordion
            key={item.id}
            config={item}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
            genome={currentGenome}
            onGenomeChange={setCurrentGenome}
          />
        ))}
      </div>

      {/* Reset Genome Button */}
      {currentGenome !== STATS_DEMO_GENOME && (
        <div className="mt-6 pt-6 border-t border-[#30D6D6]/20">
          <button
            onClick={handleResetGenome}
            className="
              w-full border-2 border-[#30D6D6]/50 bg-black px-4 py-3
              text-xs font-bold tracking-wider text-[#30D6D6]
              hover:bg-[#30D6D6]/10 hover:border-[#30D6D6]
              active:scale-98
              transition-all
            "
            style={{
              boxShadow: '0 0 10px rgba(48, 214, 214, 0.3)',
            }}
          >
            RESET_TO_ORIGINAL_GENOME
          </button>
          <p className="mt-2 text-xs text-cyan-100/50 text-center">
            Restore default genome to see original calculations
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Get description text for each category
 */
function getCategoryDescription(category: 'stats' | 'resistances' | 'behaviors'): string {
  const descriptions = {
    stats: 'Core attributes that define physical and mental capabilities. Each stat is calculated from a specific 100-base genome region using the opposing forces framework.',
    resistances: 'Defensive capabilities against various environmental hazards. Measured on a 0-100 scale where higher values indicate greater immunity.',
    behaviors: 'Personality traits and behavioral tendencies. These emerge from genetic predispositions encoded in specific genome regions.',
  };

  return descriptions[category];
}