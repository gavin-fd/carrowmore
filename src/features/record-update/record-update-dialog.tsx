import { useId, useRef, useState, type ComponentProps, type FormEvent } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogScrollArea } from '@/components/ui/dialog';
import type { View } from '@/domain/schema';
import {
  UPDATE_TYPES,
  recordUpdateDraft,
  type RecordUpdateRequest,
  type UpdateType,
} from '@/features/record-update/request';
import { SkillPicker } from '@/features/record-update/skill-picker';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function Field({ id, label, hint, placeholder, value, onChange, required }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-base text-ink-tertiary">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        aria-describedby={hintId}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-40 resize-none rounded-2xl border border-line bg-surface p-4 text-sm leading-5 transition-[border-color,box-shadow] placeholder:text-ink-tertiary focus:border-field-focus focus:shadow-none focus:outline-none"
      />
    </div>
  );
}

interface Draft {
  type?: UpdateType;
  skills: string[];
  says: string;
  when: string;
  where: string;
  verify: string;
}

interface RecordUpdateFormProps {
  context: Pick<RecordUpdateRequest, 'keeper' | 'about'>;
  /** Every skill a keeper can name, for the skill picker. */
  skillIndex: View['skillIndex'];
  onSubmit: (request: RecordUpdateRequest) => void;
}

/** Each opening starts with empty fields and the originating skill selected when it is in the catalog. */
function RecordUpdateForm({ context, skillIndex, onSubmit }: RecordUpdateFormProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const fileInput = useRef<HTMLInputElement>(null);
  // Only a catalog skill can seed the selected Skill pill.
  const originatingSkill = skillIndex.find((skill) => skill.id === context.about.skillId);
  const [draft, setDraft] = useState<Draft>({
    type: originatingSkill ? 'Skill' : undefined,
    skills: originatingSkill ? [originatingSkill.id] : [],
    says: '',
    when: '',
    where: '',
    verify: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const ready = recordUpdateDraft.safeParse(draft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready.success) return;
    const labels = new Map(skillIndex.map((s) => [s.id, s.label]));
    onSubmit({
      ...ready.data,
      ...context,
      skills: ready.data.type === 'Skill' ? ready.data.skills.map((s) => labels.get(s) ?? s) : [],
      attachments: files.map((f) => f.name),
    });
  };

  const toggleSkill = (skill: string) =>
    setDraft((d) => ({
      ...d,
      skills: d.skills.includes(skill) ? d.skills.filter((s) => s !== skill) : [...d.skills, skill],
    }));

  return (
    <form onSubmit={submit} noValidate className="h-full">
      <DialogScrollArea>
        <DialogHeader title="Record update" description="Request an update be added to your record" />

        <div className="flex flex-1 flex-col gap-6 px-6 sm:px-12">
          <fieldset className="min-w-0">
            <legend className="text-base font-semibold">What would you like updated?</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {UPDATE_TYPES.map((type) => {
                const checked = draft.type === type;
                return (
                  <span
                    key={type}
                    className={cn(
                      'flex h-9 max-w-full items-center rounded-[18px] border border-line bg-surface text-sm transition-colors',
                      checked ? 'border-ink bg-ink pl-1 text-on-ink hover:bg-ink/90' : 'hover:bg-canvas',
                    )}
                  >
                    <label className="shrink-0">
                      <input
                        type="radio"
                        name={'update-type-' + id}
                        value={type}
                        checked={checked}
                        onChange={() => set('type', type)}
                        className="peer sr-only"
                      />
                      <span className="flex h-7 cursor-pointer items-center rounded-full px-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                        {type}
                      </span>
                    </label>
                    <AnimatePresence initial={false}>
                      {checked && (
                        <m.span
                          className="block min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                          initial={reduceMotion ? false : { width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{
                            width: { duration: reduceMotion ? 0 : 0.24, ease: [0.32, 0.72, 0, 1] },
                            opacity: { duration: reduceMotion ? 0 : 0.14 },
                          }}
                        >
                          <span className="flex min-h-7 w-max items-center py-0.5 pr-1 whitespace-nowrap">
                            {type === 'Skill' ? (
                              <SkillPicker
                                index={skillIndex}
                                selected={draft.skills}
                                onToggle={toggleSkill}
                              />
                            ) : (
                              // The other add controls are visual prototype affordances; no picker is in scope.
                              <button
                                type="button"
                                aria-label={'Add ' + type.toLowerCase()}
                                className="flex h-7 items-center rounded-full bg-white/10 px-2 text-on-ink transition-colors hover:bg-white/15"
                              >
                                <Icon name="add" />
                              </button>
                            )}
                          </span>
                        </m.span>
                      )}
                    </AnimatePresence>
                  </span>
                );
              })}
            </div>
          </fieldset>

          <Field
            id={`${id}-says`}
            label="What should the record say?"
            placeholder="I regularly serviced and repaired..."
            value={draft.says}
            onChange={(v) => set('says', v)}
            required
          />
          <Field
            id={`${id}-when`}
            label="When did this happen?"
            hint="You can provide a date or approximate period"
            placeholder="Around 2012–2016..."
            value={draft.when}
            onChange={(v) => set('when', v)}
            required
          />
          <Field
            id={`${id}-where`}
            label="Where?"
            hint="Station / employer / training provider"
            placeholder="Tullaghmore Lighthouse..."
            value={draft.where}
            onChange={(v) => set('where', v)}
            required
          />
          <Field
            id={`${id}-verify`}
            label="Anything that can help verify it?"
            hint="Course name, certificate number, colleague/manager, document, location of old records, etc."
            placeholder="My station manager was... The work should also appear in..."
            value={draft.verify}
            onChange={(v) => set('verify', v)}
          />

          <div className="flex flex-col items-start gap-3">
            {/* The system file browser. Names are kept for the request; the files go nowhere in the prototype. */}
            <input
              ref={fileInput}
              type="file"
              multiple
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={(e) => {
                const chosen = [...(e.target.files ?? [])];
                setFiles((current) => [...current, ...chosen]);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="pl-3"
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="attach_file" />
              Attach evidence (optional)
            </Button>
            {files.length > 0 && (
              <ul aria-label="Attached evidence" className="flex flex-col gap-1">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 text-sm text-ink-secondary"
                  >
                    <span className="wrap-anywhere">{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((current) => current.filter((_, j) => j !== i))}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-canvas"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter align="end">
          <Button type="submit" variant="neutral" className="w-[183px]" disabled={!ready.success}>
            Submit
          </Button>
        </DialogFooter>
      </DialogScrollArea>
    </form>
  );
}

interface RecordUpdateDialogProps extends RecordUpdateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
}

/**
 * "I've done more of this": the keeper asks for their record to be updated.
 * Nothing is changed here — the request goes to the redeployment team, with
 * who is asking and what they were looking at attached.
 */
export function RecordUpdateDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  ...form
}: RecordUpdateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        open={open}
        onCloseAutoFocus={onCloseAutoFocus}
        className="h-[min(892px,calc(100dvh-32px))] w-[min(844px,calc(100vw-32px))]"
      >
        <RecordUpdateForm {...form} />
      </DialogContent>
    </Dialog>
  );
}
