import { Link } from 'react-router';
import type { Ref } from 'react';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  breadcrumb: Crumb[];
  /** Content has scrolled up beneath the header. */
  contentBeneath: boolean;
  ref?: Ref<HTMLElement>;
}

/**
 * Sticky at the top of the main column. At rest it sits on a rule; once
 * content scrolls beneath it the rule fades out, and the canvas fading over
 * the gradient's bottom 26.87% takes over as the edge. At the tablet breakpoint
 * (md up to lg), its separate layer extends 12px when scrolled, giving 32px of
 * visual bottom padding. Desktop and mobile retain the original gradient
 * height; the resting layout, breadcrumb and rule positions are unchanged.
 *
 * The rule is drawn outside the header's box, so it takes no height and its
 * fade cannot shift the page. It leaves quickly (75ms), before content can be
 * seen through it, and returns more gently (150ms).
 */
export function PageHeader({ breadcrumb, contentBeneath, ref }: PageHeaderProps) {
  return (
    <header
      ref={ref}
      className="sticky top-0 z-10 mx-6 px-2 pt-8 pb-5 lg:bg-linear-to-t lg:from-canvas/0 lg:to-canvas lg:to-[26.87%]"
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10 bg-linear-to-t from-canvas/0 to-canvas to-[26.87%] lg:hidden',
          contentBeneath && 'md:-bottom-3',
        )}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-base leading-none text-ink-secondary">
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.label} className="flex items-center gap-2">
              {i > 0 && <Icon name="arrow_forward_ios" size={16} className="text-ink-faint" />}
              <Link
                to={crumb.href}
                aria-current={i === breadcrumb.length - 1 ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-ink',
                  i < breadcrumb.length - 1 && 'underline-offset-4 hover:underline',
                )}
              >
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 -bottom-px h-px bg-line transition-opacity ease-out',
          contentBeneath ? 'opacity-0 duration-75' : 'duration-150',
        )}
      />
    </header>
  );
}
