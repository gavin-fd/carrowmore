import trackerDivider from '@/assets/tracker-divider.svg';
import { EmployerMark } from '@/components/employer-mark';
import { Button } from '@/components/ui/button';
import { applicationStages } from '@/data/application-tracker';
import { posting } from '@/data/role';
import { ApplicationViewPopover } from '@/features/application-tracker/application-view-popover';

function ApplicationCard() {
  return (
    <article className="flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl bg-surface p-5">
      <header className="flex items-center gap-4">
        <EmployerMark size={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-base font-semibold">{posting.title}</h3>
          <p className="truncate text-sm">{posting.employer}</p>
        </div>
      </header>
      <div className="flex gap-2">
        <ApplicationViewPopover />
        {/* Deliberately inactive in this prototype, as requested. */}
        <Button type="button" variant="outline" className="h-[38px] min-w-0 flex-1">
          Move
        </Button>
      </div>
    </article>
  );
}

export function ApplicationTrackerPage() {
  return (
    <main className="flex-1 px-4 pb-8 md:px-6">
      <h1 className="sr-only">Application Tracker</h1>
      <div className="mx-auto flex max-w-[1041px] flex-col gap-9">
        {applicationStages.map((stage, index) => (
          <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="flex flex-col gap-6">
            {index > 0 && (
              <span aria-hidden="true" className="mb-3 block h-px overflow-hidden">
                <img src={trackerDivider} width={1041} height={1} alt="" className="max-w-none" />
              </span>
            )}
            <h2 id={`stage-${stage.id}`} className="text-xl font-semibold">
              {stage.label}
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: stage.cards }, (_, card) => (
                <li key={card} className="min-w-0">
                  <ApplicationCard />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
