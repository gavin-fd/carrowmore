import type { ComponentProps, ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

/**
 * shadcn/ui's Dialog, built on the same Radix primitive, with Motion handling
 * entrance and exit. Radix supplies the behaviour: focus is trapped inside,
 * Escape closes, the page behind is inert and does not scroll, and focus goes
 * back where it came from.
 */
const Dialog = DialogPrimitive.Root;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogClose = DialogPrimitive.Close;

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** The Root's open state, so the exit can play before the content unmounts. */
  open: boolean;
}

const EASE = [0.32, 0.72, 0, 1] as const;

function DialogContent({ open, className, children, ...props }: DialogContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <m.div
              className="fixed inset-0 z-40 bg-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount {...props}>
            {/* Centred with inset-0 + m-auto rather than a transform, so Motion owns the transform. */}
            <m.div
              className={cn('fixed inset-0 z-50 m-auto overflow-hidden rounded-[40px] bg-surface', className)}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {children}
            </m.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

/** The round close control, 32px in from the corner. */
function DialogCloseButton({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <DialogClose asChild>
      <button
        type="button"
        aria-label="Close"
        className={cn(
          'absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-canvas text-ink-muted transition-colors hover:bg-canvas-hover sm:top-8 sm:right-8',
          className,
        )}
      >
        {children ?? <Icon name="close" />}
      </button>
    </DialogClose>
  );
}

/** Scrolls everything between the sticky header and footer, with the bar hidden: the fades already say there is more. */
function DialogScrollArea({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** Title, description and close, stuck to the top; content fades out as it scrolls beneath. */
function DialogHeader({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 bg-linear-to-t from-white/0 to-white to-[17.438%] px-6 pt-12 pb-6 sm:px-12">
      <DialogTitle className="pr-12 text-2xl font-semibold">{title}</DialogTitle>
      <DialogDescription className="mt-2 text-base text-ink-secondary">{description}</DialogDescription>
      <DialogCloseButton />
    </header>
  );
}

/** Actions, stuck to the bottom with 32px all round; content fades out as it scrolls beneath. */
function DialogFooter({
  align = 'center',
  className,
  ...props
}: ComponentProps<'footer'> & { align?: 'center' | 'end' }) {
  return (
    <footer
      className={cn(
        'sticky bottom-0 z-10 flex flex-wrap gap-4 bg-linear-to-b from-white/0 from-[16.25%] to-white to-[37.963%] px-6 py-8 sm:px-8',
        align === 'center' ? 'justify-center' : 'justify-end',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollArea,
  DialogTitle,
};
