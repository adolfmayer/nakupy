import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { useStore } from "@nanostores/react";
import { useEffect, useMemo } from "react";
import type { CatalogItem } from "../../domain/types";
import type { CatalogItemId, ShoppingListEntryId } from "../../domain/id";
import { $catalogItems } from "../../state/catalog.store";
import { $searchQuery } from "../../state/ui.store";
import {
  addCatalogItemToList,
  initShoppingList,
  removeEntry,
  $shoppingList
} from "../../state/shoppingList.store";
import {
  loadShoppingList,
  saveShoppingList
} from "../../adapters/storage/shoppingListStorage";
import { SearchBar } from "./SearchBar";
import { CatalogGrid } from "./catalog/CatalogGrid";
import { ShoppingListPanel } from "./list/ShoppingListPanel";

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type CatalogDragData = Readonly<{
  type: "catalogItem";
  catalogItemId: CatalogItemId;
}>;

type ShoppingListEntryDragData = Readonly<{
  type: "shoppingListEntry";
  entryId: ShoppingListEntryId;
}>;

function isCatalogDragData(value: unknown): value is CatalogDragData {
  if (value == null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v["type"] === "catalogItem" && typeof v["catalogItemId"] === "string";
}

function isShoppingListEntryDragData(
  value: unknown
): value is ShoppingListEntryDragData {
  if (value == null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v["type"] === "shoppingListEntry" && typeof v["entryId"] === "string";
}

function filterCatalogItems(
  items: readonly CatalogItem[],
  query: string
): readonly CatalogItem[] {
  const q = normalizeForSearch(query);
  if (q.length === 0) return items;

  return items.filter((item) => {
    if (normalizeForSearch(item.title).includes(q)) return true;
    return (item.tags ?? []).some((t) => normalizeForSearch(t).includes(q));
  });
}

export function ShoppingApp(): JSX.Element {
  const items = useStore($catalogItems);
  const query = useStore($searchQuery);
  const list = useStore($shoppingList);

  useEffect(() => {
    const loaded = loadShoppingList();
    if (loaded != null) initShoppingList(loaded);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => saveShoppingList(list), 250);
    return () => window.clearTimeout(t);
  }, [list]);

  const sensors = useSensors(useSensor(PointerSensor));

  const filtered = useMemo(
    () => filterCatalogItems(items, query),
    [items, query]
  );

  const catalogById = useMemo(() => {
    const m = new Map<CatalogItemId, CatalogItem>();
    for (const item of items) m.set(item.id, item);
    return m;
  }, [items]);

  function onDragEnd(event: DragEndEvent): void {
    const data = event.active.data.current;

    if (isCatalogDragData(data) && event.over?.id === "shoppingListDropzone") {
      addCatalogItemToList(data.catalogItemId);
      return;
    }

    if (
      isShoppingListEntryDragData(data) &&
      event.over?.id !== "shoppingListDropzone"
    ) {
      removeEntry(data.entryId);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid items-start gap-4 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/20">
            <div className="mb-3 text-xs font-semibold tracking-wide text-emerald-100/90">
              Catalog
            </div>
            <SearchBar />
            <div className="mt-4">
              <CatalogGrid items={filtered} />
            </div>
          </section>

          <ShoppingListPanel list={list} catalogById={catalogById} />
        </div>
      </main>
    </DndContext>
  );
}

