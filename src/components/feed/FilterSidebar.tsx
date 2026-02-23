import React, { useEffect, useMemo, useState } from "react";
import {
  RELIGION_OPTIONS,
  SUBCASTE_OPTIONS,
  STATE_CITY_MAP,
} from "@/lib/matrimony/matrimonyConstants";
import type { FeedFilters } from "@/lib/feed/matchesApi";

export type FilterSidebarProps = {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const stateOptions = useMemo(() => Object.keys(STATE_CITY_MAP), []);
  const districtOptions = useMemo(() => {
    const selectedState = filters.state || "";
    if (!selectedState || !STATE_CITY_MAP[selectedState]) return [];
    return STATE_CITY_MAP[selectedState];
  }, [filters.state]);

  const [casteSearch, setCasteSearch] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    age: false,
    religion: false,
    community: false,
    location: false,
    education: false,
    profession: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const educationOptions = useMemo(
    () => [
      "B.Tech",
      "B.E",
      "B.Sc",
      "B.Com",
      "BA",
      "MBA",
      "M.Tech",
      "M.Sc",
      "MCA",
      "CA",
      "LLB",
      "MBBS",
    ],
    [],
  );

  const professionOptions = useMemo(
    () => [
      "Software Engineer",
      "Teacher",
      "Doctor",
      "Nurse",
      "Accountant",
      "Designer",
      "Architect",
      "Business",
      "Government Employee",
      "Student",
    ],
    [],
  );

  const handleFieldChange = (field: keyof FeedFilters, value: string) => {
    const next: FeedFilters = { ...filters, [field]: value || undefined };
    if (field === "state") next.district = undefined;
    onChange(next);
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => !!(v && String(v).trim()),
  );

  const parsedAge = useMemo(() => {
    const raw = (filters.ageRange || "").trim();
    if (!raw) return { min: "", max: "" };
    const m = raw.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (!m) return { min: "", max: "" };
    return { min: m[1] || "", max: m[2] || "" };
  }, [filters.ageRange]);

  const [ageMin, setAgeMin] = useState<string>(parsedAge.min);
  const [ageMax, setAgeMax] = useState<string>(parsedAge.max);

  useEffect(() => {
    setAgeMin(parsedAge.min);
    setAgeMax(parsedAge.max);
  }, [parsedAge.min, parsedAge.max]);

  const commitAgeRange = (nextMin: string, nextMax: string) => {
    const min = String(nextMin || "").trim();
    const max = String(nextMax || "").trim();

    if (!min && !max) {
      handleFieldChange("ageRange", "");
      return;
    }

    if (!min || !max) {
      return;
    }

    handleFieldChange("ageRange", `${min}-${max}`);
  };

  const visibleCastes = useMemo(() => {
    const q = casteSearch.trim().toLowerCase();
    if (!q) return SUBCASTE_OPTIONS;
    return SUBCASTE_OPTIONS.filter((opt) => opt.toLowerCase().includes(q));
  }, [casteSearch]);

  return (
    <aside className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[#f0e4e7] bg-white">
        <div className="flex flex-col">
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("age")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Age Range</span>
              <span className="text-gray-400 text-sm">
                {openSections.age ? "▴" : "▾"}
              </span>
            </button>
            {openSections.age && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    className="w-full rounded-md border-gray-200 text-sm py-1.5 px-3 focus:ring-[#e07d8c] focus:border-[#e07d8c] bg-[#fff9fa]"
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    onBlur={() => commitAgeRange(ageMin, ageMax)}
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-400">
                    min
                  </span>
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative w-full">
                  <input
                    className="w-full rounded-md border-gray-200 text-sm py-1.5 px-3 focus:ring-[#e07d8c] focus:border-[#e07d8c] bg-[#fff9fa]"
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    onBlur={() => commitAgeRange(ageMin, ageMax)}
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-400">
                    max
                  </span>
                </div>
              </div>
            )}
          </div>
          <hr className="border-[#f7f0f2]" />

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("religion")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Religion</span>
              <span className="text-gray-400 text-sm">
                {openSections.religion ? "▴" : "▾"}
              </span>
            </button>
            {openSections.religion && (
              <div className="mt-3 flex flex-col gap-2">
                {RELIGION_OPTIONS.slice(0, 12).map((opt) => {
                  const checked = (filters.religion || "") === opt;
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-[#6e5a5d] hover:text-[#2b1d20] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleFieldChange("religion", checked ? "" : opt)
                        }
                        className="rounded border-gray-300 text-[#e07d8c] focus:ring-[#e07d8c]"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-[#f7f0f2]" />

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("community")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Community / Caste</span>
              <span className="text-gray-400 text-sm">
                {openSections.community ? "▴" : "▾"}
              </span>
            </button>
            {openSections.community && (
              <>
                <div className="relative mt-3">
                  <input
                    className="w-full rounded-md border-gray-200 text-sm py-1.5 px-3 focus:ring-[#e07d8c] focus:border-[#e07d8c] bg-[#fff9fa]"
                    placeholder="Search Caste..."
                    value={casteSearch}
                    onChange={(e) => setCasteSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {visibleCastes.slice(0, 30).map((opt) => {
                    const checked = (filters.caste || "") === opt;
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm text-[#6e5a5d] hover:text-[#2b1d20] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleFieldChange("caste", checked ? "" : opt)
                          }
                          className="rounded border-gray-300 text-[#e07d8c] focus:ring-[#e07d8c]"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <hr className="border-[#f7f0f2]" />

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("location")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Location</span>
              <span className="text-gray-400 text-sm">
                {openSections.location ? "▴" : "▾"}
              </span>
            </button>
            {openSections.location && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                <FilterSelect
                  label="State"
                  value={filters.state}
                  onChange={(v) => handleFieldChange("state", v)}
                  options={stateOptions}
                />
                <FilterSelect
                  label="District"
                  value={filters.district}
                  onChange={(v) => handleFieldChange("district", v)}
                  options={districtOptions}
                  disabled={!districtOptions.length}
                />
              </div>
            )}
          </div>

          <hr className="border-[#f7f0f2]" />

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("education")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Education</span>
              <span className="text-gray-400 text-sm">
                {openSections.education ? "▴" : "▾"}
              </span>
            </button>
            {openSections.education && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                <FilterSelect
                  label="Education"
                  value={filters.education}
                  onChange={(v) => handleFieldChange("education", v)}
                  options={educationOptions}
                />
                <FilterInput
                  label="Other education"
                  value={filters.education}
                  onChange={(v) => handleFieldChange("education", v)}
                  placeholder="Type education"
                />
              </div>
            )}
          </div>

          <hr className="border-[#f7f0f2]" />

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => toggleSection("profession")}
              className="w-full text-left text-base font-bold text-[#2b1d20] flex items-center justify-between"
            >
              <span>Profession</span>
              <span className="text-gray-400 text-sm">
                {openSections.profession ? "▴" : "▾"}
              </span>
            </button>
            {openSections.profession && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                <FilterSelect
                  label="Profession"
                  value={filters.profession}
                  onChange={(v) => handleFieldChange("profession", v)}
                  options={professionOptions}
                />
                <FilterInput
                  label="Other profession"
                  value={filters.profession}
                  onChange={(v) => handleFieldChange("profession", v)}
                  placeholder="Type profession"
                />
              </div>
            )}
          </div>

          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setOpenSections({
                    age: false,
                    religion: false,
                    community: false,
                    location: false,
                    education: false,
                    profession: false,
                  });
                }}
                disabled={!hasActiveFilters}
                className="flex-1 rounded-xl border border-[#f0e4e7] bg-white px-4 py-3 text-sm font-bold text-[#6e5a5d] hover:bg-[#fff9fa] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  commitAgeRange(ageMin, ageMax);
                  onApply();
                  setOpenSections({
                    age: false,
                    religion: false,
                    community: false,
                    location: false,
                    education: false,
                    profession: false,
                  });
                }}
                className="flex-1 rounded-full bg-[#e07d8c] px-4 py-3 text-sm font-bold text-[#2b1d20] shadow-sm hover:bg-[#d16b7a]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ---------------------------------- */
/* Reusable Components */
/* ---------------------------------- */

const baseInputClass =
  "w-full rounded-md border-gray-200 bg-[#fff9fa] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e07d8c] focus:border-[#e07d8c]";

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold text-[#6e5a5d]">{label}</label>
    <select
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInputClass} disabled:bg-[#fff9fa] disabled:text-gray-300`}
    >
      <option value="">Any</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const FilterInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold text-[#6e5a5d]">{label}</label>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseInputClass}
    />
  </div>
);
