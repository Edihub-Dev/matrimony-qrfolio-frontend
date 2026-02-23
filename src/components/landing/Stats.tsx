import { cn } from "../../lib/core/utils";
export const Stats = () => {
  return (
    <section className={cn('py-0', 'pt-10')}>
      <div
        className={cn(
          'relative',
          'w-full',
          'overflow-hidden',
          'bg-gradient-to-r',
          'from-[#EC5774]',
          'to-[#A6233D]'
        )}
      >
        <div className={cn('max-w-7xl', 'mx-auto', 'px-6', 'lg:px-8', 'relative', 'z-10')}>
          <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-8', 'py-8', 'md:py-10')}>
            <div className="text-left">
              <div className={cn('font-heading', 'text-[28px]', 'md:text-[32px]', 'font-extrabold', 'text-white')}>3x Faster</div>
              <div className={cn('mt-1', 'font-heading', 'text-sm', 'md:text-base', 'font-semibold', 'text-white')}>Response Rate</div>
              <div className={cn('mt-3', 'text-[11px]', 'md:text-xs', 'text-white/85', 'max-w-xs')}>
                People from every corner of the world are finding love with us
              </div>
            </div>

            <div
              className={cn(
                'text-left',
                'md:border-l-2',
                'md:border-white/50',
                'md:border-dashed',
                'md:pl-10'
              )}
            >
              <div className={cn('font-heading', 'text-[28px]', 'md:text-[32px]', 'font-extrabold', 'text-white')}>200k+</div>
              <div className={cn('mt-1', 'font-heading', 'text-sm', 'md:text-base', 'font-semibold', 'text-white')}>Successful Matches</div>
              <div className={cn('mt-3', 'text-[11px]', 'md:text-xs', 'text-white/85', 'max-w-xs')}>
                Countless connections made and love stories created every day
              </div>
            </div>

            <div
              className={cn(
                'text-left',
                'md:border-l-2',
                'md:border-white/50',
                'md:border-dashed',
                'md:pl-10'
              )}
            >
              <div className={cn('font-heading', 'text-[28px]', 'md:text-[32px]', 'font-extrabold', 'text-white')}>10k+</div>
              <div className={cn('mt-1', 'font-heading', 'text-sm', 'md:text-base', 'font-semibold', 'text-white')}>Happy Couples</div>
              <div className={cn('mt-3', 'text-[11px]', 'md:text-xs', 'text-white/85', 'max-w-xs')}>
                From first dates to forever, our success stories keep growing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
