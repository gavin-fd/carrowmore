import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Icon } from '@/components/icon';
import { Toast } from '@/components/ui/toast';
import { usePrototypeSkills } from '@/features/profile/prototype-skills';
import { fitSummary } from '@/data/role';
import { view } from '@/data/view';
import type { View } from '@/domain/schema';
import { ApplicationPathCard, ApplyButton } from '@/features/application-path/application-path-card';
import { SkillEvidenceDialog } from '@/features/evidence/skill-evidence-dialog';
import { RecordUpdateDialog } from '@/features/record-update/record-update-dialog';
import { send } from '@/features/record-update/request';
import { RequestSentDialog } from '@/features/record-update/request-sent-dialog';
import { PostingCard } from '@/features/role/posting-card';
import { SkillsCard } from '@/features/role/skills-card';
import { cn } from '@/lib/utils';

function FitSummaryCard({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="fit-summary-title"
      className={cn('flex flex-col gap-4 rounded-3xl bg-summary p-5', className)}
    >
      <span aria-hidden="true" className="flex size-6 items-center justify-center text-lg leading-none">
        👍
      </span>
      <h2 id="fit-summary-title" className="text-base font-semibold text-on-summary">
        {fitSummary.title}
      </h2>
      <p className="text-sm text-on-summary-muted">{fitSummary.body}</p>
    </section>
  );
}

function CertificationsCard({
  modules,
  className,
}: {
  modules: View['relevantModules'];
  className?: string;
}) {
  if (!modules.length) return null;

  return (
    <section
      aria-labelledby="certifications-title"
      className={cn('flex flex-col gap-6 rounded-3xl bg-surface p-5', className)}
    >
      <h2 id="certifications-title" className="text-base font-semibold">
        Your relevant certifications
      </h2>
      <ul className="flex flex-col gap-4">
        {modules.map((m) => (
          <li key={m.module} className="flex items-start gap-2 rounded-lg bg-canvas p-3">
            <Icon name="check_circle" className="text-icon-tertiary" />
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              <p className="flex h-6 items-center leading-none font-semibold">{m.label}</p>
              <p>
                {m.module}, {m.year}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Role detail: Wind Turbine Technician, read against Bearach's record. */
/** Evidence, then a record update, then confirmation. Each step replaces the last. */
type Step = 'evidence' | 'update' | 'sent';

export function RolePage() {
  const [step, setStep] = useState<Step | null>(null);
  const { removedIds, removeSkill } = usePrototypeSkills();
  const skillsHeading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const pendingRemoval = useRef<View['skills'][number] | null>(null);
  const [notice, setNotice] = useState<{ label: string; open: boolean }>();
  const profileSkills = view.skills.filter((skill) => skill.onProfile && !removedIds.includes(skill.id));
  // A dialog animating out keeps the handlers of its last open render, so it
  // reads the step from here rather than from that render.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  // The skill the flow is about. Kept after closing, so a dialog can animate out with its content.
  const [shownId, setShownId] = useState<string>();
  const shown = view.skills.find((s) => s.id === shownId);
  const claim = view.claims.find((c) => c.id === shown?.claim);
  const related = profileSkills.filter((s) => s.claim === shown?.claim && s.id !== shown?.id);

  const openEvidence = (id: string) => {
    setShownId(id);
    setStep('evidence');
  };
  const close = (open: boolean) => {
    if (!open) setStep(null);
  };
  // A dialog leaving for the next step leaves focus to it. When the whole flow
  // closes, focus goes back to the chip for the skill it was about.
  const returnFocus = (event: Event) => {
    event.preventDefault();
    if (stepRef.current || pendingRemoval.current) return;
    const target = document.querySelector<HTMLElement>(`[data-skill="${shownId}"]`) ?? skillsHeading.current;
    target?.focus({ preventScroll: true });
  };

  // Wait for the shared dialog's exit before removing the chip and showing feedback.
  const finishRemoval = () => {
    const skill = pendingRemoval.current;
    if (!skill) return;
    pendingRemoval.current = null;
    removeSkill(skill.id);
    setNotice({ label: skill.label, open: true });
    requestAnimationFrame(() => skillsHeading.current?.focus({ preventScroll: true }));
  };

  return (
    <main tabIndex={-1} className="outline-none flex-1 px-6 pb-8">
      {/*
        One column on small screens, with the fit summary moved to the top.
        From lg the posting takes the left column and the cards stack beside
        it; the last row is 1fr so it, not the card rows, absorbs the
        posting's height. The posting stays first in the DOM, so the page
        still opens on its h1 — the summary has nothing focusable, so moving
        it visually leaves tab order untouched.
      */}
      <div className="mx-auto grid max-w-[1041px] gap-6 lg:grid-cols-[minmax(0,686px)_331px] lg:grid-rows-[auto_auto_auto_1fr] lg:items-start">
        <PostingCard
          className="lg:col-start-1 lg:row-span-4 lg:row-start-1"
          summary={<ApplicationPathCard />}
          action={<ApplyButton />}
        />
        <FitSummaryCard className="max-lg:order-first lg:col-start-2 lg:row-start-1" />
        <SkillsCard
          skills={profileSkills}
          headingRef={skillsHeading}
          onSelect={openEvidence}
          className="lg:col-start-2 lg:row-start-2"
        />
        <CertificationsCard modules={view.relevantModules} className="lg:col-start-2 lg:row-start-3" />
      </div>

      {shown && claim && (
        <SkillEvidenceDialog
          open={step === 'evidence'}
          onOpenChange={close}
          onCloseAutoFocus={returnFocus}
          skill={shown}
          claim={claim}
          related={related}
          onSelectSkill={setShownId}
          onDoneMore={() => setStep('update')}
          onRemove={() => {
            pendingRemoval.current = shown;
            setStep(null);
          }}
          onExitComplete={finishRemoval}
        />
      )}
      {shown && (
        <RecordUpdateDialog
          open={step === 'update'}
          onOpenChange={close}
          onCloseAutoFocus={returnFocus}
          context={{
            keeper: view.keeper,
            about: { skillId: shown.id, skill: shown.label, claim: shown.claim },
          }}
          skillIndex={view.skillIndex}
          onSubmit={(request) => {
            send(request);
            setStep('sent');
          }}
        />
      )}
      <RequestSentDialog open={step === 'sent'} onOpenChange={close} onCloseAutoFocus={returnFocus} />
      {notice && (
        <Toast
          key={notice.label}
          open={notice.open}
          onOpenChange={(open) => setNotice((current) => current && { ...current, open })}
          message={<>{notice.label} has been removed from your profile.</>}
          action="Manage skills"
          actionDescription="Return to your skills and experience"
          onAction={() => {
            skillsHeading.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
            skillsHeading.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </main>
  );
}
