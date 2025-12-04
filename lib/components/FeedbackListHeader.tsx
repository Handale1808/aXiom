import type { FeedbackWithId } from "@/lib/types/api";

interface FeedbackListHeaderProps {
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  isAllSelected: boolean;
  onSelectAll: () => void;
}

export default function FeedbackListHeader({
  sortColumn,
  sortDirection,
  onSort,
  isAllSelected,
  onSelectAll,
}: FeedbackListHeaderProps) {
  const SortArrow = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1 inline-block text-[#30D6D6]">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-[40px_1fr_120px_120px_60px_60px] gap-4 border-b-2 border-[#30D6D6]/50 bg-[#006694]/20 px-4 py-2 text-xs font-bold tracking-wider text-[#30D6D6]">
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="h-4 w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          aria-label="Select all feedbacks"
        />
      </div>
      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("text")}
      >
        FEEDBACK_TEXT
        <SortArrow column="text" />
      </div>
      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("sentiment")}
      >
        SENTIMENT
        <SortArrow column="sentiment" />
      </div>
      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("priority")}
      >
        PRIORITY
        <SortArrow column="priority" />
      </div>
      <div>VIEW</div>
      <div>DELETE</div>
    </div>
  );
}