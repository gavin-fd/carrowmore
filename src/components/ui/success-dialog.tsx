import type { ComponentProps, ReactNode } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/icon';
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  closeButtonClassName?: string;
  closeIcon?: ReactNode;
}

/** The existing request confirmation layout and success spring, shared by both request flows. */
export function SuccessDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  title,
  description,
  icon,
  action,
  className,
  closeButtonClassName,
  closeIcon,
}: SuccessDialogProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        open={open}
        onCloseAutoFocus={onCloseAutoFocus}
        className={className ?? 'h-[min(444px,calc(100dvh-32px))] w-[min(844px,calc(100vw-32px))]'}
      >
        <div className="flex h-full flex-col items-center gap-6 overflow-y-auto px-6 pt-12 pb-12 text-center sm:px-12">
          {/* The row the close button sits in. */}
          <div aria-hidden="true" className="h-10 shrink-0" />
          <m.span
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-positive-wash text-positive"
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.1 }}
          >
            {icon ?? <Icon name="check" size={48} />}
          </m.span>
          <div className="flex w-full flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="max-w-[640px] text-base text-ink-tertiary">
                {description}
              </DialogDescription>
            </div>
            {action}
          </div>
          <DialogCloseButton className={closeButtonClassName}>{closeIcon}</DialogCloseButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
