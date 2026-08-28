import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'amber' | 'red' | 'none';
}

export function GlassCard({ children, className = '', glow = 'none' }: GlassCardProps) {
  const glowClass =
    glow === 'cyan'  ? 'shadow-cyan-glow border-vg-cyan/30'  :
    glow === 'amber' ? 'shadow-amber-glow border-vg-amber/30' :
    glow === 'red'   ? 'shadow-red-glow border-vg-red/30'   : '';

  return (
    <div className={`glass ${glowClass} ${className}`}>
      {children}
    </div>
  );
}
