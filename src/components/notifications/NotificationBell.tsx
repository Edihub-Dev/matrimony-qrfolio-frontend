import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getSocket } from "@/lib/notifications/socket";
import { fetchNotifications } from "@/lib/notifications/notificationsApi";

export type NotificationBellProps = {
  onClick?: () => void;
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: number | undefined;

    const loadInitial = async () => {
      try {
        const res = await fetchNotifications(1, 10, false);
        if (!isMounted) return;
        setUnreadCount(res.unreadCount || 0);
      } catch {
        // best-effort; ignore errors
      }
    };

    void loadInitial();

    const socket = getSocket();
    if (!socket) {
      pollTimer = window.setInterval(() => {
        void (async () => {
          try {
            const res = await fetchNotifications(1, 10, false);
            if (!isMounted) return;
            setUnreadCount(res.unreadCount || 0);
          } catch {
            // best-effort
          }
        })();
      }, 5000);

      return () => {
        isMounted = false;
        if (pollTimer) {
          window.clearInterval(pollTimer);
        }
      };
    }

    const handleNew = (payload: any) => {
      if (!isMounted) return;
      if (payload && typeof payload.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      } else {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleRead = (payload: any) => {
      if (!isMounted) return;
      if (payload && typeof payload.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      }
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:read", handleRead);

    return () => {
      isMounted = false;
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
      socket.off("notification:new", handleNew);
      socket.off("notification:read", handleRead);
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = "/notifications";
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-rose-600 shadow-sm hover:bg-rose-50"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-0.5 text-[9px] font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};
