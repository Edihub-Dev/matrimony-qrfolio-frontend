import React from "react";
import { MatrimonyFeedSection } from "@/components/matrimony/M-Main-Feedpage";
export const FeedPage: React.FC = () => {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100">
      <main className="w-full max-w-full py-6 sm:py-10">
        <div className="w-full max-w-full px-0">
          <MatrimonyFeedSection />
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
