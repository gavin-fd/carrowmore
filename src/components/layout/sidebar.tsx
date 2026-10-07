import { Link } from 'react-router';
import logoMark from '@/assets/logo-mark.svg';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icon-names';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { routes } from '@/lib/routes';

interface NavItem {
  id: string;
  /** The accessible name, and the tooltip unless `tooltip` is false. */
  label: string;
  tooltip?: boolean;
  icon: IconName;
  kind: 'link' | 'button';
  /** Starts a new group: a rule above it on desktop. */
  divided?: boolean;
  /** Pinned to the foot of the sidebar on desktop. */
  utility?: boolean;
}

/**
 * Destinations arrive with their screens; until then each link points at this
 * page. Notifications and More are buttons because they open something in
 * place rather than going somewhere.
 */
const ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', kind: 'link' },
  { id: 'courses', label: 'Courses', icon: 'book_4', kind: 'link' },
  { id: 'assessments', label: 'Assessments', icon: 'box_edit', kind: 'link' },
  { id: 'events', label: 'Events', icon: 'event', kind: 'link' },
  { id: 'openings', label: 'All Openings', icon: 'work', kind: 'link', divided: true },
  { id: 'application-paths', label: 'Application Paths', icon: 'conversion_path', kind: 'link' },
  { id: 'application-tracker', label: 'Application Tracker', icon: 'outbox', kind: 'link' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', kind: 'button', utility: true },
  { id: 'more', label: 'More', icon: 'more_horiz', kind: 'button', utility: true, tooltip: false },
];

const firstUtility = ITEMS.findIndex((item) => item.utility);

const itemClass =
  'flex h-10 w-full items-center justify-center rounded-xl text-ink transition-colors hover:bg-canvas md:w-10';

/**
 * A rail on desktop, as the Figma draws it. Below md the same list becomes a
 * tab bar across the foot of the screen: the logo and group rule drop out, and
 * the items share the width evenly.
 */
export function Sidebar({ current }: { current: string }) {
  // Tooltips sit beside the rail on desktop, and above the tab bar below md.
  const isRail = useMediaQuery('(min-width: 48rem)');

  return (
    <nav
      aria-label="Main"
      className="pointer-events-auto flex h-14 items-center rounded-3xl border border-line bg-surface px-2 shadow-raised md:h-full md:w-20 md:flex-col md:gap-4 md:border-0 md:px-5 md:py-6 md:shadow-none"
    >
      <span className="relative hidden size-10 shrink-0 md:block">
        {/* Positioned as the Figma frames it: inset 15.58% 10% 16.86% 7.69%. */}
        <img src={logoMark} alt="Pearson" className="absolute top-[15.58%] left-[7.69%]" />
      </span>

      <ul className="flex w-full items-center md:flex-1 md:flex-col md:gap-4">
        {ITEMS.map((item, i) => {
          const icon = <Icon name={item.icon} />;
          const control =
            item.kind === 'link' ? (
              <Link
                to={
                  item.id === 'application-paths'
                    ? routes.applicationPath
                    : item.id === 'application-tracker'
                      ? routes.applicationTracker
                      : item.id === 'openings'
                        ? routes.openingRole
                        : routes.suggestedRole
                }
                aria-label={item.label}
                aria-current={item.id === current ? 'page' : undefined}
                className={cn(
                  itemClass,
                  item.id === current &&
                    (item.id === 'openings'
                      ? 'bg-openings text-white hover:bg-openings'
                      : item.id === 'application-tracker'
                        ? 'bg-tracker hover:bg-tracker'
                        : 'bg-path hover:bg-path'),
                )}
              >
                {icon}
              </Link>
            ) : (
              <button type="button" aria-label={item.label} className={itemClass}>
                {icon}
              </button>
            );
          return (
            <li
              key={item.id}
              className={cn(
                'min-w-0 flex-1 md:flex-none',
                // The Figma's rule takes no height: a 1px line 16px below the item above.
                item.divided &&
                  'md:relative md:mt-4 md:before:absolute md:before:-top-[17px] md:before:h-px md:before:w-10 md:before:bg-line',
                i === firstUtility && 'md:mt-auto',
              )}
            >
              {item.tooltip === false ? (
                control
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>{control}</TooltipTrigger>
                  {/* 4px past the 40px button is 12px from the glyph inside it. */}
                  <TooltipContent side={isRail ? 'right' : 'top'} sideOffset={4}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
