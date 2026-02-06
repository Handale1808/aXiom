"use client";

import { useState } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useCart } from "@/lib/context/CartContext";
import { fetchCatByIdAction } from "@/lib/services/catActions";
import { ICat } from "@/models/Cats";
import { IAbility } from "@/models/Ability";
import Modal from "@/lib/components/ui/Modal";
import CatDetails from "@/lib/components/cat-display/CatDetails";
import Link from "next/link";
import { useResponsiveScaling } from "@/lib/hooks/useResponsiveScaling";

export default function CartPage() {
  const { isAdmin, isLoading: userLoading } = useUser();
  const { cartItems, cartCount, price, isLoading, removeFromCart, checkout } =
    useCart();
  const scaled = useResponsiveScaling();
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
        <div
          className="border-2 border-[#30D6D6]/30 bg-black/50"
          style={{ padding: `${scaled.padding.large}px` }}
        >
          <div
            className="flex items-center"
            style={{ gap: `${scaled.spacing.gapSmall}px` }}
          >
            <div
              style={{
                height: `${scaled.interactive.loadingIndicator}px`,
                width: `${scaled.interactive.loadingIndicator}px`,
              }}
              className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
            />
            <div
              style={{
                fontSize: `${scaled.text.small}px`,
                letterSpacing: "0.3em",
              }}
              className="tracking-[0.3em] text-[#30D6D6]"
            >
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
        <div
          className="relative mx-auto max-w-4xl"
          style={{ padding: `${scaled.padding.large}px` }}
        >
          <div
            className="border-b-2 border-[#30D6D6]"
            style={{
              marginBottom: `${scaled.spacing.marginLarge}px`,
              paddingBottom: `${scaled.spacing.gapLarge}px`,
            }}
          >
            <h1
              style={{ fontSize: `${scaled.text.large}px` }}
              className="font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]"
            >
              SHOPPING_CART
            </h1>
            <p
              style={{
                marginTop: `${scaled.spacing.marginTopSmall}px`,
                fontSize: `${scaled.text.small}px`,
              }}
              className="tracking-widest text-[#006694] font-bold"
            >
              [ACCESS_DENIED]
            </p>
          </div>

          <div
            className="relative border-2 border-[#30D6D6]/30 bg-black/50"
            style={{ padding: `${scaled.padding.containerMedium}px` }}
          >
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
            />

            <p className="text-cyan-100/70 leading-relaxed text-center">
              [ADMIN_USERS_CANNOT_PURCHASE_SPECIMENS]
            </p>
            <div
              className="text-center"
              style={{ marginTop: `${scaled.spacing.gapLarge}px` }}
            >
              <Link href="/shop">
                <button
                  style={{
                    paddingLeft: `${scaled.padding.buttonX}px`,
                    paddingRight: `${scaled.padding.buttonX}px`,
                    paddingTop: `${scaled.padding.small}px`,
                    paddingBottom: `${scaled.padding.small}px`,
                    fontSize: `${scaled.text.small}px`,
                  }}
                  className="border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black"
                >
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
      <div
        className="relative mx-auto max-w-4xl"
        style={{ padding: `${scaled.padding.large}px` }}
      >
        <div
          className="border-b-2 border-[#30D6D6]"
          style={{
            marginBottom: `${scaled.spacing.marginLarge}px`,
            paddingBottom: `${scaled.spacing.gapLarge}px`,
          }}
        >
          <h1
            style={{ fontSize: `${scaled.text.large}px` }}
            className="font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]"
          >
            SHOPPING_CART
          </h1>
          <p
            style={{
              marginTop: `${scaled.spacing.marginTopSmall}px`,
              fontSize: `${scaled.text.small}px`,
            }}
            className="tracking-widest text-[#006694] font-bold"
          >
            [REVIEW_YOUR_SELECTIONS]
          </p>
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{
              paddingTop: `${scaled.padding.extraLarge}px`,
              paddingBottom: `${scaled.padding.extraLarge}px`,
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: `${scaled.spacing.gapSmall}px` }}
            >
              <div
                style={{
                  height: `${scaled.interactive.loadingIndicator}px`,
                  width: `${scaled.interactive.loadingIndicator}px`,
                }}
                className="animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
              />
              <div
                style={{
                  fontSize: `${scaled.text.small}px`,
                  letterSpacing: "0.3em",
                }}
                className="text-[#30D6D6]"
              >
                [LOADING_CART...]
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div
            className="relative border-2 border-[#30D6D6]/30 bg-black/50"
            style={{ padding: `${scaled.padding.emptyStateY}px` }}
          >
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
            />
            <div
              style={{
                height: `${scaled.decorations.cornerSize}px`,
                width: `${scaled.decorations.cornerSize}px`,
              }}
              className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
            />

            <div className="text-center">
              <p
                style={{
                  fontSize: `${scaled.text.small}px`,
                  marginBottom: `${scaled.spacing.gapMedium}px`,
                }}
                className="text-[#006694] tracking-widest"
              >
                [YOUR_CART_IS_EMPTY]
              </p>
              <p
                style={{
                  fontSize: `${scaled.text.tiny}px`,
                  marginBottom: `${scaled.spacing.gapLarge}px`,
                }}
                className="text-[#006694]/50 tracking-wider"
              >
                [VISIT_THE_SHOP_TO_ADD_CATS]
              </p>
              <Link href="/shop">
                <button
                  style={{
                    paddingLeft: `${scaled.padding.buttonX}px`,
                    paddingRight: `${scaled.padding.buttonX}px`,
                    paddingTop: `${scaled.padding.small}px`,
                    paddingBottom: `${scaled.padding.small}px`,
                    fontSize: `${scaled.text.small}px`,
                  }}
                  className="border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black"
                >
                  BROWSE_SPECIMENS
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col"
            style={{ gap: `${scaled.spacing.gapLarge}px` }}
          >
            <div
              className="relative border-2 border-[#30D6D6]/30 bg-black/50"
              style={{ padding: `${scaled.padding.containerMedium}px` }}
            >
              <div
                style={{
                  height: `${scaled.decorations.cornerSize}px`,
                  width: `${scaled.decorations.cornerSize}px`,
                }}
                className="absolute -left-px -top-px border-l-2 border-t-2 border-[#30D6D6]"
              />
              <div
                style={{
                  height: `${scaled.decorations.cornerSize}px`,
                  width: `${scaled.decorations.cornerSize}px`,
                }}
                className="absolute -right-px -top-px border-r-2 border-t-2 border-[#30D6D6]"
              />
              <div
                style={{
                  height: `${scaled.decorations.cornerSize}px`,
                  width: `${scaled.decorations.cornerSize}px`,
                }}
                className="absolute -bottom-px -left-px border-b-2 border-l-2 border-[#30D6D6]"
              />
              <div
                style={{
                  height: `${scaled.decorations.cornerSize}px`,
                  width: `${scaled.decorations.cornerSize}px`,
                }}
                className="absolute -bottom-px -right-px border-b-2 border-r-2 border-[#30D6D6]"
              />

              <h2
                style={{
                  marginBottom: `${scaled.spacing.gapLarge}px`,
                  fontSize: `${scaled.text.small}px`,
                }}
                className="font-bold tracking-widest text-[#30D6D6]"
              >
                [CART_ITEMS]
              </h2>

              <div
                className="flex flex-col"
                style={{ gap: `${scaled.spacing.gapMedium}px` }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.catId}
                    style={{
                      padding: `${scaled.padding.medium}px`,
                      gap: `${scaled.spacing.gapMedium}px`,
                      gridTemplateColumns: `${scaled.interactive.catAvatarSize * 2}px 1fr auto`,
                    }}
                    className="border border-[#006694]/50 bg-[#30D6D6]/5 grid items-center"
                  >
                    <div
                      style={{
                        height: `${scaled.interactive.catAvatarSize * 1.5}px`,
                      }}
                      className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCatClick(item.catId)}
                      dangerouslySetInnerHTML={{ __html: item.svgImage }}
                    />

                    <div>
                      <div
                        style={{ fontSize: `${scaled.text.small}px` }}
                        className="font-bold tracking-wider text-[#30D6D6] cursor-pointer hover:text-[#30D6D6]/80 transition-colors"
                        onClick={() => handleCatClick(item.catId)}
                      >
                        {item.name}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.catId)}
                      disabled={isLoading}
                      style={{
                        paddingLeft: `${scaled.padding.medium}px`,
                        paddingRight: `${scaled.padding.medium}px`,
                        paddingTop: `${scaled.padding.small}px`,
                        paddingBottom: `${scaled.padding.small}px`,
                        fontSize: `${scaled.text.tiny}px`,
                      }}
                      className="border-2 border-[#30D6D6] bg-black font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-red-600/20 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10"
              style={{ padding: `${scaled.padding.containerMedium}px` }}
            >
              <h2
                style={{
                  marginBottom: `${scaled.spacing.gapMedium}px`,
                  fontSize: `${scaled.text.small}px`,
                }}
                className="font-bold tracking-widest text-[#30D6D6]"
              >
                [ORDER_SUMMARY]
              </h2>

              <div
                className="flex flex-col"
                style={{
                  gap: `${scaled.spacing.marginSmall}px`,
                  marginBottom: `${scaled.spacing.gapMedium}px`,
                }}
              >
                <div
                  style={{ fontSize: `${scaled.text.small}px` }}
                  className="flex justify-between text-cyan-100/70"
                >
                  <span>Items in cart:</span>
                  <span>{cartCount}</span>
                </div>
                <div
                  style={{ fontSize: `${scaled.text.small}px` }}
                  className="flex justify-between text-cyan-100/70"
                >
                  <span>Price per cat:</span>
                  <span>R{price.toFixed(2)}</span>
                </div>
              </div>

              <div
                className="border-t border-[#30D6D6]/30"
                style={{
                  paddingTop: `${scaled.spacing.gapMedium}px`,
                  marginBottom: `${scaled.spacing.gapLarge}px`,
                }}
              >
                <div
                  style={{ fontSize: `${scaled.text.mediumHeading}px` }}
                  className="flex justify-between font-bold text-[#30D6D6]"
                >
                  <span>TOTAL:</span>
                  <span>R{(cartCount * price).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartCount === 0}
                style={{
                  paddingTop: `${scaled.button.paddingY}px`,
                  paddingBottom: `${scaled.button.paddingY}px`,
                  fontSize: `${scaled.button.fontSize}px`,
                }}
                className="w-full border-2 border-[#30D6D6] bg-black font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#30D6D6]"
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