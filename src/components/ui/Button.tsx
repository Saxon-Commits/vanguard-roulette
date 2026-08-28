import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'cyan' | 'amber' | 'red' | 'ghost' | 'purple';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  cyan:   'bg-vg-cyan text-vg-bg font-semibold hover:shadow-cyan-glow hover:brightness-110',
  amber:  'bg-vg-amber text-vg-bg font-semibold hover:shadow-amber-glow hover:brightness-110',
  red:    'bg-vg-red text-white font-semibold hover:shadow-red-glow hover:brightness-110',
  ghost:  'bg-white/[0.05] text-vg-muted border border-white/[0.08] hover:bg-white/[0.09] hover:text-vg-text',
  purple: 'bg-vg-purple text-white font-semibold hover:brightness-110',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-200 active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
