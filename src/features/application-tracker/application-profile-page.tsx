import { Link } from 'react-router';
import profileDivider from '@/assets/profile-divider.svg';
import metaDivider from '@/assets/profile-meta-divider.svg';
import recordCheck from '@/assets/profile-record-check.svg';
import { chipClass } from '@/components/chip';
import { Button } from '@/components/ui/button';
import { applicationPathSteps } from '@/data/application-path';
import { submittedApplication } from '@/features/application-path/prototype-application';
import { applicationProfile } from '@/data/application-tracker';
import { view } from '@/data/view';
import { usePrototypeSkills } from '@/features/profile/prototype-skills';
import { routes } from '@/lib/routes';

function MetaDivider() {
  return (
    <span aria-hidden="true" className="relative h-4 w-px shrink-0">
      <img
        src={metaDivider}
        width={16}
        height={1}
        alt=""
        className="absolute top-[7.5px] left-[-7.5px] max-w-none rotate-90"
      />
    </span>
  );
}

export function ApplicationProfilePage() {
  const { keeper, gradeHistory, recentTraining, pathwaySchemes } = applicationProfile;
  const { completed, awardedYear } = submittedApplication();
  const { removedIds } = usePrototypeSkills();
  const awardedModules = applicationPathSteps
    .filter((step) => completed.includes(step.id))
    .flatMap((step) => step.modules);
  const postings = [...keeper.postings].sort((a, b) => b.from_year - a.from_year);
  const rockStations = keeper.postings.filter((posting) => posting.station_class === 'rock').length;
  const modulesFor = (scheme: string) => pathwaySchemes.find((record) => record.code === scheme)!;
  const certificates = [
    { label: 'Fire', detail: 'OSSC-FF, ' + awardedYear },
    { label: 'Sea Survival', detail: 'OSSC-SS, ' + awardedYear },
    { label: 'First Aid', detail: 'OSSC-FA, ' + awardedYear },
    {
      label: 'Working at Heights',
      detail: 'WAHS-1–4, ' + awardedYear + ' · Valid to ' + (awardedYear + modulesFor('WAHS').renewal_years),
    },
    {
      label: 'Offshore Safety & Survival',
      detail: 'OSSC, ' + awardedYear + ' · Valid to ' + (awardedYear + modulesFor('OSSC').renewal_years),
    },
    { label: 'Offshore medical fitness', detail: 'Assessment completed, ' + awardedYear },
  ];
  // Explicit simulated course awards, joined with the immutable historical records.
  const newTraining = awardedModules.map((code) => {
    const scheme = pathwaySchemes.find((record) => record.modules.some((module) => module.code === code))!;
    const module = scheme.modules.find((module) => module.code === code)!;
    return {
      scheme: scheme.code,
      module: code,
      module_name: module.name,
      year: awardedYear,
      outcome: 'completed' as const,
    };
  });
  const training = [
    ...newTraining.reverse(),
    ...recentTraining.filter((record) => !awardedModules.includes(record.module)),
  ].slice(0, 6);
  const profileSkills = view.skills.filter(
    (skill) =>
      !removedIds.includes(skill.id) &&
      (skill.onProfile || (skill.claim === 'tower-rescue' && completed.includes('rope-rescue'))),
  );

  return (
    <main tabIndex={-1} className="outline-none flex-1 px-4 pb-8 md:px-6">
      <div className="mx-auto flex max-w-[686px] flex-col gap-8">
        <section
          aria-labelledby="application-profile-title"
          className="flex flex-col items-start gap-6 rounded-3xl bg-surface px-4 pt-6 pb-6 sm:px-8 sm:pt-10 sm:pb-8"
        >
          <div className="flex flex-col gap-2">
            <h1 id="application-profile-title" className="text-xl font-semibold">
              Your Application Profile
            </h1>
            <p className="text-base text-ink-secondary">
              Your profile including all relevant experience, skills and training have been shared with the
              redeployment team.
            </p>
          </div>
          <Button asChild variant="neutral" className="h-[38px]">
            <Link to={routes.suggestedRole}>View more suggested roles</Link>
          </Button>
        </section>

        <article
          aria-labelledby="keeper-profile-title"
          className="flex flex-col gap-6 rounded-3xl bg-surface px-4 pt-6 pb-6 sm:px-8 sm:pt-10 sm:pb-8"
        >
          <header className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 id="keeper-profile-title" className="text-2xl font-semibold">
                {keeper.name}
              </h2>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold sm:leading-none">
                <span>{keeper.current_grade}</span>
                <span aria-hidden="true">·</span>
                <span>Carrowmore Lighthouse Authority</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-tertiary">
                <span>{keeper.years_of_service} years service</span>
                <MetaDivider />
                <span>{keeper.date_joined.slice(0, 4)} - present</span>
                <MetaDivider />
                <span>
                  {keeper.postings.length} stations, {rockStations} rock
                </span>
              </div>
            </div>
            <span aria-hidden="true" className="block h-px overflow-hidden">
              <img src={profileDivider} width={622} height={1} alt="" className="max-w-none" />
            </span>
          </header>

          <div className="flex flex-col gap-10">
            <section aria-labelledby="profile-skills-title" className="flex flex-col gap-6">
              <h3 id="profile-skills-title" className="text-base font-semibold">
                Relevant skills and experience
              </h3>
              <ul className="flex flex-wrap gap-2">
                {profileSkills.map((skill) => (
                  <li key={skill.id} className={chipClass}>
                    {skill.label}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="profile-certifications-title" className="flex flex-col gap-6">
              <h3 id="profile-certifications-title" className="text-base font-semibold">
                Certifications
              </h3>
              <ul className="flex flex-col gap-4">
                {certificates.map((record) => (
                  <li key={record.label} className="flex items-start gap-2 rounded-lg bg-canvas p-3 text-sm">
                    <img src={recordCheck} width={24} height={24} alt="" />
                    <div className="flex min-h-6 min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <span className="font-semibold">{record.label}</span>
                      <span>{record.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="profile-training-title" className="flex flex-col gap-6">
              <h3 id="profile-training-title" className="text-base font-semibold">
                Recent Training
              </h3>
              <ul>
                {training.map((record) => (
                  <li
                    key={record.module}
                    className="grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-4 border-b border-line p-3 text-sm"
                  >
                    <span>{record.year}</span>
                    <span className="font-semibold sm:leading-none">{record.module_name}</span>
                    <span>{record.module}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="profile-service-title" className="flex flex-col gap-6">
              <h3 id="profile-service-title" className="text-base font-semibold">
                Service
              </h3>
              <ul>
                {postings.map((posting) => {
                  const promotion = gradeHistory
                    .filter(
                      (grade) => grade.from_year >= posting.from_year && grade.from_year <= posting.to_year,
                    )
                    .at(-1);
                  return (
                    <li
                      key={posting.station_code}
                      className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-line p-3 text-sm sm:grid-cols-[max-content_minmax(0,1fr)_max-content]"
                    >
                      <span>
                        {posting.from_year === posting.to_year
                          ? posting.from_year
                          : `${posting.from_year}–${posting.to_year}`}
                      </span>
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="font-semibold sm:leading-none">{posting.station}</span>
                        <span className={chipClass}>
                          {posting.station_class[0].toUpperCase() + posting.station_class.slice(1)}
                        </span>
                      </div>
                      {promotion && (
                        <span className="col-start-2 sm:col-auto">
                          {promotion.grade === 'Supernumerary Keeper' ? 'Supernumerary' : promotion.grade},{' '}
                          {promotion.from_year}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
