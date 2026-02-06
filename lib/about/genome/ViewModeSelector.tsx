// lib/components/about/genome/ViewModeSelector.tsx

export type ViewMode = 'overview' | 'detailed' | 'regions';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const VIEW_MODES: { mode: ViewMode; label: string; description: string }[] = [
  {
    mode: 'overview',
    label: 'OVERVIEW_SCAN',
    description: 'Complete genome at a glance',
  },
  {
    mode: 'detailed',
    label: 'DETAIL_ZOOM',
    description: 'First 100 bases magnified',
  },
  {
    mode: 'regions',
    label: 'REGION_MAP',
    description: 'Functional regions breakdown',
  },
];

export default function ViewModeSelector({
  currentMode,
  onModeChange,
}: ViewModeSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {VIEW_MODES.map(({ mode, label, description }) => {
          const isActive = currentMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`
                flex-1 border-2 px-4 py-3 transition-all
                ${
                  isActive
                    ? 'border-[#30D6D6] bg-[#30D6D6]/20 text-[#30D6D6]'
                    : 'border-[#30D6D6]/30 bg-black/30 text-[#30D6D6]/50 hover:border-[#30D6D6]/60 hover:text-[#30D6D6]/80'
                }
              `}
              style={{
                boxShadow: isActive ? '0 0 10px rgba(48, 214, 214, 0.5)' : 'none',
              }}
              aria-pressed={isActive}
            >
              <div className="text-xs font-bold tracking-widest">
                {label}
              </div>
              <div className="mt-1 text-xs text-cyan-100/50">
                {description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}