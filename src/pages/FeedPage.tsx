import React from "react";
import { MatrimonyFeedSection } from "../components/MatrimonyFeedSection";
export const FeedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100">
      <main className="py-6 sm:py-10">
        <div className="w-full px-0">
          <MatrimonyFeedSection />
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
