// lib/components/about/GenomeGenerationSection.tsx

'use client';

import { useState } from 'react';
import { useGenomeAnimation } from '../hooks/useGenomeAnimation';
import { DEMO_GENOME } from './genome/hardcodedGenome';
import DNASymbolExplanation from './genome/DNASymbolExplanation';
import AnimationControls from './genome/AnimationControls';
import ViewModeSelector, { type ViewMode } from './genome/ViewModeSelector';
import GenomeVisualization from './genome/GenomeVisualization';
import RegionInfoPanel from './genome/RegionInfoPanel';

export default function GenomeGenerationSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [hoveredBase, setHoveredBase] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const {
    progress,
    isAnimating,
    isComplete,
    play,
    pause,
    reset,
  } = useGenomeAnimation(1000, 3);

  return (
    <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
        [STEP_02: GENOME_GENERATION]
      </h2>

      <DNASymbolExplanation />

      <AnimationControls
        isAnimating={isAnimating}
        animationProgress={progress}
        totalBases={1000}
        onPlay={play}
        onPause={pause}
        onReset={reset}
      />

      <ViewModeSelector
        currentMode={viewMode}
        onModeChange={setViewMode}
      />

      <GenomeVisualization
        genome={DEMO_GENOME}
        viewMode={viewMode}
        animationProgress={progress}
        onBaseHover={setHoveredBase}
        hoveredBase={hoveredBase}
        onRegionHover={setSelectedRegion}
      />

      <div className="mt-6">
        <RegionInfoPanel
          hoveredBase={hoveredBase}
          selectedRegion={selectedRegion}
          genome={DEMO_GENOME}
        />
      </div>
    </div>
  );
}