import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The skill chip, as on the profile and under "Related skills". */
export const chipClass = 'rounded-full bg-canvas px-2 py-1 text-sm';

export function Chip({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button type="button" className={cn(chipClass, 'transition-colors hover:bg-canvas-hover', className)} {...props} />
  );
}
