import { useRef, useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/Button";
import { CalendarDays, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/core/utils";

declare global {
  interface Window {
    DigiboostSdk?: (config: any) => void;
  }
}

const SignupCard = () => {
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerReferralCode, setRegisterReferralCode] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerDob, setRegisterDob] = useState("");

  const [registerProfileManagedBy, setRegisterProfileManagedBy] = useState("");
  const [registerGender, setRegisterGender] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [registerConsent, setRegisterConsent] = useState(false);

  const [digilockerClientId, setDigilockerClientId] = useState<string | null>(
    null,
  );
  const [isDigilockerVerified, setIsDigilockerVerified] = useState(false);

  const deviceFingerprintRef = useRef<string | null>(null);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
  };

  const getDeviceFingerprint = () => {
    if (deviceFingerprintRef.current) {
      return deviceFingerprintRef.current;
    }

    if (typeof window === "undefined") {
      deviceFingerprintRef.current = "server";
      return deviceFingerprintRef.current;
    }

    const key = "qrDeviceFingerprint";
    let value = window.localStorage.getItem(key);
    if (!value) {
      value = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2)}`;
      window.localStorage.setItem(key, value);
    }
    deviceFingerprintRef.current = value;
    return value;
  };

  const loadDigiboostSdk = async () => {
    if (typeof window === "undefined") return false;
    if (window.DigiboostSdk) return true;

    const existing = document.querySelector(
      'script[data-surepass-digiboost="true"]',
    );
    if (existing) {
      return new Promise<boolean>((resolve) => {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
      });
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/surepassio/surepass-digiboost-web-sdk@latest/index.min.js";
      script.async = true;
      script.defer = true;
      script.dataset.surepassDigiboost = "true";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const syncKycToStorage = (status: string | null | undefined) => {
    if (typeof window === "undefined") return;
    const normalized = (status || "NOT_VERIFIED").toString().toUpperCase();
    window.localStorage.setItem("qrKycStatus", normalized || "NOT_VERIFIED");
    window.dispatchEvent(new Event("qrKycStatusUpdated"));
  };

  const handleContinue = () => {
    clearMessage();

    if (!registerName.trim()) {
      setIsError(true);
      setMessage("Please enter your full name.");
      return;
    }

    if (!registerEmail.trim()) {
      setIsError(true);
      setMessage("Please enter your email.");
      return;
    }

    const phoneDigits = registerPhone.replace(/\D/g, "");
    if (!phoneDigits) {
      setIsError(true);
      setMessage("Please enter your mobile number.");
      return;
    }

    if (phoneDigits.length !== 10) {
      setIsError(true);
      setMessage("Please enter a valid mobile number (10 digits).");
      return;
    }

    if (!registerDob.trim()) {
      setIsError(true);
      setMessage("Please enter your date of birth.");
      return;
    }

    setRegisterStep(2);
  };

  const handleStartDigilocker = async (consentOk = registerConsent) => {
    clearMessage();

    if (!consentOk) {
      setIsError(true);
      setMessage(
        "Please provide consent to continue with DigiLocker verification.",
      );
      return;
    }

    setIsDigilockerVerified(false);

    try {
      const sdkLoaded = await loadDigiboostSdk();
      if (!sdkLoaded || typeof window.DigiboostSdk !== "function") {
        setIsError(true);
        setMessage(
          "Unable to load verification module. Please try again later.",
        );
        return;
      }

      const initResponse = await axios.post("/api/kyc/digilocker/init", {
        deviceFingerprint: getDeviceFingerprint(),
        skipMainScreen: true,
      });

      const token = initResponse.data?.token || null;
      const clientId = initResponse.data?.clientId || null;
      const gateway = initResponse.data?.gateway || "sandbox";

      if (!token || !clientId) {
        setIsError(true);
        setMessage("Unable to start verification. Please try again later.");
        return;
      }

      setDigilockerClientId(clientId);

      if (typeof window !== "undefined") {
        const container = window.document.querySelector("#digilocker-button");
        if (container) {
          container.innerHTML = "";
        }
      }

      window.DigiboostSdk({
        gateway,
        token,
        selector: "#digilocker-button",
        onSuccess: function () {
          setIsDigilockerVerified(true);
          setIsError(false);
          setMessage("Verification successful. You can now register.");
        },
        onFailure: function () {
          setIsDigilockerVerified(false);
          setIsError(true);
          setMessage(
            "Verification was cancelled or failed. Please try again.",
          );
        },
      });
    } catch (error: any) {
      setIsDigilockerVerified(false);
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          "Unable to start verification. Please try again later.",
      );
    }
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!registerName.trim()) {
      setIsError(true);
      setMessage("Please enter your full name.");
      return;
    }

    if (!registerEmail.trim()) {
      setIsError(true);
      setMessage("Please enter your email.");
      return;
    }

    const phoneDigits = registerPhone.replace(/\D/g, "");
    if (!phoneDigits) {
      setIsError(true);
      setMessage("Please enter your mobile number.");
      return;
    }

    if (phoneDigits.length !== 10) {
      setIsError(true);
      setMessage("Please enter a valid mobile number (10 digits).");
      return;
    }

    if (!registerProfileManagedBy.trim()) {
      setIsError(true);
      setMessage("Please select who manages this profile.");
      return;
    }

    if (!registerGender.trim()) {
      setIsError(true);
      setMessage("Please select a gender.");
      return;
    }

    if (!registerPassword.trim() || !registerConfirmPassword.trim()) {
      setIsError(true);
      setMessage("Please enter and confirm your password.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (!digilockerClientId || !isDigilockerVerified) {
      setIsError(true);
      setMessage("Please complete DigiLocker verification before registering.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/kyc/digilocker/confirm", {
        clientId: digilockerClientId,
        deviceFingerprint: getDeviceFingerprint(),
        name: registerName.trim(),
        email: registerEmail.trim(),
        phone: phoneDigits,
        dob: registerDob.trim() || undefined,
        profileManagedBy: registerProfileManagedBy.trim() || undefined,
        gender: registerGender.trim() || undefined,
        password: registerPassword,
        referralCode: registerReferralCode.trim() || undefined,
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
        syncKycToStorage(backendKycStatus || "VERIFIED");
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
          "Signup completed. Redirecting you to your matrimony profile...",
      );

      if (typeof window !== "undefined") {
        window.location.href = "/matrimonial-profile?tab=feed";
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const details = error?.response?.data?.details;
      const code = error?.response?.data?.code;
      const combined =
        backendMessage ||
        (Array.isArray(details) ? details.join(", ") : undefined);

      const normalizedCode = typeof code === "string" ? code.toUpperCase() : "";
      const normalizedMessage = String(combined || "").toLowerCase();
      const aadhaarAlreadyUsed =
        normalizedCode.includes("AADHAAR") &&
        (normalizedCode.includes("USED") || normalizedCode.includes("EXISTS"))
          ? true
          : normalizedMessage.includes("aadhaar") &&
              (normalizedMessage.includes("already") ||
                normalizedMessage.includes("exists") ||
                normalizedMessage.includes("used"));

      setIsError(true);
      setMessage(
        aadhaarAlreadyUsed
          ? "This Aadhaar is already linked with another account. Please use a different Aadhaar or login to the existing account."
          : combined ||
              (code === "KYC_LOCKED"
                ? "Verification is temporarily locked. Please try again later."
                : code === "INVALID_OTP"
                  ? "Unable to verify OTP. Please try again."
                  : "Failed to register. Please check your details and try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("p-6", "sm:p-7", "max-w-md", "w-full", "mx-auto")}>
      {registerStep === 1 && (
        <>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Full Name
            </label>
            <input
              type="text"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              placeholder="Your full name"
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
          <div className={cn('space-y-1.5', 'mt-4')}>
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Email
            </label>
            <input
              type="email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              placeholder="Example@email.com"
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
          <div className={cn('space-y-1.5', 'mt-4')}>
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Referral / coupon code (optional)
            </label>
            <input
              type="text"
              value={registerReferralCode}
              onChange={(event) => setRegisterReferralCode(event.target.value)}
              placeholder="Enter code if you have one"
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
            />
          </div>
          <div className={cn('space-y-1.5', 'mt-4')}>
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Mobile Number
            </label>
            <input
              type="tel"
              value={registerPhone}
              onChange={(event) =>
                setRegisterPhone(event.target.value.replace(/\D/g, ""))
              }
              placeholder="10 digit mobile number"
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
              maxLength={10}
              required
            />
          </div>
          <div className={cn('space-y-1.5', 'mt-4')}>
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Date of Birth
            </label>
            <div className={cn("relative")}>
              <input
                type="date"
                value={registerDob}
                onChange={(event) => setRegisterDob(event.target.value)}
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
                  "pr-10",
                )}
                required
              />
              <CalendarDays
                className={cn(
                  "pointer-events-none",
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "h-4",
                  "w-4",
                  "text-gray-400",
                )}
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleContinue}
            className={cn(
              "w-full",
              "mt-6",
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
            Continue
          </Button>
        </>
      )}

      {registerStep === 2 && (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Profile Managed by
            </label>
            <select
              value={registerProfileManagedBy}
              onChange={(event) =>
                setRegisterProfileManagedBy(event.target.value)
              }
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
            >
              <option value="">Select</option>
              <option value="self">Self</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Gender
            </label>
            <select
              value={registerGender}
              onChange={(event) => setRegisterGender(event.target.value)}
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
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Enter Password
            </label>
            <div className={cn("relative")}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                placeholder="Enter password"
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
                onClick={() => setShowRegisterPassword((current) => !current)}
                className={cn(
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "text-gray-500",
                  "hover:text-gray-700",
                )}
                aria-label={
                  showRegisterPassword ? "Hide password" : "Show password"
                }
              >
                {showRegisterPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={cn("text-xs", "font-semibold", "text-gray-600")}>
              Confirm Password
            </label>
            <div className={cn("relative")}>
              <input
                type={showRegisterConfirmPassword ? "text" : "password"}
                value={registerConfirmPassword}
                onChange={(event) =>
                  setRegisterConfirmPassword(event.target.value)
                }
                placeholder="Re-enter password"
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
                  setShowRegisterConfirmPassword((current) => !current)
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
                  showRegisterConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showRegisterConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className={cn('space-y-2', 'mt-1')}>
            <label className={cn("flex", "items-start", "gap-2", "text-[11px]", "text-gray-700")}>
              <input
                type="checkbox"
                checked={registerConsent}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setRegisterConsent(checked);

                  if (typeof window !== "undefined") {
                    const container = window.document.querySelector(
                      "#digilocker-button",
                    );
                    if (container && !checked) {
                      container.innerHTML = "";
                    }
                  }

                  if (!checked) {
                    setDigilockerClientId(null);
                    setIsDigilockerVerified(false);
                    return;
                  }

                  void handleStartDigilocker(true);
                }}
                className="mt-0.5"
              />
              <span>
                I consent Aadhaar-based verification for account creation. (Use
                DigiLocker verification).
              </span>
            </label>

            {registerConsent && (
              <>
                <div id="digilocker-button" />
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDigilockerVerified}
            className={cn(
              "w-full",
              "mt-2",
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
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
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

const SignupPage = () => {
  return (
    <div className={cn('min-h-screen', 'relative', 'overflow-hidden', 'text-gray-900')}>
      
      {/* ===== BACKGROUND IMAGE ===== */}
      <img
        src="/assets/landing/Landing-Backgroung.png"
        alt=""
        className={cn('absolute', 'sm:bg-[center_top]', 'inset-0', 'w-full', 'object-cover', 'pointer-events-none', 'select-none')}
      />

      {/* ===== CONTENT LAYER ===== */}
      <div className={cn('relative', 'z-10')}>
        <Navbar />

        <main className={cn('px-4', 'sm:px-6', 'lg:px-8', 'pt-16', 'pb-20')}>
          <div className={cn('max-w-6xl', 'mx-auto')}>
            <div className={cn('rounded-[32px]', 'bg-white', 'shadow-[0_30px_100px_rgba(0,0,0,0.08)]', 'overflow-hidden')}>
              
              <div className={cn('grid', 'lg:grid-cols-2')}>
                
                {/* LEFT – SIGNUP FORM */}
                <div className={cn('p-8', 'sm:p-10', 'lg:p-14')}>
                  <h1 className={cn('text-3xl', 'font-bold', 'text-gray-900')}>
                    Register Now!
                  </h1>

                  <p className={cn('mt-2', 'text-sm', 'text-gray-500')}>
                    Create your account to start sharing your matrimony QR profile.
                  </p>

                  <div className="mt-8">
                    <SignupCard />
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
                    className={cn('max-h-[520px]', 'max-w-[520px]', 'mb-60','w-[520px]', 'object-contain')}
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

export default SignupPage;
