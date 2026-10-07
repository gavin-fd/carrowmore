import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PageHeader, type Crumb } from '@/components/layout/page-header';
import { Sidebar } from '@/components/layout/sidebar';

/** How far ahead of the content the header's rule starts to fade, so it is gone before they meet. */
const RULE_LEAD = 5;

interface AppShellProps {
  /** Sidebar item for the current section. */
  current: string;
  breadcrumb: Crumb[];
  headerClassName?: string;
  children: ReactNode;
}

/**
 * The sidebar sticks to the viewport at full height less a 16px margin on
 * three sides; the header sticks to the top of the main column. Below md the
 * sidebar is a tab bar fixed to the foot of the screen, and the main column
 * keeps clear of it.
 */
export function AppShell({ current, breadcrumb, headerClassName, children }: AppShellProps) {
  const headerRef = useRef<HTMLElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const [contentBeneath, setContentBeneath] = useState(false);

  // Content starts one 32px gap below the header. Once all but the last
  // RULE_LEAD px of that gap has scrolled up under the header, treat content as
  // beneath it.
  useEffect(() => {
    const header = headerRef.current;
    const gap = gapRef.current;
    if (!header || !gap) return;
    const edge = header.offsetHeight + RULE_LEAD;
    const observer = new IntersectionObserver(
      ([entry]) => setContentBeneath(!entry.isIntersecting && entry.boundingClientRect.top < edge),
      { rootMargin: `-${edge}px 0px 0px 0px` },
    );
    observer.observe(gap);
    return () => observer.disconnect();
  }, [headerClassName]);

  return (
    <div className="flex min-h-dvh">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 md:pointer-events-auto md:sticky md:inset-auto md:top-0 md:z-auto md:h-dvh md:shrink-0 md:pr-0">
        <Sidebar current={current} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col max-md:pb-tabbar">
        <PageHeader
          ref={headerRef}
          breadcrumb={breadcrumb}
          contentBeneath={contentBeneath}
          className={headerClassName}
        />
        <div ref={gapRef} aria-hidden="true" className="h-8 shrink-0" />
        {children}
      </div>
    </div>
  );
}
