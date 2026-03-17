import { useStore } from "@nanostores/react";
import { $searchQuery, setSearchQuery } from "../../state/ui.store";

export function SearchBar(): JSX.Element {
  const query = useStore($searchQuery);

  return (
    <div className="rounded-xl bg-zinc-950 ring-1 ring-zinc-800">
      <input
        value={query}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        placeholder="Search…"
        className="h-11 w-full bg-transparent px-4 text-sm outline-none placeholder:text-zinc-500"
        aria-label="Search catalog"
      />
    </div>
  );
}

