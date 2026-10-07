/**
 * HAND-WRITTEN. This is the only file in the pipeline containing human judgement.
 *
 * Everything downstream of here is deterministic: derive.ts applies these rules
 * and does not add opinions of its own. Everything upstream is the supplied
 * clean pack, unmodified. So if you want to argue with a claim this product
 * makes, this is the file to argue with — which is the point of keeping it
 * separate, small, and readable.
 *
 * Six things are hand-mapped:
 *
 *   1. The employer's requirements, quoted verbatim from their posting. Never
 *      paraphrased into framework language, because the gap between how the
 *      employer writes and how the framework writes is half the problem.
 *
 *   2. A NOSF statement for each, taken from reference/nosf_taxonomy.json by
 *      reading it. No automated matching — 2,514 statements and eleven
 *      mappings, done by eye in about twenty minutes.
 *
 *   3. Text patterns over logbook prose, each tagged with how it relates to the
 *      requirement and a note saying why it was chosen.
 *
 *   4. The modules the employer's certificate requirement names, word by word.
 *
 *   5. The keeper-facing skill vocabulary — the chips — and which claim each
 *      one reads its evidence from.
 *
 *   6. How each kind of route step is taken: an assessment or a course.
 *
 * The signal tagging is the load-bearing decision. A pattern can match a record
 * without that record evidencing the requirement:
 *
 *     "Held the keys for the HV work, PTW 46 refers."
 *
 * matches high-voltage patterns, and the person doing the switching was a
 * contractor. Tagging that `custodial` rather than `direct` is what stops the
 * system turning key custody into switching competence.
 */

import type { RequirementClass, RouteStepKind, Signal } from '../src/domain/types.ts';

export interface Competency {
  id: string;
  label: string;
  group: 'gate' | 'essential' | 'day-to-day' | 'desirable';

  /** The employer's own words. */
  requirement: string;
  requirementSource: string;
  requirementClass: RequirementClass;
  essential: boolean;
  /** The employer states in terms that this blocks mobilisation. */
  gate: boolean;

  nosf?: { id: string; statement: string };

  /** Schemes/modules that would formally evidence this, if held. */
  evidencedBy: { scheme: string; modules: string[] }[];
  /** Modules the employer mandates outright. Absence here produces a gate. */
  mandates?: { scheme: string; modules: 'all' | string[] };
  /**
   * Where the requirement names its parts in so many words, each part in the
   * employer's word, mapped to the module that would evidence it.
   */
  namedModules?: { label: string; scheme: string; module: string }[];

  signals: Signal[];
  /** Plain-language description of what the patterns were looking for. */
  searchedFor: string;
}

const OM = 'Carrowmore Array · Wind Turbine Technician (O&M) posting';

export const TARGET_ROLE = {
  title: 'Wind Turbine Technician (Operations & Maintenance)',
  employer: 'Carrowmore Array Offshore Wind Farm',
  pattern: '14 days on / 14 days off, based on the service operations vessel',
  source: 'data/source/carrowmore-array-om-technician.md',
};

export const COMPETENCIES: Competency[] = [
  /* ───────────────────────────── gates ───────────────────────────── */
  {
    id: 'offshore-safety-survival',
    label: 'Offshore safety and survival certificate',
    group: 'gate',
    requirement:
      'A valid offshore safety and survival certificate covering sea survival, fire, first aid and working at height. We will pay for renewals but we cannot mobilise you without one.',
    requirementSource: `${OM}, "What we need from you — Essential"`,
    requirementClass: 'certification',
    essential: true,
    gate: true,
    nosf: {
      id: 'NOSF-SAF-1511',
      statement:
        'Demonstrate the personal survival techniques applicable to abandonment in a marine environment.',
    },
    evidencedBy: [{ scheme: 'OSSC', modules: ['OSSC-SS', 'OSSC-FF', 'OSSC-FA', 'OSSC-HL', 'OSSC-CS'] }],
    mandates: { scheme: 'OSSC', modules: 'all' },
    // "…covering sea survival, fire, first aid and working at height." The
    // posting puts height inside the safety certificate; the schemes give it a
    // scheme of its own, so the fourth part maps to WAHS rather than OSSC.
    namedModules: [
      { label: 'Sea Survival', scheme: 'OSSC', module: 'OSSC-SS' },
      { label: 'Fire', scheme: 'OSSC', module: 'OSSC-FF' },
      { label: 'First Aid', scheme: 'OSSC', module: 'OSSC-FA' },
      { label: 'Working at Height', scheme: 'WAHS', module: 'WAHS-1' },
    ],
    signals: [
      { kind: 'adjacent', pattern: /\bfire drill\b/i, note: 'Station fire drills are not the certificated fire module.' },
      { kind: 'adjacent', pattern: /\blifejacket|liferaft|survival suit\b/i, note: 'Equipment checks, not assessed survival training.' },
    ],
    searchedFor:
      'Logbook references to survival equipment and drills. These can only ever be adjacent: the requirement is a certificate, and no logbook entry can produce one.',
  },
  {
    id: 'offshore-medical',
    label: 'Offshore medical fitness',
    group: 'gate',
    requirement: 'Offshore medical fitness.',
    requirementSource: `${OM}, "What we need from you — Essential"`,
    requirementClass: 'declaration',
    essential: true,
    gate: true,
    evidencedBy: [],
    signals: [],
    searchedFor:
      'Nothing. The Authority holds no medical data in any file in this pack, so there was nothing to search. This is a gap in the Authority’s records, not in the keeper.',
  },

  /* ─────────────────────────── essential ─────────────────────────── */
  {
    id: 'work-at-height',
    label: 'Working at height',
    group: 'essential',
    requirement:
      'Climb an 80m tower several times a day and work from the nacelle roof and inside the hub. Comfortable working at height — this is not negotiable and it is the most common reason people do not last.',
    requirementSource: `${OM}, "What the job actually is" and "Essential"`,
    requirementClass: 'experience',
    essential: true,
    gate: false,
    nosf: {
      id: 'NOSF-SAF-1505',
      statement:
        'Undertake work at height using fall protection systems appropriate to the task and to the structure.',
    },
    evidencedBy: [{ scheme: 'WAHS', modules: ['WAHS-1', 'WAHS-2', 'WAHS-3'] }],
    signals: [
      { kind: 'direct', pattern: /fall arrest/i, note: 'Fall arrest is a height safety system; setting one up is the work itself.' },
      { kind: 'direct', pattern: /harness/i, note: 'Harness use places the keeper in a fall-risk position.' },
      { kind: 'direct', pattern: /staging/i, note: 'Staging is suspended or supported work platform around the lantern.' },
      { kind: 'direct', pattern: /tied back at \d+ ?points?/i, note: 'Describes anchoring a platform — direct height-safety practice.' },
      { kind: 'direct', pattern: /up the ladder/i },
      { kind: 'direct', pattern: /vertical ladder/i },
      { kind: 'direct', pattern: /anchor points?/i },
      { kind: 'direct', pattern: /\baloft\b/i },
      { kind: 'adjacent', pattern: /\bgallery\b/i, note: 'The gallery is the external walkway below the lantern. Being there is at height; some gallery entries are electrical work that happens to be located there.' },
      { kind: 'adjacent', pattern: /\blantern\b/i, note: 'The lantern room is at the top of the tower, but lantern work is not always height work.' },
    ],
    searchedFor:
      'Ten patterns across 22 years of prose: fall arrest, harness, staging, anchor points, ladders, and the word aloft.',
  },
  {
    id: 'tower-rescue',
    label: 'Rescuing a colleague from height',
    group: 'essential',
    requirement: 'Rescue a colleague from the tower if it comes to it.',
    requirementSource: `${OM}, "What the job actually is"`,
    requirementClass: 'experience',
    essential: true,
    gate: false,
    nosf: {
      id: 'NOSF-SAF-1508',
      statement: 'Effect the recovery of a suspended operative from a rope access system.',
    },
    evidencedBy: [{ scheme: 'WAHS', modules: ['WAHS-4'] }],
    signals: [
      { kind: 'direct', pattern: /rescue/i },
      { kind: 'direct', pattern: /recover(ed|y)? (of )?(a |an )?(casualt|operative|man|person)/i },
      { kind: 'direct', pattern: /lowered (him|her|the)/i },
      { kind: 'adjacent', pattern: /casualt/i, note: 'Casualty care at ground level is not recovery from height.' },
      { kind: 'adjacent', pattern: /stretcher/i },
    ],
    searchedFor:
      'Five patterns for rescue and casualty recovery. Deliberately kept separate from working at height: 69 records of climbing a tower safely do not evidence getting someone else down from one, and letting the strong neighbour carry this claim would be the easiest dishonesty available.',
  },
  {
    id: 'enclosed-space',
    label: 'Working in enclosed spaces',
    group: 'essential',
    requirement: 'Comfortable working at height, in enclosed spaces, and on a small boat in a swell.',
    requirementSource: `${OM}, "What we need from you — Essential"`,
    requirementClass: 'experience',
    essential: true,
    gate: false,
    nosf: {
      id: 'NOSF-SAF-1509',
      statement:
        'Enter and work within enclosed or restricted spaces under a regime of atmospheric monitoring and continuous attendance.',
    },
    evidencedBy: [{ scheme: 'OSSC', modules: ['OSSC-CS'] }],
    signals: [
      { kind: 'direct', pattern: /confined/i },
      { kind: 'direct', pattern: /\btank\b/i, note: 'Entry into fuel and water tanks is enclosed-space work.' },
      { kind: 'direct', pattern: /\bsump\b/i },
      { kind: 'direct', pattern: /\bvoid\b/i },
      { kind: 'direct', pattern: /manhole/i },
      { kind: 'direct', pattern: /cistern/i },
      { kind: 'direct', pattern: /gas ?test|atmospher/i },
    ],
    searchedFor: 'Seven patterns: confined, tank, sump, void, manhole, cistern, and gas testing.',
  },
  {
    id: 'plant-maintenance',
    label: 'Maintaining plant you were responsible for',
    group: 'essential',
    requirement:
      'Hands-on mechanical or electrical maintenance experience on plant you were responsible for. We do not mind what kind of plant. [Delighted by] anyone who has maintained generating plant in a place where the nearest spare part was a boat ride away.',
    requirementSource: `${OM}, "Essential" and "We would be delighted by"`,
    requirementClass: 'experience',
    essential: true,
    gate: false,
    nosf: {
      id: 'NOSF-ENR-0536',
      statement:
        'Configure and verify the automatic starting, synchronising and load-sharing arrangements of prime mover installations.',
    },
    evidencedBy: [
      { scheme: 'MPMC', modules: ['MPMC-A', 'MPMC-B', 'MPMC-C', 'MPMC-D'] },
      { scheme: 'MECS', modules: ['MECS-2'] },
    ],
    signals: [
      { kind: 'direct', pattern: /injector/i, note: 'Injector work is compression-ignition prime mover maintenance.' },
      { kind: 'direct', pattern: /\bAVR\b/i, note: 'Automatic voltage regulator — generator control.' },
      { kind: 'direct', pattern: /load-shar/i },
      { kind: 'direct', pattern: /set the timing/i },
      { kind: 'direct', pattern: /exhaust temps?/i },
      { kind: 'direct', pattern: /pop-test/i },
      { kind: 'direct', pattern: /overhaul/i },
      { kind: 'direct', pattern: /\bgovernor\b/i },
      { kind: 'direct', pattern: /no\.? ?\d (set|engine)/i },
      { kind: 'direct', pattern: /\bpump was refitted|refitted\b/i },
      // Also a first-pass miss: "Bottom-end knock on no 2, dropped the sump and found
      // big-end shells scored" is as close to compression-ignition prime mover work as
      // this archive gets, and no pattern caught it.
      { kind: 'direct', pattern: /bottom-end|big-end|dropped the sump|shells scored/i, note: 'Bearing failure diagnosis and strip-down on a diesel prime mover.' },
    ],
    searchedFor:
      'Eleven patterns for generating plant: injectors, AVRs, load sharing, timing, exhaust temperatures, pop testing, overhauls, governors, bottom-end strip-downs.',
  },

  /* ─────────────────────────── day to day ────────────────────────── */
  {
    id: 'electrical-fault-diagnosis',
    label: 'Diagnosing electrical faults',
    group: 'day-to-day',
    requirement:
      'Diagnose faults on 690V and 33kV systems up to the point of isolation. [Delighted by] fault-finding on electrical systems without a laptop telling you the answer.',
    requirementSource: `${OM}, "What the job actually is" and "We would be delighted by"`,
    requirementClass: 'experience',
    essential: false,
    gate: false,
    nosf: {
      id: 'NOSF-ENR-0538',
      statement:
        'Determine the location and nature of departures from normal function in electrical installations by systematic diagnostic method.',
    },
    evidencedBy: [{ scheme: 'MECS', modules: ['MECS-1', 'MECS-3', 'MECS-5'] }],
    signals: [
      { kind: 'direct', pattern: /megger/i, note: 'Insulation resistance testing.' },
      { kind: 'direct', pattern: /insulation test|continuity/i },
      { kind: 'direct', pattern: /halving the circuit/i, note: 'Textbook systematic bisection — the framework calls this "systematic diagnostic method".' },
      // First pass was /traced? (an?|the)/, which missed "Alarm bell sounding, traced
      // to a loose wire" — a real diagnostic record lost to a preposition. Widened.
      { kind: 'direct', pattern: /traced?\s+(it\s+)?(back\s+)?(to|an?|the)\s/i },
      { kind: 'direct', pattern: /earth fault/i },
      { kind: 'direct', pattern: /worked the fault down/i },
      { kind: 'direct', pattern: /condemned/i },
      { kind: 'direct', pattern: /intermittent/i },
      { kind: 'direct', pattern: /found (the|it) (fault|fuse|in)/i },
      { kind: 'adjacent', pattern: /reset tripped breaker/i, note: 'Resetting a breaker is not diagnosis.' },
    ],
    searchedFor:
      'Nine diagnostic patterns plus one deliberately-adjacent pattern (resetting a breaker), so that routine resets do not inflate the count.',
  },
  {
    id: 'hv-render-safe',
    label: 'Making high-voltage apparatus safe',
    group: 'day-to-day',
    requirement: 'Diagnose faults on 690V and 33kV systems up to the point of isolation.',
    requirementSource: `${OM}, "What the job actually is"`,
    requirementClass: 'experience',
    essential: false,
    gate: false,
    nosf: {
      id: 'NOSF-ENR-0532',
      statement:
        'Undertake operations to render high voltage apparatus safe from the system, including the application of protective conductive connections, within the limits of a written authorisation.',
    },
    evidencedBy: [{ scheme: 'HVAP', modules: ['HVAP-01', 'HVAP-02'] }],
    signals: [
      { kind: 'direct', pattern: /removed earths|applied earths/i, note: 'Applying or removing circuit main earths is the operation itself.' },
      { kind: 'direct', pattern: /de-isolated|isolated no\.? ?\d/i },
      { kind: 'direct', pattern: /proving dead|proved dead/i },
      { kind: 'custodial', pattern: /held the keys|keys signed back|key safe/i, note: 'Key custody means the keeper controlled access. It does not mean the keeper operated the apparatus.' },
      { kind: 'custodial', pattern: /HV room locked/i, note: 'Locking the room is custody, not switching.' },
    ],
    searchedFor:
      'Three patterns for the switching operation itself, and two for key custody — tagged separately so that custody cannot be read as operation. The framework statement itself ends "within the limits of a written authorisation", which is the distinction this role turns on.',
  },
  {
    id: 'hv-safety-documentation',
    label: 'Working to a permit system',
    group: 'day-to-day',
    requirement: 'Experience of working to a permit system.',
    requirementSource: `${OM}, "We would be delighted by"`,
    requirementClass: 'experience',
    essential: false,
    gate: false,
    nosf: {
      id: 'NOSF-ENR-0533',
      statement: 'Prepare, issue and cancel safety documentation governing access to high voltage apparatus.',
    },
    evidencedBy: [{ scheme: 'HVAP', modules: ['HVAP-03'] }],
    signals: [
      { kind: 'direct', pattern: /permit (returned|cancelled|issued)/i, note: 'Issuing and cancelling safety documents is exactly what the framework statement describes.' },
      { kind: 'direct', pattern: /\bPTW\b/i, note: 'Permit to work, referenced by number.' },
      { kind: 'direct', pattern: /held the keys|keys signed back/i, note: 'Under a permit regime, key custody IS the control measure — so here the same records that cannot evidence switching do evidence permit discipline.' },
      { kind: 'direct', pattern: /contractor cleared|signed back in/i },
    ],
    searchedFor:
      'Four patterns for permit administration. Note that two of these patterns also appear under "making high-voltage apparatus safe", tagged custodial there and direct here. The same records support one claim and not the other.',
  },
  {
    id: 'vessel-transfer',
    label: 'Transferring from a moving vessel',
    group: 'day-to-day',
    requirement:
      'Transfer from a moving vessel to a fixed ladder in up to 1.5m significant wave height.',
    requirementSource: `${OM}, "What the job actually is"`,
    requirementClass: 'experience',
    essential: false,
    gate: false,
    nosf: {
      id: 'NOSF-MAR-0009',
      statement:
        'Effect the transfer of personnel and materials to and from an isolated installation in adverse sea conditions.',
    },
    evidencedBy: [{ scheme: 'SMOC', modules: ['SMOC-BH', 'SMOC-MO'] }],
    signals: [
      { kind: 'direct', pattern: /transfer(red)?.{0,30}(under way|moving|alongside)/i },
      { kind: 'direct', pattern: /jumped (for|to) the ladder/i },
      { kind: 'adjacent', pattern: /\blanding\b/i, note: 'A lighthouse landing is a fixed set of steps approached by small boat. Related, but the boat is usually made fast, not under way.' },
      { kind: 'adjacent', pattern: /\brelief\b/i, note: 'Relief is the crew changeover; it implies a boat trip but describes none of the transfer.' },
      { kind: 'adjacent', pattern: /\bslipway|winch|hauled up stores\b/i, note: 'Materials handling at the landing, not personnel transfer.' },
      { kind: 'adjacent', pattern: /\bswell\b/i },
    ],
    searchedFor:
      'Two patterns for transfer from a vessel under way, and four for the adjacent work — landings, reliefs, slipways, stores. The distinction matters because a lighthouse landing and a turbine boat-transfer are different operations that use the same vocabulary.',
  },

  /* ─────────────────────────── desirable ─────────────────────────── */
  {
    id: 'instructing-others',
    label: 'Training and looking after colleagues',
    group: 'desirable',
    requirement: 'People who have trained and looked after younger colleagues.',
    requirementSource: `${OM}, "We would be delighted by"`,
    requirementClass: 'experience',
    essential: false,
    gate: false,
    nosf: {
      id: 'NOSF-SAF-1506',
      statement:
        'Prepare a method statement for work at height and communicate its provisions to those undertaking the work.',
    },
    evidencedBy: [],
    signals: [
      { kind: 'direct', pattern: /wrote the method/i, note: 'Preparing a method statement, in the framework’s exact words.' },
      { kind: 'direct', pattern: /briefed the (party|crew|hands)/i, note: '"Communicate its provisions to those undertaking the work."' },
      { kind: 'direct', pattern: /supernumerary/i, note: 'A supernumerary keeper is a trainee.' },
      { kind: 'direct', pattern: /showed (him|her|them)/i },
      { kind: 'adjacent', pattern: /\btrained\b/i, note: 'Ambiguous: the keeper may be the trainer or the trainee.' },
    ],
    searchedFor:
      'Five patterns for instructing others. This is the clearest policy-to-prose match in the whole mapping: NOSF-SAF-1506 says "prepare a method statement for work at height and communicate its provisions to those undertaking the work", and the logbook says "wrote the method for the tower repaint and briefed the party before we started".',
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Limitation rules — derived, not authored per claim.
 *
 * Every limitation shown in the interface comes from this table, keyed on what
 * kind of evidence was found against what kind of thing the employer asked for.
 * Writing these per-claim would make them persuasive prose; deriving them makes
 * them consistent, including where consistency is unflattering to the keeper
 * and where it is unflattering to the certificate.
 * ────────────────────────────────────────────────────────────────────────── */

export const LIMITATION_RULES: {
  evidence: import('../src/domain/types.ts').EvidenceClass;
  requirement: RequirementClass;
  say: string;
}[] = [
  {
    evidence: 'work-record',
    requirement: 'certification',
    say: 'Work records cannot establish certification. Only the issuing body can do that.',
  },
  {
    evidence: 'work-record',
    requirement: 'declaration',
    say: 'Work records cannot substitute for a medical declaration.',
  },
  {
    evidence: 'work-record',
    requirement: 'experience',
    say: 'Work records describe what somebody wrote down at the time, not everything that was done.',
  },
  {
    evidence: 'training-attended',
    requirement: 'certification',
    say: 'Attendance was recorded. Completion was not. Before 2011 the Authority’s training system could not tell the difference.',
  },
  {
    evidence: 'training-completed',
    requirement: 'certification',
    say: 'A completed module is not a certificate until every module in the scheme is held.',
  },
  {
    evidence: 'certification-incomplete',
    requirement: 'certification',
    say: 'The scheme is incomplete, so no valid certificate exists under it.',
  },
  {
    evidence: 'certification-valid',
    requirement: 'experience',
    say: 'A certificate records an assessment on a single day. It is not a record of practice.',
  },
];

/**
 * The only numeric thresholds in the system, and the only place a judgement
 * gets expressed as a number.
 *
 * The spread matters more than the count: forty entries in one year at one
 * station is a project, not a practice. Anything that fails to clear this bar
 * is reported as `thin` rather than rounded up — there is deliberately no
 * middle grade to drift into, because a middle grade is where overclaiming
 * hides.
 */
export const PRACTISED_THRESHOLDS = {
  minDirectRecords: 10,
  minDistinctYears: 5,
  minStations: 2,
};

/* ────────────────────────────────────────────────────────────────────────────
 * The keeper-facing skill vocabulary.
 *
 * The chips on a profile, in display order, and the claim each one reads its
 * evidence from. Several chips can share a claim — "Diesel engines", "Pumps &
 * fluids" and "Planned maintenance" are all the plant-maintenance claim seen
 * from the keeper's side.
 *
 * Whether a chip appears is not written here. derive.ts shows a claim-backed
 * chip only if at least one record describes the keeper doing the work, so
 * "Boat handling" and "Tower rescue" are in the vocabulary and, for Bearach,
 * off the profile: everything found for them is neighbouring work.
 *
 * The last three have no certification scheme anywhere in the pack, so there
 * is no claim for them to read from. They stay in rather than being dropped. A
 * vocabulary built only from sellable modules can only describe people in the
 * language of what can be sold to them. See SKILL-MAP.md, "Skills no scheme
 * will certify".
 * ────────────────────────────────────────────────────────────────────────── */

export const SKILLS: { label: string; claim: string | null }[] = [
  { label: 'Diesel engines', claim: 'plant-maintenance' },
  { label: 'Pumps & fluids', claim: 'plant-maintenance' },
  { label: 'Planned maintenance', claim: 'plant-maintenance' },
  { label: 'Fall arrest', claim: 'work-at-height' },
  { label: 'Tower climbing', claim: 'work-at-height' },
  { label: 'Confined spaces', claim: 'enclosed-space' },
  { label: 'Permit issue', claim: 'hv-safety-documentation' },
  { label: 'Fault diagnosis', claim: 'electrical-fault-diagnosis' },
  { label: 'Isolation & earthing', claim: 'hv-render-safe' },
  { label: 'Boat handling', claim: 'vessel-transfer' },
  { label: 'Tower rescue', claim: 'tower-rescue' },
  { label: 'Instructing others', claim: 'instructing-others' },
  { label: 'Operational record-keeping', claim: null },
  { label: 'Lone working', claim: null },
  { label: 'Fault-finding without support', claim: null },
];

/* ────────────────────────────────────────────────────────────────────────────
 * How each kind of route step is taken.
 *
 * One value per derivation rule in deriveRoute(), never per step.
 *
 *   declaration           — the offshore medical is something you are
 *                           assessed for, not taught.
 *   missingModule         — a module the employer mandates and the register
 *                           does not hold is a course.
 *   uncertifiedPractice   — work the records already describe, repeatedly and
 *                           over years, with no scheme behind it. Fifty records
 *                           of height work is the case for being assessed
 *                           rather than taught from the beginning.
 * ────────────────────────────────────────────────────────────────────────── */

export const ROUTE_STEP_KIND: Record<'declaration' | 'missingModule' | 'uncertifiedPractice', RouteStepKind> = {
  declaration: 'assessment',
  missingModule: 'course',
  uncertifiedPractice: 'assessment',
};

/* ────────────────────────────────────────────────────────────────────────────
 * What counts as the same kind of work.
 *
 * Entries written the same way are one kind of work, however many times they
 * recur. "The same way" ignores which engine was meant (no.1, No.2, no 3), how
 * many anchor points were used, letter case and spacing — so "Set the timing on
 * no.1…" and "Set the timing on no.3…" are one kind, but "found 3 big-end
 * shells" and "found 1 big-end shell" stay separate. A judgement, and it is the
 * one that turns 47 occasions into 10 kinds.
 * ────────────────────────────────────────────────────────────────────────── */

export const phrasing = (text: string) =>
  text
    .toLowerCase()
    .replace(/no\.? ?\d+/g, 'no.N')
    .replace(/\d+ ?points?/g, 'N points')
    .replace(/\s+/g, ' ')
    .trim();
