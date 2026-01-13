import React from "react";
import { X, Heart, Star, Eye } from "lucide-react";
import type { SwipeCardAction } from "./SwipeCard";

export type SwipeActionButtonsProps = {
  onAction: (action: SwipeCardAction) => void;
};

export const SwipeActionButtons: React.FC<SwipeActionButtonsProps> = ({
  onAction,
}) => {
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-6 flex items-center justify-center">
      <div className="inline-flex items-center gap-4 rounded-full bg-white/95 px-4 py-2 shadow-lg shadow-rose-200 border border-rose-100">
        <button
          type="button"
          onClick={() => onAction("skip")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onAction("like")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-md shadow-rose-300 active:scale-95 transition"
        >
          <Heart className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => onAction("shortlist")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 active:scale-95 transition"
        >
          <Star className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onAction("view")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
