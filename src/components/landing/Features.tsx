import { Heart, MessageCircle, User } from "lucide-react";
import { cn } from "../../lib/core/utils";

const TopFeature = ({
  icon: Icon,
  title,
  description,
  filled,
}: {
  icon: any;
  title: string;
  description: string;
  filled?: boolean;
}) => (
  <div className="text-center">
    <div
      className={`mx-auto h-20 w-20 rounded-[26px] flex items-center justify-center shadow-sm transition ${
        filled
          ? "bg-gradient-to-br from-[#EC5774] to-[#A6233D] text-white"
          : "border border-rose-300 bg-white text-rose-600"
      }`}
    >
      <Icon size={28} />
    </div>
    <div
      className={cn("mt-3", "text-[15px]", "font-semibold", "text-gray-900")}
    >
      {title}
    </div>
    <div
      className={cn(
        "mt-2",
        "text-[12px]",
        "leading-relaxed",
        "text-gray-500",
        "max-w-[260px]",
        "mx-auto",
      )}
    >
      {description}
    </div>
  </div>
);

export const Features = () => {
  return (
    <section
      className={cn("pt-20", "pb-20", "bg-transparent", "scroll-mt-24")}
      id="features"
    >
      <div className={cn("max-w-7xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8")}>
        <div className={cn("text-center", "max-w-4xl", "mx-auto")}>
          <h2
            className={cn(
              "font-heading",
              "text-[24px]",
              "sm:text-[28px]",
              "lg:text-h3",
              "font-extrabold",
              "text-gray-900",
              "leading-tight",
            )}
          >
            Modern Matrimony <span className="text-rose-600">❤</span> Powered By{" "}
            QR &amp; Portfolios
          </h2>
        </div>

        <div
          className={cn(
            "mt-10",
            "grid",
            "grid-cols-1",
            "sm:grid-cols-3",
            "gap-8",
          )}
        >
          <TopFeature
            icon={User}
            title="Sign Up In Minutes"
            filled
            description="Create your profile effortlessly in just a few clicks and start your journey to love"
          />
          <TopFeature
            icon={MessageCircle}
            title="Connect With Matches"
            description="Chat, share interests, and build connections with singles who truly match your vibe"
          />
          <TopFeature
            icon={Heart}
            title="One Scan. Complete Story"
            description="Families can scan once and revisit the profile anytime, anywhere."
          />
        </div>

        <div
          className={cn(
            "mt-14",
            "grid",
            "lg:grid-cols-2",
            "gap-10",
            "items-center",
          )}
        >
          <div className={cn("relative", "order-2", "lg:order-1")}>
            <div className="relative">
              {/* Mobile: horizontal row of thumbnails above card */}
              <div
                className={cn(
                  'flex',
                  'md:hidden',
                  'mb-4',
                  'gap-3',
                  'justify-center',
                )}
              >
                {[
                  "TheSmarterWay-3.png",
                  "TheSmarterWay-5.png",
                  "TheSmarterWay-2.png",
                  "TheSmarterWay-1.png",
                ].map((src) => (
                  <div
                    key={src}
                    className={cn(
                      'h-10',
                      'w-10',
                      'rounded-full',
                      'overflow-hidden',
                      'shadow-sm',
                    )}
                  >
                    <img
                      src={`/assets/landing/${src}`}
                      alt=""
                      className={cn('h-full', 'w-full', 'object-contain')}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop / tablet: vertical thumbnails overlapping left side */}
              <div
                className={cn(
                  'hidden',
                  'md:flex',
                  'absolute',
                  '-left-4',
                  'top-6',
                  'flex-col',
                  'gap-3',
                )}
              >
                {[
                  "TheSmarterWay-3.png",
                  "TheSmarterWay-5.png",
                  "TheSmarterWay-2.png",
                  "TheSmarterWay-1.png",
                ].map((src) => (
                  <div
                    key={src}
                    className={cn(
                      'h-12',
                      'w-12',
                      'rounded-full',
                      'overflow-hidden',
                      'shadow-sm',
                    )}
                  >
                    <img
                      src={`/assets/landing/${src}`}
                      alt=""
                      className={cn('h-full', 'w-full', 'object-contain')}
                    />
                  </div>
                ))}
              </div>

              <div className={cn('relative', 'pl-0', 'md:pl-16')}>
                <div
                  className={cn(
                    'relative',
                    'z-10',
                    'rounded-[33px]',
                    'shadow-[0_22px_80px_rgba(244,63,94,0.10)]',
                    'overflow-hidden',
                    'rotate-[-5deg]',
                    'w-[260px]',
                    'sm:w-[340px]',
                    'lg:w-[380px]',
                    'mx-auto',
                    'md:mx-0',
                  )}
                >
                  <img
                    src="/assets/landing/TheSmarterWay-4.png"
                    alt=""
                    className={cn(
                      'w-full',
                      'lg:h-[350px]',
                      "h-[200px]",
                      "sm:h-[260px]",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={cn("text-left", "mt-10", "lg:mt-10", "order-1", "lg:order-2")}>
            <h3
              className={cn(
                "font-heading",
                "text-3xl",
                "lg:text-h3",
                "font-extrabold",
                "text-gray-900",
                "leading-tight",
                "lg:leading-[50px]",
              )}
            >
              The Smarter Way
              <br />
              To Find Love
            </h3>
            <p
              className={cn(
                "mt-3",
                "text-sm",
                "lg:text-body",
                "text-gray-600",
                "max-w-md",
              )}
            >
              Join thousands of singles finding love and meaningful
              relationships every day. Don’t just swipe—start connecting
            </p>

            <div className={cn("mt-6", "space-y-4")}>
              {[
                "One QR. Everywhere.",
                "Family-friendly view",
                "NRI & outstation ready",
                "Rich biodata + media",
              ].map((text) => (
                <div key={text} className={cn("flex", "items-start", "gap-3")}>
                  <div
                    className={cn(
                      "mt-1.5",
                      "h-3",
                      "w-3",
                      "rounded-full",
                      "bg-rose-600",
                    )}
                  />
                  <div
                    className={cn("text-sm", "font-semibold", "text-gray-900")}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
