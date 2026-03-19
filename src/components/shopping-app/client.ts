import { $searchQuery, setSearchQuery } from "../../state/ui.store";
import {
  $shoppingList,
  clearShoppingList,
  initShoppingList,
  removeEntry,
  toggleCatalogItemInList,
} from "../../state/shoppingList.store";
import { loadShoppingList, saveShoppingList } from "../../adapters/storage/shoppingListStorage";
import type { CatalogItemId } from "../../domain/id";

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type CatalogSearchData = Readonly<{
  titleNorm: string;
  tagsNorm: readonly string[];
}>;

function getRequiredEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (el == null) throw new Error(`Missing element #${id}`);
  return el as T;
}

function setDisabled(btn: HTMLButtonElement, disabled: boolean): void {
  btn.disabled = disabled;
  btn.setAttribute("aria-disabled", disabled ? "true" : "false");

  btn.className = [
    "relative inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
    "select-none",
    disabled
      ? "cursor-not-allowed opacity-50 ring-red-400/20 bg-red-500/10 text-red-100/70"
      : "ring-red-300/35 bg-red-500/15 text-red-50 hover:bg-red-500/20",
  ].join(" ");
}

function setCatalogCardSelected(btn: HTMLButtonElement, selected: boolean): void {
  const base = [
    "group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition",
    "select-none",
  ];
  const selectedClass = "ring-emerald-300 bg-emerald-500/25";
  const unselectedClass = "ring-orange-400/25 bg-orange-500/15 hover:bg-orange-500/20";
  btn.className = [...base, selected ? selectedClass : unselectedClass].join(" ");
}

export function initShoppingApp(): void {
  // Ensure we only ever initialize once.
  if ((window as unknown as { __nakupyShoppingAppInit?: boolean }).__nakupyShoppingAppInit === true) return;
  (window as unknown as { __nakupyShoppingAppInit?: boolean }).__nakupyShoppingAppInit = true;

  const searchInput = getRequiredEl<HTMLInputElement>("catalog-search");
  const clearAllBtn = getRequiredEl<HTMLButtonElement>("clear-all");
  const listCount = getRequiredEl<HTMLElement>("list-count");
  const listEmpty = getRequiredEl<HTMLElement>("list-empty");
  const listGrid = getRequiredEl<HTMLElement>("list-grid");
  const catalogGrid = getRequiredEl<HTMLElement>("catalog-grid");

  const catalogButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-catalog-item][data-item-id]"),
  );
  const catalogButtonById = new Map<CatalogItemId, HTMLButtonElement>();
  const catalogSearchById = new Map<CatalogItemId, CatalogSearchData>();
  for (const btn of catalogButtons) {
    const id = btn.dataset.itemId as CatalogItemId | undefined;
    if (id == null) continue;
    catalogButtonById.set(id, btn);

    // Build a minimal, pre-normalized search index to avoid bundling catalog data.
    const titleRaw = btn.dataset.itemTitle ?? "";
    const tagsRaw = btn.dataset.itemTags ?? "";
    const tags = tagsRaw.length === 0 ? [] : tagsRaw.split(" ").map((t) => t.trim()).filter((t) => t.length > 0);

    catalogSearchById.set(id, {
      titleNorm: normalizeForSearch(titleRaw),
      tagsNorm: tags.map((t) => normalizeForSearch(t)),
    });
  }

  // Restore persisted list (same behavior as previous React app).
  const loaded = loadShoppingList();
  if (loaded != null) initShoppingList(loaded);

  // Wire UI events.
  searchInput.addEventListener("input", () => setSearchQuery(searchInput.value));

  clearAllBtn.addEventListener("click", () => {
    if (clearAllBtn.disabled) return;
    clearShoppingList();
  });

  // Event delegation keeps wiring cheap and robust.
  catalogGrid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const btn = target?.closest?.("[data-catalog-item][data-item-id]") as HTMLButtonElement | null;
    const id = btn?.dataset?.itemId as CatalogItemId | undefined;
    if (id == null) return;
    toggleCatalogItemInList(id);
  });

  listGrid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const btn = target?.closest?.("[data-list-item][data-item-id]") as HTMLButtonElement | null;
    const itemId = btn?.dataset?.itemId as CatalogItemId | undefined;
    if (itemId == null) return;

    const list = $shoppingList.get();
    const entry = list.entries.find((e) => e.catalogItemId === itemId);
    if (entry == null) return;
    removeEntry(entry.id);
  });

  function renderListButton(itemId: CatalogItemId): HTMLButtonElement | null {
    const sourceBtn = catalogButtonById.get(itemId);
    if (sourceBtn == null) return null;

    const title = sourceBtn.dataset.itemTitle ?? "Unknown item";
    const thumbSrc = sourceBtn.dataset.thumbSrc;
    const thumbSrcset = sourceBtn.dataset.thumbSrcset;
    const thumbSizes = sourceBtn.dataset.thumbSizes;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.itemId = itemId;
    btn.dataset.listItem = "";
    btn.className = [
      "group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition",
      "ring-red-400/25 bg-zinc-950/60",
      "select-none",
    ].join(" ");

    const bgWrapper = document.createElement("div");
    bgWrapper.className = "absolute inset-0";

    if (thumbSrc != null && thumbSrc.length > 0) {
      const img = document.createElement("img");
      img.src = thumbSrc;
      if (thumbSrcset != null && thumbSrcset.length > 0) img.setAttribute("srcset", thumbSrcset);
      if (thumbSizes != null && thumbSizes.length > 0) img.setAttribute("sizes", thumbSizes);
      img.width = 400;
      img.height = 500;
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = `Photo of ${title}`;
      img.className = "h-full w-full object-cover opacity-85 transition group-hover:opacity-100";

      bgWrapper.appendChild(img);

      const overlay = document.createElement("div");
      overlay.className =
        "pointer-events-none absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/25 to-transparent";
      bgWrapper.appendChild(overlay);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "absolute inset-0 bg-zinc-900/80";
      bgWrapper.appendChild(placeholder);
    }

    btn.appendChild(bgWrapper);

    const titleWrap = document.createElement("div");
    titleWrap.className = "absolute inset-x-0 top-0 p-2";

    const titleEl = document.createElement("div");
    titleEl.className =
      "line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-50 drop-shadow";
    titleEl.textContent = title;
    titleWrap.appendChild(titleEl);
    btn.appendChild(titleWrap);

    return btn;
  }

  // Persist list changes (debounced).
  let saveTimer: number | undefined;
  $shoppingList.subscribe((list) => {
    if (saveTimer != null) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveShoppingList(list), 250);
  });

  // UI updates: selection + list visibility + counts + order.
  function renderFromState(): void {
    const query = $searchQuery.get();
    const q = normalizeForSearch(query);
    const list = $shoppingList.get();

    const selected = new Set(list.entries.map((e) => e.catalogItemId));

    // Catalog filtering + selection state.
    for (const btn of catalogButtons) {
      const id = btn.dataset.itemId as CatalogItemId | undefined;
      if (id == null) continue;

      const searchData = catalogSearchById.get(id);
      if (searchData == null) continue;

      const visible =
        q.length === 0 || searchData.titleNorm.includes(q) || searchData.tagsNorm.some((t) => t.includes(q));
      btn.style.display = visible ? "" : "none";
      setCatalogCardSelected(btn, selected.has(id));
    }

    // List count + empty state + clear button.
    const count = list.entries.length;
    listCount.textContent = String(count);
    setDisabled(clearAllBtn, count === 0);
    listEmpty.classList.toggle("hidden", count !== 0);
    if (count === 0) {
      listGrid.className = "hidden grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";
    } else {
      listGrid.className = "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";
    }

    // Render list buttons from state (keeps initial HTML light).
    listGrid.replaceChildren();
    if (count !== 0) {
      const fragment = document.createDocumentFragment();
      for (const entry of list.entries) {
        const btn = renderListButton(entry.catalogItemId);
        if (btn != null) fragment.appendChild(btn);
      }
      listGrid.appendChild(fragment);
    }
  }

  $searchQuery.subscribe(renderFromState);
  $shoppingList.subscribe(renderFromState);
  renderFromState();
}

if (typeof window !== "undefined") {
  initShoppingApp();
}


