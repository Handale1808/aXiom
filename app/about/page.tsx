import Header from "@/lib/components/Header";

export default function About() {
  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="relative mx-auto max-w-4xl p-8">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6 flex items-center justify-between" >
          <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            ABOUT
          </h1>
          <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
            [CLASSIFIED_GENETICS_DIVISION]
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [OUR_MISSION]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              At aXiom, we are committed to pushing the boundaries of biological
              science by successfully splicing extraterrestrial DNA with Earth's
              most beloved household companions. Our primary objective is simple
              yet revolutionary: to engineer the fluffiest, cutest little
              monsters the galaxy has ever seen.
            </p>
            <p className="text-cyan-100/70 leading-relaxed">
              Through rigorous experimentation and questionable ethics
              oversight, we have achieved what many said was
              impossible—combining the adorable nature of domestic felines with
              the otherworldly capabilities of alien lifeforms.
            </p>
          </div>

          <div className="relative border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [EXPERIMENTAL_PROTOCOLS]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              We must emphasize that our genetic enhancement technology remains
              highly experimental. Side effects in feline specimens are not only
              possible but statistically probable. Documented anomalies include
              but are not limited to:
            </p>
            <div className="ml-4 space-y-2 text-sm text-cyan-100/60">
              <p>- Spontaneous levitation at inconvenient times</p>
              <p>- Telepathic demands for treats at 3 AM</p>
              <p>- Brief dimensional phasing through solid walls</p>
              <p>- Excessive fluffiness requiring industrial-grade vacuums</p>
              <p>- Glowing eyes during periods of hunger or judgment</p>
              <p>
                - Purring at frequencies that may disrupt electronic devices
              </p>
            </div>
          </div>

          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <div className="absolute right-4 top-4 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />

            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [FEEDBACK_IMPERATIVE]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              Customer feedback is absolutely critical to our ongoing research.
              Every anomaly, every unusual behavior, every inexplicable
              phenomenon exhibited by your genetically-enhanced companion
              provides invaluable data for our scientists.
            </p>
            <p className="text-cyan-100/70 leading-relaxed">
              We strongly encourage all aXiom cat owners to submit detailed
              reports via our feedback system. Your observations help us refine
              our alien DNA integration protocols and, hopefully, reduce the
              frequency of reality-bending incidents.
            </p>
          </div>

          <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
            <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
              [RESEARCH_METRICS]
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    MUTATION_SUCCESS_RATE
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    87.3%
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "87.3%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Successful alien DNA integration
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    FLUFFINESS_QUOTIENT
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">142%</span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Exceeds standard Earth cat limits
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    DIMENSIONAL_STABILITY
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    23.7%
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#006694] shadow-[0_0_10px_rgba(0,102,148,0.5)]"
                    style={{ width: "23.7%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Remains in primary dimension
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    CUTENESS_OVERLOAD_EVENTS
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    9,247
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "95%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Reported incidents this quarter
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
              [KNOWN_SIDE_EFFECTS]
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#006694]/30 pb-3">
                <div className="flex-1">
                  <p className="text-sm text-cyan-100/70">
                    Spontaneous Teleportation
                  </p>
                  <p className="text-xs text-cyan-100/40">
                    Usually to neighboring houses during dinner time
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#30D6D6]">1,847</p>
                  <p className="text-xs text-cyan-100/50">cases</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#006694]/30 pb-3">
                <div className="flex-1">
                  <p className="text-sm text-cyan-100/70">
                    Unauthorized Mind Reading
                  </p>
                  <p className="text-xs text-cyan-100/40">
                    Knows exactly when you plan to leave the house
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#30D6D6]">3,429</p>
                  <p className="text-xs text-cyan-100/50">cases</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#006694]/30 pb-3">
                <div className="flex-1">
                  <p className="text-sm text-cyan-100/70">
                    Gravity Manipulation
                  </p>
                  <p className="text-xs text-cyan-100/40">
                    Walking on ceiling, defying basic physics
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#30D6D6]">892</p>
                  <p className="text-xs text-cyan-100/50">cases</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#006694]/30 pb-3">
                <div className="flex-1">
                  <p className="text-sm text-cyan-100/70">Time Loop Creation</p>
                  <p className="text-xs text-cyan-100/40">
                    Repeating same 5 minutes until fed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#30D6D6]">247</p>
                  <p className="text-xs text-cyan-100/50">cases</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-cyan-100/70">
                    Bioluminescent Purring
                  </p>
                  <p className="text-xs text-cyan-100/40">
                    Glowing bright enough to read by
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#30D6D6]">5,631</p>
                  <p className="text-xs text-cyan-100/50">cases</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/10 p-5 text-center">
              <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <p className="mb-2 text-3xl font-bold text-[#30D6D6]">150</p>
              <p className="text-xs tracking-wider text-cyan-100/60">
                CONFIRMED_CASUALTIES
              </p>
              <p className="mt-2 text-xs text-cyan-100/40">
                Mostly property damage and small children
              </p>
            </div>

            <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/10 p-5 text-center">
              <div className="absolute right-3 top-3 h-2 w-2 bg-[#006694] shadow-[0_0_10px_rgba(0,102,148,0.8)]" />
              <p className="mb-2 text-3xl font-bold text-[#30D6D6]">47</p>
              <p className="text-xs tracking-wider text-cyan-100/60">
                ALIEN_DNA_SOURCES
              </p>
              <p className="mt-2 text-xs text-cyan-100/40">
                From 12 different galaxies
              </p>
            </div>

            <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/10 p-5 text-center">
              <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <p className="mb-2 text-3xl font-bold text-[#30D6D6]">99.4%</p>
              <p className="text-xs tracking-wider text-cyan-100/60">
                OWNER_SATISFACTION
              </p>
              <p className="mt-2 text-xs text-cyan-100/40">Despite anomalies</p>
            </div>
          </div>

          <div className="relative border-2 border-[#006694]/30 bg-black/30 p-6">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [LEGAL_DISCLAIMER]
            </h2>
            <p className="text-xs text-cyan-100/50 leading-relaxed">
              aXiom Feline Genetics Laboratory accepts no liability for property
              damage, existential crises, or minor breaches in spacetime caused
              by our products. All specimens are sold as-is. Side effects are
              features, not bugs. Please do not attempt to return your cat to
              its original dimension without proper authorization.
            </p>
          </div>

          <div className="border-t border-[#30D6D6]/20 pt-6 text-center">
            <p className="text-xs text-[#30D6D6]/60 tracking-wider">
              REMEMBER: WITH GREAT FLUFFINESS COMES GREAT RESPONSIBILITY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
