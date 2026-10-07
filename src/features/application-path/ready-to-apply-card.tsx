import { useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';

// The same easing and duration as the existing expandable drawers.
const EASE = [0.32, 0.72, 0, 1] as const;

export function ReadyToApplyCard({ onRequest }: { onRequest: () => void }) {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const hidden = !reduceMotion && !revealed;

  return (
    <m.li
      className="overflow-hidden"
      aria-hidden={hidden}
      inert={hidden}
      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
      animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE, delay: 0.35 }}
      onAnimationComplete={() => setRevealed(true)}
    >
      <section
        aria-labelledby="ready-to-apply-title"
        className="flex items-start gap-3 rounded-2xl bg-summary p-4"
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg leading-[1.2]"
        >
          🥳
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <div className="flex w-full flex-col gap-1 text-on-summary-muted">
            <h3 id="ready-to-apply-title" className="flex min-h-8 items-center text-base font-semibold">
              Great work! You’re ready to apply
            </h3>
            <p className="text-sm opacity-90">
              Your pathway is complete. You’re ready to request an interview.
            </p>
          </div>
          <Button variant="outline" className="h-[38px]" onClick={onRequest}>
            Request an interview
          </Button>
        </div>
      </section>
    </m.li>
  );
}
