import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

/**
 * shadcn/ui Button, restyled to the Figma. Only variants a design uses exist
 * here; add one when a screen calls for it rather than in advance.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-20',
  {
    variants: {
      variant: {
        default: 'bg-action text-on-action hover:bg-action-hover',
        neutral: 'bg-neutral-action text-white hover:bg-neutral-action-hover',
        outline: 'border border-line bg-surface text-ink-strong hover:bg-canvas',
      },
      size: {
        default: 'h-10 rounded-xl px-5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
