import React, { useEffect, useState } from "react";
import { Heart, Star, MessageCircle, Sparkles } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { getSocket } from "@/lib/notifications/socket";

export type RealtimeToastNotification = {
  id: string;
  type: "like" | "shortlist" | "comment" | "mutual_match";
  targetProfileId?: string | null;
  actorProfileId?: string | null;
  payload?: any;
};

const getMessageForNotification = (
  n: RealtimeToastNotification,
): { icon: React.ReactNode; title: string; body: string } => {
  const actorNameRaw = n.payload?.actorName;
  const actorName =
    typeof actorNameRaw === "string" && actorNameRaw.trim().length > 0
      ? actorNameRaw.trim()
      : "Someone";

  switch (n.type) {
    case "like":
      return {
        icon: <Heart className="h-4 w-4 text-rose-500" />,
        title: "New like",
        body: `${actorName} liked your matrimony profile.`,
      };
    case "shortlist":
      return {
        icon: <Star className="h-4 w-4 text-amber-500" />,
        title: "Shortlisted",
        body: `${actorName} added your profile to their shortlist.`,
      };
    case "comment":
      return {
        icon: <MessageCircle className="h-4 w-4 text-rose-500" />,
        title: "New comment",
        body:
          typeof n.payload?.text === "string" && n.payload.text.length > 0
            ? n.payload.text.length > 80
              ? `${n.payload.text.slice(0, 77)}...`
              : n.payload.text
            : `${actorName} left a comment on your profile.`,
      };
    case "mutual_match":
      return {
        icon: <Sparkles className="h-4 w-4 text-rose-500" />,
        title: "Mutual match",
        body: "You and another member like each other.",
      };
    default:
      return {
        icon: <Heart className="h-4 w-4 text-rose-500" />,
        title: "New activity",
        body: "You have a new interaction on your profile.",
      };
  }
};

export const RealtimeToast: React.FC = () => {
  const [current, setCurrent] = useState<RealtimeToastNotification | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    let hideTimer: number | undefined;

    const handleNew = (payload: any) => {
      if (!payload || !payload.type || !payload.id) return;
      const rawPayload = payload.payload || null;
      const n: RealtimeToastNotification = {
        id: String(payload.id),
        type: payload.type,
        targetProfileId: payload.targetProfileId || null,
        actorProfileId:
          rawPayload && typeof rawPayload.actorProfileId === "string"
            ? (rawPayload.actorProfileId as string)
            : null,
        payload: rawPayload,
      };
      setCurrent(n);
      setVisible(true);
      const message = getMessageForNotification(n);
      toast(`${message.title} – ${message.body}`);

      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    socket.on("notification:new", handleNew);

    return () => {
      socket.off("notification:new", handleNew);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  const handleClick = () => {
    if (!current) return;
    const profileIdToOpen = current.actorProfileId || current.targetProfileId;
    if (!profileIdToOpen) return;
    if (typeof window === "undefined") return;
    window.location.href = `/feed/profile/${profileIdToOpen}`;
  };

  const message =
    current && visible ? getMessageForNotification(current) : null;

  return (
    <>
      <Toaster position="top-right" />
      {current && visible && message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div
            className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-2xl border border-rose-100 bg-white/95 px-3 py-2 shadow-lg shadow-rose-200/70"
            onClick={handleClick}
          >
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-50">
              {message.icon}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-rose-900">
                {message.title}
              </p>
              <p className="mt-0.5 text-[10px] text-rose-600">{message.body}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
