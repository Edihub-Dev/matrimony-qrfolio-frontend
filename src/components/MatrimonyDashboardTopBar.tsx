import React, { useEffect, useState } from "react";
import { Bell, LogOut, Settings } from "lucide-react";

type MatrimonyDashboardTopBarProps = {
  label: string;
  onHomeClick: () => void;
  onNotificationsClick: () => void;
  showSearch?: boolean;
};

export const MatrimonyDashboardTopBar: React.FC<
  MatrimonyDashboardTopBarProps
> = ({ label, onHomeClick, onNotificationsClick, showSearch }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!showSearch) return;
    if (typeof window === "undefined") return;

    const handle = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("matrimony-feed-search", {
          detail: { query: query.trim() },
        })
      );
    }, 350);

    return () => {
      window.clearTimeout(handle);
    };
  }, [query, showSearch]);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem("qrAuthToken");
      window.localStorage.removeItem("qrPhone");
      window.localStorage.removeItem("qrEmail");
      window.localStorage.removeItem("qrName");
      window.localStorage.removeItem("qrMatrimonyPhoto");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  return (
    <header className="bg-white border-b border-[#f2e6ea] sticky top-0 z-20">
      <div className="h-18 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onHomeClick}
            className="text-[#9c6b79] text-sm font-medium hover:text-[#2e1d22] transition-colors"
          >
            Home
          </button>
          <span className="text-[#9c6b79] text-sm">/</span>
          <span className="text-[#2e1d22] text-sm font-bold">{label}</span>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <form
              className="block"
              onSubmit={(e) => {
                e.preventDefault();
                if (typeof window === "undefined") return;
                const q = query.trim();
                window.dispatchEvent(
                  new CustomEvent("matrimony-feed-search", {
                    detail: { query: q },
                  })
                );
              }}
            >
              <div className="relative w-[160px] sm:w-[240px] md:w-[320px]">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Name & ID"
                  className="w-full rounded-lg border border-[#f0e4e7] bg-white px-3 py-2 text-sm text-[#2e1d22] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e07d8c]/30 focus:border-[#e07d8c]"
                />
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      if (typeof window === "undefined") return;
                      window.dispatchEvent(
                        new CustomEvent("matrimony-feed-search", {
                          detail: { query: "" },
                        })
                      );
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9c6b79] hover:bg-[#fceef2]"
                    aria-label="Clear search"
                  >
                    <span className="text-xs font-bold">×</span>
                  </button>
                )}
              </div>
            </form>
          )}
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 rounded-full hover:bg-[#fceef2] text-[#9c6b79] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-[#fceef2] text-[#9c6b79] transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#f2e6ea] bg-white text-[#9c6b79] hover:bg-[#fffafb] hover:text-[#2e1d22] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
