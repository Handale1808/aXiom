// lib/components/CatCard.tsx

interface CatCardProps {
  id: string;
  name: string;
  svgImage: string;
  onClick?: () => void;
}

export default function CatCard({ id, name, svgImage, onClick }: CatCardProps) {
  return (
    <div
      className="border border-[#006694]/50 bg-[#30D6D6]/5 p-6 text-center cursor-pointer transition-all hover:border-[#30D6D6] hover:bg-[#30D6D6]/10 hover:shadow-[0_0_15px_rgba(48,214,214,0.3)]"
      onClick={onClick}
    >
      <div
        className="mb-3 h-48 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgImage }}
      />
      <div className="text-xs tracking-wider text-[#30D6D6]">{name}</div>
    </div>
  );
}
