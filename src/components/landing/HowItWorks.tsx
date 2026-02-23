import { cn } from "../../lib/core/utils";

const Step = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className={cn("flex", "items-start", "gap-4")}>
    <div
      className={cn(
        "w-8",
        "h-8",
        "rounded-full",
        "bg-rose-500",
        "text-white",
        "flex",
        "items-center",
        "justify-center",
        "font-bold",
        "text-sm",
        "shrink-0",
      )}
    >
      {number}
    </div>

    <div>
      <h4 className={cn("text-sm", "font-extrabold", "text-gray-900")}>
        {title}
      </h4>
      <p
        className={cn(
          "mt-1",
          "text-xs",
          "text-gray-600",
          "max-w-md",
          "leading-relaxed",
        )}
      >
        {description}
      </p>
    </div>
  </div>
);

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className={cn("pt-10")}
    >
      <div className={cn("max-w-7xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8")}>
        <div className={cn("grid", "lg:grid-cols-2", "gap-20", "items-center")}>
          {/* LEFT CONTENT */}
          <div>
            <h2 className={cn("text-3xl", "font-extrabold", "text-gray-900")}>
              How QrFolio Matrimony Works
            </h2>

            <p className={cn("mt-3", "text-sm", "text-gray-600", "max-w-md")}>
              From sign up to scan – here's how you can turn your biodata into a
              smart, shareable QR-powered profile.
            </p>

            <div className={cn("mt-10", "space-y-6")}>
              <Step
                number="1"
                title="Create Your Account"
                description="Register with basic details for yourself or your family member and verify your mobile number."
              />

              <Step
                number="2"
                title="Build Your Profile"
                description="Add biodata, education, profession, photos, and portfolio links. Everything stays organized in one digital card."
              />

              <Step
                number="3"
                title="Get Your Unique QR"
                description="We generate a personalized QRfolio QR that opens your profile instantly when scanned from any smartphone."
              />

              <Step
                number="4"
                title="Share & Get Responses Faster"
                description="Share the QR/link with prospects, parents, or matchmakers. Track interest and update details anytime."
              />
            </div>

            <button
              onClick={() => (window.location.href = "/signup")}
              className={cn(
                "mt-10",
                "px-8",
                "py-3",
                "rounded-full",
                "bg-gradient-to-r",
                "from-[#EC5774]",
                "to-[#A6233D]",
                "text-white",
                "text-sm",
                "font-semibold",
                "shadow-lg",
              )}
            >
              Get Started Now
            </button>
          </div>

          {/* RIGHT IMAGE */}
          <div className={cn("relative", "flex", "justify-center")}>
            {/* BACKGROUND CURVE IMAGE */}
            <img
              src="/assets/landing/How-Work-curve.png"
              alt=""
              aria-hidden
              className={cn(
                "absolute",
                "-z-0",
                "pointer-events-none",
                "object-contain",

                // SIZE (balanced like screenshot)
                "w-[400px]",
                "h-[400px]",
                "sm:w-[520px]",
                "sm:h-[600px]",
                "lg:w-[600px]",
                "lg:h-[630px]",

                // POSITION (THIS IS THE KEY PART 👇)
                "translate-x-6",
                "-translate-y-10",

                "sm:translate-x-10",
                "sm:-translate-y-14",

                "lg:translate-x-14",
                "lg:-translate-y-20",
              )}
            />

            {/* MAIN IMAGE */}
            <div className={cn("relative", "z-10", "rotate-[-3deg]")}>
              <img
                src="/assets/landing/How-Work.png"
                alt="Couple"
                className={cn(
                  "w-[240px]",
                  "sm:w-[320px]",
                  "lg:w-[380px]",
                  "h-auto",
                  "sm:h-[460px]",
                  "lg:h-[520px]",
                  "rounded-[36px]",
                  "object-contain",
                  "sm:object-cover",
                )}
              />

              {/* HEARTS (ON IMAGE) */}
     <img
  src="/assets/landing/TheSamrterWayHeart.png"
  alt=""
  aria-hidden
  className={cn(
    "absolute",
    "top-14",
    "left-10",
    "w-5",
    "h-5",
    "z-20",
    "pointer-events-none",

    // 👇 FORCE WHITE
    "brightness-0",
    "invert"
  )}
/>

<img
  src="/assets/landing/TheSamrterWayHeart.png"
  alt=""
  aria-hidden
  className={cn(
    "absolute",
    "top-20",
    "left-16",
    "w-4",
    "h-4",
    "z-20",
    "pointer-events-none",
    "brightness-0",
    "invert"
  )}
/>

<img
  src="/assets/landing/TheSamrterWayHeart.png"
  alt=""
  aria-hidden
  className={cn(
    "absolute",
    "top-28",
    "left-12",
    "w-3.5",
    "h-3.5",
    "z-20",
    "pointer-events-none",
    "brightness-0",
    "invert"
  )}
/>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
