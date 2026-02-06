// lib/components/about/stats/OpposingForcesPhilosophy.tsx

'use client';

export default function OpposingForcesPhilosophy() {
  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <h3 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
        [THE_OPPOSING_FORCES_FRAMEWORK]
      </h3>

      <p className="text-cyan-100/70 leading-relaxed mb-6">
        Every trait emerges from the eternal struggle between ORDER and CHAOS. 
        Genetic sequences that reinforce a trait create SPECIALIZATION. 
        Genetic noise that disrupts expression creates CHAOS. The balance 
        determines phenotype.
      </p>

      {/* Visual representation */}
      <div className="flex items-center justify-between my-8 px-4">
        {/* Left: Specialization */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold tracking-wider text-[#30D6D6] mb-2">
            SPECIALIZATION
          </div>
          <div className="text-2xl font-bold text-[#30D6D6]">+</div>
        </div>

        {/* Center: Abstract genetic visualization */}
        <div className="flex-1 mx-8">
          <svg viewBox="0 0 400 120" className="w-full h-24">
            {/* Left side: Specialization (converging lines) */}
            <g id="specialization">
              <path 
                d="M20,60 Q40,40 60,60 T100,60" 
                stroke="#30D6D6" 
                strokeWidth="2" 
                fill="none"
                className="animate-pulse"
              />
              <path 
                d="M20,60 Q40,80 60,60 T100,60" 
                stroke="#30D6D6" 
                strokeWidth="2" 
                fill="none"
                className="animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <line 
                x1="100" y1="30" x2="180" y2="60" 
                stroke="#30D6D6" 
                strokeWidth="1" 
                opacity="0.5" 
              />
              <line 
                x1="100" y1="90" x2="180" y2="60" 
                stroke="#30D6D6" 
                strokeWidth="1" 
                opacity="0.5" 
              />
            </g>

            {/* Center: Balance point */}
            <circle 
              cx="200" cy="60" r="6" 
              fill="#30D6D6" 
              className="animate-pulse" 
            />
            <circle 
              cx="200" cy="60" r="12" 
              fill="none" 
              stroke="#30D6D6" 
              strokeWidth="1" 
              opacity="0.3" 
            />
            <circle 
              cx="200" cy="60" r="18" 
              fill="none" 
              stroke="#30D6D6" 
              strokeWidth="1" 
              opacity="0.2" 
            />

            {/* Right side: Chaos (diverging lines) */}
            <g id="chaos">
              <line 
                x1="220" y1="60" x2="300" y2="30" 
                stroke="#FF6E40" 
                strokeWidth="1" 
                opacity="0.5" 
              />
              <line 
                x1="220" y1="60" x2="300" y2="90" 
                stroke="#FF6E40" 
                strokeWidth="1" 
                opacity="0.5" 
              />
              <path 
                d="M300,30 Q320,10 340,30" 
                stroke="#FF6E40" 
                strokeWidth="2" 
                fill="none"
                opacity="0.7" 
              />
              <path 
                d="M300,90 Q320,110 340,90" 
                stroke="#FF6E40" 
                strokeWidth="2" 
                fill="none"
                opacity="0.7" 
              />
              <circle cx="350" cy="50" r="2" fill="#FF6E40" opacity="0.6" />
              <circle cx="370" cy="70" r="2" fill="#FF6E40" opacity="0.6" />
              <circle cx="360" cy="60" r="2" fill="#FF6E40" opacity="0.6" />
            </g>

            {/* Arrows showing opposing forces */}
            <path 
              d="M180,55 L185,60 L180,65" 
              stroke="#30D6D6" 
              strokeWidth="2" 
              fill="none" 
            />
            <path 
              d="M220,55 L215,60 L220,65" 
              stroke="#FF6E40" 
              strokeWidth="2" 
              fill="none" 
            />
          </svg>
        </div>

        {/* Right: Chaos */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold tracking-wider text-[#FF6E40] mb-2">
            CHAOS
          </div>
          <div className="text-2xl font-bold text-[#FF6E40]">−</div>
        </div>
      </div>

      {/* Explanation Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Specialization Panel */}
        <div className="border border-[#30D6D6]/30 bg-[#30D6D6]/5 p-4">
          <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-3">
            SPECIALIZATION_SCORE [0-100]
          </h4>
          <p className="text-sm text-cyan-100/70 leading-relaxed mb-3">
            Genetic patterns that reinforce the trait. Each trait seeks specific 
            signatures in the code.
          </p>
          <ul className="space-y-2 text-xs text-cyan-100/60">
            <li className="flex items-start">
              <span className="text-[#30D6D6] mr-2">•</span>
              <span>Pattern-specific bonuses (motifs, runs, palindromes)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#30D6D6] mr-2">•</span>
              <span>Structural analysis (entropy, balance, consistency)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#30D6D6] mr-2">•</span>
              <span>Trait-optimized detection algorithms</span>
            </li>
          </ul>
        </div>

        {/* Chaos Panel */}
        <div className="border border-[#FF6E40]/30 bg-[#FF6E40]/5 p-4">
          <h4 className="text-xs font-bold tracking-widest text-[#FF6E40] mb-3">
            CHAOS_PENALTY [0-100]
          </h4>
          <p className="text-sm text-cyan-100/70 leading-relaxed mb-3">
            Genetic noise that disrupts expression. Disorder weakens trait 
            manifestation.
          </p>
          <ul className="space-y-2 text-xs text-cyan-100/60">
            <li className="flex items-start">
              <span className="text-[#FF6E40] mr-2">•</span>
              <span>Entropy and disorder (randomness, complexity)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#FF6E40] mr-2">•</span>
              <span>Fragmentation (pattern interruption, instability)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#FF6E40] mr-2">•</span>
              <span>Rare symbols (genetic anomalies, noise)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Formula Display */}
      <div className="border border-[#30D6D6]/50 bg-[#30D6D6]/5 p-4 mb-4">
        <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-2">
          CALCULATION_FORMULA
        </div>
        <div className="font-mono text-sm text-cyan-100/80 space-y-1">
          <div>RAW_SCORE = SPECIALIZATION − CHAOS</div>
          <div className="text-cyan-100/50">
            // Range: -100 to +100
          </div>
          <div className="mt-2">FINAL_STAT = map(RAW_SCORE, [-100, +100], [1, 10])</div>
          <div className="text-cyan-100/50">
            // Stats/Behaviors: 1-10 scale
          </div>
          <div className="mt-2">FINAL_RESISTANCE = map(RAW_SCORE, [-100, +100], [0, 100])</div>
          <div className="text-cyan-100/50">
            // Resistances: 0-100 percentage
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="border-t border-[#30D6D6]/20 pt-4">
        <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-2">
          KEY_INSIGHT
        </div>
        <p className="text-sm text-cyan-100/70 leading-relaxed">
          Each trait requires different genetic patterns. What strengthens one 
          may weaken another. <span className="text-[#30D6D6]">Strength favors homogeneity</span> while{' '}
          <span className="text-[#30D6D6]">Intelligence favors entropy</span>. 
          <span className="text-[#30D6D6]"> Agility needs rhythm</span> while{' '}
          <span className="text-[#30D6D6]">Endurance needs balance</span>. This creates 
          natural trade-offs, ensuring diverse phenotypes emerge from the same random 
          genome generation process.
        </p>
      </div>
    </div>
  );
}