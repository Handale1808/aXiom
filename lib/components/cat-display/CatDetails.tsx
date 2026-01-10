// lib/components/CatDetails.tsx

"use client";

import { useState, useRef } from "react";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import FormWithHeading, {
  type TabWithContent,
} from "@/lib/components/ui/FormWithHeading";
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
  showAddToCart?: boolean;
  onAddToCart?: (catId: string) => Promise<void>;
}

export default function CatDetails({
  cat,
  abilities,
  onSave,
  onClose,
  showAddToCart,
  onAddToCart,
}: CatDetailsProps) {
  const [activeTab, setActiveTab] = useState("physical");
  const [isSaving, setIsSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const handleAddToCart = async () => {
    if (!onAddToCart || !cat._id) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart(cat._id.toString());
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const tabs: TabWithContent[] = [
    {
      id: "physical",
      label: "PHYSICAL_TRAITS",
      content: {
        customContent: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [EYES]
              </div>
              <div className="text-xs sm:text-sm text-cyan-100">
                {cat.physicalTraits.eyes}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [LEGS]
              </div>
              <div className="text-xs sm:text-sm text-cyan-100">
                {cat.physicalTraits.legs}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [WINGS]
              </div>
              <div className="text-xs sm:text-sm text-cyan-100">
                {cat.physicalTraits.wings}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [TAILS]
              </div>
              <div className="text-xs sm:text-sm text-cyan-100">
                {cat.physicalTraits.tails}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [SKIN_TYPE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.skinType}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [SIZE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.size}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [COLOUR]
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 border border-[#30D6D6]"
                  style={{ backgroundColor: cat.physicalTraits.colour }}
                />
                <span className="text-cyan-100 uppercase">
                  {cat.physicalTraits.colour}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
                [HAS_CLAWS]
              </div>
              <div className="text-cyan-100">
                {cat.physicalTraits.hasClaws ? "YES" : "NO"}
              </div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6] mb-1">
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
                <div className="text-xs sm:text-sm font-bold tracking-widest text-[#30D6D6] mb-3">
                  [PASSIVE_ABILITIES]
                </div>
                <div className="flex flex-wrap gap-2">
                  {passiveAbilities.map((ability) => (
                    <Tooltip
                      key={ability._id?.toString()}
                      content={ability.description}
                    >
                      <div className="inline-flex px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-[#30D6D6] bg-black text-[#30D6D6] text-[10px] sm:text-xs font-bold tracking-wider hover:bg-[#30D6D6] hover:text-black transition-all cursor-help">
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
              <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-[#006694]">
                [NO_ABILITIES_GRANTED]
              </div>
            )}

            <div className="pt-4 border-t border-[#30D6D6]/30">
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#30D6D6]">
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
    <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="border-b-2 border-[#30D6D6]/30 pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-[#30D6D6]">
          {cat.name}
        </h2>
        <p className="text-xs sm:text-sm text-cyan-100/70 mt-2">
          {cat.description}
        </p>
      </div>

      <div className="w-full h-48 sm:h-56 md:h-64 flex items-center justify-center border-2 border-[#30D6D6]/30 bg-black/30">
        <GenerateImage ref={svgRef} traits={cat.physicalTraits} />
      </div>

      <FormWithHeading
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-[#30D6D6]/30">
        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isSaving}
            className="w-full sm:flex-1 border-2 border-[#30D6D6] bg-black py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6] min-h-[44px]"
          >
            {isAddingToCart ? "[ADDING...]" : "[ADD_TO_CART]"}
          </button>
        )}

        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving || isAddingToCart}
            className="w-full sm:flex-1 border-2 border-[#30D6D6] bg-black py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6] min-h-[44px]"
          >
            {isSaving ? "[SAVING...]" : "[SAVE]"}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={isSaving || isAddingToCart}
          className={`w-full border-2 border-[#30D6D6] bg-transparent py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            onSave || showAddToCart ? "sm:flex-1" : ""
          }`}
        >
          [CLOSE]
        </button>
      </div>
    </div>
  );
}
