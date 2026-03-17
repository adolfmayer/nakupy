import type { CatalogItem, ShoppingListEntry } from "../../../domain/types";
import { removeEntry } from "../../../state/shoppingList.store";

export interface ListRowProps {
  entry: ShoppingListEntry;
  catalogItem?: CatalogItem;
}

export function ListRow({ entry, catalogItem }: ListRowProps): JSX.Element {
  const entryId = entry.id;
  const title = catalogItem?.title ?? "Unknown item";

  const baseImagePath =
    catalogItem != null ? `/images/catalog/${catalogItem.id}` : undefined;
  const pngImageSrc = baseImagePath != null ? `${baseImagePath}.png` : undefined;
  const jpgImageSrc = baseImagePath != null ? `${baseImagePath}.jpg` : undefined;

  return (
    <button
      type="button"
      className={[
        "group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition",
        "ring-red-400/25 bg-zinc-950/60",
        "select-none"
      ].join(" ")}
      onClick={() => removeEntry(entryId)}
    >
      {pngImageSrc != null ? (
        <>
          <img
            src={pngImageSrc}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-85 transition group-hover:opacity-100"
            onError={(e) => {
              const img = e.currentTarget;

              if (pngImageSrc != null && img.src.includes(pngImageSrc)) {
                img.src = jpgImageSrc ?? catalogItem?.imageUrl ?? "";
                return;
              }

              if (jpgImageSrc != null && img.src.includes(jpgImageSrc) && catalogItem?.imageUrl) {
                img.src = catalogItem.imageUrl;
                return;
              }

              img.style.display = "none";
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/25 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-zinc-900/80" />
      )}

      <div className="absolute inset-x-0 top-0 p-2">
        <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-50 drop-shadow">
          {title}
        </div>
      </div>
    </button>
  );
}

