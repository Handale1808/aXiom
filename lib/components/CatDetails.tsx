// lib/components/CatDetails.tsx

"use client";

import { useState, useRef } from "react";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import FormWithHeading, {
  type TabWithContent,
} from "@/lib/components/FormWithHeading";
import ProgressBar from "@/lib/components/ui/ProgressBar";
import Tooltip from "@/lib/components/ui/Tooltip";
import GenerateImage from "@/lib/cat-generation/generateImage";
import {
  STAT_RANGES,
  RESISTANCE_RANGES,
  BEHAVIOR_RANGES,
  GENERATION_LIMITS,
} from "@/lib/cat-generation/constants";

interface CatDetailsProps {
  cat: ICat;
  abilities: IAbility[];
  onSave?: (svgString: string) => Promise<void>;
  onClose: () => void;
}

export default function CatDetails({
  cat,
  abilities,
  onSave,
  onClose,
}: CatDetailsProps) {
  const [activeTab, setActiveTab] = useState("physical");
  const [isSaving, setIsSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const passiveAbilities = abilities.filter((a) => a.isPassive);
  const activeAbilities = abilities.filter((a) => !a.isPassive);

  const statsTotal = Object.values(cat.stats).reduce(
    (sum, val) => sum + val,
    0
  );
  const resistancesTotal = Object.values(cat.resistances).reduce(
    (sum, val) => sum + val,
    0
  );
  const behaviorTotal = Object.values(cat.behavior).reduce(
    (sum, val) => sum + val,
    0
  );

  const captureSVG = (): string => {
    if (svgRef.current) {
      return svgRef.current.outerHTML;
    }
    return "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const svgString = captureSVG();
      await onSave(svgString);
    } catch (error) {
      console.error("Error saving cat:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: TabWithContent[] = [
    {
      id: "physical",
      label: "PHYSICAL_TRAITS",
      content: {
        customContent: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [EYES]
              </div>
              <div className="text-cyan-100">{cat.physicalTraits.eyes}</div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [LEGS]
              </div>
              <div className="text-cyan-100">{cat.physicalTraits.legs}</div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [WINGS]
              </div>
              <div className="text-cyan-100">{cat.physicalTraits.wings}</div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [TAILS]
              </div>
              <div className="text-cyan-100">{cat.physicalTraits.tails}</div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [SKIN_TYPE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.skinType}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [SIZE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.size}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [COLOUR]
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 border border-[#30D6D6]"
                  style={{ backgroundColor: cat.physicalTraits.colour }}
                />
                <span className="text-cyan-100 uppercase">
                  {cat.physicalTraits.colour}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [HAS_CLAWS]
              </div>
              <div className="text-cyan-100">
                {cat.physicalTraits.hasClaws ? "YES" : "NO"}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [HAS_FANGS]
              </div>
              <div className="text-cyan-100">
                {cat.physicalTraits.hasFangs ? "YES" : "NO"}
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "stats",
      label: "STATISTICS",
      content: {
        customContent: (
          <div className="space-y-4">
            <ProgressBar
              label="STRENGTH"
              value={cat.stats.strength}
              max={STAT_RANGES.STRENGTH.max}
            />
            <ProgressBar
              label="AGILITY"
              value={cat.stats.agility}
              max={STAT_RANGES.AGILITY.max}
            />
            <ProgressBar
              label="ENDURANCE"
              value={cat.stats.endurance}
              max={STAT_RANGES.ENDURANCE.max}
            />
            <ProgressBar
              label="INTELLIGENCE"
              value={cat.stats.intelligence}
              max={STAT_RANGES.INTELLIGENCE.max}
            />
            <ProgressBar
              label="PERCEPTION"
              value={cat.stats.perception}
              max={STAT_RANGES.PERCEPTION.max}
            />
            <ProgressBar
              label="PSYCHIC"
              value={cat.stats.psychic}
              max={STAT_RANGES.PSYCHIC.max}
            />

            <div className="pt-4 border-t border-[#30D6D6]/30">
              <div className="text-xs font-bold tracking-widest text-[#30D6D6]">
                [TOTAL: {statsTotal}/{GENERATION_LIMITS.STATS_MAX_TOTAL}]
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "resistances",
      label: "RESISTANCES",
      content: {
        customContent: (
          <div className="space-y-4">
            <ProgressBar
              label="POISON"
              value={cat.resistances.poison}
              max={RESISTANCE_RANGES.POISON.max}
            />
            <ProgressBar
              label="ACID"
              value={cat.resistances.acid}
              max={RESISTANCE_RANGES.ACID.max}
            />
            <ProgressBar
              label="FIRE"
              value={cat.resistances.fire}
              max={RESISTANCE_RANGES.FIRE.max}
            />
            <ProgressBar
              label="COLD"
              value={cat.resistances.cold}
              max={RESISTANCE_RANGES.COLD.max}
            />
            <ProgressBar
              label="PSYCHIC"
              value={cat.resistances.psychic}
              max={RESISTANCE_RANGES.PSYCHIC.max}
            />
            <ProgressBar
              label="RADIATION"
              value={cat.resistances.radiation}
              max={RESISTANCE_RANGES.RADIATION.max}
            />

            <div className="pt-4 border-t border-[#30D6D6]/30">
              <div className="text-xs font-bold tracking-widest text-[#30D6D6]">
                [TOTAL: {resistancesTotal}/
                {GENERATION_LIMITS.RESISTANCES_MAX_TOTAL}]
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "behavior",
      label: "BEHAVIOR",
      content: {
        customContent: (
          <div className="space-y-4">
            <ProgressBar
              label="AGGRESSION"
              value={cat.behavior.aggression}
              max={BEHAVIOR_RANGES.AGGRESSION.max}
            />
            <ProgressBar
              label="CURIOSITY"
              value={cat.behavior.curiosity}
              max={BEHAVIOR_RANGES.CURIOSITY.max}
            />
            <ProgressBar
              label="LOYALTY"
              value={cat.behavior.loyalty}
              max={BEHAVIOR_RANGES.LOYALTY.max}
            />
            <ProgressBar
              label="CHAOS"
              value={cat.behavior.chaos}
              max={BEHAVIOR_RANGES.CHAOS.max}
            />

            <div className="pt-4 border-t border-[#30D6D6]/30">
              <div className="text-xs font-bold tracking-widest text-[#30D6D6]">
                [TOTAL: {behaviorTotal}/{GENERATION_LIMITS.BEHAVIOR_MAX_TOTAL}]
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "abilities",
      label: "ABILITIES",
      content: {
        customContent: (
          <div className="space-y-6">
            {passiveAbilities.length > 0 && (
              <div>
                <div className="text-sm font-bold tracking-widest text-[#30D6D6] mb-3">
                  [PASSIVE_ABILITIES]
                </div>
                <div className="flex flex-wrap gap-2">
                  {passiveAbilities.map((ability) => (
                    <Tooltip
                      key={ability._id?.toString()}
                      content={ability.description}
                    >
                      <div className="inline-flex px-3 py-2 border-2 border-[#30D6D6] bg-black text-[#30D6D6] text-xs font-bold tracking-wider hover:bg-[#30D6D6] hover:text-black transition-all cursor-help">
                        {ability.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {activeAbilities.length > 0 && (
              <div>
                <div className="text-sm font-bold tracking-widest text-[#30D6D6] mb-3">
                  [ACTIVE_ABILITIES]
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeAbilities.map((ability) => (
                    <Tooltip
                      key={ability._id?.toString()}
                      content={ability.description}
                    >
                      <div className="inline-flex px-3 py-2 border-2 border-[#30D6D6] bg-[#30D6D6] text-black text-xs font-bold tracking-wider hover:bg-black hover:text-[#30D6D6] transition-all cursor-help">
                        {ability.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {abilities.length === 0 && (
              <div className="text-center py-8 text-[#006694]">
                [NO_ABILITIES_GRANTED]
              </div>
            )}

            <div className="pt-4 border-t border-[#30D6D6]/30">
              <div className="text-xs font-bold tracking-widest text-[#30D6D6]">
                [PASSIVE: {passiveAbilities.length} | ACTIVE:{" "}
                {activeAbilities.length}]
              </div>
            </div>
          </div>
        ),
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="border-b-2 border-[#30D6D6]/30 pb-4">
        <h2 className="text-2xl font-bold tracking-wider text-[#30D6D6]">
          {cat.name}
        </h2>
        <p className="text-sm text-cyan-100/70 mt-2">{cat.description}</p>
      </div>

      <div className="w-full h-64 flex items-center justify-center border-2 border-[#30D6D6]/30 bg-black/30">
        <GenerateImage ref={svgRef} traits={cat.physicalTraits} />
      </div>

      <FormWithHeading
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex gap-4 mt-6 pt-6 border-t-2 border-[#30D6D6]/30">
        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 border-2 border-[#30D6D6] bg-black py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
          >
            {isSaving ? "[SAVING...]" : "[SAVE]"}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={isSaving}
          className={`border-2 border-[#30D6D6] bg-transparent py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            onSave ? "flex-1" : "w-full"
          }`}
        >
          [CLOSE]
        </button>
      </div>
    </div>
  );
}
