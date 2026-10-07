import type { ComponentProps } from 'react';
import { Chip } from '@/components/chip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogScrollArea } from '@/components/ui/dialog';
import type { View } from '@/domain/schema';
import { KindOfWork } from '@/features/evidence/kind-of-work';

type Skill = View['skills'][number];
type Claim = View['claims'][number];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "10 kinds of work · 47 occasions · 2004–2026 · 5 stations" — direct records only. */
function summaryParts({ kinds, occasions, firstYear, lastYear, stations }: Claim['summary']) {
  const span = firstYear === lastYear ? `${firstYear}` : `${firstYear}–${lastYear}`;
  return [
    plural(kinds, 'kind of work', 'kinds of work'),
    plural(occasions, 'occasion', 'occasions'),
    span,
    plural(stations, 'station', 'stations'),
  ];
}

interface SkillEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
  skill: Skill;
  claim: Claim;
  /** Other chips that read from the same claim. */
  related: Skill[];
  onSelectSkill: (id: string) => void;
  /** "I've done more of this" — record what the logbook missed. */
  onDoneMore: () => void;
}

/**
 * Why a skill is on the profile: the logbook records behind it, grouped into
 * kinds of work. The header and footer stay put while the evidence scrolls.
 */
export function SkillEvidenceDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  skill,
  claim,
  related,
  onSelectSkill,
  onDoneMore,
}: SkillEvidenceDialogProps) {
  const byId = new Map(claim.entries.map((e) => [e.entry_id, e]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        open={open}
        onCloseAutoFocus={onCloseAutoFocus}
        className="h-[min(892px,calc(100dvh-32px))] w-[min(1156px,calc(100vw-32px))]"
      >
        <DialogScrollArea>
          <DialogHeader title={skill.label} description="We’ve added this to your skills based on your logbook entries" />

          {/* Keyed by skill, so moving to a related skill starts with every row closed. */}
          <div key={skill.id} className="flex flex-1 flex-col gap-6 px-6 sm:px-12">
            {/* Wraps between figures, never inside one. */}
            <p className="flex min-h-5 flex-wrap items-center gap-x-1 text-sm leading-snug font-semibold text-ink-muted sm:leading-none">
              {summaryParts(claim.summary).map((part, i) => (
                <span key={part} className="whitespace-nowrap">
                  {i > 0 && '· '}
                  {part}
                </span>
              ))}
            </p>

            <ul className="flex flex-col gap-6">
              {claim.kinds.map((kind) => (
                <KindOfWork
                  key={kind.entryIds[0]}
                  label={kind.label}
                  entries={kind.entryIds.flatMap((id) => byId.get(id) ?? [])}
                />
              ))}
            </ul>

            {related.length > 0 && (
              <section aria-labelledby="related-skills-title" className="flex flex-col gap-4">
                <h3 id="related-skills-title" className="text-base font-semibold">
                  Related skills
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {related.map((s) => (
                    <li key={s.id}>
                      <Chip onClick={() => onSelectSkill(s.id)}>{s.label}</Chip>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline">I haven’t done this</Button>
            <Button variant="neutral" className="w-[183px]" onClick={onDoneMore}>
              I’ve done more of this
            </Button>
          </DialogFooter>
        </DialogScrollArea>
      </DialogContent>
    </Dialog>
  );
}
