import { useState } from "react";
import type { CatalogItem, ShoppingList } from "../../../domain/types";
import type { CatalogItemId } from "../../../domain/id";
import { ListRow } from "./ListRow";
import { clearShoppingList } from "../../../state/shoppingList.store";

export interface ShoppingListPanelProps {
  list: ShoppingList;
  catalogById: ReadonlyMap<CatalogItemId, CatalogItem>;
}

type ClearAllButtonProps = Readonly<{
  disabled?: boolean;
  onClick: () => void;
}>;

function ClearAllButton({ disabled, onClick }: ClearAllButtonProps): JSX.Element {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled === true}
      aria-disabled={disabled === true}
      aria-label="Clear all items"
      onClick={() => {
        if (disabled === true) return;
        onClick();
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={[
        "relative inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
        "select-none",
        disabled === true
          ? "cursor-not-allowed opacity-50 ring-red-400/20 bg-red-500/10 text-red-100/70"
          : pressed
            ? "ring-red-200/60 bg-red-500/25 text-red-50"
            : "ring-red-300/35 bg-red-500/15 text-red-50 hover:bg-red-500/20"
      ].join(" ")}
    >
      Clear all
    </button>
  );
}

export function ShoppingListPanel({
  list,
  catalogById
}: ShoppingListPanelProps): JSX.Element {
  return (
    <aside className="sticky top-4 rounded-2xl bg-red-500/15 p-4 ring-1 ring-red-400/25">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="text-sm font-semibold tracking-wide text-red-100">
          Shopping List
        </div>
        <div className="flex items-center gap-2 text-xs text-red-200/80">
          <span>{list.entries.length} items</span>
          <ClearAllButton
            disabled={list.entries.length === 0}
            onClick={() => clearShoppingList()}
          />
        </div>
      </div>

      <div className="mt-3 min-h-[420px] rounded-xl bg-red-500/10 p-3 ring-1 ring-red-400/20">
        {list.entries.length === 0 ? (
          <div className="grid h-[380px] place-items-center text-center">
            <div className="max-w-[28ch] text-sm text-red-100/80">
              Click items in the catalog to build your shopping list.
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

