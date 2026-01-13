import React from "react";
import { Heart, MapPin, GraduationCap, Briefcase } from "lucide-react";
import type { MatchFeedItem } from "../lib/matchesApi";

export type MatchCardProps = {
  item: MatchFeedItem;
  onClick?: (item: MatchFeedItem) => void;
};

export const MatchCard: React.FC<MatchCardProps> = ({ item, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = `/feed/profile/${item.profileId}`;
    }
  };

  const percentage = item.matchPercentage || 0;
  const clamped = Math.max(0, Math.min(100, percentage));

  const showLocation = item.city || item.state;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col rounded-2xl border border-rose-100 bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-rose-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-rose-50 flex items-center justify-center text-sm font-semibold text-rose-700">
          {item.profilePhotoUrl ? (
            <img
              src={item.profilePhotoUrl}
              alt={item.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{item.displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-rose-950">
              {item.displayName}
            </p>
            {item.recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                <Heart className="h-3 w-3" />
                Recommended
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-rose-700 flex flex-wrap gap-x-2 gap-y-0.5">
            {item.age && <span>{item.age} yrs</span>}
            {item.height && <span>• {item.height}</span>}
            {item.religion && <span>• {item.religion}</span>}
            {item.caste && <span>• {item.caste}</span>}
            {item.motherTongue && <span>• {item.motherTongue}</span>}
          </p>
          {showLocation && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-rose-700">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {[item.city, item.state].filter(Boolean).join(", ")}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 ml-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">
            Match
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-rose-700">
              {clamped}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-20 rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </div>
      {((item.viewsCount ?? 0) > 0 ||
        (item.likesCount ?? 0) > 0 ||
        (item.shortlistedCount ?? 0) > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-rose-600">
          {typeof item.viewsCount === "number" && item.viewsCount > 0 && (
            <span>{item.viewsCount} views</span>
          )}
          {typeof item.likesCount === "number" && item.likesCount > 0 && (
            <span>
              {item.viewsCount && item.viewsCount > 0 ? "• " : ""}
              {item.likesCount} interested
            </span>
          )}
          {typeof item.shortlistedCount === "number" &&
            item.shortlistedCount > 0 && (
              <span>
                {(item.viewsCount ?? 0) > 0 || (item.likesCount ?? 0) > 0
                  ? "• "
                  : ""}
                {item.shortlistedCount} shortlisted
              </span>
            )}
        </div>
      )}
      {(item.education || item.profession) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-rose-800">
          {item.education && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 border border-rose-100">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{item.education}</span>
            </span>
          )}
          {item.profession && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 border border-rose-100">
              <Briefcase className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{item.profession}</span>
            </span>
          )}
        </div>
      )}
    </button>
  );
};
