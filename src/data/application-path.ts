import { view } from '@/data/view';

export interface ApplicationPathStep {
  id: string;
  title: string;
  kind: 'assessment' | 'course';
  metadata: string;
  description: string;
  action: string;
  claim: string;
  skillId: string;
  modules: string[];
}

/**
 * Explicit presentation plan for Bearach × this role, using the existing claims.
 * Source records stay unchanged. Completing an action simulates a successful
 * assessment/course and its award in the prototype; it never infers an award
 * from logbook evidence or writes one into the source pack.
 * Medical precedes OSSC; current sea survival precedes WAHS.
 */
export const applicationPathSteps: ApplicationPathStep[] = [
  {
    id: 'medical',
    title: 'Offshore medical fitness',
    kind: 'assessment',
    metadata: 'Medical declaration · Assessment',
    description:
      'Complete an offshore medical assessment to obtain the current fitness declaration required before offshore safety training, or request a check of an existing record.',
    action: 'Book assessment',
    claim: 'offshore-medical',
    skillId: 'offshore-medical',
    modules: [],
  },
  {
    id: 'offshore-refresher',
    title: 'Offshore safety refresher',
    kind: 'course',
    metadata: 'OSSC-SS, OSSC-FF, OSSC-HL, OSSC-CS · Refresher and assessment',
    description:
      'Your certificate summary and individual training dates disagree. Refresh sea survival, fire response, helicopter landing operations and confined space rescue to establish current records before height training.',
    action: 'Start refresher',
    claim: 'offshore-safety-survival',
    skillId: view.skillIndex.find((skill) => skill.source === 'OSSC-SS')?.id ?? 'OSSC-SS',
    modules: ['OSSC-SS', 'OSSC-FF', 'OSSC-HL', 'OSSC-CS'],
  },
  {
    id: 'first-aid',
    title: 'First aid and casualty handling',
    kind: 'course',
    metadata: 'OSSC-FA · Course and assessment',
    description:
      'First aid is the missing OSSC module. Complete the course and assessment; together with your current medical declaration and refreshed modules, this completes your Offshore Safety and Survival Certificate.',
    action: 'Start course',
    claim: 'offshore-safety-survival',
    skillId: view.skillIndex.find((skill) => skill.source === 'OSSC-FA')?.id ?? 'OSSC-FA',
    modules: ['OSSC-FA'],
  },
  {
    id: 'height',
    title: 'Height experience assessment',
    kind: 'assessment',
    // Half-day is the user's prototype duration; the source pack supplies no durations.
    metadata: 'WAHS-1, WAHS-2 · Half-day · Assessment',
    description:
      'Your work records show substantial height experience. Complete the assessment for height safety, fall arrest and ladder/tower climbing, with current sea survival in place.',
    action: 'Book assessment',
    claim: 'work-at-height',
    skillId: 'tower-climbing',
    modules: ['WAHS-1', 'WAHS-2'],
  },
  {
    id: 'rope-rescue',
    title: 'Rope access and tower rescue',
    kind: 'course',
    metadata: 'WAHS-3, WAHS-4 · Course and assessment',
    description:
      'There is no WAHS training record, and the logbook does not establish tower rescue competence. Complete rope access level 1 and tower rescue/casualty recovery to finish the Working at Height and Rope Access Scheme.',
    action: 'Start course',
    claim: 'tower-rescue',
    skillId: 'tower-rescue',
    modules: ['WAHS-3', 'WAHS-4'],
  },
];

export const offshoreSafetyDiscrepancies =
  view.claims.find((claim) => claim.id === 'offshore-safety-survival')?.discrepancies ?? [];
