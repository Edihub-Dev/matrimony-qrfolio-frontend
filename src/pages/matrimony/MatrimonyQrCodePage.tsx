import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  Download,
  Share2,
  Copy,
  Eye,
  Link as LinkIcon,
  Shield,
  Image as ImageIcon,
  Share,
} from "lucide-react";
import { getMyMatrimonyProfile } from "@/lib/matrimony/matrimonyApi";

export const MatrimonyQrCodeSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [displayDesignation, setDisplayDesignation] = useState<string>("");
  const [userPhoto, setUserPhoto] = useState<string>("");
  const [kycStatus, setKycStatus] = useState<string>("NOT_VERIFIED");

  const [baseSize, setBaseSize] = useState(240);
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const [qrComplexity, setQrComplexity] = useState<1 | 2 | 3>(2);

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const qrContainerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        const profile: any = (result as any).profile;

        if (!result.ok || !profile?.id) {
          if ((result as any).authError) {
            setMissingProfile(false);
            setError("Please login again to view your QR code.");
          } else if ((result as any).notFound) {
            setMissingProfile(true);
            setError(null);
          } else {
            setMissingProfile(false);
            setError(
              (result as any).error || "Failed to load your matrimony profile.",
            );
          }
          setLoading(false);
          return;
        }

        setMissingProfile(false);
        setProfileId(profile.id);

        setKycStatus(String(profile.kycStatus || "NOT_VERIFIED"));

        const full = (profile.fullProfile || {}) as any;
        const basic = full.basicDetails || {};
        const about = full.about || {};
        const career = full.career || {};
        const education = full.education || {};

        let name: string = about.profileManagedBy || "";

        if (typeof window !== "undefined") {
          const qrName = window.localStorage.getItem("qrName") || "";
          if (!name) {
            name = qrName;
          }
        }

        if (!name) {
          name = "Matrimony profile";
        }

        let designation = "";
        if (career.role && career.location) {
          designation = `${career.role}`;
        } else if (career.role) {
          designation = career.role;
        } else if (career.location) {
          designation = career.location;
        } else if (education.description) {
          designation = education.description;
        } else if (basic.occupation) {
          designation = basic.occupation;
        }

        setDisplayName(name);
        setDisplayDesignation(designation);

        if (typeof window !== "undefined") {
          setUserPhoto(window.localStorage.getItem("qrMatrimonyPhoto") || "");
        }
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load your matrimony profile.");
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const loadLogo = async () => {
      try {
        const response = await fetch("/assets/M-Logo.png");
        if (!response.ok) return;
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === "string") {
            setLogoDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // ignore logo load errors
      }
    };

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = profileId ? `${baseUrl}/public-matrimony/${profileId}` : "";

  useEffect(() => {
    const next = qrComplexity === 1 ? 220 : qrComplexity === 3 ? 300 : 260;
    setBaseSize(next);
  }, [qrComplexity]);

  const qrSize = baseSize;

  const initials = useMemo(() => {
    const value = (displayName || "M").trim();
    return value ? value.charAt(0).toUpperCase() : "M";
  }, [displayName]);

  const getSvgElement = (): SVGSVGElement | null => {
    if (typeof document === "undefined") return null;
    const container = qrContainerRef.current;
    if (!container) return null;
    return container.querySelector("svg");
  };

  const escapeForSvg = (value: string): string =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const buildCardSvg = (
    qrSvg: string,
    options?: { logoHref?: string },
  ): { svg: string; width: number; height: number } => {
    const svgOpenTagEnd = qrSvg.indexOf(">");
    const svgCloseTagStart = qrSvg.lastIndexOf("</svg>");
    const qrInner =
      svgOpenTagEnd !== -1 && svgCloseTagStart !== -1
        ? qrSvg.slice(svgOpenTagEnd + 1, svgCloseTagStart)
        : qrSvg;

    const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${qrSize} ${qrSize}`;

    const cardWidth = qrSize + 160;
    const cardHeight = qrSize + 220;

    const tileWidth = qrSize + 40;
    const tileHeight = qrSize + 40;
    const tileX = (cardWidth - tileWidth) / 2;
    const tileY = 40;

    const qrX = (cardWidth - qrSize) / 2;
    const qrY = tileY + (tileHeight - qrSize) / 2;

    const centerX = qrX + qrSize / 2;
    const centerY = qrY + qrSize / 2;
    const logoSize = qrSize * 0.28;
    const logoX = centerX - logoSize / 2;
    const logoY = centerY - logoSize / 2;
    const innerLogoSize = logoSize * 0.76;
    const innerLogoX = logoX + (logoSize - innerLogoSize) / 2;
    const innerLogoY = logoY + (logoSize - innerLogoSize) / 2;

    const logoHref = options?.logoHref || "/assets/M-Logo.png";

    const nameToShow = displayName || "Matrimony profile";
    const designationToShow = displayDesignation || "";
    const subtitle = "Scan to view profile";

    const textStartY = tileY + tileHeight + 40;
    const nameY = textStartY;
    const designationY = textStartY + 22;
    const subtitleY = textStartY + 42;

    const designationSvg = designationToShow
      ? `\n  <text x="${
          cardWidth / 2
        }" y="${designationY}" text-anchor="middle" fill="#E5E7EB" font-size="14" font-weight="400" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
          designationToShow,
        )}\n  </text>`
      : "";

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img">\n  <defs>\n    <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#fb7185" />\n      <stop offset="50%" stop-color="#f97316" />\n      <stop offset="100%" stop-color="#ec4899" />\n    </linearGradient>\n    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#fb7185" />\n      <stop offset="50%" stop-color="#f97316" />\n      <stop offset="100%" stop-color="#ec4899" />\n    </linearGradient>\n  </defs>\n  <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" rx="32" fill="url(#cardGradient)" />\n  <rect x="8" y="8" width="${
      cardWidth - 16
    }" height="${cardHeight - 16}" rx="28" fill="#020617" />\n  <rect x="${
      tileX - 2
    }" y="${tileY - 2}" width="${tileWidth + 4}" height="${
      tileHeight + 4
    }" rx="34" fill="url(#borderGradient)" />\n  <rect x="${tileX}" y="${tileY}" width="${tileWidth}" height="${tileHeight}" rx="32" fill="#ffffff" />\n  <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="${viewBox}">\n${qrInner}\n  </svg>\n  <rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${
      logoSize / 3
    }" fill="#ffffff" />\n  <image x="${innerLogoX}" y="${innerLogoY}" width="${innerLogoSize}" height="${innerLogoSize}" preserveAspectRatio="xMidYMid meet" xlink:href="${logoHref}" />\n  <text x="${
      cardWidth / 2
    }" y="${nameY}" text-anchor="middle" fill="#F9FAFB" font-size="20" font-weight="600" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
      nameToShow,
    )}\n  </text>${designationSvg}\n  <text x="${
      cardWidth / 2
    }" y="${subtitleY}" text-anchor="middle" fill="#9CA3AF" font-size="13" font-weight="400" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">\n    ${escapeForSvg(
      subtitle,
    )}\n  </text>\n</svg>`;

    return { svg, width: cardWidth, height: cardHeight };
  };

  const handleCopy = () => {
    if (!publicUrl) return;

    if (
      typeof navigator !== "undefined" &&
      (navigator as any).clipboard &&
      (window as any).isSecureContext
    ) {
      void (navigator as any).clipboard
        .writeText(publicUrl)
        .then(() => {
          toast.success("Profile link copied.");
        })
        .catch(() => {
          toast.error("Could not copy link.");
        });
      return;
    }

    if (typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = publicUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Profile link copied.");
      } catch {
        toast.error("Could not copy link.");
      }
    }
  };

  const handleShare = () => {
    if (!publicUrl) return;
    if (typeof navigator !== "undefined") {
      const nav: any = navigator;
      if (nav && typeof nav.share === "function") {
        void nav
          .share({
            title: "My matrimony profile",
            url: publicUrl,
          })
          .then(() => {
            toast.success("Share opened.");
          })
          .catch(() => {
            toast.error("Could not open share.");
          });
        return;
      }
    }
    handleCopy();
    toast.success("Profile link copied.");
  };

  const handleOpenProfile = () => {
    if (!publicUrl) return;
    if (typeof window !== "undefined") {
      window.open(publicUrl, "_blank");
      toast.success("Opening public profile...");
    }
  };

  const handleDownloadSvg = () => {
    if (typeof document === "undefined") return;
    const svg = getSvgElement();
    if (!svg) {
      toast.error("QR code is not ready yet.");
      return;
    }

    const serializer = new XMLSerializer();
    const qrSource = serializer.serializeToString(svg);

    const { svg: cardSvg } = buildCardSvg(qrSource, {
      logoHref: logoDataUrl || "/assets/M-Logo.png",
    });

    const blob = new Blob([cardSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "matrimony-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("SVG downloaded.");
  };

  const handleDownloadPng = () => {
    if (typeof document === "undefined") return;
    const svg = getSvgElement();
    if (!svg) {
      toast.error("QR code is not ready yet.");
      return;
    }

    const serializer = new XMLSerializer();
    const qrSource = serializer.serializeToString(svg);

    const {
      svg: cardSvg,
      width,
      height,
    } = buildCardSvg(qrSource, {
      logoHref: logoDataUrl || "/assets/M-Logo.png",
    });

    const svgBlob = new Blob([cardSvg], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      // Keep QR modules crisp
      (ctx as any).imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0, width, height);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "matrimony-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PNG downloaded.");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Failed to generate PNG.");
    };

    image.src = url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-rose-500">Loading...</p>
      </div>
    );
  }

  if (missingProfile) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#171411] text-3xl font-black tracking-tight">
            My QR Code
          </h1>
          <p className="text-[#877564] text-base">
            Create your matrimony profile to generate and share a QR code.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/matrimonial-profile?tab=edit";
            }
          }}
          className="w-fit bg-[#f07f9c] text-[#2e1d22] hover:bg-[#e06886] px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          Create / Edit Profile
        </button>
      </div>
    );
  }

  if (error || !publicUrl) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-rose-900">My QR code</h2>
        <p className="text-sm text-rose-600">
          {error || "No profile found yet."}
        </p>
      </div>
    );
  }

  const accentPresets: Array<{ name: string; fg: string }> = [
    { name: "Primary", fg: "#ec5e87" },
    { name: "Red", fg: "#ef4444" },
    { name: "Blue", fg: "#3b82f6" },
    { name: "Black", fg: "#171411" },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-[#171411] text-3xl font-black tracking-tight">
          My QR Code
        </h1>
        <p className="text-[#877564] text-base">
          Share your profile instantly with potential matches and families.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#e6e2de] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#ec5e87] to-[#d6456b]" />

            <div className="relative mt-4 mb-4">
              <div className="size-20 rounded-full p-1 bg-gradient-to-tr from-[#ec5e87] to-transparent">
                <div className="size-full rounded-full bg-[#fff5f8] border-2 border-white overflow-hidden flex items-center justify-center">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={displayName || "Profile photo"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl font-black text-[#171411]">
                      {initials}
                    </span>
                  )}
                </div>
              </div>
              {/* <div className="absolute -bottom-1 -right-1 bg-blue-500 border-2 border-white rounded-full p-0.5 text-white">
                <span className="text-[10px] font-black leading-none block">
                  ✓
                </span>
              </div> */}
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-[#171411]">
                {displayName || "Matrimony profile"}
              </h2>
              {String(kycStatus || "NOT_VERIFIED").toUpperCase() ===
              "VERIFIED" ? (
                <RiVerifiedBadgeFill className="shrink-0 text-rose-600" />
              ) : null}
            </div>
            <p className="text-sm text-[#877564] font-medium tracking-wide mb-6">
              ID: {profileId}
            </p>

            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner mb-6 relative">
              <div ref={qrContainerRef} className="relative">
                <QRCode
                  value={publicUrl}
                  size={qrSize}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  style={{ width: qrSize, height: qrSize }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-1 rounded-full">
                    <img
                      src="/assets/M-Logo.png"
                      alt="Matrimony QR logo"
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-[#171411]">
              Scan to view profile
            </p>
            <p className="text-xs text-[#877564] mt-1">
              Compatible with all QR scanners
            </p>

            <div className="mt-6 pt-6 border-t border-[#f8eef2] w-full flex justify-between items-center px-4">
              <span className="text-xs font-bold text-[#877564] tracking-widest uppercase">
                MATRIMONY QRFOLIO
              </span>
              <span className="text-xs text-[#877564]">
                matrimony.qrfolio.net
              </span>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-4 flex gap-3 items-start shadow-sm">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#171411]">Privacy Safe</h4>
              <p className="text-xs text-[#877564] mt-1">
                Your contact details are hidden. Viewers must request access to
                see your phone number.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e6e2de] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#171411] text-lg">Profile Link</h3>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                Active
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#877564]">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <input
                  className="w-full bg-[#fff5f8] border-none rounded-lg pl-10 pr-4 py-3 text-sm text-[#5c5046] font-medium focus:ring-2 focus:ring-[#ec5e87]/50"
                  readOnly
                  type="text"
                  value={publicUrl}
                />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="bg-[#171411] hover:bg-black text-white px-5 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>

              <button
                type="button"
                onClick={handleOpenProfile}
                className="border border-[#e6e2de] bg-white hover:border-[#ec5e87] hover:bg-[#ec5e87]/5 text-[#171411] px-5 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Open
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6e2de] shadow-sm">
            <h3 className="font-bold text-[#171411] text-lg mb-6">
              Customize Appearance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-[#877564] mb-3">
                  Accent Color
                </label>
                <div className="flex gap-4">
                  {accentPresets.map((preset) => {
                    const isActive = fgColor.toLowerCase() === preset.fg;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFgColor(preset.fg);
                          setBgColor("#FFFFFF");
                        }}
                        aria-label={preset.name}
                        className={
                          "size-10 rounded-full shadow-sm transition-all hover:scale-110 " +
                          (isActive
                            ? "ring-2 ring-offset-2"
                            : "hover:ring-2 hover:ring-offset-2")
                        }
                        style={
                          {
                            backgroundColor: preset.fg,
                            ringColor: preset.fg,
                          } as any
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#877564] mb-3">
                  QR Complexity
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#877564]">Low</span>
                  <input
                    className="w-full accent-[#ec5e87] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    max={3}
                    min={1}
                    type="range"
                    value={qrComplexity}
                    onChange={(e) =>
                      setQrComplexity(
                        (Number(e.target.value) || 2) as 1 | 2 | 3,
                      )
                    }
                  />
                  <span className="text-xs text-[#877564]">High</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6e2de] shadow-sm">
            <h3 className="font-bold text-[#171411] text-lg mb-4">
              Download & Share
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e6e2de] bg-white hover:border-[#ec5e87] hover:bg-[#ec5e87]/5 hover:shadow-md transition-all group"
              >
                <ImageIcon className="h-8 w-8 text-[#877564] group-hover:text-[#ec5e87]" />
                <div className="text-center">
                  <span className="block text-sm font-bold text-[#171411]">
                    Download PNG
                  </span>
                  <span className="block text-[10px] text-[#877564]">
                    High Resolution
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e6e2de] bg-white hover:border-[#ec5e87] hover:bg-[#ec5e87]/5 hover:shadow-md transition-all group"
              >
                <Download className="h-8 w-8 text-[#877564] group-hover:text-[#ec5e87]" />
                <div className="text-center">
                  <span className="block text-sm font-bold text-[#171411]">
                    Download SVG
                  </span>
                  <span className="block text-[10px] text-[#877564]">
                    Vector Format
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e6e2de] bg-white hover:border-[#ec5e87] hover:bg-[#ec5e87]/5 hover:shadow-md transition-all group"
              >
                <Share className="h-8 w-8 text-[#877564] group-hover:text-[#ec5e87]" />
                <div className="text-center">
                  <span className="block text-sm font-bold text-[#171411]">
                    Share Link
                  </span>
                  <span className="block text-[10px] text-[#877564]">
                    WhatsApp / Email
                  </span>
                </div>
              </button>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex gap-2 items-center">
              <span className="text-orange-600 text-sm">!</span>
              <p className="text-xs text-orange-800 font-medium">
                Warning: Ensure high contrast when printing. Do not invert
                colors.
              </p>
            </div>
          </div>

          <div className="hidden">
            <button type="button" onClick={handleOpenProfile}>
              <Eye className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleCopy()}>
              <Copy className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleShare()}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatrimonyQrCodePage: React.FC = () => {
  const qrFolioUrl =
    (import.meta as any)?.env?.VITE_QRFOLIO_URL ||
    "https://www.qrfolio.net/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/70 to-rose-100 font-sans text-rose-950">
      <main className="py-6 sm:py-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                QR Folio Dashboard Matrimony QR
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-50">
                My Matrimony QR code
              </h1>
            </div>
            <a
              href={qrFolioUrl}
              className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition-colors"
            >
              Back to QR Folio Dashboard
            </a>
          </div>

          <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50/80 to-rose-100 p-4 sm:p-6 lg:p-7 shadow-xl shadow-rose-100/60 min-h-[60vh]">
            <MatrimonyQrCodeSection />
          </section>
        </div>
      </main>
    </div>
  );
};

export default MatrimonyQrCodePage;
