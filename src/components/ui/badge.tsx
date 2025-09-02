// Badge component for status indicators
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-navy text-white',
        secondary: 'border-transparent bg-brand-yellow text-brand-navy',
        success: 'border-transparent bg-budget-good text-white',
        warning: 'border-transparent bg-budget-warning text-white',
        destructive: 'border-transparent bg-budget-critical text-white',
        outline: 'border-brand-navy text-brand-navy',
        inactive: 'border-transparent bg-budget-inactive text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
