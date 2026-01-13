import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App.tsx";
import "./index.css";
import MatrimonialProfilePage from "./pages/MatrimonialProfilePage";
import MatrimonyOnboardingPage from "./pages/MatrimonyOnboardingPage";
import PublicMatrimonyProfilePage from "./pages/PublicMatrimonyProfilePage";
import MatrimonyQrCodePage from "./pages/MatrimonyQrCodePage";
import FeedPage from "./pages/FeedPage";
import FeedProfilePage from "./pages/PublicProfilePage.tsx";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminProfilesPage from "./pages/AdminProfilesPage";
import SwipeFeedPage from "./pages/SwipeFeedPage";
import InteractionAnalyticsPage from "./pages/InteractionAnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { PaymentCallback } from "./components/PaymentCallback";
import { AuthProvider } from "./context/AuthContext";
import { RealtimeToast } from "./components/RealtimeToast";

const MATRIMONY_API_BASE_URL: string | undefined = (import.meta as any)?.env
  ?.VITE_MATRIMONY_API_BASE_URL;

const DEFAULT_PROD_MATRIMONY_API_BASE_URL =
  "https://7mfrn3e6e5.execute-api.ap-south-1.amazonaws.com";

const resolvedBaseUrl =
  MATRIMONY_API_BASE_URL ||
  ((import.meta as any)?.env?.MODE === "production"
    ? DEFAULT_PROD_MATRIMONY_API_BASE_URL
    : "");

if (resolvedBaseUrl) {
  axios.defaults.baseURL = String(resolvedBaseUrl).replace(/\/$/, "");
}

const getRootComponent = () => {
  if (typeof window === "undefined") {
    return App;
  }

  const path = window.location.pathname || "/";

  if (path.startsWith("/payment/callback")) {
    return PaymentCallback;
  }

  if (path.startsWith("/admin/users")) {
    return AdminUsersPage;
  }

  if (path.startsWith("/admin/profiles")) {
    return AdminProfilesPage;
  }

  if (path.startsWith("/feed/profile/")) {
    return FeedProfilePage;
  }

  if (path.startsWith("/feed/swipe")) {
    return SwipeFeedPage;
  }

  if (path.startsWith("/feed")) {
    return FeedPage;
  }

  if (path.startsWith("/matrimonial-profile")) {
    return MatrimonialProfilePage;
  }

  if (path.startsWith("/matrimony-qr")) {
    return MatrimonyQrCodePage;
  }

  if (path.startsWith("/matrimony-onboarding")) {
    return MatrimonyOnboardingPage;
  }

  if (path.startsWith("/public-matrimony/")) {
    return PublicMatrimonyProfilePage;
  }

  if (path.startsWith("/notifications")) {
    return NotificationsPage;
  }

  if (path.startsWith("/analytics/interactions")) {
    return InteractionAnalyticsPage;
  }

  return App;
};

const RootComponent = getRootComponent();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <>
        <RootComponent />
        <RealtimeToast />
      </>
    </AuthProvider>
  </StrictMode>
);
