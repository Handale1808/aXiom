// lib/components/Header.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-[#30D6D6]/30 bg-black p-4 font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
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
        </nav>
      </div>
    </header>
  );
}