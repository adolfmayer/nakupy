import type { CatalogItemId, ShoppingListEntryId, ShoppingListId } from './id';

export interface CatalogItem {
  id: CatalogItemId;
  title: string;
  imageUrl: string;
  tags?: readonly string[];
  createdAt: string; // ISO timestamp; maps cleanly to DB
}

export interface ShoppingListEntry {
  id: ShoppingListEntryId;
  catalogItemId: CatalogItemId;
  quantity: number;
  checked: boolean;
  addedAt: string; // ISO
}

export interface ShoppingList {
  id: ShoppingListId;
  name: string;
  entries: readonly ShoppingListEntry[];
  updatedAt: string; // ISO
}

export interface ShoppingListPersistedV1 {
  version: 1;
  list: ShoppingList;
}
