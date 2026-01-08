"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useToast } from "@/lib/context/ToastContext";
import FormWithHeading, {
  type TabWithContent,
} from "@/lib/components/FormWithHeading";
import CatGrid, { type Cat } from "@/lib/components/CatGrid";
import Modal from "@/lib/components/Modal";
import CatDetails from "@/lib/components/CatDetails";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import {
  generateCatAction,
  saveCatAction,
  fetchAllCatsAction,
  fetchCatByIdAction,
} from "@/lib/services/catActions";

export default function ShopPage() {
  const { isAdmin, isLoading } = useUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<ICat | null>(null);
  const [currentAbilities, setCurrentAbilities] = useState<IAbility[]>([]);
  const [savedCats, setSavedCats] = useState<Cat[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const fetchInventoryCats = async () => {
    setIsLoadingInventory(true);
    try {
      const fetchedCats = await fetchAllCatsAction();
      const transformed = fetchedCats.map((cat) => ({
        id: cat._id,
        name: cat.name,
        svgImage: cat.svgImage,
      }));
      setSavedCats(transformed);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      showToast("[FAILED_TO_LOAD_INVENTORY]", "error");
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const fetchCatDetails = async (catId: string) => {
    try {
      const { cat, abilities } = await fetchCatByIdAction(catId);

      if (!cat) {
        showToast("[SPECIMEN_NOT_FOUND]", "error");
        return;
      }

      setCurrentCat(cat);
      setCurrentAbilities(abilities);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch cat details:", error);
      showToast("[FAILED_TO_LOAD_SPECIMEN]", "error");
    }
  };

  const handleCatClick = async (catId: string) => {
    setSelectedCatId(catId);
    await fetchCatDetails(catId);
  };

  useEffect(() => {
    fetchInventoryCats();
  }, []);

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
      await fetchInventoryCats();
    } else {
      showToast(`[SAVE_FAILED: ${result.error}]`, "error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCat(null);
    setCurrentAbilities([]);
    setSelectedCatId(null);
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
        customContent: isLoadingInventory ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <div className="text-sm tracking-widest text-[#30D6D6]">
                [LOADING_INVENTORY...]
              </div>
            </div>
          </div>
        ) : savedCats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#006694] text-sm tracking-widest">
              [NO_SPECIMENS_IN_DATABASE]
            </div>
            <div className="text-[#006694]/50 text-xs tracking-wider mt-2">
              [GENERATE_AND_SAVE_CATS_TO_POPULATE_INVENTORY]
            </div>
          </div>
        ) : (
          <CatGrid
            cats={savedCats}
            showContainer={false}
            onCatClick={handleCatClick}
          />
        ),
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
          <CatGrid
            cats={savedCats}
            showContainer={true}
            onCatClick={handleCatClick}
          />
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
            onSave={selectedCatId ? undefined : handleSaveCat}
            onClose={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
