"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let cartCount = 0;
  try {
    const cart = useCart();
    if (isAuthenticated && !isAdmin) {
      cartCount = cart.cartCount;
    }
  } catch (error) {
    // CartContext not available, keep cartCount as 0
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b-2 border-[#30D6D6]/30 bg-black p-4 font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" onClick={closeMobileMenu}>
            <Image
              src="/logo1.png"
              alt="aXiom Logo"
              width={40}
              height={40}
              className="drop-shadow-[0_0_8px_rgba(48,214,214,0.5)] cursor-pointer"
            />
          </Link>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
              aXiom
            </h1>
            <p className="text-xs tracking-widest text-[#006694] font-bold">
              [FELINE GENETICS LABORATORY]
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex gap-2">
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

        <div className="flex lg:hidden items-center gap-4">
          {isAuthenticated && !isAdmin && (
            <Link href="/cart" onClick={closeMobileMenu} className="relative">
              <svg
                className="w-6 h-6 text-[#30D6D6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 border border-[#30D6D6] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6 text-[#30D6D6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-[#30D6D6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed right-0 top-0 h-screen w-1/2 bg-black z-50 border-l-2 border-[#30D6D6]/30 transition-all duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-6">
            <button
              onClick={closeMobileMenu}
              className="p-2"
              aria-label="Close navigation menu"
            >
              <svg
                className="w-6 h-6 text-[#30D6D6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col px-6 pb-6">
            <Link href="/" onClick={closeMobileMenu}>
              <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
              <Link href="/shop" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
              <Link href="/mycats" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
              <Link href="/submit" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
              <Link href="/feedbacks" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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

            <Link href="/about" onClick={closeMobileMenu}>
              <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
              <Link href="/cart" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
                className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "LOGGING_OUT..." : "LOG_OUT"}
              </button>
            ) : (
              <Link href="/login" onClick={closeMobileMenu}>
                <button className="relative w-full bg-black px-6 py-4 text-sm font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black text-left border-b border-[#30D6D6]/30">
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
      </div>
    </header>
  );
}