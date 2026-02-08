interface LoadingContainerProps {
  message: string;
}

export default function LoadingContainer({ message }: LoadingContainerProps) {
  return (
    <div 
      className="flex items-center justify-center py-12"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 bg-[#30D6D6] animate-pulse animate-loadingScale animate-loadingGlow" />
        <div className="text-sm tracking-widest text-[#30D6D6]">
          {message}
        </div>
      </div>
    </div>
  );
}