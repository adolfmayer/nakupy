import { $catalogItems } from "../../state/catalog.store";
import { $searchQuery, setSearchQuery } from "../../state/ui.store";
import {
  $shoppingList,
  clearShoppingList,
  initShoppingList,
  removeEntry,
  toggleCatalogItemInList,
} from "../../state/shoppingList.store";
import { loadShoppingList, saveShoppingList } from "../../adapters/storage/shoppingListStorage";

function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesQuery(item, query) {
  const q = normalizeForSearch(query);
  if (q.length === 0) return true;
  if (normalizeForSearch(item.title).includes(q)) return true;
  return (item.tags ?? []).some((t) => normalizeForSearch(t).includes(q));
}

function getRequiredEl(id) {
  const el = document.getElementById(id);
  if (el == null) throw new Error(`Missing element #${id}`);
  return el;
}

function setDisabled(btn, disabled) {
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

function setCatalogCardSelected(btn, selected) {
  const base = [
    "group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition",
    "select-none",
  ];
  const selectedClass = "ring-emerald-300 bg-emerald-500/25";
  const unselectedClass = "ring-orange-400/25 bg-orange-500/15 hover:bg-orange-500/20";
  btn.className = [...base, selected ? selectedClass : unselectedClass].join(" ");
}

function renderListButton(itemId, sourceBtn) {
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
  titleEl.className = "line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-50 drop-shadow";
  titleEl.textContent = title;
  titleWrap.appendChild(titleEl);

  btn.appendChild(titleWrap);

  btn.addEventListener("click", () => {
    const list = $shoppingList.get();
    const entry = list.entries.find((e) => e.catalogItemId === itemId);
    if (entry == null) return;
    removeEntry(entry.id);
  });

  return btn;
}

function initShoppingApp() {
  const searchInput = getRequiredEl("catalog-search");
  const clearAllBtn = getRequiredEl("clear-all");
  const listCount = getRequiredEl("list-count");
  const listEmpty = getRequiredEl("list-empty");
  const listGrid = getRequiredEl("list-grid");
  const catalogGrid = getRequiredEl("catalog-grid");

  const catalogButtons = Array.from(
    document.querySelectorAll('[data-catalog-item][data-item-id]'),
  );
  const catalogButtonById = new Map();
  for (const btn of catalogButtons) {
    const id = btn.dataset.itemId;
    if (id != null && id.length > 0) catalogButtonById.set(id, btn);
  }

  const itemsById = new Map($catalogItems.get().map((x) => [x.id, x]));

  // Restore persisted list.
  const loaded = loadShoppingList();
  if (loaded != null) initShoppingList(loaded);

  searchInput.addEventListener("input", () => setSearchQuery(searchInput.value));

  clearAllBtn.addEventListener("click", () => {
    if (clearAllBtn.disabled) return;
    clearShoppingList();
  });

  // Event delegation keeps wiring cheap.
  catalogGrid.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target?.closest?.('[data-catalog-item][data-item-id]');
    const id = btn?.dataset?.itemId;
    if (id == null) return;
    toggleCatalogItemInList(id);
  });

  // Dynamically created tiles include click handlers; delegation not required.

  let saveTimer;
  $shoppingList.subscribe((list) => {
    if (saveTimer != null) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveShoppingList(list), 250);
  });

  function renderFromState() {
    const query = $searchQuery.get();
    const list = $shoppingList.get();
    const selected = new Set(list.entries.map((e) => e.catalogItemId));

    // Catalog filtering + selection state.
    for (const btn of catalogButtons) {
      const id = btn.dataset.itemId;
      if (id == null) continue;
      const item = itemsById.get(id);
      if (item == null) continue;

      const visible = matchesQuery(item, query);
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
      listGrid.replaceChildren();
      return;
    }

    listGrid.className = "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";
    listGrid.replaceChildren();

    const fragment = document.createDocumentFragment();
    for (const entry of list.entries) {
      const sourceBtn = catalogButtonById.get(entry.catalogItemId);
      const tile = renderListButton(entry.catalogItemId, sourceBtn);
      if (tile != null) fragment.appendChild(tile);
    }
    listGrid.appendChild(fragment);
  }

  $searchQuery.subscribe(renderFromState);
  $shoppingList.subscribe(renderFromState);

  renderFromState();
}

if (typeof window !== "undefined") {
  initShoppingApp();
}

