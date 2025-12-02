// lib/components/Header.tsx

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            aXiom
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            AI-powered feedback analysis
          </p>
        </div>
        
        <nav className="flex gap-2">
          <Link href="/">
            <button className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
              Home
            </button>
          </Link>
          <Link href="/submit">
            <button className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
              Submit Feedback
            </button>
          </Link>
          <Link href="/feedbacks">
            <button className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
              Feedback List
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
}