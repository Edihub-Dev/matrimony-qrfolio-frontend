// import React, { useState } from "react";
// import { X, Heart, Star, MessageCircle, Eye } from "lucide-react";
// import type { MatchFeedItem } from "../lib/matchesApi";
// import {
//   likeProfileEvent,
//   skipProfileEvent,
//   shortlistProfileEvent,
//   viewProfileEvent,
// } from "../lib/matchInteractions";

// export type DashboardFeedCardProps = {
//   item: MatchFeedItem;
//   onSkipped?: (id: string) => void;
// };

// export const DashboardFeedCard: React.FC<DashboardFeedCardProps> = ({
//   item,
//   onSkipped,
// }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCommentOpen, setIsCommentOpen] = useState(false);
//   const [commentText, setCommentText] = useState("");

//   const percentage = Math.max(
//     0,
//     Math.min(100, Math.round(item.matchPercentage || 0))
//   );

//   const disabled = isSubmitting;

//   const handleSkip = async () => {
//     setIsSubmitting(true);
//     try {
//       await skipProfileEvent(item.profileId, "feed");
//       if (onSkipped) {
//         onSkipped(item.id);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleInterested = async () => {
//     setIsSubmitting(true);
//     try {
//       await likeProfileEvent(item.profileId, "feed", {
//         origin: "dashboard_feed",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleShortlist = async () => {
//     setIsSubmitting(true);
//     try {
//       await shortlistProfileEvent(item.profileId, "feed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleViewFullProfile = async () => {
//     setIsSubmitting(true);
//     try {
//       await viewProfileEvent(item.profileId, "feed");
//       if (typeof window !== "undefined") {
//         window.location.href = `/matrimonial-profile?tab=feed&profileId=${item.profileId}`;
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleOpenComment = () => {
//     if (isSubmitting) return;
//     setIsCommentOpen(true);
//   };

//   const handleSubmitComment = async () => {
//     const text = commentText.trim();
//     if (!text) return;
//     setIsSubmitting(true);
//     try {
//       await likeProfileEvent(item.profileId, "feed", {
//         origin: "dashboard_feed",
//         variant: "comment",
//         text,
//       });
//       setCommentText("");
//       setIsCommentOpen(false);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <div className="relative w-full rounded-3xl bg-white shadow-2xl border border-rose-100 overflow-hidden">
//         <div className="w-full bg-rose-50 overflow-hidden">
//           {item.profilePhotoUrl ? (
//             <img
//               src={item.profilePhotoUrl}
//               alt={item.displayName}
//               className="bg-rose-50 h-72 w-full h-full object-cover"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-rose-700">
//               {item.displayName.charAt(0).toUpperCase()}
//             </div>
//           )}
//         </div>

//         <div className="p-4 space-y-2 bg-gradient-to-b from-white via-rose-50/80 to-rose-100/80">
//           <div className="flex items-start justify-between gap-3">
//             <div className="min-w-0">
//               <p className="truncate text-base font-semibold text-rose-950">
//                 Matrimony profile
//               </p>
//               <p className="mt-0.5 text-[11px] text-rose-700 flex flex-wrap gap-x-1.5 gap-y-0.5">
//                 {item.age && <span>{item.age} yrs</span>}
//                 {item.height && <span>7{item.height}</span>}
//                 {item.religion && <span>{item.religion}</span>}
//                 {item.caste && <span>{item.caste}</span>}
//                 {item.motherTongue && <span>{item.motherTongue}</span>}
//               </p>
//               {item.city && (
//                 <p className="mt-0.5 text-[11px] text-rose-700">{item.city}</p>
//               )}
//               {(item.education || item.profession) && (
//                 <p className="mt-0.5 text-[11px] text-rose-800">
//                   {[item.education, item.profession]
//                     .filter(Boolean)
//                     .join(" | ")}
//                 </p>
//               )}
//             </div>
//             <div className="flex flex-col items-end gap-1">
//               <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">
//                 Match
//               </span>
//               <span className="text-sm font-semibold text-rose-700">
//                 {percentage}%
//               </span>
//             </div>
//           </div>

//           <div className="mt-2 flex items-center justify-between text-[11px]">
//             <button
//               type="button"
//               onClick={handleViewFullProfile}
//               disabled={disabled}
//               className="text-rose-600 font-semibold hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               View full profile
//             </button>
//             <button
//               type="button"
//               onClick={handleShortlist}
//               disabled={disabled}
//               className="text-rose-600 font-semibold hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Shortlist
//             </button>
//           </div>
//         </div>
//       </div>

//       {isCommentOpen && (
//         <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
//           <p className="text-[11px] font-semibold text-rose-700 mb-1.5">
//             Comment for this profile
//           </p>
//           <textarea
//             value={commentText}
//             onChange={(e) => setCommentText(e.target.value)}
//             rows={2}
//             maxLength={500}
//             placeholder="Write a short message that will be shared with the family"
//             className="w-full resize-none rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-400"
//           />
//           <div className="mt-2 flex items-center justify-between gap-2">
//             <button
//               type="button"
//               onClick={() => {
//                 if (isSubmitting) return;
//                 setIsCommentOpen(false);
//                 setCommentText("");
//               }}
//               className="text-[10px] font-semibold text-rose-500 hover:text-rose-600"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmitComment}
//               disabled={isSubmitting || !commentText.trim()}
//               className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <MessageCircle className="h-3.5 w-3.5" />
//               <span>Send comment</span>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center justify-center gap-4 pt-1">
//         <button
//           type="button"
//           onClick={handleSkip}
//           disabled={disabled}
//           className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <X className="h-5 w-5" />
//         </button>
//         <button
//           type="button"
//           onClick={handleInterested}
//           disabled={disabled}
//           className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-md shadow-rose-300 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Heart className="h-6 w-6" />
//         </button>
//         <button
//           type="button"
//           onClick={handleShortlist}
//           disabled={disabled}
//           className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Star className="h-5 w-5" />
//         </button>
//         <button
//           type="button"
//           onClick={handleOpenComment}
//           disabled={disabled}
//           className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <MessageCircle className="h-5 w-5" />
//         </button>
//         <button
//           type="button"
//           onClick={handleViewFullProfile}
//           disabled={disabled}
//           className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Eye className="h-5 w-5" />
//         </button>
//       </div>
//     </div>
//   );
// };
