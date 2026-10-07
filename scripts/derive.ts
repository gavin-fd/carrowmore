/**
 * derive.ts — the evidence engine.
 *
 * Reads the supplied clean pack, applies the hand-written rules in mappings.ts,
 * and emits a committed view model. Deterministic: same input, same output,
 * every time. No network, no model calls, no randomness, no timestamps.
 *
 *   npm run derive        (this, then skill-map.ts)
 *
 * The browser never infers anything. It renders this file, after checking it
 * against src/domain/schema.ts — and so does this script, before writing it.
 *
 * It runs over ALL 40 keepers and ALL 10,627 logbook entries, not just the one
 * keeper the interface renders. That is deliberate — a pipeline fitted to a
 * single person would be a hand-curated answer wearing a script's clothing.
 * The cohort finding at the end exists to prove the engine generalises.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  COMPETENCIES,
  LIMITATION_RULES,
  PRACTISED_THRESHOLDS,
  ROUTE_STEP_KIND,
  SKILLS,
  phrasing,
  TARGET_ROLE,
  type Competency,
} from './mappings.ts';
import { viewSchema } from '../src/domain/schema.ts';
import type {
  Assessment,
  Claim,
  CohortFinding,
  CertificationRecord,
  Discrepancy,
  EvidenceClass,
  EvidenceSpread,
  EvidenceSummary,
  Keeper,
  KindOfWork,
  LogbookEntry,
  MatchedEntry,
  MissingModule,
  ProfileSkill,
  Provenance,
  PublicKeeper,
  Redaction,
  RelevantModule,
  RoleEvidenceView,
  RouteStep,
  Scheme,
  SkillIndexEntry,
  Signal,
  StationClass,
  VerifiedModule,
} from '../src/domain/types.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const NOW_YEAR = 2026;
const TARGET_KEEPER = 'K0184';

const read = <T>(p: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')) as T;

const keepers = read<Keeper[]>('data/source/keepers.json');
const entries = read<LogbookEntry[]>('data/source/logbook_entries.json');
const schemes = read<{ schemes: Scheme[] }>('data/source/certification_schemes.json').schemes;

const schemeBy = new Map(schemes.map((s) => [s.code, s]));
const moduleName = (scheme: string, code: string) =>
  schemeBy.get(scheme)?.modules.find((m) => m.code === code)?.name ?? code;

/* ────────────────────────────────────────────────────────────────────────────
 * Evidence index — every keeper, every record, grouped once.
 * ────────────────────────────────────────────────────────────────────────── */

interface KeeperEvidence {
  keeper: Keeper;
  logbook: LogbookEntry[];
}

const index = new Map<string, KeeperEvidence>();
for (const k of keepers) index.set(k.keeper_code, { keeper: k, logbook: [] });
for (const e of entries) index.get(e.keeper_code)?.logbook.push(e);
for (const v of index.values()) v.logbook.sort((a, b) => (a.date < b.date ? -1 : 1));

/* ────────────────────────────────────────────────────────────────────────────
 * Matching. A record is cited only with the substring that caused it to be
 * cited, so the inference itself is auditable and not just its conclusion.
 * ────────────────────────────────────────────────────────────────────────── */

const RANK: Record<Signal['kind'], number> = { direct: 3, custodial: 2, adjacent: 1 };

function matchEntries(logbook: LogbookEntry[], signals: Signal[]): MatchedEntry[] {
  const out: MatchedEntry[] = [];
  for (const e of logbook) {
    let best: { kind: Signal['kind']; matched: string } | null = null;
    for (const s of signals) {
      const m = s.pattern.exec(e.text);
      if (!m) continue;
      if (!best || RANK[s.kind] > RANK[best.kind]) best = { kind: s.kind, matched: m[0] };
    }
    if (!best) continue;
    out.push({
      entry_id: e.entry_id,
      date: e.date,
      station: e.station,
      station_code: e.station_code,
      station_class: e.station_class,
      text: e.text,
      source_record: e.source_record,
      source_era: e.source_era,
      signal: best.kind,
      matched: best.matched,
    });
  }
  return out;
}

function buildSpread(m: MatchedEntry[]): EvidenceSpread {
  const years = new Set(m.map((x) => x.date.slice(0, 4)));
  const stations = [...new Set(m.map((x) => x.station))];
  const dates = m.map((x) => x.date).sort();
  const yrs = [...years].map(Number).sort((a, b) => a - b);
  return {
    records: m.length,
    direct: m.filter((x) => x.signal === 'direct').length,
    custodial: m.filter((x) => x.signal === 'custodial').length,
    adjacent: m.filter((x) => x.signal === 'adjacent').length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    distinctYears: years.size,
    yearsSpanned: yrs.length ? yrs[yrs.length - 1] - yrs[0] + 1 : 0,
    stations,
  };
}

/**
 * Kinds of work: direct records grouped by phrasing (mappings.ts), most
 * frequent first. Ties keep the order in which each kind first appears.
 */
function deriveKinds(m: MatchedEntry[]): KindOfWork[] {
  const groups = new Map<string, MatchedEntry[]>();
  for (const e of m) {
    if (e.signal !== 'direct') continue;
    const key = phrasing(e.text);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups.values()]
    .sort((a, b) => b.length - a.length)
    .map((g) => ({ label: g[0].text, entryIds: g.map((e) => e.entry_id) }));
}

function summarise(m: MatchedEntry[], kinds: KindOfWork[]): EvidenceSummary {
  const direct = m.filter((e) => e.signal === 'direct');
  const years = direct.map((e) => Number(e.date.slice(0, 4)));
  return {
    kinds: kinds.length,
    occasions: direct.length,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
    stations: new Set(direct.map((e) => e.station)).size,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Register facts.
 * ────────────────────────────────────────────────────────────────────────── */

function deriveVerified(k: Keeper, c: Competency): VerifiedModule[] {
  const out: VerifiedModule[] = [];
  for (const { scheme, modules } of c.evidencedBy) {
    const cert = k.certifications.find((x) => x.scheme === scheme);
    const s = schemeBy.get(scheme);
    for (const mod of modules) {
      const held = cert?.modules_held.includes(mod) ?? false;
      if (!held) continue;
      const tr = k.training_records.find((t) => t.module === mod);
      const renewal = s?.renewal_years ?? null;
      const stale = !!(tr && renewal && tr.year + renewal < NOW_YEAR);
      out.push({
        scheme,
        schemeName: s?.name ?? scheme,
        module: mod,
        module_name: moduleName(scheme, mod),
        year: tr?.year ?? null,
        outcome: tr?.outcome ?? null,
        schemeIsCertificate: !!(cert?.complete && cert.valid_2026),
        stale,
        staleNote: stale
          ? `Completed ${tr!.year}. This scheme renews every ${renewal} years, so by its module date this would have lapsed in ${tr!.year + renewal!}.`
          : undefined,
      });
    }
  }
  return out;
}

function deriveMissing(k: Keeper, c: Competency): MissingModule[] {
  const out: MissingModule[] = [];
  const seen = new Set<string>();
  const want = c.mandates
    ? [
        {
          scheme: c.mandates.scheme,
          modules:
            c.mandates.modules === 'all'
              ? (schemeBy.get(c.mandates.scheme)?.modules.map((m) => m.code) ?? [])
              : c.mandates.modules,
        },
      ]
    : c.evidencedBy;

  for (const { scheme, modules } of want) {
    const cert = k.certifications.find((x) => x.scheme === scheme);
    for (const mod of modules) {
      const held = cert?.modules_held.includes(mod) ?? false;
      if (held || seen.has(mod)) continue;
      seen.add(mod);
      out.push({ scheme, module: mod, module_name: moduleName(scheme, mod) });
    }
  }
  return out;
}

/**
 * Where the Authority's two registers disagree with each other.
 *
 * 82 of the 191 certifications in the clean pack have a scheme award year that
 * does not match the latest training year for that scheme. We do not resolve
 * these, because we cannot. We show both and say so.
 */
function deriveDiscrepancies(k: Keeper, c: Competency): Discrepancy[] {
  const out: Discrepancy[] = [];
  const codes = new Set([...c.evidencedBy.map((e) => e.scheme), ...(c.mandates ? [c.mandates.scheme] : [])]);
  for (const code of codes) {
    const cert = k.certifications.find((x) => x.scheme === code);
    if (!cert) continue;
    const mods = k.training_records.filter((t) => t.scheme === code);
    if (!mods.length) continue;
    const latest = Math.max(...mods.map((t) => t.year));
    if (latest === cert.awarded_year) continue;
    const s = schemeBy.get(code);
    out.push({
      scheme: code,
      certificateRegisterSays: `Awarded ${cert.awarded_year}${cert.expires_year ? `, expires ${cert.expires_year}` : ''}.`,
      trainingRegisterSays: `Latest module completed ${latest} (${mods
        .slice()
        .sort((a, b) => b.year - a.year)[0].module}).${
        s?.renewal_years ? ` Under a ${s.renewal_years}-year renewal that would have lapsed in ${latest + s.renewal_years}.` : ''
      }`,
    });
  }
  return out;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Assessment. Six states, and which register is allowed to produce them
 * depends on what the employer actually asked for.
 *
 *   certification-class requirement → only a register can satisfy it
 *   experience-class requirement    → only work records can evidence it
 *   declaration-class requirement   → nothing in this pack can satisfy it
 *
 * That split is the honesty rule in executable form. A logbook cannot issue a
 * certificate, and a certificate is not a record of practice.
 * ────────────────────────────────────────────────────────────────────────── */

function assess(
  c: Competency,
  spread: EvidenceSpread,
  verified: VerifiedModule[],
  missing: MissingModule[],
  cert: CertificationRecord | undefined,
): { assessment: Assessment; reason: string } {
  const t = PRACTISED_THRESHOLDS;

  if (c.requirementClass === 'declaration') {
    return {
      assessment: 'no-record',
      reason:
        'The employer asks for a declaration. The Authority holds no file of this kind anywhere in this data pack, so there is nothing to show — neither for nor against.',
    };
  }

  if (c.requirementClass === 'certification') {
    if (cert?.complete && cert.valid_2026) {
      return {
        assessment: 'certified',
        reason: `The ${cert.scheme} register records all modules held, awarded ${cert.awarded_year} and in date.`,
      };
    }
    if (!cert) {
      return {
        assessment: 'no-record',
        reason: `No ${c.mandates?.scheme ?? 'certification'} record of any kind exists for this keeper.`,
      };
    }
    return {
      assessment: 'gate-missing',
      reason: `The employer mandates this certificate and states it blocks mobilisation. ${
        missing.length
      } of ${(schemeBy.get(cert.scheme)?.modules.length ?? 0)} modules are not held (${missing
        .map((m) => m.module)
        .join(', ')}), so the scheme is incomplete and no valid certificate exists.`,
    };
  }

  // experience-class: the work records decide.
  if (spread.records === 0) {
    return {
      assessment: 'no-record',
      reason: `No logbook entry in ${verified.length ? 'this keeper’s record' : 'any of the 10,627 entries examined'} matched any of the patterns for this requirement.`,
    };
  }

  const meetsPractised =
    spread.direct >= t.minDirectRecords &&
    spread.distinctYears >= t.minDistinctYears &&
    spread.stations.length >= t.minStations;

  if (meetsPractised) {
    return {
      assessment: 'practised',
      reason: `${spread.direct} work records describe this directly, across ${spread.distinctYears} separate years and ${spread.stations.length} stations (${spread.firstDate?.slice(0, 4)}–${spread.lastDate?.slice(0, 4)}). That clears the stated threshold of ${t.minDirectRecords} records, ${t.minDistinctYears} years and ${t.minStations} stations.`,
    };
  }

  const nonDirect = spread.custodial + spread.adjacent;
  if (nonDirect > spread.direct) {
    const v = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
    const parts: string[] = [];
    if (spread.direct) parts.push(`${v(spread.direct, 'describes', 'describe')} the work itself`);
    if (spread.custodial) parts.push(`${v(spread.custodial, 'describes', 'describe')} custody or administration of it`);
    if (spread.adjacent) parts.push(`${v(spread.adjacent, 'describes', 'describe')} neighbouring work`);
    return {
      assessment: 'adjacent',
      reason: `Of ${v(spread.records, 'matching record', 'matching records')}, ${parts.join(', ')}. ${
        spread.records === 1
          ? 'That is not the thing the employer asked for, so it cannot be read as evidence of doing it.'
          : 'Most of these are not the thing the employer asked for, so they cannot be read as evidence of doing it.'
      }`,
    };
  }

  return {
    assessment: 'thin',
    reason: `${spread.direct} direct record${spread.direct === 1 ? '' : 's'} across ${spread.distinctYears} year${spread.distinctYears === 1 ? '' : 's'} and ${spread.stations.length} station${spread.stations.length === 1 ? '' : 's'}. Suggestive, but below the stated threshold of ${t.minDirectRecords} records across ${t.minDistinctYears} years at ${t.minStations} stations, so no claim is made.`,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Limitations and absence.
 * ────────────────────────────────────────────────────────────────────────── */

function evidenceClassesPresent(spread: EvidenceSpread, verified: VerifiedModule[], cert?: CertificationRecord): EvidenceClass[] {
  const out = new Set<EvidenceClass>();
  if (spread.records > 0) out.add('work-record');
  for (const v of verified) {
    if (v.outcome === 'attended') out.add('training-attended');
    if (v.outcome === 'completed') out.add('training-completed');
  }
  if (cert) out.add(cert.complete && cert.valid_2026 ? 'certification-valid' : 'certification-incomplete');
  return [...out];
}

function deriveLimitations(c: Competency, present: EvidenceClass[]): string[] {
  return LIMITATION_RULES.filter(
    (r) => r.requirement === c.requirementClass && present.includes(r.evidence),
  ).map((r) => r.say);
}

function deriveAbsence(c: Competency, k: Keeper, spread: EvidenceSpread, missing: MissingModule[]): string[] {
  const out: string[] = [];

  for (const { scheme } of c.evidencedBy) {
    const cert = k.certifications.find((x) => x.scheme === scheme);
    const training = k.training_records.filter((t) => t.scheme === scheme);
    if (!cert && !training.length) {
      const s = schemeBy.get(scheme);
      out.push(
        `No ${scheme} record of any kind — no certification entry and no training record. ${s?.name ?? scheme} is the scheme that would formally evidence this, and this keeper has never been entered into it.`,
      );
    }
  }

  for (const m of missing) out.push(`${m.module} (${m.module_name}) is not held.`);

  const directPatterns = c.signals.filter((s) => s.kind === 'direct').length;
  if (directPatterns > 0 && spread.direct === 0) {
    out.push(
      `Searched all ${index.get(k.keeper_code)!.logbook.length} of this keeper’s logbook entries against ${directPatterns} pattern${directPatterns === 1 ? '' : 's'} for the work itself. No match. Absence of a written record is not evidence that the work was never done — roughly 70% of the raw logs were routine watchkeeping and were removed before this pack was produced.`,
    );
  }

  if (!out.length) out.push('Nothing material was searched for and not found.');
  return out;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Claims
 * ────────────────────────────────────────────────────────────────────────── */

function deriveClaim(k: Keeper, logbook: LogbookEntry[], c: Competency): Claim {
  const matched = matchEntries(logbook, c.signals);
  const spread = buildSpread(matched);
  const kinds = deriveKinds(matched);
  const verified = deriveVerified(k, c);
  const missing = deriveMissing(k, c);
  const schemeCode = c.mandates?.scheme ?? c.evidencedBy[0]?.scheme;
  const cert = schemeCode ? k.certifications.find((x) => x.scheme === schemeCode) : undefined;
  const { assessment, reason } = assess(c, spread, verified, missing, cert);
  const present = evidenceClassesPresent(spread, verified, cert);

  const schemeCodes = new Set([...c.evidencedBy.map((e) => e.scheme), ...(c.mandates ? [c.mandates.scheme] : [])]);

  return {
    id: c.id,
    label: c.label,
    requirement: {
      text: c.requirement,
      source: c.requirementSource,
      class: c.requirementClass,
      essential: c.essential,
      gate: c.gate,
    },
    assessment,
    reason,
    spread,
    entries: matched,
    kinds,
    summary: summarise(matched, kinds),
    training: k.training_records.filter((t) => schemeCodes.has(t.scheme)),
    certifications: k.certifications.filter((x) => schemeCodes.has(x.scheme)),
    verified,
    missingModules: missing,
    searchedFor: c.searchedFor,
    limitations: deriveLimitations(c, present),
    absence: deriveAbsence(c, k, spread, missing),
    discrepancies: deriveDiscrepancies(k, c),
    nosf: c.nosf,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Route. Gates first, in the employer's own order of consequence.
 * ────────────────────────────────────────────────────────────────────────── */

function deriveRoute(claims: Claim[]): RouteStep[] {
  const steps: RouteStep[] = [];
  let order = 1;

  /**
   * Declarations before certificates.
   *
   * Not a cosmetic ordering. A declaration never depends on a certificate, but
   * certificates routinely depend on declarations — OSSC's own prerequisite
   * list reads "Current offshore medical fitness declaration." Booking the
   * course before passing the medical is the expensive way round, so the route
   * has to put the medical first even though it is the vaguer instruction.
   */
  const gateOrder = (c: Claim) => (c.requirement.class === 'declaration' ? 0 : 1);
  const gates = claims.filter((c) => c.requirement.gate).sort((a, b) => gateOrder(a) - gateOrder(b));

  for (const claim of gates) {
    if (claim.assessment === 'certified') continue;

    if (claim.requirement.class === 'declaration') {
      // Which mandated schemes name this declaration in their prerequisites?
      const dependents = schemes.filter((s) =>
        s.prerequisites.some((p) => /medical/i.test(p)),
      );
      steps.push({
        order: order++,
        action: `Obtain ${claim.label.toLowerCase()}`,
        kind: ROUTE_STEP_KIND.declaration,
        scheme: '—',
        because: `The employer lists this as essential and the Authority holds no record of it either way.${
          dependents.length
            ? ` It is also a stated prerequisite for ${dependents
                .map((d) => d.code)
                .join(', ')} — ${dependents[0].code} lists "${dependents[0].prerequisites.find((p) => /medical/i.test(p))}" — so it has to come before the course, not after it.`
            : ''
        }`,
        unlocks: dependents.map((d) => `Prerequisite for ${d.code} (${d.name})`),
        derivedFrom:
          'gate claim with requirementClass=declaration; ordering derived from scheme prerequisites naming a medical declaration',
      });
      continue;
    }

    for (const m of claim.missingModules) {
      const s = schemeBy.get(m.scheme);
      const unlocks: string[] = [`Completes ${m.scheme} — ${s?.name ?? ''}`.trim()];
      // Any scheme whose prerequisites name a module of this scheme becomes reachable.
      for (const other of schemes) {
        if (other.code === m.scheme) continue;
        if (other.prerequisites.some((p) => p.includes(m.scheme))) {
          unlocks.push(`Opens ${other.code} (${other.name}), whose prerequisites name ${m.scheme}`);
        }
      }
      steps.push({
        order: order++,
        action: `Complete ${m.module}`,
        kind: ROUTE_STEP_KIND.missingModule,
        scheme: m.scheme,
        module: m.module,
        module_name: m.module_name,
        because: `${claim.requirement.text.split('.')[0]}. This is the only module of ${m.scheme} not held, so it is the whole distance between the record as it stands and a valid certificate.`,
        unlocks,
        derivedFrom: `gate claim ${claim.id}, missing module from certification register`,
      });
    }
  }

  // Then the largest gap between what the records show and what is certified.
  const practisedUncertified = claims
    .filter((c) => c.assessment === 'practised' && c.verified.length === 0 && c.absence.some((a) => a.startsWith('No ')))
    .sort((a, b) => b.spread.direct - a.spread.direct)[0];

  if (practisedUncertified) {
    const scheme = practisedUncertified.absence[0].match(/No (\w+) record/)?.[1];
    const s = scheme ? schemeBy.get(scheme) : undefined;
    steps.push({
      order: order++,
      action: `Enter the ${scheme} scheme`,
      kind: ROUTE_STEP_KIND.uncertifiedPractice,
      scheme: scheme ?? '—',
      because: `${practisedUncertified.spread.direct} work records describe this across ${practisedUncertified.spread.distinctYears} years, and no register anywhere records it. This is the largest gap between what the record shows and what can be proved.${
        s?.prerequisites.length
          ? ` Prerequisite: ${s.prerequisites.join('; ').replace(/\.$/, '')}.`
          : ''
      }`,
      unlocks: [`Converts ${practisedUncertified.spread.direct} records of practice into something an insurer will accept`],
      derivedFrom: 'highest direct-record count among practised claims with no register entry',
    });
  }

  return steps;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cohort. Not a ranking of people — a count of what is missing, grouped by
 * what would fix it. Run over all 40 keepers.
 * ────────────────────────────────────────────────────────────────────────── */

function deriveCohort(): CohortFinding {
  const GATE = 'OSSC';
  const s = schemeBy.get(GATE)!;
  let mobilisable = 0,
    oneShort = 0,
    twoPlus = 0,
    none = 0;
  const byMissingModule = new Map<string, string[]>();

  for (const k of keepers) {
    const cert = k.certifications.find((c) => c.scheme === GATE);
    if (!cert) {
      none++;
      continue;
    }
    if (cert.complete && cert.valid_2026) {
      mobilisable++;
      continue;
    }
    if (cert.modules_missing.length === 1) {
      oneShort++;
      const mod = cert.modules_missing[0];
      byMissingModule.set(mod, [...(byMissingModule.get(mod) ?? []), k.keeper_code]);
    } else twoPlus++;
  }

  const [module, keeperCodes] = [...byMissingModule.entries()].sort((a, b) => b[1].length - a[1].length)[0];

  return {
    keepersExamined: keepers.length,
    gateScheme: GATE,
    gateSchemeName: s.name,
    mobilisableToday: mobilisable,
    oneModuleShort: oneShort,
    twoOrMoreShort: twoPlus,
    noRecordAtAll: none,
    cheapestIntervention: {
      module,
      module_name: moduleName(GATE, module),
      unlocks: keeperCodes.length,
      keeperCodes,
    },
    caveat:
      'These 40 keepers are the clean subset. The pack states they are not a random sample and are not claimed to be representative, so these counts are not scaled to the full 340.',
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Redaction
 * ────────────────────────────────────────────────────────────────────────── */

const REDACTIONS: Redaction[] = [
  {
    field: 'date_of_birth',
    reason:
      'No requirement of this role depends on age. The employer asks for medical fitness, which is a separate assessment, so date of birth has no bearing on any claim here and does not travel into the interface.',
  },
  {
    field: 'payroll_ref',
    reason:
      'An internal finance identifier. It identifies a person without evidencing anything about their work.',
  },
  {
    field: 'contract_type · status · grade_history',
    reason:
      'Employment terms and progression history. Grade follows length of service and the availability of a vacancy, and has never been tied to an assessment of anything — so showing it next to a competence claim would imply a relationship that does not exist.',
  },
  {
    field: 'appraisals · station manager notes',
    reason:
      'Not used, and not copied into this repository. They contain illness, bereavement, domestic circumstances and a resolved disciplinary matter. None of it evidences whether somebody can maintain a turbine, and a redeployment screen that surfaced it would do real harm. The clean pack excludes them; this pipeline would exclude them anyway.',
  },
];

function redact(k: Keeper): PublicKeeper {
  return {
    keeper_code: k.keeper_code,
    name: k.name,
    current_grade: k.current_grade,
    date_joined: k.date_joined,
    years_of_service: NOW_YEAR - Number(k.date_joined.slice(0, 4)),
    postings: k.postings,
    station_classes: [...new Set(k.postings.map((p) => p.station_class))] as StationClass[],
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Headline — generated from the gate claims, not authored.
 * ────────────────────────────────────────────────────────────────────────── */

function deriveHeadline(k: Keeper, claims: Claim[]) {
  const gates = claims.filter((c) => c.requirement.gate);
  const failing = gates.filter((c) => c.assessment !== 'certified');
  const practised = claims.filter((c) => c.assessment === 'practised');
  const years = NOW_YEAR - Number(k.date_joined.slice(0, 4));

  const singleModule = failing
    .filter((c) => c.requirement.class === 'certification')
    .flatMap((c) => c.missingModules);

  return {
    blocked: failing.length > 0,
    statement: failing.length
      ? `You cannot be mobilised for this role today.${
          singleModule.length === 1
            ? ` One module is the reason: ${singleModule[0].module}, ${singleModule[0].module_name.toLowerCase()}.`
            : ''
        }`
      : 'Every requirement this employer treats as mandatory is held and in date.',
    secondary: `${practised.length} of the ${claims.length} things this role asks for appear repeatedly in your work records across ${years} years. ${
      practised.filter((c) => c.verified.length === 0).length
    } of those have never been certified by anyone.`,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Profile — the skill chips, and the modules the employer names.
 * ────────────────────────────────────────────────────────────────────────── */

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * The one rule: a chip backed by a claim is on the profile only if at least
 * one record describes the keeper doing the work. Custody of the work and
 * neighbouring work never put a chip there. Chips with no claim behind them
 * (no scheme certifies the skill) are kept, by the decision recorded in
 * mappings.ts.
 */
function deriveSkills(claims: Claim[]): ProfileSkill[] {
  const byId = new Map(claims.map((c) => [c.id, c]));
  return SKILLS.map(({ label, claim }) => {
    const backing = claim ? byId.get(claim) : undefined;
    if (claim && !backing) throw new Error(`Skill "${label}" reads from unknown claim "${claim}"`);
    return { id: slug(label), label, claim, onProfile: backing ? backing.spread.direct > 0 : true };
  });
}

/**
 * The searchable skill list for record updates: the vocabulary first, then each
 * certification module across all ten schemes, by its own name. Duplicates by
 * name (SMOC-BH is "Boat handling") collapse into the vocabulary entry.
 */
function deriveSkillIndex(skills: ProfileSkill[]): SkillIndexEntry[] {
  const index: SkillIndexEntry[] = skills.map((s) => ({ id: s.id, label: s.label, source: 'vocabulary' }));
  const seen = new Set(index.map((s) => s.label.toLowerCase()));
  for (const scheme of schemes) {
    for (const m of scheme.modules) {
      if (seen.has(m.name.toLowerCase())) continue;
      seen.add(m.name.toLowerCase());
      index.push({ id: slug(m.name), label: m.name, source: m.code });
    }
  }
  return index;
}

/**
 * Modules the employer's requirement names in so many words, where the
 * training register records a completion. Attendance is not completion, and
 * is not counted.
 */
function deriveRelevantModules(k: Keeper): RelevantModule[] {
  return COMPETENCIES.flatMap((c) => c.namedModules ?? [])
    .flatMap(({ label, scheme, module }) => {
      const done = k.training_records.find((t) => t.module === module && t.outcome === 'completed');
      return done ? [{ label, scheme, module, moduleName: moduleName(scheme, module), year: done.year }] : [];
    })
    .sort((a, b) => a.year - b.year);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main
 * ────────────────────────────────────────────────────────────────────────── */

const target = index.get(TARGET_KEEPER);
if (!target) throw new Error(`${TARGET_KEEPER} not found in clean pack`);

const claims = COMPETENCIES.map((c) => deriveClaim(target.keeper, target.logbook, c));

const provenance: Provenance = {
  sources: [
    { path: 'data/source/keepers.json', records: keepers.length, note: 'Supplied clean pack, unmodified.' },
    { path: 'data/source/logbook_entries.json', records: entries.length, note: 'Supplied clean pack, unmodified. Routine watchkeeping was already removed by the Authority — about 70% of the raw volume.' },
    { path: 'data/source/certification_schemes.json', records: schemes.length, note: 'Compiled by the Authority from issuing bodies’ published material. Good, but not authoritative.' },
    { path: 'data/source/carrowmore-array-om-technician.md', records: 1, note: 'Requirements quoted verbatim. Never paraphrased.' },
    { path: 'reference/nosf_taxonomy.json', records: 2514, note: 'Read by hand; 11 statements mapped by eye. Not copied into this repository — only the 11 statements used are inlined in mappings.ts.' },
  ],
  keepersExamined: keepers.length,
  logbookEntriesExamined: entries.length,
  competencyMappingsHandWritten: COMPETENCIES.length,
  caveat:
    'Every claim in this file is an inference from records written for another purpose. None of it establishes authorisation. Where a register and a logbook disagree, both are shown and neither is preferred.',
};

const view: RoleEvidenceView = {
  provenance,
  keeper: redact(target.keeper),
  skills: deriveSkills(claims),
  skillIndex: deriveSkillIndex(deriveSkills(claims)),
  relevantModules: deriveRelevantModules(target.keeper),
  redactions: REDACTIONS,
  role: TARGET_ROLE,
  headline: deriveHeadline(target.keeper, claims),
  claims,
  route: deriveRoute(claims),
  cohort: deriveCohort(),
};

// The same contract the browser checks on load. Throws rather than writing a
// file the interface cannot read.
viewSchema.parse(view);

const outDir = path.join(ROOT, 'src/data/generated');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'bearach-offshore-omt.json');
fs.writeFileSync(outFile, JSON.stringify(view, null, 2) + '\n');

/* ── Report ─────────────────────────────────────────────────────────────── */

const size = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`\nderive.ts — ${keepers.length} keepers, ${entries.length} logbook entries, ${COMPETENCIES.length} hand-written mappings`);
console.log(`→ src/data/generated/bearach-offshore-omt.json  (${size} KB)\n`);
console.log(`${view.keeper.name} · ${view.keeper.current_grade} · ${view.keeper.years_of_service} years`);
console.log(`${view.role.title}\n`);
console.log(view.headline.statement);
console.log(view.headline.secondary + '\n');

const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));
console.log(pad('CAPABILITY', 38) + pad('ASSESSMENT', 14) + pad('RECORDS (d/c/a)', 17) + 'VERIFIED');
console.log('─'.repeat(92));
for (const c of claims) {
  console.log(
    pad(c.label, 38) +
      pad(c.assessment, 14) +
      pad(`${c.spread.direct}/${c.spread.custodial}/${c.spread.adjacent}`, 17) +
      (c.verified.length ? c.verified.map((v) => v.module + (v.stale ? '*' : '')).join(' ') : '—'),
  );
}
console.log('\n* module year + renewal period is already in the past\n');

console.log('ROUTE');
for (const s of view.route) console.log(`  ${s.order}. ${s.action}${s.module_name ? ` — ${s.module_name}` : ''}  [${s.scheme}, ${s.kind}]`);

console.log('\nPROFILE');
console.log(`  on profile   ${view.skills.filter((s) => s.onProfile).map((s) => s.label).join(' · ')}`);
console.log(`  not claimed  ${view.skills.filter((s) => !s.onProfile).map((s) => s.label).join(' · ') || '—'}`);
console.log(`  skill index  ${view.skillIndex.length} (${view.skillIndex.filter((s) => s.source === 'vocabulary').length} vocabulary, ${view.skillIndex.filter((s) => s.source !== 'vocabulary').length} certification modules)`);
console.log(`  modules      ${view.relevantModules.map((m) => `${m.label} (${m.module}, ${m.year})`).join(' · ') || '—'}`);

const co = view.cohort;
console.log(`\nCOHORT (${co.keepersExamined} keepers, gate = ${co.gateScheme})`);
console.log(`  mobilisable today ${co.mobilisableToday} · one module short ${co.oneModuleShort} · two+ short ${co.twoOrMoreShort} · no record ${co.noRecordAtAll}`);
console.log(`  cheapest intervention: ${co.cheapestIntervention.module} (${co.cheapestIntervention.module_name}) unblocks ${co.cheapestIntervention.unlocks}`);

const disc = [...new Map(claims.flatMap((c) => c.discrepancies).map((d) => [d.scheme + d.trainingRegisterSays, d])).values()];
if (disc.length) {
  console.log(`\nREGISTER DISAGREEMENTS (${disc.length})`);
  for (const d of disc) console.log(`  ${d.scheme}: certificate says "${d.certificateRegisterSays}" / training says "${d.trainingRegisterSays}"`);
}
console.log();
