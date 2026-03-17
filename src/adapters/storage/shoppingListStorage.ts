import { z } from "zod";
import {
  asCatalogItemId,
  asShoppingListEntryId,
  asShoppingListId
} from "../../domain/id";
import type { ShoppingList, ShoppingListPersistedV1 } from "../../domain/types";

const STORAGE_KEY = "nakupy.shoppingList";

const shoppingListPersistedV1Schema = z
  .object({
    version: z.literal(1),
    list: z.object({
      id: z.string(),
      name: z.string(),
      updatedAt: z.string(),
      entries: z.array(
        z.object({
          id: z.string(),
          catalogItemId: z.string(),
          quantity: z.number().int().min(1),
          checked: z.boolean(),
          addedAt: z.string()
        })
      )
    })
  })
  .transform((payload) => {
    const list: ShoppingList = {
      id: asShoppingListId(payload.list.id),
      name: payload.list.name,
      updatedAt: payload.list.updatedAt,
      entries: payload.list.entries.map((e) => ({
        id: asShoppingListEntryId(e.id),
        catalogItemId: asCatalogItemId(e.catalogItemId),
        quantity: e.quantity,
        checked: e.checked,
        addedAt: e.addedAt
      }))
    };

    const persisted: ShoppingListPersistedV1 = { version: 1, list };
    return persisted;
  });

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadShoppingList(): ShoppingList | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;

    const json: unknown = JSON.parse(raw);
    const parsed = shoppingListPersistedV1Schema.safeParse(json);
    if (!parsed.success) return null;

    return parsed.data.list;
  } catch {
    return null;
  }
}

export function saveShoppingList(list: ShoppingList): void {
  if (!isBrowser()) return;

  const payload: ShoppingListPersistedV1 = { version: 1, list };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

