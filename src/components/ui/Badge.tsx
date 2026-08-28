import type { ReactNode } from 'react';

type BadgeVariant = 'cyan' | 'amber' | 'red' | 'green' | 'purple' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  cyan:   'bg-vg-cyan/15 text-vg-cyan border-vg-cyan/25',
  amber:  'bg-vg-amber/15 text-vg-amber border-vg-amber/25',
  red:    'bg-vg-red/15 text-vg-red border-vg-red/25',
  green:  'bg-vg-green/15 text-vg-green border-vg-green/25',
  purple: 'bg-vg-purple/15 text-vg-purple border-vg-purple/25',
  muted:  'bg-white/[0.05] text-vg-muted border-white/[0.08]',
};

const dotMap: Record<BadgeVariant, string> = {
  cyan:   'bg-vg-cyan',
  amber:  'bg-vg-amber',
  red:    'bg-vg-red',
  green:  'bg-vg-green',
  purple: 'bg-vg-purple',
  muted:  'bg-vg-muted',
};

export function Badge({ children, variant = 'muted', dot, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantMap[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotMap[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
}
