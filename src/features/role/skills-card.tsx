import { useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { Chip, chipClass } from '@/components/chip';
import { Icon } from '@/components/icon';
import type { View } from '@/domain/schema';
import { cn } from '@/lib/utils';

/** Collapsed card height, and the faded footer that sits over its last rows. From the Figma. */
const COLLAPSED_HEIGHT = 340;
const FOOTER_HEIGHT = 93;
/** Room below the list once expanded: a 16px gap, the 20px toggle, and the Figma's 21px beneath it. */
const EXPANDED_FOOTER = 16 + 20 + 21;
const CARD_PADDING = 20;
const EASE = [0.32, 0.72, 0, 1] as const;

type Skill = View['skills'][number];

/**
 * The skills on the keeper's profile. Collapses to the Figma's height with a
 * fade and a "Show all" toggle, but only when the chips overflow it — at
 * widths where everything fits, the card simply fits its content.
 */
interface SkillsCardProps {
  skills: Skill[];
  /** Open the evidence behind a chip. */
  onSelect: (id: string) => void;
  className?: string;
}

export function SkillsCard({ skills, onSelect, className }: SkillsCardProps) {
  const headingId = useId();
  const listId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState<number>();
  const [expanded, setExpanded] = useState(false);
  const hasMeasured = useRef(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setNaturalHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The first measurement settles the card without animating; changes after it animate.
  useEffect(() => {
    if (naturalHeight !== undefined) hasMeasured.current = true;
  }, [naturalHeight]);

  const overflows = naturalHeight !== undefined && naturalHeight > COLLAPSED_HEIGHT;
  const height = !overflows
    ? 'auto'
    : expanded
      ? naturalHeight - CARD_PADDING + EXPANDED_FOOTER
      : COLLAPSED_HEIGHT;

  // A chip reached by keyboard while hidden under the fade opens the card, so focus is never obscured.
  const revealFocused = (event: FocusEvent<HTMLUListElement>) => {
    const chip = event.target;
    if (!overflows || expanded || !(chip instanceof HTMLElement)) return;
    if (chip.offsetTop + chip.offsetHeight > COLLAPSED_HEIGHT - FOOTER_HEIGHT) setExpanded(true);
  };

  return (
    <m.section
      aria-labelledby={headingId}
      className={cn('relative overflow-hidden rounded-3xl bg-surface', className)}
      initial={false}
      animate={{ height }}
      transition={{ duration: hasMeasured.current && !reduceMotion ? 0.35 : 0, ease: EASE }}
    >
      <div ref={contentRef} className="flex flex-col gap-6 p-5">
        <h2 id={headingId} className="text-base font-semibold">
          Your skills and experience
        </h2>
        <ul id={listId} className="flex flex-wrap gap-2" onFocus={revealFocused}>
          {skills.map((skill) => (
            <li key={skill.id}>
              {/* Skills no scheme certifies have no logbook claim to open — yet. */}
              {skill.claim ? (
                <Chip data-skill={skill.id} aria-haspopup="dialog" onClick={() => onSelect(skill.id)}>
                  {skill.label}
                </Chip>
              ) : (
                <span className={chipClass}>{skill.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {overflows && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-[21px]"
          style={{ height: FOOTER_HEIGHT }}
        >
          <m.div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-white/0 from-[16.25%] to-white to-[37.963%]"
            initial={false}
            animate={{ opacity: expanded ? 0 : 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((open) => !open)}
            className="pointer-events-auto relative flex items-center gap-1 rounded-sm text-sm"
          >
            {expanded ? 'Show less' : 'Show all'}
            <Icon
              name="expand_more"
              size={16}
              className={cn('transition-transform duration-300 motion-reduce:transition-none', expanded && 'rotate-180')}
            />
          </button>
        </div>
      )}
    </m.section>
  );
}
