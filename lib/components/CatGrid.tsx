import CatCard from "./CatCard";

interface Cat {
  id: string;
  name: string;
  svgImage: string;
}

interface CatGridProps {
  cats: Cat[];
  showContainer?: boolean;
  onCatClick?: (catId: string) => void;
}

export default function CatGrid({
  cats,
  showContainer = false,
  onCatClick,
}: CatGridProps) {
  const gridContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cats.length > 0 ? (
        cats.map((cat) => (
          <CatCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            svgImage={cat.svgImage}
            onClick={onCatClick ? () => onCatClick(cat.id) : undefined}
          />
        ))
      ) : (
        <div className="col-span-full text-center text-sm tracking-wider text-[#006694] py-8">
          [NO_SPECIMENS_AVAILABLE]
        </div>
      )}
    </div>
  );

  if (showContainer) {
    return (
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <h2 className="mb-6 text-sm font-bold tracking-widest text-[#30D6D6]">
          [CAT_INVENTORY]
        </h2>

        {gridContent}
      </div>
    );
  }

  return gridContent;
}

export type { Cat };
