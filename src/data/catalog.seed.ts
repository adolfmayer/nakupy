import type { CatalogItem } from "../domain/types";
import { asCatalogItemId } from "../domain/id";

const now = new Date().toISOString();

export const CATALOG_SEED: readonly CatalogItem[] = [
  {
    id: asCatalogItemId("milk"),
    title: "Milk",
    imageUrl: "https://picsum.photos/seed/milk/400/500",
    tags: ["dairy"],
    createdAt: now
  },
  {
    id: asCatalogItemId("bread"),
    title: "Bread",
    imageUrl: "https://picsum.photos/seed/bread/400/500",
    tags: ["bakery"],
    createdAt: now
  },
  {
    id: asCatalogItemId("eggs"),
    title: "Eggs",
    imageUrl: "https://picsum.photos/seed/eggs/400/500",
    tags: ["dairy"],
    createdAt: now
  },
  {
    id: asCatalogItemId("apples"),
    title: "Apples",
    imageUrl: "https://picsum.photos/seed/apples/400/500",
    tags: ["fruit"],
    createdAt: now
  },
  {
    id: asCatalogItemId("bananas"),
    title: "Bananas",
    imageUrl: "https://picsum.photos/seed/bananas/400/500",
    tags: ["fruit"],
    createdAt: now
  },
  {
    id: asCatalogItemId("chicken"),
    title: "Chicken",
    imageUrl: "https://picsum.photos/seed/chicken/400/500",
    tags: ["meat"],
    createdAt: now
  },
  {
    id: asCatalogItemId("pasta"),
    title: "Pasta",
    imageUrl: "https://picsum.photos/seed/pasta/400/500",
    tags: ["pantry"],
    createdAt: now
  },
  {
    id: asCatalogItemId("tomatoes"),
    title: "Tomatoes",
    imageUrl: "https://picsum.photos/seed/tomatoes/400/500",
    tags: ["vegetable"],
    createdAt: now
  }
] as const;

