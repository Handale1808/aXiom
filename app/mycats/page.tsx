"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePurchasedCats } from "@/lib/hooks/usePurchasedCats";
import CatGrid from "@/lib/components/cat-display/CatGrid";
import Modal from "@/lib/components/ui/Modal";
import CatDetails from "@/lib/components/cat-display/CatDetails";
import { fetchCatByIdAction } from "@/lib/services/catActions";
import { ICatAlien } from "@/models/CatAliens";
import { IAbility } from "@/models/Ability";
import Link from "next/link";

export default function MyCatsPage() {
  const router = useRouter();
  const { cats, isLoading, error, refetch } = usePurchasedCats();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<ICatAlien | null>(null);
  const [currentAbilities, setCurrentAbilities] = useState<IAbility[]>([]);
  const [isLoadingCat, setIsLoadingCat] = useState(false);

  const handleCatClick = async (catAlienId: string) => {
    setSelectedCatId(catAlienId);
    setIsLoadingCat(true);

    try {
      const { cat, abilities } = await fetchCatByIdAction(catAlienId);

      if (!cat) {
        console.error("Cat not found");
        return;
      }

      setCurrentCat(cat);
      setCurrentAbilities(abilities);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch cat details:", error);
    } finally {
      setIsLoadingCat(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCat(null);
    setCurrentAbilities([]);
    setSelectedCatId(null);
  };

  const handleSubmitFeedback = (catAlienId: string) => {
    const cat = cats.find((c) => c.id === catAlienId);
    if (cat) {
      router.push("/submit", { catAlienId: cat.id, catName: cat.name } as any);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black font-mono flex items-center justify-center">
        <div className="border-2 border-[#30D6D6]/30 bg-black/50 p-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <div className="text-sm tracking-[0.3em] text-[#30D6D6]">
              [LOADING_YOUR_COLLECTION...]
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="relative mx-auto max-w-6xl p-8">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
                MY_XENOMORPHIC_COLLECTION
              </h1>
              <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
                [PURCHASED_SPECIMENS]
              </p>
            </div>

            <button
              onClick={refetch}
              disabled={isLoading}
              className="relative border-2 border-[#30D6D6] bg-black px-8 py-3 font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "SYNCING..." : "REFRESH"}
            </button>
          </div>
        </div>

        {error && (
          <div className="relative border-2 border-red-500/50 bg-red-950/20 p-6 text-center backdrop-blur-sm mb-8">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

            <div className="mb-2 text-xs tracking-[0.3em] text-red-400">
              [SYSTEM_ERROR]
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {cats.length === 0 && !isLoading && !error && (
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-12 text-center">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="mb-4 text-sm tracking-[0.3em] text-[#30D6D6]">
              [NO_CATS_PURCHASED_YET]
            </div>
            <p className="text-cyan-100/70 mb-6">
              Visit the shop to acquire your first xenomorphic feline specimen
            </p>
            <Link href="/shop">
              <button className="border-2 border-[#30D6D6] bg-black px-8 py-3 font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)]">
                VISIT_SHOP
              </button>
            </Link>
          </div>
        )}

        {cats.length > 0 && (
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cats.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-[#006694]/50 bg-[#30D6D6]/5 transition-all hover:border-[#30D6D6] hover:bg-[#30D6D6]/10"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => handleCatClick(cat.id)}
                  >
                    <div
                      className="mb-3 h-48 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: cat.svgImage }}
                    />
                    <div className="text-xs tracking-wider text-center text-[#30D6D6]">
                      {cat.name}
                    </div>
                  </div>
                  <div className="border-t border-[#006694]/50 p-4">
                    <button
                      onClick={() => handleSubmitFeedback(cat.id)}
                      className="w-full border-2 border-[#30D6D6] bg-black py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black"
                    >
                      SUBMIT_FEEDBACK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && currentCat && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <CatDetails
            cat={currentCat}
            abilities={currentAbilities}
            onClose={handleCloseModal}
            showAddToCart={false}
          />
        </Modal>
      )}
    </div>
  );
}