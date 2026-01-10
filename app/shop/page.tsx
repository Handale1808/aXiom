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
  getAllCatsInStockAction,
} from "@/lib/services/catActions";
import { useCart } from "@/lib/context/CartContext";
import {
  getCatPriceAction,
  updateCatPriceAction,
} from "@/lib/services/settingsActions";

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
  const [catPrice, setCatPrice] = useState(500);
  const [priceInputValue, setPriceInputValue] = useState("500");
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const { user } = useUser();
  let addToCart: ((catId: string) => Promise<void>) | undefined;

  try {
    if (!isAdmin) {
      const cart = useCart();
      addToCart = cart.addToCart;
    }
  } catch (error) {
    // CartContext not available
  }

  useEffect(() => {
    if (isAdmin && activeTab === "admin") {
      getCatPriceAction().then((price) => {
        setCatPrice(price);
        setPriceInputValue(price.toString());
      });
    }
  }, [activeTab, isAdmin]);

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInputValue(e.target.value);
  };

  const handleSavePrice = async () => {
    if (!user?.id) return;

    const newPrice = parseFloat(priceInputValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast("[INVALID_PRICE]", "error");
      return;
    }

    setIsSavingPrice(true);
    try {
      const result = await updateCatPriceAction(newPrice, user.id);

      if (result.success) {
        showToast("[PRICE_UPDATED_SUCCESSFULLY]", "success");
        setCatPrice(newPrice);
      } else {
        showToast(`[ERROR: ${result.error}]`, "error");
        setPriceInputValue(catPrice.toString());
      }
    } catch (error) {
      console.error("Failed to update price:", error);
      showToast("[FAILED_TO_UPDATE_PRICE]", "error");
      setPriceInputValue(catPrice.toString());
    } finally {
      setIsSavingPrice(false);
    }
  };

  const fetchInventoryCats = async () => {
    setIsLoadingInventory(true);
    try {
      if (isAdmin) {
        const fetchedCats = await fetchAllCatsAction();
        const transformed = fetchedCats.map((cat) => ({
          id: cat._id,
          name: cat.name,
          svgImage: cat.svgImage,
        }));
        setSavedCats(transformed);
      } else {
        const stockRecords = await getAllCatsInStockAction();

        const catPromises = stockRecords.map(async (record) => {
          const { cat } = await fetchCatByIdAction(record.catId);
          return cat;
        });

        const cats = await Promise.all(catPromises);
        const validCats = cats.filter((cat) => cat !== null);

        const transformed = validCats.map((cat) => ({
          id: cat!._id!.toString(),
          name: cat!.name,
          svgImage: cat!.svgImage,
        }));

        setSavedCats(transformed);
      }
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
        customContent: (
          <div className="mt-6 relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h3 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [CAT_PRICE_SETTINGS]
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-wider text-[#30D6D6] mb-2">
                  [PRICE_PER_CAT]
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[#30D6D6] font-bold">R</span>
                  <input
                    type="number"
                    value={priceInputValue}
                    onChange={handlePriceInputChange}
                    min="1"
                    step="1"
                    className="flex-1 border-2 border-[#30D6D6]/30 bg-black px-4 py-2 text-[#30D6D6] font-mono focus:border-[#30D6D6] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePrice}
                disabled={isSavingPrice}
                className="w-full border-2 border-[#30D6D6] bg-black py-3 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
              >
                {isSavingPrice ? "[SAVING...]" : "[SAVE_PRICE]"}
              </button>
            </div>
          </div>
        ),
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
            showAddToCart={!isAdmin}
            onAddToCart={addToCart}
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
            showAddToCart={!isAdmin}
            onAddToCart={!isAdmin ? addToCart : undefined}
            onClose={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
