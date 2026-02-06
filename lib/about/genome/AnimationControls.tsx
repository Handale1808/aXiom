// lib/components/about/genome/AnimationControls.tsx

interface AnimationControlsProps {
  isAnimating: boolean;
  animationProgress: number;
  totalBases: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function AnimationControls({
  isAnimating,
  animationProgress,
  totalBases,
  onPlay,
  onPause,
  onReset,
}: AnimationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border border-[#30D6D6]/30 bg-black/30 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs tracking-wider text-[#30D6D6]">
          SEQUENCING:
        </span>
        <span className="text-sm font-bold text-[#30D6D6] tabular-nums">
          {animationProgress.toString().padStart(4, '0')} / {totalBases.toString().padStart(4, '0')}
        </span>
        <span className="text-xs text-cyan-100/50">BASES</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPlay}
          disabled={isAnimating || animationProgress >= totalBases}
          className="flex h-10 w-10 items-center justify-center border-2 border-[#30D6D6] bg-black text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black"
          style={{
            boxShadow: isAnimating || animationProgress >= totalBases 
              ? 'none' 
              : '0 0 10px rgba(48, 214, 214, 0.3)',
          }}
          aria-label="Play animation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          onClick={onPause}
          disabled={!isAnimating}
          className="flex h-10 w-10 items-center justify-center border-2 border-[#30D6D6] bg-black text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black"
          style={{
            boxShadow: !isAnimating 
              ? 'none' 
              : '0 0 10px rgba(48, 214, 214, 0.3)',
          }}
          aria-label="Pause animation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>

        <button
          onClick={onReset}
          className="flex h-10 w-10 items-center justify-center border-2 border-[#30D6D6] bg-black text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10"
          style={{
            boxShadow: '0 0 10px rgba(48, 214, 214, 0.3)',
          }}
          aria-label="Reset animation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}