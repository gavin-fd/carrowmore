# Source data

Copied unmodified from the supplied data pack. `scripts/derive.ts` reads these
files as they are; nothing downstream edits them.

| File | From the pack |
|---|---|
| `keepers.json` | `clean/` — 40 keepers |
| `logbook_entries.json` | `clean/` — their 10,627 logbook entries |
| `certification_schemes.json` | `employers/` |
| `carrowmore-array-om-technician.md` | `employers/` — the posting the role screen reads against |

The clean subset was prepared by the Authority's data team: identities resolved,
dates normalised, and routine watch and weather lines removed (about 70% of the raw
volume). Appraisals and station manager notes are not in it, and are not used.

Fields that bear on no requirement of the role — date of birth, payroll reference,
contract type, status, grade history — are dropped before anything reaches the
interface. The reasons travel with the data: see `REDACTIONS` in
`scripts/derive.ts`.
