import { Route, Routes, useLocation } from 'react-router';
import { usePageNavigation } from '@/hooks/use-page-navigation';
import { AppShell } from '@/components/layout/app-shell';
import type { Crumb } from '@/components/layout/page-header';
import { posting } from '@/data/role';
import { ApplicationPathPage } from '@/features/application-path/application-path-page';
import { ApplicationTrackerPage } from '@/features/application-tracker/application-tracker-page';
import { ApplicationProfilePage } from '@/features/application-tracker/application-profile-page';
import { RolePage } from '@/features/role/role-page';
import { routes } from '@/lib/routes';

export function App() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, '') || '/';
  const applicationPath = pathname === routes.applicationPath;
  const openingRole = pathname === routes.openingRole;
  const applicationProfile = pathname === routes.applicationProfile;
  const applicationTracker = applicationProfile || pathname === routes.applicationTracker;

  let breadcrumb: Crumb[] = [
    { label: 'Home', href: routes.suggestedRole },
    { label: 'Suggested Roles', href: routes.suggestedRole },
  ];
  if (applicationPath) {
    breadcrumb = [
      { label: 'Application paths', href: routes.applicationPath },
      { label: posting.title, href: routes.applicationPath },
    ];
  } else if (applicationTracker) {
    breadcrumb = [{ label: 'Application Tracker', href: routes.applicationTracker }];
    if (applicationProfile) {
      breadcrumb.push({ label: `${posting.employer} · ${posting.title}`, href: routes.applicationProfile });
    }
  } else if (openingRole) {
    breadcrumb = [
      { label: 'All openings', href: routes.openingRole },
      { label: posting.title, href: routes.openingRole },
    ];
  }

  usePageNavigation(
    applicationPath
      ? 'Application path'
      : applicationProfile
        ? 'Your application profile'
        : applicationTracker
          ? 'Application Tracker'
          : openingRole
            ? `${posting.title} · All openings`
            : `${posting.title} · Suggested Roles`,
  );

  return (
    <AppShell
      current={
        applicationPath
          ? 'application-paths'
          : applicationTracker
            ? 'application-tracker'
            : openingRole
              ? 'openings'
              : ''
      }
      breadcrumb={breadcrumb}
    >
      <Routes key={pathname}>
        <Route path={routes.suggestedRole} element={<RolePage />} />
        <Route path={routes.openingRole} element={<RolePage />} />
        <Route path={routes.applicationPath} element={<ApplicationPathPage />} />
        <Route path={routes.applicationTracker} element={<ApplicationTrackerPage />} />
        <Route path={routes.applicationProfile} element={<ApplicationProfilePage />} />
        <Route path="*" element={<RolePage />} />
      </Routes>
    </AppShell>
  );
}
