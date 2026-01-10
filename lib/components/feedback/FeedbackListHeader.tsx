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
    <div className="grid grid-cols-[44px_30px_1fr_50px_50px] md:grid-cols-[40px_30px_1fr_120px_120px_60px_60px] gap-2 md:gap-4 border-b-2 border-[#30D6D6]/50 bg-[#006694]/20 px-2 sm:px-3 md:px-4 py-2 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider text-[#30D6D6]">
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="h-5 w-5 md:h-4 md:w-4 cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          aria-label="Select all feedbacks"
        />
      </div>

      <div className="flex items-center justify-center md:hidden">
        <span className="text-[8px] sm:text-[9px]">CAT</span>
      </div>

      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("text")}
      >
        <span className="hidden md:inline">FEEDBACK_TEXT</span>
        <span className="md:hidden">TEXT</span>
        <SortArrow column="text" />
      </div>
      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("sentiment")}
      >
        <span className="hidden md:inline">SENTIMENT</span>
        <span className="md:hidden">SENT</span>
        <SortArrow column="sentiment" />
      </div>
      <div
        className="cursor-pointer hover:text-white transition-colors"
        onClick={() => onSort("priority")}
      >
        <span className="hidden md:inline">PRIORITY</span>
        <span className="md:hidden">PRI</span>
        <SortArrow column="priority" />
      </div>
      <div className="hidden md:block">
        <span className="hidden md:inline">VIEW</span>
        <span className="md:hidden">V</span>
      </div>
      <div className="hidden md:block">
        <span className="hidden sm:inline">DELETE</span>
        <span className="sm:hidden">DEL</span>
      </div>
    </div>
  );
}
