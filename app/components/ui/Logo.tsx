// components/ui/Logo.tsx
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'light';
  href?: string;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  variant = 'default',
  href = '/',
  showTagline = true,
  className = '',
  onClick,
}: LogoProps) {
  const iconBg =
    variant === 'light'
      ? 'bg-white/10 ring-1 ring-white/20'
      : 'bg-ink-900 shadow-sm';

  const kColor = variant === 'light' ? 'text-amber-300' : 'text-white';

  const primary = variant === 'light' ? 'text-white' : 'text-ink-900';
  const accent = variant === 'light' ? 'text-amber-300' : 'text-ink-900';
  const tagline = variant === 'light' ? 'text-white/50' : 'text-stone-500';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 group flex-shrink-0 ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:shadow-md ${iconBg}`}
      >
        <span className={`font-display font-bold text-xl leading-none ${kColor}`}>
          K
        </span>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`text-lg sm:text-xl font-display font-bold tracking-tight whitespace-nowrap ${primary}`}
        >
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