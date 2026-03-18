const STORAGE_KEY = "nakupy.shoppingList";
const LIST_NAME = "Family";

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

function uuid() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadPersistedEntryIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return [];
    const json = JSON.parse(raw);
    const entries = json?.list?.entries;
    if (!Array.isArray(entries)) return [];
    return entries
      .map((e) => e?.catalogItemId)
      .filter((id) => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function savePersistedEntryIds(entryIds, listId) {
  try {
    const now = new Date().toISOString();
    const payload = {
      version: 1,
      list: {
        id: listId,
        name: LIST_NAME,
        updatedAt: now,
        entries: entryIds.map((catalogItemId) => ({
          id: uuid(),
          catalogItemId,
          quantity: 1,
          checked: false,
          addedAt: now,
        })),
      },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore persistence errors (private mode, quota, etc.).
  }
}

function renderListTile(entryId, sourceBtn, onRemove) {
  const title = sourceBtn.dataset.itemTitle ?? "Unknown item";
  const thumbSrc = sourceBtn.dataset.thumbSrc;
  const thumbSrcset = sourceBtn.dataset.thumbSrcset;
  const thumbSizes = sourceBtn.dataset.thumbSizes;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.dataset.itemId = entryId;
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

  btn.addEventListener("click", () => onRemove(entryId));
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

  const listId = uuid();
  const state = {
    listId,
    entryIds: loadPersistedEntryIds(),
    query: "",
  };

  let saveTimer;
  function scheduleSave() {
    if (saveTimer != null) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(
      () => savePersistedEntryIds(state.entryIds, state.listId),
      250,
    );
  }

  function toggleEntryId(id) {
    const idx = state.entryIds.indexOf(id);
    if (idx >= 0) {
      const next = state.entryIds.slice();
      next.splice(idx, 1);
      state.entryIds = next;
    } else {
      state.entryIds = [...state.entryIds, id];
    }
    scheduleSave();
    renderFromState();
  }

  function setEntryIds(nextIds) {
    state.entryIds = nextIds;
    scheduleSave();
    renderFromState();
  }

  function renderFromState() {
    const selected = new Set(state.entryIds);
    const query = state.query ?? "";

    for (const btn of catalogButtons) {
      const id = btn.dataset.itemId;
      if (id == null) continue;

      const item = {
        title: btn.dataset.itemTitle ?? "Unknown item",
        tags: (btn.dataset.itemTags ?? "")
          .split(" ")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      };

      const visible = matchesQuery(item, query);
      btn.style.display = visible ? "" : "none";
      setCatalogCardSelected(btn, selected.has(id));
    }

    const count = state.entryIds.length;
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
    for (const entryId of state.entryIds) {
      const sourceBtn = catalogButtonById.get(entryId);
      if (sourceBtn == null) continue;
      fragment.appendChild(
        renderListTile(entryId, sourceBtn, (id) => {
          const idx = state.entryIds.indexOf(id);
          if (idx < 0) return;
          const next = state.entryIds.slice();
          next.splice(idx, 1);
          setEntryIds(next);
        }),
      );
    }
    listGrid.appendChild(fragment);
  }

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    renderFromState();
  });

  clearAllBtn.addEventListener("click", () => {
    if (clearAllBtn.disabled) return;
    setEntryIds([]);
  });

  catalogGrid.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target?.closest?.('[data-catalog-item][data-item-id]');
    const id = btn?.dataset?.itemId;
    if (id == null) return;
    toggleEntryId(id);
  });

  renderFromState();
  scheduleSave();
}

if (typeof window !== "undefined") {
  initShoppingApp();
}

