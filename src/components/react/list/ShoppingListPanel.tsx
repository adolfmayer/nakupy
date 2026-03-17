import { useDroppable } from "@dnd-kit/core";
import type { CatalogItem, ShoppingList } from "../../../domain/types";
import type { CatalogItemId } from "../../../domain/id";
import { ListRow } from "./ListRow";

export interface ShoppingListPanelProps {
  list: ShoppingList;
  catalogById: ReadonlyMap<CatalogItemId, CatalogItem>;
}

export function ShoppingListPanel({
  list,
  catalogById
}: ShoppingListPanelProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: "shoppingListDropzone" });

  return (
    <aside className="rounded-2xl bg-red-500/15 p-4 ring-1 ring-red-400/25">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold tracking-wide text-red-100">
          Shopping List
        </div>
        <div className="text-xs text-red-200/80">{list.entries.length} items</div>
      </div>

      <div
        ref={setNodeRef}
        className={[
          "mt-3 min-h-[420px] rounded-xl p-3 ring-1 transition",
          isOver ? "bg-red-500/15 ring-red-300/50" : "bg-red-500/10 ring-red-400/20"
        ].join(" ")}
      >
        {list.entries.length === 0 ? (
          <div className="grid h-[380px] place-items-center text-center">
            <div className="max-w-[28ch] text-sm text-red-100/80">
              Drag items here to build your list.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.entries.map((entry) => (
              <ListRow
                key={entry.id}
                entry={entry}
                catalogItem={catalogById.get(entry.catalogItemId)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

