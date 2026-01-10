// app/submit/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextSubmit from "@/lib/components/TextSubmit";
import AnalysisResult from "@/lib/components/AnalysisResult";
import { apiFetch } from "@/lib/apiClient";
import type { FeedbackWithId, ApiSuccessResponse } from "@/lib/types/api";
import CatSelector from "@/lib/components/cat-display/CatSelector";

export default function Submit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackWithId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedCatName, setSelectedCatName] = useState<string | null>(null);

  useEffect(() => {
    // Check if navigated from My Cats page with cat info in router state
    const state = (router as any).state as { catId?: string; catName?: string };
    if (state?.catId && state?.catName) {
      setSelectedCatId(state.catId);
      setSelectedCatName(state.catName);
    }
  }, [router]);

  const handleSubmit = async (text: string, email?: string) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetch<ApiSuccessResponse<FeedbackWithId>>(
        "/api/feedback",
        {
          method: "POST",
          body: JSON.stringify({
            text,
            email,
            catId: selectedCatId, // ADD THIS LINE
          }),
        }
      );

      setResult(data.data);
      // Clear cat selection after successful submit
      setSelectedCatId(null);
      setSelectedCatName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCatSelect = (catId: string | null, catName: string | null) => {
    setSelectedCatId(catId);
    setSelectedCatName(catName);
  };

  return (
    <div className="relative min-h-screen bg-black p-4 font-mono">
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6">
          <h1 className="text-center text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            FEEDBACK_ANALYSIS_TERMINAL
          </h1>
          <p className="mt-2 text-center text-sm tracking-widest text-[#006694] font-bold">
            [SPECIMEN_FEEDBACK_PROTOCOL]
          </p>
        </div>

        <div className="mb-6 space-y-6">
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-5 backdrop-blur-sm">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h3 className="mb-3 text-sm font-bold tracking-widest text-[#30D6D6]">
              [SYSTEM_INSTRUCTIONS]
            </h3>
            <p className="text-cyan-100/70 leading-relaxed">
              Report your alien-enhanced feline's behavior, abilities, and any
              genetic anomalies. Our advanced xenomorphic AI will analyze
              specimen performance through quantum neural networks. Genetic
              algorithms optimize DNA integration protocols in real-time.
            </p>
          </div>

          <CatSelector
            selectedCatId={selectedCatId}
            selectedCatName={selectedCatName}
            onSelect={handleCatSelect}
            disabled={isSubmitting}
          />

          {selectedCatId && selectedCatName && (
            <div className="relative border-2 border-[#30D6D6]/30 bg-[#30D6D6]/10 p-3 text-center">
              <div className="text-xs tracking-wider text-[#30D6D6]">
                [FEEDBACK_FOR: {selectedCatName}]
              </div>
            </div>
          )}

          <TextSubmit
            onSubmit={handleSubmit}
            placeholder="Begin transmission... describe your experience with our alien feline fusion technology..."
          />
        </div>

        {isSubmitting && (
          <div className="relative mb-6 border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-8 text-center">
            <div className="mb-3 text-xs tracking-[0.3em] text-[#30D6D6]/70">
              PROCESSING_DATA
            </div>
            <div className="flex justify-center gap-1">
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="mt-3 text-sm text-cyan-100/60">
              Analyzing specimen biomarkers and enhancement stability...
            </p>
          </div>
        )}

        {error && (
          <div className="relative mb-6 border-2 border-red-500/50 bg-red-950/30 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-red-500" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-red-500" />

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <div>
                <div className="text-xs font-bold tracking-wider text-red-400">
                  [ERROR_DETECTED]
                </div>
                <p className="mt-1 text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <AnalysisResult analysis={result.analysis} />

            <div className="relative border-2 border-[#30D6D6] bg-[#30D6D6]/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs tracking-[0.3em] text-[#30D6D6]">
                  TRANSMISSION_COMPLETE
                </span>
              </div>
              <p className="text-sm text-cyan-100/70">
                Specimen data successfully integrated into xenomorphic database
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_FEEDBACK_TERMINAL_v1.337 | AI_CORE_ONLINE | GENE_SPLICE_READY
        </div>
      </div>
    </div>
  );
}
