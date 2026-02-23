import { useState } from "react";
import { cn } from "../../lib/core/utils";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "Is My Profile Private",
    answer:
      "Yes. Your profile is private by default. You control who can view it by sharing your QR or profile link with selected people only.",
  },
  {
    question: "How Does The Matching Algorithm Work?",
    answer:
      "Our matching system considers preferences, lifestyle, location, and activity to surface the most relevant matches for you.",
  },
  {
    question: "What Happens If I Don’t Find A Match?",
    answer:
      "If you don’t find a match, don’t worry! Our platform continuously refines your recommendations based on your preferences and activity.",
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  return (
<section className={cn('pt-32', 'pb-24','scroll-mt-24')} id="faq">

      <div className={cn('max-w-5xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-2')}>
        {/* HEADER */}
        <div className={cn('flex', 'flex-col', 'sm:flex-row', 'items-start', 'sm:items-center', 'justify-between', 'gap-6', 'mb-10')}>
          <h2 className={cn('text-3xl', 'sm:text-4xl', 'font-extrabold', 'text-gray-900', 'leading-tight')}>
            Got Questions?
            <br />
            We’ve Got Answers
          </h2>

          <button
            type="button"
            className={cn('h-11', 'px-6', 'rounded-full', 'bg-gradient-to-r', 'from-[#EC5774]', 'to-[#A6233D]', 'text-white', 'text-sm', 'font-semibold', 'shadow-md')}
          >
            See All Question
          </button>
        </div>

        {/* FAQ LIST */}
        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.question}
                className={cn('rounded-[26px]', 'border', 'border-rose-400', 'bg-white', 'px-6', 'py-5', 'transition-all', 'duration-300')}
              >
                {/* QUESTION ROW */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((current) =>
                      current === idx ? null : idx
                    )
                  }
                  className={cn('w-full', 'flex', 'items-center', 'justify-between', 'gap-4', 'text-left')}
                >
                  <span className={cn('text-base', 'sm:text-lg', 'font-semibold', 'text-gray-900')}>
                    {item.question}
                  </span>

                  {/* PLUS / MINUS WITH ROTATION */}
                  <span
                    className={`text-2xl font-light text-gray-900 leading-none transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    {isOpen ? "-" : "+"}
                  </span>
                </button>

                {/* ANSWER (SMOOTH HEIGHT ANIMATION) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={cn('text-sm', 'sm:text-[15px]', 'text-gray-600', 'leading-relaxed', 'max-w-3xl')}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
