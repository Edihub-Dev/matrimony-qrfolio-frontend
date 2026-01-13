import React, { useEffect, useState, useCallback } from "react";
import { SwipeCard, type SwipeCardAction } from "../components/SwipeCard";
import { SwipeActionButtons } from "../components/SwipeActionButtons";
import { getMatchesFeed, type MatchFeedItem } from "../lib/matchesApi";
import {
  likeProfileEvent,
  skipProfileEvent,
  shortlistProfileEvent,
  viewProfileEvent,
} from "../lib/matchInteractions";

const PAGE_SIZE = 10;

export const SwipeFeedPage: React.FC = () => {
  const [items, setItems] = useState<MatchFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  const loadPage = useCallback(async (pageToLoad: number, append: boolean) => {
    setLoading(true);
    const result = await getMatchesFeed(pageToLoad, PAGE_SIZE);
    if (!result.ok) {
      if (result.authError) setAuthError(true);
      if (result.needsProfile) setNeedsProfile(true);
      setLoading(false);
      return;
    }
    const newItems = result.data.items || [];
    setItems((prev) => (append ? [...prev, ...newItems] : newItems));
    setHasMore(Boolean(result.data.hasMore));
    setPage(result.data.page || pageToLoad);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    if (items.length - index <= 3 && hasMore && !loading) {
      void loadPage(page + 1, true);
    }
  }, [items.length, index, hasMore, loading, page, loadPage]);

  const handleAction = async (action: SwipeCardAction) => {
    const current = items[index];
    if (!current) return;

    if (action === "view") {
      await viewProfileEvent(current.profileId, "swipe");
      if (typeof window !== "undefined") {
        window.location.href = `/feed/profile/${current.profileId}`;
      }
      return;
    }

    if (action === "shortlist") {
      await shortlistProfileEvent(current.profileId, "swipe");
    }

    if (action === "like" || action === "skip") {
      if (action === "like") {
        await likeProfileEvent(current.profileId, "swipe");
      } else {
        await skipProfileEvent(current.profileId, "swipe");
      }
    }

    setIndex((prev) => Math.min(prev + 1, items.length));
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100 px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Login required
          </h1>
          <p className="text-sm text-rose-700 mb-4">
            Please login or register to view your personalised swipe feed.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/70 hover:bg-rose-500"
          >
            Go to landing page
          </button>
        </div>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100 px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Complete your profile
          </h1>
          <p className="text-sm text-rose-700 mb-4">
            To get the best matches, please complete your matrimony profile
            first.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/matrimonial-profile";
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/70 hover:bg-rose-500"
          >
            Go to Matrimony dashboard
          </button>
        </div>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100 flex flex-col">
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
            Swipe feed
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-rose-950">
            One match at a time
          </h1>
          <p className="mt-1 text-[11px] sm:text-xs text-rose-700 max-w-md">
            Swipe right if you are interested, left to pass. Double-tap the card
            to like quickly.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-[11px] text-rose-500">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/matrimonial-profile?tab=feed";
              }
            }}
            className="text-rose-600 font-semibold hover:text-rose-700"
          >
            Switch to browse view
          </button>
          <span>
            {index + 1} / {Math.max(items.length, index + 1)}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        {loading && !current && (
          <p className="text-sm text-rose-600">Loading matches for you...</p>
        )}
        {!loading && !current && (
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-rose-900">
              No more matches at the moment.
            </p>
            <p className="text-[11px] text-rose-700 max-w-xs mx-auto">
              You have viewed all available profiles in your feed. Check back
              later or adjust your filters in browse view.
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/feed";
                }
              }}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/70 hover:bg-rose-500"
            >
              Go to browse feed
            </button>
          </div>
        )}
        {current && <SwipeCard item={current} onAction={handleAction} />}
      </main>

      {current && <SwipeActionButtons onAction={handleAction} />}
    </div>
  );
};

export default SwipeFeedPage;
