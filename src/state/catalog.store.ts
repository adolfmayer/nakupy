import { atom } from "nanostores";
import { CATALOG_SEED } from "../data/catalog.seed";
import type { CatalogItem } from "../domain/types";
import type { CatalogItemId } from "../domain/id";

export const $catalogItems = atom<readonly CatalogItem[]>(CATALOG_SEED);

export function getCatalogItemById(
  items: readonly CatalogItem[],
  id: CatalogItemId
): CatalogItem | undefined {
  return items.find((x) => x.id === id);
}

