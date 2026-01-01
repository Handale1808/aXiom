export default function LoginAbout() {
  return (
    <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

      <h2 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
        [ABOUT_AXIOM]
      </h2>

      <div className="space-y-4 text-cyan-100/70 leading-relaxed">
        <p>
          Welcome to aXiom Feline Genetics Laboratory, where cutting-edge
          xenobiology meets adorable companionship. We specialize in the
          revolutionary science of splicing extraterrestrial DNA with
          domestic felines to create the most extraordinary pets in the
          galaxy.
        </p>

        <p>
          Through our secure platform, you can browse and purchase your
          very own genetically-enhanced specimen. Each cat comes with
          unique alien traits, enhanced abilities, and questionable
          physics-defying properties that will transform your home into
          an intergalactic adventure.
        </p>

        <div className="relative border-2 border-[#30D6D6]/30 bg-[#30D6D6]/5 p-4 mt-6">
          <h3 className="mb-3 text-xs font-bold tracking-widest text-[#30D6D6]">
            [PLATFORM_FEATURES]
          </h3>
          <ul className="space-y-2 text-sm text-cyan-100/60">
            <li className="flex items-start gap-2">
              <span className="text-[#30D6D6] mt-1">▸</span>
              <span>Browse enhanced feline specimens by genetic tier</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30D6D6] mt-1">▸</span>
              <span>Submit feedback on your specimen's anomalies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30D6D6] mt-1">▸</span>
              <span>Track genetic stability and mutation progress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30D6D6] mt-1">▸</span>
              <span>Access emergency containment protocols</span>
            </li>
          </ul>
        </div>

        <div className="relative border border-[#006694]/50 bg-black/50 p-4 mt-4">
          <div className="absolute right-3 top-3 h-2 w-2 bg-[#30D6D6] animate-pulse shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
          <p className="text-xs text-cyan-100/50 leading-relaxed">
            Create an account to begin your journey into xenomorphic pet
            ownership. All purchases include lifetime support and
            dimensional stabilization warranty.
          </p>
        </div>
      </div>
    </div>
  );
}