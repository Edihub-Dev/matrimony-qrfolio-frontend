import React from "react";
import { Search, X } from "lucide-react";

export type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  onClear,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-[#f0e4e7] bg-white/95 px-4 py-2 shadow-sm transition focus-within:border-rose-300"
    >
      <Search className="h-4 w-4 text-[#d48493]" />
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by profile ID or name"
        className="flex-1 bg-transparent text-xs sm:text-sm text-[#2b1d20] placeholder:text-[#b6959d] focus:outline-none"
      />
      {query ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fef1f4] text-[#d48493] hover:bg-[#f9dfe6]"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
      <button
        type="submit"
        className="hidden sm:inline-flex h-8 items-center justify-center rounded-full bg-[#2b1d20] px-4 text-[11px] font-semibold text-white hover:bg-black/80"
      >
        Search
      </button>
    </form>
  );
};
