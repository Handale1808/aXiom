import type { FeedbackWithId } from "@/lib/types/api";
import type { ScaledValues } from "@/lib/hooks/useResponsiveScaling";

interface FeedbackListHeaderProps {
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  isAllSelected: boolean;
  onSelectAll: () => void;
  scaledValues: ScaledValues;
}

export default function FeedbackListHeader({
  sortColumn,
  sortDirection,
  onSort,
  isAllSelected,
  onSelectAll,
  scaledValues,
}: FeedbackListHeaderProps) {
  const SortArrow = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return (
      <span
        className="inline-block text-[#30D6D6]"
        style={{ marginLeft: `${scaledValues.spacing.gapSmall / 4}px` }}
      >
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div
      className="grid border-b-2 border-[#30D6D6]/50 bg-[#006694]/20 font-bold tracking-wider text-[#30D6D6]"
      style={{
        gridTemplateColumns: `${scaledValues.layout.gridCols.checkbox}px ${scaledValues.layout.gridCols.catIndicator}px 1fr ${scaledValues.layout.gridCols.sentiment}px ${scaledValues.layout.gridCols.priority}px ${scaledValues.layout.gridCols.view}px ${scaledValues.layout.gridCols.delete}px`,
        gap: `${scaledValues.spacing.gapSmall}px`,
        paddingLeft: `${scaledValues.spacing.gapSmall}px`,
        paddingRight: `${scaledValues.spacing.gapSmall}px`,
        paddingTop: `${scaledValues.input.paddingY}px`,
        paddingBottom: `${scaledValues.input.paddingY}px`,
        fontSize: `${scaledValues.text.tiny}px`,
      }}
    >
      {" "}
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="cursor-pointer appearance-none border border-[#30D6D6]/50 bg-black checked:bg-black checked:border-[#30D6D6] checked:before:content-['✓'] checked:before:text-[#30D6D6] checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
          style={{
            height: `${scaledValues.interactive.checkboxLarge}px`,
            width: `${scaledValues.interactive.checkboxLarge}px`,
          }}
          aria-label="Select all feedbacks"
        />
      </div>
      <div className="flex items-center justify-center md:hidden">
        <span style={{ fontSize: `${scaledValues.text.tiny}px` }}>CAT</span>
      </div>
      <div className="hidden md:block"></div>
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
      {scaledValues.layout.gridCols.view > 0 && (
        <div className="hidden md:block">VIEW</div>
      )}
      {scaledValues.layout.gridCols.delete > 0 && (
        <div className="hidden md:block">DELETE</div>
      )}
    </div>
  );
}
