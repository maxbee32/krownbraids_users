// components/ui/Logo.tsx
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  href?: string;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  href = '/',
  className = '',
  onClick,
  size = 'md',
}: LogoProps) {
  const heights = {
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-14',
    lg: 'h-14 sm:h-20',
  }[size];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 sm:gap-3 flex-shrink-0 ${className}`}
      aria-label="Krownbraids home"
    >
      <div
        className={`relative ${heights} w-auto transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        <Image
          src="/assets/Krownbraids Crowned Beauty Logo.png"
          alt="Krownbraids"
          width={400}
          height={200}
          // ✅ THE FIX: 
          // brightness(0) turns everything black
          // invert(1) turns the black to pure white, and the white background to black
          // mix-blend-screen drops the black background out entirely
          className="object-contain w-auto h-full mix-blend-screen brightness-0 invert"
          priority
        />
      </div>

      <div className="hidden min-[480px]:flex flex-col justify-center leading-none mt-0.5">
        <span className={`font-display font-bold uppercase tracking-[0.12em] text-white text-sm sm:text-base md:text-lg`}>
          Krown<span className="text-primary-500">braids</span>
        </span>
        <span className={`font-medium uppercase tracking-[0.24em] text-espresso-200 mt-1 text-[7px] sm:text-[8px] md:text-[9px]`}>
          Wear your crown
        </span>
      </div>
    </Link>
  );
}