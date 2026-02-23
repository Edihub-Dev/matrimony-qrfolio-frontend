import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/core/utils";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setIsOpen(false);
  };

  return (
    <>
      {/* ✅ FIXED NAVBAR */}
      <nav
        className={cn(
          "fixed",
          "top-0",
          "left-0",
          "w-full",
          "z-50",
          "bg-white/95",
          "backdrop-blur",
          "pt-6",
          "pb-4",
          "shadow-sm"
        )}
      >
        <div className={cn('w-full', 'px-4', 'sm:px-8', 'lg:px-12')}>
          <div className={cn('flex', 'items-center', 'h-14')}>
            {/* LOGO */}
            <div className={cn('flex', 'items-center', 'gap-6')}>
              <button
                onClick={() => scrollToSection("home")}
                className={cn('flex', 'items-center', 'gap-3')}
              >
                <span className={cn('font-heading', 'font-medium', 'text-[30px]', 'sm:text-[36px]', 'md:text-[40px]', 'text-gray-900')}>
                  Matrimony
                </span>
                <img
                  src="/assets/landing/TheSamrterWayHeart.png"
                  alt=""
                  className={cn('h-6', 'w-6', 'rotate-[20deg]')}
                />
              </button>

              {/* DESKTOP NAV */}
              <div className={cn('hidden', 'md:flex', 'items-center', 'gap-3')}>
                <button
                  onClick={() => scrollToSection("home")}
                  className={cn('px-5', 'py-1.5', 'rounded-full', 'bg-gradient-to-r', 'from-[#EC5774]', 'to-[#A6233D]', 'text-white', 'font-semibold')}
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className={cn('px-5', 'py-1.5', 'rounded-full', 'border', 'border-[#EC5774]', 'font-semibold')}
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className={cn('px-5', 'py-1.5', 'rounded-full', 'border', 'border-[#EC5774]', 'font-semibold')}
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("samples")}
                  className={cn('px-5', 'py-1.5', 'rounded-full', 'border', 'border-[#EC5774]', 'font-semibold')}
                >
                  Sample Profiles
                </button>
              </div>
            </div>

            {/* DESKTOP AUTH */}
            <div className={cn('hidden', 'md:flex', 'ml-auto', 'gap-4')}>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => (window.location.href = "/login")}
              >
                Log in
              </Button>
              <Button
                variant="primary"
                className="rounded-full"
                onClick={() => (window.location.href = "/signup")}
              >
                Join Now
              </Button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className={cn('md:hidden', 'ml-auto')}>
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className={cn('md:hidden', 'bg-white', 'border-t', 'border-rose-100', 'shadow-lg')}>
            <div className={cn('px-4', 'pt-3', 'pb-6', 'space-y-2')}>
              <button
                onClick={() => scrollToSection("home")}
                className={cn('block', 'w-full', 'text-left', 'px-3', 'py-2', 'rounded-xl', 'font-semibold')}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={cn('block', 'w-full', 'text-left', 'px-3', 'py-2', 'rounded-xl', 'font-semibold')}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className={cn('block', 'w-full', 'text-left', 'px-3', 'py-2', 'rounded-xl', 'font-semibold')}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("samples")}
                className={cn('block', 'w-full', 'text-left', 'px-3', 'py-2', 'rounded-xl', 'font-semibold')}
              >
                Sample Profiles
              </button>

              <div className={cn('pt-4', 'space-y-3')}>
                <Button
                  variant="outline"
                  className={cn('w-full', 'rounded-full')}
                  onClick={() => (window.location.href = "/login")}
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  className={cn('w-full', 'rounded-full')}
                  onClick={() => (window.location.href = "/signup")}
                >
                  Join Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ✅ PAGE OFFSET (VERY IMPORTANT) */}
      <div className="h-[96px]" />
    </>
  );
};
