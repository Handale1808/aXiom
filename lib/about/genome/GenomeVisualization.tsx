// lib/components/about/genome/GenomeVisualization.tsx

"use client";

import { getSymbolColor, getRegionColor } from "./utils";
import { GENOME_REGIONS } from "@/lib/cat-alien-generation/genome/regions";
import type { GenomeSymbol } from "@/lib/cat-alien-generation/genome/types";
import type { ViewMode } from "./ViewModeSelector";

interface GenomeVisualizationProps {
  genome: string;
  viewMode: ViewMode;
  animationProgress: number;
  onBaseHover: (index: number | null) => void;
  hoveredBase: number | null;
  onRegionHover?: (region: string | null) => void;
}

export default function GenomeVisualization({
  genome,
  viewMode,
  animationProgress,
  onBaseHover,
  hoveredBase,
  onRegionHover,
}: GenomeVisualizationProps) {
  if (viewMode === "overview") {
    return (
      <OverviewMode
        genome={genome}
        animationProgress={animationProgress}
        onBaseHover={onBaseHover}
        hoveredBase={hoveredBase}
      />
    );
  }

  if (viewMode === "detailed") {
    return (
      <DetailedMode
        genome={genome}
        animationProgress={animationProgress}
        onBaseHover={onBaseHover}
        hoveredBase={hoveredBase}
      />
    );
  }

  if (viewMode === "regions") {
    return (
      <RegionsMode
        genome={genome}
        animationProgress={animationProgress}
        onRegionHover={onRegionHover}
      />
    );
  }

  return null;
}

function OverviewMode({
  genome,
  animationProgress,
  onBaseHover,
  hoveredBase,
}: {
  genome: string;
  animationProgress: number;
  onBaseHover: (index: number | null) => void;
  hoveredBase: number | null;
}) {
  const columns = 50;
  const visibleBases = Math.min(animationProgress, genome.length);

  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <div className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
        COMPLETE_GENOME_SEQUENCE
      </div>

      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => onBaseHover(null)}
      >
        {Array.from({ length: 1000 }).map((_, index) => {
          const symbol = genome[index] as GenomeSymbol;
          const isVisible = index < visibleBases;
          const isHovered = hoveredBase === index;

          return (
            <div
              key={index}
              className={`aspect-square transition-all duration-150 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
              } ${isHovered ? "scale-110 z-10" : ""}`}
              style={{
                backgroundColor: isVisible
                  ? getSymbolColor(symbol)
                  : "transparent",
                boxShadow: isHovered
                  ? `0 0 8px ${getSymbolColor(symbol)}`
                  : "none",
              }}
              onMouseEnter={() => onBaseHover(index)}
            />
          );
        })}
      </div>

      <div className="mt-3 text-xs text-cyan-100/50">
        Each square represents one base. Hover for details.
      </div>
    </div>
  );
}

function DetailedMode({
  genome,
  animationProgress,
  onBaseHover,
  hoveredBase,
}: {
  genome: string;
  animationProgress: number;
  onBaseHover: (index: number | null) => void;
  hoveredBase: number | null;
}) {
  const displayCount = 100;
  const visibleBases = Math.min(animationProgress, displayCount);

  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <div className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
        DETAILED_SEQUENCE_VIEW [BASES_0-99]
      </div>

      <div
        className="flex flex-wrap gap-1"
        onMouseLeave={() => onBaseHover(null)}
      >
        {Array.from({ length: displayCount }).map((_, index) => {
          const symbol = genome[index] as GenomeSymbol;
          const isVisible = index < visibleBases;
          const isHovered = hoveredBase === index;
          const showPosition = index % 10 === 0;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center border-2 text-xs font-bold transition-all duration-150 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                } ${isHovered ? "scale-125 z-10" : ""}`}
                style={{
                  borderColor: isVisible
                    ? getSymbolColor(symbol)
                    : "transparent",
                  backgroundColor: isVisible
                    ? `${getSymbolColor(symbol)}20`
                    : "transparent",
                  color: isVisible ? getSymbolColor(symbol) : "transparent",
                  boxShadow: isHovered
                    ? `0 0 10px ${getSymbolColor(symbol)}`
                    : "none",
                }}
                onMouseEnter={() => onBaseHover(index)}
              >
                {isVisible ? symbol : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[#30D6D6]/20 pt-3">
        <div className="text-xs text-cyan-100/50">
          BODY_PLAN subregion (0-99). Determines legs, tails, size.
        </div>
      </div>
    </div>
  );
}

function RegionsMode({
  genome,
  animationProgress,
  onRegionHover,
}: {
  genome: string;
  animationProgress: number;
  onRegionHover?: (region: string | null) => void;
}) {
  const regions = [
    {
      key: "MORPHOLOGY",
      name: "Morphology",
      start: 0,
      end: 399,
      description: "Physical structure & appearance",
    },
    {
      key: "METABOLISM",
      name: "Metabolism",
      start: 400,
      end: 599,
      description: "Internal systems & resistances",
    },
    {
      key: "COGNITION",
      name: "Cognition",
      start: 600,
      end: 799,
      description: "Mental attributes & behavior",
    },
    {
      key: "POWER",
      name: "Power",
      start: 800,
      end: 999,
      description: "Raw attributes",
    },
  ];

  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <div className="mb-4 text-xs font-bold tracking-widest text-[#30D6D6]">
        FUNCTIONAL_REGION_MAP
      </div>

      <div className="space-y-4">
        {regions.map((region) => {
          const length = region.end - region.start + 1;
          const visibleLength = Math.max(
            0,
            Math.min(animationProgress - region.start, length)
          );
          const progressPercent = (visibleLength / length) * 100;

          let catCount = 0;
          let alienCount = 0;
          for (
            let i = region.start;
            i <= Math.min(region.end, region.start + visibleLength - 1);
            i++
          ) {
            const symbol = genome[i];
            if ("ATCG".includes(symbol)) catCount++;
            else if ("WXYZ".includes(symbol)) alienCount++;
          }

          return (
            <div
              key={region.key}
              className="transition-all duration-200 hover:scale-[1.02]"
              onMouseEnter={() => onRegionHover?.(region.key)}
              onMouseLeave={() => onRegionHover?.(null)}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span
                    className="text-xs font-bold tracking-wider"
                    style={{ color: getRegionColor(region.key) }}
                  >
                    {region.name.toUpperCase()}
                  </span>
                  <span className="ml-2 text-xs text-cyan-100/50">
                    [{region.start}-{region.end}]
                  </span>
                </div>
                <div className="text-xs text-cyan-100/70">{length} bases</div>
              </div>

              <div
                className="relative h-12 border-2 bg-black/50"
                style={{ borderColor: `${getRegionColor(region.key)}40` }}
              >
                <div
                  className="absolute inset-0 flex overflow-hidden"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                >
                  {Array.from({ length: Math.floor(visibleLength) }).map(
                    (_, i) => {
                      const index = region.start + i;
                      const symbol = genome[index] as GenomeSymbol;
                      return (
                        <div
                          key={i}
                          className="flex-shrink-0"
                          style={{
                            width: `${100 / length}%`,
                            backgroundColor: getSymbolColor(symbol),
                          }}
                        />
                      );
                    }
                  )}
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    color: getRegionColor(region.key),
                    textShadow: "0 0 4px black",
                  }}
                ></div>
              </div>

              <div className="mt-1 text-xs text-cyan-100/50">
                {region.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[#30D6D6]/20 pt-3 text-xs text-cyan-100/50">
        Each region controls specific traits. Hover for detailed composition.
      </div>
    </div>
  );
}
