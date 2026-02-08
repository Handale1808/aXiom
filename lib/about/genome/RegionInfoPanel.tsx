// lib/components/about/genome/RegionInfoPanel.tsx

import { getRegionForPosition, formatPosition, isCatBase, isAlienBase } from './utils';
import { DEMO_GENOME_METADATA } from './hardcodedGenome';
import type { GenomeSymbol } from '@/lib/generation/genome/types';

interface RegionInfoPanelProps {
  hoveredBase: number | null;
  selectedRegion: string | null;
  genome: string;
}

export default function RegionInfoPanel({
  hoveredBase,
  selectedRegion,
  genome,
}: RegionInfoPanelProps) {
  // Mode 1: Base Hover Info
  if (hoveredBase !== null) {
    const symbol = genome[hoveredBase] as GenomeSymbol;
    const regionInfo = getRegionForPosition(hoveredBase);
    const symbolType = isCatBase(symbol) ? 'Cat' : isAlienBase(symbol) ? 'Alien' : 'Unknown';

    return (
      <div className="border border-[#30D6D6]/30 bg-black/50 p-4">
        <h3 className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
          BASE_DETAIL
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-cyan-100/50">Position:</span>
            <span className="font-bold text-[#30D6D6] tabular-nums">
              {formatPosition(hoveredBase)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-100/50">Symbol:</span>
            <span className="font-bold text-[#30D6D6]">
              {symbol} ({symbolType})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-100/50">Region:</span>
            <span className="font-bold text-[#30D6D6]">
              {regionInfo.regionName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-100/50">Subregion:</span>
            <span className="font-bold text-[#30D6D6]">
              {regionInfo.subregion}
            </span>
          </div>

          <div className="mt-3 border-t border-[#30D6D6]/20 pt-3">
            <p className="text-xs text-cyan-100/70 leading-relaxed">
              {regionInfo.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mode 2: Region Info
  if (selectedRegion !== null) {
    const regionKey = selectedRegion.toLowerCase();
    const regionData = DEMO_GENOME_METADATA.regions[regionKey as keyof typeof DEMO_GENOME_METADATA.regions];

    if (!regionData) {
      return null;
    }

    const regionNames: Record<string, string> = {
      morphology: 'MORPHOLOGY',
      metabolism: 'METABOLISM',
      cognition: 'COGNITION',
      power: 'POWER',
    };

    const regionDescriptions: Record<string, string> = {
      morphology: 'Controls physical structure and appearance including body plan, sensory organs, locomotion, and defense mechanisms.',
      metabolism: 'Controls internal systems and resistances including toxin processing and thermal regulation.',
      cognition: 'Controls mental attributes and behavior including intelligence core and behavioral drivers.',
      power: 'Controls raw attributes including physical power and psychic potential.',
    };

    return (
      <div className="border border-[#30D6D6]/30 bg-black/50 p-4">
        <h3 className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
          REGION_ANALYSIS: {regionNames[regionKey]}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-cyan-100/50">Range:</span>
            <span className="font-bold text-[#30D6D6] tabular-nums">
              {regionData.start}-{regionData.end} ({regionData.end - regionData.start + 1} bases)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-100/50">Cat DNA (ATCG):</span>
            <span className="font-bold text-[#30D6D6] tabular-nums">
              {regionData.catPercentage}% ({regionData.catCount} bases)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-100/50">Alien DNA (WXYZ):</span>
            <span className="font-bold text-[#30D6D6] tabular-nums">
              {regionData.alienPercentage}% ({regionData.alienCount} bases)
            </span>
          </div>

          <div className="mt-3 border-t border-[#30D6D6]/20 pt-3">
            <p className="text-xs text-cyan-100/70 leading-relaxed">
              {regionDescriptions[regionKey]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mode 3: General Stats (default state)
  return (
    <div className="border border-[#30D6D6]/30 bg-black/50 p-4">
      <h3 className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
        GENOME_COMPOSITION
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cyan-100/50">Total Bases:</span>
          <span className="font-bold text-[#30D6D6] tabular-nums">
            {DEMO_GENOME_METADATA.totalBases}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-100/50">Cat DNA (ATCG):</span>
          <span className="font-bold text-[#30D6D6] tabular-nums">
            {DEMO_GENOME_METADATA.catBases} (
            {Math.round((DEMO_GENOME_METADATA.catBases / DEMO_GENOME_METADATA.totalBases) * 100)}
            %)
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-100/50">Alien DNA (WXYZ):</span>
          <span className="font-bold text-[#30D6D6] tabular-nums">
            {DEMO_GENOME_METADATA.alienBases} (
            {Math.round((DEMO_GENOME_METADATA.alienBases / DEMO_GENOME_METADATA.totalBases) * 100)}
            %)
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-100/50">Hybrid Ratio:</span>
          <span className="font-bold text-[#30D6D6] tabular-nums">
            {DEMO_GENOME_METADATA.hybridRatio}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-100/50">Classification:</span>
          <span className="font-bold text-[#30D6D6]">
            {DEMO_GENOME_METADATA.classification}
          </span>
        </div>

        <div className="mt-3 border-t border-[#30D6D6]/20 pt-3">
          <p className="text-xs text-cyan-100/70 leading-relaxed">
            Hover over bases or regions for detailed analysis. This genome represents
            a balanced fusion of terrestrial and extraterrestrial genetic material.
          </p>
        </div>
      </div>
    </div>
  );
}