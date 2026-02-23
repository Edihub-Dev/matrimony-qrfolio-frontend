import React, { useEffect, useState } from "react";
import { DashboardFeedCard } from "@/components/matrimony/M-Feed-Profile-Card";
import type {
  InteractionAnalyticsItem,
  InteractionBucket,
} from "@/lib/feed/analyticsApi";
import { getInteractionAnalytics } from "@/lib/feed/analyticsApi";
import { Button } from "@/components/ui/Button";
import type { MatchInteractionSource } from "@/lib/feed/matchInteractions";

const BUCKETS: { id: InteractionBucket; label: string; description: string }[] =
  [
    {
      id: "viewed_me",
      label: "Viewed me",
      description: "Members who opened your matrimony profile recently.",
    },
    {
      id: "liked_me",
      label: "Liked me",
      description: "Members who have shown interest in your profile.",
    },
    {
      id: "shortlisted_me",
      label: "Shortlisted me",
      description: "Members who added you to their shortlist.",
    },
    {
      id: "commented_me",
      label: "Commented on me",
      description: "Members who left a comment on your profile.",
    },
  ];

const DEFAULT_LIMIT = 12;

export const InteractionAnalyticsPage: React.FC = () => {
  const cardSource: MatchInteractionSource = "feed";
  const [bucket, setBucket] = useState<InteractionBucket>("viewed_me");
  const [items, setItems] = useState<InteractionAnalyticsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (
    targetBucket: InteractionBucket,
    nextPage: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInteractionAnalytics(
        targetBucket,
        nextPage,
        DEFAULT_LIMIT,
      );
      if (!result.ok) {
        setError(result.error || "Failed to load analytics.");
        setItems([]);
        setHasMore(false);
        return;
      }

      const data = result.data;
      if (nextPage === 1) {
        setItems(data.items || []);
      } else {
        setItems((prev) => [...prev, ...(data.items || [])]);
      }
      setHasMore(Boolean(data.hasMore));
      setPage(data.page || nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On first mount, load default bucket
    void loadData(bucket, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBucketChange = (next: InteractionBucket) => {
    if (next === bucket) return;
    setBucket(next);
    setPage(1);
    setItems([]);
    void loadData(next, 1);
  };

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    void loadData(bucket, page + 1);
  };

  const activeBucketMeta = BUCKETS.find((b) => b.id === bucket) ?? BUCKETS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100">
      <main className="py-6 sm:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 space-y-5 sm:space-y-6">
          <header className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
              Analytics
            </p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-rose-950">
                  Who interacted with me
                </h1>
                <p className="text-[11px] sm:text-xs text-rose-700 max-w-2xl">
                  See members who have viewed, liked, shortlisted, or commented
                  on your matrimony profile. Blocked users and hidden profiles
                  are automatically excluded.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/feed?showNotifications=1";
                  }
                }}
                className="mt-1 sm:mt-0 text-[10px] sm:text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline decoration-rose-300 self-start sm:self-auto"
              >
                View recent notifications
              </button>
            </div>
          </header>

          <section className="rounded-3xl border border-rose-100 bg-white/90 p-2.5 sm:p-3 shadow-sm">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {BUCKETS.map((b) => {
                const isActive = b.id === bucket;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBucketChange(b.id)}
                    className={
                      "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold transition " +
                      (isActive
                        ? "bg-rose-600 text-white shadow-sm shadow-rose-300"
                        : "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100")
                    }
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-rose-600">
              {activeBucketMeta.description}
            </p>
          </section>

          <section className="space-y-4 sm:space-y-5">
            {loading && items.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-rose-600">Loading interactions…</p>
              </div>
            )}

            {error && !loading && items.length === 0 && (
              <div className="flex h-40 items-center justify-center text-center">
                <p className="text-sm text-rose-700 max-w-sm">{error}</p>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="flex h-40 items-center justify-center text-center">
                <div className="max-w-sm space-y-1.5">
                  <p className="text-sm font-medium text-rose-900">
                    No interactions yet.
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Once members start viewing, liking, shortlisting, or
                    commenting on your profile, you&apos;ll see them listed
                    here.
                  </p>
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <DashboardFeedCard
                      key={item.id}
                      item={item}
                      source={cardSource}
                      variant="compact"
                      className="max-w-[320px]"
                      onSkip={() => {}}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center pt-1">
                  {hasMore ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={loading}
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-rose-600 to-amber-500 text-xs"
                    >
                      {loading ? "Loading more" : "Load more"}
                    </Button>
                  ) : (
                    <p className="text-[11px] text-rose-600">
                      You have reached the end of this list.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default InteractionAnalyticsPage;
