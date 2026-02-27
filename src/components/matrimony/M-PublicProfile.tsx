import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  User2,
  Briefcase,
  School,
  Utensils,
  CigaretteOff,
  GlassWater,
  Feather,
  Languages,
  Building2,
  Globe,
  Hash,
  Map,
  Footprints,
  Palette,
  Syringe,
  ClipboardList,
  Home,
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Link,
  Coffee,
  Film,
  User,
  MapPinned,
  Ruler,
  Mail,
  Phone,
  Star,
  Timer,
  Sun,
  Target,
  Orbit,
  AlertTriangle,
  Fingerprint,
  Weight,
  UserX,
  Handshake,
  Laptop,
  Building,
  TrendingUp,
  Bike,
  UtensilsCrossed,
  Shirt,
  Book,
  Camera,
  Image as ImageIcon,
  Plane,
  Popcorn,
  Goal,
  Calendar,
  Clock,
  Search,
  Music,
  IndianRupee,
  UserIcon,
  Menu,
  X,
  QrCode,
} from "lucide-react";
import { getPublicMatrimonyProfile } from "@/lib/matrimony/publicMatrimonyApi";
import { getMatrimonyProfileById } from "@/lib/matrimony/matrimonyApi";
import { blockUser, reportProfile, unblockUser } from "@/lib/core/reportsApi";
import { downloadPublicMatrimonyProfilePdf } from "@/lib/matrimony/publicMatrimonyPdfApi";
import QRCode from "react-qr-code";
// import { NotificationBell } from "./NotificationBell";
import { NotificationsDrawer } from "@/components/notifications/NotificationsDrawer";
import { cn } from "../../lib/core/utils";
import jsPDF from "jspdf";
// import {
//   getProfileComments,
//   // type ProfileComment,
// } from "../lib/interactionsApi";

// Helper to show placeholders but keep values clean
const valueOrPlaceholder = (value: any, placeholder = "Not specified") => {
  if (value === null || value === undefined) return placeholder;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : placeholder;
  }
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(", ");
    return joined ? joined : placeholder;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : placeholder;
  }
  return value || placeholder;
};

// Extract only the date part from ISO strings
const formatDateOnly = (value: any): string | undefined => {
  if (!value) return undefined;
  const raw = typeof value === "string" ? value : String(value);
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  return raw;
};

// QR card helpers (kept from earlier implementation)
const escapeForSvg = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildQrCardSvg = (
  qrSvg: string,
  options?: { name?: string; designation?: string; logoHref?: string },
): { svg: string; width: number; height: number } => {
  const svgOpenTagEnd = qrSvg.indexOf(">");
  const svgCloseTagStart = qrSvg.lastIndexOf("</svg>");
  const qrInner =
    svgOpenTagEnd !== -1 && svgCloseTagStart !== -1
      ? qrSvg.slice(svgOpenTagEnd + 1, svgCloseTagStart)
      : qrSvg;

  const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);
  const defaultSize = 240;
  const qrSize = defaultSize;
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${qrSize} ${qrSize}`;

  const cardWidth = qrSize + 160;
  const cardHeight = qrSize + 220;

  const tileWidth = qrSize + 40;
  const tileHeight = qrSize + 40;
  const tileX = (cardWidth - tileWidth) / 2;
  const tileY = 40;

  const qrX = (cardWidth - qrSize) / 2;
  const qrY = tileY + (tileHeight - qrSize) / 2;

  const centerX = qrX + qrSize / 2;
  const centerY = qrY + qrSize / 2;
  const logoSize = qrSize * 0.28;
  const logoX = centerX - logoSize / 2;
  const logoY = centerY - logoSize / 2;
  const innerLogoSize = logoSize * 0.76;
  const innerLogoX = logoX + (logoSize - innerLogoSize) / 2;
  const innerLogoY = logoY + (logoSize - innerLogoSize) / 2;

  const logoHref = options?.logoHref || "/assets/M-Logo.png";

  const nameToShow = options?.name || "Matrimony profile";
  const designationToShow = options?.designation || "";
  const subtitle = "Scan to view profile";

  const textStartY = tileY + tileHeight + 40;
  const nameY = textStartY;
  const designationY = textStartY + 22;
  const subtitleY = textStartY + 42;

  const designationSvg = designationToShow
    ? `\n  <text x="${
        cardWidth / 2
      }" y="${designationY}" text-anchor="middle" fill="#E5E7EB" font-size="14" font-weight="400" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
        designationToShow,
      )}\n  </text>`
    : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img">\n  <defs>\n    <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#fb7185" />\n      <stop offset="50%" stop-color="#f97316" />\n      <stop offset="100%" stop-color="#ec4899" />\n    </linearGradient>\n    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#fb7185" />\n      <stop offset="50%" stop-color="#f97316" />\n      <stop offset="100%" stop-color="#ec4899" />\n    </linearGradient>\n  </defs>\n  <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" rx="32" fill="url(#cardGradient)" />\n  <rect x="8" y="8" width="${
    cardWidth - 16
  }" height="${cardHeight - 16}" rx="28" fill="#020617" />\n  <rect x="${
    tileX - 2
  }" y="${tileY - 2}" width="${tileWidth + 4}" height="${
    tileHeight + 4
  }" rx="34" fill="url(#borderGradient)" />\n  <rect x="${tileX}" y="${tileY}" width="${tileWidth}" height="${tileHeight}" rx="32" fill="#ffffff" />\n  <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="${viewBox}">\n${qrInner}\n  </svg>\n  <rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${
    logoSize / 3
  }" fill="#ffffff" />\n  <image x="${innerLogoX}" y="${innerLogoY}" width="${innerLogoSize}" height="${innerLogoSize}" preserveAspectRatio="xMidYMid meet" xlink:href="${logoHref}" />\n  <text x="${
    cardWidth / 2
  }" y="${nameY}" text-anchor="middle" fill="#F9FAFB" font-size="20" font-weight="600" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
    nameToShow,
  )}\n  </text>${designationSvg}\n  <text x="${
    cardWidth / 2
  }" y="${subtitleY}" text-anchor="middle" fill="#9CA3AF" font-size="13" font-weight="400" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
    subtitle,
  )}\n  </text>\n</svg>`;

  return { svg, width: cardWidth, height: cardHeight };
};

type SiblingDisplay = {
  label: string;
  value: string;
};

const parseSiblingDisplays = (raw?: string | null): SiblingDisplay[] => {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return [];

  if (value.includes(";;") || value.includes("|")) {
    const sections = value
      .split(";;")
      .map((section) => section.trim())
      .filter(Boolean);

    if (!sections.length) return [];

    return sections.map((section, index) => {
      const parts = section.split("|");
      const name = (parts[0] || "").trim();
      const relationship = (parts[1] || "").trim();
      const occupation = (parts[2] || "").trim();
      const order = (parts[3] || "").trim();
      const maritalStatus = parts[4] === "Married" ? "Married" : "";

      const detailParts: string[] = [];
      const relationPart = [order, relationship]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (relationPart) detailParts.push(relationPart);
      if (occupation) detailParts.push(occupation);
      if (maritalStatus) detailParts.push(maritalStatus);

      const detailValue =
        detailParts.join(" • ") ||
        name ||
        relationship ||
        occupation ||
        maritalStatus ||
        "Not specified";

      return {
        label: name || `Sibling ${index + 1}`,
        value: detailValue,
      };
    });
  }

  return [
    {
      label: "Siblings",
      value,
    },
  ];
};

type InfoTileProps = {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  placeholder?: string;
};

const InfoTile: React.FC<InfoTileProps> = ({
  label,
  value,
  icon,
  placeholder = "Not specified",
}) => {
  const raw = typeof value === "string" ? value.trim() : value;
  const isSpecified = Boolean(raw);
  if (!isSpecified) return null;

  const display = valueOrPlaceholder(raw, placeholder);

  return (
    <div className={cn('flex', 'items-start', 'gap-3', 'rounded-lg', 'bg-white', 'px-3', 'py-2.5', 'shadow-sm', 'border', 'border-[#ffd6e4]')}>
      <div className={cn('flex', 'h-8', 'w-8', 'items-center', 'justify-center', 'rounded-full', 'bg-[#ffe1eb]', 'text-[#f1557a]')}>
        {icon}
      </div>
      <div className={cn('flex', 'flex-col')}>
        <span className={cn('text-[11px]', 'font-semibold', 'tracking-wide', 'text-[#f38aa2]', 'uppercase')}>
          {label}
        </span>
        <span className={cn('text-xs', 'sm:text-[13px]', 'font-medium', 'text-[#3b2430]', 'break-words')}>
          {display}
        </span>
      </div>
    </div>
  );
};

type PublicMatrimonyProfileProps = {
  profileId?: string;
  // mode controls small behaviour differences between the public URL and feed profile view
  mode?: "public" | "feed";
};

export const PublicMatrimonyProfile: React.FC<PublicMatrimonyProfileProps> = ({
  profileId,
  mode = "public",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isHeroQrFront, setIsHeroQrFront] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const profileSectionRef = useRef<HTMLElement | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const isFeedView = mode === "feed";
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token = window.localStorage.getItem("qrAuthToken");
      if (!token) {
        setViewerUserId(null);
        return;
      }
      const parts = token.split(".");
      if (parts.length < 2) {
        setViewerUserId(null);
        return;
      }
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payloadJson = atob(base64);
      const payload = JSON.parse(payloadJson);
      const inferredId =
        (typeof payload.userId === "string" && payload.userId) ||
        (typeof payload.sub === "string" && payload.sub) ||
        null;
      setViewerUserId(inferredId);
    } catch {
      setViewerUserId(null);
    }
  }, []);

  const isSelfView =
    Boolean(profile?.userId) &&
    Boolean(viewerUserId) &&
    profile?.userId === viewerUserId;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        let id = profileId;
        if (!id) {
          if (typeof window === "undefined") return;
          const path = window.location.pathname || "";
          const segments = path.split("/").filter(Boolean);
          id = segments[segments.length - 1];
        }

        if (!id) {
          setError("Missing profile id in URL.");
          setIsLoading(false);
          return;
        }

        // In feed view, use authenticated matrimony API so we get
        // full contact details. For public links, use the public
        // endpoint which intentionally strips contact info.
        if (isFeedView) {
          const result = await getMatrimonyProfileById(id);
          if (!isMounted) return;

          if (!result.ok) {
            if (result.authError) {
              setError(
                "Please login to your matrimony feed to view this profile.",
              );
            } else if (result.notFound) {
              setError(
                "This feed profile is unavailable. Please access it directly from your swipe feed.",
              );
            } else {
              setError(
                result.error || result.message || "Failed to load profile.",
              );
            }
            setIsLoading(false);
            return;
          }

          setProfile(result.profile || null);
          setIsLoading(false);
        } else {
          const result = await getPublicMatrimonyProfile(id);
          if (!isMounted) return;

          if (!result.ok) {
            if (result.notFound) {
              setError("Profile not found.");
            } else {
              setError(result.error || "Failed to load profile.");
            }
            setIsLoading(false);
            return;
          }

          setProfile(result.profile || null);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load profile.");
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const loadLogo = async () => {
      try {
        const response = await fetch("/assets/M-Logo.png");
        if (!response.ok) return;
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === "string") {
            setLogoDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // ignore logo load errors
      }
    };

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  // useEffect(() => {
  //   if (!profile) return;

  //   const id =
  //     (profile &&
  //       (profile.shortId || profile.publicId || profile._id || profile.id)) ||
  //     null;

  //   if (!id) return;

  // let cancelled = false;

  // const loadComments = async () => {
  //   setCommentsLoading(true);
  //   setCommentsError(null);
  //   try {
  //     const result = await getProfileComments(id, 1, 20);
  //     if (cancelled) return;
  //     setComments(Array.isArray(result.items) ? result.items : []);
  //   } catch (err: any) {
  //     if (cancelled) return;
  //     // Silently ignore auth/permission errors for public viewers
  //     const message = err?.response?.data?.message || err?.message || null;
  //     setComments([]);
  //     setCommentsError(message);
  //   } finally {
  //     if (!cancelled) {
  //       setCommentsLoading(false);
  //     }
  //   }
  // };

  // void loadComments();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [profile]);

  if (isLoading) {
    return (
      <div className={cn('flex', 'items-center', 'justify-center', 'py-16')}>
        <p className={cn('text-sm', 'text-gray-500')}>Loading Profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={cn('flex', 'items-center', 'justify-center', 'py-16')}>
        <p className={cn('text-sm', 'text-rose-600')}>{error || "Profile not found."}</p>
      </div>
    );
  }

  const full = profile.fullProfile || {};
  const basic = full.basicDetails || {};
  const about = full.about || {};
  const education = full.education || {};
  const career = full.career || {};
  const kundli = full.kundli || {};
  const family = full.family || {};
  const contact = full.contact || {};
  const lifestyle = full.lifestyle || {};
  const favourites = lifestyle.favourites || {};
  const partnerPreferences = full.partnerPreferences || {};
  const partnerBasic = partnerPreferences.basicDetails || {};
  const partnerEdu = partnerPreferences.education || {};
  const partnerLife = partnerPreferences.lifestyle || {};
  const rawGallery = Array.isArray(full.gallery) ? full.gallery : [];

  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !Number.isNaN(value);
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  const showAboutSection = hasValue(about.summary);

  const age = (() => {
    const fromProfile = (profile && (profile as any).age) as any;
    const normalized =
      typeof fromProfile === "number" || typeof fromProfile === "string"
        ? String(fromProfile).trim()
        : "";
    if (normalized) return normalized;

    const birthValue = (basic as any)?.birthDate || (kundli as any)?.birthDate;
    if (!birthValue) return "";
    const raw =
      typeof birthValue === "string" ? birthValue : String(birthValue);
    const dob = new Date(raw);
    if (Number.isNaN(dob.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      years -= 1;
    }
    return years > 0 ? String(years) : "";
  })();

  const showDetailsSection =
    hasValue((about as any).profileManagedBy) ||
    hasValue((basic as any).birthDate) ||
    hasValue(age) ||
    hasValue((about as any).profileCreatedBy) ||
    hasValue(basic.maritalStatus) ||
    hasValue((basic as any).gender);

  const showPhysicalSection =
    hasValue(basic.height) ||
    hasValue((basic as any).weight) ||
    hasValue((basic as any).bodyType) ||
    hasValue((basic as any).complexion) ||
    hasValue((basic as any).bloodGroup) ||
    hasValue(basic.physicalStatus);

  const showEducationSection =
    hasValue(education.description) ||
    hasValue(education.level) ||
    hasValue(education.degree) ||
    hasValue(education.field) ||
    hasValue(education.college) ||
    hasValue(education.year);

  const showProfessionSection =
    hasValue(career.role) ||
    hasValue(career.location) ||
    hasValue((career as any).industry || (career as any).employedIn) ||
    hasValue(basic.annualIncome);

  const showLifestyleSection =
    (Array.isArray(lifestyle.habits) && lifestyle.habits.length > 0) ||
    (Array.isArray(lifestyle.assets) && lifestyle.assets.length > 0) ||
    hasValue(favourites.hobbies) ||
    hasValue(favourites.interests) ||
    hasValue(favourites.languages) ||
    hasValue(favourites.music) ||
    hasValue(favourites.cuisine) ||
    hasValue(favourites.clothingStyle) ||
    hasValue(favourites.sports) ||
    hasValue(favourites.canCook) ||
    hasValue(favourites.travel) ||
    hasValue(favourites.shows) ||
    hasValue(favourites.books) ||
    hasValue(favourites.movies) ||
    hasValue(favourites.outdoor) ||
    hasValue(favourites.indoor) ||
    hasValue(favourites.bucketList) ||
    hasValue(favourites.values) ||
    hasValue(favourites.quirks) ||
    hasValue(favourites.weekend);

  const showPartnerSection =
    hasValue(partnerPreferences.summary || partnerPreferences.description) ||
    hasValue(partnerBasic.heightRange) ||
    hasValue(partnerBasic.ageRange) ||
    hasValue(partnerBasic.maritalStatus) ||
    hasValue(partnerBasic.kundliAstro) ||
    hasValue(partnerBasic.caste) ||
    hasValue(partnerBasic.disability) ||
    hasValue(partnerBasic.religion) ||
    hasValue(partnerBasic.motherTongue) ||
    hasValue((partnerBasic as any).state) ||
    hasValue((partnerBasic as any).district) ||
    hasValue(partnerBasic.country) ||
    hasValue(partnerEdu.level) ||
    hasValue(partnerEdu.profession) ||
    hasValue(partnerEdu.earning) ||
    hasValue(partnerLife.diet) ||
    hasValue(partnerLife.smoke) ||
    hasValue(partnerLife.drink);

  const showFamilySection =
    hasValue((family as any).fatherName) ||
    hasValue((family as any).motherName) ||
    hasValue((family as any).fatherOccupation) ||
    hasValue((family as any).motherOccupation) ||
    hasValue((family as any).fatherBelongsFrom) ||
    hasValue((family as any).motherBelongsFrom) ||
    hasValue((family as any).familyValues) ||
    hasValue(family.familyBackground) ||
    hasValue((basic as any).familyType) ||
    parseSiblingDisplays((family as any).siblings).length > 0;

  const siblingDisplays = parseSiblingDisplays((family as any).siblings);

  const showAdditionalNotesSection = hasValue((full as any).additionalNotes);

  const showReligionSection =
    hasValue(basic.religion) ||
    hasValue(basic.caste) ||
    hasValue(basic.motherTongue) ||
    hasValue((basic as any).gothra) ||
    hasValue((kundli as any).motherGotra) ||
    hasValue((kundli as any).dadiGotra) ||
    hasValue((kundli as any).naniGotra);

  const showKundliSection =
    hasValue((kundli as any).manglikStatus) ||
    hasValue((kundli as any).nakshatra) ||
    hasValue((kundli as any).raashi) ||
    hasValue((kundli as any).birthTime) ||
    hasValue((kundli as any).birthCountry) ||
    hasValue((kundli as any).birthState) ||
    hasValue((kundli as any).birthDistrict) ||
    hasValue((kundli as any).astrologySystem) ||
    hasValue((kundli as any).horoscopePreference) ||
    hasValue((kundli as any).doshaDetails);

  const photos = rawGallery
    .map((item: any) => {
      if (!item) return null;
      const url = item.url || item.src;
      if (!url) return null;
      return {
        id: item.id || item._id || url,
        url,
        caption: item.caption || item.title || "",
        isProfilePhoto: Boolean(item.isProfilePhoto),
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    url: string;
    caption?: string;
    isProfilePhoto?: boolean;
  }>;

  const openPhotoAtIndex = (index: number) => {
    if (!photos.length) return;
    const count = photos.length;
    const normalized = ((index % count) + count) % count;
    setActivePhotoIndex(normalized);
  };

  const heroPreviewPhoto = !photos.length
    ? null
    : (() => {
        const nonPrimary = photos.filter((p) => !p.isProfilePhoto);
        const source = nonPrimary.length > 0 ? nonPrimary : photos;
        const randomIndex = Math.floor(Math.random() * source.length);
        return source[randomIndex];
      })();

  const activePhoto =
    activePhotoIndex !== null && photos[activePhotoIndex]
      ? photos[activePhotoIndex]
      : null;

  const hasMultiplePhotos = photos.length > 1;

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null) return;
    openPhotoAtIndex(activePhotoIndex - 1);
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex === null) return;
    openPhotoAtIndex(activePhotoIndex + 1);
  };

  const profilePhotoUrl =
    typeof (full as any).profilePhoto === "string" &&
    (full as any).profilePhoto.trim()
      ? ((full as any).profilePhoto as string)
      : "";

  const primaryPhoto = profilePhotoUrl
    ? {
        id: "profilePhoto",
        url: profilePhotoUrl,
        caption: "",
        isProfilePhoto: true,
      }
    : photos.find((p) => p.isProfilePhoto) ||
      (photos.length > 0 ? photos[0] : null);

  const displayProfileId =
    (profile &&
      (profile.shortId || profile.publicId || profile._id || profile.id)) ||
    "";

  const cardNameForQr =
    (about as any).profileManagedBy ||
    (basic as any).fullName ||
    "Matrimony profile";

  const cardDesignationForQr = (() => {
    const c: any = career || {};
    const e: any = education || {};
    const b: any = basic || {};
    if (c.role && c.location) return `${c.role}`;
    if (c.role) return c.role;
    if (c.location) return c.location;
    if (e.description) return e.description;
    if (b.occupation) return b.occupation;
    return "";
  })();

  const headerAddress =
    (basic as any).location ||
    [
      (basic as any).residingCity,
      (basic as any).residingState,
      (basic as any).residingCountry,
    ]
      .filter(Boolean)
      .join(", ");

  const primaryPhone = (contact as any).phone as string;
  const phoneHref = primaryPhone
    ? `tel:${String(primaryPhone).replace(/\s+/g, "")}`
    : "";
  const emailAddress = (contact as any).email as string;
  const emailHref = emailAddress ? `mailto:${emailAddress}` : "";

  const profileUrl =
    typeof window !== "undefined"
      ? profileId
        ? `${window.location.origin}/public-matrimony/${profileId}`
        : window.location.href
      : "";

  const handleDownloadQr = () => {
    if (!profileUrl) {
      toast.error("Profile link unavailable right now.");
      return;
    }
    try {
      const container = qrContainerRef.current;
      if (!container) return;
      const svgEl = container.querySelector("svg");
      if (!svgEl) return;

      const serializer = new XMLSerializer();
      const qrSource = serializer.serializeToString(svgEl as SVGSVGElement);

      const {
        svg: cardSvg,
        width,
        height,
      } = buildQrCardSvg(qrSource, {
        name: cardNameForQr,
        designation: cardDesignationForQr,
        logoHref: logoDataUrl || "/assets/M-Logo.png",
      });

      const svgBlob = new Blob([cardSvg], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return;
        }
        (ctx as any).imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `matrimony-qr-${displayProfileId || "profile"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR card downloaded");
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Unable to download QR card. Try again.");
      };

      image.src = url;
    } catch (err) {
      console.error(err);
      toast.error("Unable to download QR card. Try again.");
    }
  };

  const handleCopyLink = async (): Promise<boolean> => {
    if (!profileUrl) {
      toast.error("Profile link unavailable right now.");
      return false;
    }
    let copied = false;
    try {
      if (navigator.clipboard && (window as any).isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
        toast.success("Profile link copied");
        return true;
      }
    } catch {
      // fall through to manual copy
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = profileUrl;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      copied = false;
    }

    if (copied) {
      toast.success("Profile link copied");
    } else {
      toast.error("Unable to copy link.");
    }
    return copied;
  };

  const handleShareProfile = async () => {
    if (!profileUrl) {
      toast.error("Profile link unavailable right now.");
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav: any = navigator;
      if (nav && typeof nav.share === "function") {
        await nav.share({
          title: about.profileManagedBy || "Matrimony Profile",
          url: profileUrl,
        });
        toast.success("Share dialog opened");
        return;
      }
    } catch {
      toast.error("Share dialog unavailable. Copying link instead.");
    }
    await handleCopyLink();
  };

  const handleDownloadPdf = () => {
    if (typeof window === "undefined") return;

    const targetId =
      (profileId && profileId.trim()) ||
      (profile && (profile as any).id ? String((profile as any).id).trim() : "");

    if (!targetId) {
      toast.error("Profile id unavailable.");
      return;
    }

    toast.loading("Preparing PDF…", { id: "download-pdf" });

    void (async () => {
      try {
        const result = await downloadPublicMatrimonyProfilePdf(targetId);

        if (!result.ok) {
          toast.error(result.error || "Failed to download PDF.", {
            id: "download-pdf",
          });
          return;
        }

        const blob = result.data;
        const url = URL.createObjectURL(blob);
        const nameBase = displayProfileId
          ? `matrimonial-profile-${displayProfileId}`
          : "matrimonial-profile";
        const name = `${nameBase}.pdf`;

        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);

        toast.success("PDF downloaded", { id: "download-pdf" });
      } catch (err: any) {
        toast.error(err?.message || "Failed to download PDF.", {
          id: "download-pdf",
        });
      }
    })();
  };

  const handlePreviewImages = () => {
    if (photos.length === 0) {
      toast.error("Add photos in the Gallery tab to preview.");
      return;
    }
    scrollToSection("section-gallery");
    toast.success("Scrolling to gallery image section");
  };

  const favouriteTiles: Array<{
    key: keyof typeof favourites;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "hobbies",
      label: "Hobbies",
      icon: <Camera className={cn('h-4', 'w-4')} />,
    },
    {
      key: "interests",
      label: "Interests",
      icon: <Book className={cn('h-4', 'w-4')} />,
    },
    {
      key: "languages",
      label: "Languages",
      icon: <Languages className={cn('h-4', 'w-4')} />,
    },
    { key: "music", label: "Music", icon: <Music className={cn('h-4', 'w-4')} /> },
    {
      key: "cuisine",
      label: "Cuisine",
      icon: <UtensilsCrossed className={cn('h-4', 'w-4')} />,
    },
    {
      key: "clothingStyle",
      label: "Clothing style",
      icon: <Shirt className={cn('h-4', 'w-4')} />,
    },
    { key: "sports", label: "Sports", icon: <Bike className={cn('h-4', 'w-4')} /> },
    {
      key: "canCook",
      label: "Can cook",
      icon: <UtensilsCrossed className={cn('h-4', 'w-4')} />,
    },
    {
      key: "travel",
      label: "Travel style",
      icon: <Plane className={cn('h-4', 'w-4')} />,
    },
    {
      key: "shows",
      label: "Favourite shows",
      icon: <Popcorn className={cn('h-4', 'w-4')} />,
    },
    {
      key: "books",
      label: "Favourite books",
      icon: <Book className={cn('h-4', 'w-4')} />,
    },
    {
      key: "movies",
      label: "Favourite movies",
      icon: <Film className={cn('h-4', 'w-4')} />,
    },
    {
      key: "outdoor",
      label: "Outdoor activities",
      icon: <Building className={cn('h-4', 'w-4')} />,
    },
    {
      key: "indoor",
      label: "Indoor activities",
      icon: <Building className={cn('h-4', 'w-4')} />,
    },
    {
      key: "bucketList",
      label: "Bucket list",
      icon: <Goal className={cn('h-4', 'w-4')} />,
    },
    {
      key: "values",
      label: "Core values",
      icon: <Sparkles className={cn('h-4', 'w-4')} />,
    },
    {
      key: "quirks",
      label: "Fun quirks",
      icon: <Clock className={cn('h-4', 'w-4')} />,
    },
    {
      key: "weekend",
      label: "Ideal weekend",
      icon: <Calendar className={cn('h-4', 'w-4')} />,
    },
  ];

  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.section
      ref={profileSectionRef}
      className={cn('min-h-screen', 'bg-[#ffe5ee]', 'text-[#3b2430]')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={cn('w-full', 'pb-20')}>
        {/* Top header nav */}
        <header className={cn('sticky', 'top-0', 'z-20', 'bg-white/95', 'backdrop-blur', 'shadow-sm', 'border-b', 'border-[#f4d6df]')}>
          <div className={cn('flex', 'flex-col', 'gap-3', 'sm:flex-row', 'sm:items-center', 'sm:justify-between', 'px-4', 'sm:px-6', 'lg:px-8', 'py-3', 'max-w-7xl', 'mx-auto')}>
            <div className={cn('flex', 'items-center', 'gap-3')}>
              <div className={cn('h-9', 'w-9', 'rounded-full', 'bg-[#f1557a]', 'text-white', 'flex', 'items-center', 'justify-center', 'text-sm', 'font-semibold', 'shadow-sm')}>
                M
              </div>
              <div>
                <p className={cn('text-sm', 'font-semibold', 'text-[#3b2430]')}>
                  MatrimonyOne
                </p>
                <p className={cn('text-[11px]', 'text-[#c26b83]')}>
                  Matrimony public profile
                </p>
              </div>
            </div>
            <div className={cn('flex', 'items-center', 'justify-between', 'sm:justify-end', 'w-full', 'sm:w-auto', 'gap-3')}>
              {/* Desktop nav */}
              <nav className={cn('hidden', 'sm:flex', 'items-center', 'gap-8', 'text-xs', 'font-medium', 'text-[#7f4c5f]')}>
                {showAboutSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-about")}
                    className="hover:text-[#3b2430]"
                  >
                    About
                  </button>
                )}
                {showDetailsSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-details")}
                    className="hover:text-[#3b2430]"
                  >
                    Details
                  </button>
                )}
                {showPhysicalSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-physical")}
                    className="hover:text-[#3b2430]"
                  >
                    Physical
                  </button>
                )}
                {showEducationSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-education")}
                    className="hover:text-[#3b2430]"
                  >
                    Education
                  </button>
                )}
                {showProfessionSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-profesion")}
                    className="hover:text-[#3b2430]"
                  >
                    Profession
                  </button>
                )}
                {showLifestyleSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-lifestyle")}
                    className="hover:text-[#3b2430]"
                  >
                    Lifestyle
                  </button>
                )}
                {showPartnerSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-partner")}
                    className="hover:text-[#3b2430]"
                  >
                    Partner
                  </button>
                )}
                {showFamilySection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-family")}
                    className="hover:text-[#3b2430]"
                  >
                    Family
                  </button>
                )}
                {showReligionSection && (
                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection("section-religion-community-gotra")
                    }
                    className="hover:text-[#3b2430]"
                  >
                    Religion
                  </button>
                )}
                {showKundliSection && (
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-kundli-astro")}
                    className="hover:text-[#3b2430]"
                  >
                    Kundli
                  </button>
                )}

                {/* <button
                  type="button"
                  onClick={() => scrollToSection("section-additionalNote")}
                  className="hover:text-[#3b2430]"
                >
                  Additional Note
                </button> */}
              </nav>

              {/* Mobile: menu toggle + primary action */}
              <div className={cn('flex', 'items-center', 'gap-2', 'sm:gap-3')}>
                {/* {isFeedView && (
                  <NotificationBell
                    onClick={() => setShowNotifications(true)}
                  />
                )} */}
                <button
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      isFeedView ? "section-contact" : "section-additionalNote",
                    )
                  }
                  className={cn('inline-flex', 'items-center', 'justify-center', 'rounded-full', 'bg-gradient-to-r', 'from-[#ff5b7b]', 'to-[#ff3366]', 'px-4', 'sm:px-5', 'py-2', 'text-[11px]', 'sm:text-xs', 'font-semibold', 'text-white', 'shadow-md', 'hover:brightness-105')}
                >
                  Connect Now
                </button>

                <div
                  className={`${
                    isFeedView && !isSelfView ? "flex" : "hidden"
                  } flex-col items-end gap-0.5 text-[10px] text-[#7f4c5f]`}
                >
                  <button
                    type="button"
                    className={cn('underline', 'decoration-dotted', 'hover:text-[#3b2430]')}
                    disabled={isReporting}
                    onClick={async () => {
                      if (!profile) return;
                      setReportMessage(null);
                      setIsReporting(true);
                      try {
                        const details =
                          typeof window !== "undefined"
                            ? window.prompt(
                                "Tell us briefly why you are reporting this profile (optional)",
                              ) || undefined
                            : undefined;

                        const result = await reportProfile({
                          targetUserId:
                            typeof profile.userId === "string"
                              ? profile.userId
                              : undefined,
                          targetProfileId:
                            typeof profile.id === "string"
                              ? profile.id
                              : undefined,
                          reason: "user_report",
                          details,
                        });

                        if (!result.ok) {
                          if (result.authError) {
                            setReportMessage(
                              "Please login to report profiles.",
                            );
                            toast.error("Please login to report profiles.");
                          } else {
                            setReportMessage(
                              result.error || "Failed to submit report.",
                            );
                            toast.error(
                              result.error || "Failed to submit report.",
                            );
                          }
                          return;
                        }

                        setReportMessage(
                          "Report submitted. Our team will review it.",
                        );
                        toast.success("Report submitted.");
                      } catch {
                        setReportMessage("Failed to submit report.");
                        toast.error("Failed to submit report.");
                      } finally {
                        setIsReporting(false);
                      }
                    }}
                  >
                    Report profile
                  </button>
                  <button
                    type="button"
                    className={cn('underline', 'decoration-dotted', 'hover:text-[#3b2430]')}
                    disabled={isBlocking}
                    onClick={async () => {
                      if (!profile || typeof profile.userId !== "string") {
                        setBlockMessage("Unable to block this profile.");
                        return;
                      }
                      setBlockMessage(null);
                      setIsBlocking(true);
                      try {
                        const result = await blockUser(profile.userId);
                        if (!result.ok) {
                          if (result.authError) {
                            setBlockMessage("Please login to block profiles.");
                            toast.error("Please login to block profiles.");
                          } else {
                            setBlockMessage(
                              result.error || "Failed to block this profile.",
                            );
                            toast.error(
                              result.error || "Failed to block this profile.",
                            );
                          }
                          return;
                        }
                        setBlockMessage(
                          "Profile blocked. You will no longer see this user in your feed.",
                        );
                        toast.success("Profile blocked.");
                      } catch {
                        setBlockMessage("Failed to block this profile.");
                        toast.error("Failed to block this profile.");
                      } finally {
                        setIsBlocking(false);
                      }
                    }}
                  >
                    Block profile
                  </button>
                  <button
                    type="button"
                    className={cn('underline', 'decoration-dotted', 'hover:text-[#3b2430]')}
                    disabled={isBlocking}
                    onClick={async () => {
                      if (!profile || typeof profile.userId !== "string") {
                        setBlockMessage("Unable to unblock this profile.");
                        return;
                      }
                      setBlockMessage(null);
                      setIsBlocking(true);
                      try {
                        const result = await unblockUser(profile.userId);
                        if (!result.ok) {
                          if (result.authError) {
                            setBlockMessage(
                              "Please login to unblock profiles.",
                            );
                            toast.error("Please login to unblock profiles.");
                          } else {
                            setBlockMessage(
                              result.error || "Failed to unblock this profile.",
                            );
                            toast.error(
                              result.error || "Failed to unblock this profile.",
                            );
                          }
                          return;
                        }
                        setBlockMessage(
                          "Profile unblocked. You may see this user again in your feed.",
                        );
                        toast.success("Profile unblocked.");
                      } catch {
                        setBlockMessage("Failed to unblock this profile.");
                        toast.error("Failed to unblock this profile.");
                      } finally {
                        setIsBlocking(false);
                      }
                    }}
                  >
                    Unblock profile
                  </button>
                </div>

                <button
                  type="button"
                  className={cn('inline-flex', 'items-center', 'justify-center', 'rounded-full', 'border', 'border-[#f4d6df]', 'bg-white', 'p-1.5', 'text-[#7f4c5f]', 'shadow-sm', 'sm:hidden')}
                  onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                  aria-label={isHeaderMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isHeaderMenuOpen ? (
                    <X className={cn('h-4', 'w-4')} />
                  ) : (
                    <Menu className={cn('h-4', 'w-4')} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {(blockMessage || reportMessage) && (
            <div className={cn('px-4', 'sm:px-10', 'lg:px-20', 'pb-2', 'text-[11px]', 'text-[#7f4c5f]')}>
              {blockMessage && <p>{blockMessage}</p>}
              {reportMessage && <p>{reportMessage}</p>}
            </div>
          )}

          {/* Mobile dropdown nav */}
          {isHeaderMenuOpen && (
            <div className={cn('sm:hidden', 'border-t', 'border-[#f4d6df]', 'bg-white/98')}>
              <div className={cn('px-4', 'py-2', 'flex', 'flex-wrap', 'gap-2', 'text-[11px]', 'font-medium', 'text-[#7f4c5f]')}>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-about");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-details");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-physical");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Physical
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-education");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Education
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-profesion");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Profession
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-lifestyle");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Lifestyle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-partner");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-family");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Family
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-religion-community-gotra");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Religion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-kundli-astro");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Kundli
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-additionalNote");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={cn('px-2', 'py-1', 'rounded-full', 'bg-[#ffeef3]', 'hover:bg-[#ffdce8]')}
                >
                  Additional Note
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero section */}
        <div className={cn('mt-0', 'w-full', 'overflow-hidden', 'bg-gradient-to-r', 'from-[#f1697f]', 'via-[#f58b7c]', 'to-[#f7b46b]', 'relative')}>
          {heroPreviewPhoto && (
            <img
              src={heroPreviewPhoto.url}
              alt={heroPreviewPhoto.caption || "Profile background"}
              className={cn('absolute', 'inset-0', 'h-full', 'w-full', 'object-cover', 'opacity-90', 'blur-lg', 'scale-110')}
            />
          )}
          {/* Top dark overlay for readability */}
          <div className={cn('pointer-events-none', 'absolute', 'inset-0', 'bg-gradient-to-b', 'from-black/60', 'via-black/30', 'to-transparent')} />
          {/* Bottom fade into page background */}
          <div className={cn('pointer-events-none', 'absolute', 'inset-x-0', 'bottom-0', 'h-40', 'bg-gradient-to-b', 'from-transparent', 'to-[#ffe5ee]')} />

          {/* Hidden QR container used only for download (not needed in feed view) */}
          {profileUrl && !isFeedView && (
            <div className="hidden" aria-hidden="true">
              <div ref={qrContainerRef}>
                <QRCode value={profileUrl} size={128} />
              </div>
            </div>
          )}

          <div className={cn('relative', 'px-4', 'sm:px-10', 'lg:px-16', 'py-14', 'sm:py-16', 'text-white')}>
            <div className={cn('mx-auto', 'max-w-5xl', 'flex', 'flex-col', 'md:flex-row', 'md:items-center', 'md:justify-between', 'gap-10')}>
              {profileUrl && (
                <div className={cn('flex', 'justify-center', 'md:justify-start')}>
                  {isFeedView ? (
                    primaryPhoto ? (
                      <div className={cn('h-40', 'w-40', 'sm:h-44', 'sm:w-44', 'lg:h-48', 'lg:w-48', 'rounded-full', 'bg-white/25', 'backdrop-blur-md', 'shadow-2xl', 'overflow-hidden', 'p-2')}>
                        <div className={cn('h-full', 'w-full', 'rounded-full', 'overflow-hidden', 'ring-[6px]', 'ring-white/90', 'shadow-xl', 'bg-rose-50')}>
                          <img
                            src={primaryPhoto.url}
                            alt={primaryPhoto.caption || "Profile photo"}
                            className={cn('h-full', 'w-full', 'object-cover')}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={cn('h-40', 'w-40', 'sm:h-44', 'sm:w-44', 'lg:h-48', 'lg:w-48', 'rounded-full', 'bg-white/20', 'shadow-2xl', 'flex', 'items-center', 'justify-center', 'text-sm', 'font-semibold')}>
                        <span>{about.profileManagedBy || "Profile"}</span>
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (primaryPhoto) {
                          setIsHeroQrFront((prev) => !prev);
                        }
                      }}
                      className={cn('group', 'relative', 'h-40', 'w-40', 'sm:h-44', 'sm:w-44', 'lg:h-48', 'lg:w-48', 'rounded-full', 'bg-white', 'shadow-2xl', 'flex', 'items-center', 'justify-center', 'overflow-hidden', '[perspective:1200px]', 'cursor-pointer')}
                      aria-label={
                        isHeroQrFront ? "Show profile photo" : "Show QR code"
                      }
                    >
                      {/* Front: QR code (default, scannable) */}
                      <div
                        className={cn('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'transition-transform', 'duration-500', '[backface-visibility:hidden]', '[transform-style:preserve-3d]')}
                        style={{
                          transform: isHeroQrFront
                            ? "rotateY(0deg)"
                            : "rotateY(180deg)",
                        }}
                      >
                        <div className={cn('rounded-2xl', 'text-rose-500', 'bg-white/95', 'px-3', 'py-3', 'shadow-sm')}>
                          <QRCode value={profileUrl} size={104} />
                        </div>
                      </div>

                      {/* Back: profile photo */}
                      {primaryPhoto && (
                        <div
                          className={cn('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'transition-transform', 'duration-500', '[backface-visibility:hidden]', '[transform-style:preserve-3d]')}
                          style={{
                            transform: isHeroQrFront
                              ? "rotateY(-180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          <div className={cn('h-full', 'w-full', 'p-2')}>
                            <div className={cn('h-full', 'w-full', 'rounded-full', 'overflow-hidden', 'ring-[6px]', 'ring-white/90', 'shadow-xl', 'bg-rose-50')}>
                              <img
                                src={primaryPhoto.url}
                                alt={primaryPhoto.caption || "Profile photo"}
                                className={cn('h-full', 'w-full', 'object-cover')}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={cn('absolute', 'inset-0', 'flex', 'items-end', 'justify-center', 'pointer-events-none')}>
                        <div className={cn('mb-10', 'rounded-full', 'bg-black/55', 'px-2', 'py-0.5', 'text-[9px]', 'sm:text-xs', 'font-medium', 'tracking-wide', 'opacity-0', 'transition-opacity', 'duration-200', 'group-hover:opacity-100')}>
                          {isHeroQrFront
                            ? "Tap to view Profile"
                            : "Tap to view QR code"}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}

              <div className={cn('flex-1', 'text-center', 'md:text-left')}>
                <div className={cn('flex', 'flex-col', 'gap-3', 'md:flex-row', 'md:items-start', 'md:justify-between')}>
                  <div className={cn('max-w-3xl', 'mx-auto', 'md:mx-0')}>
                    <div className={cn('flex', 'flex-wrap', 'items-center', 'justify-center', 'md:justify-start', 'gap-2')}>
                      <p className={cn('text-xs', 'font-semibold', 'text-rose-600')}>
                        {about.profileManagedBy || "Matrimony Profile"}
                      </p>
                      {String(
                        (profile as any)?.kycStatus || "NOT_VERIFIED",
                      ).toUpperCase() === "VERIFIED" ? (
                        <RiVerifiedBadgeFill className={cn('shrink-0', 'text-rose-600')} />
                      ) : null}
                    </div>
                    {displayProfileId && (
                      <p className={cn('mt-1', 'text-[11px]', 'sm:text-xs', 'text-rose-100')}>
                        ID - {displayProfileId}
                      </p>
                    )}
                    {(age || headerAddress) && (
                      <p className={cn('mt-1', 'text-[11px]', 'sm:text-xs', 'text-rose-100/90')}>
                        {[age ? `${age} yrs` : "", headerAddress]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                    {full.headline && (
                      <p className={cn('mt-3', 'text-xs', 'sm:text-sm', 'text-rose-50')}>
                        {full.headline}
                      </p>
                    )}
                  </div>
                  <div className={cn('flex', 'items-center', 'gap-2', 'self-center', 'md:self-start')}>
                    {isFeedView && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        disabled={!profileUrl}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-semibold shadow-sm ${
                          profileUrl
                            ? "bg-white text-[#c0395b] hover:bg-rose-50"
                            : "bg-white/70 text-[#c39baf] cursor-not-allowed"
                        }`}
                        title={
                          profileUrl
                            ? "Copy public profile link"
                            : "Public link unavailable right now"
                        }
                      >
                        <Link className={cn('h-3', 'w-3')} />
                        <span>Copy link</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePreviewImages}
                      disabled={photos.length === 0}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold shadow-sm ${
                        photos.length > 0
                          ? "bg-white text-[#c0395b] hover:bg-rose-50"
                          : "bg-white/70 text-[#c39baf] cursor-not-allowed"
                      }`}
                      title={
                        photos.length > 0
                          ? "Jump to your gallery section"
                          : "Add photos in Gallery tab to preview images"
                      }
                    >
                      <ImageIcon className={cn('h-3.5', 'w-3.5')} />
                      <span>Photos</span>
                    </button>
                  </div>
                </div>

                <div className={cn('mt-4', 'flex', 'flex-wrap', 'items-center', 'justify-center', 'md:justify-start', 'gap-3')}>
                  {profileUrl && !isFeedView && (
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className={cn('inline-flex', 'items-center', 'gap-1.5', 'rounded-full', 'bg-white', 'px-4', 'py-1.5', 'text-[11px]', 'font-medium', 'text-[#c0395b]', 'shadow-sm', 'hover:bg-rose-50')}
                    >
                      <QrCode className={cn('h-3.5', 'w-3.5')} />
                      <span>Download QR</span>
                    </button>
                  )}
                  {!isFeedView && (
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className={cn('inline-flex', 'items-center', 'gap-1.5', 'rounded-full', 'bg-white', 'px-4', 'py-1.5', 'text-[11px]', 'font-medium', 'text-[#c0395b]', 'shadow-sm', 'hover:bg-rose-50')}
                    >
                      <Sparkles className={cn('h-3.5', 'w-3.5')} />
                      <span>Download PDF</span>
                    </button>
                  )}
                  {!isFeedView && (
                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className={cn('inline-flex', 'items-center', 'gap-1.5', 'rounded-full', 'bg-white', 'px-4', 'py-1.5', 'text-[11px]', 'font-medium', 'text-[#c0395b]', 'shadow-sm', 'hover:bg-rose-50')}
                    >
                      <Sparkles className={cn('h-3.5', 'w-3.5')} />
                      <span>Share Profile</span>
                    </button>
                  )}
                  {!isFeedView && (
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={cn('inline-flex', 'items-center', 'gap-1.5', 'rounded-full', 'bg-white', 'px-4', 'py-1.5', 'text-[11px]', 'font-medium', 'text-[#c0395b]', 'shadow-sm', 'hover:bg-rose-50')}
                    >
                      <Link className={cn('h-3.5', 'w-3.5')} />
                      <span>Copy Link</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About / quote card */}
        {/* About / quote card */}
        {showAboutSection && (
          <section
            id="section-about"
            className={cn('mt-8', 'flex', 'justify-center', 'px-4', 'sm:px-6', 'lg:px-0')}
          >
            <div className={cn('w-full', 'max-w-5xl', 'rounded-xl', 'bg-white', 'shadow-[0_18px_45px_rgba(0,0,0,0.06)]', 'border', 'border-[#f4d6df]', 'overflow-hidden')}>
              <div className={cn('h-[3px]', 'bg-gradient-to-r', 'from-[#f37488]', 'via-[#f9a37f]', 'to-[#f6c88a]')} />
              <div className={cn('px-6', 'sm:px-10', 'py-6', 'sm:py-8', 'text-center', 'space-y-10')}>
                <p className={cn('text-sm', 'sm:text-base', 'font-medium', 'text-[#c0395b]', 'italic')}>
                  About me
                </p>
                <p className={cn('text-sm', 'leading-relaxed', 'text-[#4b313e]', 'whitespace-pre-line')}>
                  {about.summary}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main content grid */}
        {showDetailsSection && (
          <section
            id="section-details"
            className={cn('mt-8', 'max-w-5xl', 'mx-auto', 'grid', 'gap-6', 'lg:grid-cols-[2fr_1fr]', 'items-start', 'px-4', 'sm:px-6', 'lg:px-0')}
          >
            {/* Left column: details */}
            <div className="space-y-6">
              {/* Basic Details */}
              <section className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}>
                <div className={cn('flex', 'items-center', 'gap-2', 'py-3', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                  <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                    <User2 className={cn('w-3.5', 'h-3.5', 'text-rose-500')} />
                  </div>
                  <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                    Basic Details
                  </p>
                </div>
                <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                  <InfoTile
                    label="Name"
                    value={about.profileManagedBy as string}
                    icon={<User className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Birth date"
                    value={formatDateOnly(basic.birthDate) as string}
                    icon={<Calendar className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Age"
                    value={age ? `${age} yrs` : ""}
                    icon={<Users className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Profile created by"
                    value={(about as any).profileCreatedBy as string}
                    icon={<UserIcon className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Marital status"
                    value={basic.maritalStatus}
                    icon={<Handshake className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Gender"
                    value={basic.gender as string}
                    icon={<Users className={cn('h-4', 'w-4')} />}
                  />
                </div>
              </section>

              {/* Physical Information */}
              {showPhysicalSection && (
                <section
                  id="section-physical"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', 'mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'rounded-lg', 'px-5', 'py-3', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Ruler className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Physical Information
                    </p>
                  </div>
                  <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                    <InfoTile
                      label="Height"
                      value={basic.height}
                      icon={<Ruler className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Weight"
                      value={(basic as any).weight as string}
                      icon={<Weight className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Body type"
                      value={(basic as any).bodyType as string}
                      icon={<Footprints className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Complexion"
                      value={(basic as any).complexion as string}
                      icon={<Palette className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Blood group"
                      value={(basic as any).bloodGroup as string}
                      icon={<Syringe className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Physical status"
                      value={basic.physicalStatus}
                      icon={<ClipboardList className={cn('h-4', 'w-4')} />}
                    />
                  </div>
                </section>
              )}

              {/* Education */}
              {showEducationSection && (
                <section
                  id="section-education"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <School className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Education Details
                    </p>
                  </div>
                  <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                    <InfoTile
                      label="Highest education"
                      value={education.description as string}
                      icon={<Laptop className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Level"
                      value={education.level as string}
                      icon={<GraduationCap className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Degree"
                      value={education.degree as string}
                      icon={<GraduationCap className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Field"
                      value={education.field as string}
                      icon={<Laptop className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="College"
                      value={education.college as string}
                      icon={<Building2 className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Year"
                      value={education.year as string}
                      icon={<Calendar className={cn('h-4', 'w-4')} />}
                    />
                  </div>
                </section>
              )}

              {/* Professional details */}
              {showProfessionSection && (
                <section
                  id="section-profesion"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Briefcase className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Professional Details
                    </p>
                  </div>
                  {career.role ||
                  career.location ||
                  basic.annualIncome ||
                  career.industry ? (
                    <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                      <InfoTile
                        label="Occupation"
                        value={career.role}
                        icon={<TrendingUp className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Employed in"
                        value={
                          ((career as any).industry ||
                            (career as any).employedIn) as string
                        }
                        icon={<Building2 className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Annual income"
                        value={basic.annualIncome}
                        icon={<IndianRupee className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Work location"
                        value={career.location}
                        icon={<MapPin className={cn('h-4', 'w-4')} />}
                      />
                    </div>
                  ) : (
                    <p className={cn('text-sm', 'text-slate-500')}>
                      Career details not shared.
                    </p>
                  )}
                </section>
              )}

              {/* Lifestyle & favourites */}
              {showLifestyleSection && (
                <section
                  id="section-lifestyle"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Film className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Lifestyle & Favourites
                    </p>
                  </div>
                  <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                    <InfoTile
                      label="Habits"
                      value={
                        (Array.isArray(lifestyle.habits) &&
                        lifestyle.habits.length > 0
                          ? lifestyle.habits.join(", ")
                          : "") as string
                      }
                      icon={<ClipboardList className={cn('h-4', 'w-4')} />}
                    />
                    <InfoTile
                      label="Assets"
                      value={
                        (Array.isArray(lifestyle.assets) &&
                        lifestyle.assets.length > 0
                          ? lifestyle.assets.join(", ")
                          : "") as string
                      }
                      icon={<Home className={cn('h-4', 'w-4')} />}
                    />
                  </div>
                  <div className="mt-4">
                    <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                      {favouriteTiles.map((tile) => (
                        <InfoTile
                          key={tile.key as string}
                          label={tile.label}
                          value={favourites[tile.key] as string}
                          icon={tile.icon}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
              {/* Partner preferences */}
              {showPartnerSection && (
                <section
                  id="section-partner"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-3', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Search className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Partner Preferences
                    </p>
                  </div>

                  <section
                    id="section-partner"
                    className={cn('mt-8', 'flex', 'justify-center', 'px-4', 'sm:px-6', 'lg:px-0')}
                  >
                    <div className={cn('w-full', 'max-w-5xl', 'rounded-xl', 'bg-white', 'shadow-[0_18px_45px_rgba(0,0,0,0.06)]', 'border', 'border-[#f4d6df]', 'overflow-hidden')}>
                      <div className={cn('h-[3px]', 'bg-gradient-to-r', 'from-[#f37488]', 'via-[#f9a37f]', 'to-[#f6c88a]')} />
                      <div className={cn('px-6', 'sm:px-10', 'py-6', 'sm:py-8', 'mb-4', 'text-center', 'space-y-10')}>
                        {
                          <p className={cn('text-sm', 'sm:text-base', 'font-medium', 'text-[#c0395b]', 'italic')}>
                            Looking For
                          </p>
                        }
                        {partnerPreferences.summary && (
                          <p className="">
                            {partnerPreferences.summary ||
                              partnerPreferences.description ||
                              "Partner preferences will appear here when shared."}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                  <div className={cn('space-y-5', 'text-sm', 'mt-4', 'text-slate-700')}>
                    <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                      <InfoTile
                        label="Height"
                        value={partnerBasic.heightRange}
                        icon={<Ruler className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Age"
                        value={partnerBasic.ageRange}
                        icon={<Calendar className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Marital status"
                        value={partnerBasic.maritalStatus}
                        icon={<HeartHandshake className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Kundli & astro"
                        value={partnerBasic.kundliAstro}
                        icon={<Star className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Caste"
                        value={partnerBasic.caste}
                        icon={<Sparkles className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Disability"
                        value={partnerBasic.disability}
                        icon={<UserX className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Religion"
                        value={partnerBasic.religion}
                        icon={<Feather className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Mother tongue"
                        value={partnerBasic.motherTongue}
                        icon={<Languages className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Preferred district"
                        value={partnerBasic.district}
                        icon={<MapPin className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Preferred state"
                        value={partnerBasic.state}
                        icon={<MapPin className={cn('h-4', 'w-4')} />}
                      />
                      <InfoTile
                        label="Country"
                        value={partnerBasic.country}
                        icon={<Globe className={cn('h-4', 'w-4')} />}
                      />
                    </div>

                    <div>
                      <div className={cn('flex', 'items-center', 'gap-2', 'mb-3', 'rounded-lg', 'bg-[#ffeef3]', 'px-4', 'py-3')}>
                        <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                          <School className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                        </div>
                        <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                          Education & Career
                        </p>
                      </div>
                      <div className={cn('grid', 'gap-3', 'sm:grid-cols-3')}>
                        <InfoTile
                          label="Education level"
                          value={partnerEdu.level}
                          icon={<GraduationCap className={cn('h-4', 'w-4')} />}
                        />
                        <InfoTile
                          label="Profession"
                          value={partnerEdu.profession}
                          icon={<Briefcase className={cn('h-4', 'w-4')} />}
                        />
                        <InfoTile
                          label="Earning"
                          value={partnerEdu.earning}
                          icon={<IndianRupee className={cn('h-4', 'w-4')} />}
                        />
                      </div>
                    </div>

                    <div>
                      <div className={cn('flex', 'items-center', 'gap-2', 'mb-3', 'rounded-lg', 'bg-[#ffeef3]', 'px-4', 'py-3')}>
                        <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                          <Coffee className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                        </div>
                        <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                          Lifestyle
                        </p>
                      </div>
                      <div className={cn('grid', 'gap-3', 'sm:grid-cols-3')}>
                        <InfoTile
                          label="Diet"
                          value={partnerLife.diet}
                          icon={<Utensils className={cn('h-4', 'w-4')} />}
                        />
                        <InfoTile
                          label="Smoking"
                          value={partnerLife.smoke}
                          icon={<CigaretteOff className={cn('h-4', 'w-4')} />}
                        />
                        <InfoTile
                          label="Drinking"
                          value={partnerLife.drink}
                          icon={<GlassWater className={cn('h-4', 'w-4')} />}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Address details */}
              <section
                id="section-address"
                className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
              >
                <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                  <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                    <MapPinned className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                  </div>
                  <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                    Address Details
                  </p>
                </div>
                <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                  {/* <InfoTile
                  label="Location"
                  value={basic.location as string}
                  icon={<MapPin className={cn('h-4', 'w-4')} />}
                /> */}
                  <InfoTile
                    label="Flat No. / Building"
                    value={(basic as any).residingFlatBuilding as string}
                    icon={<Building2 className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="City"
                    value={(basic as any).residingCity as string}
                    icon={<MapPin className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="District"
                    value={(basic as any).residingDistrict as string}
                    icon={<Map className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="State"
                    value={basic.residingState as string}
                    icon={<MapPin className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Pin code"
                    value={(basic as any).residingPincode as string}
                    icon={<Hash className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Country"
                    value={basic.residingCountry as string}
                    icon={<Globe className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Nationality"
                    value={basic.citizenship as string}
                    icon={<Globe className={cn('h-4', 'w-4')} />}
                  />
                </div>
              </section>

              {/* Contact & Identity (only for feed view to keep
                contact details private on public links) */}
              {isFeedView && (
                <section
                  id="section-contact-identity"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Home className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Contact &amp; Identity
                    </p>
                  </div>
                  <div className={cn('grid', 'gap-3', 'text-xs', 'text-rose-900', 'sm:grid-cols-2')}>
                    <InfoTile
                      label="Email"
                      value={contact.email as string}
                      icon={<Mail className={cn('w-3', 'h-3', 'text-rose-500')} />}
                    />
                    <InfoTile
                      label="Phone"
                      value={contact.phone as string}
                      icon={<Phone className={cn('w-3', 'h-3', 'text-rose-500')} />}
                    />
                    <InfoTile
                      label="Alternate phone"
                      value={(contact as any).alternatePhone as string}
                      icon={<Phone className={cn('w-3', 'h-3', 'text-rose-500')} />}
                    />
                    <InfoTile
                      label="Aadhaar status"
                      value={
                        String(
                          (profile as any)?.kycStatus || "NOT_VERIFIED",
                        ).toUpperCase() === "VERIFIED"
                          ? "Verified"
                          : "Not verified"
                      }
                      icon={<Fingerprint className={cn('w-3', 'h-3', 'text-rose-500')} />}
                    />
                  </div>
                </section>
              )}

              {/* Family & siblings */}
              {showFamilySection && (
                <section
                  id="section-family"
                  className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
                >
                  <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                    <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                      <Home className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                    </div>
                    <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                      Family Information
                    </p>
                  </div>
                  <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                    {hasValue((family as any).fatherName) && (
                      <InfoTile
                        label="Father's Name"
                        value={(family as any).fatherName as string}
                        icon={<User2 className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).fatherOccupation) && (
                      <InfoTile
                        label="Father's Occupation"
                        value={(family as any).fatherOccupation as string}
                        icon={<Briefcase className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).fatherBelongsFrom) && (
                      <InfoTile
                        label="Father belongs from (native)"
                        value={(family as any).fatherBelongsFrom as string}
                        icon={<MapPin className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).motherName) && (
                      <InfoTile
                        label="Mother's Name"
                        value={(family as any).motherName as string}
                        icon={<User2 className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).motherOccupation) && (
                      <InfoTile
                        label="Mother's occupation"
                        value={(family as any).motherOccupation as string}
                        icon={<Briefcase className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).motherBelongsFrom) && (
                      <InfoTile
                        label="Mother belongs from (native)"
                        value={(family as any).motherBelongsFrom as string}
                        icon={<MapPin className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue(family.familyBackground) && (
                      <InfoTile
                        label="Family background"
                        value={family.familyBackground as string}
                        icon={<Users className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue((family as any).familyValues) && (
                      <InfoTile
                        label="Family values"
                        value={(family as any).familyValues as string}
                        icon={<Sparkles className={cn('h-4', 'w-4')} />}
                      />
                    )}
                    {hasValue(basic.familyType) && (
                      <InfoTile
                        label="Family type"
                        value={basic.familyType}
                        icon={<Users className={cn('h-4', 'w-4')} />}
                      />
                    )}
                  </div>
                  {siblingDisplays.length > 0 && (
                    <div className="mt-5">
                      <div className={cn('flex', 'items-center', 'gap-2', 'mb-3', 'rounded-lg', 'bg-[#ffeef3]', 'px-4', 'py-3')}>
                        <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                          <Users className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                        </div>
                        <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                          Siblings
                        </p>
                      </div>
                      <div className={cn('grid', 'gap-3', 'sm:grid-cols-2')}>
                        {siblingDisplays.map((sibling, index) => (
                          <InfoTile
                            key={`${sibling.label}-${index}`}
                            label={sibling.label}
                            value={sibling.value}
                            icon={<User2 className={cn('h-4', 'w-4')} />}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Kundli & Astro */}
              <section
                id="section-kundli-astro"
                className={cn('mt-6', 'rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
              >
                <div className={cn('flex', 'items-center', 'gap-2', 'mb-4', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                  <div className={cn('h-7', 'w-7', 'rounded-full', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                    <Star className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                  </div>
                  <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                    Kundli & Astro
                  </p>
                </div>

                <div className={cn('grid', 'gap-3', 'text-xs', 'text-gray-700', 'sm:grid-cols-2')}>
                  <InfoTile
                    label="Birth date"
                    value={
                      formatDateOnly(
                        (kundli as any)?.birthDate || (basic as any)?.birthDate,
                      ) as string
                    }
                    icon={<Calendar className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Birth time"
                    value={(kundli as any)?.birthTime as string}
                    icon={<Timer className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Gotra"
                    value={basic.gothra as string}
                    icon={<Sparkles className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Nakshatra"
                    value={(kundli as any)?.nakshatra as string}
                    icon={<Sun className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Raashi"
                    value={(kundli as any)?.raashi as string}
                    icon={<Target className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Manglik"
                    value={(kundli as any)?.manglikStatus as string}
                    icon={<Link className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Astrology system"
                    value={(kundli as any)?.astrologySystem as string}
                    icon={<Orbit className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Horoscope preference"
                    value={(kundli as any)?.horoscopePreference as string}
                    icon={<Timer className={cn('h-4', 'w-4')} />}
                  />
                  <InfoTile
                    label="Dosha details"
                    value={(kundli as any)?.doshaDetails as string}
                    icon={<AlertTriangle className={cn('h-4', 'w-4')} />}
                  />
                </div>

                <div className={cn('grid', 'gap-3', 'mt-3', 'text-xs', 'text-gray-700', 'sm:grid-cols-1')}>
                  <InfoTile
                    label="Place of birth"
                    value={(() => {
                      const birthPlace = (kundli as any)?.birthPlace as
                        | string
                        | undefined;
                      const district = (kundli as any)?.birthDistrict as
                        | string
                        | undefined;
                      const state = (kundli as any)?.birthState as
                        | string
                        | undefined;
                      const country = (kundli as any)?.birthCountry as
                        | string
                        | undefined;

                      // If birthPlace already contains the full address, use it directly
                      if (birthPlace && birthPlace.trim()) {
                        return birthPlace.trim();
                      }

                      const parts = [district, state, country].filter(
                        (part): part is string => Boolean(part && part.trim()),
                      );
                      if (!parts.length) return "";

                      const deduped: string[] = [];
                      for (const part of parts) {
                        if (!deduped.includes(part)) {
                          deduped.push(part);
                        }
                      }
                      return deduped.join(", ");
                    })()}
                    icon={<MapPin className={cn('h-4', 'w-4')} />}
                  />
                </div>
              </section>

              {/* Additional notes */}

              {showAdditionalNotesSection && (
                <section
                  id="section-additionalNote"
                  className={cn('mt-8', 'flex', 'justify-center', 'px-4', 'sm:px-6', 'lg:px-0')}
                >
                  <div className={cn('w-full', 'max-w-5xl', 'rounded-xl', 'bg-white', 'shadow-[0_18px_45px_rgba(0,0,0,0.06)]', 'border', 'border-[#f4d6df]', 'overflow-hidden')}>
                    <div className={cn('h-[3px]', 'bg-gradient-to-r', 'from-[#f37488]', 'via-[#f9a37f]', 'to-[#f6c88a]')} />
                    <div className={cn('px-6', 'sm:px-10', 'py-6', 'sm:py-8', 'text-center', 'space-y-10')}>
                      {
                        <p className={cn('text-sm', 'sm:text-base', 'font-medium', 'text-[#c0395b]', 'italic')}>
                          Additional Notes
                        </p>
                      }
                      <p className={cn('text-sm', 'leading-relaxed', 'text-[#4b313e]', 'whitespace-pre-line')}>
                        {full.additionalNotes}
                      </p>
                      {/* {!commentsLoading && comments.length > 0 && (
                    <div className={cn('pt-2', 'border-t', 'border-rose-100', 'text-left')}>
                      <p className={cn('text-[11px]', 'font-semibold', 'tracking-[0.14em]', 'uppercase', 'text-rose-400', 'mb-2')}>
                        Comments from families
                      </p>
                      <div className={cn('space-y-2', 'max-h-56', 'overflow-y-auto', 'pr-1')}>
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={cn('rounded-xl', 'border', 'border-rose-100', 'bg-rose-50/80', 'px-3', 'py-2')}
                          >
                            <div className={cn('flex', 'items-center', 'justify-between', 'gap-2')}>
                              <div className={cn('flex', 'items-center', 'gap-1.5', 'min-w-0')}>
                                <MessageCircle className={cn('h-3', 'w-3', 'text-rose-500', 'shrink-0')} />
                                {comment.actorProfileId ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof window === "undefined") return;
                                      window.location.href = `/feed/profile/${comment.actorProfileId}`;
                                    }}
                                    className={cn('text-[11px]', 'font-semibold', 'text-rose-800', 'truncate', 'hover:underline', 'text-left')}
                                  >
                                    {comment.actorDisplayName || "Member"}
                                  </button>
                                ) : (
                                  <p className={cn('text-[11px]', 'font-semibold', 'text-rose-800', 'truncate')}>
                                    {comment.actorDisplayName || "Member"}
                                  </p>
                                )}
                              </div>
                              {comment.createdAt && (
                                <p className={cn('text-[10px]', 'text-rose-400', 'shrink-0')}>
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString(undefined, {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </p>
                              )}
                            </div>
                            {comment.text && (
                              <p className={cn('mt-1', 'text-[11px]', 'text-rose-700', 'whitespace-pre-line')}>
                                {comment.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {commentsLoading && (
                    <p className={cn('text-[11px]', 'text-rose-300')}>
                      Loading comments…
                    </p>
                  )}
                  {!commentsLoading && commentsError && (
                    <p className={cn('text-[11px]', 'text-rose-400')}>
                      {commentsError || "Couldn't load comments."}
                    </p>
                  )} */}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right column: gallery + contact (sticky on larger screens) */}
            <div
              className={cn('space-y-6', 'lg:sticky', 'lg:top-28', 'self-start')}
              id="section-contact"
            >
              <section
                id="section-gallery"
                className={cn('rounded-lg', 'bg-white', 'px-5', 'py-5', 'sm:px-6', 'sm:py-6', 'shadow-sm', 'border', 'border-rose-100')}
              >
                <div className={cn('flex', 'items-center', 'gap-2', 'mb-3', '-mx-5', '-mt-6', '-ml-6', '-mr-6', 'px-5', 'py-3', 'rounded-lg', 'bg-[#ffeef3]', 'border-b', 'border-rose-100')}>
                  <div className={cn('h-7', 'w-7', 'rounded-lg', 'bg-rose-100', 'flex', 'items-center', 'justify-center')}>
                    <Camera className={cn('w-3.5', 'h-3.5', 'text-rose-600')} />
                  </div>
                  <p className={cn('text-sm', 'font-semibold', 'text-rose-900')}>
                    Photo Gallery
                  </p>
                </div>
                {photos.length > 0 ? (
                  <div className={cn('mt-3', 'grid', 'gap-3', 'grid-cols-2')}>
                    {photos.slice(0, 4).map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => openPhotoAtIndex(index)}
                        className={cn('overflow-hidden', 'aspect-square', 'rounded-lg', 'border', 'border-rose-100', 'relative', 'focus:outline-none')}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || "Gallery photo"}
                          className={cn('h-full', 'w-full')}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={cn('text-sm', 'text-slate-500')}>
                    Photos will appear here once shared.
                  </p>
                )}
              </section>

              <section className={cn('rounded-lg', 'bg-rose-600', 'px-5', 'py-6', 'sm:px-6', 'sm:py-7', 'shadow-sm', 'text-white')}>
                <p className={cn('text-sm', 'font-semibold')}>Interested?</p>
                <p className={cn('mt-1', 'text-xs', 'text-rose-100')}>
                  Connect with the family directly to take the conversation
                  forward.
                  {!isFeedView && (
                    <>
                      <br></br>
                      <br></br>
                      Contact details are shared after interest is confirmed on
                      {"  "}
                      <a
                        href="https://matrimony.qrfolio.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('text-blue-950', 'hover:underline', 'font-medium')}
                      >
                        https://matrimony.qrfolio.net
                      </a>
                    </>
                  )}
                </p>

                {isFeedView && (
                  <div className={cn('mt-4', 'space-y-3', 'text-xs')}>
                    {emailAddress && (
                      <a
                        href={emailHref}
                        className={cn('flex', 'items-center', 'gap-2', 'rounded-2xl', 'bg-white/10', 'px-3', 'py-2', 'hover:bg-white/15')}
                      >
                        <Mail className={cn('h-3.5', 'w-3.5')} />
                        <span className="truncate">{emailAddress}</span>
                      </a>
                    )}
                    {primaryPhone && (
                      <a
                        href={phoneHref}
                        className={cn('flex', 'items-center', 'gap-2', 'rounded-2xl', 'bg-white/10', 'px-3', 'py-2', 'hover:bg-white/15')}
                      >
                        <Phone className={cn('h-3.5', 'w-3.5')} />
                        <span>{primaryPhone}</span>
                      </a>
                    )}
                  </div>
                )}
              </section>
            </div>
          </section>
        )}

        <footer className={cn('mt-12', 'max-w-4xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-0', 'text-center', 'text-[11px]', 'text-rose-400')}>
          <p> 2025 MatrimonyOne. All rights reserved.</p>
          <p className="mt-1">Privacy Policy • Terms of Service</p>
        </footer>
      </div>

      {/* Photo lightbox */}
      {activePhoto && (
        <div
          className={cn('fixed', 'inset-0', 'z-40', 'flex', 'items-center', 'justify-center', 'bg-black/90', 'backdrop-blur-sm', 'px-4')}
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className={cn('relative', 'max-w-3xl', 'w-full')}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className={cn('absolute', '-top-10', 'right-2', 'h-7', 'w-7', 'rounded-lg', 'bg-white/90', 'text-slate-800', 'text-sm', 'font-semibold', 'shadow', 'flex', 'items-center', 'justify-center')}
            >
              ×
            </button>
            {hasMultiplePhotos && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className={cn('absolute', 'left-4', 'sm:left-8', 'top-1/2', '-translate-y-1/2', 'h-8', 'w-8', 'rounded-lg', 'bg-white/90', 'text-slate-800', 'shadow', 'flex', 'items-center', 'justify-center')}
                >
                  <ChevronLeft className={cn('h-4', 'w-4')} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNextPhoto();
                  }}
                  className={cn('absolute', 'right-4', 'sm:right-8', 'top-1/2', '-translate-y-1/2', 'h-8', 'w-8', 'rounded-lg', 'bg-white/90', 'text-slate-800', 'shadow', 'flex', 'items-center', 'justify-center')}
                >
                  <ChevronRight className={cn('h-4', 'w-4')} />
                </button>
              </>
            )}
            <div className={cn('overflow-hidden', 'rounded-lg')}>
              <img
                src={activePhoto?.url || ""}
                alt={activePhoto?.caption || "Gallery photo"}
                className={cn('max-h-[80vh]', 'w-full', 'object-contain')}
              />
            </div>
            {activePhoto && activePhoto.caption && (
              <p className={cn('mt-2', 'text-xs', 'text-slate-200', 'text-center')}>
                {activePhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
      {isFeedView && (
        <NotificationsDrawer
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          fromAnalytics={false}
        />
      )}
    </motion.section>
  );
};
