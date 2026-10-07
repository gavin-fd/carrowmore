/**
 * Domain model for evidence-backed competence claims.
 *
 * The governing rule of this file, and of the product built on it:
 *
 *   The system makes claims about RECORDS, never about PEOPLE.
 *
 * "Eleven work records describe X" is a verifiable statement about a register.
 * "This person is competent at X" is not, and nothing here is allowed to say it.
 * "This person is authorised to do X" can only be said by an issuing body, and
 * is represented here only by reproducing what that body's register holds.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * 1. Source records — the shape of the supplied clean pack, unaltered.
 * ────────────────────────────────────────────────────────────────────────── */

export type SourceEra = 1 | 2 | 3;
export type StationClass = 'rock' | 'island' | 'shore';

export interface LogbookEntry {
  entry_id: string;
  date: string;
  keeper_code: string;
  station_code: string;
  station: string;
  station_class: StationClass;
  source_era: SourceEra;
  /** Pointer back into the raw archive, e.g. `raw/logbooks/era1-ocr/naomhog-1985.txt#L37` */
  source_record: string;
  hours: number;
  text: string;
}

export interface TrainingRecord {
  scheme: string;
  module: string;
  module_name: string;
  year: number;
  /**
   * The pack distinguishes these, and we must too. Vendor A could not
   * distinguish attendance from completion before 2011; where the record says
   * `attended`, nobody ever wrote down that the person passed.
   */
  outcome: 'completed' | 'attended';
}

export interface CertificationRecord {
  scheme: string;
  modules_held: string[];
  modules_missing: string[];
  complete: boolean;
  awarded_year: number;
  expires_year: number | null;
  /** The pack's own computed field: complete AND unexpired. True for 23 of 191. */
  valid_2026: boolean;
}

export interface Posting {
  station_code: string;
  station: string;
  station_class: StationClass;
  from_year: number;
  to_year: number;
}

export interface Keeper {
  keeper_code: string;
  name: string;
  name_ascii: string;
  payroll_ref: string;
  date_of_birth: string;
  date_joined: string;
  date_left: string | null;
  status: string;
  contract_type: string;
  current_grade: string;
  grade_history: { from_year: number; grade: string }[];
  postings: Posting[];
  training_records: TrainingRecord[];
  certifications: CertificationRecord[];
}

export interface Scheme {
  code: string;
  name: string;
  issuing_body: string;
  renewal_years: number | null;
  modules: { code: string; name: string }[];
  prerequisites: string[];
  notes: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Privacy — fields that exist in the source and must not reach the client.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Forty years of records about a person contain things irrelevant to whether
 * they can maintain a turbine. The test applied here is narrow and stated out
 * loud: a field survives into the view model only if some requirement of the
 * target role depends on it. Nothing else gets to travel.
 *
 * The withheld list ships WITH the artifact, so the interface can show that
 * something was withheld and why, rather than silently omitting it.
 */
export interface Redaction {
  field: string;
  reason: string;
}

/** The keeper, after redaction. This is the only keeper shape the UI ever sees. */
export interface PublicKeeper {
  keeper_code: string;
  name: string;
  current_grade: string;
  date_joined: string;
  years_of_service: number;
  postings: Posting[];
  station_classes: StationClass[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3. Evidence
 * ────────────────────────────────────────────────────────────────────────── */

export type EvidenceClass =
  | 'work-record'
  | 'training-completed'
  | 'training-attended'
  | 'certification-valid'
  | 'certification-incomplete';

/** What the employer is actually asking for. Determines what can rebut it. */
export type RequirementClass =
  | 'certification' // a ticket from an issuing body
  | 'experience' // demonstrated practice
  | 'declaration'; // a medical or self declaration

/**
 * How a logbook entry relates to the requirement it matched.
 *
 * This distinction is the difference between an honest system and a flattering
 * one. "Held the keys for the HV work" matches a high-voltage pattern, but the
 * person doing the switching was a contractor. The match is real; the inference
 * it invites is wrong.
 */
export type SignalKind =
  /** The record describes the person doing the thing the requirement names. */
  | 'direct'
  /** The record places the person in custody or administration of the thing. */
  | 'custodial'
  /** The record describes neighbouring work that is not the thing. */
  | 'adjacent';

export interface Signal {
  kind: SignalKind;
  pattern: RegExp;
  /** Why this pattern was chosen. Hand-written, and visible in the UI. */
  note?: string;
}

export interface MatchedEntry {
  entry_id: string;
  date: string;
  station: string;
  station_code: string;
  station_class: StationClass;
  text: string;
  source_record: string;
  source_era: SourceEra;
  signal: SignalKind;
  /** The literal substring that caused this record to be cited. */
  matched: string;
}

export interface EvidenceSpread {
  records: number;
  direct: number;
  custodial: number;
  adjacent: number;
  firstDate: string | null;
  lastDate: string | null;
  distinctYears: number;
  yearsSpanned: number;
  stations: string[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4. Assessment
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Six states. Not a scale, and deliberately not orderable — there is no
 * arithmetic you can do on these, which is the point. A composite score would
 * require ranking them, and ranking them would require pretending that
 * "practised" and "certified" are measured in the same unit.
 */
export type Assessment =
  /** A register says so, and says it is current. */
  | 'certified'
  /** Work records describe the person doing this, repeatedly, over years. No certificate. */
  | 'practised'
  /** Records describe neighbouring work, or custody of the work, but not the work. */
  | 'adjacent'
  /** Some records, too few or too narrow to carry a claim. */
  | 'thin'
  /** Required by the employer, absent from every register, and blocking. */
  | 'gate-missing'
  /** We hold nothing at all. This is a gap in the Authority's records, not in the person. */
  | 'no-record';

export interface Discrepancy {
  scheme: string;
  certificateRegisterSays: string;
  trainingRegisterSays: string;
}

export interface MissingModule {
  scheme: string;
  module: string;
  module_name: string;
}

/**
 * A register-backed fact at MODULE level.
 *
 * This distinction carries the whole verified-versus-inferred separation.
 * A module is a fact: a register says this person completed this thing in this
 * year. A certificate is a different fact: every module in the scheme is held
 * and the scheme is in date. Someone can have four verified modules and no
 * certificate, which is precisely Bearach's position on the one thing this
 * employer mandates — so the interface has to be able to show both at once
 * without letting the first be mistaken for the second.
 */
export interface VerifiedModule {
  scheme: string;
  schemeName: string;
  module: string;
  module_name: string;
  year: number | null;
  outcome: 'completed' | 'attended' | null;
  /** Whether the parent scheme is complete and in date. Usually false. */
  schemeIsCertificate: boolean;
  /** Module year + renewal period is in the past. */
  stale: boolean;
  staleNote?: string;
}

/**
 * Direct records written the same way, however many times they recur — the
 * honest counting unit. `label` is the earliest record's text.
 */
export interface KindOfWork {
  label: string;
  /** Matching records, oldest first. Ids into `Claim.entries`. */
  entryIds: string[];
}

/** The figures behind "10 kinds of work · 47 occasions · 2004–2026 · 5 stations". Direct records only. */
export interface EvidenceSummary {
  kinds: number;
  occasions: number;
  firstYear: number | null;
  lastYear: number | null;
  stations: number;
}

export interface Claim {
  id: string;
  label: string;

  requirement: {
    /** The employer's own words, quoted. Never paraphrased into framework language. */
    text: string;
    source: string;
    class: RequirementClass;
    essential: boolean;
    /** True where the employer states this blocks mobilisation outright. */
    gate: boolean;
  };

  assessment: Assessment;
  /** Machine-generated from the rule that fired. Not authored per claim. */
  reason: string;

  spread: EvidenceSpread;
  entries: MatchedEntry[];
  /** Direct records grouped by phrasing, most frequent first. */
  kinds: KindOfWork[];
  summary: EvidenceSummary;
  training: TrainingRecord[];
  certifications: CertificationRecord[];
  /** Module-level register facts. The "formally verified" column. */
  verified: VerifiedModule[];
  missingModules: MissingModule[];

  /** Plain-language account of the patterns used, carried over from the mapping. */
  searchedFor: string;

  /** Derived from (evidence class × requirement class). One table, applied everywhere. */
  limitations: string[];
  /** What was searched for and not found. A first-class finding, not an omission. */
  absence: string[];
  discrepancies: Discrepancy[];

  /** Framework statement this maps onto, where one exists. */
  nosf?: { id: string; statement: string };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5. Route and cohort
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * How a step is taken. Assigned per derivation rule in mappings.ts, never per
 * step, so the interface can say "2 assessments and 1 course" without anyone
 * having written that sentence.
 */
export type RouteStepKind = 'assessment' | 'course';

export interface RouteStep {
  order: number;
  action: string;
  kind: RouteStepKind;
  scheme: string;
  module?: string;
  module_name?: string;
  /** Why this step, in the employer's or issuing body's own terms. */
  because: string;
  unlocks: string[];
  /** Which derivation rule produced this step. */
  derivedFrom: string;
}

/**
 * The cohort finding. Not a ranking of people — a count of what is missing,
 * grouped by what would fix it. Derived over all 40 keepers in the clean pack
 * so that the pipeline is demonstrably general, not fitted to one person.
 */
export interface CohortFinding {
  keepersExamined: number;
  gateScheme: string;
  gateSchemeName: string;
  mobilisableToday: number;
  oneModuleShort: number;
  twoOrMoreShort: number;
  noRecordAtAll: number;
  /** The single cheapest intervention, by number of people it unblocks. */
  cheapestIntervention: {
    module: string;
    module_name: string;
    unlocks: number;
    keeperCodes: string[];
  };
  caveat: string;
}

/**
 * Deliberately carries no timestamp. The output is a pure function of the
 * inputs, so re-running derive.ts over unchanged data produces no diff.
 */
export interface Provenance {
  sources: { path: string; records: number; note: string }[];
  keepersExamined: number;
  logbookEntriesExamined: number;
  competencyMappingsHandWritten: number;
  caveat: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6. Profile — what the keeper sees named on their own profile.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A chip in the keeper-facing vocabulary. The label is hand-written
 * (mappings.ts); whether it appears is derived from the claim behind it.
 */
export interface ProfileSkill {
  id: string;
  label: string;
  /** The claim this chip reads its evidence from. Null where no scheme certifies the skill at all. */
  claim: string | null;
  /**
   * False where the claim behind the chip has no direct record — only custody
   * of the work or neighbouring work. The chip stays in the vocabulary and off
   * the profile, because showing it would be the system asserting something it
   * has nothing for.
   */
  onProfile: boolean;
}

/**
 * A module the employer's own requirement names, which the training register
 * records as completed. A module is not a certificate: these can all be held
 * while the scheme they belong to is incomplete, which is Bearach's position.
 */
export interface RelevantModule {
  /** The employer's word for it, e.g. "Fire". */
  label: string;
  scheme: string;
  module: string;
  moduleName: string;
  /** Year the training register records it completed. */
  year: number;
}

/**
 * A skill a keeper can name when asking for their record to be updated: the
 * profile vocabulary, then every certification module in the pack by its own
 * name. Nothing about the keeper is inferred from this list.
 */
export interface SkillIndexEntry {
  id: string;
  label: string;
  /** "vocabulary", or the module code the name comes from, e.g. "SMOC-NV". */
  source: string;
}

export interface RoleEvidenceView {
  provenance: Provenance;
  keeper: PublicKeeper;
  skills: ProfileSkill[];
  skillIndex: SkillIndexEntry[];
  relevantModules: RelevantModule[];
  redactions: Redaction[];
  role: {
    title: string;
    employer: string;
    pattern: string;
    source: string;
  };
  headline: {
    blocked: boolean;
    /** Generated from the gate claims, not authored. */
    statement: string;
    secondary: string;
  };
  claims: Claim[];
  route: RouteStep[];
  cohort: CohortFinding;
}
