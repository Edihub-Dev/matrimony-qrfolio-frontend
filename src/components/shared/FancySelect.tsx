import React, { useEffect, useRef, useState } from "react";

export type FancySelectOption = {
  label: string;
  value: string;
  group?: string;
};

type FancySelectProps = {
  value: string;
  onChange: (next: string) => void;
  options: FancySelectOption[];
  placeholder?: string;
  columns?: number;
};

export const FancySelect: React.FC<FancySelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  columns = 1,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const selected = options.find((opt) => opt.value === value) || null;

  const norm = (s: string) => s.toLowerCase().trim();
  const q = norm(query);
  const filteredOptions = q
    ? options.filter((opt) => {
        const hay = `${opt.label} ${opt.value}`;
        return norm(hay).includes(q);
      })
    : options;

  const columnClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "sm:grid-cols-2"
        : columns === 3
          ? "sm:grid-cols-2 md:grid-cols-3"
          : "sm:grid-cols-2 md:grid-cols-4";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm bg-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      >
        <span className="flex-1 text-left truncate text-xs sm:text-sm text-gray-700">
          {selected?.label || placeholder || "Select"}
        </span>
        <span className="ml-auto text-[10px] text-gray-400">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="absolute z-30 mt-0.5 w-full">
          <div className="relative bg-white border border-rose-300 rounded-b-xl shadow-lg">
            <div className="absolute -top-1 left-10 w-3 h-3 bg-white border-l border-t border-rose-300 rotate-45" />
            <div className="px-3 pt-3">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Type to search"
              />
            </div>
            <div className="max-h-60 overflow-y-auto pt-3 pb-2">
              <div
                className={`grid ${columnClass} gap-x-6 gap-y-1.5 px-3 text-xs sm:text-sm`}
              >
                {filteredOptions.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`text-left px-2 py-1.5 rounded hover:bg-rose-50 ${
                        active
                          ? "bg-rose-50 text-rose-700 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
