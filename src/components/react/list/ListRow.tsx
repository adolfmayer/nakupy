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

  return (
    <div className="flex items-center gap-3 rounded-xl bg-zinc-950/40 px-3 py-2 ring-1 ring-zinc-800">
      <input
        type="checkbox"
        checked={entry.checked}
        onChange={() => toggleEntryChecked(entryId)}
        className="h-4 w-4 accent-red-400"
        aria-label={`Mark ${title} as bought`}
      />

      <div className="min-w-0 flex-1">
        <div
          className={[
            "truncate text-sm font-semibold",
            entry.checked ? "text-zinc-400 line-through" : "text-zinc-50"
          ].join(" ")}
        >
          {title}
        </div>
      </div>

      <input
        type="number"
        min={1}
        value={entry.quantity}
        onChange={(e) => setEntryQuantity(entryId, Number(e.currentTarget.value))}
        className="h-9 w-16 rounded-lg bg-zinc-950 px-2 text-sm ring-1 ring-zinc-800 outline-none"
        aria-label={`Quantity for ${title}`}
      />

      <button
        type="button"
        onClick={() => removeEntry(entryId)}
        className="h-9 rounded-lg bg-red-500/15 px-3 text-sm font-semibold text-red-100 ring-1 ring-red-400/25 hover:bg-red-500/20"
      >
        Remove
      </button>
    </div>
  );
}

