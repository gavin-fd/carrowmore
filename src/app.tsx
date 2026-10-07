import { AppShell } from '@/components/layout/app-shell';
import type { Crumb } from '@/components/layout/page-header';
import { posting } from '@/data/role';
import { ApplicationPathPage } from '@/features/application-path/application-path-page';
import { ApplicationTrackerPage } from '@/features/application-tracker/application-tracker-page';
import { ApplicationProfilePage } from '@/features/application-tracker/application-profile-page';
import { RolePage } from '@/features/role/role-page';
import { routes } from '@/lib/routes';

export function App() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
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
      headerClassName={applicationPath || applicationTracker ? 'pt-6' : undefined}
      breadcrumb={breadcrumb}
    >
      {applicationPath ? (
        <ApplicationPathPage />
      ) : applicationProfile ? (
        <ApplicationProfilePage />
      ) : applicationTracker ? (
        <ApplicationTrackerPage />
      ) : (
        <RolePage />
      )}
    </AppShell>
  );
}
