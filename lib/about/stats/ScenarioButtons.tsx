// lib/components/about/stats/ScenarioButtons.tsx

'use client';

import { useGenomeScenarios } from './hooks/useGenomeScenarios';

interface ScenarioButtonsProps {
  statId: string;
  subregion: { start: number; end: number };
  onApplyScenario: (newGenome: string) => void;
  currentGenome: string;
}

export default function ScenarioButtons({
  statId,
  subregion,
  onApplyScenario,
  currentGenome,
}: ScenarioButtonsProps) {
  const segmentLength = subregion.end - subregion.start + 1;
  
  const { scenarios, applyScenario } = useGenomeScenarios({
    statId,
    segmentLength,
  });

  const handleScenarioClick = (scenarioId: string) => {
    const newGenome = applyScenario(scenarioId, currentGenome, subregion);
    onApplyScenario(newGenome);
  };

  return (
    <div className="border border-[#30D6D6]/30 bg-black/30 p-4">
      <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-3">
        TEST_SCENARIOS
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleScenarioClick(scenario.id)}
            className="
              border-2 border-[#30D6D6]/50 bg-black px-3 py-2
              text-xs font-bold tracking-wider text-[#30D6D6]
              hover:bg-[#30D6D6]/10 hover:border-[#30D6D6]
              active:scale-95
              transition-all
              group
            "
            style={{
              boxShadow: '0 0 5px rgba(48, 214, 214, 0.2)',
            }}
          >
            <div className="mb-1">{scenario.name}</div>
            <div className="text-[10px] text-cyan-100/50 font-normal group-hover:text-cyan-100/70 transition-colors">
              {scenario.description}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-cyan-100/50">
        Click to apply pattern and see calculation change
      </div>

      {/* Expected outcomes (collapsed info) */}
      <details className="mt-3 border-t border-[#30D6D6]/20 pt-3">
        <summary className="text-xs font-bold tracking-wider text-[#30D6D6] cursor-pointer hover:text-[#30D6D6]/80 transition-colors">
          EXPECTED_OUTCOMES
        </summary>
        <div className="mt-2 space-y-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="text-xs text-cyan-100/60 flex items-start gap-2"
            >
              <span className="text-[#30D6D6] shrink-0">•</span>
              <div>
                <span className="font-bold text-cyan-100/70">{scenario.name}:</span>{' '}
                {scenario.expectedOutcome}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}