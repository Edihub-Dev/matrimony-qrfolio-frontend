import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMyMatrimonyProfile } from "../lib/matrimonyApi";
import { getInteractionAnalytics } from "../lib/analyticsApi";
import {
  User2,
  ArrowRight,
  Briefcase,
  School,
  User,
  Home,
  Leaf,
  Sparkles,
  Film,
  Heart,
  Phone,
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
  Sun,
  Users,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Timer,
  Orbit,
  Target,
  AlertTriangle,
  Link,
  Church,
  MapPinned,
  Ruler,
  Mail,
  Fingerprint,
  Star,
  MessageCircle,
  Weight,
  UserX,
  Laptop,
  Building,
  TrendingUp,
  Bike,
  UtensilsCrossed,
  Shirt,
  Book,
  Camera,
  Plane,
  Popcorn,
  Goal,
  Calendar,
  Clock,
  Music,
  IndianRupee,
  Calendar1,
  UserIcon,
  Handshake,
  Coffee,
  Eye,
  Search,
} from "lucide-react";

type Props = {
  onEditProfile?: () => void;
};
const formatDateOnly = (value: any): string | undefined => {
  if (!value) return undefined;
  const raw = typeof value === "string" ? value : String(value);
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  return raw;
};

const calculateAgeFromDate = (value: any): string => {
  if (!value) return "";
  const raw = typeof value === "string" ? value : String(value);
  const dob = new Date(raw);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years -= 1;
  }
  return years > 0 ? String(years) : "";
};

export const MatrimonyDashboardOverview: React.FC<Props> = ({
  onEditProfile,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [accountName, setAccountName] = useState<string>("");
  const [profileViews, setProfileViews] = useState<number>(0);
  const [pendingInterests, setPendingInterests] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      try {
        const next = window.localStorage.getItem("qrName") || "";
        setAccountName(next);
      } catch {
        setAccountName("");
      }
    };

    sync();
    window.addEventListener("qrProfileNameUpdated", sync as any);

    return () => {
      window.removeEventListener("qrProfileNameUpdated", sync as any);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        if (!result.ok) {
          if (result.notFound) {
            setProfile(null);
            setError(null);
          } else if (result.authError) {
            setError(
              result.message || "Please login again to view your profile."
            );
          } else {
            setError(result.error || "Failed to load your matrimony profile.");
          }
          setLoading(false);
          return;
        }

        setProfile(result.profile);
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

  const {
    full,
    basic,
    about,
    career,
    education,
    family,
    contact,
    lifestyle,
    favourites,
    partnerPreferences,
    partnerBasic,
    partnerEdu,
    partnerLife,
  } = useMemo(() => {
    const fullProfile = profile?.fullProfile || {};
    const lifestyleSection = fullProfile.lifestyle || {};
    const partnerPrefs = fullProfile.partnerPreferences || {};
    const basicPartner = partnerPrefs.basicDetails || {};
    const eduPartner = partnerPrefs.education || {};
    const lifePartner = partnerPrefs.lifestyle || {};

    return {
      full: fullProfile,
      basic: fullProfile.basicDetails || {},
      about: fullProfile.about || {},
      career: fullProfile.career || {},
      education: fullProfile.education || {},
      family: fullProfile.family || {},
      contact: fullProfile.contact || {},
      lifestyle: lifestyleSection,
      favourites: lifestyleSection.favourites || {},
      partnerPreferences: partnerPrefs,
      partnerBasic: basicPartner,
      partnerEdu: eduPartner,
      partnerLife: lifePartner,
    };
  }, [profile]);

  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !Number.isNaN(value);
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  const stepCompletion = useMemo(() => {
    const kundli = (full as any)?.kundli || {};

    const steps: Array<{ label: string; ok: boolean }> = [
      {
        label: "Basic details",
        ok:
          hasValue(basic.birthDate) &&
          hasValue((basic as any).gender) &&
          hasValue(basic.maritalStatus) &&
          hasValue((about as any).profileCreatedBy),
      },
      {
        label: "Religion & community",
        ok:
          hasValue(basic.religion) &&
          hasValue(basic.caste) &&
          hasValue(basic.motherTongue) &&
          hasValue(basic.gothra) &&
          hasValue(kundli.motherGotra) &&
          hasValue(kundli.dadiGotra) &&
          hasValue(kundli.naniGotra),
      },
      {
        label: "Location details",
        ok:
          hasValue(basic.residingState) &&
          hasValue(basic.residingCountry) &&
          hasValue((basic as any).residingPincode),
      },
      {
        label: "Physical information",
        ok:
          hasValue(basic.height) &&
          hasValue((basic as any).weight) &&
          hasValue((basic as any).bodyType) &&
          hasValue((basic as any).complexion) &&
          hasValue((basic as any).bloodGroup) &&
          hasValue(basic.physicalStatus),
      },
      {
        label: "Contact & identity",
        ok:
          hasValue(contact.email) &&
          hasValue(contact.phone) &&
          hasValue((contact as any).alternatePhone) &&
          hasValue((contact as any).aadhaarStatus),
      },
      {
        label: "Family information",
        ok:
          hasValue((family as any).fatherName) &&
          hasValue((family as any).motherName) &&
          hasValue(family.familyBackground) &&
          hasValue(basic.familyType) &&
          hasValue(family.livingWithParents),
      },
      {
        label: "Kundli & astro",
        ok:
          hasValue(kundli.manglikStatus) &&
          hasValue(kundli.nakshatra) &&
          hasValue(kundli.raashi) &&
          hasValue(kundli.birthTime) &&
          hasValue(kundli.birthCountry) &&
          hasValue(kundli.birthState) &&
          hasValue(kundli.birthDistrict) &&
          hasValue(kundli.astrologySystem) &&
          hasValue(kundli.horoscopePreference) &&
          hasValue(kundli.doshaDetails),
      },
      {
        label: "Education details",
        ok:
          hasValue(education.description) &&
          hasValue(education.level) &&
          hasValue(education.degree) &&
          hasValue(education.field) &&
          hasValue(education.college) &&
          hasValue(education.year),
      },
      {
        label: "Professional details",
        ok:
          hasValue(career.role) &&
          hasValue((career as any).industry || (career as any).employedIn) &&
          hasValue(career.location) &&
          hasValue(basic.annualIncome),
      },
      {
        label: "Lifestyle & favourites",
        ok:
          hasValue(lifestyle.habits) &&
          hasValue(lifestyle.assets) &&
          hasValue(favourites.hobbies) &&
          hasValue(favourites.interests) &&
          hasValue(favourites.languages) &&
          hasValue(favourites.music) &&
          hasValue(favourites.cuisine) &&
          hasValue(favourites.clothingStyle) &&
          hasValue(favourites.sports) &&
          hasValue(favourites.canCook) &&
          hasValue(favourites.travel) &&
          hasValue(favourites.shows) &&
          hasValue(favourites.books) &&
          hasValue(favourites.movies) &&
          hasValue(favourites.outdoor) &&
          hasValue(favourites.indoor) &&
          hasValue(favourites.bucketList) &&
          hasValue(favourites.values) &&
          hasValue(favourites.quirks) &&
          hasValue(favourites.weekend),
      },
      {
        label: "Partner preferences",
        ok:
          hasValue(
            partnerPreferences.summary || partnerPreferences.description
          ) &&
          hasValue(partnerBasic.heightRange) &&
          hasValue(partnerBasic.ageRange) &&
          hasValue(partnerBasic.maritalStatus) &&
          hasValue(partnerBasic.kundliAstro) &&
          hasValue(partnerBasic.caste) &&
          hasValue(partnerBasic.disability) &&
          hasValue(partnerBasic.religion) &&
          hasValue(partnerBasic.motherTongue) &&
          hasValue((partnerBasic as any).state) &&
          hasValue((partnerBasic as any).district) &&
          hasValue(partnerBasic.country) &&
          hasValue(partnerEdu.level) &&
          hasValue(partnerEdu.profession) &&
          hasValue(partnerEdu.earning) &&
          hasValue(partnerLife.diet) &&
          hasValue(partnerLife.smoke) &&
          hasValue(partnerLife.drink),
      },
      {
        label: "About you",
        ok: hasValue(about.summary) && hasValue((full as any).headline),
      },
      {
        label: "Additional notes",
        ok: hasValue((full as any).additionalNotes),
      },
    ];

    const completed = steps.filter((step) => step.ok).length;
    const total = steps.length || 1;
    const percent = Math.min(100, Math.round((completed / total) * 100));

    return {
      steps,
      completed,
      total,
      percent,
    };
  }, [
    about,
    basic,
    career,
    contact,
    education,
    family,
    favourites,
    full,
    lifestyle,
    partnerBasic,
    partnerEdu,
    partnerLife,
    partnerPreferences,
  ]);

  const completion = stepCompletion.percent;

  const completionHint = useMemo(() => {
    if (stepCompletion.percent >= 100) {
      return {
        text: "Your profile is complete. You're all set to get better matches.",
        isComplete: true,
      };
    }

    const missingSteps = stepCompletion.steps
      .filter((step) => !step.ok)
      .map((step) => step.label);
    const next = missingSteps.slice(0, 2).join(" and ");

    return {
      text: next
        ? `Please complete ${next} to improve your profile visibility.`
        : "Please complete your remaining steps to improve your profile visibility.",
      isComplete: false,
    };
  }, [stepCompletion]);

  const refreshStats = useCallback(async () => {
    try {
      const [viewedResult, likedResult] = await Promise.all([
        getInteractionAnalytics("viewed_me", 1, 50),
        getInteractionAnalytics("liked_me", 1, 50),
      ]);

      if (viewedResult.ok) {
        const viewedItems = viewedResult.data.items || [];
        const count = viewedItems.reduce(
          (sum, item: any) =>
            sum +
            (typeof item.interactionCount === "number"
              ? item.interactionCount
              : 1),
          0
        );
        setProfileViews(count);
      }

      if (likedResult.ok) {
        const likedItems = likedResult.data.items || [];
        const count = likedItems.reduce(
          (sum, item: any) =>
            sum +
            (typeof item.interactionCount === "number"
              ? item.interactionCount
              : 1),
          0
        );
        setPendingInterests(count);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    void refreshStats();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshStats();
      }
    };

    const handleFocus = () => {
      void refreshStats();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(
      "qrMatrimonyInteractionsUpdated",
      handleFocus as any
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(
        "qrMatrimonyInteractionsUpdated",
        handleFocus as any
      );
    };
  }, [refreshStats]);

  const renderFieldTile = (
    label: string,
    value?: string | null,
    icon?: React.ReactNode,
    key?: React.Key
  ) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return null;
    }

    const display = trimmed;

    return (
      <div
        key={key}
        className="flex items-center gap-3 rounded-xl bg-white border border-rose-100 px-4 py-3 shadow-sm"
      >
        <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          {icon || <Sparkles className="w-4 h-4" />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-rose-400 uppercase">
            {label}
          </span>
          <span className="text-[13px] font-medium text-rose-900">
            {display}
          </span>
        </div>
      </div>
    );
  };

  type SiblingDisplay = {
    label: string;
    value: string;
  };

  const parseSiblingTiles = (raw?: string | null): SiblingDisplay[] => {
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
        if (relationPart) {
          detailParts.push(relationPart);
        }
        if (occupation) {
          detailParts.push(occupation);
        }
        if (maritalStatus) {
          detailParts.push(maritalStatus);
        }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading your dashboard</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#f2e6ea] bg-white px-4 py-6 text-sm text-[#9c6b79] shadow-sm">
        {error}
      </div>
    );
  }

  const displayName =
    about.profileManagedBy ||
    basic.fullName ||
    accountName ||
    "Matrimony profile";
  const greetingName = (displayName || "").trim().split(" ")[0] || displayName;

  const age = (() => {
    const fromProfile = (profile && (profile as any).age) as any;
    const normalized =
      typeof fromProfile === "number" || typeof fromProfile === "string"
        ? String(fromProfile).trim()
        : "";
    if (normalized) return normalized;

    const birthValue =
      (basic as any)?.birthDate ||
      (full && (full as any).kundli && (full as any).kundli.birthDate);
    return calculateAgeFromDate(birthValue);
  })();

  const showAboutSection =
    hasValue(about.summary) || hasValue((full as any).headline);

  const showBasicSection =
    hasValue(displayName) ||
    hasValue(formatDateOnly((basic as any).birthDate)) ||
    hasValue(age) ||
    hasValue((about as any).profileCreatedBy) ||
    hasValue(basic.maritalStatus) ||
    hasValue(basic.gender);

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

  const showProfessionalSection =
    hasValue(career.role) ||
    hasValue((career as any).company) ||
    hasValue((career as any).industry || (career as any).employedIn) ||
    hasValue(basic.annualIncome) ||
    hasValue(career.location);

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

  const showAddressSection =
    hasValue((basic as any).residingFlatBuilding) ||
    hasValue(basic.residingCity) ||
    hasValue((basic as any).residingDistrict) ||
    hasValue(basic.residingState) ||
    hasValue((basic as any).residingPincode) ||
    hasValue(basic.residingCountry) ||
    hasValue(basic.citizenship);

  const showContactSection =
    hasValue(contact.email) ||
    hasValue(contact.phone) ||
    hasValue((contact as any).alternatePhone) ||
    hasValue((contact as any).aadhaarStatus);

  const showFamilySection =
    hasValue((family as any).fatherName) ||
    hasValue((family as any).fatherOccupation) ||
    hasValue((family as any).fatherBelongsFrom) ||
    hasValue((family as any).motherName) ||
    hasValue((family as any).motherOccupation) ||
    hasValue((family as any).motherBelongsFrom) ||
    hasValue(family.familyBackground) ||
    hasValue((family as any).familyValues) ||
    hasValue(basic.familyStatus) ||
    hasValue(basic.familyType) ||
    typeof family.livingWithParents === "boolean" ||
    parseSiblingTiles(family.siblings as string | undefined).length > 0;

  const kundli = (full as any)?.kundli || {};

  const showReligionSection =
    hasValue(basic.religion) ||
    hasValue(basic.caste) ||
    hasValue(basic.motherTongue) ||
    hasValue(basic.gothra) ||
    hasValue(kundli.motherGotra) ||
    hasValue(kundli.dadiGotra) ||
    hasValue(kundli.naniGotra);

  const showKundliSection =
    hasValue(kundli.birthTime) ||
    hasValue(kundli.birthDistrict) ||
    hasValue(kundli.birthState) ||
    hasValue(kundli.birthCountry) ||
    hasValue(kundli.birthPlace) ||
    hasValue(kundli.nakshatra) ||
    hasValue(kundli.raashi) ||
    hasValue(kundli.manglikStatus) ||
    hasValue(kundli.astrologySystem) ||
    hasValue(kundli.horoscopePreference) ||
    hasValue(kundli.doshaDetails);

  const showAdditionalNotesSection = hasValue((full as any).additionalNotes);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#2e1d22] text-3xl font-extrabold tracking-tight">
            Namaste, {greetingName} <span className="text-[#f07f9c]">.</span>
          </h1>
          <p className="text-[#9c6b79] text-base">
            Welcome back to your search for a life partner.
          </p>
        </div>
        <div className="text-sm text-[#9c6b79] font-semibold bg-white px-4 py-2 rounded-full border border-[#f2e6ea] shadow-sm flex items-center gap-2">
          <span
            className={
              "block size-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] " +
              (isOnline
                ? "bg-green-500"
                : "bg-gray-300 shadow-[0_0_8px_rgba(148,163,184,0.25)]")
            }
          />
          {isOnline ? "Online Now" : "Offline"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#f2e6ea] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#f07f9c]/5 rounded-full blur-3xl group-hover:bg-[#f07f9c]/10 transition-all duration-500" />
          <div className="flex flex-col sm:flex-row gap-8 items-center relative z-10">
            <div className="relative size-28 shrink-0">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path
                  className="text-[#fcf2f4]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className="text-[#f07f9c] drop-shadow-sm transition-all duration-1000 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completion}, 100`}
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-extrabold text-[#2e1d22]">
                  {completion}%
                </span>
                <span className="text-[9px] font-bold text-[#9c6b79] uppercase tracking-wider">
                  Done
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#2e1d22]">
                Complete your profile to get better matches
              </h3>
              <p className="text-sm text-[#9c6b79] leading-relaxed">
                {completionHint.text}{" "}
                {!completionHint.isComplete && (
                  <span className="font-bold text-[#e06886]">2x</span>
                )}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="text-sm font-bold text-[#f07f9c] hover:text-[#e06886] flex items-center justify-center sm:justify-start gap-2 transition-colors"
                >
                  Update Details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#f2e6ea] flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group">
            <div className="size-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#2e1d22] group-hover:text-blue-700 transition-colors">
                {profileViews}
              </p>
              <p className="text-sm font-medium text-[#9c6b79]">
                Profile Views
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#f2e6ea] flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group">
            <div className="size-12 rounded-full bg-[#fceef2] group-hover:bg-[#f07f9c]/15 flex items-center justify-center text-[#f07f9c] transition-colors">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#2e1d22] group-hover:text-[#e06886] transition-colors">
                {pendingInterests}
              </p>
              <p className="text-sm font-medium text-[#9c6b79]">
                Pending Interests
              </p>
            </div>
          </div>
        </div>
      </div>
      {showAboutSection && (
        <div className="rounded-2xl bg-white shadow-sm border border-rose-100 overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-[#ff4f7a] via-[#ff9aa6] to-[#ffb35a]" />
          <div className="px-6 py-6">
            <p className="text-center text-sm font-semibold italic text-[#e11d48]">
              About me
            </p>
            <div className="mt-4 min-h-[70px] flex items-center justify-center px-4">
              <p className="text-center text-sm text-[#3b2430] whitespace-pre-line">
                {about.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {showBasicSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <User2 className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Basic Details
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Full name",
                displayName,
                <User className="w-4 h-4" />
              )}
              {renderFieldTile(
                "Date of birth",
                formatDateOnly((basic as any).birthDate) as string | undefined,
                <Calendar1 className="w-4 h-4" />
              )}
              {renderFieldTile(
                "Age",
                age ? `${age} yrs` : "",
                <Users className="w-4 h-4" />
              )}
              {renderFieldTile(
                "Profile created by",
                (about as any).profileCreatedBy as string | undefined,
                <UserIcon className="w-4 h-4" />
              )}
              {renderFieldTile(
                "Marital status",
                basic.maritalStatus,
                <Handshake className="w-4 h-4" />
              )}
              {renderFieldTile(
                "Gender",
                basic.gender as string | undefined,
                <Users className="w-4 h-4" />
              )}
            </div>
          </div>
        )}

        {showPhysicalSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Ruler className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Physical Information
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Height",
                basic.height,
                <Ruler className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Weight",
                (basic as any).weight as string | undefined,
                <Weight className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Body type",
                (basic as any).bodyType as string | undefined,
                <Footprints className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Complexion",
                (basic as any).complexion as string | undefined,
                <Palette className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Blood group",
                (basic as any).bloodGroup as string | undefined,
                <Syringe className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Physical status",
                basic.physicalStatus,
                <ClipboardList className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showEducationSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <School className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Education Details
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Highest Education",
                education.description as string | undefined,
                <Laptop className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Level",
                education.level,
                <GraduationCap className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Degree",
                education.degree,
                <GraduationCap className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Field",
                education.field,
                <Laptop className="h-4 w-4" />
              )}
              {renderFieldTile(
                "College",
                education.college,
                <Building2 className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Year",
                education.year,
                <Calendar className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showProfessionalSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Professional Details
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Occupation",
                career.role,
                <TrendingUp className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Company",
                (career as any).company,
                <Building className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Employed in",
                ((career as any).industry || (career as any).employedIn) as
                  | string
                  | undefined,
                <Building2 className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Annual income",
                basic.annualIncome as string | undefined,
                <IndianRupee className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Work location",
                career.location,
                <MapPin className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showLifestyleSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Film className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Lifestyle & Favourites
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Habits",
                Array.isArray(lifestyle.habits) && lifestyle.habits.length > 0
                  ? lifestyle.habits.join(", ")
                  : "",
                <ClipboardList className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Assets",
                Array.isArray(lifestyle.assets) && lifestyle.assets.length > 0
                  ? lifestyle.assets.join(", ")
                  : "",
                <Home className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Hobbies",
                favourites.hobbies as string | undefined,
                <Camera className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Interests",
                favourites.interests as string | undefined,
                <Book className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Languages",
                favourites.languages as string | undefined,
                <Languages className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Music",
                favourites.music as string | undefined,
                <Music className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Cuisine",
                favourites.cuisine as string | undefined,
                <UtensilsCrossed className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Clothing style",
                favourites.clothingStyle as string | undefined,
                <Shirt className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Sports / fitness",
                favourites.sports as string | undefined,
                <Bike className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Can cook",
                favourites.canCook as string | undefined,
                <UtensilsCrossed className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Travel style",
                favourites.travel as string | undefined,
                <Plane className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Favourite shows",
                favourites.shows as string | undefined,
                <Popcorn className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Favourite books",
                favourites.books as string | undefined,
                <Book className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Favourite movies",
                favourites.movies as string | undefined,
                <Film className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Outdoor activities",
                favourites.outdoor as string | undefined,
                <Building className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Indoor activities",
                favourites.indoor as string | undefined,
                <Building className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Bucket list",
                favourites.bucketList as string | undefined,
                <Goal className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Core values",
                favourites.values as string | undefined,
                <Sparkles className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Fun quirks",
                favourites.quirks as string | undefined,
                <Clock className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Ideal weekend",
                favourites.weekend as string | undefined,
                <Calendar className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showPartnerSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Partner Preferences
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-rose-100 overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-[#ff4f7a] via-[#ff9aa6] to-[#ffb35a]" />
              <div className="px-6 py-7">
                <p className="text-center text-base font-semibold italic text-[#e11d48]">
                  Looking For
                </p>
                <div className="mt-5 min-h-[90px] flex items-center justify-center px-4">
                  <p className="text-center text-base text-[#3b2430] whitespace-pre-line">
                    {partnerPreferences.summary ||
                      partnerPreferences.description ||
                      "Partner preferences will appear here when shared."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Height",
                partnerBasic.heightRange as string | undefined,
                <Ruler className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Age",
                partnerBasic.ageRange as string | undefined,
                <Calendar className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Marital status",
                partnerBasic.maritalStatus as string | undefined,
                <HeartHandshake className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Kundli & astro",
                partnerBasic.kundliAstro as string | undefined,
                <Star className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Caste",
                partnerBasic.caste as string | undefined,
                <Sparkles className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Disability",
                partnerBasic.disability as string | undefined,
                <UserX className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Religion",
                partnerBasic.religion as string | undefined,
                <Feather className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Mother tongue",
                partnerBasic.motherTongue as string | undefined,
                <Languages className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Preferred location",
                partnerBasic.city ||
                  partnerBasic.country ||
                  (partnerBasic as any).state ||
                  (partnerBasic as any).district
                  ? [
                      (partnerBasic as any).district,
                      (partnerBasic as any).state,
                      partnerBasic.city,
                      partnerBasic.country,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "",
                <MapPin className="h-4 w-4" />
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-[#ffeef3] px-4 py-3">
                <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                  <School className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <p className="text-sm font-semibold text-rose-900">
                  Education & Career
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {renderFieldTile(
                  "Education level",
                  partnerEdu.level as string | undefined,
                  <GraduationCap className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Profession",
                  partnerEdu.profession as string | undefined,
                  <Briefcase className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Earning",
                  partnerEdu.earning as string | undefined,
                  <IndianRupee className="h-4 w-4" />
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-[#ffeef3] px-4 py-3">
                <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                  <Coffee className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <p className="text-sm font-semibold text-rose-900">Lifestyle</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {renderFieldTile(
                  "Diet",
                  partnerLife.diet as string | undefined,
                  <Utensils className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Smoking",
                  partnerLife.smoke as string | undefined,
                  <CigaretteOff className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Drinking",
                  partnerLife.drink as string | undefined,
                  <GlassWater className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        )}

        {showAddressSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <MapPinned className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Address Details
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Flat No. / Building",
                (basic as any).residingFlatBuilding as string | undefined,
                <Building2 className="h-4 w-4" />
              )}
              {renderFieldTile(
                "City",
                basic.residingCity as string | undefined,
                <MapPin className="h-4 w-4" />
              )}
              {renderFieldTile(
                "District",
                (basic as any).residingDistrict as string | undefined,
                <Map className="h-4 w-4" />
              )}
              {renderFieldTile(
                "State",
                basic.residingState as string | undefined,
                <MapPin className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Pin code",
                (basic as any).residingPincode as string | undefined,
                <Hash className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Country",
                basic.residingCountry as string | undefined,
                <Globe className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Nationality",
                basic.citizenship as string | undefined,
                <Globe className="h-4 w-4" />
              )}
              {/* {renderFieldTile("Location", basic.location as string | undefined)} */}
            </div>
          </div>
        )}

        {showContactSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Fingerprint className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Contact &amp; Identity
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Email",
                contact.email,
                <Mail className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Phone",
                contact.phone,
                <Phone className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Alternate phone",
                (contact as any).alternatePhone as string | undefined,
                <Phone className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Aadhaar status",
                (contact as any).aadhaarStatus as string | undefined,
                <Fingerprint className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showFamilySection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Family Information
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Father's name",
                (family as any).fatherName as string | undefined,
                <User2 className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Father's occupation",
                (family as any).fatherOccupation as string | undefined,
                <Briefcase className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Father belongs from (native)",
                (family as any).fatherBelongsFrom as string | undefined,
                <MapPin className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Mother's name",
                (family as any).motherName as string | undefined,
                <User2 className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Mother's occupation",
                (family as any).motherOccupation as string | undefined,
                <Briefcase className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Mother belongs from (native)",
                (family as any).motherBelongsFrom as string | undefined,
                <MapPin className="h-4 w-4" />
              )}

              {renderFieldTile(
                "Family background",
                family.familyBackground as string | undefined,
                <Users className="h-4 w-4" />
              )}

              {renderFieldTile(
                "Family values",
                (family as any).familyValues as string | undefined,
                <Sparkles className="h-4 w-4" />
              )}

              {renderFieldTile(
                "Family status",
                basic.familyStatus as string | undefined
              )}
              {renderFieldTile(
                "Family type",
                basic.familyType as string | undefined,
                <Users className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Living with parents",
                typeof family.livingWithParents === "boolean"
                  ? family.livingWithParents
                    ? "Living with parents"
                    : "Living Alone"
                  : "",
                <Users className="h-4 w-4" />
              )}
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-[#ffeef3] px-4 py-3">
                <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <p className="text-sm font-semibold text-rose-900">Siblings</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {parseSiblingTiles(family.siblings as string | undefined).map(
                  (sibling: SiblingDisplay, index: number) =>
                    renderFieldTile(
                      sibling.label,
                      sibling.value,
                      <User2 className="h-4 w-4" />,
                      `${sibling.label}-${index}`
                    )
                )}
              </div>
            </div>
          </div>
        )}

        {showReligionSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Church className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Religion &amp; Community
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Religion",
                basic.religion,
                <Feather className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Caste / community",
                basic.caste,
                <Sparkles className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Mother tongue",
                basic.motherTongue,
                <Languages className="h-4 w-4" />
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-[#ffeef3] px-4 py-3">
                <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <p className="text-sm font-semibold text-rose-900">Gotra</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {renderFieldTile(
                  "Self gotra",
                  basic.gothra as string | undefined,
                  <Sparkles className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Mother gotra",
                  (full.kundli as any)?.motherGotra as string | undefined,
                  <Sparkles className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Grandmother (Dadi) gotra",
                  (full.kundli as any)?.dadiGotra as string | undefined,
                  <Sparkles className="h-4 w-4" />
                )}
                {renderFieldTile(
                  "Grandmother (Nani) gotra",
                  (full.kundli as any)?.naniGotra as string | undefined,
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        )}

        {showKundliSection && (
          <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-4 -mx-5 -mt-6 -ml-6 -mr-6 px-5 py-3 rounded-lg bg-[#ffeef3] border-b border-rose-100">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-900">
                Kundli &amp; Astro
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderFieldTile(
                "Birth date",
                formatDateOnly(basic.birthDate) as string | undefined,
                <Calendar className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Birth time",
                (full.kundli as any)?.birthTime as string | undefined,
                <Timer className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Gotra",
                basic.gothra as string | undefined,
                <Sparkles className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Nakshatra",
                (full.kundli as any)?.nakshatra as string | undefined,
                <Sun className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Raashi",
                (full.kundli as any)?.raashi as string | undefined,
                <Target className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Manglik",
                (full.kundli as any)?.manglikStatus as string | undefined,
                <Link className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Astrology system",
                (full.kundli as any)?.astrologySystem as string | undefined,
                <Orbit className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Horoscope preference",
                (full.kundli as any)?.horoscopePreference as string | undefined,
                <Timer className="h-4 w-4" />
              )}
              {renderFieldTile(
                "Dosha details",
                (full.kundli as any)?.doshaDetails as string | undefined,
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div className="grid gap-3 mt-3 sm:grid-cols-1">
              {renderFieldTile(
                "Place of birth",
                (() => {
                  const kundliBirthPlace = (full.kundli as any)?.birthPlace as
                    | string
                    | undefined;
                  const district = (full.kundli as any)?.birthDistrict as
                    | string
                    | undefined;
                  const state = (full.kundli as any)?.birthState as
                    | string
                    | undefined;
                  const country = (full.kundli as any)?.birthCountry as
                    | string
                    | undefined;

                  // If birthPlace already contains a combined address, use it directly
                  if (kundliBirthPlace && kundliBirthPlace.trim()) {
                    return kundliBirthPlace.trim();
                  }

                  const parts = [district, state, country].filter(
                    (part): part is string => Boolean(part && part.trim())
                  );
                  if (!parts.length) return "";

                  // Deduplicate consecutive parts in case of overlap
                  const deduped: string[] = [];
                  for (const part of parts) {
                    if (!deduped.includes(part)) {
                      deduped.push(part);
                    }
                  }
                  return deduped.join(", ");
                })() as string | undefined,
                <MapPin className="h-4 w-4" />
              )}
            </div>
          </div>
        )}

        {showAdditionalNotesSection && (
          <div className="rounded-2xl bg-white shadow-sm border border-rose-100 overflow-hidden">
            <div className="h-[3px] w-full bg-gradient-to-r from-[#ff4f7a] via-[#ff9aa6] to-[#ffb35a]" />
            <div className="px-6 py-7">
              <p className="text-center text-lg font-semibold italic text-[#e11d48]">
                Additional Notes
              </p>
              <div className="mt-5 min-h-[85px] flex items-center justify-center px-4">
                <p className="text-center text-base text-[#3b2430] whitespace-pre-line">
                  {full.additionalNotes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
