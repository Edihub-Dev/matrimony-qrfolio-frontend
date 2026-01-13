import React, { useMemo, useState } from "react";
import {
  MessageCircle,
  X,
  Heart,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import {
  likeProfileEvent,
  skipProfileEvent,
  shortlistProfileEvent,
  viewProfileEvent,
  commentProfileEvent,
} from "../lib/matchInteractions";
import {
  getProfileComments,
  type ProfileComment,
} from "../lib/interactionsApi";

const getProfileIdFromPath = (): string | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname || "";
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) return null;
  return segments[segments.length - 1] || null;
};

export const FeedProfileActionBar: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  const profileId = useMemo(() => getProfileIdFromPath(), []);

  const disabled = !profileId || isSubmitting;

  const handleSkip = async () => {
    if (!profileId) return;
    setIsSubmitting(true);
    try {
      await skipProfileEvent(profileId, "feed");
      if (typeof window !== "undefined") {
        window.location.href = "/matrimonial-profile?tab=feed";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterested = async () => {
    if (!profileId) return;
    setIsSubmitting(true);
    try {
      await likeProfileEvent(profileId, "feed", {
        origin: "profile_action_bar",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShortlist = async () => {
    if (!profileId) return;
    setIsSubmitting(true);
    try {
      await shortlistProfileEvent(profileId, "feed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewFullProfile = async () => {
    if (!profileId) return;
    setIsSubmitting(true);
    try {
      await viewProfileEvent(profileId, "feed");
      if (typeof window !== "undefined") {
        window.location.href = `/public-matrimony/${profileId}`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!profileId) return;
    const next = !isCommentOpen;
    setIsCommentOpen(next);
    if (next && !hasLoadedComments) {
      void loadComments();
    }
  };

  const handleSubmitComment = async () => {
    if (!profileId) return;
    const text = commentText.trim();
    if (!text) return;

    setIsSubmitting(true);
    try {
      await commentProfileEvent(profileId, "feed", text, {
        origin: "profile_action_bar",
      });
      setCommentText("");
      await loadComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadComments = async () => {
    if (!profileId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await getProfileComments(profileId, 1, 10);
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rose-100 bg-white/95 backdrop-blur shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
      {isCommentOpen && (
        <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-6">
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
                  if (isSubmitting) return;
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
                disabled={isSubmitting || !commentText.trim() || !profileId}
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
              {!commentsLoading && comments.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-rose-100 bg-white/80 px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
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
                          className="text-[10px] font-semibold text-rose-800 truncate hover:underline"
                        >
                          {comment.actorDisplayName || "Member"}
                        </button>
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
        </div>
      )}

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={handleComment}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Comment</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-3.5 w-3.5" />
            <span>Skip</span>
          </button>
          <button
            type="button"
            onClick={handleInterested}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Interested</span>
          </button>
          <button
            type="button"
            onClick={handleShortlist}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 shadow-sm hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Shortlist</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleViewFullProfile}
          disabled={disabled}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-transparent px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>View full profile</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
