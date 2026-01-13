import React, { useCallback, useRef, useState } from "react";
import type { MatchFeedItem } from "../lib/matchesApi";

export type SwipeCardAction = "like" | "skip" | "shortlist" | "view";

export type SwipeCardProps = {
  item: MatchFeedItem;
  onAction: (action: SwipeCardAction) => void;
};

const SWIPE_THRESHOLD = 80;
const MAX_ROTATION_DEG = 12;

export const SwipeCard: React.FC<SwipeCardProps> = ({ item, onAction }) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const touch = event.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    setOffsetX(dx);
    setOffsetY(dy);
  };

  const settleSwipe = useCallback(
    (dx: number) => {
      const absDx = Math.abs(dx);
      if (absDx < SWIPE_THRESHOLD) {
        setOffsetX(0);
        setOffsetY(0);
        return;
      }
      const direction: SwipeCardAction = dx > 0 ? "like" : "skip";
      setIsAnimatingOut(true);
      const finalX = dx > 0 ? window.innerWidth : -window.innerWidth;
      setOffsetX(finalX * 0.8);
      setTimeout(() => {
        onAction(direction);
        setIsAnimatingOut(false);
        setOffsetX(0);
        setOffsetY(0);
      }, 180);
    },
    [onAction]
  );

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX.current == null || touchStartY.current == null) {
      setOffsetX(0);
      setOffsetY(0);
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    settleSwipe(dx);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleDoubleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    onAction("like");
  };

  const rotation = (offsetX / window.innerWidth) * MAX_ROTATION_DEG;

  const handleViewProfile = () => {
    onAction("view");
  };

  const handleShortlist = () => {
    onAction("shortlist");
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-rose-100 overflow-hidden select-none cursor-pointer"
        style={{
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg)`,
          transition: isAnimatingOut
            ? "transform 0.18s ease-out"
            : "transform 0.08s ease-out",
        }}
      >
        <div className="h-80 w-full bg-rose-50 overflow-hidden">
          {item.profilePhotoUrl ? (
            <img
              src={item.profilePhotoUrl}
              alt={item.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-rose-700">
              {item.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-rose-950">
                {item.displayName}
              </p>
              <p className="mt-0.5 text-xs text-rose-700 flex flex-wrap gap-x-1.5 gap-y-0.5">
                {item.age && <span>{item.age} yrs</span>}
                {item.height && <span>• {item.height}</span>}
                {item.religion && <span>• {item.religion}</span>}
                {item.caste && <span>• {item.caste}</span>}
                {item.motherTongue && <span>• {item.motherTongue}</span>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">
                Match
              </span>
              <span className="text-sm font-semibold text-rose-700">
                {Math.round(item.matchPercentage)}%
              </span>
            </div>
          </div>

          {(item.city || item.state) && (
            <p className="flex items-center gap-1 text-[11px] text-rose-700">
              <span className="truncate">
                {[item.city, item.state].filter(Boolean).join(", ")}
              </span>
            </p>
          )}

          {(item.education || item.profession) && (
            <p className="text-[11px] text-rose-800">
              {[item.education, item.profession].filter(Boolean).join(" • ")}
            </p>
          )}

          <div className="flex justify-between items-center pt-2 text-[10px] text-rose-500">
            {item.recommended && <span>Highly compatible match</span>}
            {item.boosted && (
              <span className="text-amber-600 font-semibold">Boosted</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleViewProfile}
              className="text-rose-600 font-semibold hover:text-rose-700"
            >
              View full profile
            </button>
            <button
              type="button"
              onClick={handleShortlist}
              className="text-rose-600 font-semibold hover:text-rose-700"
            >
              Shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
