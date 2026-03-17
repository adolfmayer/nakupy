import { useDroppable } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogItem, ShoppingList } from "../../../domain/types";
import type { CatalogItemId } from "../../../domain/id";
import { ListRow } from "./ListRow";
import { clearShoppingList } from "../../../state/shoppingList.store";

export interface ShoppingListPanelProps {
  list: ShoppingList;
  catalogById: ReadonlyMap<CatalogItemId, CatalogItem>;
}

type HoldToConfirmButtonProps = Readonly<{
  disabled?: boolean;
  holdMs: number;
  onConfirmed: () => void;
}>;

function HoldToConfirmButton({
  disabled,
  holdMs,
  onConfirmed
}: HoldToConfirmButtonProps): JSX.Element {
  const [holding, setHolding] = useState(false);
  const [progress01, setProgress01] = useState(0);
  const startAtMsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const clampedHoldMs = useMemo(() => Math.max(400, Math.floor(holdMs)), [holdMs]);

  function stop(): void {
    setHolding(false);
    setProgress01(0);
    startAtMsRef.current = null;
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function tick(nowMs: number): void {
    const startAtMs = startAtMsRef.current;
    if (startAtMs == null) return;

    const elapsed = nowMs - startAtMs;
    const next = Math.min(1, elapsed / clampedHoldMs);
    setProgress01(next);

    if (next >= 1) {
      stop();
      onConfirmed();
      return;
    }

    rafRef.current = window.requestAnimationFrame(tick);
  }

  useEffect(() => stop, []);

  const pct = Math.round(progress01 * 100);

  return (
    <button
      type="button"
      disabled={disabled === true}
      aria-disabled={disabled === true}
      aria-label="Hold to clear all items"
      onPointerDown={(e) => {
        if (disabled === true) return;
        // Avoid triggering accidentally from non-primary buttons.
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        startAtMsRef.current = performance.now();
        setHolding(true);
        rafRef.current = window.requestAnimationFrame(tick);
      }}
      onPointerUp={() => stop()}
      onPointerCancel={() => stop()}
      onPointerLeave={() => stop()}
      className={[
        "relative inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
        "select-none touch-none",
        disabled === true
          ? "cursor-not-allowed opacity-50 ring-red-400/20 bg-red-500/10 text-red-100/70"
          : holding
            ? "ring-red-200/60 bg-red-500/25 text-red-50"
            : "ring-red-300/35 bg-red-500/15 text-red-50 hover:bg-red-500/20"
      ].join(" ")}
    >
      <span className="relative z-10">
        {disabled === true ? "Clear all" : holding ? `Clearing… ${pct}%` : "Hold to clear"}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-full"
      >
        <span
          className="absolute inset-y-0 left-0 bg-red-500/30"
          style={{ width: `${pct}%` }}
        />
      </span>
    </button>
  );
}

export function ShoppingListPanel({
  list,
  catalogById
}: ShoppingListPanelProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: "shoppingListDropzone" });

  return (
    <aside className="sticky top-4 rounded-2xl bg-red-500/15 p-4 ring-1 ring-red-400/25">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold tracking-wide text-red-100">
          Shopping List
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-red-200/80">{list.entries.length} items</div>
          <HoldToConfirmButton
            disabled={list.entries.length === 0}
            holdMs={900}
            onConfirmed={() => clearShoppingList()}
          />
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={[
          "mt-3 min-h-[420px] rounded-xl p-3 ring-1 transition",
          isOver ? "bg-red-500/15 ring-red-300/50" : "bg-red-500/10 ring-red-400/20"
        ].join(" ")}
      >
        {list.entries.length === 0 ? (
          <div className="grid h-[380px] place-items-center text-center">
            <div className="max-w-[28ch] text-sm text-red-100/80">
              Drag items here to build your list.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.entries.map((entry) => (
              <ListRow
                key={entry.id}
                entry={entry}
                catalogItem={catalogById.get(entry.catalogItemId)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

