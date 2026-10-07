import { Link } from 'react-router';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { applicationPathSteps } from '@/data/application-path';
import type { ApplicationPathStep } from '@/data/application-path';
import { routes } from '@/lib/routes';

type Step = Pick<ApplicationPathStep, 'kind'>;

const NOUNS: Record<Step['kind'], [one: string, many: string]> = {
  assessment: ['assessment', 'assessments'],
  course: ['course', 'courses'],
};

const and = new Intl.ListFormat('en-GB', { type: 'conjunction' });

/** "2 assessments and 1 course" — counted from the complete application pathway, in the order it reaches each kind. */
export function summariseRoute(steps: Step[]) {
  const counts = new Map<Step['kind'], number>();
  for (const { kind } of steps) counts.set(kind, (counts.get(kind) ?? 0) + 1);
  return and.format([...counts].map(([kind, n]) => `${n} ${NOUNS[kind][n === 1 ? 0 : 1]}`));
}

/** The call to start the application path, as both the path card and the posting's closing button say it. */
export function ApplyButton() {
  return (
    <Button asChild>
      <Link to={routes.applicationPath}>Get ready to apply</Link>
    </Button>
  );
}

/** What stands between the keeper and an interview for this role, summarised from the complete application pathway. */
export function ApplicationPathCard() {
  const steps = applicationPathSteps;
  if (!steps.length) return null;

  return (
    <section aria-labelledby="application-path-title" className="flex flex-col gap-4 rounded-2xl bg-path p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-white text-on-path">
        <Icon name="conversion_path" weight={400} />
      </span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="application-path-title" className="text-base font-semibold text-on-path">
            Your application path
          </h2>
          <p className="text-sm text-on-path-muted">{summariseRoute(steps)}</p>
        </div>
        <ApplyButton />
      </div>
    </section>
  );
}
