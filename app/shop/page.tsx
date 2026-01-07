"use client";

import { useState } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useToast } from "@/lib/context/ToastContext";
import FormWithHeading, {
  type TabWithContent,
} from "@/lib/components/FormWithHeading";
import CatGrid, { type Cat } from "@/lib/components/CatGrid";
import Modal from "@/lib/components/Modal";
import CatDetails from "@/lib/components/CatDetails";
import { generateCat } from "@/lib/cat-generation/generateCat";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import { IAbilityRule } from "@/models/AbilityRules";
import connectToDatabase from "@/lib/mongodb";
import { generateCatAction } from "@/lib/services/catActions";
import { saveCatAction } from "@/lib/services/catActions";

export default function ShopPage() {
  const { isAdmin, isLoading } = useUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<ICat | null>(null);
  const [currentAbilities, setCurrentAbilities] = useState<IAbility[]>([]);

  const mockCats: Cat[] = [
    { id: "1", emoji: "🐱", name: "SPECIMEN_ALPHA" },
    { id: "2", emoji: "😺", name: "SUBJECT_BETA" },
    { id: "3", emoji: "😸", name: "ENTITY_GAMMA" },
    { id: "4", emoji: "😹", name: "MUTANT_DELTA" },
    { id: "5", emoji: "😻", name: "HYBRID_EPSILON" },
    { id: "6", emoji: "😼", name: "CLONE_ZETA" },
  ];

  const [cats] = useState<Cat[]>(mockCats);

  const handleGenerateCats = async () => {
    try {
      const { cat, abilities } = await generateCatAction();
      setCurrentCat(cat);
      setCurrentAbilities(abilities);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to generate cat:", error);
    }
  };

  const handleSaveCat = async (svgString: string) => {
    if (!currentCat) return;

    const result = await saveCatAction(currentCat, currentAbilities, svgString);

    if (result.success) {
      showToast("[SPECIMEN_SAVED_TO_DATABASE]", "success");
      setIsModalOpen(false);
      setCurrentCat(null);
      setCurrentAbilities([]);
    } else {
      showToast(`[SAVE_FAILED: ${result.error}]`, "error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCat(null);
    setCurrentAbilities([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black font-mono flex items-center justify-center">
        <div className="border-2 border-[#30D6D6]/30 bg-black/50 p-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <div className="text-sm tracking-[0.3em] text-[#30D6D6]">
              [LOADING_INVENTORY_DATA...]
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabWithContent[] = [
    {
      id: "admin",
      label: "ADMIN_SETTINGS",
      content: {
        buttons: [
          {
            id: "generate",
            text: "GENERATE_CATS",
            onClick: handleGenerateCats,
            disabled: false,
          },
        ],
      },
    },
    {
      id: "inventory",
      label: "INVENTORY",
      content: {
        customContent: <CatGrid cats={cats} showContainer={false} />,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="relative mx-auto max-w-6xl p-8">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            SPECIMEN_SHOP
          </h1>
          <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
            [ALIEN_FELINE_MARKETPLACE]
          </p>
        </div>

        {isAdmin ? (
          <FormWithHeading
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <CatGrid cats={cats} showContainer={true} />
        )}
      </div>
      {isModalOpen && currentCat && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          showDefaultClose={false}
        >
          <CatDetails
            cat={currentCat}
            abilities={currentAbilities}
            onSave={handleSaveCat}
            onClose={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
