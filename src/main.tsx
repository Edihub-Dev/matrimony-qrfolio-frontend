import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App.tsx";
import "./index.css";
import MatrimonialProfilePage from "@/pages/matrimony/MatrimonialProfilePage";
import MatrimonyOnboardingPage from "@/pages/matrimony/M-Edit-Profile-page.tsx";
import PublicMatrimonyProfilePage from "@/pages/matrimony/PublicMatrimonyProfilePage";
import MatrimonyQrCodePage from "@/pages/matrimony/MatrimonyQrCodePage";
import FeedPage from "@/pages/feed/FeedPage";
import FeedProfilePage from "@/pages/feed/FeedProfilePage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminProfilesPage from "@/pages/admin/AdminProfilesPage";
import InteractionAnalyticsPage from "@/pages/feed/InteractionAnalyticsPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import { PaymentCallback } from "@/components/payments/PaymentCallback";
import { AuthProvider } from "@/context/AuthContext";
import { RealtimeToast } from "@/components/shared/RealtimeToast";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

const MATRIMONY_API_BASE_URL: string | undefined =
  (import.meta as any)?.env?.VITE_MATRIMONY_API_BASE_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL;

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

  if (path.startsWith("/login")) {
    return LoginPage;
  }

  if (path.startsWith("/signup")) {
    return SignupPage;
  }

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
  </StrictMode>,
);
