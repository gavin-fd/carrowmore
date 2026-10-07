/** Deterministic, explicit public projection for the application profile. Source records stay unchanged. */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { applicationProfileSchema } from '../src/domain/schema.ts';
import type { Keeper, PublicKeeper } from '../src/domain/types.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = <T>(file: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')) as T;
const generated = read<{ keeper: PublicKeeper }>('src/data/generated/bearach-offshore-omt.json');
const keeper = read<Keeper[]>('data/source/keepers.json').find(
  (item) => item.keeper_code === generated.keeper.keeper_code,
);
if (!keeper) throw new Error('The application-profile keeper is missing from the source pack.');

// The six modules selected by the Figma profile. Values are read from source records.
const displayedTraining = new Set(['HVAP-01', 'RCOM-AT', 'MPMC-D', 'RCOM-MET', 'OSSC-SS', 'OSSC-CS']);

const schemes = read<{
  schemes: { code: string; renewal_years: number; modules: { code: string; name: string }[] }[];
}>('data/source/certification_schemes.json');

const profile = applicationProfileSchema.parse({
  pathwaySchemes: schemes.schemes
    .filter((scheme) => ['OSSC', 'WAHS'].includes(scheme.code))
    .map(({ code, renewal_years, modules }) => ({ code, renewal_years, modules })),
  keeper: {
    keeper_code: generated.keeper.keeper_code,
    name: generated.keeper.name,
    current_grade: generated.keeper.current_grade,
    date_joined: generated.keeper.date_joined,
    years_of_service: generated.keeper.years_of_service,
    postings: generated.keeper.postings.map((posting) => ({
      station_code: posting.station_code,
      station: posting.station,
      station_class: posting.station_class,
      from_year: posting.from_year,
      to_year: posting.to_year,
    })),
  },
  gradeHistory: keeper.grade_history.map((grade) => ({ from_year: grade.from_year, grade: grade.grade })),
  recentTraining: keeper.training_records
    .filter((record) => record.outcome === 'completed' && displayedTraining.has(record.module))
    .sort((a, b) => b.year - a.year)
    .slice(0, 6)
    .map((record) => ({
      scheme: record.scheme,
      module: record.module,
      module_name: record.module_name,
      year: record.year,
      outcome: record.outcome,
    })),
  certifications: keeper.certifications
    .filter((record) => record.scheme === 'OSSC' || record.scheme === 'WAHS')
    .map((record) => ({
      scheme: record.scheme,
      modules_held: record.modules_held,
      complete: record.complete,
      valid_2026: record.valid_2026,
    })),
});

const destination = path.join(ROOT, 'src/data/generated/bearach-application-profile.json');
fs.writeFileSync(destination, JSON.stringify(profile, null, 2) + '\n');
console.log('Wrote the application profile: public service, training and certification records.');
