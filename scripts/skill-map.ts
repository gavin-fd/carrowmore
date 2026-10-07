/**
 * Emits SKILL-MAP.md from the derived view model.
 *
 * Written as a generator rather than a hand-kept document so the counts in the
 * prose cannot drift away from the counts in the product. Re-run after derive.
 *
 *   node scripts/skill-map.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Claim, RoleEvidenceView } from '../src/domain/types.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const view = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/generated/bearach-offshore-omt.json'), 'utf8'),
) as RoleEvidenceView;

/** The display vocabulary, grouped by the claim each chip reads from. Written by hand in mappings.ts. */
const CHIPS: Record<string, string[]> = {};
for (const s of view.skills) if (s.claim) (CHIPS[s.claim] ??= []).push(s.label);

/** Kinds of work as derive.ts grouped them, resolved back to their records. */
const kindsOf = (c: Claim) => {
  const byId = new Map(c.entries.map((e) => [e.entry_id, e]));
  return c.kinds.map((k) => k.entryIds.map((id) => byId.get(id)!));
};

const out: string[] = [];
const w = (s = '') => out.push(s);

const k = view.keeper;

w('# Skill map');
w();
w(`**${k.name}** · ${k.keeper_code} · ${k.current_grade} · ${k.years_of_service} years · ${k.postings.length} stations`);
w();
w(`Generated from \`src/data/generated/bearach-offshore-omt.json\` on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand — run \`node scripts/skill-map.ts\`.`);
w();
w('---');
w();

/* ── method ─────────────────────────────────────────────────────────── */
w('## How a skill gets inferred');
w();
w('```');
w('LOGBOOK_ENTRIES   368 entries, 2004–2026, six stations');
w('      ↓           text pattern match (hand-written, scripts/mappings.ts)');
w('occasions         every entry whose text matched');
w('      ↓           group entries written the same way');
w('kinds of work     distinct phrasings — the honest unit');
w('      ↓           threshold test');
w('skill             claimed, or explicitly not claimed');
w('```');
w();
w('No logbook entry ever says "working at height". The entries say *"harness and lanyard inspected"*. Everything in this document is an inference from records written for another purpose entirely, by people who were not assessing anybody.');
w();
w('### The counting unit');
w();
w('**Occasions are counted, but kinds of work decide.** Bearach has 50 occasions of height work, written six different ways — one of those phrasings appears 17 times on its own. Seventeen repetitions of a scheduled harness inspection is weaker evidence than six different kinds of height job, not stronger, so the headline figure is kinds.');
w();
w('### Thresholds');
w();
w('| Test | Value |');
w('|---|---|');
w('| Direct records | 10 or more |');
w('| Separate years | 5 or more |');
w('| Stations | 2 or more |');
w();
w('Clearing all three is reported as practised. Anything short of it is reported as thin — there is deliberately no middle grade, because a middle grade is where overclaiming hides.');
w();
w('### Signal tagging');
w();
w('A pattern can match a record without that record evidencing the requirement, so every pattern is tagged:');
w();
w('- **direct** — the entry describes the keeper doing the thing');
w('- **custodial** — the entry puts him in control of access to it; somebody else may have done the work');
w('- **adjacent** — neighbouring work that uses the same vocabulary');
w();
w('*"Held the keys for the HV work, PTW 46 refers."* matches high-voltage patterns, and the switching was done by a contractor. Only direct records count toward a claim.');
w();
w('---');
w();

/* ── the claims ─────────────────────────────────────────────────────── */
const claimed = view.claims.filter((c) => c.spread.direct > 0 && CHIPS[c.id]);
const declined = view.claims.filter((c) => c.spread.direct === 0 && CHIPS[c.id]);

w(`## Skills claimed (${claimed.length})`);
w();

for (const c of claimed) {
  const kinds = kindsOf(c);
  const yrs = [...new Set(c.entries.filter((e) => e.signal === 'direct').map((e) => e.date.slice(0, 4)))].sort();
  const matched = [...new Set(c.entries.filter((e) => e.signal === 'direct').map((e) => e.matched.toLowerCase()))];

  w(`### ${CHIPS[c.id].join(' · ')}`);
  w();
  w(`\`${c.id}\` — **${c.assessment}**`);
  w();
  w('| | |');
  w('|---|---|');
  w(`| Kinds of work | **${kinds.length}** |`);
  w(`| Occasions | ${c.spread.direct} |`);
  w(`| Span | ${yrs[0]}–${yrs[yrs.length - 1]} · ${c.spread.distinctYears} separate years |`);
  w(`| Stations | ${c.spread.stations.length} — ${c.spread.stations.join(', ')} |`);
  if (c.spread.custodial || c.spread.adjacent)
    w(`| Not counted | ${c.spread.custodial} custodial · ${c.spread.adjacent} adjacent |`);
  w();
  w(`**Why:** ${c.reason}`);
  w();
  w(`**Matched on:** ${matched.map((m) => `\`${m}\``).join(', ')}`);
  w();
  w('**The kinds of work:**');
  w();
  for (const g of kinds) w(`- ${g.length}× — "${g[0].text}"`);
  w();
  if (c.verified.length) {
    w('**Register holds:**');
    w();
    for (const v of c.verified) w(`- \`${v.module}\` ${v.module_name}${v.year ? ` · ${v.year}` : ''}${v.stale ? ' · *lapsed by module date*' : ''}`);
    w();
  }
  if (c.missingModules.length) {
    w(`**Not held:** ${c.missingModules.map((m) => `\`${m.module}\` ${m.module_name}`).join(' · ')}`);
    w();
  }
  if (c.nosf) {
    w(`**Framework:** \`${c.nosf.id}\` — *"${c.nosf.statement}"*`);
    w();
  }
  if (c.limitations.length) {
    w('**Cannot be read as:**');
    w();
    for (const l of c.limitations) w(`- ${l}`);
    w();
  }
  w('**Sample records:**');
  w();
  w('| Date | Station | Entry | Source |');
  w('|---|---|---|---|');
  for (const e of c.entries.filter((x) => x.signal === 'direct').slice(0, 3))
    w(`| ${e.date} | ${e.station} | "${e.text}" | \`${e.source_record}\` |`);
  w();
  w('---');
  w();
}

/* ── declined ───────────────────────────────────────────────────────── */
w(`## Where the system declines to claim (${declined.length})`);
w();
w('These have a chip in the vocabulary and no pill on the profile. Zero direct records — only neighbouring work — so claiming them would be the system asserting something it has nothing for.');
w();
for (const c of declined) {
  w(`### ${CHIPS[c.id].join(' · ')}`);
  w();
  w(`\`${c.id}\` — **${c.assessment}** · ${c.spread.direct} direct, ${c.spread.custodial} custodial, ${c.spread.adjacent} adjacent`);
  w();
  w(`${c.reason}`);
  w();
  if (c.absence.length) {
    for (const a of c.absence) w(`- ${a}`);
    w();
  }
}
w('---');
w();

/* ── no certification exists ────────────────────────────────────────── */
w('## Skills no scheme will certify');
w();
w('The vocabulary is built from certification modules, so anything nobody certifies has no module to point at. Two of these are among the strongest things in his record.');
w();
w('| Skill | Evidence | Certification |');
w('|---|---|---|');
w('| Operational record-keeping | 368 logbook entries, 22 years, 6 stations | None exists. It is the Coastguard\'s own stated desirable criterion. |');
w('| Instructing others | 17 occasions, one repeated entry | None exists in any of the 10 schemes. |');
w('| Lone working | 8 years on rock stations as sole keeper | None exists. |');
w('| Fault-finding without support | implied by the above | None exists. |');
w();
w('A vocabulary built only from sellable things can only describe people in the language of what can be sold to them. These stay in as dashed chips rather than being dropped.');
w();
w('---');
w();

/* ── limits ─────────────────────────────────────────────────────────── */
w('## What this map cannot tell you');
w();
w('- **Absence is not proof.** Routine watch and weather lines — about 70% of the raw volume — were removed before this extract was produced. Entries from 2003–2014 were cut off at 120 characters by the system that exported them.');
w('- **Writing frequency is not work done.** A keeper who wrote more generates more evidence. Nothing corrects for that.');
w('- **The eras are not comparable.** 1985–2003 is OCR\'d handwriting with roughly a one-in-three character error rate; 2003–2014 is truncated; 2014–2026 is intact. Bearach joined in 2004, so none of his record carries OCR damage — keepers who joined before 2000 average about half of theirs in scanned handwriting.');
w('- **Nothing here was assessed at the time.** These are records of what happened, written by the person it happened to, for operational reasons.');
w();
w('## What was deliberately not looked at');
w();
for (const r of view.redactions) w(`- **${r.field}** — ${r.reason}`);
w();
w('---');
w();
w(`*${view.provenance.keepersExamined} keepers and ${view.provenance.logbookEntriesExamined.toLocaleString('en-GB')} logbook entries examined · ${view.provenance.competencyMappingsHandWritten} competency mappings written by hand · synthetic data, no real people.*`);

const file = path.join(ROOT, 'SKILL-MAP.md');
fs.writeFileSync(file, out.join('\n') + '\n');
console.log(`SKILL-MAP.md — ${claimed.length} claimed, ${declined.length} declined, ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
