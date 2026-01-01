interface CatCardProps {
  id: string;
  emoji: string;
  name: string;
}

export default function CatCard({ id, emoji, name }: CatCardProps) {
  return (
    <div className="border border-[#006694]/50 bg-[#30D6D6]/5 p-6 text-center">
      <div className="mb-3 text-5xl">{emoji}</div>
      <div className="text-xs tracking-wider text-[#30D6D6]">{name}</div>
    </div>
  );
}