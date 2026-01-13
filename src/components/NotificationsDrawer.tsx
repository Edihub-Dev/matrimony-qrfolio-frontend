import React, { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  Star,
  MessageCircle,
  Sparkles,
  X,
  CheckCircle,
  Eye,
  Menu,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "../lib/notificationsApi";
import {
  getInteractionAnalytics,
  type InteractionAnalyticsItem,
  type InteractionBucket,
} from "../lib/analyticsApi";
import { Button } from "./ui/Button";

const PAGE_SIZE = 20;

export type NotificationsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  fromAnalytics?: boolean;
};

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
  item: NotificationItem
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

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  fromAnalytics = false,
}) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const [bucket, setBucket] = useState<InteractionBucket>("viewed_me");
  const [interactionsOpen, setInteractionsOpen] = useState(false);
  const [analyticsItems, setAnalyticsItems] = useState<
    InteractionAnalyticsItem[]
  >([]);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [analyticsHasMore, setAnalyticsHasMore] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

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
    if (!isOpen) return;
    void loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onlyUnread]);

  const loadAnalyticsPage = async (
    targetBucket: InteractionBucket,
    pageToLoad: number,
    replace: boolean
  ) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const result = await getInteractionAnalytics(
        targetBucket,
        pageToLoad,
        10
      );
      if (!result.ok) {
        setAnalyticsError(result.error || "Failed to load analytics.");
        if (replace) {
          setAnalyticsItems([]);
          setAnalyticsHasMore(false);
          setAnalyticsPage(1);
        }
        return;
      }

      const data = result.data;
      if (replace) {
        setAnalyticsItems(data.items || []);
      } else {
        setAnalyticsItems((prev) => [...prev, ...(data.items || [])]);
      }
      setAnalyticsHasMore(Boolean(data.hasMore));
      setAnalyticsPage(data.page || pageToLoad);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !interactionsOpen) return;
    void loadAnalyticsPage(bucket, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bucket, interactionsOpen]);

  if (!isOpen) return null;

  const handleLoadMoreNotifications = () => {
    if (loading || !hasMore) return;
    void loadPage(page + 1, false);
  };

  const handleLoadMoreAnalytics = () => {
    if (analyticsLoading || !analyticsHasMore) return;
    void loadAnalyticsPage(bucket, analyticsPage + 1, false);
  };

  const handleMarkAllRead = async () => {
    if (markingAll || items.length === 0) return;
    setMarkingAll(true);
    try {
      await markNotificationsRead(undefined, true);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationsRead([item.id], false);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
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
      onClose();
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close notifications"
        className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-rose-100 bg-white/95 shadow-xl">
        <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-rose-100 bg-rose-50/70">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
              Notifications
            </p>
            <p className="text-xs font-semibold text-rose-900">
              Recent activity and who interacted with your matrimony profile
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fromAnalytics && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/analytics/interactions";
                  }
                }}
                className="hidden sm:inline-flex text-[10px] font-semibold text-rose-500 hover:text-rose-700 underline decoration-dotted"
              >
                Back to analytics page
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* Interactions trigger and section */}
          {/* <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
              Who interacted with your profile
            </p>
            <button
              type="button"
              onClick={() => setInteractionsOpen((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-sm hover:bg-rose-50"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          </div> */}

          {/* {interactionsOpen && (
            <div className="mb-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      id: "viewed_me" as InteractionBucket,
                      label: "Viewed",
                      icon: <Eye className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "liked_me" as InteractionBucket,
                      label: "Liked",
                      icon: <Heart className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "shortlisted_me" as InteractionBucket,
                      label: "Shortlisted",
                      icon: <Star className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "commented_me" as InteractionBucket,
                      label: "Comments",
                      icon: <MessageCircle className="h-3.5 w-3.5" />,
                    },
                  ] as const
                ).map((b) => {
                  const isActive = b.id === bucket;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBucket(b.id);
                      }}
                      className={
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition " +
                        (isActive
                          ? "border-transparent bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-sm shadow-rose-300"
                          : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50")
                      }
                    >
                      <span
                        className={
                          "inline-flex h-6 w-6 items-center justify-center rounded-full border " +
                          (isActive
                            ? "border-white/40 bg-white/10 text-white"
                            : "border-rose-200 bg-rose-50 text-rose-500")
                        }
                      >
                        {b.icon}
                      </span>
                      <span className="truncate">{b.label}</span>
                    </button>
                  );
                })}
              </div>

              {analyticsLoading &&
                analyticsItems.length === 0 &&
                !analyticsError && (
                  <div className="flex h-24 items-center justify-center">
                    <p className="text-sm text-rose-600">
                      Loading interactions…
                    </p>
                  </div>
                )}

              {analyticsError && (
                <div className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {analyticsError}
                </div>
              )}

              {!analyticsLoading &&
                !analyticsError &&
                analyticsItems.length === 0 && (
                  <p className="text-xs text-rose-700">
                    No recent interactions in this category yet.
                  </p>
                )}

              {analyticsItems.length > 0 && (
                <ul className="space-y-1.5">
                  {analyticsItems.map((item) => {
                    const lastTimestamp = formatTimestamp(
                      item.lastInteractionAt
                    );
                    const location = [item.city, item.state]
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <li key={item.profileId}>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              item.profileId &&
                              typeof window !== "undefined"
                            ) {
                              window.location.href = `/feed/profile/${item.profileId}`;
                              onClose();
                            }
                          }}
                          className="flex w-full items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 px-2.5 py-2 text-left transition hover:bg-rose-100"
                        >
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-rose-100 flex items-center justify-center text-[11px] font-semibold text-rose-700">
                            {item.profilePhotoUrl ? (
                              <img
                                src={item.profilePhotoUrl}
                                alt={item.displayName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {item.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[11px] font-semibold text-rose-900">
                                {item.displayName}
                              </p>
                              {lastTimestamp && (
                                <p className="shrink-0 text-[9px] text-rose-500">
                                  {lastTimestamp}
                                </p>
                              )}
                            </div>
                            {location && (
                              <p className="mt-0.5 truncate text-[10px] text-rose-700">
                                {location}
                              </p>
                            )}
                            <p className="mt-0.5 text-[10px] text-rose-600">
                              {item.interactionCount} interactions
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {analyticsHasMore && (
                <div className="mt-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={analyticsLoading}
                    onClick={handleLoadMoreAnalytics}
                    className="bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] px-2.5 py-1.5 h-auto text-rose-50 hover:bg-rose-600/90"
                  >
                    {analyticsLoading ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )} */}

          {/* <div className="mt-4 mb-2 h-px bg-rose-100" /> */}

          {/* Notifications list below the interactions section */}
          {/* {loading && items.length === 0 && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-rose-600">Loading notifications…</p>
            </div>
          )} */}

          {/* {error && !loading && items.length === 0 && (
            <div className="flex h-40 items-center justify-center text-center">
              <p className="text-sm text-rose-700 max-w-xs">{error}</p>
            </div>
          )} */}

          {!loading && !error && items.length === 0 && (
            <div className="flex h-40 items-center justify-center text-center">
              <div className="max-w-xs space-y-1.5">
                <p className="text-sm font-medium text-rose-900">
                  You're all caught up.
                </p>
                <p className="text-[11px] text-rose-700">
                  New likes, shortlists, comments, and matches will appear here.
                </p>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <ul className="space-y-1.5">
              {items.map((item) => {
                const meta = getNotificationMeta(item);
                const timestamp = formatTimestamp(item.createdAt);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={
                        "flex w-full items-start gap-3 rounded-2xl px-2.5 py-2 text-left transition " +
                        (item.read
                          ? "bg-white hover:bg-rose-50/80 border border-rose-50"
                          : "bg-rose-50/90 hover:bg-rose-100 border border-rose-100")
                      }
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={
                              "text-[11px] font-semibold " +
                              (item.read ? "text-rose-800" : "text-rose-900")
                            }
                          >
                            {meta.title}
                          </p>
                          {timestamp && (
                            <p className="text-[9px] text-rose-500 shrink-0">
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
          )}
        </div>

        <footer className="border-t border-rose-100 bg-white/90 px-3 py-2.5 flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={markingAll || unreadCount === 0}
            onClick={handleMarkAllRead}
            className="inline-flex items-center bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] px-2.5 py-1.5 h-auto"
          >
            <CheckCircle className="mr-1.5 h-3 w-3" />
            Mark all as read
          </Button>
          {hasMore && (
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={handleLoadMoreNotifications}
              className="bg-gradient-to-r from-rose-600 to-amber-500 text-rose-700 border border-rose-200 text-[10px] px-2.5 py-1.5 h-auto hover:bg-rose-50"
            >
              {loading ? "Loading…" : "Load more"}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOnlyUnread((prev) => !prev)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition " +
              (onlyUnread
                ? "border-rose-500 bg-rose-600 text-white shadow-sm shadow-rose-300 bg-gradient-to-r from-rose-600 to-amber-500"
                : "border-rose-200 text-black hover:bg-rose-50 bg-gradient-to-r from-rose-600 to-amber-500")
            }
          >
            <span
              className={
                "flex h-4 w-4 items-center justify-center rounded-full border text-[9px] " +
                (onlyUnread
                  ? "border-white/60 bg-rose-50  text-black "
                  : "border-rose-200 bg-rose-50 text-black")
              }
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span>Only unread</span>
          </button>
          {unreadCount > 0 && (
            <span className="inline-flex items-center bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] px-2.5 py-1.5 h-auto">
              {unreadCount} new
            </span>
          )}
        </footer>
      </aside>
    </div>
  );
};
