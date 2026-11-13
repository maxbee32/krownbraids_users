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
    sm: 'h-[clamp(2rem,6vw,2.5rem)]',
    md: 'h-[clamp(2.25rem,6.5vw,3.5rem)]', // slightly smaller min so it fits 320px
    lg: 'h-[clamp(3rem,9vw,5rem)]',
  }[size];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center flex-shrink-0 gap-[clamp(0.35rem,1vw,0.75rem)] max-w-full min-w-0 ${className}`}
      aria-label="Krownbraids home"
    >
      {/* Mark */}
      <div
        className={`relative ${heights} w-auto transition-transform duration-300 group-hover:scale-[1.02] shrink-0`}
      >
        <Image
          src="/assets/Krownbraids Crowned Beauty Logo.png"
          alt="Krownbraids"
          width={400}
          height={200}
          className="object-contain w-auto h-full mix-blend-screen brightness-0 invert"
          priority
        />
      </div>

      {/* Wordmark — shrinks to fit, truncates cleanly if it must */}
      <div className="flex flex-col justify-center leading-none min-w-0">
        <span
          className="font-display font-bold uppercase text-white truncate"
          style={{
            fontSize: 'clamp(0.625rem, 2.4vw, 1.125rem)', // 10px → 18px
            letterSpacing: 'clamp(0.04em, 0.12vw, 0.12em)',
          }}
        >
          Krown<span className="text-primary-500">braids</span>
        </span>
        <span
          className="font-medium uppercase text-espresso-200 truncate mt-[clamp(0.1rem,0.25vw,0.25rem)]"
          style={{
            fontSize: 'clamp(0.375rem, 1vw, 0.5625rem)', // 6px → 9px
            letterSpacing: 'clamp(0.1em, 0.2vw, 0.24em)',
          }}
        >
          Wear your crown
        </span>
      </div>
    </Link>
  );
}