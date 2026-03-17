export type Brand<K, T> = K & { readonly __brand: T };

export type CatalogItemId = Brand<string, "CatalogItemId">;
export type ShoppingListId = Brand<string, "ShoppingListId">;
export type ShoppingListEntryId = Brand<string, "ShoppingListEntryId">;

export function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

export function asShoppingListId(value: string): ShoppingListId {
  return value as ShoppingListId;
}

export function asShoppingListEntryId(value: string): ShoppingListEntryId {
  return value as ShoppingListEntryId;
}

export function newShoppingListId(): ShoppingListId {
  return crypto.randomUUID() as ShoppingListId;
}

export function newShoppingListEntryId(): ShoppingListEntryId {
  return crypto.randomUUID() as ShoppingListEntryId;
}

