import React, { useEffect, useState } from "react";
import { PublicMatrimonyProfile } from "@/components/matrimony/M-PublicProfile";
// import { FeedProfileActionBar } from "../components/FeedProfileActionBar";

const FeedProfilePage: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("qrAuthToken");
    if (!token) {
      window.location.replace("/");
      return;
    }
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <div className="">
      <main className="">
        <div className="">
          <PublicMatrimonyProfile mode="feed" />
        </div>
      </main>
      {/* <FeedProfileActionBar /> */}
    </div>
  );
};

export default FeedProfilePage;
