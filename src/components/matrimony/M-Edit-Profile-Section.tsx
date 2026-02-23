import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import {
  getMyMatrimonyProfile,
  saveMatrimonyProfileOnServer,
} from "@/lib/matrimony/matrimonyApi";
import {
  STATE_CITY_MAP,
  // CITY_STATE_MAP,
  HIGHEST_EDUCATION_CATEGORIES,
  EDUCATION_LEVEL_OPTIONS,
  FIELD_OF_STUDY_CATEGORIES,
  OCCUPATION_CATEGORIES,
  RELIGION_OPTIONS,
  SUBCASTE_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  NAKSHATRA_OPTIONS,
  RAASHI_OPTIONS,
  ASTROLOGY_SYSTEM_OPTIONS,
  HOROSCOPE_PREFERENCE_OPTIONS,
  GOTRA_OPTIONS,
  HEIGHT_OPTIONS,
  ANNUAL_INCOME_OPTIONS as ANNUAL_INCOME_SAMPLES,
  FAMILY_BACKGROUND_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  FAMILY_VALUES_OPTIONS,
  SIBLINGS_OPTIONS,
  SPECIAL_NOTE_OPTIONS,
  LIFESTYLE_HABIT_OPTIONS,
  ASSET_OPTIONS as ASSET_SAMPLE_OPTIONS,
  HOBBY_OPTIONS as HOBBY_SAMPLE_OPTIONS,
  INTEREST_OPTIONS as INTEREST_SAMPLE_OPTIONS,
  MUSIC_OPTIONS as MUSIC_SAMPLE_OPTIONS,
  CUISINE_OPTIONS as CUISINE_SAMPLE_OPTIONS,
  CLOTHING_STYLE_OPTIONS,
  SPORTS_FITNESS_OPTIONS,
  COOKING_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
  FAVOURITE_SHOWS_OPTIONS,
  BOOK_OPTIONS as BOOK_SAMPLE_OPTIONS,
  OUTDOOR_ACTIVITY_OPTIONS,
  INDOOR_ACTIVITY_OPTIONS,
  VALUE_OPTIONS as VALUE_SAMPLE_OPTIONS,
  WEEKEND_OPTIONS as WEEKEND_SAMPLE_OPTIONS,
  PARTNER_MARITAL_STATUS_OPTIONS,
  PARTNER_HEIGHT_RANGE_OPTIONS,
  PARTNER_AGE_RANGE_OPTIONS,
  DIET_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  PROFILE_HEADLINE_OPTIONS,
  KUNDLI_ASTRO_PREFERENCE_OPTIONS,
  COUNTRY_OPTIONS,
  CITY_SUGGESTIONS,
} from "@/lib/matrimony/matrimonyConstants";
import { FancySelect } from "../shared/FancySelect";

const STEPS = [
  "Basic Details",
  "Religion & Community",
  "Location Details",
  "Physical Information",
  "Contact & Identity",
  "Family Information",
  "Kundli & Astro",
  "Education Details",
  "Professional Details",
  "Lifestyle & Favourites",
  "Partner Preferences",
  "About You",
  "Additional Notes",
];

const INDIAN_STATE_OPTIONS = Object.keys(STATE_CITY_MAP);

const HIGHEST_EDUCATION_SAMPLES = Object.values(
  HIGHEST_EDUCATION_CATEGORIES,
).flat();

const FIELD_OF_STUDY_OPTIONS = Object.values(FIELD_OF_STUDY_CATEGORIES).flat();

const OCCUPATION_OPTIONS = Object.values(OCCUPATION_CATEGORIES).flat();

const EDUCATION_YEAR_OPTIONS = Array.from(
  { length: 51 },
  (_, index) => `${1980 + index}`,
);

type WizardFormState = {
  fullName: string;
  gender: string;
  profileFor: string;
  dateOfBirth: string;
  religion: string;
  subcaste: string;
  motherTongue: string;
  star: string;
  raashi: string;
  gotra: string;
  motherGotra: string;
  dadiGotra: string;
  naniGotra: string;
  manglik: "yes" | "no" | "dont_know" | "";
  birthTime: string;
  birthAmPm: "AM" | "PM";
  birthCountry: string;
  birthState: string;
  birthDistrict: string;
  birthplace: string;
  astrologySystem: string;
  horoscopePreference: string;
  doshaDetails: string;
  maritalStatus: string;
  height: string;
  weight: string;
  bodyType: string;
  complexion: string;
  bloodGroup: string;
  familyType: string;
  physicalStatus: string;
  highestEducation: string;
  educationLevel: string;
  educationDegree: string;
  educationField: string;
  educationCollege: string;
  educationYear: string;
  employedIn: string;
  occupation: string;
  workLocation: string;
  annualIncome: string;
  residingFlatBuilding: string;
  residingDistrict: string;
  residingState: string;
  residingCity: string;
  residingCountry: string;
  residingPincode: string;
  citizenship: string;
  aboutYou: string;
  headline: string;
  contactEmail: string;
  contactPhone: string;
  alternatePhone: string;
  aadhaarStatus: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  fatherBelongsFrom: string;
  motherBelongsFrom: string;
  familySiblings: string;
  familyBackground: string;
  familyValues: string;
  familyDescription: string;
  familyLivingWithParents: "yes" | "no" | "";
  aboutDisability: string;
  lifestyleHabits: string;
  lifestyleAssets: string;
  favHobbies: string;
  favInterests: string;
  favLanguages: string;
  favMusic: string;
  favCuisine: string;
  favClothingStyle: string;
  favSports: string;
  favCanCook: string;
  favTravel: string;
  favShows: string;
  favBooks: string;
  favMovies: string;
  favOutdoor: string;
  favIndoor: string;
  favBucketList: string;
  favValues: string;
  favQuirks: string;
  favWeekend: string;
  partnerSummary: string;
  partnerGender: string;
  partnerHeightRange: string;
  partnerAgeRange: string;
  partnerMaritalStatus: string;
  partnerKundliAstro: string;
  partnerCaste: string;
  partnerDisability: string;
  partnerReligion: string;
  partnerMotherTongue: string;
  partnerState: string;
  partnerDistrict: string;
  // partnerCity: string;
  partnerCountry: string;
  partnerEduLevel: string;
  partnerProfession: string;
  partnerEarning: string;
  partnerDiet: string;
  partnerSmoke: string;
  partnerDrink: string;
  additionalNotes: string;
};

const STEP_FIELD_GROUPS: Array<Array<keyof WizardFormState>> = [
  // 0 - Basic details
  ["dateOfBirth", "gender", "maritalStatus", "profileFor"],
  // 1 - Religion & community
  [
    "religion",
    "subcaste",
    "motherTongue",
    "gotra",
    "motherGotra",
    "dadiGotra",
    "naniGotra",
  ],
  // 2 - Location details
  ["residingState", "residingCountry", "residingPincode"],
  // 3 - Physical information
  [
    "height",
    "weight",
    "bodyType",
    "complexion",
    "bloodGroup",
    "physicalStatus",
  ],
  // 4 - Contact & identity
  ["contactEmail", "contactPhone", "alternatePhone", "aadhaarStatus"],
  // 5 - Family information
  [
    "fatherName",
    "motherName",
    "familyBackground",
    "familyType",
    "familyLivingWithParents",
  ],
  // 6 - Kundli & astro
  [
    "manglik",
    "star",
    "raashi",
    "birthTime",
    "birthCountry",
    "birthState",
    "birthDistrict",
    // "birthCity",
    "astrologySystem",
    "horoscopePreference",
    "doshaDetails",
  ],
  // 7 - Education details
  [
    "highestEducation",
    "educationLevel",
    "educationDegree",
    "educationField",
    "educationCollege",
    "educationYear",
  ],
  // 8 - Professional details
  ["occupation", "employedIn", "workLocation", "annualIncome"],
  // 9 - Lifestyle & favourites
  [
    "lifestyleHabits",
    "lifestyleAssets",
    "favHobbies",
    "favInterests",
    "favLanguages",
    "favMusic",
    "favCuisine",
    "favClothingStyle",
    "favSports",
    "favCanCook",
    "favTravel",
    "favShows",
    "favBooks",
    "favMovies",
    "favOutdoor",
    "favIndoor",
    "favBucketList",
    "favValues",
    "favQuirks",
    "favWeekend",
  ],
  // 10 - Partner preferences
  [
    "partnerSummary",
    "partnerGender",
    "partnerHeightRange",
    "partnerAgeRange",
    "partnerMaritalStatus",
    "partnerKundliAstro",
    "partnerCaste",
    "partnerDisability",
    "partnerReligion",
    "partnerMotherTongue",
    "partnerState",
    "partnerDistrict",
    // "partnerCity",
    "partnerCountry",
    "partnerEduLevel",
    "partnerProfession",
    "partnerEarning",
    "partnerDiet",
    "partnerSmoke",
    "partnerDrink",
  ],
  // 11 - About you
  ["aboutYou", "headline"],
  // 12 - Additional notes
  ["additionalNotes"],
];

const createEmptyFormState = (): WizardFormState => ({
  fullName: "",
  gender: "",
  profileFor: "",
  dateOfBirth: "",
  religion: "",
  subcaste: "",
  motherTongue: "",
  star: "",
  raashi: "",
  gotra: "",
  motherGotra: "",
  dadiGotra: "",
  naniGotra: "",
  manglik: "",
  birthTime: "",
  birthAmPm: "AM",
  birthCountry: "",
  birthState: "",
  birthDistrict: "",
  birthplace: "",
  astrologySystem: "",
  horoscopePreference: "",
  doshaDetails: "",
  maritalStatus: "",
  height: "",
  weight: "",
  bodyType: "",
  complexion: "",
  bloodGroup: "",
  familyType: "",
  physicalStatus: "",
  highestEducation: "",
  educationLevel: "",
  educationDegree: "",
  educationField: "",
  educationCollege: "",
  educationYear: "",
  employedIn: "",
  occupation: "",
  workLocation: "",
  annualIncome: "",
  residingFlatBuilding: "",
  residingDistrict: "",
  residingState: "",
  residingCity: "",
  residingCountry: "",
  residingPincode: "",
  citizenship: "Indian",
  aboutYou: "",
  headline: "",
  contactEmail: "",
  contactPhone: "",
  alternatePhone: "",
  aadhaarStatus: "",
  fatherName: "",
  fatherOccupation: "",
  fatherBelongsFrom: "",
  motherName: "",
  motherOccupation: "",
  motherBelongsFrom: "",
  familySiblings: "",
  familyBackground: "",
  familyValues: "",
  familyDescription: "",
  familyLivingWithParents: "",
  aboutDisability: "",
  lifestyleHabits: "",
  lifestyleAssets: "",
  favHobbies: "",
  favInterests: "",
  favLanguages: "",
  favMusic: "",
  favCuisine: "",
  favClothingStyle: "",
  favSports: "",
  favCanCook: "",
  favTravel: "",
  favShows: "",
  favBooks: "",
  favMovies: "",
  favOutdoor: "",
  favIndoor: "",
  favBucketList: "",
  favValues: "",
  favQuirks: "",
  favWeekend: "",
  partnerSummary: "",
  partnerGender: "",
  partnerHeightRange: "",
  partnerAgeRange: "",
  partnerMaritalStatus: "",
  partnerKundliAstro: "",
  partnerCaste: "",
  partnerDisability: "",
  partnerReligion: "",
  partnerMotherTongue: "",
  partnerState: "",
  partnerDistrict: "",
  // partnerCity: "",
  partnerCountry: "",
  partnerEduLevel: "",
  partnerProfession: "",
  partnerEarning: "",
  partnerDiet: "",
  partnerSmoke: "",
  partnerDrink: "",
  additionalNotes: "",
});

const parseCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type SiblingRow = {
  name: string;
  relationship: string;
  occupation: string;
  order: string;
  maritalStatus: string;
};

const parseSiblingRows = (value: string): SiblingRow[] => {
  if (!value || !value.trim()) {
    return [
      {
        name: "",
        relationship: "",
        occupation: "",
        order: "",
        maritalStatus: "",
      },
    ];
  }

  if (value.includes(";;") || value.includes("|")) {
    const sections = value
      .split(";;")
      .map((section) => section.trim())
      .filter(Boolean);

    if (sections.length > 0) {
      const rows = sections.map((section) => {
        const [
          name = "",
          relationship = "",
          occupation = "",
          order = "",
          maritalStatus = "",
        ] = section.split("|");

        const normalizedStatus = maritalStatus === "Married" ? "Married" : "";

        return {
          name,
          relationship,
          occupation,
          order,
          maritalStatus: normalizedStatus,
        };
      });

      if (rows.length > 0) {
        return rows;
      }
    }
  }

  return [
    {
      name: "",
      relationship: value.trim(),
      occupation: "",
      order: "",
      maritalStatus: "",
    },
  ];
};

const stringifySiblingRows = (rows: SiblingRow[]): string => {
  const cleaned = rows.map((row) => ({
    name: (row.name || "").replace(/[|;]/g, " "),
    relationship: (row.relationship || "").replace(/[|;]/g, " "),
    occupation: (row.occupation || "").replace(/[|;]/g, " "),
    order: (row.order || "").replace(/[|;]/g, " "),
    maritalStatus: row.maritalStatus === "Married" ? "Married" : "",
  }));

  if (cleaned.length === 0) {
    return "";
  }

  return cleaned
    .map((row) =>
      [
        row.name,
        row.relationship,
        row.occupation,
        row.order,
        row.maritalStatus,
      ].join("|"),
    )
    .join(";;");
};

const calculateAge = (dateString: string): number | null => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

type ChipMultiSelectProps = {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const selectedValues = parseCsv(value);

  const toggleOption = (option: string) => {
    const alreadySelected = selectedValues.includes(option);
    const nextValues = alreadySelected
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(nextValues.join(", "));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-rose-100 rounded-xl px-2.5 py-1.5 text-sm bg-white flex flex-wrap items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {selectedValues.length === 0 ? (
            <span className="text-xs text-gray-400 truncate">
              {placeholder || "Select options"}
            </span>
          ) : (
            selectedValues.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] text-rose-800"
              >
                <span className="truncate max-w-[120px]">{item}</span>
              </span>
            ))
          )}
        </div>
        <span className="ml-auto text-[10px] text-gray-400">▼</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-rose-100 rounded-xl shadow-lg py-1">
          {options.map((opt) => {
            const active = selectedValues.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOption(opt)}
                className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm hover:bg-rose-50 ${
                  active
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const MatrimonyOnboardingWizard: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<WizardFormState>(() =>
    createEmptyFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [existingFullProfile, setExistingFullProfile] = useState<any | null>(
    null,
  );
  const [kycStatus, setKycStatus] = useState<string>("");

  const siblingRows = React.useMemo(
    () => parseSiblingRows(form.familySiblings),
    [form.familySiblings],
  );

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const visibleStepIndices = useMemo(() => {
    const maxVisible = isMobile ? 3 : 10;
    if (STEPS.length <= maxVisible) {
      return STEPS.map((_, index) => index);
    }

    const halfWindow = Math.floor(maxVisible / 2);
    const maxStart = Math.max(0, STEPS.length - maxVisible);
    const start = Math.min(Math.max(stepIndex - halfWindow, 0), maxStart);

    return Array.from({ length: maxVisible }, (_, offset) => start + offset);
  }, [isMobile, stepIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("step");
      if (!raw) return;

      const parsed = parseInt(raw, 10);
      if (Number.isNaN(parsed)) return;

      const index = parsed;
      if (index >= 0 && index < STEPS.length) {
        setStepIndex(index);
      }
    } catch {
      // ignore invalid query params
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadExisting = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        let qrName = "";
        let qrEmail = "";
        let qrPhone = "";
        if (typeof window !== "undefined") {
          qrName = window.localStorage.getItem("qrName") || "";
          qrEmail = window.localStorage.getItem("qrEmail") || "";
          qrPhone = window.localStorage.getItem("qrPhone") || "";
        }

        if (result.ok && result.profile?.fullProfile) {
          setKycStatus(String((result.profile as any)?.kycStatus || ""));
          const full = result.profile.fullProfile as any;
          const basic = full.basicDetails || {};
          const about = full.about || {};
          const kundli = full.kundli || {};
          const education = full.education || {};
          const career = full.career || {};
          const family = full.family || {};
          const contact = full.contact || {};
          const lifestyle = full.lifestyle || {};
          const favourites = lifestyle.favourites || {};
          const partnerPreferences = full.partnerPreferences || {};
          const partnerBasic = partnerPreferences.basicDetails || {};
          const partnerEdu = partnerPreferences.education || {};
          const partnerLife = partnerPreferences.lifestyle || {};

          setExistingFullProfile(full);
          syncIdentityToLocalStorage(full);

          setForm((prev) => ({
            ...prev,
            fullName: qrName || about.profileManagedBy || prev.fullName,
            gender: (basic as any).gender || prev.gender,
            profileFor:
              (about as any).profileCreatedBy ||
              (about as any).createdByRelation ||
              prev.profileFor,
            dateOfBirth:
              basic.birthDate || kundli.birthDate
                ? new Date(basic.birthDate || kundli.birthDate)
                    .toISOString()
                    .slice(0, 10)
                : prev.dateOfBirth,
            religion: basic.religion || prev.religion,
            subcaste: basic.caste || prev.subcaste,
            motherTongue: basic.motherTongue || prev.motherTongue,
            star: kundli.nakshatra || prev.star,
            raashi: kundli.raashi || prev.raashi,
            gotra: basic.gothra || kundli.gotra || prev.gotra,
            motherGotra: (kundli as any).motherGotra || prev.motherGotra,
            dadiGotra: (kundli as any).dadiGotra || prev.dadiGotra,
            naniGotra: (kundli as any).naniGotra || prev.naniGotra,
            manglik:
              (kundli.manglikStatus as WizardFormState["manglik"]) ||
              prev.manglik,
            birthTime: kundli.birthTime || prev.birthTime,
            birthCountry: kundli.birthCountry || prev.birthCountry,
            birthState: kundli.birthState || prev.birthState,
            birthDistrict: (kundli as any).birthDistrict || prev.birthDistrict,
            birthplace: kundli.birthplace || prev.birthplace,
            astrologySystem:
              (kundli as any).astrologySystem || prev.astrologySystem,
            horoscopePreference:
              (kundli as any).horoscopePreference || prev.horoscopePreference,
            doshaDetails:
              (kundli as any).doshaDetails ||
              (kundli as any).doshas ||
              prev.doshaDetails,
            maritalStatus: basic.maritalStatus || prev.maritalStatus,
            height: basic.height || prev.height,
            weight: (basic as any).weight || prev.weight,
            bodyType: (basic as any).bodyType || prev.bodyType,
            complexion: (basic as any).complexion || prev.complexion,
            bloodGroup: (basic as any).bloodGroup || prev.bloodGroup,
            familyType: basic.familyType || prev.familyType,
            physicalStatus: basic.physicalStatus || prev.physicalStatus,
            highestEducation: education.description || prev.highestEducation,
            educationLevel: education.level || prev.educationLevel,
            educationDegree: education.degree || prev.educationDegree,
            educationField: education.field || prev.educationField,
            educationCollege:
              education.college ||
              education.institution ||
              prev.educationCollege,
            educationYear: education.year || prev.educationYear,
            employedIn:
              (career as any).industry ||
              (career as any).employedIn ||
              prev.employedIn,
            occupation: career.role || prev.occupation,
            workLocation: career.location || prev.workLocation,
            annualIncome: basic.annualIncome || prev.annualIncome,
            residingFlatBuilding:
              (basic as any).residingFlatBuilding || prev.residingFlatBuilding,
            residingDistrict:
              (basic as any).residingDistrict || prev.residingDistrict,
            residingState: basic.residingState || prev.residingState,
            residingCity: basic.residingCity || prev.residingCity,
            residingCountry:
              (basic as any).residingCountry ||
              (basic as any).country ||
              prev.residingCountry,
            residingPincode:
              (basic as any).residingPincode ||
              (basic as any).pincode ||
              (basic as any).pinCode ||
              prev.residingPincode,
            citizenship: basic.citizenship || prev.citizenship,
            aboutYou: about.summary || prev.aboutYou,
            headline: full.headline || prev.headline,
            contactEmail: qrEmail || contact.email || prev.contactEmail,
            contactPhone: qrPhone || contact.phone || prev.contactPhone,
            alternatePhone: contact.alternatePhone || prev.alternatePhone,
            aadhaarStatus:
              String((result.profile as any)?.kycStatus || "").toUpperCase() ===
              "VERIFIED"
                ? "Verified"
                : (contact as any).aadhaarStatus ||
                  prev.aadhaarStatus ||
                  "Not verified",
            fatherName: (family as any).fatherName || prev.fatherName,
            fatherOccupation:
              (family as any).fatherOccupation || prev.fatherOccupation,
            motherName: (family as any).motherName || prev.motherName,
            motherOccupation:
              (family as any).motherOccupation || prev.motherOccupation,
            fatherBelongsFrom:
              (family as any).fatherBelongsFrom || prev.fatherBelongsFrom,
            motherBelongsFrom:
              (family as any).motherBelongsFrom || prev.motherBelongsFrom,
            familySiblings: family.siblings || prev.familySiblings,
            familyBackground: family.familyBackground || prev.familyBackground,
            familyValues: (family as any).familyValues || prev.familyValues,
            familyDescription: family.description || prev.familyDescription,
            familyLivingWithParents:
              typeof family.livingWithParents === "boolean"
                ? family.livingWithParents
                  ? "yes"
                  : "no"
                : prev.familyLivingWithParents,
            aboutDisability: about.disability || prev.aboutDisability,
            lifestyleHabits: Array.isArray(lifestyle.habits)
              ? lifestyle.habits.join(", ")
              : lifestyle.habits || prev.lifestyleHabits,
            lifestyleAssets: Array.isArray(lifestyle.assets)
              ? lifestyle.assets.join(", ")
              : lifestyle.assets || prev.lifestyleAssets,
            favHobbies: favourites.hobbies || prev.favHobbies,
            favInterests: favourites.interests || prev.favInterests,
            favLanguages: favourites.languages || prev.favLanguages,
            favMusic: favourites.music || prev.favMusic,
            favCuisine: favourites.cuisine || prev.favCuisine,
            favClothingStyle: favourites.clothingStyle || prev.favClothingStyle,
            favSports: favourites.sports || prev.favSports,
            favCanCook: favourites.canCook || prev.favCanCook,
            favTravel: favourites.travel || prev.favTravel,
            favShows: favourites.shows || prev.favShows,
            favBooks: favourites.books || prev.favBooks,
            favMovies: favourites.movies || prev.favMovies,
            favOutdoor: favourites.outdoor || prev.favOutdoor,
            favIndoor: favourites.indoor || prev.favIndoor,
            favBucketList: favourites.bucketList || prev.favBucketList,
            favValues: favourites.values || prev.favValues,
            favQuirks: favourites.quirks || prev.favQuirks,
            favWeekend: favourites.weekend || prev.favWeekend,
            partnerSummary:
              partnerPreferences.summary ||
              partnerPreferences.description ||
              prev.partnerSummary,
            partnerGender: (partnerBasic as any).gender || prev.partnerGender,
            partnerHeightRange:
              partnerBasic.heightRange || prev.partnerHeightRange,
            partnerAgeRange: partnerBasic.ageRange || prev.partnerAgeRange,
            partnerMaritalStatus:
              partnerBasic.maritalStatus || prev.partnerMaritalStatus,
            partnerKundliAstro:
              partnerBasic.kundliAstro ||
              partnerBasic.mundliastro ||
              prev.partnerKundliAstro,
            partnerCaste:
              partnerBasic.caste || partnerBasic.cast || prev.partnerCaste,
            partnerDisability:
              partnerBasic.disability || prev.partnerDisability,
            partnerReligion: partnerBasic.religion || prev.partnerReligion,
            partnerMotherTongue:
              partnerBasic.motherTongue || prev.partnerMotherTongue,
            // partnerCity: partnerBasic.city || prev.partnerCity,
            partnerState: (partnerBasic as any).state || prev.partnerState,
            partnerDistrict:
              (partnerBasic as any).district || prev.partnerDistrict,
            partnerCountry: partnerBasic.country || prev.partnerCountry,
            partnerEduLevel: partnerEdu.level || prev.partnerEduLevel,
            partnerProfession: partnerEdu.profession || prev.partnerProfession,
            partnerEarning: partnerEdu.earning || prev.partnerEarning,
            partnerDiet: partnerLife.diet || prev.partnerDiet,
            partnerSmoke: partnerLife.smoke || prev.partnerSmoke,
            partnerDrink: partnerLife.drink || prev.partnerDrink,
            additionalNotes: full.additionalNotes || prev.additionalNotes,
          }));

          setHasExistingProfile(true);
        } else if (qrName || qrEmail || qrPhone) {
          setForm((prev) => ({
            ...prev,
            fullName: qrName || prev.fullName,
            contactEmail: qrEmail || prev.contactEmail,
            contactPhone: qrPhone || prev.contactPhone,
          }));
        }
      } catch (error: any) {
        console.error("Failed to prefill onboarding wizard", error);
      }
    };

    void loadExisting();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (field: keyof WizardFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSiblingRow = (
    index: number,
    field: keyof SiblingRow,
    value: string,
  ) => {
    const next = siblingRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    const serialized = stringifySiblingRows(next);
    updateField("familySiblings", serialized);
  };

  const addSiblingRow = () => {
    const next = [
      ...siblingRows,
      {
        name: "",
        relationship: "",
        occupation: "",
        order: "",
        maritalStatus: "",
      },
    ];
    const serialized = stringifySiblingRows(next);
    updateField("familySiblings", serialized);
  };

  const removeSiblingRow = (index: number) => {
    const next = siblingRows.filter((_, i) => i !== index);
    const serialized = stringifySiblingRows(next);
    updateField("familySiblings", serialized);
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((idx) => idx + 1);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      setStepIndex((idx) => idx - 1);
    }
  };

  const isStepComplete = (index: number): boolean => {
    const group = STEP_FIELD_GROUPS[index];
    if (!group || group.length === 0) return false;

    const isFilled = (value: unknown): boolean => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return false;
        // User selected "Other" but didn't type a value yet
        if (trimmed === "__OTHER__") return false;
        return true;
      }
      return Boolean(value);
    };

    // Partner preferences are optional; mark the step complete when core preferences are set.
    // (Otherwise this step never gets a tick unless every single optional filter is filled.)
    if (index === 10) {
      const required: Array<keyof WizardFormState> = [
        "partnerSummary",
        "partnerGender",
        "partnerHeightRange",
        "partnerAgeRange",
        "partnerState",
        "partnerDistrict",
        "partnerCountry",
        "partnerEduLevel",
      ];
      return required.every((field) => isFilled(form[field]));
    }

    return group.every((field) => isFilled(form[field]));
  };

  const buildFullProfile = (): any => {
    return {
      ...(existingFullProfile || {}),
      basicDetails: {
        height: form.height,
        weight: form.weight,
        bodyType: form.bodyType,
        complexion: form.complexion,
        bloodGroup: form.bloodGroup,
        gender: form.gender,
        religion: form.religion,
        caste: form.subcaste,
        motherTongue: form.motherTongue,
        location: [
          form.residingFlatBuilding,
          form.residingCity,
          form.residingState,
          form.residingCountry,
        ]
          .filter(Boolean)
          .join(", "),
        annualIncome: form.annualIncome,
        birthDate: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : undefined,
        maritalStatus: form.maritalStatus,
        gothra: form.gotra,
        familyType: form.familyType,
        physicalStatus: form.physicalStatus,
        residingFlatBuilding: form.residingFlatBuilding,
        residingDistrict: form.residingDistrict,
        residingState: form.residingState,
        residingCity: form.residingCity,
        residingCountry: form.residingCountry,
        residingPincode: form.residingPincode,
        citizenship: form.citizenship,
      },
      about: {
        summary: form.aboutYou,
        profileManagedBy: form.fullName,
        disability: form.aboutDisability,
        profileCreatedBy: form.profileFor,
      },
      education: {
        description:
          form.highestEducation ||
          [
            form.educationLevel,
            form.educationDegree,
            form.educationField,
            form.educationCollege,
            form.educationYear,
          ]
            .filter(Boolean)
            .join(" • "),
        level: form.educationLevel,
        degree: form.educationDegree,
        field: form.educationField,
        college: form.educationCollege,
        year: form.educationYear,
      },
      career: {
        role: form.occupation,
        industry: form.employedIn,
        location: form.workLocation,
      },
      kundli: {
        manglikStatus: form.manglik,
        nakshatra: form.star,
        raashi: form.raashi,
        gotra: form.gotra,
        motherGotra: form.motherGotra,
        dadiGotra: form.dadiGotra,
        naniGotra: form.naniGotra,
        birthTime: form.birthTime,
        birthDate: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : undefined,
        birthCountry: form.birthCountry,
        birthState: form.birthState,
        birthDistrict: form.birthDistrict,
        birthplace: form.birthplace,
        astrologySystem: form.astrologySystem,
        horoscopePreference: form.horoscopePreference,
        doshaDetails: form.doshaDetails,
        birthPlace:
          [
            form.birthplace,
            form.birthDistrict,
            form.birthState,
            form.birthCountry,
          ]
            .filter(Boolean)
            .join(", ") || undefined,
      },
      family: {
        siblings: form.familySiblings,
        familyBackground: form.familyBackground,
        familyValues: form.familyValues,
        description: form.familyDescription,
        fatherName: form.fatherName,
        motherName: form.motherName,
        fatherOccupation: form.fatherOccupation,
        motherOccupation: form.motherOccupation,
        fatherBelongsFrom: form.fatherBelongsFrom,
        motherBelongsFrom: form.motherBelongsFrom,
        livingWithParents:
          form.familyLivingWithParents === "yes"
            ? true
            : form.familyLivingWithParents === "no"
              ? false
              : undefined,
      },
      contact: {
        email: form.contactEmail,
        phone: form.contactPhone,
        alternatePhone: form.alternatePhone,
        aadhaarStatus: form.aadhaarStatus,
      },
      lifestyle: {
        habits: parseCsv(form.lifestyleHabits),
        assets: parseCsv(form.lifestyleAssets),
        favourites: {
          hobbies: form.favHobbies,
          interests: form.favInterests,
          languages: form.favLanguages,
          music: form.favMusic,
          cuisine: form.favCuisine,
          clothingStyle: form.favClothingStyle,
          sports: form.favSports,
          canCook: form.favCanCook,
          travel: form.favTravel,
          shows: form.favShows,
          books: form.favBooks,
          movies: form.favMovies,
          outdoor: form.favOutdoor,
          indoor: form.favIndoor,
          bucketList: form.favBucketList,
          values: form.favValues,
          quirks: form.favQuirks,
          weekend: form.favWeekend,
        },
      },
      partnerPreferences: {
        summary: form.partnerSummary,
        basicDetails: {
          gender: form.partnerGender,
          heightRange: form.partnerHeightRange,
          ageRange: form.partnerAgeRange,
          maritalStatus: form.partnerMaritalStatus,
          kundliAstro: form.partnerKundliAstro,
          caste: form.partnerCaste,
          disability: form.partnerDisability,
          religion: form.partnerReligion,
          motherTongue: form.partnerMotherTongue,
          state: form.partnerState,
          district: form.partnerDistrict,
          // city: form.partnerCity,
          country: form.partnerCountry,
        },
        education: {
          level: form.partnerEduLevel,
          profession: form.partnerProfession,
          earning: form.partnerEarning,
        },
        lifestyle: {
          diet: form.partnerDiet,
          smoke: form.partnerSmoke,
          drink: form.partnerDrink,
        },
      },
      additionalNotes: form.additionalNotes,
      headline: form.headline,
    };
  };

  const syncIdentityToLocalStorage = (fullProfile: any) => {
    if (typeof window === "undefined" || !fullProfile) return;
    try {
      const aboutBlock = fullProfile.about || {};
      const contactBlock = fullProfile.contact || {};
      const nextName =
        (aboutBlock.profileManagedBy as string) ||
        (aboutBlock.profileCreatedBy as string) ||
        "";
      const nextEmail = (contactBlock.email as string) || "";

      if (nextName) {
        window.localStorage.setItem("qrName", nextName);
        window.dispatchEvent(new Event("qrProfileNameUpdated"));
      }

      if (nextEmail) {
        window.localStorage.setItem("qrEmail", nextEmail);
        window.dispatchEvent(new Event("qrProfileEmailUpdated"));
      }
    } catch {
      // ignore identity sync errors
    }
  };

  const saveStepAndContinue = async () => {
    setIsSubmitting(true);
    try {
      const fullProfile = buildFullProfile();
      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: hasExistingProfile,
      });

      if (!result.ok) {
        throw new Error(result.error || "Failed to save matrimony profile");
      }

      setHasExistingProfile(true);
      syncIdentityToLocalStorage(fullProfile);
      toast.success("Details saved");
      goNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullProfile = buildFullProfile();

      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: hasExistingProfile,
      });

      if (!result.ok) {
        throw new Error(result.error || "Failed to save matrimony profile");
      }

      setHasExistingProfile(true);
      syncIdentityToLocalStorage(fullProfile);
      toast.success("Matrimony details saved successfully");

      if (typeof window !== "undefined") {
        window.location.href = "/matrimonial-profile";
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  //  const currentStep = stepIndex + 1;

  const completedStepsCount = STEPS.reduce(
    (count, _label, index) => count + (isStepComplete(index) ? 1 : 0),
    0,
  );
  const progressPercent = Math.round(
    (completedStepsCount / STEPS.length) * 100,
  );
  const nextStepLabel =
    stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1] : "All steps completed";

  const handlePreviewProfile = () => {
    if (typeof window !== "undefined") {
      window.open("/matrimonial-profile?tab=public", "_blank");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#f2e6ea] bg-white p-6 shadow-sm flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-[#2e1d22]">
              Profile Completion
            </span>
            <span className="text-sm font-bold text-[#f07f9c]">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#fceef2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f07f9c] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#9c6b79] mt-2">Next: {nextStepLabel}</p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePreviewProfile}
            className="w-full sm:w-auto px-4 py-2 bg-[#fceef2] text-[#f07f9c] text-sm font-bold rounded-lg hover:bg-[#f07f9c]/20 transition-colors"
          >
            Preview Profile
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-64 shrink-0 bg-white rounded-xl border border-[#f2e6ea] shadow-sm overflow-hidden lg:sticky lg:top-[88px] lg:self-start lg:z-10">
          <div className="p-4 border-b border-[#f2e6ea]">
            <h3 className="font-bold text-[#2e1d22]">Sections</h3>
          </div>
          <nav className="flex flex-col p-2">
            {visibleStepIndices.map((index: number) => {
              const label = STEPS[index];
              const isActive = index === stepIndex;
              const complete = isStepComplete(index);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setStepIndex(index)}
                  className={
                    "flex items-center gap-3 p-3 rounded-lg text-left transition-colors " +
                    (isActive
                      ? "bg-[#f07f9c]/10 text-[#f07f9c] font-bold"
                      : "hover:bg-[#fceef2] text-[#9c6b79] font-medium")
                  }
                >
                  <div
                    className={
                      "size-6 rounded-full flex items-center justify-center text-xs " +
                      (isActive
                        ? "bg-[#f07f9c] text-white"
                        : "bg-[#fceef2] text-[#9c6b79]")
                    }
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm truncate">{label}</span>
                  {complete && !isActive && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-[#2f9d62]" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <motion.section
          className="flex-1 w-full bg-white rounded-2xl border border-[#f2e6ea] shadow-sm p-6 sm:p-8"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="mb-6 flex flex-col gap-3 border-b border-[#f2e6ea] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c98a9a]">
                {`Step ${stepIndex + 1} of ${STEPS.length}`}
              </p>
              <h2 className="text-2xl font-bold text-[#2e1d22]">
                {STEPS[stepIndex]}
              </h2>
              <p className="text-sm text-[#9c6b79]">
                Complete the details below to keep your profile updated.
              </p>
            </div>
            {/* <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-[#f2e6ea] p-2 text-[#9c6b79] hover:bg-[#fff2f6]"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-[#f2e6ea] p-2 text-[#9c6b79] hover:bg-[#fff2f6]"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2e1d22] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80"
              >
                <Diamond className="h-4 w-4 text-[#f07f9c]" />
                Upgrade Plan
              </button>
            </div> */}
          </div>

          {stepIndex === 0 && (
            <>
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                      Basic details
                    </p>
                    <p className="text-sm text-[#9c6b79]">
                      Tell us the essentials so we can personalize your profile.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={form.fullName}
                        readOnly
                        className="w-full rounded-2xl border border-dashed border-[#f2e6ea] bg-[#fef4f7] px-4 py-3 text-sm text-[#5c5046]"
                      />
                      <p className="mt-1 text-[11px] text-[#b18492]">
                        Pulled automatically from your account
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                          Date of birth
                        </label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) =>
                            updateField("dateOfBirth", e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                          Age
                        </label>
                        <div className="flex h-[46px] items-center rounded-2xl border border-[#f2e6ea] bg-[#fffafb] px-4 text-sm text-[#5c5046]">
                          {calculateAge(form.dateOfBirth) !== null
                            ? `${calculateAge(form.dateOfBirth)} years`
                            : "Will be calculated from date of birth"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                        Gender
                      </label>
                      <FancySelect
                        value={form.gender}
                        onChange={(next) => updateField("gender", next)}
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Other", value: "Other" },
                        ]}
                        placeholder="Select gender"
                        columns={1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                        Marital status
                      </label>
                      <FancySelect
                        value={form.maritalStatus}
                        onChange={(next) => updateField("maritalStatus", next)}
                        options={[
                          { label: "Never Married", value: "Never Married" },
                          { label: "Divorced", value: "Divorced" },
                          { label: "Widowed", value: "Widowed" },
                          { label: "Separated", value: "Separated" },
                        ]}
                        placeholder="Select marital status"
                        columns={1}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Profile created by
                    </label>
                    <FancySelect
                      value={form.profileFor}
                      onChange={(next) => updateField("profileFor", next)}
                      options={[
                        { label: "Self", value: "Self" },
                        { label: "Parent", value: "Parent" },
                        { label: "Sibling", value: "Sibling" },
                        { label: "Friend", value: "Friend" },
                      ]}
                      placeholder="Select who created this profile"
                      columns={2}
                    />
                  </div>
                </div>
              </div>

              <datalist id="occupation-options">
                {OCCUPATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="work-location-city-options">
                {CITY_SUGGESTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="field-of-study-options">
                {FIELD_OF_STUDY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="citizenship-country-options">
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="residing-state-options">
                {INDIAN_STATE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="residing-city-options">
                {CITY_SUGGESTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-height-range-options">
                {PARTNER_HEIGHT_RANGE_OPTIONS.map((opt, idx) => (
                  <option key={`${opt}-${idx}`} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-age-range-options">
                {PARTNER_AGE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-marital-status-options">
                {PARTNER_MARITAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-caste-options">
                {[...SUBCASTE_OPTIONS, "Any"].map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-disability-options">
                {SPECIAL_NOTE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-religion-options">
                {[...RELIGION_OPTIONS, "Any"].map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-mother-tongue-options">
                {[...MOTHER_TONGUE_OPTIONS, "Any"].map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-city-options">
                {CITY_SUGGESTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-country-options">
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-edu-level-options">
                {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-profession-options">
                {OCCUPATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-earning-options">
                {[
                  "1-3 LPA",
                  "3-5 LPA",
                  "5-7 LPA",
                  "7-10 LPA",
                  "10-15 LPA",
                  "15-20 LPA",
                  "20+ 25 LPA",
                  "20+ LPA",
                ].map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-diet-options">
                {DIET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-smoking-options">
                {SMOKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="partner-drinking-options">
                {DRINKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </>
          )}

          {stepIndex === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-white p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Religion & Community
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Share cultural roots to help families understand your
                    background.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Caste / community
                    </label>
                    {SUBCASTE_OPTIONS.includes(form.subcaste) ||
                    !form.subcaste ? (
                      <FancySelect
                        value={
                          SUBCASTE_OPTIONS.includes(form.subcaste)
                            ? form.subcaste
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("subcaste", "__OTHER__");
                          } else {
                            updateField("subcaste", next);
                          }
                        }}
                        options={[
                          ...SUBCASTE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select caste / community"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.subcaste === "__OTHER__" ? "" : form.subcaste
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("subcaste", "");
                          } else {
                            updateField("subcaste", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write caste / community"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Mother tongue
                    </label>
                    {MOTHER_TONGUE_OPTIONS.includes(form.motherTongue) ||
                    !form.motherTongue ? (
                      <FancySelect
                        value={
                          MOTHER_TONGUE_OPTIONS.includes(form.motherTongue)
                            ? form.motherTongue
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("motherTongue", "__OTHER__");
                          } else {
                            updateField("motherTongue", next);
                          }
                        }}
                        options={[
                          ...MOTHER_TONGUE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select mother tongue"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.motherTongue === "__OTHER__"
                            ? ""
                            : form.motherTongue
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("motherTongue", "");
                          } else {
                            updateField("motherTongue", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write mother tongue"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Religion
                    </label>
                    {RELIGION_OPTIONS.includes(form.religion) ||
                    !form.religion ? (
                      <FancySelect
                        value={
                          RELIGION_OPTIONS.includes(form.religion)
                            ? form.religion
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("religion", "__OTHER__");
                          } else {
                            updateField("religion", next);
                          }
                        }}
                        options={[
                          ...RELIGION_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select religion"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.religion === "__OTHER__" ? "" : form.religion
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("religion", "");
                          } else {
                            updateField("religion", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write religion"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                      Gotra details
                    </p>
                    <p className="text-sm text-[#9c6b79]">
                      Optional but helpful for families following traditional
                      customs.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Self Gotra
                    </label>
                    {GOTRA_OPTIONS.includes(form.gotra) || !form.gotra ? (
                      <FancySelect
                        value={
                          GOTRA_OPTIONS.includes(form.gotra) ? form.gotra : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("gotra", "__OTHER__");
                          } else {
                            updateField("gotra", next);
                          }
                        }}
                        options={[
                          ...GOTRA_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select gotra"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={form.gotra === "__OTHER__" ? "" : form.gotra}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("gotra", "");
                          } else {
                            updateField("gotra", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write gotra"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Mother Gotra (Optional)
                    </label>
                    {GOTRA_OPTIONS.includes(form.motherGotra) ||
                    !form.motherGotra ? (
                      <FancySelect
                        value={
                          GOTRA_OPTIONS.includes(form.motherGotra)
                            ? form.motherGotra
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("motherGotra", "__OTHER__");
                          } else {
                            updateField("motherGotra", next);
                          }
                        }}
                        options={[
                          ...GOTRA_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select mother's gotra"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.motherGotra === "__OTHER__"
                            ? ""
                            : form.motherGotra
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("motherGotra", "");
                          } else {
                            updateField("motherGotra", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write mother's gotra"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Grandmother (Dadi) Gotra (optional)
                    </label>
                    {GOTRA_OPTIONS.includes(form.dadiGotra) ||
                    !form.dadiGotra ? (
                      <FancySelect
                        value={
                          GOTRA_OPTIONS.includes(form.dadiGotra)
                            ? form.dadiGotra
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("dadiGotra", "__OTHER__");
                          } else {
                            updateField("dadiGotra", next);
                          }
                        }}
                        options={[
                          ...GOTRA_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select Dadi's gotra"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.dadiGotra === "__OTHER__" ? "" : form.dadiGotra
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("dadiGotra", "");
                          } else {
                            updateField("dadiGotra", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write Dadi's gotra"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Grandmother (Nani) Gotra (optional)
                    </label>
                    {GOTRA_OPTIONS.includes(form.naniGotra) ||
                    !form.naniGotra ? (
                      <FancySelect
                        value={
                          GOTRA_OPTIONS.includes(form.naniGotra)
                            ? form.naniGotra
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("naniGotra", "__OTHER__");
                          } else {
                            updateField("naniGotra", next);
                          }
                        }}
                        options={[
                          ...GOTRA_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select Nani's gotra"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.naniGotra === "__OTHER__" ? "" : form.naniGotra
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("naniGotra", "");
                          } else {
                            updateField("naniGotra", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write Nani's gotra"
                      />
                    )}
                  </div>
                </div>
              </div>
              <datalist id="religion-options">
                {RELIGION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
                <option value="Other" />
              </datalist>
              <datalist id="caste-community-options">
                {SUBCASTE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
                <option value="Other" />
              </datalist>
              <datalist id="mother-tongue-options">
                {MOTHER_TONGUE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
                <option value="Other" />
              </datalist>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-white p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Location details
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Tell us where you currently live so we can match you better.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Flat No./Building
                    </label>
                    <input
                      type="text"
                      value={form.residingFlatBuilding}
                      onChange={(e) =>
                        updateField("residingFlatBuilding", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Flat No./Building"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      State
                    </label>
                    {INDIAN_STATE_OPTIONS.includes(form.residingState) ||
                    !form.residingState ? (
                      <FancySelect
                        value={
                          INDIAN_STATE_OPTIONS.includes(form.residingState)
                            ? form.residingState
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("residingState", "__OTHER__");
                          } else {
                            updateField("residingState", next);
                          }
                        }}
                        options={[
                          ...INDIAN_STATE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select state"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.residingState === "__OTHER__"
                            ? ""
                            : form.residingState
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("residingState", "");
                          } else {
                            updateField("residingState", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write state"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      District (optional)
                    </label>
                    {(() => {
                      const stateDistricts =
                        (form.residingState &&
                          STATE_CITY_MAP[form.residingState]) ||
                        [];
                      const districtOptions =
                        stateDistricts.length > 0
                          ? stateDistricts
                          : CITY_SUGGESTIONS.map((opt) => `${opt} district`);
                      const inOptions = districtOptions.includes(
                        form.residingDistrict,
                      );

                      if (inOptions || !form.residingDistrict) {
                        return (
                          <FancySelect
                            value={inOptions ? form.residingDistrict : ""}
                            onChange={(next) => {
                              if (next === "__OTHER__") {
                                updateField("residingDistrict", "__OTHER__");
                              } else {
                                updateField("residingDistrict", next);
                              }
                            }}
                            options={[
                              ...districtOptions.map((opt) => ({
                                label: opt,
                                value: opt,
                              })),
                              {
                                label: "Other (write manually)",
                                value: "__OTHER__",
                              },
                            ]}
                            placeholder="Select district"
                            columns={2}
                          />
                        );
                      }

                      return (
                        <input
                          type="text"
                          value={
                            form.residingDistrict === "__OTHER__"
                              ? ""
                              : form.residingDistrict
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              updateField("residingDistrict", "");
                            } else {
                              updateField("residingDistrict", val);
                            }
                          }}
                          className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                          placeholder="Write district"
                        />
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Pin code (optional)
                    </label>
                    <input
                      type="text"
                      value={form.residingPincode}
                      onChange={(e) =>
                        updateField("residingPincode", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Area pin code"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Country of residence
                    </label>
                    {COUNTRY_OPTIONS.includes(form.residingCountry) ||
                    !form.residingCountry ? (
                      <FancySelect
                        value={
                          COUNTRY_OPTIONS.includes(form.residingCountry)
                            ? form.residingCountry
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("residingCountry", "__OTHER__");
                          } else {
                            updateField("residingCountry", next);
                          }
                        }}
                        options={[
                          ...COUNTRY_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select country"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.residingCountry === "__OTHER__"
                            ? ""
                            : form.residingCountry
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("residingCountry", "");
                          } else {
                            updateField("residingCountry", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write country"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Citizenship / nationality
                    </label>
                    {COUNTRY_OPTIONS.includes(form.citizenship) ||
                    !form.citizenship ? (
                      <FancySelect
                        value={
                          COUNTRY_OPTIONS.includes(form.citizenship)
                            ? form.citizenship
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("citizenship", "__OTHER__");
                          } else {
                            updateField("citizenship", next);
                          }
                        }}
                        options={[
                          ...COUNTRY_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select citizenship"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.citizenship === "__OTHER__"
                            ? ""
                            : form.citizenship
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("citizenship", "");
                          } else {
                            updateField("citizenship", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write citizenship"
                      />
                    )}
                  </div>
                </div>
              </div>

              <datalist id="residing-country-options">
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="residing-state-options">
                {INDIAN_STATE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="residing-city-options">
                {CITY_SUGGESTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <datalist id="residing-district-options">
                {CITY_SUGGESTIONS.map((opt) => (
                  <option key={opt} value={`${opt} district`} />
                ))}
              </datalist>
              <datalist id="citizenship-country-options">
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          )}
          {/* <div> //city comment of Kundli & astro
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              City
            </label>
            {(() => {
              const stateCities = CITY_SUGGESTIONS.filter((opt) => {
                if (!form.residingState) return true;
                const mappedState = CITY_STATE_MAP[opt];
                return mappedState ? mappedState === form.residingState : true;
              });
              const cityOptions =
                form.residingState && stateCities.length > 0
                  ? stateCities
                  : CITY_SUGGESTIONS;
              const inOptions = cityOptions.includes(form.residingCity);

              if (inOptions || !form.residingCity) {
                return (
                  <FancySelect
                    value={inOptions ? form.residingCity : ""}
                    onChange={(next) => {
                      if (next === "__OTHER__") {
                        updateField("residingCity", "__OTHER__");
                      } else {
                        updateField("residingCity", next);
                      }
                    }}
                    options={[
                      ...cityOptions.map((opt) => ({
                        label: opt,
                        value: opt,
                      })),
                      {
                        label: "Other (write manually)",
                        value: "__OTHER__",
                      },
                    ]}
                    placeholder="Select city"
                    columns={3}
                  />
                );
              }

              return (
                <input
                  type="text"
                  value={
                    form.residingCity === "__OTHER__" ? "" : form.residingCity
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      updateField("residingCity", "");
                    } else {
                      updateField("residingCity", val);
                    }
                  }}
                  className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Write city"
                />
              );
            })()}
          </div> */}
          {stepIndex === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Physical information
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Accurate details about your physique help us match you
                    precisely.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Height
                    </label>
                    <FancySelect
                      value={form.height}
                      onChange={(next) => updateField("height", next)}
                      options={HEIGHT_OPTIONS.map((opt) => ({
                        label: opt,
                        value: opt,
                      }))}
                      placeholder="Select height"
                      columns={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      value={form.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="e.g. 65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Body type
                    </label>
                    <FancySelect
                      value={form.bodyType}
                      onChange={(next) => updateField("bodyType", next)}
                      options={[
                        { label: "Slim", value: "Slim" },
                        { label: "Average", value: "Average" },
                        { label: "Athletic", value: "Athletic" },
                        { label: "Heavy", value: "Heavy" },
                      ]}
                      placeholder="Select body type"
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Complexion
                    </label>
                    <FancySelect
                      value={form.complexion}
                      onChange={(next) => updateField("complexion", next)}
                      options={[
                        { label: "Very fair", value: "Very fair" },
                        { label: "Fair", value: "Fair" },
                        { label: "Wheatish", value: "Wheatish" },
                        { label: "Dusky", value: "Dusky" },
                        { label: "Dark", value: "Dark" },
                      ]}
                      placeholder="Select complexion"
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Blood group
                    </label>
                    <FancySelect
                      value={form.bloodGroup}
                      onChange={(next) => updateField("bloodGroup", next)}
                      options={[
                        { label: "A+", value: "A+" },
                        { label: "A-", value: "A-" },
                        { label: "B+", value: "B+" },
                        { label: "B-", value: "B-" },
                        { label: "O+", value: "O+" },
                        { label: "O-", value: "O-" },
                        { label: "AB+", value: "AB+" },
                        { label: "AB-", value: "AB-" },
                      ]}
                      placeholder="Select blood group"
                      columns={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Physical status
                    </label>
                    <FancySelect
                      value={form.physicalStatus}
                      onChange={(next) => updateField("physicalStatus", next)}
                      options={[
                        { label: "Normal", value: "Normal" },
                        {
                          label: "Physically challenged",
                          value: "Physically challenged",
                        },
                        { label: "Other", value: "Other" },
                      ]}
                      placeholder="Select physical status"
                      columns={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Contact & identity
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Keep your communication channels updated for faster
                    responses.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) =>
                        updateField("contactEmail", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Primary phone
                    </label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) =>
                        updateField("contactPhone", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      WhatsApp number (optional)
                    </label>
                    <input
                      type="tel"
                      value={form.alternatePhone}
                      onChange={(e) =>
                        updateField("alternatePhone", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Alternate contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Aadhaar status
                    </label>
                    {kycStatus.toUpperCase() === "VERIFIED" ? (
                      <div className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-emerald-700 font-semibold">
                        Verified
                      </div>
                    ) : (
                      <FancySelect
                        value={form.aadhaarStatus}
                        onChange={(next) => updateField("aadhaarStatus", next)}
                        options={[
                          { label: "Not verified", value: "Not verified" },
                          { label: "Not linked", value: "Not linked" },
                          { label: "Linked", value: "Linked" },
                          {
                            label: "Will provide later",
                            value: "Will provide later",
                          },
                        ]}
                        placeholder="Not verified"
                        columns={1}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 5 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Family information
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Share details that highlight your family&apos;s roots and
                    culture.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Father&apos;s name
                    </label>
                    <input
                      type="text"
                      value={form.fatherName}
                      onChange={(e) =>
                        updateField("fatherName", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Mother&apos;s name
                    </label>
                    <input
                      type="text"
                      value={form.motherName}
                      onChange={(e) =>
                        updateField("motherName", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Father&apos;s occupation
                    </label>
                    <input
                      type="text"
                      value={form.fatherOccupation}
                      onChange={(e) =>
                        updateField("fatherOccupation", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Business, Govt service, Retired, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Mother&apos;s occupation
                    </label>
                    <input
                      type="text"
                      value={form.motherOccupation}
                      onChange={(e) =>
                        updateField("motherOccupation", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Homemaker, Teacher, Business..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Father belongs from
                    </label>
                    <input
                      type="text"
                      value={form.fatherBelongsFrom}
                      onChange={(e) =>
                        updateField("fatherBelongsFrom", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="City / district, state"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Mother belongs from
                    </label>
                    <input
                      type="text"
                      value={form.motherBelongsFrom}
                      onChange={(e) =>
                        updateField("motherBelongsFrom", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="City / district, state"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Family background
                    </label>
                    {FAMILY_BACKGROUND_OPTIONS.includes(
                      form.familyBackground,
                    ) || !form.familyBackground ? (
                      <FancySelect
                        value={
                          FAMILY_BACKGROUND_OPTIONS.includes(
                            form.familyBackground,
                          )
                            ? form.familyBackground
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("familyBackground", "__OTHER__");
                          } else {
                            updateField("familyBackground", next);
                          }
                        }}
                        options={[
                          ...FAMILY_BACKGROUND_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Joint family, Business family..."
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.familyBackground === "__OTHER__"
                            ? ""
                            : form.familyBackground
                        }
                        onChange={(e) =>
                          updateField("familyBackground", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Describe background"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Family type
                    </label>
                    <FancySelect
                      value={form.familyType}
                      onChange={(next) => updateField("familyType", next)}
                      options={FAMILY_TYPE_OPTIONS.map((opt) => ({
                        label: opt,
                        value: opt,
                      }))}
                      placeholder="Joint, Nuclear, etc."
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Living with parents
                    </label>
                    <FancySelect
                      value={form.familyLivingWithParents}
                      onChange={(next) =>
                        updateField("familyLivingWithParents", next as any)
                      }
                      options={[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ]}
                      placeholder="Select option"
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Family values
                    </label>
                    {FAMILY_VALUES_OPTIONS.includes(form.familyValues) ||
                    !form.familyValues ? (
                      <FancySelect
                        value={
                          FAMILY_VALUES_OPTIONS.includes(form.familyValues)
                            ? form.familyValues
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("familyValues", "__OTHER__");
                          } else {
                            updateField("familyValues", next);
                          }
                        }}
                        options={[
                          ...FAMILY_VALUES_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Traditional, Liberal..."
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.familyValues === "__OTHER__"
                            ? ""
                            : form.familyValues
                        }
                        onChange={(e) =>
                          updateField("familyValues", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Describe lifestyle"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Family description
                    </label>
                    <textarea
                      value={form.familyDescription}
                      onChange={(e) =>
                        updateField("familyDescription", e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent resize-none"
                      placeholder="Talk about values, business, siblings abroad, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#f2e6ea] bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                      Siblings
                    </p>
                    <p className="text-sm text-[#9c6b79]">
                      Add brothers or sisters with quick details about their
                      lives.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSiblingRow}
                    className="inline-flex items-center justify-center rounded-full border border-[#f2e6ea] px-3 py-1.5 text-xs font-semibold text-[#f07f9c] hover:bg-[#fff2f6]"
                  >
                    + Add sibling
                  </button>
                </div>
                <div className="space-y-3">
                  {siblingRows.map((row, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-[#5c5046]">
                        <span>Sibling {index + 1}</span>
                        {siblingRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSiblingRow(index)}
                            className="text-xs font-semibold text-[#f07f9c] hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) =>
                              updateSiblingRow(index, "name", e.target.value)
                            }
                            className="w-full rounded-2xl border border-[#f2e6ea] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                            Relationship
                          </label>
                          <FancySelect
                            value={row.relationship}
                            onChange={(next) =>
                              updateSiblingRow(index, "relationship", next)
                            }
                            options={SIBLINGS_OPTIONS.map((opt) => ({
                              label: opt,
                              value: opt,
                            }))}
                            placeholder="Brother / Sister"
                            columns={2}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                            Marital status
                          </label>
                          <FancySelect
                            value={row.maritalStatus || ""}
                            onChange={(next) =>
                              updateSiblingRow(index, "maritalStatus", next)
                            }
                            options={[
                              { label: "Unmarried", value: "Unmarried" },
                              { label: "Married", value: "Married" },
                            ]}
                            placeholder="Select status"
                            columns={1}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                            Occupation
                          </label>
                          <input
                            type="text"
                            value={row.occupation}
                            onChange={(e) =>
                              updateSiblingRow(
                                index,
                                "occupation",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-[#f2e6ea] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stepIndex === 6 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Kundli & astro essentials
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    These details help traditional families make well-informed
                    decisions.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Manglik status
                    </label>
                    <FancySelect
                      value={form.manglik}
                      onChange={(next) =>
                        updateField(
                          "manglik",
                          next as WizardFormState["manglik"],
                        )
                      }
                      options={[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                        { label: "Don't know", value: "dont_know" },
                      ]}
                      placeholder="Select option"
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Nakshatra (star)
                    </label>
                    {NAKSHATRA_OPTIONS.includes(form.star) || !form.star ? (
                      <FancySelect
                        value={
                          NAKSHATRA_OPTIONS.includes(form.star) ? form.star : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("star", "__OTHER__");
                          } else {
                            updateField("star", next);
                          }
                        }}
                        options={[
                          ...NAKSHATRA_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select nakshatra"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={form.star === "__OTHER__" ? "" : form.star}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("star", "");
                          } else {
                            updateField("star", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus-border-transparent"
                        placeholder="Write nakshatra"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Raashi (moon sign)
                    </label>
                    {RAASHI_OPTIONS.includes(form.raashi) || !form.raashi ? (
                      <FancySelect
                        value={
                          RAASHI_OPTIONS.includes(form.raashi)
                            ? form.raashi
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("raashi", "__OTHER__");
                          } else {
                            updateField("raashi", next);
                          }
                        }}
                        options={[
                          ...RAASHI_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select raashi"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={form.raashi === "__OTHER__" ? "" : form.raashi}
                        onChange={(e) => updateField("raashi", e.target.value)}
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write raashi"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Birth time
                    </label>
                    <input
                      type="time"
                      value={form.birthTime}
                      onChange={(e) => updateField("birthTime", e.target.value)}
                      className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Birth place (city / town)
                    </label>
                    <input
                      type="text"
                      value={form.birthplace}
                      onChange={(e) =>
                        updateField("birthplace", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="City or village name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Birth state
                    </label>
                    {INDIAN_STATE_OPTIONS.includes(form.birthState) ||
                    !form.birthState ? (
                      <FancySelect
                        value={
                          INDIAN_STATE_OPTIONS.includes(form.birthState)
                            ? form.birthState
                            : ""
                        }
                        onChange={(next) =>
                          updateField(
                            "birthState",
                            next === "__OTHER__" ? "__OTHER__" : next,
                          )
                        }
                        options={[
                          ...INDIAN_STATE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select state"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.birthState === "__OTHER__" ? "" : form.birthState
                        }
                        onChange={(e) =>
                          updateField("birthState", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write birth state"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Birth district
                    </label>
                    {(() => {
                      const stateDistricts =
                        (form.birthState && STATE_CITY_MAP[form.birthState]) ||
                        [];
                      const districtOptions =
                        stateDistricts.length > 0
                          ? stateDistricts
                          : CITY_SUGGESTIONS.map((opt) => `${opt} district`);
                      const inOptions = districtOptions.includes(
                        form.birthDistrict,
                      );

                      if (inOptions || !form.birthDistrict) {
                        return (
                          <FancySelect
                            value={inOptions ? form.birthDistrict : ""}
                            onChange={(next) => {
                              if (next === "__OTHER__") {
                                updateField("birthDistrict", "__OTHER__");
                              } else {
                                updateField("birthDistrict", next);
                              }
                            }}
                            options={[
                              ...districtOptions.map((opt) => ({
                                label: opt,
                                value: opt,
                              })),
                              {
                                label: "Other (write manually)",
                                value: "__OTHER__",
                              },
                            ]}
                            placeholder="Select district"
                            columns={2}
                          />
                        );
                      }

                      return (
                        <input
                          type="text"
                          value={
                            form.birthDistrict === "__OTHER__"
                              ? ""
                              : form.birthDistrict
                          }
                          onChange={(e) =>
                            updateField("birthDistrict", e.target.value)
                          }
                          className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                          placeholder="Write birth district"
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Birth country
                    </label>
                    {COUNTRY_OPTIONS.includes(form.birthCountry) ||
                    !form.birthCountry ? (
                      <FancySelect
                        value={
                          COUNTRY_OPTIONS.includes(form.birthCountry)
                            ? form.birthCountry
                            : ""
                        }
                        onChange={(next) =>
                          updateField(
                            "birthCountry",
                            next === "__OTHER__" ? "__OTHER__" : next,
                          )
                        }
                        options={[
                          ...COUNTRY_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select country"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.birthCountry === "__OTHER__"
                            ? ""
                            : form.birthCountry
                        }
                        onChange={(e) =>
                          updateField("birthCountry", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write birth country"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#f2e6ea] bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Horoscope preferences
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Mention how strictly your family follows matching practices.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Astrology system
                    </label>
                    {ASTROLOGY_SYSTEM_OPTIONS.includes(form.astrologySystem) ||
                    !form.astrologySystem ? (
                      <FancySelect
                        value={
                          ASTROLOGY_SYSTEM_OPTIONS.includes(
                            form.astrologySystem,
                          )
                            ? form.astrologySystem
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("astrologySystem", "__OTHER__");
                          } else {
                            updateField("astrologySystem", next);
                          }
                        }}
                        options={[
                          ...ASTROLOGY_SYSTEM_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select system"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.astrologySystem === "__OTHER__"
                            ? ""
                            : form.astrologySystem
                        }
                        onChange={(e) =>
                          updateField("astrologySystem", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write astrology system"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Horoscope preference
                    </label>
                    {HOROSCOPE_PREFERENCE_OPTIONS.includes(
                      form.horoscopePreference,
                    ) || !form.horoscopePreference ? (
                      <FancySelect
                        value={
                          HOROSCOPE_PREFERENCE_OPTIONS.includes(
                            form.horoscopePreference,
                          )
                            ? form.horoscopePreference
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("horoscopePreference", "__OTHER__");
                          } else {
                            updateField("horoscopePreference", next);
                          }
                        }}
                        options={[
                          ...HOROSCOPE_PREFERENCE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select preference"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.horoscopePreference === "__OTHER__"
                            ? ""
                            : form.horoscopePreference
                        }
                        onChange={(e) =>
                          updateField("horoscopePreference", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] bg-white px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus-border-transparent"
                        placeholder="Write horoscope preference"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Dosha details / additional notes
                    </label>
                    <textarea
                      value={form.doshaDetails}
                      onChange={(e) =>
                        updateField("doshaDetails", e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-[#f2e6ea] bg-[#fffafb] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent resize-none"
                      placeholder="Mention doshas, remedies, or matching preferences"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 7 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f2e6ea] bg-[#fffafb] p-6 shadow-sm space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c98a9a]">
                    Education details
                  </p>
                  <p className="text-sm text-[#9c6b79]">
                    Academic background helps prospects understand your journey
                    so far.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Highest education
                    </label>
                    {HIGHEST_EDUCATION_SAMPLES.includes(
                      form.highestEducation,
                    ) || !form.highestEducation ? (
                      <FancySelect
                        value={
                          HIGHEST_EDUCATION_SAMPLES.includes(
                            form.highestEducation,
                          )
                            ? form.highestEducation
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("highestEducation", "__OTHER__");
                          } else {
                            updateField("highestEducation", next);
                          }
                        }}
                        options={[
                          ...HIGHEST_EDUCATION_SAMPLES.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select highest education"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.highestEducation === "__OTHER__"
                            ? ""
                            : form.highestEducation
                        }
                        onChange={(e) =>
                          updateField("highestEducation", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write highest education"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Education level
                    </label>
                    {EDUCATION_LEVEL_OPTIONS.includes(form.educationLevel) ||
                    !form.educationLevel ? (
                      <FancySelect
                        value={
                          EDUCATION_LEVEL_OPTIONS.includes(form.educationLevel)
                            ? form.educationLevel
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("educationLevel", "__OTHER__");
                          } else {
                            updateField("educationLevel", next);
                          }
                        }}
                        options={[
                          ...EDUCATION_LEVEL_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select education level"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.educationLevel === "__OTHER__"
                            ? ""
                            : form.educationLevel
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("educationLevel", "");
                          } else {
                            updateField("educationLevel", val);
                          }
                        }}
                        className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                        placeholder="Write education level"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Degree / course
                    </label>
                    <input
                      type="text"
                      value={form.educationDegree}
                      onChange={(e) =>
                        updateField("educationDegree", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="e.g. B.Tech, MBA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Field of study
                    </label>
                    <input
                      type="text"
                      value={form.educationField}
                      onChange={(e) =>
                        updateField("educationField", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="e.g. Computer Science, Finance"
                      list="field-of-study-options"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      College / University
                    </label>
                    <input
                      type="text"
                      value={form.educationCollege}
                      onChange={(e) =>
                        updateField("educationCollege", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#f2e6ea] px-4 py-3 text-sm text-[#2e1d22] focus:outline-none focus:ring-2 focus:ring-[#f07f9c]/70 focus:border-transparent"
                      placeholder="Institute name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5046] mb-1">
                      Graduation year
                    </label>
                    <FancySelect
                      value={form.educationYear}
                      onChange={(next) => updateField("educationYear", next)}
                      options={EDUCATION_YEAR_OPTIONS.map((year) => ({
                        label: year,
                        value: year,
                      }))}
                      placeholder="Select year"
                      columns={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 8 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Professional details
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Occupation
                  </label>
                  {OCCUPATION_OPTIONS.includes(form.occupation) ||
                  !form.occupation ? (
                    <FancySelect
                      value={
                        OCCUPATION_OPTIONS.includes(form.occupation)
                          ? form.occupation
                          : ""
                      }
                      onChange={(next) => {
                        if (next === "__OTHER__") {
                          updateField("occupation", "__OTHER__");
                        } else {
                          updateField("occupation", next);
                        }
                      }}
                      options={[
                        ...OCCUPATION_OPTIONS.map((opt) => ({
                          label: opt,
                          value: opt,
                        })),
                        { label: "Other (write manually)", value: "__OTHER__" },
                      ]}
                      placeholder="Select occupation"
                      columns={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={
                        form.occupation === "__OTHER__" ? "" : form.occupation
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          updateField("occupation", "");
                        } else {
                          updateField("occupation", val);
                        }
                      }}
                      className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Write occupation"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Employed in
                  </label>
                  <FancySelect
                    value={form.employedIn}
                    onChange={(next) => updateField("employedIn", next)}
                    options={[
                      { label: "Private sector", value: "Private" },
                      {
                        label: "Government / Public sector",
                        value: "Government",
                      },
                      { label: "Business", value: "Business" },
                      { label: "Self-employed", value: "Self-employed" },
                      { label: "Not working", value: "Not working" },
                      { label: "Other", value: "Other" },
                    ]}
                    placeholder="Select employment type"
                    columns={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Work location
                  </label>
                  {CITY_SUGGESTIONS.includes(form.workLocation) ||
                  !form.workLocation ? (
                    <FancySelect
                      value={
                        CITY_SUGGESTIONS.includes(form.workLocation)
                          ? form.workLocation
                          : ""
                      }
                      onChange={(next) => {
                        if (next === "__OTHER__") {
                          updateField("workLocation", "__OTHER__");
                        } else {
                          updateField("workLocation", next);
                        }
                      }}
                      options={[
                        ...CITY_SUGGESTIONS.map((opt) => ({
                          label: opt,
                          value: opt,
                        })),
                        {
                          label: "Other (write manually)",
                          value: "__OTHER__",
                        },
                      ]}
                      placeholder="Select work city"
                      columns={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={
                        form.workLocation === "__OTHER__"
                          ? ""
                          : form.workLocation
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          updateField("workLocation", "");
                        } else {
                          updateField("workLocation", val);
                        }
                      }}
                      className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Write work city"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Annual income
                  </label>
                  {ANNUAL_INCOME_SAMPLES.includes(form.annualIncome) ||
                  !form.annualIncome ? (
                    <FancySelect
                      value={
                        ANNUAL_INCOME_SAMPLES.includes(form.annualIncome)
                          ? form.annualIncome
                          : ""
                      }
                      onChange={(next) => {
                        if (next === "__OTHER__") {
                          updateField("annualIncome", "__OTHER__");
                        } else {
                          updateField("annualIncome", next);
                        }
                      }}
                      options={[
                        ...ANNUAL_INCOME_SAMPLES.map((opt) => ({
                          label: opt,
                          value: opt,
                        })),
                        {
                          label: "Other (write manually)",
                          value: "__OTHER__",
                        },
                      ]}
                      placeholder="Select annual income"
                      columns={1}
                    />
                  ) : (
                    <input
                      type="text"
                      value={
                        form.annualIncome === "__OTHER__"
                          ? ""
                          : form.annualIncome
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          updateField("annualIncome", "");
                        } else {
                          updateField("annualIncome", val);
                        }
                      }}
                      className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Write annual income"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {stepIndex === 9 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Lifestyle & favourites
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Lifestyle habits
                  </label>
                  <ChipMultiSelect
                    options={LIFESTYLE_HABIT_OPTIONS}
                    value={form.lifestyleHabits}
                    onChange={(next) => updateField("lifestyleHabits", next)}
                    placeholder="Select lifestyle habits"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Lifestyle assets
                  </label>
                  <ChipMultiSelect
                    options={ASSET_SAMPLE_OPTIONS}
                    value={form.lifestyleAssets}
                    onChange={(next) => updateField("lifestyleAssets", next)}
                    placeholder="Select lifestyle assets"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Hobbies
                  </label>
                  <ChipMultiSelect
                    options={HOBBY_SAMPLE_OPTIONS}
                    value={form.favHobbies}
                    onChange={(next) => updateField("favHobbies", next)}
                    placeholder="Select hobbies"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Interests
                  </label>
                  <ChipMultiSelect
                    options={INTEREST_SAMPLE_OPTIONS}
                    value={form.favInterests}
                    onChange={(next) => updateField("favInterests", next)}
                    placeholder="Select interests"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite languages
                  </label>
                  <ChipMultiSelect
                    options={MOTHER_TONGUE_OPTIONS}
                    value={form.favLanguages}
                    onChange={(next) => updateField("favLanguages", next)}
                    placeholder="Select languages"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite music
                  </label>
                  <ChipMultiSelect
                    options={MUSIC_SAMPLE_OPTIONS}
                    value={form.favMusic}
                    onChange={(next) => updateField("favMusic", next)}
                    placeholder="Select music"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite cuisine
                  </label>
                  <ChipMultiSelect
                    options={CUISINE_SAMPLE_OPTIONS}
                    value={form.favCuisine}
                    onChange={(next) => updateField("favCuisine", next)}
                    placeholder="Select cuisine"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Clothing style
                  </label>
                  <ChipMultiSelect
                    options={CLOTHING_STYLE_OPTIONS}
                    value={form.favClothingStyle}
                    onChange={(next) => updateField("favClothingStyle", next)}
                    placeholder="Select clothing style"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Sports & fitness
                  </label>
                  <ChipMultiSelect
                    options={SPORTS_FITNESS_OPTIONS}
                    value={form.favSports}
                    onChange={(next) => updateField("favSports", next)}
                    placeholder="Select sports & fitness"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Cooking
                  </label>
                  <FancySelect
                    value={form.favCanCook}
                    onChange={(next) => updateField("favCanCook", next)}
                    options={COOKING_OPTIONS.map((opt) => ({
                      label: opt,
                      value: opt,
                    }))}
                    placeholder="Can you cook?"
                    columns={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Travel style
                  </label>
                  <ChipMultiSelect
                    options={TRAVEL_STYLE_OPTIONS}
                    value={form.favTravel}
                    onChange={(next) => updateField("favTravel", next)}
                    placeholder="Select travel style"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite shows
                  </label>
                  <ChipMultiSelect
                    options={FAVOURITE_SHOWS_OPTIONS}
                    value={form.favShows}
                    onChange={(next) => updateField("favShows", next)}
                    placeholder="Select favourite shows"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite books
                  </label>
                  <ChipMultiSelect
                    options={BOOK_SAMPLE_OPTIONS}
                    value={form.favBooks}
                    onChange={(next) => updateField("favBooks", next)}
                    placeholder="Select favourite books"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Favourite movies
                  </label>
                  <ChipMultiSelect
                    options={[
                      "Action",
                      "Comedy",
                      "Drama",
                      "Romance",
                      "Thriller",
                      "Horror",
                      "Sci-fi",
                      "Documentary",
                    ]}
                    value={form.favMovies}
                    onChange={(next) => updateField("favMovies", next)}
                    placeholder="Select movies"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Outdoor activities
                  </label>
                  <ChipMultiSelect
                    options={OUTDOOR_ACTIVITY_OPTIONS}
                    value={form.favOutdoor}
                    onChange={(next) => updateField("favOutdoor", next)}
                    placeholder="Select outdoor activities"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Indoor activities
                  </label>
                  <ChipMultiSelect
                    options={INDOOR_ACTIVITY_OPTIONS}
                    value={form.favIndoor}
                    onChange={(next) => updateField("favIndoor", next)}
                    placeholder="Select indoor activities"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Bucket list
                </label>
                <ChipMultiSelect
                  options={[
                    "World tour",
                    "Start a business",
                    "Build a dream house",
                    "Settle abroad",
                    "Complete a marathon",
                  ]}
                  value={form.favBucketList}
                  onChange={(next) => updateField("favBucketList", next)}
                  placeholder="Select bucket list items"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Core values
                </label>
                <ChipMultiSelect
                  options={VALUE_SAMPLE_OPTIONS}
                  value={form.favValues}
                  onChange={(next) => updateField("favValues", next)}
                  placeholder="Select core values"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Fun quirks
                </label>
                <ChipMultiSelect
                  options={[
                    "Always early",
                    "Foodie",
                    "Movie buff",
                    "Night owl",
                    "Organised planner",
                  ]}
                  value={form.favQuirks}
                  onChange={(next) => updateField("favQuirks", next)}
                  placeholder="Select fun quirks"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ideal weekend
                </label>
                <ChipMultiSelect
                  options={WEEKEND_SAMPLE_OPTIONS}
                  value={form.favWeekend}
                  onChange={(next) => updateField("favWeekend", next)}
                  placeholder="Select ideal weekend"
                />
              </div>
            </div>
          )}

          {stepIndex === 10 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Partner preferences
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    What kind of partner are you looking for?
                  </label>
                  <textarea
                    value={form.partnerSummary}
                    onChange={(e) =>
                      updateField("partnerSummary", e.target.value)
                    }
                    rows={4}
                    className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    placeholder="Share a short description of your ideal partner and relationship."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Preferred gender
                    </label>
                    <FancySelect
                      value={form.partnerGender}
                      onChange={(next) => updateField("partnerGender", next)}
                      options={[
                        { label: "Any", value: "Any" },
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                      ]}
                      placeholder="Select preferred gender"
                      columns={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Preferred height range
                    </label>
                    {PARTNER_HEIGHT_RANGE_OPTIONS.includes(
                      form.partnerHeightRange,
                    ) || !form.partnerHeightRange ? (
                      <FancySelect
                        value={
                          PARTNER_HEIGHT_RANGE_OPTIONS.includes(
                            form.partnerHeightRange,
                          )
                            ? form.partnerHeightRange
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerHeightRange", "__OTHER__");
                          } else {
                            updateField("partnerHeightRange", next);
                          }
                        }}
                        options={[
                          ...PARTNER_HEIGHT_RANGE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select height range"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerHeightRange === "__OTHER__"
                            ? ""
                            : form.partnerHeightRange
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("partnerHeightRange", "");
                          } else {
                            updateField("partnerHeightRange", val);
                          }
                        }}
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write height range"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Preferred age range
                    </label>
                    {PARTNER_AGE_RANGE_OPTIONS.includes(form.partnerAgeRange) ||
                    !form.partnerAgeRange ? (
                      <FancySelect
                        value={
                          PARTNER_AGE_RANGE_OPTIONS.includes(
                            form.partnerAgeRange,
                          )
                            ? form.partnerAgeRange
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerAgeRange", "__OTHER__");
                          } else {
                            updateField("partnerAgeRange", next);
                          }
                        }}
                        options={[
                          ...PARTNER_AGE_RANGE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select age range"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerAgeRange === "__OTHER__"
                            ? ""
                            : form.partnerAgeRange
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("partnerAgeRange", "");
                          } else {
                            updateField("partnerAgeRange", val);
                          }
                        }}
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write age range"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Preferred marital status
                    </label>
                    {PARTNER_MARITAL_STATUS_OPTIONS.includes(
                      form.partnerMaritalStatus,
                    ) || !form.partnerMaritalStatus ? (
                      <FancySelect
                        value={
                          PARTNER_MARITAL_STATUS_OPTIONS.includes(
                            form.partnerMaritalStatus,
                          )
                            ? form.partnerMaritalStatus
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerMaritalStatus", "__OTHER__");
                          } else {
                            updateField("partnerMaritalStatus", next);
                          }
                        }}
                        options={[
                          ...PARTNER_MARITAL_STATUS_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select marital status"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerMaritalStatus === "__OTHER__"
                            ? ""
                            : form.partnerMaritalStatus
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("partnerMaritalStatus", "");
                          } else {
                            updateField("partnerMaritalStatus", val);
                          }
                        }}
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write marital status"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Kundli / astro preference
                    </label>
                    {KUNDLI_ASTRO_PREFERENCE_OPTIONS.includes(
                      form.partnerKundliAstro,
                    ) || !form.partnerKundliAstro ? (
                      <FancySelect
                        value={
                          KUNDLI_ASTRO_PREFERENCE_OPTIONS.includes(
                            form.partnerKundliAstro,
                          )
                            ? form.partnerKundliAstro
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerKundliAstro", "__OTHER__");
                          } else {
                            updateField("partnerKundliAstro", next);
                          }
                        }}
                        options={[
                          ...KUNDLI_ASTRO_PREFERENCE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select kundli/astro preference"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerKundliAstro === "__OTHER__"
                            ? ""
                            : form.partnerKundliAstro
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("partnerKundliAstro", "");
                          } else {
                            updateField("partnerKundliAstro", val);
                          }
                        }}
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write kundli/astro preference"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Disability preference
                    </label>
                    {SPECIAL_NOTE_OPTIONS.includes(form.partnerDisability) ||
                    !form.partnerDisability ? (
                      <FancySelect
                        value={
                          SPECIAL_NOTE_OPTIONS.includes(form.partnerDisability)
                            ? form.partnerDisability
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerDisability", "__OTHER__");
                          } else {
                            updateField("partnerDisability", next);
                          }
                        }}
                        options={[
                          ...SPECIAL_NOTE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select disability preference"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerDisability === "__OTHER__"
                            ? ""
                            : form.partnerDisability
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            updateField("partnerDisability", "");
                          } else {
                            updateField("partnerDisability", val);
                          }
                        }}
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write disability preference"
                      />
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      State
                    </label>
                    {INDIAN_STATE_OPTIONS.includes(form.partnerState) ||
                    !form.partnerState ? (
                      <FancySelect
                        value={
                          INDIAN_STATE_OPTIONS.includes(form.partnerState)
                            ? form.partnerState
                            : ""
                        }
                        onChange={(next) =>
                          updateField(
                            "partnerState",
                            next === "__OTHER__" ? "__OTHER__" : next,
                          )
                        }
                        options={[
                          ...INDIAN_STATE_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select state"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerState === "__OTHER__"
                            ? ""
                            : form.partnerState
                        }
                        onChange={(e) =>
                          updateField("partnerState", e.target.value)
                        }
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write state"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      District
                    </label>
                    {(() => {
                      const stateDistricts =
                        (form.partnerState &&
                          STATE_CITY_MAP[form.partnerState]) ||
                        [];

                      const districtOptions =
                        form.partnerState && stateDistricts.length > 0
                          ? stateDistricts
                          : CITY_SUGGESTIONS;

                      const inOptions = districtOptions.includes(
                        form.partnerDistrict,
                      );

                      if (inOptions || !form.partnerDistrict) {
                        return (
                          <FancySelect
                            value={inOptions ? form.partnerDistrict : ""}
                            onChange={(next) => {
                              if (next === "__OTHER__") {
                                updateField("partnerDistrict", "__OTHER__");
                              } else {
                                updateField("partnerDistrict", next);
                              }
                            }}
                            options={[
                              ...districtOptions.map((opt) => ({
                                label: opt,
                                value: opt,
                              })),
                              {
                                label: "Other (write manually)",
                                value: "__OTHER__",
                              },
                            ]}
                            placeholder="Select district"
                            columns={3}
                          />
                        );
                      }

                      return (
                        <input
                          type="text"
                          value={
                            form.partnerDistrict === "__OTHER__"
                              ? ""
                              : form.partnerDistrict
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              updateField("partnerDistrict", "");
                            } else {
                              updateField("partnerDistrict", val);
                            }
                          }}
                          className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Write district"
                        />
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Country
                    </label>
                    {COUNTRY_OPTIONS.includes(form.partnerCountry) ||
                    !form.partnerCountry ? (
                      <FancySelect
                        value={
                          COUNTRY_OPTIONS.includes(form.partnerCountry)
                            ? form.partnerCountry
                            : ""
                        }
                        onChange={(next) =>
                          updateField(
                            "partnerCountry",
                            next === "__OTHER__" ? "__OTHER__" : next,
                          )
                        }
                        options={[
                          ...COUNTRY_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select country"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerCountry === "__OTHER__"
                            ? ""
                            : form.partnerCountry
                        }
                        onChange={(e) =>
                          updateField("partnerCountry", e.target.value)
                        }
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write country"
                      />
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Education level
                    </label>
                    {EDUCATION_LEVEL_OPTIONS.includes(form.partnerEduLevel) ||
                    !form.partnerEduLevel ? (
                      <FancySelect
                        value={
                          EDUCATION_LEVEL_OPTIONS.includes(form.partnerEduLevel)
                            ? form.partnerEduLevel
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerEduLevel", "__OTHER__");
                          } else {
                            updateField("partnerEduLevel", next);
                          }
                        }}
                        options={[
                          ...EDUCATION_LEVEL_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select education level"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerEduLevel === "__OTHER__"
                            ? ""
                            : form.partnerEduLevel
                        }
                        onChange={(e) =>
                          updateField("partnerEduLevel", e.target.value)
                        }
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write education level"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Profession
                    </label>
                    {OCCUPATION_OPTIONS.includes(form.partnerProfession) ||
                    !form.partnerProfession ? (
                      <FancySelect
                        value={
                          OCCUPATION_OPTIONS.includes(form.partnerProfession)
                            ? form.partnerProfession
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerProfession", "__OTHER__");
                          } else {
                            updateField("partnerProfession", next);
                          }
                        }}
                        options={[
                          ...OCCUPATION_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select profession"
                        columns={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerProfession === "__OTHER__"
                            ? ""
                            : form.partnerProfession
                        }
                        onChange={(e) =>
                          updateField("partnerProfession", e.target.value)
                        }
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write profession"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Earning
                    </label>
                    {ANNUAL_INCOME_SAMPLES.includes(form.partnerEarning) ||
                    !form.partnerEarning ? (
                      <FancySelect
                        value={
                          ANNUAL_INCOME_SAMPLES.includes(form.partnerEarning)
                            ? form.partnerEarning
                            : ""
                        }
                        onChange={(next) => {
                          if (next === "__OTHER__") {
                            updateField("partnerEarning", "__OTHER__");
                          } else {
                            updateField("partnerEarning", next);
                          }
                        }}
                        options={[
                          ...ANNUAL_INCOME_SAMPLES.map((opt) => ({
                            label: opt,
                            value: opt,
                          })),
                          {
                            label: "Other (write manually)",
                            value: "__OTHER__",
                          },
                        ]}
                        placeholder="Select earning"
                        columns={2}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          form.partnerEarning === "__OTHER__"
                            ? ""
                            : form.partnerEarning
                        }
                        onChange={(e) =>
                          updateField("partnerEarning", e.target.value)
                        }
                        className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Write earning"
                      />
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Diet
                    </label>
                    <FancySelect
                      value={form.partnerDiet}
                      onChange={(next) => updateField("partnerDiet", next)}
                      options={DIET_OPTIONS.map((opt) => ({
                        label: opt,
                        value: opt,
                      }))}
                      placeholder="Select diet preference"
                      columns={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Smoking
                    </label>
                    <FancySelect
                      value={form.partnerSmoke}
                      onChange={(next) => updateField("partnerSmoke", next)}
                      options={SMOKING_OPTIONS.map((opt) => ({
                        label: opt,
                        value: opt,
                      }))}
                      placeholder="Select smoking preference"
                      columns={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Drinking
                    </label>
                    <FancySelect
                      value={form.partnerDrink}
                      onChange={(next) => updateField("partnerDrink", next)}
                      options={DRINKING_OPTIONS.map((opt) => ({
                        label: opt,
                        value: opt,
                      }))}
                      placeholder="Select drinking preference"
                      columns={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 11 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Profile headline (optional)
                  </label>
                  {PROFILE_HEADLINE_OPTIONS.includes(form.headline) ||
                  !form.headline ? (
                    <FancySelect
                      value={
                        PROFILE_HEADLINE_OPTIONS.includes(form.headline)
                          ? form.headline
                          : ""
                      }
                      onChange={(next) => {
                        if (next === "__OTHER__") {
                          updateField("headline", "__OTHER__");
                        } else {
                          updateField("headline", next);
                        }
                      }}
                      options={[
                        ...PROFILE_HEADLINE_OPTIONS.map((opt) => ({
                          label: opt,
                          value: opt,
                        })),
                        {
                          label: "Other (write manually)",
                          value: "__OTHER__",
                        },
                      ]}
                      placeholder="Select a headline"
                      columns={1}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form.headline === "__OTHER__" ? "" : form.headline}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          updateField("headline", "");
                        } else {
                          updateField("headline", val);
                        }
                      }}
                      className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Write your headline"
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  About you
                </p>
                <div>
                  <textarea
                    value={form.aboutYou}
                    onChange={(e) => updateField("aboutYou", e.target.value)}
                    rows={6}
                    className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    placeholder="Describe yourself, your personality, values, lifestyle, career, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {stepIndex === 12 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Additional notes
                </p>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Additional notes (shown at the end of your profile)
                </label>
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) =>
                    updateField("additionalNotes", e.target.value)
                  }
                  rows={6}
                  className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  placeholder="Anything else you or your family would like to share."
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0 || isSubmitting}
              className="px-4 py-2.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 disabled:opacity-60 bg-gray-50"
            >
              Previous
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={saveStepAndContinue}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Save and continue"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Complete registration"}
              </button>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MatrimonyOnboardingWizard;
