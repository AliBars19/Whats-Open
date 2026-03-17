"use client";

import { FILTER_CHIPS } from "@/lib/constants";
import type { PlaceCategory } from "@/lib/constants";

type FilterBarProps = {
  selectedCategory: PlaceCategory | null;
  onCategoryChange: (category: PlaceCategory | null) => void;
  openNowOnly: boolean;
  onOpenNowChange: (value: boolean) => void;
};

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  openNowOnly,
  onOpenNowChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar
      backdrop-blur-md bg-white/5 border-b border-border-subtle">
      {FILTER_CHIPS.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onCategoryChange(chip.value as PlaceCategory | null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
            ${
              selectedCategory === chip.value
                ? "bg-accent-primary text-bg-primary"
                : "bg-bg-card text-text-secondary hover:bg-bg-elevated"
            }`}
        >
          {chip.label}
        </button>
      ))}

      <div className="w-px h-6 bg-border-subtle flex-shrink-0" />

      <button
        onClick={() => onOpenNowChange(!openNowOnly)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5
          ${
            openNowOnly
              ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
              : "bg-bg-card text-text-secondary hover:bg-bg-elevated"
          }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${openNowOnly ? "bg-accent-green" : "bg-text-muted"}`} />
        Open Now
      </button>
    </div>
  );
}
