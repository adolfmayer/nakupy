import { atom } from "nanostores";
import type { CatalogItemId, ShoppingListEntryId } from "../domain/id";
import {
  newShoppingListEntryId,
  newShoppingListId
} from "../domain/id";
import type { ShoppingList, ShoppingListEntry } from "../domain/types";

export const DEFAULT_LIST_NAME = "Family";

function nowIso(): string {
  return new Date().toISOString();
}

export function createEmptyShoppingList(): ShoppingList {
  const now = nowIso();
  return {
    id: newShoppingListId(),
    name: DEFAULT_LIST_NAME,
    entries: [],
    updatedAt: now
  };
}

export const $shoppingList = atom<ShoppingList>(createEmptyShoppingList());

export function initShoppingList(list: ShoppingList): void {
  $shoppingList.set(list);
}

export function addCatalogItemToList(catalogItemId: CatalogItemId): void {
  const current = $shoppingList.get();
  const existing = current.entries.find((e) => e.catalogItemId === catalogItemId);

  const updatedEntries: readonly ShoppingListEntry[] =
    existing == null
      ? [
          ...current.entries,
          {
            id: newShoppingListEntryId(),
            catalogItemId,
            quantity: 1,
            checked: false,
            addedAt: nowIso()
          }
        ]
      : current.entries.map((e) =>
          e.id === existing.id ? { ...e, quantity: e.quantity + 1 } : e
        );

  $shoppingList.set({
    ...current,
    entries: updatedEntries,
    updatedAt: nowIso()
  });
}

export function toggleCatalogItemInList(catalogItemId: CatalogItemId): void {
  const current = $shoppingList.get();
  const hasEntryForItem = current.entries.some(
    (e) => e.catalogItemId === catalogItemId
  );

  if (!hasEntryForItem) {
    addCatalogItemToList(catalogItemId);
    return;
  }

  const updatedEntries = current.entries.filter(
    (e) => e.catalogItemId !== catalogItemId
  );

  $shoppingList.set({
    ...current,
    entries: updatedEntries,
    updatedAt: nowIso()
  });
}

export function removeEntry(entryId: ShoppingListEntryId): void {
  const current = $shoppingList.get();
  const updatedEntries = current.entries.filter((e) => e.id !== entryId);
  $shoppingList.set({ ...current, entries: updatedEntries, updatedAt: nowIso() });
}

export function toggleEntryChecked(entryId: ShoppingListEntryId): void {
  const current = $shoppingList.get();
  $shoppingList.set({
    ...current,
    entries: current.entries.map((e) =>
      e.id === entryId ? { ...e, checked: !e.checked } : e
    ),
    updatedAt: nowIso()
  });
}

export function setEntryQuantity(
  entryId: ShoppingListEntryId,
  quantity: number
): void {
  const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  const current = $shoppingList.get();

  $shoppingList.set({
    ...current,
    entries: current.entries.map((e) =>
      e.id === entryId ? { ...e, quantity: safeQty } : e
    ),
    updatedAt: nowIso()
  });
}

export function clearShoppingList(): void {
  const current = $shoppingList.get();
  $shoppingList.set({ ...current, entries: [], updatedAt: nowIso() });
}

