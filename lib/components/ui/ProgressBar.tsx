interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  showValue?: boolean;
}

export default function ProgressBar({
  label,
  value,
  max,
  showValue = true,
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold tracking-widest text-[#30D6D6]">
          [{label}]
        </span>
        {showValue && (
          <span className="text-xs font-mono text-cyan-100">
            {value}/{max}
          </span>
        )}
      </div>

      <div className="h-2 bg-black border border-[#006694]/50 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#006694] to-[#30D6D6] transition-all duration-300 shadow-[0_0_10px_rgba(48,214,214,0.8)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}