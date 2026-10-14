// components/ui/Logo.tsx
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'light';
  href?: string;
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  variant = 'default',
  href = '/',
  showTagline = true,
  className = '',
}: LogoProps) {
  const iconBg =
    variant === 'light'
      ? 'bg-white/10 ring-1 ring-white/20'
      : 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm shadow-amber-600/25';

  const kColor = variant === 'light' ? 'text-amber-300' : 'text-white';

  const primary = variant === 'light' ? 'text-white' : 'text-gray-900';
  const accent = variant === 'light' ? 'text-amber-300' : 'text-amber-600';
  const tagline = variant === 'light' ? 'text-white/50' : 'text-gray-400';

  return (
    <Link href={href} className={`flex items-center gap-3 group ${className}`}>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:shadow-md ${iconBg}`}
      >
        <span className={`font-display font-bold text-xl leading-none ${kColor}`}>
          K
        </span>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`text-lg sm:text-xl font-display font-bold tracking-tight ${primary}`}>
          KROWN<span className={accent}> BRAIDS</span>
        </span>
        {showTagline && (
          <span
            className={`text-[9px] sm:text-[10px] font-light tracking-[0.2em] uppercase mt-0.5 ${tagline}`}
          >
            wear your crown
          </span>
        )}
      </div>
    </Link>
  );
}