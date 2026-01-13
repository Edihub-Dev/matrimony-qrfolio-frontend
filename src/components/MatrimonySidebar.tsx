import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  QrCode,
  Image,
  ArrowLeft,
  Menu,
  Edit3,
  Heart,
  Shield,
  Newspaper,
  Globe,
  Ban,
} from "lucide-react";

export type MatrimonyDashboardTab =
  | "feed"
  | "dashboard"
  | "edit"
  | "qrcode"
  | "gallery"
  | "public"
  | "actions"
  | "blocked"
  | "admin";

type MatrimonySidebarProps = {
  activeTab: MatrimonyDashboardTab;
  onTabChange: (tab: MatrimonyDashboardTab) => void;
  qrFolioUrl?: string;
};

const navItems: Array<{
  id: MatrimonyDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "feed", label: "Matrimony Feed", icon: Newspaper },
  { id: "edit", label: "Edit Profile", icon: Edit3 },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "qrcode", label: "My QR Code", icon: QrCode },
  { id: "public", label: "Public Profile", icon: Globe },
  { id: "blocked", label: "Blocked Users", icon: Ban },
  { id: "actions", label: "Activity & Likes", icon: Heart },
  { id: "admin", label: "Admin", icon: Shield },
];

export const MatrimonySidebar: React.FC<MatrimonySidebarProps> = ({
  activeTab,
  onTabChange,
  qrFolioUrl,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    const syncFromStorage = () => {
      if (typeof window === "undefined") return;
      try {
        const name = window.localStorage.getItem("qrName") || "";
        const email = window.localStorage.getItem("qrEmail") || "";
        const photo = window.localStorage.getItem("qrMatrimonyPhoto") || "";
        const token = window.localStorage.getItem("qrAuthToken") || "";

        setUserName(name);
        setUserEmail(email);
        setUserPhoto(photo);

        if (token) {
          const parts = token.split(".");
          if (parts.length >= 2) {
            try {
              const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
              const payloadJson = atob(base64);
              const payload: any = JSON.parse(payloadJson);

              let nextIsAdmin = false;

              if (Array.isArray(payload.roles)) {
                nextIsAdmin =
                  payload.roles.includes("admin") ||
                  payload.roles.includes("superadmin");
              } else if (typeof payload.role === "string") {
                const role = payload.role.toLowerCase();
                nextIsAdmin = role === "admin" || role === "superadmin";
              } else if (typeof payload.isAdmin === "boolean") {
                nextIsAdmin = payload.isAdmin;
              }

              setIsAdmin(Boolean(nextIsAdmin));
            } catch {
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch {
        // ignore
      }
    };

    handleResize();
    syncFromStorage();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("qrMatrimonyPhotoUpdated", syncFromStorage as any);
    window.addEventListener("qrProfileNameUpdated", syncFromStorage as any);
    window.addEventListener("qrProfileEmailUpdated", syncFromStorage as any);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "qrMatrimonyPhotoUpdated",
        syncFromStorage as any
      );
      window.removeEventListener(
        "qrProfileNameUpdated",
        syncFromStorage as any
      );
      window.removeEventListener(
        "qrProfileEmailUpdated",
        syncFromStorage as any
      );
    };
  }, []);

  const initials = (userName || userEmail || "M")
    .trim()
    .charAt(0)
    .toUpperCase();

  const sidebar = (
    <div className="h-full w-[280px] flex flex-col border-r border-[#e6e2de] bg-white text-[#171411] overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#f8eef2]">
        <div className="flex items-center justify-center size-10 rounded-full bg-[#ec5e87]/20 text-[#ec5e87]">
          <img
            src="/assets/M-Logo.png"
            alt="Matrimony QRfolio"
            className="h-6 w-6 object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-1xl font-bold tracking-tight text-[#171411]">
          Matrimony QRfolio
        </h2>
      </div>

      {(userName || userEmail) && (
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fffafb]">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 overflow-hidden bg-[#fceef2] flex items-center justify-center">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName || "Profile photo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-[#9c6b79]">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-[#2e1d22] text-base font-bold leading-tight truncate">
                {userName || "Matrimony user"}
              </h1>
              <p className="text-[#9c6b79] text-xs font-medium truncate">
                {userEmail || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="px-4 py-2 space-y-1">
        {navItems
          .filter((item) => (item.id === "admin" ? isAdmin : true))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "admin") {
                    if (typeof window !== "undefined") {
                      window.location.href = "/admin/users";
                    }
                    if (isMobile) {
                      setIsOpen(false);
                    }
                    return;
                  }

                  onTabChange(item.id);
                  if (isMobile) {
                    setIsOpen(false);
                  }
                }}
                className={
                  "flex w-full items-center gap-3 px-3 py-3 rounded-lg transition-colors " +
                  (isActive
                    ? "bg-[#ec5e87]/10 text-[#d6456b]"
                    : "hover:bg-[#fff0f5] text-[#5c5046]")
                }
              >
                <Icon
                  className={
                    "w-4 h-4 " +
                    (isActive ? "text-[#ec5e87]" : "text-[#877564]")
                  }
                />
                <span
                  className={
                    "text-sm " +
                    (isActive ? "font-bold text-[#171411]" : "font-medium")
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
      </nav>
      <div className={"p-4 pb-6 border-t space-y-3 " + "border-[#f2e6ea]"}>
        {qrFolioUrl && (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = qrFolioUrl;
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to QR Folio</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-full bg-rose-200 p-2 text-rose-800 shadow-lg shadow-rose-200 lg:hidden transition-transform duration-150 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {isMobile ? (
        <div
          className={`fixed inset-0 z-30 flex transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      ) : (
        <div className="hidden lg:block h-screen sticky top-0">{sidebar}</div>
      )}
    </>
  );
};
