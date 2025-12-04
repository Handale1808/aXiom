// app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black p-4 font-mono">
      <div className="relative mx-auto max-w-5xl">
        {/* Header with logo */}
        <div className="mb-12 border-b-2 border-[#30D6D6] pb-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
                aXiom
              </h1>
              <p className="text-sm tracking-widest font-extrabold text-[#006694] mt-1">
                [FELINE GENETICS LABORATORY]
              </p>
            </div>
          </div>
          <p className="text-lg text-[#30D6D6]/80 tracking-wide pl-4 text-center">
            Alien genetics meet Earth's cutest
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Mission brief */}
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6 backdrop-blur-sm">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h3 className="mb-3 text-sm font-bold tracking-widest text-[#30D6D6]">
              [MISSION_BRIEF]
            </h3>
            <p className="text-cyan-100/70 leading-relaxed">
              Share your experience with your genetically-enhanced cat
              companion. Our AI analyzes customer feedback to improve future
              feline specimens and alien DNA integration protocols.
            </p>
          </div>

          {/* Status display */}
          <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#30D6D6]/30 pb-2">
              <span className="text-xs tracking-widest text-[#30D6D6]">
                SYSTEM_STATUS
              </span>
              <span className="text-xs text-[#006694] font-bold">
                OPERATIONAL
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-cyan-100/70">
                <span>AI Core:</span>
                <span className="text-[#30D6D6]">ONLINE</span>
              </div>
              <div className="flex justify-between text-cyan-100/70">
                <span>Analysis Engine:</span>
                <span className="text-[#30D6D6]">READY</span>
              </div>
              <div className="flex justify-between text-cyan-100/70">
                <span>Data Processing:</span>
                <span className="text-[#30D6D6]">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature modules */}
        <div className="mb-8 space-y-4">
          <h2 className="mb-6 text-xs font-bold tracking-[0.3em] text-[#30D6D6]/70">
            AVAILABLE_MODULES
          </h2>

          <div className="group relative border border-[#006694]/30 bg-black/30 p-5 transition-all">
            <div className="absolute right-4 top-4 h-2 w-2 bg-[#006694] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <h3 className="mb-2 font-bold tracking-wide text-[#30D6D6]">
              {">"} INSTANT_ANALYSIS
            </h3>
            <p className="text-sm text-cyan-100/60">
              Submit feedback about your alien-enhanced cat and receive instant
              AI analysis. Help us refine our genetic splicing technology.
            </p>
          </div>

          <div className="group relative border border-[#006694]/30 bg-black/30 p-5 transition-all">
            <div className="absolute right-4 top-4 h-2 w-2 bg-[#006694] shadow-[0_0_10px_rgba(0,102,148,0.8)]" />
            <h3 className="mb-2 font-bold tracking-wide text-[#30D6D6]">
              {">"} COMPREHENSIVE_REPORTS
            </h3>
            <p className="text-sm text-cyan-100/60">
              Track reported behaviors, abilities, and anomalies across all
              feline specimens. Monitor the evolution of our genetic program.
            </p>
          </div>

          <div className="group relative border border-[#006694]/30 bg-black/30 p-5 transition-all">
            <div className="absolute right-4 top-4 h-2 w-2 bg-[#006694] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <h3 className="mb-2 font-bold tracking-wide text-[#30D6D6]">
              {">"} SMART_CATEGORIZATION
            </h3>
            <p className="text-sm text-cyan-100/60">
              Advanced categorization for specimen feedback, mutation tracking,
              and genetic performance metrics. Research division protocol.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="relative border-2 border-[#30D6D6] bg-[#30D6D6]/5 p-8 text-center">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[#30D6D6] to-transparent" />
          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[#30D6D6] to-transparent" />

          <p className="mb-4 text-xs tracking-[0.3em] text-[#30D6D6]/70">
            INITIALIZE_SEQUENCE
          </p>
          <Link href="/submit">
            <button className="relative overflow-hidden border-2 border-[#30D6D6] bg-black px-12 py-4 font-bold tracking-widest text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black hover:shadow-[0_0_20px_rgba(48,214,214,0.5)]">
              <span className="relative z-10">BEGIN_ANALYSIS</span>
              <div className="absolute inset-0 -translate-x-full bg-[#30D6D6] transition-transform duration-300 group-hover:translate-x-0" />
            </button>
          </Link>
        </div>

        {/* Footer code */}
        <div className="mt-8 border-t border-[#30D6D6]/20 pt-4 text-center text-xs text-[#30D6D6]/40 tracking-wider">
          AXIOM_v2.847 | NEURAL_NET_ACTIVE | FEEDBACK_LOOP_ONLINE
        </div>
      </div>
    </div>
  );
}
