import React, { useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal,
  X,
  BookmarkPlus,
  MessageCircle,
  Eye,
  MapPin,
  Star,
  CheckCircle2,
  Ruler,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Mail,
  Phone,
  Copy,
} from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";
import {
  getMatchesFeed,
  filterMatches,
  searchUsersWithMatches,
  // getLikedProfiles,
  type MatchFeedItem,
  type FeedFilters,
  type MatchesApiResult,
  type MatchesFeedResponse,
} from "../lib/matchesApi";
import { getMatrimonyProfileById } from "../lib/matrimonyApi";
import {
  getProfileComments,
  type ProfileComment,
} from "../lib/interactionsApi";
import {
  viewProfileEvent,
  likeProfileEvent,
  // skipProfileEvent,
  shortlistProfileEvent,
  commentProfileEvent,
  type MatchInteractionSource,
} from "../lib/matchInteractions";

const PAGE_SIZE = 12;

type Mode = "feed" | "filter" | "search";
type SortOption = "best_match" | "most_viewed" | "most_saved";

type DashboardFeedCardProps = {
  item: MatchFeedItem;
  source: MatchInteractionSource;
  onSkip: (id: string) => void;
};

type ContactDetails = {
  email?: string;
  phone?: string;
  alternatePhone?: string;
};

const DashboardFeedCard: React.FC<DashboardFeedCardProps> = ({
  item,
  source,
  // onSkip,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(
    null
  );

  const disabled = isSubmitting;

  const percentage = Math.max(
    0,
    Math.min(100, Math.round(item.matchPercentage || 0))
  );

  // const handleSkip = async () => {
  //   if (disabled) return;
  //   setIsSubmitting(true);
  //   try {
  //     await skipProfileEvent(item.profileId, source);
  //     onSkip(item.id);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleInterested = async () => {
    if (disabled) return;
    setIsSubmitting(true);
    try {
      await likeProfileEvent(item.profileId, source, {
        origin: "dashboard_feed",
      });
      toast.success(`Interest sent to ${item.displayName}`);
    } catch (err: any) {
      console.error("Failed to send interest", err);
      toast.error("Could not send interest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeContactDetails = (profileData: any): ContactDetails => {
    if (!profileData) return {};
    const fullProfile = profileData.fullProfile || {};
    const contactBlock =
      fullProfile.contact ||
      profileData.contact ||
      (fullProfile.basicDetails && fullProfile.basicDetails.contact) ||
      {};

    const normalizeValue = (value: unknown) =>
      typeof value === "string"
        ? value.trim()
        : typeof value === "number"
        ? String(value)
        : "";

    return {
      email: normalizeValue(contactBlock.email),
      phone: normalizeValue(contactBlock.phone),
      alternatePhone: normalizeValue(contactBlock.alternatePhone),
    };
  };

  const fetchContactDetails = async () => {
    setContactLoading(true);
    setContactError(null);
    try {
      const result = await getMatrimonyProfileById(item.profileId);
      if (!result.ok || !result.profile) {
        const message =
          (result as any).message ||
          result.error ||
          "Unable to fetch contact details right now.";
        throw new Error(message);
      }

      const normalized = normalizeContactDetails(result.profile);
      const hasData =
        normalized.email || normalized.phone || normalized.alternatePhone;

      if (!hasData) {
        setContactError(
          "This member hasn't shared contact details yet. Please try again later."
        );
      }

      setContactDetails(normalized);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to fetch contact details right now.";
      setContactError(message);
      toast.error("Failed to load contact details.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleConnectClick = async () => {
    if (disabled) return;
    setContactSheetOpen(true);
    if (!contactDetails) {
      await fetchContactDetails();
    }
  };

  const closeContactSheet = () => {
    setContactSheetOpen(false);
  };

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error("Failed to copy contact detail", error);
      toast.error("Could not copy contact information.");
    }
  };

  const handleShortlist = async () => {
    if (disabled) return;
    setIsSubmitting(true);
    try {
      await shortlistProfileEvent(item.profileId, source);
      toast.success(`${item.displayName} added to shortlist`);
    } catch (err: any) {
      console.error("Failed to shortlist profile", err);
      toast.error("Could not shortlist this profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewFullProfile = async () => {
    if (disabled) return;
    setIsSubmitting(true);
    try {
      await viewProfileEvent(item.profileId, source);
      toast.success("Opening full profile…");
      if (typeof window !== "undefined") {
        window.location.href = `/feed/profile/${item.profileId}`;
      }
    } catch (err: any) {
      console.error("Failed to open profile", err);
      toast.error("Unable to open profile right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenComment = () => {
    if (disabled) return;
    const next = !isCommentOpen;
    setIsCommentOpen(next);
    if (next && !hasLoadedComments) {
      void loadComments();
    }
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || disabled) return;
    setIsSubmitting(true);
    try {
      await commentProfileEvent(item.profileId, source, text, {
        origin: "dashboard_feed",
      });
      toast.success("Comment sent to the family");
      setCommentText("");
      await loadComments();
    } catch (err: any) {
      console.error("Failed to send comment", err);
      toast.error("Could not send your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await getProfileComments(item.profileId, 1, 10);
      setComments(Array.isArray(result.items) ? result.items : []);
      setHasLoadedComments(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || null;
      setComments([]);
      setCommentsError(message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const showLocation = item.city || item.state;
  const location = [item.city, item.state].filter(Boolean).join(", ");
  const educationLine = item.education || "";
  const professionLine = item.profession || "";
  const communityLine = [item.religion, item.caste].filter(Boolean).join(", ");

  const matchBadge =
    percentage >= 90 ? (
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
        {percentage}% Match
      </span>
    ) : (
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-yellow-400" />
        {percentage}% Match
      </span>
    );

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#f5dfe3] bg-white shadow-sm">
      <div className="relative aspect-[4/5] overflow-hidden">
        {item.profilePhotoUrl ? (
          <img
            src={item.profilePhotoUrl}
            alt={item.displayName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-rose-50 text-5xl font-semibold text-rose-600">
            {item.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />

        {item.recommended && (
          <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2b1d20] shadow-sm">
            Recommended
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/20">
          {matchBadge}
        </div>

        {/* <div className="absolute right-3 bottom-3 flex flex-col gap-2 opacity-100 transition-all duration-300 sm:-right-4 sm:bottom-24 sm:translate-x-10 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleShortlist}
            disabled={disabled}
            className="h-10 w-10 rounded-full bg-white text-[#6e5a5d] shadow-lg hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="Shortlist"
          >
            <BookmarkPlus className="mx-auto h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleViewFullProfile}
            disabled={disabled}
            className="h-10 w-10 rounded-full bg-white text-[#6e5a5d] shadow-lg hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="View profile"
          >
            <Eye className="mx-auto h-5 w-5" />
          </button>
        </div> */}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold">
            {item.displayName}
            {item.age ? `, ${item.age}` : ""}
          </h3>
          {showLocation && (
            <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#8f787c]">
          {communityLine && (
            <span className="flex items-center gap-1 rounded-full bg-[#fff5f7] px-2 py-1">
              <Star className="h-3.5 w-3.5 text-[#d48493]" />
              {communityLine}
            </span>
          )}
          {item.motherTongue && (
            <span className="rounded-full bg-[#fff5f7] px-2 py-1">
              {item.motherTongue}
            </span>
          )}
        </div>

        <div className="relative space-y-2 pr-16 text-sm text-[#6e5a5d] sm:pr-20">
          <div className="space-y-2">
            {item.height && (
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1f4] text-[#c76e7d]">
                  <Ruler className="h-4 w-4" />
                </span>
                <span className="font-medium text-[#2b1d20]">
                  {item.height}
                </span>
              </div>
            )}
            {educationLine && (
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1f4] text-[#c76e7d]">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span>{educationLine}</span>
              </div>
            )}
            {professionLine && (
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1f4] text-[#c76e7d]">
                  <Briefcase className="h-4 w-4" />
                </span>
                <span>{professionLine}</span>
              </div>
            )}
          </div>
          <div className="absolute right-0 top-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleShortlist}
              disabled={disabled}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Shortlist profile"
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleViewFullProfile}
              disabled={disabled}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="View full profile"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {/* {communityLine && (
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1f4] text-[#c76e7d]">
                <Star className="h-4 w-4" />
              </span>
              <span>{communityLine}</span>
            </div>
          )} */}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8f787c]">
          {typeof item.viewsCount === "number" && item.viewsCount > 0 && (
            <span>{item.viewsCount} views</span>
          )}
          {typeof item.likesCount === "number" && item.likesCount > 0 && (
            <span>{item.likesCount} interested</span>
          )}
          {typeof item.shortlistedCount === "number" &&
            item.shortlistedCount > 0 && (
              <span>{item.shortlistedCount} shortlisted</span>
            )}
        </div>

        <div className="pt-3 mt-1 border-t border-[#f7f0f2]">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleInterested}
              disabled={disabled}
              className="w-full py-2.5 rounded-lg bg-[#e07d8c] hover:bg-[#d16b7a] text-[#2b1d20] font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Interest
            </button>
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={disabled}
              className="w-full py-2.5 rounded-lg border-2 border-[#e07d8c] text-[#e07d8c] hover:bg-[#e07d8c]/10 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Connect Now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenComment}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f5dfe3] px-3 py-2 text-[12px] font-semibold text-[#8f787c] hover:bg-[#fff5f7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" />
          Leave a comment
        </button>
      </div>

      {isCommentOpen && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
          <p className="text-[11px] font-semibold text-rose-700 mb-1.5">
            Comment for this profile
          </p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Write a short message that will be shared with the family"
            className="w-full resize-none rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (disabled) return;
                setIsCommentOpen(false);
                setCommentText("");
              }}
              className="text-[10px] font-semibold text-rose-500 hover:text-rose-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={disabled || !commentText.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Send comment</span>
            </button>
          </div>
          <div className="mt-2 border-t border-rose-100 pt-1.5 space-y-1.5">
            {commentsLoading && (
              <p className="text-[10px] text-rose-400">Loading comments…</p>
            )}
            {!commentsLoading && commentsError && (
              <p className="text-[10px] text-rose-400">
                {commentsError || "Couldn't load comments."}
              </p>
            )}
            {!commentsLoading && !commentsError && comments.length === 0 && (
              <p className="text-[10px] text-rose-300">
                No comments yet. Be the first to comment.
              </p>
            )}
            {!commentsLoading && !commentsError && comments.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-rose-100 bg-white/80 px-2.5 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MessageCircle className="h-3 w-3 text-rose-500 shrink-0" />
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !comment.actorProfileId ||
                              typeof window === "undefined"
                            ) {
                              return;
                            }
                            window.location.href = `/feed/profile/${comment.actorProfileId}`;
                          }}
                          className="text-[10px] font-semibold text-rose-800 truncate hover:underline text-left"
                        >
                          {comment.actorDisplayName || "Member"}
                        </button>
                      </div>
                      {comment.createdAt && (
                        <p className="text-[9px] text-rose-400 shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </p>
                      )}
                    </div>
                    {comment.text && (
                      <p className="mt-0.5 text-[10px] text-rose-700 whitespace-pre-line">
                        {comment.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {contactSheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 py-8 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeContactSheet}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-rose-50 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                  Connect with
                </p>
                <h3 className="text-base font-semibold text-[#2b1d20]">
                  {item.displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeContactSheet}
                className="rounded-full border border-rose-100 p-2 text-rose-500 hover:border-rose-200 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              {contactLoading && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-5 text-sm text-rose-800">
                  Fetching contact details…
                </div>
              )}
              {!contactLoading && contactError && (
                <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-5 text-sm text-rose-800">
                  <p>{contactError}</p>
                  <button
                    type="button"
                    onClick={fetchContactDetails}
                    className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                  >
                    Try again
                  </button>
                </div>
              )}
              {!contactLoading && !contactError && (
                <>
                  <p className="text-xs text-[#8f787c]">
                    Choose how you'd like to connect. Tap to launch your mail or
                    phone app, or copy the detail.
                  </p>
                  <div className="space-y-3">
                    {contactDetails?.email && (
                      <div className="flex items-center gap-3 rounded-2xl border border-rose-100 px-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                          <Mail className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                            Email
                          </p>
                          <a
                            href={`mailto:${contactDetails.email}`}
                            className="block text-sm font-semibold text-[#2b1d20] hover:underline break-all"
                          >
                            {contactDetails.email}
                          </a>
                          <p className="text-[11px] text-[#8f787c]">
                            Opens your default mail app
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(contactDetails.email!, "Email")
                          }
                          className="rounded-full border border-rose-100 p-2 text-rose-500 hover:border-rose-200 hover:text-rose-600"
                          aria-label="Copy email"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {contactDetails?.phone && (
                      <div className="flex items-center gap-3 rounded-2xl border border-rose-100 px-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                          <Phone className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                            Phone
                          </p>
                          <a
                            href={`tel:${contactDetails.phone.replace(
                              /\s+/g,
                              ""
                            )}`}
                            className="block text-sm font-semibold text-[#2b1d20] hover:underline break-all"
                          >
                            {contactDetails.phone}
                          </a>
                          <p className="text-[11px] text-[#8f787c]">
                            Opens your dialer to call
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(contactDetails.phone!, "Phone")
                          }
                          className="rounded-full border border-rose-100 p-2 text-rose-500 hover:border-rose-200 hover:text-rose-600"
                          aria-label="Copy phone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {contactDetails?.alternatePhone && (
                      <div className="flex items-center gap-3 rounded-2xl border border-rose-100 px-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                          <Phone className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                            Alternate phone
                          </p>
                          <a
                            href={`tel:${contactDetails.alternatePhone.replace(
                              /\s+/g,
                              ""
                            )}`}
                            className="block text-sm font-semibold text-[#2b1d20] hover:underline break-all"
                          >
                            {contactDetails.alternatePhone}
                          </a>
                          <p className="text-[11px] text-[#8f787c]">
                            Use if the primary number is busy
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              contactDetails.alternatePhone!,
                              "Alternate phone"
                            )
                          }
                          className="rounded-full border border-rose-100 p-2 text-rose-500 hover:border-rose-200 hover:text-rose-600"
                          aria-label="Copy alternate phone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {!contactDetails?.email &&
                      !contactDetails?.phone &&
                      !contactDetails?.alternatePhone && (
                        <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-5 text-center text-sm text-[#8f787c]">
                          No contact details are available yet for this member.
                        </div>
                      )}
                  </div>
                  <p className="text-[11px] text-[#b19599]">
                    Please use contact information respectfully. Report issues
                    to our support team if needed.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MatrimonyFeedSection: React.FC = () => {
  const [items, setItems] = useState<MatchFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(
    null
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
    options?: { queryOverride?: string }
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
        PAGE_SIZE
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
          : null
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
          : null
      );
      setViewerGender(
        typeof result.data.viewerGender === "string"
          ? result.data.viewerGender
          : null
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
        handler as EventListener
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
          : null
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
        PAGE_SIZE
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
        (a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)
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
    <div className="bg-[#fdfafb] px-0 py-0">
      <div className="mx-auto flex flex-col lg:flex-row gap-4 max-w-[1440px]">
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

        <div className="flex-1 flex flex-col gap-5 pb-8">
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6e5a5d] font-medium">
                    Sort by:
                  </span>
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="appearance-none bg-white border border-[#f0e4e7] text-[#2b1d20] text-sm font-medium rounded-lg pl-3 pr-8 py-2 focus:ring-[#e07d8c] focus:border-[#e07d8c] cursor-pointer shadow-sm"
                    >
                      {(Object.keys(sortLabels) as SortOption[]).map(
                        (option) => (
                          <option key={option} value={option}>
                            {sortLabels[option]}
                          </option>
                        )
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
