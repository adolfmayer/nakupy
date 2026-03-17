import type { CatalogItem } from "../../../domain/types";
import { CatalogCard } from "./CatalogCard";

export interface CatalogGridProps {
  items: readonly CatalogItem[];
}

export function CatalogGrid({ items }: CatalogGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} />
      ))}
    </div>
  );
}

