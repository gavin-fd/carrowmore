import { applicationProfileSchema } from '@/domain/schema';
import generated from '@/data/generated/bearach-application-profile.json';

/** Validated public projection; source data and inference stay outside the browser. */
export const applicationProfile = applicationProfileSchema.parse(generated);

/** Figma prototype fixtures, not application records or employer decisions. */
export const applicationStages = [
  { id: 'requested', label: 'Interview requested', cards: 1 },
  { id: 'review', label: 'Under review', cards: 2 },
  { id: 'referred', label: 'Referred to employer', cards: 5 },
  { id: 'scheduled', label: 'Interview scheduled', cards: 1 },
  { id: 'not-selected', label: 'Not selected', cards: 1 },
] as const;
