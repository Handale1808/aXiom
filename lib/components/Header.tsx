"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Always call useCart unconditionally
  let cartCount = 0;
  try {
    const cart = useCart();
    // Only use the cart count if user is authenticated and not admin
    if (isAuthenticated && !isAdmin) {
      cartCount = cart.cartCount;
    }
  } catch (error) {
    // CartContext not available, keep cartCount as 0
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        setIsLoggingOut(false);
      }
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b-2 border-[#30D6D6]/30 bg-black p-4 font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo1.png"
            alt="aXiom Logo"
            width={40}
            height={40}
            className="drop-shadow-[0_0_8px_rgba(48,214,214,0.5)]"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
              aXiom
            </h1>
            <p className="text-xs tracking-widest text-[#006694] font-bold">
              [FELINE GENETICS LABORATORY]
            </p>
          </div>
        </div>

        <nav className="flex gap-2">
          <Link href="/">
            <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
              {pathname === "/" && (
                <>
                  <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                  <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                  <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                  <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                </>
              )}
              HOME
            </button>
          </Link>

          {isAuthenticated && (
            <Link href="/shop">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/shop" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                SHOP
              </button>
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <Link href="/mycats">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/mycats" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                MY_CATS
              </button>
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <Link href="/submit">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/submit" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                SUBMIT
              </button>
            </Link>
          )}

          {isAdmin && (
            <Link href="/feedbacks">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/feedbacks" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                FEEDBACK_LIST
              </button>
            </Link>
          )}

          <Link href="/about">
            <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
              {pathname === "/about" && (
                <>
                  <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                  <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                  <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                  <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                </>
              )}
              ABOUT
            </button>
          </Link>

          {isAuthenticated && !isAdmin && (
            <Link href="/cart">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/cart" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                CART
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 border border-[#30D6D6] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? "LOGGING_OUT..." : "LOG_OUT"}
            </button>
          ) : (
            <Link href="/login">
              <button className="relative bg-black px-6 py-2 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black group">
                {pathname === "/login" && (
                  <>
                    <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#30D6D6]"></span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#30D6D6]"></span>
                  </>
                )}
                LOG_IN
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
