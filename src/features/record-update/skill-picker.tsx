import { useState } from 'react';
import { Icon } from '@/components/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { View } from '@/domain/schema';
import { cn } from '@/lib/utils';

type Entry = View['skillIndex'][number];

interface SkillPickerProps {
  /** Every skill a keeper can name: the vocabulary, then every certification module in the pack. */
  index: Entry[];
  /** Ids of the skills the update is about. */
  selected: string[];
  onToggle: (id: string) => void;
}

function SkillChip({
  entry,
  selected,
  onToggle,
}: {
  entry: Entry;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(entry.id)}
      className={cn(
        'rounded-full px-2 py-1 text-sm transition-colors',
        selected ? 'bg-ink text-on-ink' : 'bg-canvas text-ink hover:bg-canvas-hover',
      )}
    >
      {entry.label}
    </button>
  );
}

/**
 * The skills inside the selected "Skill" pill, and the + that opens the picker:
 * the keeper's suggested skills, or — once they type — matches from every
 * skill in the pack. Searching filters a list derive.ts wrote; it infers nothing.
 */
export function SkillPicker({ index, selected, onToggle }: SkillPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const byId = new Map(index.map((s) => [s.id, s]));
  const selectedSkills = selected.flatMap((id) => {
    const entry = byId.get(id);
    return entry?.label.trim() ? [entry] : [];
  });
  const suggested = index.filter((s) => s.source === 'vocabulary');
  const q = query.trim().toLowerCase();
  const results = q ? index.filter((s) => s.label.toLowerCase().includes(q)) : [];

  return (
    <span className="flex h-7 w-max flex-nowrap items-center gap-0.5">
      {selectedSkills.map((entry) => (
        <span
          key={entry.id}
          className="flex h-7 shrink-0 items-center rounded-full bg-white/10 px-2 text-sm whitespace-nowrap text-on-ink"
        >
          {entry.label}
        </span>
      ))}

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <PopoverTrigger asChild>
          {/* White at 10% at rest, 20% while the picker is open. */}
          <button
            type="button"
            aria-label="Add skills"
            className={cn(
              'flex h-7 shrink-0 items-center rounded-full px-2 text-on-ink transition-colors',
              open ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15',
            )}
          >
            <Icon name="add" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="relative flex h-[340px] w-[331px] flex-col gap-6 p-5">
          <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-canvas px-4">
            <Icon name="search" className="text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all skills"
              aria-label="Search all skills"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink-neutral outline-none placeholder:text-ink-tertiary [&::-webkit-search-cancel-button]:appearance-none"
            />
          </label>

          <div className="min-h-0 flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {q ? (
              results.length ? (
                <ul aria-label="Matching skills" className="flex flex-wrap gap-2">
                  {results.map((entry) => (
                    <li key={entry.id}>
                      <SkillChip entry={entry} selected={selected.includes(entry.id)} onToggle={onToggle} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-tertiary">No skills match “{query.trim()}”.</p>
              )
            ) : (
              <section aria-labelledby="suggested-skills-title" className="flex flex-col gap-2">
                <h3 id="suggested-skills-title" className="text-base font-semibold">
                  Your suggested skills
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {suggested.map((entry) => (
                    <li key={entry.id}>
                      <SkillChip entry={entry} selected={selected.includes(entry.id)} onToggle={onToggle} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p aria-live="polite" className="sr-only">
              {q ? `${results.length} ${results.length === 1 ? 'skill' : 'skills'} found` : ''}
            </p>
          </div>

          {/* The last row fades out where the list carries on. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-white/0 from-[16.25%] to-white to-[37.963%]"
          />
        </PopoverContent>
      </Popover>
    </span>
  );
}
