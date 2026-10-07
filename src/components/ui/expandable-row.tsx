import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

const EASE = [0.32, 0.72, 0, 1] as const;

interface ExpandableRowProps extends Omit<ComponentProps<'li'>, 'children'> {
  label: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  leading?: ReactNode;
  chevronIcon?: ReactNode;
  /** A settled row can keep the same layout without an interactive disclosure. */
  interactive?: boolean;
  /** Replaces the chevron, e.g. with a completion status. */
  endAdornment?: ReactNode;
  chevronDirection?: 'right' | 'down';
  trailing?: ReactNode;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
}

/** Shared evidence-row behaviour, including its original height/fade and chevron animations. */
export function ExpandableRow({
  label,
  children,
  open: controlledOpen,
  onOpenChange,
  leading,
  chevronIcon,
  interactive = true,
  endAdornment,
  chevronDirection = 'right',
  trailing,
  className,
  triggerClassName,
  labelClassName,
  ...itemProps
}: ExpandableRowProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const reduceMotion = useReducedMotion();
  const buttonId = useId();
  const regionId = useId();
  const Heading = interactive ? 'button' : 'div';

  return (
    <li {...itemProps} className={cn('rounded-2xl bg-canvas p-4', className)}>
      <h3>
        <Heading
          id={buttonId}
          type={interactive ? 'button' : undefined}
          aria-expanded={interactive ? open : undefined}
          aria-controls={interactive ? regionId : undefined}
          onClick={
            interactive
              ? () => {
                  if (controlledOpen === undefined) setLocalOpen(!open);
                  onOpenChange?.(!open);
                }
              : undefined
          }
          className={cn(
            'group flex w-full items-start justify-between gap-4 rounded-lg text-left',
            triggerClassName,
          )}
        >
          {leading}
          <span
            className={cn(
              'flex min-h-8 items-center text-base font-semibold text-ink-neutral',
              labelClassName,
            )}
          >
            {label}
          </span>
          {endAdornment ?? (
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas-hover text-ink-muted transition-colors group-hover:bg-line"
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center transition-transform duration-300 motion-reduce:transition-none',
                  chevronDirection === 'right' ? open && 'rotate-90' : !open && '-rotate-90',
                )}
              >
                {chevronIcon ?? <Icon name="chevron_right" />}
              </span>
            </span>
          )}
        </Heading>
      </h3>
      <div aria-hidden={!open} inert={!open}>
        <AnimatePresence initial={false}>
          {open && (
            <m.div
              id={regionId}
              role="region"
              aria-labelledby={buttonId}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE }}
            >
              {children}
            </m.div>
          )}
        </AnimatePresence>
      </div>
      {trailing}
    </li>
  );
}
