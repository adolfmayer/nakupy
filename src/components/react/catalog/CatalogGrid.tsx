import type { JSX } from "react";
import type { CatalogItem } from "../../../domain/types";
import type { CatalogItemId } from "../../../domain/id";
import { CatalogCard } from "./CatalogCard";

export interface CatalogGridProps {
  items: readonly CatalogItem[];
  selectedIds: ReadonlySet<CatalogItemId>;
  onItemClick: (itemId: CatalogItemId) => void;
}

export function CatalogGrid({
  items,
  selectedIds,
  onItemClick
}: CatalogGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <CatalogCard
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  );
}

