import { useEffect } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/core/utils";

export const Hero = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePlanSelect = (event: Event) => {
      // Hero no longer submits leads directly; keep listener in case of future use.
      void event;
    };

    window.addEventListener(
      "qr:select-plan",
      handlePlanSelect as EventListener,
    );

    return () => {
      window.removeEventListener(
        "qr:select-plan",
        handlePlanSelect as EventListener,
      );
    };
  }, []);

  return (
    <section
      id="home"
      className={cn('relative', 'pt-12', 'pb-12', 'overflow-hidden', 'bg-transparent', 'scroll-mt-24')}
    >
      <div className={cn('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'relative', 'z-10')}>
        <div className={cn('flex', 'flex-col', 'items-center', 'text-center', 'pt-6', 'pb-8')}>
          <div className={cn('relative', 'w-full', 'max-w-4xl', 'mx-auto', 'h-[290px]', 'sm:h-[340px]', 'lg:h-[380px]')}>
            <div className={cn('absolute', 'left-2', 'sm:left-10', 'top-[-60px]', 'sm:top-1', '-rotate-[4deg]')}>
              <div className="relative">
                <div className={cn('rounded-[70px]', 'overflow-hidden', 'w-[210px]', 'sm:w-[240px]', 'lg:w-[260px]', 'h-[280px]', 'sm:h-[320px]', 'lg:h-[360px]')}>
                  <img
                    src="/assets/landing/Hero-man.png"
                    alt=""
                    className={cn('absolute', 'inset-0', 'w-full', 'h-full', 'object-contain')}
                  />
                </div>
                <div className={cn('absolute', '-left-6', 'bottom-0', 'bg-white', 'rounded-full', 'border', 'border-rose-300', 'px-3', 'py-2', 'text-[10px]', 'sm:text-[11px]', 'text-gray-700', 'shadow-sm')}>
                  Thank you, you are
                  <br />
                  stunning too :)
                </div>
              </div>
            </div>

            <div className={cn('absolute', 'right-1', 'sm:right-10', 'top-0', 'sm:top-1', 'rotate-[4deg]')}>
              <div className="relative">
                <div className={cn('rounded-[70px]', 'overflow-hidden', 'w-[210px]', 'sm:w-[240px]', 'lg:w-[260px]', 'h-[280px]', 'sm:h-[320px]', 'lg:h-[360px]')}>
                  <img
                    src="/assets/landing/Hero-Female.png"
                    alt=""
                    className={cn('absolute', 'inset-0', 'w-full', 'h-full', 'object-contain')}
                  />
                </div>
                <div className={cn('absolute', '-right-6', 'bottom-10', 'bg-white', 'rounded-full', 'border', 'border-rose-300', 'px-3', 'py-2', 'text-[10px]', 'sm:text-[11px]', 'text-gray-700', 'shadow-sm')}>
                  Hi, you look stunning
                </div>
              </div>
            </div>

            <div className={cn('absolute', 'left-1/2', 'top-[150px]', 'sm:top-[165px]', '-translate-x-1/2')}>
              <div className="relative">
                <svg
                  width="260"
                  height="120"
                  viewBox="0 0 260 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-80"
                >
                  <path
                    d="M10 45 C55 5, 75 5, 110 45 C145 85, 165 85, 210 45"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />
                </svg>
                <div className={cn('absolute', 'left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2', 'flex', 'items-center', 'justify-center')}>
                  <img
                    src="/assets/landing/TheSamrterWayHeart.png"
                    alt="Heart between profiles"
                    className={cn('h-7', 'w-7', 'sm:h-9', 'sm:w-9', 'md:h-11', 'md:w-11', 'object-contain')}
                  />
                </div>
              </div>
            </div>
          </div>

          <h1 className={cn('mt-3', 'font-heading', 'text-[28px]', 'sm:text-[40px]', 'lg:text-[56px]', 'font-extrabold', 'text-gray-900', 'leading-tight', 'lg:leading-[64px]')}>
            Find The <span className="text-[#EC5774]">Connection</span>
            <br />
            You’ve Been Waiting For
          </h1>

          <p className={cn('mt-3', 'text-[13px]', 'sm:text-[14px]', 'lg:text-[16px]', 'text-gray-600', 'max-w-xl')}>
            Join thousands of singles finding love and meaningful relationships
            every day. Don’t just swipe—start connecting
          </p>

          <div className={cn('mt-5', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'gap-3')}>
            <Button
              size="lg"
              className={cn('w-full', 'sm:w-auto', 'bg-gradient-to-r', 'from-[#EC5774]', 'to-[#A6233D]', 'shadow-[0_16px_50px_rgba(0,0,0,0.14)]', 'rounded-full', 'px-8')}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/signup";
                }
              }}
            >
              <span className={cn('inline-flex', 'items-center', 'gap-2', 'font-semibold')}>
                Sign Up Now
                <KeyRound className={cn('h-4', 'w-4')} />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn('w-full', 'sm:w-auto', 'rounded-full', 'border', 'border-gray-900/15', 'bg-white', 'text-gray-900', 'hover:bg-white/80', 'px-8')}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
              }}
            >
              <span className={cn('inline-flex', 'items-center', 'gap-2')}>
                Log In
                <ArrowRight className={cn('h-4', 'w-4')} />
              </span>
            </Button>
          </div>
        </div>
      </div>

    </section>
  );
};
