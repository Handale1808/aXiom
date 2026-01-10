// lib/components/CatCard.tsx

interface CatCardProps {
  id: string;
  name: string;
  svgImage: string;
  onClick?: () => void;
  showAddToCart?: boolean;
  onAddToCart?: (catId: string) => void;
}

export default function CatCard({
  id,
  name,
  svgImage,
  onClick,
  showAddToCart,
  onAddToCart,
}: CatCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };
  return (
    <div className="border border-[#006694]/50 bg-[#30D6D6]/5 text-center transition-all hover:border-[#30D6D6] hover:bg-[#30D6D6]/10 hover:shadow-[0_0_15px_rgba(48,214,214,0.3)]">
      <div className="p-6 cursor-pointer" onClick={onClick}>
        <div
          className="mb-3 h-48 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgImage }}
        />
        <div className="text-xs tracking-wider text-[#30D6D6]">{name}</div>
      </div>
      {showAddToCart && (
        <div className="border-t border-[#006694]/50 p-4">
          <button
            onClick={handleAddToCart}
            className="w-full border-2 border-[#30D6D6] bg-black py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6] hover:text-black"
          >
            ADD_TO_CART
          </button>
        </div>
      )}
    </div>
  );
}
