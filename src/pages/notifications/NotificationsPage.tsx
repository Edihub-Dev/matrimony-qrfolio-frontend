import React, { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  Star,
  MessageCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications/notificationsApi";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;

const formatTimestamp = (value: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationMeta = (
  item: NotificationItem,
): { title: string; body: string; icon: React.ReactNode } => {
  const actorNameRaw =
    (item.payload && (item.payload as any).actorName) || undefined;
  const actorName =
    typeof actorNameRaw === "string" && actorNameRaw.trim().length > 0
      ? actorNameRaw.trim()
      : "Someone";

  switch (item.type) {
    case "like":
      return {
        title: "New like",
        body: `${actorName} liked your matrimony profile.`,
        icon: <Heart className="h-4 w-4 text-rose-500" />,
      };
    case "shortlist":
      return {
        title: "Shortlisted",
        body: `${actorName} added you to their shortlist.`,
        icon: <Star className="h-4 w-4 text-amber-500" />,
      };
    case "comment": {
      const text = (item.payload && (item.payload as any).text) as
        | string
        | undefined;
      const base =
        typeof text === "string" && text.length > 0
          ? text.length > 80
            ? `${text.slice(0, 77)}...`
            : text
          : `${actorName} commented on your profile.`;
      return {
        title: "New comment",
        body: base,
        icon: <MessageCircle className="h-4 w-4 text-rose-500" />,
      };
    }
    case "mutual_match":
      return {
        title: "Mutual match",
        body: "You and another member like each other.",
        icon: <Sparkles className="h-4 w-4 text-rose-500" />,
      };
    default:
      return {
        title: "New activity",
        body: "You have a new interaction on your profile.",
        icon: <Bell className="h-4 w-4 text-rose-500" />,
      };
  }
};

const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadPage = async (pageToLoad: number, replace: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications(pageToLoad, PAGE_SIZE, onlyUnread);
      if (replace) {
        setItems(res.items || []);
      } else {
        setItems((prev) => [...prev, ...(res.items || [])]);
      }
      setHasMore(Boolean(res.hasMore));
      setPage(res.page || pageToLoad);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load notifications.";
      setError(message);
      if (replace) {
        setItems([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyUnread]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    void loadPage(page + 1, false);
  };

  const handleMarkAllRead = async () => {
    if (markingAll || items.length === 0) return;
    setMarkingAll(true);
    try {
      await markNotificationsRead(undefined, true);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // best-effort: toast layer already shows realtime updates
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationsRead([item.id], false);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
        );
      } catch {
        // ignore – user can still navigate
      }
    }

    const payloadActorProfileId =
      item.payload && typeof (item.payload as any).actorProfileId === "string"
        ? ((item.payload as any).actorProfileId as string)
        : null;

    const profileIdToOpen = payloadActorProfileId || item.targetProfileId;

    if (profileIdToOpen && typeof window !== "undefined") {
      window.location.href = `/feed/profile/${profileIdToOpen}`;
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100">
      <main className="py-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
                Notifications
              </p>
              <h1 className="mt-0.5 text-xl sm:text-2xl font-semibold text-rose-950">
                Your matrimony alerts
              </h1>
              <p className="mt-1 text-[11px] sm:text-xs text-rose-700 max-w-xl">
                See who has liked, shortlisted, commented on, or matched with
                your profile.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-1 mt-1 sm:mt-0 sm:items-end">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/analytics/interactions";
                  }
                }}
                className="self-end text-[10px] sm:text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline decoration-rose-300"
              >
                View analytics: Who interacted with me
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyUnread((prev) => !prev)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition " +
                    (onlyUnread
                      ? "border-rose-500 bg-rose-600 text-white shadow-sm shadow-rose-300"
                      : "border-rose-200 bg-white/80 text-rose-700 hover:bg-rose-50")
                  }
                >
                  <span
                    className={
                      "flex h-4 w-4 items-center justify-center rounded-full border text-[9px] " +
                      (onlyUnread
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-rose-200 bg-rose-50 text-rose-600")
                    }
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                  <span>Only unread</span>
                </button>
                <Button
                  type="button"
                  size="sm"
                  disabled={markingAll || unreadCount === 0}
                  onClick={handleMarkAllRead}
                  className="hidden sm:inline-flex bg-gradient-to-r from-rose-600 to-amber-500 text-[11px]"
                >
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Mark all as read
                </Button>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-rose-100 bg-white/90 p-3 sm:p-4 shadow-sm space-y-3">
            {loading && items.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-rose-600">Loading notifications…</p>
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
                    You&apos;re all caught up.
                  </p>
                  <p className="text-[11px] text-rose-700">
                    When someone likes, shortlists, comments on, or matches with
                    your profile, the alert will appear here.
                  </p>
                </div>
              </div>
            )}

            {items.length > 0 && (
              <>
                <ul className="divide-y divide-rose-50">
                  {items.map((item) => {
                    const meta = getNotificationMeta(item);
                    const timestamp = formatTimestamp(item.createdAt);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className={
                            "flex w-full items-start gap-3 px-1.5 py-2.5 text-left transition " +
                            (item.read
                              ? "bg-white hover:bg-rose-50/70"
                              : "bg-rose-50/80 hover:bg-rose-100")
                          }
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50">
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={
                                  "text-[11px] font-semibold " +
                                  (item.read
                                    ? "text-rose-800"
                                    : "text-rose-900")
                                }
                              >
                                {meta.title}
                              </p>
                              {timestamp && (
                                <p className="text-[10px] text-rose-500 shrink-0">
                                  {timestamp}
                                </p>
                              )}
                            </div>
                            <p className="mt-0.5 text-[10px] text-rose-700 line-clamp-2">
                              {meta.body}
                            </p>
                            {!item.read && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                New
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={markingAll || unreadCount === 0}
                    onClick={handleMarkAllRead}
                    className="inline-flex sm:hidden bg-gradient-to-r from-rose-600 to-amber-500 text-[11px]"
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Mark all as read
                  </Button>
                  <div className="flex-1" />
                  {hasMore && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={loading}
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-rose-600 to-amber-500 text-[11px]"
                    >
                      {loading ? "Loading more" : "Load more"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
