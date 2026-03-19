import {
  asCatalogItemId,
  asShoppingListEntryId,
  asShoppingListId
} from "../../domain/id";
import type { ShoppingList, ShoppingListPersistedV1 } from "../../domain/types";

const STORAGE_KEY = "nakupy.shoppingList";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isIntMin1(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function parseShoppingListPersistedV1(payload: unknown): ShoppingList | null {
  if (!isRecord(payload)) return null;

  if (payload.version !== 1) return null;
  const listValue = payload.list;
  if (!isRecord(listValue)) return null;

  const idValue = listValue.id;
  const nameValue = listValue.name;
  const updatedAtValue = listValue.updatedAt;
  const entriesValue = listValue.entries;

  if (!isString(idValue) || !isString(nameValue) || !isString(updatedAtValue)) return null;
  if (!Array.isArray(entriesValue)) return null;

  const entries: ShoppingListPersistedV1["list"]["entries"] = [];
  for (const entryValue of entriesValue) {
    if (!isRecord(entryValue)) return null;

    const entryId = entryValue.id;
    const catalogItemId = entryValue.catalogItemId;
    const quantity = entryValue.quantity;
    const checked = entryValue.checked;
    const addedAt = entryValue.addedAt;

    if (
      !isString(entryId) ||
      !isString(catalogItemId) ||
      !isIntMin1(quantity) ||
      !isBoolean(checked) ||
      !isString(addedAt)
    ) {
      return null;
    }

    entries.push({
      id: asShoppingListEntryId(entryId),
      catalogItemId: asCatalogItemId(catalogItemId),
      quantity,
      checked,
      addedAt,
    });
  }

  return {
    id: asShoppingListId(idValue),
    name: nameValue,
    updatedAt: updatedAtValue,
    entries,
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadShoppingList(): ShoppingList | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;

    const json: unknown = JSON.parse(raw);
    return parseShoppingListPersistedV1(json);
  } catch {
    return null;
  }
}

export function saveShoppingList(list: ShoppingList): void {
  if (!isBrowser()) return;

  const payload: ShoppingListPersistedV1 = { version: 1, list };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

