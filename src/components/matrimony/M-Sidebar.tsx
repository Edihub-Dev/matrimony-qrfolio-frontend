import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { cn } from "../../lib/core/utils";
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
  const [kycStatus, setKycStatus] = useState("");
  const adminProbeTokenRef = useRef<string | null>(null);
  const profilePhotoTokenRef = useRef<string | null>(null);
  const profilePhotoRequestRef = useRef<Promise<void> | null>(null);

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
        const kyc = window.localStorage.getItem("qrKycStatus") || "";
        const storedIsAdmin = window.localStorage.getItem("qrIsAdmin");

        setUserName(name);
        setUserEmail(email);
        setUserPhoto(photo);
        setKycStatus(kyc);

        // If user is logged in but photo is missing from localStorage (common after logout/refresh),
        // re-hydrate it from the backend profile.
        if (
          token &&
          (!photo || !kyc) &&
          profilePhotoTokenRef.current !== token &&
          !profilePhotoRequestRef.current
        ) {
          profilePhotoRequestRef.current = axios
            .get("/api/matrimony/profile/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((res) => {
              if (typeof window === "undefined") return;
              const profile = res?.data?.profile;
              const full = (profile && profile.fullProfile) || {};

              let nextPhoto =
                typeof full.profilePhoto === "string" &&
                full.profilePhoto.trim()
                  ? full.profilePhoto.trim()
                  : "";

              if (!nextPhoto && Array.isArray(full.gallery)) {
                const primary = full.gallery.find(
                  (p: any) =>
                    p && (p.isProfilePhoto === true || p.isProfilePhoto),
                );
                const fallback =
                  primary ||
                  full.gallery.find((p: any) => p && (p.url || p.src));
                if (fallback && (fallback.url || fallback.src)) {
                  nextPhoto = String(fallback.url || fallback.src);
                }
              }

              if (nextPhoto) {
                const current =
                  window.localStorage.getItem("qrMatrimonyPhoto") || "";
                if (current !== nextPhoto) {
                  window.localStorage.setItem("qrMatrimonyPhoto", nextPhoto);
                  window.dispatchEvent(new Event("qrMatrimonyPhotoUpdated"));
                }
              }

              const nextKycStatus = (() => {
                const direct =
                  typeof profile?.kycStatus === "string" ? profile.kycStatus : "";
                if (direct) return direct;
                const nested =
                  typeof (profile as any)?.kyc?.status === "string"
                    ? (profile as any).kyc.status
                    : "";
                if (nested) return nested;
                const fullNested =
                  typeof (full as any)?.kyc?.status === "string"
                    ? (full as any).kyc.status
                    : "";
                return fullNested;
              })();

              if (nextKycStatus) {
                const normalized = String(nextKycStatus)
                  .toUpperCase()
                  .trim();
                const current = window.localStorage.getItem("qrKycStatus") || "";
                if (current !== normalized) {
                  window.localStorage.setItem("qrKycStatus", normalized);
                  window.dispatchEvent(new Event("qrKycStatusUpdated"));
                }
              }
            })
            .catch(() => {
              // ignore
            })
            .finally(() => {
              profilePhotoTokenRef.current = token;
              profilePhotoRequestRef.current = null;
            });
        }

        const storedAdminBool =
          typeof storedIsAdmin === "string"
            ? storedIsAdmin.toLowerCase() === "true"
            : false;

        if (
          token &&
          storedIsAdmin === null &&
          adminProbeTokenRef.current !== token
        ) {
          adminProbeTokenRef.current = token;
          axios
            .get("/api/admin/users", {
              params: { page: 1, limit: 1 },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(() => {
              if (typeof window === "undefined") return;
              window.localStorage.setItem("qrIsAdmin", "true");
              window.dispatchEvent(new Event("qrAdminUpdated"));
            })
            .catch((error: any) => {
              const status = error?.response?.status;
              if (status === 401 || status === 403) {
                if (typeof window === "undefined") return;
                window.localStorage.setItem("qrIsAdmin", "false");
                window.dispatchEvent(new Event("qrAdminUpdated"));
              }
            });
        }

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

              if (!nextIsAdmin && storedAdminBool) {
                nextIsAdmin = true;
              }

              setIsAdmin(Boolean(nextIsAdmin));
            } catch {
              setIsAdmin(storedAdminBool);
            }
          } else {
            setIsAdmin(storedAdminBool);
          }
        } else {
          setIsAdmin(storedAdminBool);
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
    window.addEventListener("qrKycStatusUpdated", syncFromStorage as any);
    window.addEventListener("qrAdminUpdated", syncFromStorage as any);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "qrMatrimonyPhotoUpdated",
        syncFromStorage as any,
      );
      window.removeEventListener(
        "qrProfileNameUpdated",
        syncFromStorage as any,
      );
      window.removeEventListener(
        "qrProfileEmailUpdated",
        syncFromStorage as any,
      );
      window.removeEventListener("qrKycStatusUpdated", syncFromStorage as any);
      window.removeEventListener("qrAdminUpdated", syncFromStorage as any);
    };
  }, []);

  const initials = (userName || userEmail || "M")
    .trim()
    .charAt(0)
    .toUpperCase();

  const sidebar = (
    <div className={cn('h-full', 'w-[280px]', 'flex', 'flex-col', 'border-r', 'border-[#e6e2de]', 'bg-white', 'text-[#171411]', 'overflow-y-auto')}>
      <div className={cn('flex', 'items-center', 'gap-3', 'px-6', 'py-6', 'border-b', 'border-[#f8eef2]')}>
        <div className={cn('flex', 'items-center', 'justify-center', 'size-10', 'rounded-full', 'bg-[#ec5e87]/20', 'text-[#ec5e87]')}>
          <img
            src="/assets/M-Logo.png"
            alt="Matrimony QRfolio"
            className={cn('h-6', 'w-6', 'object-contain')}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className={cn('text-1xl', 'font-bold', 'tracking-tight', 'text-[#171411]')}>
          Matrimony QRfolio
        </h2>
      </div>

      {(userName || userEmail) && (
        <div className={cn('px-4', 'py-6')}>
          <div className={cn('flex', 'items-center', 'gap-3', 'p-3', 'rounded-xl', 'bg-[#fffafb]')}>
            <div className={cn('bg-center', 'bg-no-repeat', 'aspect-square', 'bg-cover', 'rounded-full', 'size-12', 'overflow-hidden', 'bg-[#fceef2]', 'flex', 'items-center', 'justify-center')}>
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName || "Profile photo"}
                  className={cn('h-full', 'w-full', 'object-cover', 'rounded-full')}
                />
              ) : (
                <span className={cn('text-sm', 'font-semibold', 'text-[#9c6b79]')}>
                  {initials}
                </span>
              )}
            </div>
            <div className={cn('flex', 'flex-col', 'overflow-hidden')}>
              <div className={cn('flex', 'items-center', 'gap-2')}>
                <h1 className={cn('text-[#2e1d22]', 'text-base', 'font-bold', 'leading-tight', 'truncate')}>
                  {userName || "Matrimony user"}
                </h1>
                {String(kycStatus || "NOT_VERIFIED").toUpperCase() ===
                "VERIFIED" ? (
                  <RiVerifiedBadgeFill className={cn('shrink-0', 'text-rose-600')} />
                ) : null}
              </div>
              <p className={cn('text-[#9c6b79]', 'text-xs', 'font-medium', 'truncate')}>
                {userEmail || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className={cn('px-4', 'py-2', 'space-y-1')}>
        {navItems
          .filter((item) => (item.id === 'admin' ? isAdmin : true))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'admin') {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/users';
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
                  'flex w-full items-center gap-3 px-3 py-3 rounded-lg transition-colors ' +
                  (isActive
                    ? 'bg-[#ec5e87]/10 text-[#d6456b]'
                    : 'hover:bg-[#fff0f5] text-[#5c5046]')
                }
              >
                <Icon
                  className={
                    'w-4 h-4 ' +
                    (isActive ? 'text-[#ec5e87]' : 'text-[#877564]')
                  }
                />
                <span
                  className={
                    'text-sm ' +
                    (isActive
                      ? 'font-bold text-[#171411]'
                      : 'font-medium')
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
      </nav>

      <div className={cn('p-4', 'pb-6', 'border-t', 'space-y-3', 'border-[#f2e6ea]')}>
        {qrFolioUrl && (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = qrFolioUrl;
              }
            }}
            className={cn(
              'flex',
              'w-full',
              'items-center',
              'justify-center',
              'gap-2',
              'rounded-xl',
              'border',
              'border-rose-200',
              'bg-white',
              'px-3',
              'py-2',
              'text-xs',
              'font-semibold',
              'text-rose-800',
              'hover:bg-rose-50',
              'hover:border-rose-300',
              'transition-colors',
            )}
          >
            <ArrowLeft className={cn('w-4', 'h-4')} />
            <span>Back to QR Folio</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'fixed',
            'bottom-5',
            'right-5',
            'z-40',
            'flex',
            'items-center',
            'justify-center',
            'h-11',
            'w-11',
            'rounded-full',
            'bg-rose-200',
            'p-0',
            'text-rose-800',
            'shadow-lg',
            'shadow-rose-200',
            'lg:hidden',
            'transition-transform',
            'duration-150',
            'active:scale-95',
          )}
        >
          <Menu className={cn('w-5', 'h-5')} />
        </button>
      )}

      {isMobile ? (
        <div
          className={
            'fixed inset-0 z-30 flex transition-transform duration-300 ' +
            (isOpen ? 'translate-x-0' : '-translate-x-full')
          }
        >
          {sidebar}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsOpen(false)}
            className={cn('flex-1', 'bg-black/40')}
          />
        </div>
      ) : (
        <div className={cn('hidden', 'lg:block', 'h-screen', 'sticky', 'top-0')}>
          {sidebar}
        </div>
      )}
    </>
  );
};
