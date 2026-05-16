import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'online' | 'offline' | 'maintenance' | 'warning' | 'high' | 'medium' | 'low';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex mx-1 items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider border",
          {
            'bg-slate-100 text-slate-500 border-slate-200': variant === 'default',
            'bg-emerald-50 text-emerald-600 border-emerald-200': variant === 'online' || variant === 'low',
            'bg-rose-50 text-rose-600 border-rose-200': variant === 'offline' || variant === 'high',
            'bg-amber-50 text-amber-600 border-amber-200': variant === 'warning' || variant === 'medium',
            'bg-indigo-50 text-indigo-600 border-indigo-200': variant === 'maintenance',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
