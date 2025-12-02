// app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white">
            Welcome to aXiom
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            AI-Powered Feedback Analysis
          </p>
        </div>

        <div className="space-y-4 text-left">
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Transform customer feedback into actionable insights with our advanced AI analysis system.
          </p>
          
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Instant Analysis
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get real-time AI-powered insights from your customer feedback
              </p>
            </div>
            
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Comprehensive Reports
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                View and track all feedback submissions in one centralized location
              </p>
            </div>
            
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Smart Categorization
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Automatically categorize and prioritize feedback for your team
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/submit">
            <button className="rounded-lg bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}