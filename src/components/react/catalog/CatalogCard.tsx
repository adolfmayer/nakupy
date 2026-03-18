import type { JSX } from "react";
import type { CatalogItem } from "../../../domain/types";
import { getCatalogImageById } from "../../../assets/catalog/catalogImages";

export interface CatalogCardProps {
  item: CatalogItem;
  isSelected: boolean;
  onClick: () => void;
}

export function CatalogCard({
  item,
  isSelected,
  onClick
}: CatalogCardProps): JSX.Element {
  const imageMeta = getCatalogImageById(item.id);
  const alt = `Photo of ${item.title}`;

  return (
    <button
      className={[
        "group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition",
        isSelected
          ? "ring-emerald-300 bg-emerald-500/25"
          : "ring-orange-400/25 bg-orange-500/15 hover:bg-orange-500/20",
        "select-none"
      ].join(" ")}
      type="button"
      onClick={onClick}
    >
      <div className="absolute inset-0">
        {imageMeta != null ? (
          <>
            <img
              src={imageMeta.src}
              width={imageMeta.width}
              height={imageMeta.height}
              alt={alt}
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/70 via-zinc-950/15 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-900/80" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-sm font-semibold leading-tight">{item.title}</div>
      </div>
    </button>
  );
}
