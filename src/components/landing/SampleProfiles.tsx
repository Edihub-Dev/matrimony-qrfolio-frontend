import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/core/utils";

const profiles = [
  {
    img: "/assets/landing/Sample-1.png",
    name: "Aditi Sharma, 27",
    meta: "Software Engineer • Mumbai • Brahmin",
  },
  {
    img: "/assets/landing/Sample-2.jpg",
    name: "Neha Verma, 26",
    meta: "UI Designer • Pune • Kayastha",
  },
  {
    img: "/assets/landing/Sample-3.jpg",
    name: "Riya Jain, 25",
    meta: "MBA • Jaipur • Jain",
  },
];

export const SampleProfiles = () => {
  const [center, setCenter] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const prevIndex = (center - 1 + profiles.length) % profiles.length;
  const nextIndex = (center + 1) % profiles.length;

  const next = () => {
    setDirection(1);
    setCenter(nextIndex);
  };

  const prev = () => {
    setDirection(-1);
    setCenter(prevIndex);
  };

  return (
    <section
      id="samples"
      className={cn("pt-32", "overflow-hidden")}
    >
      <div className={cn("relative", "max-w-7xl", "mx-auto", "px-4")}>
        {/* TITLE */}
        <h2 className={cn('text-center', 'text-3xl', 'font-extrabold', 'text-gray-900', 'mb-16')}>
          Sample QrFolio-Backed Profiles
        </h2>

        {/* SLIDER */}
        <div className={cn('relative', 'max-w-4xl', 'mx-auto', 'flex', 'items-center', 'justify-center')}>
          {/* PREV */}
          <button
            onClick={prev}
            className={cn('absolute', 'left-0', 'z-30', 'h-10', 'w-10', 'rounded-full',                 "bg-gradient-to-r",
                "from-[#EC5774]",
                "to-[#A6233D]",
                "text-white", 'shadow-md')}
          >
            ←
          </button>

          {/* NEXT */}
          <button
            onClick={next}
            className={cn('absolute', 'right-0', 'z-30', 'h-10', 'w-10', 'rounded-full',                 "bg-gradient-to-r",
                "from-[#EC5774]",
                "to-[#A6233D]",
                "text-white", 'shadow-md')}
          >
            →
          </button>

          {/* LEFT IMAGE */}
          <motion.div
            key={`left-${prevIndex}`}
            initial={{ opacity: 0, scale: 0.8, rotate: -25, x: "-140%" }}
            animate={{ opacity: 0.4, scale: 0.9, rotate: -20, x: "-120%" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={cn('absolute', 'left-1/2', 'z-0')}
          >
            <ImageCard img={profiles[prevIndex].img} />
          </motion.div>

          {/* CENTER IMAGE */}
          {/* <AnimatePresence mode="wait"> */}
            <motion.div
              key={center}
              initial={{
                opacity: 0,
                scale: 0.9,
                x: direction === 1 ? 60 : -60,
              }}
              animate={{
                opacity: 1,
                scale: 1.05,
                x: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                x: direction === 1 ? -60 : 60,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={cn('relative', 'z-20')}
            >
              <ImageCard img={profiles[center].img} />
            </motion.div>
          {/* </AnimatePresence> */}

          {/* RIGHT IMAGE */}
          <motion.div
            key={`right-${nextIndex}`}
            initial={{ opacity: 0, scale: 0.8, rotate: 25, x: "60%" }}
            animate={{ opacity: 0.4, scale: 0.9, rotate: 20, x: "20%" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={cn('absolute', 'left-1/2', 'z-0')}
          >
            <ImageCard img={profiles[nextIndex].img} />
          </motion.div>
        </div>

        {/* DOTS */}
        <div className={cn('flex', 'justify-center', 'gap-2', 'mt-8')}>
          {profiles.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2",
                "w-2",
                "rounded-full",
                i === center ? "bg-rose-500" : "bg-rose-200"
              )}
            />
          ))}
        </div>

        {/* TEXT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={center}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className={cn('text-center', 'mt-8')}
          >
            <div className={cn('text-lg', 'font-extrabold', 'text-gray-900')}>
              {profiles[center].name}
            </div>
            <div className={cn('mt-1', 'text-sm', 'text-gray-500')}>
              {profiles[center].meta}
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
              )}            >
              Build your Profile Now
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* IMAGE CARD */
const ImageCard = ({ img }: { img: string }) => (
  <div className={cn('w-[150px]', 'sm:w-[210px]', 'rounded-[30px]', 'overflow-hidden', 'bg-white', 'object-contain', 'shadow-[0_18px_50px_rgba(0,0,0,0.12)]')}>
    <img
      src={img}
      alt=""
      className={cn('w-full', 'h-[260px]', 'sm:h-[300px]', 'object-cover')}
    />
  </div>
);
