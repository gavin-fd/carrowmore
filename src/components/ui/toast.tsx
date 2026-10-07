import { useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Toast as ToastPrimitive } from 'radix-ui';

const EASE = [0.32, 0.72, 0, 1] as const;
const DURATION = 5000;

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ReactNode;
  action: string;
  actionDescription: string;
  onAction: () => void;
}

/** Radix announces the message and pauses both the timeout and bar during interaction. */
export function Toast({ open, onOpenChange, message, action, actionDescription, onAction }: ToastProps) {
  const [paused, setPaused] = useState(false);

  return (
    <ToastPrimitive.Provider duration={DURATION} swipeDirection="down">
      <AnimatePresence>
        {open && (
          <ToastPrimitive.Root
            open={open}
            onOpenChange={onOpenChange}
            onPause={() => setPaused(true)}
            onResume={() => setPaused(false)}
            type="foreground"
            forceMount
            asChild
          >
            <m.li
              className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-raised"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 text-sm">
                <ToastPrimitive.Title className="min-w-0 flex-1">{message}</ToastPrimitive.Title>
                <ToastPrimitive.Action altText={actionDescription} asChild>
                  <button type="button" className="shrink-0 rounded-sm font-semibold underline" onClick={onAction}>
                    {action}
                  </button>
                </ToastPrimitive.Action>
              </div>
              <div aria-hidden="true" className="h-0.5 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full origin-left rounded-full bg-ink"
                  style={{
                    animation: `toast-progress ${DURATION}ms linear forwards`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              </div>
            </m.li>
          </ToastPrimitive.Root>
        )}
      </AnimatePresence>
      <ToastPrimitive.Viewport
        className="fixed inset-x-4 bottom-[calc(var(--spacing-tabbar)+16px)] z-[60] mx-auto max-w-[861px] outline-none md:bottom-8"
      />
    </ToastPrimitive.Provider>
  );
}
