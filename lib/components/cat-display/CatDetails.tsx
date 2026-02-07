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
import GenerateImage from "@/lib/cat-alien-generation/generateImage";
import {
  STAT_RANGES,
  RESISTANCE_RANGES,
  BEHAVIOR_RANGES,
  GENERATION_LIMITS,
} from "@/lib/cat-alien-generation/constants";
import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";

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
  const scaled = useResponsiveScaling();

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
    if (isSaving || !svgRef.current || !onSave) return;
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
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{ gap: `${scaled.spacing.gapMedium}px` }}
          >
            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [EYES]
              </div>
              <div
                className="text-cyan-100"
                style={{ fontSize: `${scaled.text.small}px` }}
              >
                {cat.physicalTraits.eyes}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [LEGS]
              </div>
              <div
                className="text-cyan-100"
                style={{ fontSize: `${scaled.text.small}px` }}
              >
                {cat.physicalTraits.legs}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [WINGS]
              </div>
              <div
                className="text-cyan-100"
                style={{ fontSize: `${scaled.text.small}px` }}
              >
                {cat.physicalTraits.wings}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [TAILS]
              </div>
              <div
                className="text-cyan-100"
                style={{ fontSize: `${scaled.text.small}px` }}
              >
                {cat.physicalTraits.tails}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [SKIN_TYPE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.skinType}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [SIZE]
              </div>
              <div className="text-cyan-100 uppercase">
                {cat.physicalTraits.size}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [COLOUR]
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="border border-[#30D6D6]"
                  style={{
                    width: `${scaled.interactive.iconSize}px`,
                    height: `${scaled.interactive.iconSize}px`,
                    backgroundColor: cat.physicalTraits.colour,
                  }}
                />
                <span className="text-cyan-100 uppercase">
                  {cat.physicalTraits.colour}
                </span>
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
                [HAS_CLAWS]
              </div>
              <div className="text-cyan-100">
                {cat.physicalTraits.hasClaws ? "YES" : "NO"}
              </div>
            </div>

            <div>
              <div
                className="font-bold tracking-widest text-[#30D6D6] mb-1"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${scaled.spacing.gapMedium}px`,
            }}
          >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${scaled.spacing.gapMedium}px`,
            }}
          >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${scaled.spacing.gapMedium}px`,
            }}
          >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${scaled.spacing.gapLarge}px`,
            }}
          >
            {passiveAbilities.length > 0 && (
              <div>
                <div
                  className="font-bold tracking-widest text-[#30D6D6] mb-3"
                  style={{ fontSize: `${scaled.text.small}px` }}
                >
                  [PASSIVE_ABILITIES]
                </div>
                <div
                  className="flex flex-wrap"
                  style={{ gap: `${scaled.spacing.gapSmall}px` }}
                >
                  {passiveAbilities.map((ability) => (
                    <Tooltip
                      key={ability._id?.toString()}
                      content={ability.description}
                    >
                      <div
                        className="inline-flex border-2 border-[#30D6D6] bg-black text-[#30D6D6] font-bold tracking-wider hover:bg-[#30D6D6] hover:text-black transition-all cursor-help"
                        style={{
                          paddingLeft: `${scaled.interactive.badgePaddingXSmall}px`,
                          paddingRight: `${scaled.interactive.badgePaddingXSmall}px`,
                          paddingTop: `${scaled.interactive.badgePaddingYSmall}px`,
                          paddingBottom: `${scaled.interactive.badgePaddingYSmall}px`,
                          fontSize: `${scaled.text.extraSmall}px`,
                        }}
                      >
                        {ability.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {activeAbilities.length > 0 && (
              <div>
                <div
                  className="font-bold tracking-widest text-[#30D6D6] mb-3"
                  style={{ fontSize: `${scaled.text.small}px` }}
                >
                  [ACTIVE_ABILITIES]
                </div>
                <div
                  className="flex flex-wrap"
                  style={{ gap: `${scaled.spacing.gapSmall}px` }}
                >
                  {activeAbilities.map((ability) => (
                    <Tooltip
                      key={ability._id?.toString()}
                      content={ability.description}
                    >
                      <div
                        className="inline-flex border-2 border-[#30D6D6] bg-[#30D6D6] text-black font-bold tracking-wider hover:bg-black hover:text-[#30D6D6] transition-all cursor-help"
                        style={{
                          paddingLeft: `${scaled.interactive.badgePaddingX}px`,
                          paddingRight: `${scaled.interactive.badgePaddingX}px`,
                          paddingTop: `${scaled.interactive.badgePaddingY}px`,
                          paddingBottom: `${scaled.interactive.badgePaddingY}px`,
                          fontSize: `${scaled.text.extraSmall}px`,
                        }}
                      >
                        {ability.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {abilities.length === 0 && (
              <div
                className="text-center text-[#006694]"
                style={{
                  paddingTop: `${scaled.padding.emptyStateY}px`,
                  paddingBottom: `${scaled.padding.emptyStateY}px`,
                  fontSize: `${scaled.text.small}px`,
                }}
              >
                [NO_ABILITIES_GRANTED]
              </div>
            )}

            <div
              className="border-t border-[#30D6D6]/30"
              style={{ paddingTop: `${scaled.spacing.paddingTopSmall}px` }}
            >
              <div
                className="font-bold tracking-widest text-[#30D6D6]"
                style={{ fontSize: `${scaled.text.extraSmall}px` }}
              >
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
    <div
      style={{
        padding: `${scaled.padding.containerMedium}px`,
        display: "flex",
        flexDirection: "column",
        gap: `${scaled.spacing.spaceYMedium}px`,
      }}
    >
      <div
        className="border-b-2 border-[#30D6D6]/30"
        style={{ paddingBottom: `${scaled.spacing.paddingBottomSmall}px` }}
      >
        <h2
          className="font-bold tracking-wider text-[#30D6D6]"
          style={{ fontSize: `${scaled.text.large}px` }}
        >
          {cat.name}
        </h2>
        <p
          className="text-cyan-100/70 mt-2"
          style={{ fontSize: `${scaled.text.small}px` }}
        >
          {cat.description}
        </p>
      </div>

      <div
        className="w-full flex items-center justify-center border-2 border-[#30D6D6]/30 bg-black/30"
        style={{ height: `${scaled.imageContainer.catDisplay}px` }}
      >
        <GenerateImage ref={svgRef} traits={cat.physicalTraits} />
      </div>

      <FormWithHeading
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        className="flex flex-col sm:flex-row border-t-2 border-[#30D6D6]/30"
        style={{
          gap: `${scaled.spacing.gapMedium}px`,
          marginTop: `${scaled.spacing.marginTopMedium}px`,
          paddingTop: `${scaled.spacing.paddingTopSmall}px`,
        }}
      >
        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isSaving}
            className="w-full sm:flex-1 border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
            style={{
              paddingTop: `${scaled.button.paddingY}px`,
              paddingBottom: `${scaled.button.paddingY}px`,
              fontSize: `${scaled.text.base}px`,
              minHeight: `${scaled.interactive.minTouchTarget}px`,
            }}
          >
            {isAddingToCart ? "[ADDING...]" : "[ADD_TO_CART]"}
          </button>
        )}

        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving || isAddingToCart}
            className="w-full sm:flex-1 border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
            style={{
              paddingTop: `${scaled.button.paddingY}px`,
              paddingBottom: `${scaled.button.paddingY}px`,
              fontSize: `${scaled.text.base}px`,
              minHeight: `${scaled.interactive.minTouchTarget}px`,
            }}
          >
            {isSaving ? "[SAVING...]" : "[SAVE]"}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={isSaving || isAddingToCart}
          className={`w-full border-2 border-[#30D6D6] bg-transparent font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            onSave || showAddToCart ? "sm:flex-1" : ""
          }`}
          style={{
            paddingTop: `${scaled.button.paddingY}px`,
            paddingBottom: `${scaled.button.paddingY}px`,
            fontSize: `${scaled.text.base}px`,
            minHeight: `${scaled.interactive.minTouchTarget}px`,
          }}
        >
          [CLOSE]
        </button>
      </div>
    </div>
  );
}
