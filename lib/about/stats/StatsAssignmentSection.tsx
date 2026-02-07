// lib/components/about/stats/StatsAssignmentSection.tsx

'use client';

import OpposingForcesPhilosophy from './OpposingForcesPhilosophy';
import StatsCategorySection from './StatsCategorySection';
import { STATS_CONFIG, RESISTANCES_CONFIG, BEHAVIORS_CONFIG } from './utils/statCalculations';

export default function StatsAssignmentSection() {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
          [STEP_03: STATS_ASSIGNMENT]
        </h2>
        <p className="text-cyan-100/70 leading-relaxed mb-4">
          Each unique genome generates a corresponding phenotype profile. We analyze
          genetic markers across functional regions to derive stats, resistances,
          and behavioral traits.
        </p>
        <p className="text-cyan-100/70 leading-relaxed">
          Our proprietary opposing forces algorithm weighs genetic specialization
          against entropic chaos. The system outputs precise numerical values across
          16 core attributes, each governed by distinct pattern recognition systems.
        </p>
      </div>

      {/* Opposing Forces Philosophy */}
      <OpposingForcesPhilosophy />

      {/* Stats Category */}
      <StatsCategorySection
        category="stats"
        title="[STATS_ANALYSIS]"
        items={STATS_CONFIG}
      />

      {/* Visual Separator */}
      <div className="relative py-6">
        <div className="border-t border-[#30D6D6]/20"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
          </div>
        </div>
      </div>

      {/* Resistances Category */}
      <StatsCategorySection
        category="resistances"
        title="[RESISTANCE_ANALYSIS]"
        items={RESISTANCES_CONFIG}
      />

      {/* Visual Separator */}
      <div className="relative py-6">
        <div className="border-t border-[#30D6D6]/20"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
            <div className="h-1 w-1 bg-[#30D6D6]"></div>
          </div>
        </div>
      </div>

      {/* Behaviors Category */}
      <StatsCategorySection
        category="behaviors"
        title="[BEHAVIOR_ANALYSIS]"
        items={BEHAVIORS_CONFIG}
      />
    </section>
  );
}