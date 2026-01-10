"use client";

import { useState } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useCart } from "@/lib/context/CartContext";
import { fetchCatByIdAction } from "@/lib/services/catActions";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import Modal from "@/lib/components/Modal";
import CatDetails from "@/lib/components/CatDetails";
import Link from "next/link";

export default function CartPage() {
  const { isAdmin, isLoading: userLoading } = useUser();
  const { cartItems, cartCount, price, isLoading, removeFromCart, checkout } =
    useCart();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<ICat | null>(null);
  const [selectedAbilities, setSelectedAbilities] = useState<IAbility[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCatClick = async (catId: string) => {
    try {
      const { cat, abilities } = await fetchCatByIdAction(catId);

      if (!cat) {
        return;
      }

      setSelectedCat(cat);
      setSelectedAbilities(abilities);
      setSelectedCatId(catId);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch cat details:", error);
    }
  };

  const handleRemoveFromCart = async (catId: string) => {
    await removeFromCart(catId);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await checkout();
    setIsCheckingOut(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCat(null);
    setSelectedAbilities([]);
    setSelectedCatId(null);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black font-mono flex items-center justify-center">
        <div className="border-2 border-[#30D6D6]/30 bg-black/50 p-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <div className="text-sm tracking-[0.3em] text-[#30D6D6]">
              [LOADING...]
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-black font-mono">
        <div className="relative mx-auto max-w-4xl p-8">
          <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
            <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
              SHOPPING_CART
            </h1>
            <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
              [ACCESS_DENIED]
            </p>
          </div>

          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <p className="text-cyan-100/70 leading-relaxed text-center">
              [ADMIN_USERS_CANNOT_PURCHASE_SPECIMENS]
            </p>
            <div className="mt-6 text-center">
              <Link href="/shop">
                <button className="border-2 border-[#30D6D6] bg-black px-6 py-3 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black">
                  RETURN_TO_SHOP
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="relative mx-auto max-w-4xl p-8">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            SHOPPING_CART
          </h1>
          <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
            [REVIEW_YOUR_SELECTIONS]
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <div className="text-sm tracking-widest text-[#30D6D6]">
                [LOADING_CART...]
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-12">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <div className="text-center">
              <p className="text-[#006694] text-sm tracking-widest mb-4">
                [YOUR_CART_IS_EMPTY]
              </p>
              <p className="text-[#006694]/50 text-xs tracking-wider mb-6">
                [VISIT_THE_SHOP_TO_ADD_CATS]
              </p>
              <Link href="/shop">
                <button className="border-2 border-[#30D6D6] bg-black px-6 py-3 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black">
                  BROWSE_SPECIMENS
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

              <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
                [CART_ITEMS]
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.catId}
                    className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4 grid grid-cols-[120px_1fr_auto] gap-4 items-center"
                  >
                    <div
                      className="h-24 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCatClick(item.catId)}
                      dangerouslySetInnerHTML={{ __html: item.svgImage }}
                    />

                    <div>
                      <div
                        className="text-sm font-bold tracking-wider text-[#30D6D6] cursor-pointer hover:text-[#30D6D6]/80 transition-colors"
                        onClick={() => handleCatClick(item.catId)}
                      >
                        {item.name}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.catId)}
                      disabled={isLoading}
                      className="border-2 border-[#30D6D6] bg-black px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-red-600/20 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
              <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
                [ORDER_SUMMARY]
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-cyan-100/70">
                  <span>Items in cart:</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex justify-between text-sm text-cyan-100/70">
                  <span>Price per cat:</span>
                  <span>R{price.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-[#30D6D6]/30 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-[#30D6D6]">
                  <span>TOTAL:</span>
                  <span>R{(cartCount * price).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartCount === 0}
                className="w-full border-2 border-[#30D6D6] bg-black py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
              >
                {isCheckingOut ? "[PROCESSING...]" : "[CHECKOUT]"}
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedCat && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          showDefaultClose={false}
        >
          <CatDetails
            cat={selectedCat}
            abilities={selectedAbilities}
            onClose={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
