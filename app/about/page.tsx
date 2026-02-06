import GenomeGenerationSection from "@/lib/about/GenomeGenerationSection";

export default function About() {
  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="relative mx-auto max-w-4xl p-8">
        <div className="mb-8 border-b-2 border-[#30D6D6] pb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-wider text-[#30D6D6] drop-shadow-[0_0_10px_rgba(48,214,214,0.5)]">
            ABOUT
          </h1>
          <p className="mt-2 text-sm tracking-widest text-[#006694] font-bold">
            [CLASSIFIED_GENETICS_DIVISION]
          </p>
        </div>

        <div className="space-y-6">
          {/* Mission/Intro Section - Multiple Panels */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

              <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
                [PRIMARY_OBJECTIVE]
              </h2>
              <p className="text-cyan-100/70 leading-relaxed">
                At aXiom, we pioneer the intersection of extraterrestrial
                biology and terrestrial genetics. Our mission: engineer the most
                adorable yet cosmically powerful feline companions the universe
                has ever witnessed.
              </p>
            </div>

            <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
              <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
                [SCIENTIFIC_RATIONALE]
              </h2>
              <p className="text-cyan-100/70 leading-relaxed">
                Why settle for ordinary house cats when you can have a companion
                with bioluminescent fur, telepathic abilities, and the capacity
                to phase through solid matter? The answer is simple: you should
                not.
              </p>
            </div>
          </div>

          <div className="relative border-2 border-[#006694]/30 bg-black/30 p-6">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [ETHICS_OVERSIGHT_STATUS]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed">
              Our ethics committee has been dissolved for asking too many
              questions. All research proceeds under the principle that cuteness
              justifies the means. Legal counsel advises us to remind you that
              participation in this program is entirely voluntary and
              irreversible.
            </p>
          </div>

          {/* Visual Separator */}
          <div className="relative py-6">
            <div className="border-t border-[#30D6D6]/20"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
              </div>
            </div>
          </div>

          {/* DNA Splicing Section */}
          <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [STEP_01: DNA_SPLICING]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              The process begins with careful selection of alien DNA samples
              from our classified extraterrestrial biobank. We currently
              maintain genetic material from 47 different species across 12
              galaxies, each offering unique capabilities.
            </p>
            <p className="text-cyan-100/70 leading-relaxed">
              Using proprietary quantum-level gene editing tools, we splice
              selected alien sequences directly into feline embryonic DNA. The
              splicing process occurs at a molecular level that conventional
              science insisted was impossible until we did it anyway.
            </p>
          </div>

          <GenomeGenerationSection />

          {/* Genome Generation + Stats Assignment - Side by Side */}
          <div className="gap-6">
            <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/5 p-6">
              <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
              <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
                [STEP_03: STATS_ASSIGNMENT]
              </h2>
              <p className="text-cyan-100/70 leading-relaxed mb-4">
                Each unique genome generates a corresponding stat profile. We
                analyze genetic markers for traits like agility, intelligence,
                dimensional affinity, and cuteness coefficient.
              </p>
              <p className="text-cyan-100/70 leading-relaxed">
                Stats are calculated using a proprietary algorithm that weighs
                alien gene expression against feline baseline metrics. The
                system outputs numerical values across 12 core attributes.
              </p>
            </div>
          </div>

          {/* Genome Analysis Section */}
          <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [STEP_04: GENOME_ANALYSIS]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              Deep analysis of the hybrid genome reveals patterns that determine
              physical and metaphysical capabilities. Our neural networks
              identify correlations between specific gene clusters and
              supernatural manifestations.
            </p>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              We cross-reference alien genetic structures with our extensive
              database of observed phenomena. This allows us to predict which
              reality-bending abilities will manifest before the specimen
              reaches maturity.
            </p>
            <div className="mt-4 border border-[#006694]/30 bg-black/30 p-4">
              <p className="text-xs text-cyan-100/50 leading-relaxed">
                NOTE: Analysis accuracy currently sits at 87.3%, with remaining
                cases resulting in surprise capabilities such as spontaneous
                combustion reversal and temporary time dilation.
              </p>
            </div>
          </div>

          {/* Abilities Creation Section */}
          <div className="relative border border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
            <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [STEP_05: ABILITIES_CREATION]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              Based on stat distributions and genetic markers, our system
              assigns specific abilities to each specimen. High intelligence
              scores correlate with telepathy. Elevated dimensional affinity
              triggers phase-shifting capabilities.
            </p>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              The ability generation algorithm considers stat synergies. For
              example, a cat with high agility and dimensional affinity might
              develop short-range teleportation rather than simple enhanced
              speed.
            </p>
            <p className="text-cyan-100/70 leading-relaxed">
              Each specimen receives 3-7 distinct abilities, ranging from parlor
              tricks like color-shifting fur to genuinely concerning powers like
              limited precognition and gravitational manipulation.
            </p>
          </div>

          {/* Image Generation Section */}
          <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
            <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
            <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [STEP_06: MATHEMATICAL_IMAGE_GENERATION]
            </h2>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              Rather than rely on conventional imaging, we generate visual
              representations of each specimen using pure mathematical models
              derived from their genetic data.
            </p>
            <p className="text-cyan-100/70 leading-relaxed mb-4">
              The genome sequence is converted into a series of numerical values
              that feed into procedural generation algorithms. These algorithms
              use noise functions, cellular automata, and fractal mathematics to
              construct a visual phenotype.
            </p>
            <p className="text-cyan-100/70 leading-relaxed">
              Each pixel is calculated based on genetic expressions at specific
              loci. Coat patterns emerge from Perlin noise seeded by chromosome
              markers. Eye luminescence is determined by alien gene activation
              levels. The result is a mathematically accurate but utterly
              unpredictable visualization of your new companion.
            </p>
          </div>

          {/* Visual Separator */}
          <div className="relative py-6">
            <div className="border-t border-[#30D6D6]/20"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="relative border-2 border-[#30D6D6]/50 bg-black/50 p-6">
            <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
              [OPERATIONAL_METRICS]
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    GENOMES_GENERATED
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    12,847
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "94%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Total unique hybrid sequences
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    SUCCESSFUL_SPLICES
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
                  Viable alien-feline hybrids
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    UNIQUE_ABILITIES
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    2,394
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Distinct powers catalogued
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    AVG_FLUFFINESS
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">167%</span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Exceeds terrestrial maximum
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
                  Remain in primary reality
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    ACTIVE_SPECIMENS
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    8,492
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "89%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Currently in circulation
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    DNA_SOURCES
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">47</span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "78%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Alien species in biobank
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    REALITY_BREACHES
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">342</span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#006694] shadow-[0_0_10px_rgba(0,102,148,0.5)]"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Minor spacetime incidents
                </p>
              </div>

              <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-wider text-[#30D6D6]">
                    OWNER_SATISFACTION
                  </span>
                  <span className="text-xs font-bold text-[#30D6D6]">
                    99.4%
                  </span>
                </div>
                <div className="h-2 bg-black border border-[#006694]/30">
                  <div
                    className="h-full bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.5)]"
                    style={{ width: "99.4%" }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-cyan-100/50">
                  Despite documented anomalies
                </p>
              </div>
            </div>
          </div>

          {/* Visual Separator */}
          <div className="relative py-6">
            <div className="border-t border-[#30D6D6]/20"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
                <div className="h-1 w-1 bg-[#30D6D6]"></div>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="relative border-2 border-[#006694]/30 bg-black/30 p-6">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
              [LEGAL_DISCLAIMER]
            </h2>
            <p className="text-xs text-cyan-100/50 leading-relaxed">
              aXiom Feline Genetics Laboratory accepts no liability for property
              damage, existential crises, minor breaches in spacetime, or
              unexpected dimensional visitors caused by our specimens. All
              hybrid cats are sold as-is with no warranty expressed or implied.
              Side effects are features, not bugs. By adopting an aXiom cat, you
              acknowledge that reality may occasionally behave in non-standard
              ways within a 50-meter radius of your companion.
            </p>
          </div>

          {/* Footer */}
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
