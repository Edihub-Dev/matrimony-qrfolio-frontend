import { Facebook, Instagram, X } from "lucide-react";
import { cn } from "../../lib/core/utils";

export const Footer = () => {
  return (
    <footer>
{/* ===== CTA SECTION ===== */}
<div className="pt-10">
  <div className={cn('max-w-full', 'mx-auto')}>
    <div
      className={cn('relative', 'px-6', 'sm:px-20', 'py-16', 'bg-no-repeat', 'bg-center', 'bg-cover')}
      style={{
        backgroundImage: "url('/assets/landing/Footer-background.png')",
      }}
    >
      {/* ===== CENTER CONTENT ===== */}
      <div className={cn('relative', 'text-center', 'max-w-2xl', 'mx-auto', 'z-10')}>
        <h3 className={cn('text-3xl', 'sm:text-4xl', 'font-extrabold', 'text-gray-900', 'leading-tight')}>
          Ready To Give Your Biodata
          <br />
          <span className="text-rose-600">A Smart QR?</span>
        </h3>

        <p className={cn('mt-4', 'text-sm', 'text-gray-700')}>
          Don&apos;t wait for love to find you. Take the first step today!
        </p>

        {/* ===== MOBILE IMAGES (NO OVERLAP) ===== */}
        <div className={cn('mt-6', 'flex', 'justify-center', 'gap-4', 'sm:hidden')}>
          <img
            src="/assets/landing/ReadytoGive-1.png"
            className={cn('w-[120px]', 'rotate-[-8deg]')}
            alt=""
          />
          <img
            src="/assets/landing/ReadytoGive-2.png"
            className={cn('w-[120px]', 'rotate-[8deg]')}
            alt=""
          />
        </div>

        <button
          onClick={() => (window.location.href = "/signup")}
          className={cn('mt-6', 'inline-flex', 'items-center', 'justify-center', 'rounded-full',                 "bg-gradient-to-r",
                "from-[#EC5774]",
                "to-[#A6233D]",
                "text-white", 'px-8', 'py-3', 'text-sm', 'font-semibold', 'shadow-lg')}
        >
          Create My Free Profile ❤️
        </button>
      </div>

      {/* ===== DESKTOP FLOATING IMAGES ===== */}
      <div className={cn('hidden', 'sm:block')}>
        {/* LEFT */}
        <div className={cn('absolute', 'left-20', 'bottom-10')}>
          <img
            src="/assets/landing/ReadytoGive-1.png"
            className={cn('w-[130px]', 'rotate-[-12deg]')}
            alt=""
          />
        </div>

        {/* RIGHT */}
        <div className={cn('absolute', 'right-20', 'top-10')}>
          <img
            src="/assets/landing/ReadytoGive-2.png"
            className={cn('w-[130px]', 'rotate-[12deg]')}
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
</div>


      {/* ===== MAIN FOOTER ===== */}
      <div className={cn('bg-gradient-to-r', 'from-[#EC5774]', 'to-[#A6233D]', 'text-white')}>
        <div className={cn('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-14')}>
          <div className={cn('grid', 'gap-10', 'md:grid-cols-4')}>
            {/* BRAND */}
            <div>
              <div className={cn('text-lg', 'font-extrabold')}>
                Matrimony <span>❤</span>
              </div>

              <p className={cn('mt-4', 'text-xs', 'text-white/85')}>
                Get your life partner here
              </p>

              <div className={cn('mt-4', 'flex', 'items-center', 'gap-2')}>
                <input
                  type="email"
                  placeholder="Email Here"
                  className={cn('h-10', 'w-full', 'rounded-full', 'bg-white/20', 'border', 'border-white/30', 'px-4', 'text-xs', 'placeholder:text-white/70', 'outline-none')}
                />
                <button className={cn('h-10', 'px-5', 'rounded-full', 'bg-white', 'text-rose-700', 'text-xs', 'font-semibold')}>
                  Subs
                </button>
              </div>

              <p className={cn('mt-6', 'text-[11px]', 'text-white/70')}>
                © 2027 Copyrights. All Rights Reserved
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <div className={cn('font-bold', 'text-sm')}>Quick Links</div>
              <div className={cn('mt-4', 'space-y-2', 'text-xs', 'text-white/85')}>
                <a href="#home" className={cn('block', 'hover:text-white')}>
                  Home
                </a>
                <a href="#how-it-works" className={cn('block', 'hover:text-white')}>
                  How It Works
                </a>
                <a href="#features" className={cn('block', 'hover:text-white')}>
                  Features
                </a>
                <a href="#samples" className={cn('block', 'hover:text-white')}>
                  Sample Profiles
                </a>
              </div>
            </div>

            {/* LEGAL */}
            <div>
              <div className={cn('font-bold', 'text-sm')}>Legal</div>
              <div className={cn('mt-4', 'space-y-2', 'text-xs', 'text-white/85')}>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Sitemap</div>
              </div>
            </div>

            {/* SOCIAL */}
            <div>
              <div className={cn('font-bold', 'text-sm')}>Social Media</div>
              <div className={cn('mt-4', 'flex', 'items-center', 'gap-4')}>
                <Facebook className={cn('h-5', 'w-5', 'cursor-pointer', 'hover:scale-110', 'transition')} />
                <Instagram className={cn('h-5', 'w-5', 'cursor-pointer', 'hover:scale-110', 'transition')} />
                <X className={cn('h-5', 'w-5', 'cursor-pointer', 'hover:scale-110', 'transition')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
