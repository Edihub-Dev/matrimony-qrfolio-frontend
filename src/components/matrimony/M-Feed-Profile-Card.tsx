import React, { useState } from "react";
import {
  BookmarkPlus,
  Briefcase,
  CheckCircle2,
  Copy,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Star,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { MatchFeedItem } from "@/lib/feed/matchesApi";
import { getMatrimonyProfileById } from "@/lib/matrimony/matrimonyApi";
import {
  getProfileComments,
  type ProfileComment,
} from "@/lib/feed/interactionsApi";
import {
  commentProfileEvent,
  likeProfileEvent,
  shortlistProfileEvent,
  type MatchInteractionSource,
  viewProfileEvent,
} from "@/lib/feed/matchInteractions";

export type DashboardFeedCardProps = {
  item: MatchFeedItem;
  source: MatchInteractionSource;
  onSkip: (id: string) => void;
  variant?: "default" | "compact";
  className?: string;
};

type ContactDetails = {
  email?: string;
  phone?: string;
  alternatePhone?: string;
};

export const DashboardFeedCard: React.FC<DashboardFeedCardProps> = ({
  item,
  source,
  variant = "default",
  className,
  // onSkip,
}) => {
  const isCompact = variant === "compact";
  const hoverButtonsClass =
    "absolute right-3 " +
    (isCompact ? "bottom-20" : "bottom-24") +
    " hidden sm:flex flex-col gap-2 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0";
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
    null,
  );

  const disabled = isSubmitting;

  const percentage = Math.max(
    0,
    Math.min(100, Math.round(item.matchPercentage || 0)),
  );

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
          "This member hasn't shared contact details yet. Please try again later.",
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
    <div
      className={
        "group relative flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden border border-[#f5dfe3] bg-white shadow-sm " +
        (isCompact ? "rounded-2xl" : "rounded-3xl") +
        (className ? ` ${className}` : "")
      }
    >
      <div
        className={
          "relative overflow-hidden " +
          (isCompact
            ? "aspect-auto sm:aspect-[3/4]"
            : "aspect-auto sm:aspect-[4/5]")
        }
      >
        {item.profilePhotoUrl ? (
          <img
            src={item.profilePhotoUrl}
            alt={item.displayName}
            className="h-auto w-full object-contain transition duration-500 sm:h-full sm:object-cover sm:group-hover:scale-105"
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

        <div className={hoverButtonsClass}>
          <button
            type="button"
            onClick={handleShortlist}
            disabled={disabled}
            className={
              "flex items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50 " +
              (isCompact ? "h-8 w-8" : "h-10 w-10")
            }
            aria-label="Shortlist profile"
          >
            <BookmarkPlus className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
          </button>
          <button
            type="button"
            onClick={handleViewFullProfile}
            disabled={disabled}
            className={
              "flex items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50 " +
              (isCompact ? "h-8 w-8" : "h-10 w-10")
            }
            aria-label="View full profile"
          >
            <Eye className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3
            className={isCompact ? "text-base font-bold" : "text-xl font-bold"}
          >
            {item.displayName}
            {item.age ? `, ${item.age}` : ""}
          </h3>
          {showLocation && (
            <p
              className={
                "mt-1 flex items-center gap-1 text-white/90 " +
                (isCompact ? "text-xs" : "text-sm")
              }
            >
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
        </div>
      </div>

      <div
        className={
          "flex flex-1 flex-col " + (isCompact ? "gap-3 p-3" : "gap-4 p-4")
        }
      >
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

        <div
          className={
            "relative space-y-2 text-[#6e5a5d] " +
            (isCompact ? "pr-14 text-xs sm:pr-16" : "pr-16 text-sm sm:pr-20")
          }
        >
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
          <div className="absolute right-0 top-0 flex flex-col gap-2 sm:hidden">
            <button
              type="button"
              onClick={handleShortlist}
              disabled={disabled}
              className={
                "flex items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50 " +
                (isCompact ? "h-8 w-8" : "h-9 w-9")
              }
              aria-label="Shortlist profile"
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleViewFullProfile}
              disabled={disabled}
              className={
                "flex items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-black/5 hover:text-[#6e5a5d] disabled:cursor-not-allowed disabled:opacity-50 " +
                (isCompact ? "h-8 w-8" : "h-9 w-9")
              }
              aria-label="View full profile"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
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

        <div
          className={
            (isCompact ? "pt-2" : "pt-3") + " mt-1 border-t border-[#f7f0f2]"
          }
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleInterested}
              disabled={disabled}
              className={
                "w-full rounded-lg bg-[#e07d8c] hover:bg-[#d16b7a] text-[#2b1d20] font-bold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 " +
                (isCompact ? "py-2 text-xs" : "py-2.5 text-sm")
              }
            >
              Send Interest
            </button>
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={disabled}
              className={
                "w-full rounded-lg border-2 border-[#e07d8c] text-[#e07d8c] hover:bg-[#e07d8c]/10 font-bold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 " +
                (isCompact ? "py-2 text-xs" : "py-2.5 text-sm")
              }
            >
              Connect Now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenComment}
          disabled={disabled}
          className={
            "inline-flex items-center justify-center gap-2 rounded-xl border border-[#f5dfe3] font-semibold text-[#8f787c] hover:bg-[#fff5f7] disabled:cursor-not-allowed disabled:opacity-50 " +
            (isCompact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-[12px]")
          }
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
                            },
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
                              "",
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
                              "",
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
                              "Alternate phone",
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
