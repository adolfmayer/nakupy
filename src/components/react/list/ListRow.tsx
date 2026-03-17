import type { CatalogItem, ShoppingListEntry } from "../../../domain/types";
import {
  removeEntry,
  setEntryQuantity,
  toggleEntryChecked
} from "../../../state/shoppingList.store";

export interface ListRowProps {
  entry: ShoppingListEntry;
  catalogItem?: CatalogItem;
}

export function ListRow({ entry, catalogItem }: ListRowProps): JSX.Element {
  const entryId = entry.id;
  const title = catalogItem?.title ?? "Unknown item";
  const imageUrl = catalogItem?.imageUrl;

  return (
    <div className="group relative aspect-4/5 overflow-hidden rounded-2xl bg-zinc-950/60 text-left ring-1 ring-red-400/25">
      {imageUrl != null ? (
        <>
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-85 transition group-hover:opacity-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
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

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2">
        <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-50">
          <input
            type="checkbox"
            checked={entry.checked}
            onChange={() => toggleEntryChecked(entryId)}
            className="h-3.5 w-3.5 accent-red-400"
            aria-label={`Mark ${title} as bought`}
          />
          <span className="opacity-90">Got it</span>
        </label>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            value={entry.quantity}
            onChange={(e) =>
              setEntryQuantity(entryId, Number(e.currentTarget.value))
            }
            className="h-7 w-12 rounded-lg bg-zinc-950/90 px-1.5 text-[11px] ring-1 ring-zinc-800 outline-none"
            aria-label={`Quantity for ${title}`}
          />
          <button
            type="button"
            onClick={() => removeEntry(entryId)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-[11px] font-bold text-zinc-50 shadow-sm ring-1 ring-red-300/80 hover:bg-red-400"
            aria-label={`Remove ${title} from list`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

