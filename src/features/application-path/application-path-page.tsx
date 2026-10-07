import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { EmployerMark } from '@/components/employer-mark';
import assessmentIcon from '@/assets/application-path-assessment.svg';
import firstAidIcon from '@/assets/application-path-first-aid.svg';
import chevronDown from '@/assets/application-path-chevron-down.svg';
import connector from '@/assets/application-path-connector.svg';
import completedIcon from '@/assets/application-path-completed.svg';
import { chipClass } from '@/components/chip';
import { cn } from '@/lib/utils';
import { routes } from '@/lib/routes';
import { ExpandableRow } from '@/components/ui/expandable-row';
import { Button } from '@/components/ui/button';
import {
  applicationPathSteps,
  offshoreSafetyDiscrepancies,
  type ApplicationPathStep,
} from '@/data/application-path';
import { posting } from '@/data/role';
import { view } from '@/data/view';
import { RecordUpdateDialog } from '@/features/record-update/record-update-dialog';
import { send } from '@/features/record-update/request';
import { RequestSentDialog } from '@/features/record-update/request-sent-dialog';
import { ReadyToApplyCard } from '@/features/application-path/ready-to-apply-card';
import { InterviewRequestDialog } from '@/features/application-path/interview-request-dialog';
import { usePrototypeApplication } from '@/features/application-path/prototype-application';

type Flow = 'records' | 'sent' | 'interview';

// Use the success spring already used by RequestSentDialog.
const COMPLETION_SPRING = { type: 'spring', stiffness: 420, damping: 24 } as const;

export function ApplicationPathPage() {
  const { completed, complete: completeStep, submit } = usePrototypeApplication();
  const [expanded, setExpanded] = useState<string[]>(() => {
    const first = applicationPathSteps.find((step) => !completed.includes(step.id));
    return first ? [first.id] : [];
  });
  const [flow, setFlow] = useState<Flow | null>(null);
  const [shown, setShown] = useState<ApplicationPathStep>();
  const [requested, setRequested] = useState<string[]>([]);
  const trigger = useRef<HTMLElement | null>(null);
  const flowRef = useRef(flow);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const completedFocus = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();
  const allComplete =
    applicationPathSteps.length > 0 && applicationPathSteps.every((step) => completed.includes(step.id));
  useEffect(() => {
    flowRef.current = flow;
  }, [flow]);

  useEffect(() => {
    const id = completedFocus.current;
    if (id) {
      // The clicked action disappears during collapse; keep keyboard focus on its settled row.
      rows.current.get(id)?.focus({ preventScroll: true });
      completedFocus.current = null;
    }
  }, [completed]);

  const complete = (id: string) => {
    completedFocus.current = id;
    completeStep(id);
    const stepIndex = applicationPathSteps.findIndex((step) => step.id === id);
    const next = applicationPathSteps.find(
      (step, index) => index > stepIndex && !completed.includes(step.id),
    );
    setExpanded((current) => {
      const remaining = current.filter((stepId) => stepId !== id);
      return next && !remaining.includes(next.id) ? [...remaining, next.id] : remaining;
    });
  };

  const open = (step: ApplicationPathStep, next: Flow) => {
    trigger.current = document.activeElement as HTMLElement | null;
    setShown(step);
    setFlow(next);
  };
  const close = (isOpen: boolean) => {
    if (!isOpen) setFlow(null);
  };
  const returnFocus = (event: Event) => {
    event.preventDefault();
    if (!flowRef.current) trigger.current?.focus();
  };

  return (
    <main tabIndex={-1} className="outline-none flex-1 px-4 pb-8 md:px-6">
      <article
        aria-labelledby="application-path-title"
        className="mx-auto flex max-w-[1041px] flex-col gap-10 rounded-3xl bg-surface px-4 py-6 sm:px-8 sm:py-10"
      >
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
            <div className="flex min-w-0 items-center gap-2">
              <EmployerMark />
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug font-semibold sm:leading-none">
                <span>{posting.employer}</span>
                <span aria-hidden="true">·</span>
                <span className="sr-only">,</span>
                <span>{posting.location}</span>
              </p>
            </div>
            <Button asChild variant="outline" className="h-[38px]">
              <Link to={routes.openingRole}>Job details</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <h1 id="application-path-title" className="text-2xl font-semibold">
              {posting.title}
            </h1>
            <p className="text-base text-ink-secondary">
              This pathway gives you everything you need to be interview ready for this role. You can apply
              from here when completed.
            </p>
          </div>
        </header>

        <ul className="flex flex-col gap-8" aria-label="Application pathway requirements">
          {applicationPathSteps.map((step, index) => {
            const isOpen = expanded.includes(step.id);
            const isComplete = completed.includes(step.id);
            const hasRequest = requested.includes(step.id);
            return (
              <ExpandableRow
                key={step.id}
                ref={(element) => {
                  if (element) rows.current.set(step.id, element);
                  else rows.current.delete(step.id);
                }}
                interactive={!isComplete}
                tabIndex={isComplete ? -1 : undefined}
                aria-label={isComplete ? `${step.title}: completed in this prototype` : undefined}
                open={isOpen}
                onOpenChange={(open) =>
                  setExpanded((current) =>
                    open
                      ? current.includes(step.id)
                        ? current
                        : [...current, step.id]
                      : current.filter((id) => id !== step.id),
                  )
                }
                className={cn(
                  'relative transition-colors duration-300 motion-reduce:transition-none',
                  isComplete && 'bg-surface ring-1 ring-inset ring-line',
                )}
                triggerClassName="items-center gap-3"
                labelClassName="min-w-0 flex-1 flex-wrap gap-x-3 gap-y-1"
                chevronDirection="down"
                chevronIcon={<img src={chevronDown} width={24} height={24} alt="" />}
                endAdornment={
                  isComplete ? (
                    <m.span
                      className={cn(
                        chipClass,
                        'shrink-0 rounded-xl bg-positive-wash px-5 py-2 font-normal text-on-positive',
                      )}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.92, x: -6 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1, x: 0 }}
                      transition={{ ...COMPLETION_SPRING, delay: 0.3 }}
                    >
                      Completed<span className="sr-only"> in this prototype</span>
                    </m.span>
                  ) : undefined
                }
                leading={
                  <span className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface">
                    {reduceMotion ? (
                      <img
                        src={
                          isComplete ? completedIcon : step.kind === 'course' ? firstAidIcon : assessmentIcon
                        }
                        width={isComplete ? 24 : 20}
                        height={isComplete ? 24 : 20}
                        alt=""
                      />
                    ) : (
                      <AnimatePresence initial={isComplete} mode="wait">
                        <m.span
                          key={isComplete ? 'completed' : step.kind}
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                          transition={COMPLETION_SPRING}
                        >
                          <img
                            src={
                              isComplete
                                ? completedIcon
                                : step.kind === 'course'
                                  ? firstAidIcon
                                  : assessmentIcon
                            }
                            width={isComplete ? 24 : 20}
                            height={isComplete ? 24 : 20}
                            alt=""
                          />
                        </m.span>
                      </AnimatePresence>
                    )}
                  </span>
                }
                label={
                  <>
                    {step.title}
                    {hasRequest && !isComplete && (
                      <span className="text-sm font-normal text-ink-muted">Records check requested</span>
                    )}
                  </>
                }
                trailing={
                  (index < applicationPathSteps.length - 1 || allComplete) && (
                    <img
                      src={connector}
                      alt=""
                      className="absolute top-[calc(100%+15px)] left-[22px] max-w-none -rotate-90"
                    />
                  )
                }
              >
                <div className="pt-1 pl-11 max-sm:pt-3 max-sm:pl-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 text-sm text-ink-muted">
                      <p className="min-h-5 leading-5 font-semibold">{step.metadata}</p>
                      <p className="leading-5">{step.description}</p>
                      {step.id === 'offshore-refresher' &&
                        offshoreSafetyDiscrepancies.map((item) => (
                          <p key={item.scheme} className="mt-2">
                            The records need checking: {item.certificateRegisterSays}{' '}
                            {item.trainingRegisterSays}
                          </p>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="neutral" className="h-[38px]" onClick={() => complete(step.id)}>
                        {step.action}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-[38px] hover:bg-surface/80"
                        onClick={() => open(step, 'records')}
                      >
                        Request records check
                      </Button>
                    </div>
                  </div>
                </div>
              </ExpandableRow>
            );
          })}
          {allComplete && (
            <ReadyToApplyCard
              onRequest={() => {
                trigger.current = document.activeElement as HTMLElement | null;
                submit();
                setFlow('interview');
              }}
            />
          )}
        </ul>
        <p role="status" aria-live="polite" className="sr-only">
          {completed.length > 0 &&
            `${completed.length} ${completed.length === 1 ? 'step' : 'steps'} completed in this prototype. Course and assessment outcomes are simulated for this application.`}
        </p>
      </article>

      {shown && (
        <RecordUpdateDialog
          open={flow === 'records'}
          onOpenChange={close}
          onCloseAutoFocus={returnFocus}
          context={{
            keeper: view.keeper,
            about: { skillId: shown.skillId, skill: shown.title, claim: shown.claim },
          }}
          skillIndex={view.skillIndex}
          onSubmit={(request) => {
            send(request);
            setRequested((current) => (current.includes(shown.id) ? current : [...current, shown.id]));
            setFlow('sent');
          }}
        />
      )}
      <RequestSentDialog open={flow === 'sent'} onOpenChange={close} onCloseAutoFocus={returnFocus} />
      <InterviewRequestDialog
        open={flow === 'interview'}
        onOpenChange={close}
        onCloseAutoFocus={returnFocus}
      />
    </main>
  );
}
