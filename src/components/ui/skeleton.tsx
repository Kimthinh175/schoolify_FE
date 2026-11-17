import * as React from 'react';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 'default' | 'brand' | 'amber' | 'subtle';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  default: '',
  brand: 'sk-bone--brand',
  amber: 'sk-bone--amber',
  subtle: 'sk-bone--subtle',
};

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('sk-bone rounded-xl', VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}
