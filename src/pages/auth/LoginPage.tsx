import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/Button";
import { qrfolioApi, QR_BASE_API_URL } from "@/lib/core/qrfolioApi";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/core/utils";

type LoginView = "login" | "forgotPassword" | "resetPassword";

const LoginCard = () => {
  const [authView, setAuthView] = useState<LoginView>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleResendResetCode = async () => {
    clearMessage();

    if (!resetEmail.trim()) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    if (resendCooldown > 0) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/request-password-reset", {
        email: resetEmail.trim(),
      });
      setIsError(false);
      setMessage(
        response.data?.message ||
          "Reset code resent. Please check your email for the new code.",
      );
      setResendCooldown(30);
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Unable to resend code right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncKycToStorage = (status: string | null | undefined) => {
    if (typeof window === "undefined") return;
    const normalized = (status || "NOT_VERIFIED").toString().toUpperCase();
    window.localStorage.setItem("qrKycStatus", normalized || "NOT_VERIFIED");
    window.dispatchEvent(new Event("qrKycStatusUpdated"));
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessage();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setIsError(true);
      setMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      let qrPaid = false;

      if (QR_BASE_API_URL) {
        try {
          const qrResponse = await qrfolioApi.post("/auth/login", {
            email: loginEmail.trim(),
            password: loginPassword,
          });

          const qrToken: string | undefined = qrResponse.data?.token;
          const qrUser = qrResponse.data?.user;
          const requiresPayment: boolean | undefined =
            qrResponse.data?.requiresPayment;

          qrPaid = requiresPayment === false || Boolean(qrUser?.isPaid);

          if (qrToken && typeof window !== "undefined") {
            window.localStorage.setItem("qrfolioMainToken", qrToken);
            if (qrUser?.email && !window.localStorage.getItem("qrEmail")) {
              window.localStorage.setItem("qrEmail", qrUser.email);
            }
            if (qrUser?.name && !window.localStorage.getItem("qrName")) {
              window.localStorage.setItem("qrName", qrUser.name);
            }
          }
        } catch (error: any) {
          setIsError(true);
          setMessage(
            error?.response?.data?.message ||
              "Login failed. Please check your email and password.",
          );
          return;
        }
      }

      const response = await axios.post("/api/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
        sourceApp: "matrimony",
        qrPaid,
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;
      const backendName: string | undefined =
        response.data?.user?.name || response.data?.user?.fullName;
      const backendIsAdmin: boolean | undefined =
        response.data?.user?.isAdmin;
      const backendKycStatus: string | undefined =
        response.data?.user?.kyc?.status;

      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("qrAuthToken", token);
        syncKycToStorage(backendKycStatus);
        if (backendPhone) {
          window.localStorage.setItem("qrPhone", backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem("qrEmail", backendEmail);
          window.dispatchEvent(new Event("qrProfileEmailUpdated"));
        }
        if (backendName) {
          window.localStorage.setItem("qrName", backendName);
          window.dispatchEvent(new Event("qrProfileNameUpdated"));
        }
        if (typeof backendIsAdmin === "boolean") {
          window.localStorage.setItem("qrIsAdmin", String(backendIsAdmin));
          window.dispatchEvent(new Event("qrAdminUpdated"));
        }
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          "Logged in via your QR Folio account. Redirecting you to your matrimony feed...",
      );
      if (typeof window !== "undefined") {
        window.location.href = "/matrimonial-profile?tab=feed";
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!forgotEmail.trim()) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/request-password-reset", {
        email: forgotEmail.trim(),
      });

      setResetEmail(forgotEmail.trim());
      setAuthView("resetPassword");
      setIsError(false);
      setMessage(
        response.data?.message ||
          "If an account exists, a reset code has been sent to your email.",
      );
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Failed to start password reset. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!resetEmail.trim() || !resetCode.trim()) {
      setIsError(true);
      setMessage("Please enter your email and reset code.");
      return;
    }

    if (!resetNewPassword.trim() || !resetConfirmPassword.trim()) {
      setIsError(true);
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setIsError(true);
      setMessage("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/reset-password-with-code", {
        email: resetEmail.trim(),
        code: resetCode.trim(),
        newPassword: resetNewPassword,
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;
      const backendName: string | undefined =
        response.data?.user?.name || response.data?.user?.fullName;
      const backendIsAdmin: boolean | undefined =
        response.data?.user?.isAdmin;

      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("qrAuthToken", token);
        if (backendPhone) {
          window.localStorage.setItem("qrPhone", backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem("qrEmail", backendEmail);
        }
        if (backendName) {
          window.localStorage.setItem("qrName", backendName);
          window.dispatchEvent(new Event("qrProfileNameUpdated"));
        }
        if (typeof backendIsAdmin === "boolean") {
          window.localStorage.setItem("qrIsAdmin", String(backendIsAdmin));
          window.dispatchEvent(new Event("qrAdminUpdated"));
        }
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          "Password reset successfully. Redirecting you to your matrimony feed...",
      );
      if (typeof window !== "undefined") {
        window.location.href = "/matrimonial-profile?tab=feed";
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Failed to reset password. Please check the details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("p-6", "sm:p-7", "max-w-md", "w-full", "mx-auto")}>
      {authView === "login" && (
        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full",
                "bg-white",
                "border",
                "border-rose-100",
                "text-sm",
                "rounded-xl",
                "focus:ring-rose-500",
                "focus:border-rose-500",
                "block",
                "p-3",
              )}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Your password"
              className={cn(
                "w-full",
                "bg-white",
                "border",
                "border-rose-100",
                "text-sm",
                "rounded-xl",
                "focus:ring-rose-500",
                "focus:border-rose-500",
                "block",
                "p-3",
              )}
              required
            />
          </div>

          <div
            className={cn(
              "flex",
              "items-center",
              "justify-between",
              "text-[11px]",
            )}
          >
            <button
              type="button"
              className={cn(
                "text-rose-600",
                "hover:text-rose-700",
                "font-medium",
              )}
              onClick={() => {
                clearMessage();
                setAuthView("forgotPassword");
                setForgotEmail(loginEmail);
              }}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full",
              "bg-gradient-to-r",
              "from-rose-600",
              "to-red-500",
              "text-sm",
              "font-semibold",
              "shadow-md",
              "shadow-rose-200",
              "flex",
              "items-center",
              "justify-center",
              "gap-2",
            )}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      )}

      {authView === "forgotPassword" && (
        <form className="space-y-4" onSubmit={handleForgotPasswordRequest}>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>Email</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full",
                "bg-white",
                "border",
                "border-rose-100",
                "text-sm",
                "rounded-xl",
                "focus:ring-rose-500",
                "focus:border-rose-500",
                "block",
                "p-3",
              )}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full",
              "bg-gradient-to-r",
              "from-rose-600",
              "to-red-500",
              "text-sm",
              "font-semibold",
              "shadow-md",
              "shadow-rose-200",
              "flex",
              "items-center",
              "justify-center",
              "gap-2",
            )}
          >
            {isSubmitting ? "Sending code..." : "Send reset code"}
          </Button>

          <button
            type="button"
            className={cn(
              "block",
              "w-full",
              "text-[11px]",
              "text-gray-600",
              "mt-1",
            )}
            onClick={() => {
              clearMessage();
              setAuthView("login");
            }}
          >
            Back to login
          </button>
        </form>
      )}

      {authView === "resetPassword" && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full",
                "bg-white",
                "border",
                "border-rose-100",
                "text-sm",
                "rounded-xl",
                "focus:ring-rose-500",
                "focus:border-rose-500",
                "block",
                "p-3",
              )}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Reset code
            </label>
            <input
              type="text"
              value={resetCode}
              onChange={(event) => setResetCode(event.target.value)}
              placeholder="6-digit code from email"
              className={cn(
                "w-full",
                "bg-white",
                "border",
                "border-rose-100",
                "text-sm",
                "rounded-xl",
                "focus:ring-rose-500",
                "focus:border-rose-500",
                "block",
                "p-3",
                "tracking-[0.3em]",
                "text-center",
              )}
              maxLength={6}
              required
            />
            <button
              type="button"
              disabled={isSubmitting || resendCooldown > 0}
              onClick={handleResendResetCode}
              className={cn(
                "mt-1",
                "text-[11px]",
                "font-medium",
                "text-rose-600",
                "hover:text-rose-700",
                "disabled:opacity-60",
              )}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              New password
            </label>
            <div className={cn("relative")}>
              <input
                type={showResetNewPassword ? "text" : "password"}
                value={resetNewPassword}
                onChange={(event) => setResetNewPassword(event.target.value)}
                placeholder="New password"
                className={cn(
                  "w-full",
                  "bg-white",
                  "border",
                  "border-rose-100",
                  "text-sm",
                  "rounded-xl",
                  "focus:ring-rose-500",
                  "focus:border-rose-500",
                  "block",
                  "p-3",
                  "pr-11",
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowResetNewPassword((current) => !current)}
                className={cn(
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "text-gray-500",
                  "hover:text-gray-700",
                )}
                aria-label={
                  showResetNewPassword ? "Hide password" : "Show password"
                }
              >
                {showResetNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Confirm new password
            </label>
            <div className={cn("relative")}>
              <input
                type={showResetConfirmPassword ? "text" : "password"}
                value={resetConfirmPassword}
                onChange={(event) => setResetConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                className={cn(
                  "w-full",
                  "bg-white",
                  "border",
                  "border-rose-100",
                  "text-sm",
                  "rounded-xl",
                  "focus:ring-rose-500",
                  "focus:border-rose-500",
                  "block",
                  "p-3",
                  "pr-11",
                )}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowResetConfirmPassword((current) => !current)
                }
                className={cn(
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "text-gray-500",
                  "hover:text-gray-700",
                )}
                aria-label={
                  showResetConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showResetConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full",
              "bg-gradient-to-r",
              "from-rose-600",
              "to-red-500",
              "text-sm",
              "font-semibold",
              "shadow-md",
              "shadow-rose-200",
              "flex",
              "items-center",
              "justify-center",
              "gap-2",
            )}
          >
            {isSubmitting
              ? "Updating password..."
              : "Reset password & Login"}
          </Button>

          <button
            type="button"
            className={cn(
              "block",
              "w-full",
              "text-[11px]",
              "text-gray-600",
              "mt-1",
            )}
            onClick={() => {
              clearMessage();
              setAuthView("login");
            }}
          >
            Back to login
          </button>
        </form>
      )}

      {message && (
        <p
          className={`mt-4 text-xs text-center ${
            isError ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

const LoginPage = () => {
  return (
    <div className={cn('min-h-screen', 'text-gray-900', 'relative', 'overflow-hidden')}>
      
      {/* ===== BACKGROUND IMAGE ===== */}
      <img
        src="/assets/landing/Landing-Backgroung.png"
        alt=""
        className={cn('absolute', 'sm:bg-[center_top]', 'inset-0', 'w-full', 'object-cover', 'pointer-events-none', 'select-none')}
      />

      {/* CONTENT LAYER */}
      <div className={cn('relative', 'z-10')}>
        <Navbar />

        <main className={cn('px-4', 'sm:px-6', 'lg:px-8', 'pt-16', 'pb-20')}>
          <div className={cn('max-w-6xl', 'mx-auto')}>
            <div className={cn('rounded-[32px]', 'bg-white', 'shadow-[0_30px_100px_rgba(0,0,0,0.08)]', 'overflow-hidden')}>
              
              <div className={cn('grid', 'lg:grid-cols-2')}>
                
                {/* LEFT – LOGIN FORM */}
                <div className={cn('p-8', 'sm:p-10', 'lg:p-14')}>
                  <h1 className={cn('text-3xl', 'font-bold', 'text-gray-900')}>
                    Welcome Back 👋
                  </h1>

                  <p className={cn('mt-2', 'text-sm', 'text-gray-500')}>
                    Log in to continue to your matrimony profile
                  </p>

                  <div className="mt-8">
                    <LoginCard />
                  </div>

                  <div className={cn('mt-12', 'text-[11px]', 'text-gray-400')}>
                    © 2026 ALL RIGHTS RESERVED
                  </div>
                </div>

                {/* RIGHT – ILLUSTRATION */}
                <div className={cn('relative', 'hidden', 'lg:flex', 'items-end', 'justify-center')}>
                  <img
                    src="/assets/landing/matrimony-couple.png"
                    alt="Matrimony Couple"
                    className={cn('max-h-[520px]', 'w-auto', 'mb-10', 'object-contain')}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
