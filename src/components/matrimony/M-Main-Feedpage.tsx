import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { FilterSidebar } from "@/components/feed/FilterSidebar";
import { Button } from "@/components/ui/Button";
import { DashboardFeedCard } from "@/components/matrimony/M-Feed-Profile-Card";
import {
  getMatchesFeed,
  filterMatches,
  searchUsersWithMatches,
  // getLikedProfiles,
  type MatchFeedItem,
  type FeedFilters,
  type MatchesApiResult,
  type MatchesFeedResponse,
} from "@/lib/feed/matchesApi";
import { type MatchInteractionSource } from "@/lib/feed/matchInteractions";

const PAGE_SIZE = 12;

type Mode = "feed" | "filter" | "search";
type SortOption = "best_match" | "most_viewed" | "most_saved";

export const MatrimonyFeedSection: React.FC = () => {
  const [items, setItems] = useState<MatchFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(
    null,
  );
  const [filters, setFilters] = useState<FeedFilters>({});
  const [mode, setMode] = useState<Mode>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // const [likedItems, setLikedItems] = useState<MatchFeedItem[]>([]);
  const [viewerGender, setViewerGender] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("best_match");

  const fetchPageData = async (
    targetMode: Mode,
    targetPage = 1,
    options?: { queryOverride?: string },
  ) => {
    const normalizedQuery = (options?.queryOverride ?? searchQuery).trim();
    const effectiveMode =
      targetMode === "search" && !normalizedQuery ? "feed" : targetMode;

    setLoading(true);
    setError(null);
    setAuthError(false);
    setNeedsProfile(false);
    if (effectiveMode === "feed") {
      setProfileCompleteness(null);
    }

    let result:
      | MatchesApiResult<MatchesFeedResponse>
      | MatchesApiResult<MatchesFeedResponse>;

    if (effectiveMode === "search") {
      result = await searchUsersWithMatches(
        normalizedQuery,
        targetPage,
        PAGE_SIZE,
      );
    } else if (effectiveMode === "filter") {
      result = await filterMatches(filters, targetPage, PAGE_SIZE);
    } else {
      result = await getMatchesFeed(targetPage, PAGE_SIZE);
    }

    if (!result.ok) {
      setError(result.error || "Failed to load matches feed.");
      if (result.authError) setAuthError(true);
      if (result.needsProfile) setNeedsProfile(true);
      setProfileCompleteness(
        typeof result.profileCompleteness === "number"
          ? result.profileCompleteness
          : null,
      );
      setItems([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setItems(result.data.items || []);
    setHasMore(Boolean(result.data.hasMore));
    setPage(result.data.page || targetPage);
    if (effectiveMode === "feed") {
      setProfileCompleteness(
        typeof result.data.viewerCompleteness === "number"
          ? result.data.viewerCompleteness
          : null,
      );
      setViewerGender(
        typeof result.data.viewerGender === "string"
          ? result.data.viewerGender
          : null,
      );
    }
    setMode(effectiveMode);
    setLoading(false);
  };

  const loadInitial = async () => {
    await fetchPageData("feed", 1);
  };

  useEffect(() => {
    void loadInitial();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      const q = (detail?.query ?? "").trim();
      setSearchQuery(q);
      void fetchPageData(q ? "search" : "feed", 1, { queryOverride: q });
    };

    window.addEventListener("matrimony-feed-search", handler as EventListener);
    return () => {
      window.removeEventListener(
        "matrimony-feed-search",
        handler as EventListener,
      );
    };
  }, [fetchPageData]);

  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    setNeedsProfile(false);
    setProfileCompleteness(null);
    setMode("filter");
    setPage(1);

    const result = await filterMatches(filters, 1, PAGE_SIZE);

    if (!result.ok) {
      setError(result.error || "Failed to filter matches.");
      if (result.authError) setAuthError(true);
      if (result.needsProfile) setNeedsProfile(true);
      setProfileCompleteness(
        typeof result.profileCompleteness === "number"
          ? result.profileCompleteness
          : null,
      );
      setItems([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setItems(result.data.items || []);
    setHasMore(Boolean(result.data.hasMore));
    setPage(result.data.page || 1);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setLoading(true);
    setError(null);

    if (mode === "search") {
      const result = await searchUsersWithMatches(
        searchQuery.trim(),
        nextPage,
        PAGE_SIZE,
      );
      if (!result.ok) {
        setError(result.error || "Failed to load more results.");
        setLoading(false);
        return;
      }
      setItems((prev) => [...prev, ...(result.data.items || [])]);
      setHasMore(Boolean(result.data.hasMore));
      setPage(result.data.page || nextPage);
      setLoading(false);
      return;
    }

    if (mode === "filter") {
      const result = await filterMatches(filters, nextPage, PAGE_SIZE);
      if (!result.ok) {
        setError(result.error || "Failed to load more results.");
        setLoading(false);
        return;
      }
      setItems((prev) => [...prev, ...(result.data.items || [])]);
      setHasMore(Boolean(result.data.hasMore));
      setPage(result.data.page || nextPage);
      setLoading(false);
      return;
    }

    const result = await getMatchesFeed(nextPage, PAGE_SIZE);
    if (!result.ok) {
      setError(result.error || "Failed to load more results.");
      setLoading(false);
      return;
    }
    setItems((prev) => [...prev, ...(result.data.items || [])]);
    setHasMore(Boolean(result.data.hasMore));
    setPage(result.data.page || nextPage);
    setLoading(false);
  };

  const handleResetFilters = () => {
    setFilters({});
    if (mode === "filter") {
      setMode("feed");
      void loadInitial();
    }
  };

  // const handleCardClick = (item: MatchFeedItem) => {
  //   const source =
  //     mode === "search" ? "search" : mode === "filter" ? "filter" : "feed";

  //   void viewProfileEvent(item.profileId, source);

  //   if (typeof window !== "undefined") {
  //     window.location.href = `/feed/profile/${item.profileId}`;
  //   }
  // };

  const bestMatchSorted = useMemo(() => {
    const baseSorted = [...items].sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    });

    const viewerG = (viewerGender || "").toLowerCase().trim();
    if (!viewerG) {
      return baseSorted;
    }

    const preferredOpposite =
      viewerG === "male" ? "female" : viewerG === "female" ? "male" : "";

    if (!preferredOpposite) {
      return baseSorted;
    }

    const preferred: MatchFeedItem[] = [];
    const others: MatchFeedItem[] = [];

    for (const item of baseSorted) {
      const g = (item.gender || "").toLowerCase().trim();
      if (g === preferredOpposite) {
        preferred.push(item);
      } else {
        others.push(item);
      }
    }

    return [...preferred, ...others];
  }, [items, viewerGender]);

  const sortedItems = useMemo(() => {
    if (sortOption === "best_match") {
      return bestMatchSorted;
    }

    const withScores = [...items];
    if (sortOption === "most_viewed") {
      return withScores.sort(
        (a, b) => (b.viewsCount || 0) - (a.viewsCount || 0),
      );
    }

    if (sortOption === "most_saved") {
      const score = (entry: MatchFeedItem) =>
        (entry.likesCount || 0) + (entry.shortlistedCount || 0);
      return withScores.sort((a, b) => score(b) - score(a));
    }

    return withScores;
  }, [items, bestMatchSorted, sortOption]);

  if (authError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Login required
          </h1>
          <p className="text-sm text-rose-700 mb-4">
            Please login or register to view your personalised matrimony feed.
          </p>
          <Button
            size="md"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
          >
            Go to landing page
          </Button>
        </div>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Complete your profile
          </h1>
          {profileCompleteness !== null && (
            <p className="text-xs text-rose-500 mb-1">
              Your profile is currently {profileCompleteness}% complete.
            </p>
          )}
          <p className="text-sm text-rose-700 mb-4">
            To get the best matches, please complete your matrimony profile
            first.
          </p>
          <Button
            size="md"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/matrimonial-profile";
              }
            }}
          >
            Go to Matrimony dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderFeedCard = (item: MatchFeedItem) => {
    const source: MatchInteractionSource =
      mode === "search" ? "search" : mode === "filter" ? "filter" : "feed";

    return (
      <DashboardFeedCard
        key={item.id}
        item={item}
        source={source}
        onSkip={(id) => {
          setItems((prev) => prev.filter((match) => match.id !== id));
        }}
      />
    );
  };

  const sortLabels: Record<SortOption, string> = {
    best_match: "Best Match",
    most_viewed: "Most Viewed",
    most_saved: "Most Saved",
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption);
  };

  const handlePrevPage = () => {
    if (page <= 1 || loading) return;
    void fetchPageData(mode, page - 1);
  };

  const showEmptyState = !loading && !error && sortedItems.length === 0;

  return (
    <div className="bg-[#fdfafb] px-0 py-0 w-full overflow-x-hidden">
      <div className="mx-auto w-full min-w-0 flex flex-col lg:flex-row gap-4 max-w-[1440px] px-4 sm:px-6 lg:px-0">
        <aside className="hidden w-full max-w-[280px] mt-3 flex-col gap-6 lg:flex shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[#2b1d20]">Filters</h2>
            {/* <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#e07d8c] hover:text-pink-600"
            >
              Clear All
            </button> */}
          </div>

          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-5 pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-[#2b1d20]">
                Daily Recommendations
              </h1>
              <p className="text-sm text-[#8f787c]">
                Based on your partner preferences
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end lg:gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <span className="text-sm text-[#6e5a5d] font-medium">
                    Sort by:
                  </span>
                  <div className="relative min-w-0">
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="appearance-none bg-white border border-[#f0e4e7] text-[#2b1d20] text-sm font-medium rounded-lg pl-3 pr-8 py-2 focus:ring-[#e07d8c] focus:border-[#e07d8c] cursor-pointer shadow-sm max-w-full"
                    >
                      {(Object.keys(sortLabels) as SortOption[]).map(
                        (option) => (
                          <option key={option} value={option}>
                            {sortLabels[option]}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f0e4e7] px-4 py-2 text-xs font-semibold text-[#2b1d20] transition hover:bg-[#fff5f7] lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#e07d8c]" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {mode === "search" && (
            <p className="-mt-2 text-[11px] text-[#c27c8b]">
              Showing search results. Clear to return to your feed.
            </p>
          )}

          {loading && sortedItems.length === 0 && (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#f0e4e7] bg-white/70 text-sm text-[#6e5a5d]">
              Loading matches for you…
            </div>
          )}

          {error && !loading && sortedItems.length === 0 && (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-[#f0e4e7] bg-white px-4 text-center text-sm text-[#8f787c]">
              {error}
            </div>
          )}

          {showEmptyState && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#f0e4e7] bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-[#2b1d20]">
                No matches found right now
              </h3>
              <p className="mt-2 text-sm text-[#8f787c] max-w-md">
                Try widening your filters or updating your partner preferences
                in your matrimony dashboard to see more recommendations.
              </p>
              <button
                type="button"
                className="mt-4 rounded-full bg-[#2b1d20] px-5 py-2 text-sm font-semibold text-white"
                onClick={handleResetFilters}
              >
                Reset filters
              </button>
            </div>
          )}

          {!showEmptyState && sortedItems.length > 0 && (
            <>
              <div className="grid w-full min-w-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedItems.map((item) => renderFeedCard(item))}
              </div>

              <div className="flex flex-col items-center gap-4">
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg bg-[#e07d8c] px-6 py-2.5 text-sm font-bold text-[#2b1d20] shadow-sm transition hover:bg-[#d16b7a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load more"}
                  </button>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page <= 1 || loading}
                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#f0e4e7] text-[#8f787c] disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </button>
                  <span className="size-10 flex items-center justify-center rounded-lg bg-[#e07d8c] text-[#2b1d20] font-bold shadow-sm">
                    {page}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={!hasMore || loading}
                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#f0e4e7] text-[#8f787c] disabled:opacity-50"
                    aria-label="Next page"
                  >
                    <ChevronDown className="-rotate-90 h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-40 bg-black/30">
          <div
            className="absolute inset-0"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative z-10 flex h-full items-end justify-center px-0 sm:items-center sm:px-4">
            <div className="w-full sm:max-w-md">
              <div className="rounded-t-3xl sm:rounded-3xl border border-[#f0e4e7] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#f7f0f2] px-5 py-4">
                  <div>
                    <p className="text-xs font-bold text-[#2b1d20]">Filters</p>
                    <p className="text-[11px] text-[#8f787c]">
                      Refine your recommendations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full border border-[#f0e4e7] p-2 text-[#6e5a5d] hover:bg-[#fff5f7]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    onApply={() => {
                      handleApplyFilters();
                      setShowFilters(false);
                    }}
                    onReset={handleResetFilters}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
