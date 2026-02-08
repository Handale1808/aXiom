"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useToast } from "@/lib/context/ToastContext";
import FormWithHeading, {
  type TabWithContent,
} from "@/lib/components/ui/FormWithHeading";
import CatGrid, { type Cat } from "@/lib/components/cat-display/CatGrid";
import Modal from "@/lib/components/ui/Modal";
import CatDetails from "@/lib/components/cat-display/CatDetails";
import { ICat } from "@/models/Cats";
import { ICatAlien } from "@/models/CatAliens";
import { IAbility } from "@/models/Ability";
import {
  generateCatAlienAction,
  saveCatAlienAction,
  fetchAllCatAliensAction,
  fetchCatAlienByIdAction,
  getAllCatAliensInStockAction,
} from "@/lib/services/catAlienActions";
import {
  generatePureCatAction,
  savePureCatAction,
  fetchAllPureCatsAction,
  fetchPureCatByIdAction,
} from "@/lib/services/catActions"; 
import { useCart } from "@/lib/context/CartContext";
import {
  getCatPriceAction,
  updateCatPriceAction,
} from "@/lib/services/settingsActions";
import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";
import { useGenerationProgress } from "@/lib/hooks/useGenerationProgress";
import { IAlien } from "@/models/Aliens";
import {
  generateAlienAction,
  saveAlienAction,
  fetchAllAliensAction,
  fetchAlienByIdAction,
} from "@/lib/services/alienActions";
import LoadingContainer from "@/lib/components/ui/LoadingContainer";

export default function ShopPage() {
  const { isAdmin, isLoading } = useUser();
  const { showToast } = useToast();
  const scaledValues = useResponsiveScaling();
  const { isGenerating, currentMessage, startGeneration, stopGeneration } =
    useGenerationProgress();
  const [activeTab, setActiveTab] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<ICatAlien | null>(null);
  const [currentAbilities, setCurrentAbilities] = useState<IAbility[]>([]);
  const [savedCats, setSavedCats] = useState<Cat[]>([]);
  const [pureCats, setPureCats] = useState<Cat[]>([]);
  const [currentPureCat, setCurrentPureCat] = useState<ICat | null>(null);
  const [isPureCatModal, setIsPureCatModal] = useState(false);
  const [currentAlien, setCurrentAlien] = useState<IAlien | null>(null);
  const [aliens, setAliens] = useState<Cat[]>([]);
  const [isAlienModal, setIsAlienModal] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catPrice, setCatPrice] = useState(500);
  const [priceInputValue, setPriceInputValue] = useState("500");
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const { user } = useUser();

  let addToCart: ((catId: string) => Promise<void>) | undefined;

  try {
    const cart = useCart();
    if (!isAdmin) {
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

  const handleGeneratePureCat = async () => {
    try {
      startGeneration("cat");

      const { cat } = await generatePureCatAction();

      stopGeneration();

      setCurrentPureCat(cat);
      setCurrentCat(null);
      setCurrentAbilities([]);
      setIsPureCatModal(true);
      setIsModalOpen(true);
    } catch (error) {
      stopGeneration();
      console.error("Failed to generate cat:", error);
      showToast("[FAILED_TO_GENERATE_CAT]", "error");
    }
  };

  const handleSavePureCat = async (svgString: string) => {
    if (!currentPureCat) return;

    const result = await savePureCatAction(currentPureCat, svgString);

    if (result.success) {
      showToast("[CAT_SAVED_TO_DATABASE]", "success");
      setIsModalOpen(false);
      setCurrentPureCat(null);
      setIsPureCatModal(false);
      await fetchPureCatsInventory();
    } else {
      showToast(`[SAVE_FAILED: ${result.error}]`, "error");
    }
  };

  const fetchPureCatsInventory = async () => {
    try {
      const fetchedCats = await fetchAllPureCatsAction();
      const transformed = fetchedCats.map((cat) => ({
        id: cat._id,
        name: cat.name,
        svgImage: cat.svgImage,
      }));
      setPureCats(transformed);
    } catch (error) {
      console.error("Failed to fetch pure cats:", error);
      showToast("[FAILED_TO_LOAD_CATS]", "error");
    }
  };

  const handlePureCatClick = async (catId: string) => {
    try {
      const { cat } = await fetchPureCatByIdAction(catId);

      if (!cat) {
        showToast("[CAT_NOT_FOUND]", "error");
        return;
      }

      setCurrentPureCat(cat);
      setCurrentCat(null);
      setCurrentAbilities([]);
      setIsPureCatModal(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch cat details:", error);
      showToast("[FAILED_TO_LOAD_CAT]", "error");
    }
  };

  const handleGenerateAlien = async () => {
    try {
      startGeneration("alien");

      const { alien, abilities } = await generateAlienAction();

      stopGeneration();

      setCurrentAlien(alien);
      setCurrentCat(null);
      setCurrentPureCat(null);
      setCurrentAbilities(abilities);
      setIsAlienModal(true);
      setIsPureCatModal(false);
      setIsModalOpen(true);
    } catch (error) {
      stopGeneration();
      console.error("Failed to generate alien:", error);
      showToast("[FAILED_TO_GENERATE_ALIEN]", "error");
    }
  };

  const handleSaveAlien = async (svgString: string) => {
    if (!currentAlien) return;

    const result = await saveAlienAction(
      currentAlien,
      currentAbilities,
      svgString
    );

    if (result.success) {
      showToast("[ALIEN_SAVED_TO_DATABASE]", "success");
      setIsModalOpen(false);
      setCurrentAlien(null);
      setIsAlienModal(false);
      await fetchAliensInventory();
    } else {
      showToast(`[SAVE_FAILED: ${result.error}]`, "error");
    }
  };

  const fetchAliensInventory = async () => {
    try {
      const fetchedAliens = await fetchAllAliensAction();
      const transformed = fetchedAliens.map((alien) => ({
        id: alien._id,
        name: alien.name,
        svgImage: alien.svgImage,
      }));
      setAliens(transformed);
    } catch (error) {
      console.error("Failed to fetch aliens:", error);
      showToast("[FAILED_TO_LOAD_ALIENS]", "error");
    }
  };

  const handleAlienClick = async (alienId: string) => {
    try {
      const { alien, abilities } = await fetchAlienByIdAction(alienId);

      if (!alien) {
        showToast("[ALIEN_NOT_FOUND]", "error");
        return;
      }

      setCurrentAlien(alien);
      setCurrentCat(null);
      setCurrentPureCat(null);
      setCurrentAbilities(abilities);
      setIsAlienModal(true);
      setIsPureCatModal(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch alien details:", error);
      showToast("[FAILED_TO_LOAD_ALIEN]", "error");
    }
  };

  const fetchCatAliensInventory = async () => {
    setIsLoadingInventory(true);
    try {
      if (isAdmin) {
        const fetchedCats = await fetchAllCatAliensAction();
        const transformed = fetchedCats.map((cat) => ({
          id: cat._id,
          name: cat.name,
          svgImage: cat.svgImage,
        }));
        setSavedCats(transformed);
      } else {
        const stockRecords = await getAllCatAliensInStockAction();

        const catPromises = stockRecords.map(async (record) => {
          const { cat } = await fetchCatAlienByIdAction(record.catAlienId);
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
      console.error("Failed to fetch cat-alien inventory:", error);
      showToast("[FAILED_TO_LOAD_INVENTORY]", "error");
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const fetchCatAlienDetails = async (catId: string) => {
    try {
      const { cat, abilities } = await fetchCatAlienByIdAction(catId);

      if (!cat) {
        showToast("[SPECIMEN_NOT_FOUND]", "error");
        return;
      }

      setCurrentCat(cat);
      setCurrentAbilities(abilities);
      setCurrentPureCat(null);
      setIsPureCatModal(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch cat-alien details:", error);
      showToast("[FAILED_TO_LOAD_SPECIMEN]", "error");
    }
  };

  const handleCatAlienClick = async (catId: string) => {
    setSelectedCatId(catId);
    await fetchCatAlienDetails(catId);
  };

  useEffect(() => {
    fetchCatAliensInventory();
    fetchPureCatsInventory();
    fetchAliensInventory();
  }, []);

  const handleGenerateCatAlien = async () => {
    try {
      startGeneration("cat-alien");

      const { cat, abilities } = await generateCatAlienAction();

      stopGeneration();

      setCurrentCat(cat);
      setCurrentAbilities(abilities);
      setCurrentPureCat(null);
      setIsPureCatModal(false);
      setIsModalOpen(true);
    } catch (error) {
      stopGeneration();
      console.error("Failed to generate cat-alien:", error);
      showToast("[FAILED_TO_GENERATE_CAT_ALIEN]", "error");
    }
  };

  const handleSaveCatAlien = async (svgString: string) => {
    if (!currentCat) return;

    const result = await saveCatAlienAction(
      currentCat,
      currentAbilities,
      svgString
    );

    if (result.success) {
      showToast("[SPECIMEN_SAVED_TO_DATABASE]", "success");
      setIsModalOpen(false);
      setCurrentCat(null);
      setCurrentAbilities([]);
      await fetchCatAliensInventory();
    } else {
      showToast(`[SAVE_FAILED: ${result.error}]`, "error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCat(null);
    setCurrentPureCat(null);
    setCurrentAlien(null);
    setCurrentAbilities([]);
    setIsPureCatModal(false);
    setIsAlienModal(false);
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
            id: "generate-cat",
            text: "GENERATE_CAT",
            onClick: handleGeneratePureCat,
            disabled: isGenerating,
          },
          {
            id: "generate-alien",
            text: "GENERATE_ALIEN",
            onClick: handleGenerateAlien,
            disabled: isGenerating,
          },
          {
            id: "generate-cat-alien",
            text: "GENERATE_CAT_ALIEN",
            onClick: handleGenerateCatAlien,
            disabled: isGenerating,
          },
        ],
        customContent: (
          <div className="relative">
            {isGenerating && (
              <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center">
                <LoadingContainer message={currentMessage} />
              </div>
            )}

            <div
              className="mt-6 relative border-2 border-[#30D6D6]/30 bg-black/50"
              style={{ padding: `${scaledValues.container.padding}px` }}
            >
              <div
                className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
                style={{
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`,
                }}
              />
              <div
                className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
                style={{
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`,
                }}
              />
              <div
                className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
                style={{
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`,
                }}
              />
              <div
                className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
                style={{
                  height: `${scaledValues.container.cornerSize}px`,
                  width: `${scaledValues.container.cornerSize}px`,
                }}
              />

              <h3
                className="mb-4 font-bold tracking-widest text-[#30D6D6]"
                style={{
                  fontSize: `${scaledValues.heading.fontSize}px`,
                  letterSpacing: `${scaledValues.heading.letterSpacing}em`,
                }}
              >
                [CAT_PRICE_SETTINGS]
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[#30D6D6] mb-2"
                    style={{
                      fontSize: `${scaledValues.label.fontSize}px`,
                      letterSpacing: `${scaledValues.label.letterSpacing}em`,
                    }}
                  >
                    [PRICE_PER_CAT]
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[#30D6D6] font-bold"
                      style={{
                        fontSize: `${scaledValues.currencySymbol.fontSize}px`,
                      }}
                    >
                      R
                    </span>
                    <input
                      type="number"
                      value={priceInputValue}
                      onChange={handlePriceInputChange}
                      min="1"
                      step="1"
                      className="flex-1 border-[#30D6D6]/30 bg-black text-[#30D6D6] font-mono focus:border-[#30D6D6] focus:outline-none"
                      style={{
                        fontSize: `${scaledValues.input.fontSize}px`,
                        paddingLeft: `${scaledValues.input.paddingX}px`,
                        paddingRight: `${scaledValues.input.paddingX}px`,
                        paddingTop: `${scaledValues.input.paddingY}px`,
                        paddingBottom: `${scaledValues.input.paddingY}px`,
                        borderWidth: `${scaledValues.input.borderWidth}px`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePrice}
                  disabled={isSavingPrice}
                  className="w-full border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
                  style={{
                    fontSize: `${scaledValues.button.fontSize}px`,
                    paddingTop: `${scaledValues.button.paddingY}px`,
                    paddingBottom: `${scaledValues.button.paddingY}px`,
                  }}
                >
                  {isSavingPrice ? "[SAVING...]" : "[SAVE_PRICE]"}
                </button>
              </div>
            </div>
          </div>
        ),
      },
    },
    ...(isAdmin
      ? [
          {
            id: "cats",
            label: "CATS",
            content: {
              customContent:
                pureCats.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-[#006694] text-sm tracking-widest">
                      [NO_CATS_IN_DATABASE]
                    </div>
                    <div className="text-[#006694]/50 text-xs tracking-wider mt-2">
                      [GENERATE_AND_SAVE_CATS_TO_POPULATE_INVENTORY]
                    </div>
                  </div>
                ) : (
                  <CatGrid
                    cats={pureCats}
                    showContainer={false}
                    onCatClick={handlePureCatClick}
                  />
                ),
            },
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "aliens",
            label: "ALIENS",
            content: {
              customContent:
                aliens.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-[#006694] text-sm tracking-widest">
                      [NO_ALIENS_IN_DATABASE]
                    </div>
                    <div className="text-[#006694]/50 text-xs tracking-wider mt-2">
                      [GENERATE_AND_SAVE_ALIENS_TO_POPULATE_INVENTORY]
                    </div>
                  </div>
                ) : (
                  <CatGrid
                    cats={aliens}
                    showContainer={false}
                    onCatClick={handleAlienClick}
                  />
                ),
            },
          },
        ]
      : []),
    {
      id: "inventory",
      label: "INVENTORY",
      content: {
        customContent: isLoadingInventory ? (
          <LoadingContainer message="[LOADING_INVENTORY...]" />
        ) : savedCats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#006694] text-sm tracking-widest">
              [NO_SPECIMENS_IN_DATABASE]
            </div>
            <div className="text-[#006694]/50 text-xs tracking-wider mt-2">
              [GENERATE_AND_SAVE_CAT_ALIENS_TO_POPULATE_INVENTORY]
            </div>
          </div>
        ) : (
          <CatGrid
            cats={savedCats}
            showContainer={false}
            onCatClick={handleCatAlienClick}
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
            onCatClick={handleCatAlienClick}
            showAddToCart={!isAdmin}
            onAddToCart={addToCart}
          />
        )}
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          showDefaultClose={false}
        >
          {isPureCatModal && currentPureCat ? (
            <CatDetails
              cat={currentPureCat}
              abilities={[]}
              onSave={handleSavePureCat}
              showAddToCart={false}
              onClose={handleCloseModal}
            />
          ) : isAlienModal && currentAlien ? (
            <CatDetails
              cat={currentAlien}
              abilities={currentAbilities}
              onSave={selectedCatId ? undefined : handleSaveAlien}
              showAddToCart={!isAdmin}
              onAddToCart={!isAdmin ? addToCart : undefined}
              onClose={handleCloseModal}
            />
          ) : currentCat ? (
            <CatDetails
              cat={currentCat}
              abilities={currentAbilities}
              onSave={selectedCatId ? undefined : handleSaveCatAlien}
              showAddToCart={!isAdmin}
              onAddToCart={!isAdmin ? addToCart : undefined}
              onClose={handleCloseModal}
            />
          ) : null}
        </Modal>
      )}
    </div>
  );
}
