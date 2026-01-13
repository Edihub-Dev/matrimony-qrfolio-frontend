import React, { useCallback, useEffect, useState } from "react";
import {
  MatrimonySidebar,
  type MatrimonyDashboardTab,
} from "../components/MatrimonySidebar";
import { MatrimonyDashboardOverview } from "../components/MatrimonyDashboardOverview";
import { MatrimonyOnboardingWizard } from "../components/MatrimonyOnboardingWizard";
import { MatrimonyGallerySection } from "../components/MatrimonyGallerySection";
import { MatrimonyFeedSection } from "../components/MatrimonyFeedSection";
import {
  getMatrimonyProfileByUserId,
  getMyMatrimonyProfile,
} from "../lib/matrimonyApi";
import { QR_BASE_API_URL } from "../lib/qrfolioApi";
import { MatrimonyQrCodeSection } from "./MatrimonyQrCodePage";
import {
  listBlockedUsers,
  unblockUser,
  type BlockedUserSummary,
} from "../lib/reportsApi";
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Heart,
  Info,
  MapPin,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { MatchCard } from "../components/MatchCard";
import {
  getLikedProfiles,
  getViewedProfiles,
  getShortlistedProfiles,
  type MatchFeedItem,
} from "../lib/matchesApi";
import { viewProfileEvent } from "../lib/matchInteractions";
import {
  getInteractionAnalytics,
  type InteractionAnalyticsItem,
  type InteractionBucket,
} from "../lib/analyticsApi";
import { MatrimonyDashboardTopBar } from "../components/MatrimonyDashboardTopBar";
import { NotificationsDrawer } from "../components/NotificationsDrawer";
import { PublicMatrimonyProfile } from "../components/PublicMatrimonyProfile";

const getInitialTabFromUrl = (): MatrimonyDashboardTab => {
  if (typeof window === "undefined") return "dashboard";

  try {
    const url = new URL(window.location.href);
    const tabParam = (url.searchParams.get("tab") || "").toLowerCase();

    const validTabs: MatrimonyDashboardTab[] = [
      "dashboard",
      "feed",
      "edit",
      "qrcode",
      "gallery",
      "public",
      "actions",
      "blocked",
      "admin",
    ];

    if (validTabs.includes(tabParam as MatrimonyDashboardTab)) {
      return tabParam as MatrimonyDashboardTab;
    }
  } catch {
    // ignore invalid URL
  }

  return "dashboard";
};

const TAB_LABELS: Record<MatrimonyDashboardTab, string> = {
  dashboard: "Dashboard Overview",
  feed: "Matrimony Feed",
  edit: "Edit Profile",
  qrcode: "My QR Code",
  gallery: "Gallery",
  public: "Public Profile",
  actions: "Activity & Likes",
  blocked: "Blocked Users",
  admin: "Admin",
};

const MatrimonyPublicProfileSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        if (!result.ok || !result.profile?.id) {
          if ((result as any).authError) {
            setError("Please login again to view your public matrimony page.");
          } else if ((result as any).notFound) {
            setError("Create your matrimony profile to publish a public page.");
          } else {
            setError(
              (result as any).error || "Failed to load your matrimony profile."
            );
          }
          setLoading(false);
          return;
        }

        setProfileId(result.profile.id);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load your matrimony profile.");
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-200">
          Loading your public matrimony page&hellip;
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-50">
          Public matrimony page
        </h2>
        <p className="text-sm text-rose-100">{error}</p>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/matrimonial-profile?tab=edit";
            }
          }}
          className="w-fit bg-[#f07f9c] text-[#2e1d22] hover:bg-[#e06886] px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          Create / Edit Profile
        </button>
      </div>
    );
  }

  if (profileId) {
    return (
      <div className="-mx-4 sm:mx-0">
        <PublicMatrimonyProfile profileId={profileId} mode="feed" />
      </div>
    );
  }

  return (
    <p className="text-sm text-rose-900">
      Unable to determine your public profile at the moment.
    </p>
  );
};

const ActivityAndLikesSection: React.FC = () => {
  const [likedItems, setLikedItems] = useState<MatchFeedItem[]>([]);
  const [viewedItems, setViewedItems] = useState<MatchFeedItem[]>([]);
  const [shortlistedItems, setShortlistedItems] = useState<MatchFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bucket, setBucket] = useState<InteractionBucket>("viewed_me");
  const [interactions, setInteractions] = useState<InteractionAnalyticsItem[]>(
    []
  );
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [interactionsError, setInteractionsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    const loadActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const [likedResult, viewedResult, shortlistedResult] =
          await Promise.all([
            getLikedProfiles(1, 24),
            getViewedProfiles(1, 24),
            getShortlistedProfiles(1, 24),
          ]);

        if (!isMounted) return;

        let nextError: string | null = null;

        if (!likedResult.ok) {
          nextError = likedResult.error || "Failed to load liked profiles.";
          setLikedItems([]);
        } else {
          setLikedItems(likedResult.data.items || []);
        }

        if (!viewedResult.ok) {
          if (!nextError) {
            nextError =
              viewedResult.error || "Failed to load recently viewed profiles.";
          }
          setViewedItems([]);
        } else {
          setViewedItems(viewedResult.data.items || []);
        }

        if (!shortlistedResult.ok) {
          if (!nextError) {
            nextError =
              shortlistedResult.error || "Failed to load shortlisted profiles.";
          }
          setShortlistedItems([]);
        } else {
          setShortlistedItems(shortlistedResult.data.items || []);
        }

        setError(nextError);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load your activity.");
        setLikedItems([]);
        setViewedItems([]);
        setShortlistedItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInteractions = async (targetBucket: InteractionBucket) => {
      setInteractionsLoading(true);
      setInteractionsError(null);
      try {
        const result = await getInteractionAnalytics(targetBucket, 1, 12);
        if (!isMounted) return;

        if (!result.ok) {
          setInteractionsError(result.error || "Failed to load interactions.");
          setInteractions([]);
          return;
        }

        setInteractions(result.data.items || []);
      } catch (err: any) {
        if (!isMounted) return;
        setInteractionsError(
          err?.message || "Failed to load interactions on your profile."
        );
        setInteractions([]);
      } finally {
        if (isMounted) {
          setInteractionsLoading(false);
        }
      }
    };

    void loadInteractions(bucket);

    return () => {
      isMounted = false;
    };
  }, [bucket]);

  const handleCardClick = (item: MatchFeedItem) => {
    void viewProfileEvent(item.profileId, "feed");
    if (typeof window !== "undefined") {
      window.location.href = `/feed/profile/${item.profileId}`;
    }
  };

  const ActivityProfileCard: React.FC<{ item: MatchFeedItem }> = ({ item }) => {
    const percentage = item.matchPercentage || 0;
    const clamped = Math.max(0, Math.min(100, percentage));

    const barClass =
      clamped >= 90
        ? "bg-green-500"
        : clamped >= 75
        ? "bg-amber-500"
        : "bg-rose-500";

    const badgeClass =
      clamped >= 90
        ? "bg-green-50 text-green-700 border-green-100"
        : clamped >= 75
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-rose-50 text-rose-700 border-rose-100";

    return (
      <button
        type="button"
        onClick={() => handleCardClick(item)}
        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-4 text-left shadow-sm transition hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#fceef2] flex items-center justify-center text-sm font-semibold text-[#9c6b79]">
            {item.profilePhotoUrl ? (
              <img
                src={item.profilePhotoUrl}
                alt={item.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{item.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-[#2e1d22]">
                {item.displayName}
              </p>
              {item.recommended && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-100">
                  <Heart className="h-3 w-3" />
                  Recommended
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-[#9c6b79] flex flex-wrap gap-x-2 gap-y-0.5">
              {item.age && <span>{item.age} yrs</span>}
              {item.height && <span>• {item.height}</span>}
              {item.religion && <span>• {item.religion}</span>}
              {item.caste && <span>• {item.caste}</span>}
              {item.motherTongue && <span>• {item.motherTongue}</span>}
            </p>

            {(item.city || item.state) && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-[#9c6b79]">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {[item.city, item.state].filter(Boolean).join(", ")}
                </span>
              </p>
            )}

            {(item.education || item.profession) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.education && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fceef2] px-2 py-0.5 text-[10px] font-bold text-[#9c6b79]">
                    <GraduationCap className="h-3 w-3" />
                    <span className="truncate max-w-[160px]">
                      {item.education}
                    </span>
                  </span>
                )}
                {item.profession && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fceef2] px-2 py-0.5 text-[10px] font-bold text-[#9c6b79]">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate max-w-[160px]">
                      {item.profession}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="ml-2 flex shrink-0 flex-col items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c98a9a]">
              Match
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}
            >
              {clamped}%
            </span>
            <div className="h-1.5 w-20 rounded-full bg-[#fceef2] overflow-hidden">
              <div
                className={`h-full rounded-full ${barClass}`}
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
        </div>
      </button>
    );
  };

  const BUCKET_LABELS: Record<InteractionBucket, string> = {
    viewed_me: "Viewed me",
    liked_me: "Liked me",
    shortlisted_me: "Who shortlisted me",
    commented_me: "Comments on me",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-[#2e1d22] tracking-tight">
          Activity & Likes
        </h2>
        <p className="text-[#9c6b79] max-w-3xl text-sm sm:text-base">
          Review profiles you have liked, shortlisted, viewed, and see who has
          interacted with your matrimony profile.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-rose-600">Loading your activity…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-[11px] text-[#9c6b79] shadow-sm">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        likedItems.length === 0 &&
        viewedItems.length === 0 &&
        shortlistedItems.length === 0 && (
          <div className="flex flex-col items-start justify-center gap-2 py-6">
            <p className="text-sm font-medium text-rose-900">
              No recent activity yet.
            </p>
            <p className="text-[11px] text-rose-700 max-w-md">
              Start browsing your matrimony feed and interacting with profiles.
              Profiles you like, shortlist, and view will appear here.
            </p>
          </div>
        )}

      {likedItems.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2e1d22]">
              Liked profiles{" "}
              <span className="text-[#c98a9a]">({likedItems.length})</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#9c6b79]">
              Profiles you have marked as interested from your matrimony feed.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {likedItems.map((item) => (
              <ActivityProfileCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {shortlistedItems.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2e1d22]">
              Shortlisted profiles{" "}
              <span className="text-[#c98a9a]">
                ({shortlistedItems.length})
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#9c6b79]">
              Profiles you have added to your shortlist.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {shortlistedItems.map((item) => (
              <ActivityProfileCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {viewedItems.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2e1d22]">
              Recently viewed profiles{" "}
              <span className="text-[#c98a9a]">({viewedItems.length})</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#9c6b79]">
              Profiles you recently visited from your matrimony feed.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {viewedItems.map((item) => (
              <ActivityProfileCard key={`viewed-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-rose-900">
              Who interacted with your profile
            </p>
            <p className="text-[11px] text-rose-700">
              Members who viewed, liked, shortlisted, or commented on your
              matrimony profile.
            </p>
          </div>
          {/* <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/analytics/interactions";
              }
            }}
            className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 underline decoration-rose-300"
          >
            Open full analytics
          </button> */}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BUCKET_LABELS) as InteractionBucket[]).map((id) => {
            const isActive = id === bucket;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setBucket(id)}
                className={
                  "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold transition " +
                  (isActive
                    ? "bg-rose-600 text-white shadow-sm shadow-rose-300"
                    : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50")
                }
              >
                {BUCKET_LABELS[id]}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {interactionsLoading && interactions.length === 0 && (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-rose-600">Loading interactions…</p>
            </div>
          )}

          {interactionsError &&
            !interactionsLoading &&
            interactions.length === 0 && (
              <div className="flex h-32 items-center justify-center text-center">
                <p className="text-sm text-rose-700 max-w-sm">
                  {interactionsError}
                </p>
              </div>
            )}

          {!interactionsLoading &&
            !interactionsError &&
            interactions.length === 0 && (
              <div className="flex h-32 items-center justify-center text-center">
                <p className="text-[11px] text-rose-700 max-w-sm">
                  No interactions in this category yet. Once members start
                  engaging with your profile, they&apos;ll appear here.
                </p>
              </div>
            )}

          {interactions.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {interactions.map((item) => (
                <MatchCard
                  key={item.id}
                  item={item}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BlockedUsersSection: React.FC = () => {
  const [items, setItems] = useState<BlockedUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [profileMetaById, setProfileMetaById] = useState<
    Record<
      string,
      { photoUrl?: string; profession?: string; fullName?: string }
    >
  >({});

  const normalizePhotoUrl = useCallback((value: unknown): string => {
    if (typeof value !== "string") return "";
    const raw = value.trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = (QR_BASE_API_URL || "").trim().replace(/\/$/, "");
    if (!base) return raw;
    if (raw.startsWith("/")) return `${base}${raw}`;
    return `${base}/${raw}`;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await listBlockedUsers();
        if (!isMounted) return;

        if (!result.ok) {
          setError(result.error || "Failed to load blocked users.");
          setItems([]);
          setLoading(false);
          return;
        }

        setItems(result.data.items || []);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load blocked users.");
        setItems([]);
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const ids = Array.from(
      new Set((items || []).map((item) => item.blockedUserId).filter(Boolean))
    );

    const missingIds = ids.filter((id) => !profileMetaById[id]);
    if (missingIds.length === 0) return;

    const loadProfiles = async () => {
      const results = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const res = await getMatrimonyProfileByUserId(id);
            if (!res.ok || !res.profile) {
              console.warn("BlockedUsersSection: profile lookup failed", {
                id,
                status: (res as any)?.status,
                notFound: Boolean((res as any)?.notFound),
                authError: Boolean((res as any)?.authError),
                error: (res as any)?.error,
                message: (res as any)?.message,
              });
              return { id, meta: {} as any };
            }

            const photos = (res.profile as any)?.photos as string[] | undefined;
            const first = Array.isArray(photos) ? photos[0] : "";
            const profilePhoto =
              typeof (res.profile as any)?.profilePhoto === "string"
                ? (res.profile as any).profilePhoto
                : "";

            const photoUrl = normalizePhotoUrl(first || profilePhoto);
            const profession = (res.profile as any)?.profession as
              | string
              | undefined;
            const fullName =
              ((res.profile as any)?.fullProfile as any)?.basicDetails
                ?.fullName ||
              ((res.profile as any)?.fullProfile as any)?.basic?.fullName;

            return {
              id,
              meta: {
                photoUrl: photoUrl || undefined,
                profession:
                  typeof profession === "string" ? profession : undefined,
                fullName: typeof fullName === "string" ? fullName : undefined,
              },
            };
          } catch {
            console.warn("BlockedUsersSection: profile lookup threw", { id });
            return { id, meta: {} as any };
          }
        })
      );

      if (!isMounted) return;

      setProfileMetaById((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r?.id) next[r.id] = r.meta || {};
        }
        return next;
      });
    };

    void loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [items, normalizePhotoUrl, profileMetaById]);

  const handleUnblock = async (blockedUserId: string) => {
    setError(null);
    setUnblockingId(blockedUserId);
    try {
      const result = await unblockUser(blockedUserId);
      if (!result.ok) {
        setError(result.error || "Failed to unblock user.");
        toast.error(result.error || "Failed to unblock user.");
        setUnblockingId(null);
        return;
      }
      setItems((prev) =>
        prev.filter((item) => item.blockedUserId !== blockedUserId)
      );
      toast.success("User unblocked.");
      setUnblockingId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to unblock user.");
      toast.error(err?.message || "Failed to unblock user.");
      setUnblockingId(null);
    }
  };

  const normalizedItems = items || [];
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = trimmedQuery
    ? normalizedItems.filter((item) => {
        const haystack = [
          item.fullName,
          item.email,
          item.phone,
          item.blockedUserId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(trimmedQuery);
      })
    : normalizedItems;

  const hasAnyBlocked = normalizedItems.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[#2e1d22] text-3xl font-black tracking-tight mb-2">
            Blocked Users
          </h1>
          <p className="text-[#9c6b79] text-base max-w-2xl">
            View and manage the list of profiles you have blocked. Blocked users
            cannot view your profile or contact you.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9c6b79]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#f2e6ea] rounded-lg text-sm text-[#2e1d22] placeholder:text-[#c98a9a] focus:ring-2 focus:ring-[#f07f9c]/50 focus:border-[#f07f9c] outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="bg-[#fff5f7] border border-[#f2e6ea] rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#f07f9c] mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#2e1d22]">About Unblocking</p>
          <p className="text-sm text-[#9c6b79] mt-1">
            Once you unblock a user, they will be able to see your profile in
            search results and may send you connection requests again.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-[#9c6b79]">Loading blocked users…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-[11px] text-[#9c6b79] shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && !hasAnyBlocked && (
        <div className="flex flex-col items-start justify-center gap-2 py-6">
          <p className="text-sm font-medium text-[#2e1d22]">
            You have not blocked any users yet.
          </p>
          <p className="text-[11px] text-[#9c6b79] max-w-md">
            When you block someone from their public matrimony profile, they
            will no longer appear in your feed here.
          </p>
        </div>
      )}

      {!loading && !error && hasAnyBlocked && filteredItems.length === 0 && (
        <div className="flex flex-col items-start justify-center gap-2 py-6">
          <p className="text-sm font-medium text-[#2e1d22]">
            No blocked users match your search.
          </p>
          <p className="text-[11px] text-[#9c6b79] max-w-md">
            Try searching with a different name, email, phone number or ID.
          </p>
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="bg-white border border-[#f2e6ea] rounded-2xl overflow-hidden shadow-sm">
          {filteredItems.map((item) => {
            const meta = profileMetaById[item.blockedUserId];

            const derivedFromEmail = (() => {
              const email = (item.email || "").trim();
              if (!email) return "";
              const local = email.split("@")[0] || "";
              const cleaned = local.replace(/[._-]+/g, " ").trim();
              if (!cleaned) return local.trim();
              return cleaned
                .split(/\s+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
            })();

            const displayName =
              (meta?.fullName || "").trim() ||
              (item.fullName || "").trim() ||
              derivedFromEmail ||
              (item.phone || "").trim() ||
              item.blockedUserId;

            const initial = (displayName || "U").trim().charAt(0).toUpperCase();

            const metaLine = [
              item.blockedUserId ? `ID: ${item.blockedUserId}` : "",
              item.email || item.phone
                ? [item.email, item.phone].filter(Boolean).join(" ")
                : "",
            ]
              .filter(Boolean)
              .join(" • ");

            return (
              <div
                key={item.blockedUserId}
                className="p-4 sm:p-6 border-b border-[#f2e6ea] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#fffafb] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-[#f2e6ea] flex items-center justify-center border border-[#f2e6ea] text-[#9c6b79] font-bold text-xl overflow-hidden">
                    {meta?.photoUrl ? (
                      <img
                        src={meta.photoUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setProfileMetaById((prev) => {
                            const current = prev[item.blockedUserId];
                            if (!current?.photoUrl) return prev;
                            return {
                              ...prev,
                              [item.blockedUserId]: {
                                ...current,
                                photoUrl: undefined,
                              },
                            };
                          });
                        }}
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2e1d22]">
                      {displayName}
                    </h3>
                    {metaLine && (
                      <div className="flex items-center gap-2 text-xs text-[#9c6b79] mt-1">
                        <span className="font-medium">{metaLine}</span>
                      </div>
                    )}
                    {item.blockedAt && (
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#fffafb] border border-[#f2e6ea] text-[11px] font-semibold text-[#9c6b79]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Blocked on{" "}
                        {new Date(item.blockedAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={unblockingId === item.blockedUserId}
                  onClick={() => handleUnblock(item.blockedUserId)}
                  className="shrink-0 px-5 py-2 rounded-lg border border-[#f2e6ea] bg-white text-[#2e1d22] font-bold text-sm hover:bg-[#f07f9c]/10 hover:border-[#f07f9c] hover:text-[#f07f9c] transition-all w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
                >
                  {unblockingId === item.blockedUserId
                    ? "Unblocking…"
                    : "Unblock"}
                </button>

                <div className="hidden">
                  <button
                    type="button"
                    disabled={unblockingId === item.blockedUserId}
                    onClick={() => handleUnblock(item.blockedUserId)}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {unblockingId === item.blockedUserId
                      ? "Unblocking…"
                      : "Unblock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && hasAnyBlocked && (
        <div className="text-center mt-8">
          <p className="text-sm text-[#9c6b79]">
            Showing {filteredItems.length} of {normalizedItems.length} blocked
            {normalizedItems.length === 1 ? " profile" : " profiles"}
          </p>
        </div>
      )}
    </div>
  );
};

const MatrimonialProfilePage: React.FC = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<MatrimonyDashboardTab>(() =>
    getInitialTabFromUrl()
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsFromAnalytics, setNotificationsFromAnalytics] =
    useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("qrAuthToken");
    if (!token) {
      window.location.replace("/");
      return;
    }
    setAuthChecked(true);
  }, []);

  const handleTabChange = (tab: MatrimonyDashboardTab) => {
    setActiveTab(tab);

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url.toString());
      } catch {
        // ignore history errors
      }
    }
  };

  const openNotifications = useCallback((fromAnalytics = false) => {
    setNotificationsFromAnalytics(fromAnalytics);
    setShowNotifications(true);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search || "");
      if (params.get("showNotifications") === "1") {
        openNotifications(true);
      }
    } catch {
      // ignore invalid params
    }
  }, [openNotifications]);

  if (!authChecked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fffafb] font-sans text-[#2e1d22]">
      <main className="py-0">
        <div className="w-auto px-0">
          <div className="grid gap-0 lg:grid-cols-[280px,1fr] items-start">
            <MatrimonySidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <section className="min-h-screen border-l border-[#f2e6ea] bg-[#fffafb] p-0 flex flex-col">
              <MatrimonyDashboardTopBar
                label={TAB_LABELS[activeTab] ?? "Matrimony"}
                onHomeClick={() => handleTabChange("feed")}
                onNotificationsClick={() => openNotifications(false)}
                showSearch={activeTab === "feed"}
              />

              <div className="p-5 sm:p-7 bg-[#fffafb]">
                <div className="mx-auto pb-7">
                  {activeTab === "dashboard" && (
                    <MatrimonyDashboardOverview
                      onEditProfile={() => {
                        handleTabChange("edit");
                      }}
                    />
                  )}
                  {activeTab === "feed" && <MatrimonyFeedSection />}
                  {activeTab === ("edit" as MatrimonyDashboardTab) && (
                    <>
                      <div className="flex flex-col gap-2 mb-8">
                        <h1 className="text-3xl font-bold text-[#2e1d22]">
                          Edit Your Profile
                        </h1>
                        <p className="text-[#9c6b79]">
                          Keep your profile updated to find the most compatible
                          matches.
                        </p>
                      </div>
                      <MatrimonyOnboardingWizard />
                    </>
                  )}
                  {activeTab === "qrcode" && <MatrimonyQrCodeSection />}
                  {activeTab === "gallery" && <MatrimonyGallerySection />}
                  {activeTab === "public" && <MatrimonyPublicProfileSection />}
                  {activeTab === "actions" && <ActivityAndLikesSection />}
                  {activeTab === "blocked" && <BlockedUsersSection />}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={closeNotifications}
        fromAnalytics={notificationsFromAnalytics}
      />
    </div>
  );
};

export default MatrimonialProfilePage;
