# Skill map

**Bearach Ormlaithe** · K0184 · Keeper Grade I · 22 years · 6 stations

Generated from `src/data/generated/bearach-offshore-omt.json` on 2026-10-07. Do not edit by hand — run `node scripts/skill-map.ts`.

---

## How a skill gets inferred

```
LOGBOOK_ENTRIES   368 entries, 2004–2026, six stations
      ↓           text pattern match (hand-written, scripts/mappings.ts)
occasions         every entry whose text matched
      ↓           group entries written the same way
kinds of work     distinct phrasings — the honest unit
      ↓           threshold test
skill             claimed, or explicitly not claimed
```

No logbook entry ever says "working at height". The entries say *"harness and lanyard inspected"*. Everything in this document is an inference from records written for another purpose entirely, by people who were not assessing anybody.

### The counting unit

**Occasions are counted, but kinds of work decide.** Bearach has 50 occasions of height work, written six different ways — one of those phrasings appears 17 times on its own. Seventeen repetitions of a scheduled harness inspection is weaker evidence than six different kinds of height job, not stronger, so the headline figure is kinds.

### Thresholds

| Test | Value |
|---|---|
| Direct records | 10 or more |
| Separate years | 5 or more |
| Stations | 2 or more |

Clearing all three is reported as practised. Anything short of it is reported as thin — there is deliberately no middle grade, because a middle grade is where overclaiming hides.

### Signal tagging

A pattern can match a record without that record evidencing the requirement, so every pattern is tagged:

- **direct** — the entry describes the keeper doing the thing
- **custodial** — the entry puts him in control of access to it; somebody else may have done the work
- **adjacent** — neighbouring work that uses the same vocabulary

*"Held the keys for the HV work, PTW 46 refers."* matches high-voltage patterns, and the switching was done by a contractor. Only direct records count toward a claim.

---

## Skills claimed (7)

### Fall arrest · Tower climbing

`work-at-height` — **practised**

| | |
|---|---|
| Kinds of work | **6** |
| Occasions | 50 |
| Span | 2004–2026 · 16 separate years |
| Stations | 6 — Hurlaven Ness, Tullaghmore Lighthouse, Ardvarra Island, Nevisbeg Skerry, Nuallanish Head, Ballaghmona Carrig |
| Not counted | 0 custodial · 2 adjacent |

**Why:** 50 work records describe this directly, across 16 separate years and 6 stations (2004–2026). That clears the stated threshold of 10 records, 5 years and 2 stations.

**Matched on:** `fall arrest`, `staging`, `anchor points`, `harness`

**The kinds of work:**

- 17× — "Set up the fall arrest on the vertical ladder and tested it with a dead weight."
- 12× — "Rigged staging round the lantern for the glazing job, tied back at 2 points."
- 6× — "Cleaned the lantern glass from the staging."
- 6× — "Harness and lanyard inspected. Sound."
- 5× — "Checked the anchor points on the gallery."
- 4× — "Up the ladder to the gallery, harness on."

**Not held:** `WAHS-1` Height safety and fall arrest · `WAHS-2` Ladder and tower climbing · `WAHS-3` Rope access level 1

**Framework:** `NOSF-SAF-1505` — *"Undertake work at height using fall protection systems appropriate to the task and to the structure."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2004-09-26 | Hurlaven Ness | "Set up the fall arrest on the vertical ladder and tested it with a dead weight." | `raw/logbooks/era2-keeperlog/KLOG2004.DAT#009708` |
| 2005-06-03 | Hurlaven Ness | "Rigged staging round the lantern for the glazing job, tied back at 2 points." | `raw/logbooks/era2-keeperlog/KLOG2005.DAT#005501` |
| 2005-08-19 | Hurlaven Ness | "Set up the fall arrest on the vertical ladder and tested it with a dead weight." | `raw/logbooks/era2-keeperlog/KLOG2005.DAT#008311` |

---

### Confined spaces

`enclosed-space` — **practised**

| | |
|---|---|
| Kinds of work | **4** |
| Occasions | 10 |
| Span | 2010–2026 · 5 separate years |
| Stations | 3 — Tullaghmore Lighthouse, Nevisbeg Skerry, Ballaghmona Carrig |

**Why:** 10 work records describe this directly, across 5 separate years and 3 stations (2010–2026). That clears the stated threshold of 10 records, 5 years and 2 stations.

**Matched on:** `sump`, `tank`

**The kinds of work:**

- 4× — "Bottom-end knock on no 2, dropped the sump and found 3 big-end shells scored."
- 3× — "Bottom-end knock on No.1, dropped the sump and found 2 big-end shells scored."
- 2× — "Bottom-end knock on no 2, dropped the sump and found 1 big-end shells scored."
- 1× — "Fuel transferred, one drum to the day tank."

**Register holds:**

- `OSSC-CS` Confined space entry and rescue · 2019 · *lapsed by module date*

**Framework:** `NOSF-SAF-1509` — *"Enter and work within enclosed or restricted spaces under a regime of atmospheric monitoring and continuous attendance."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2010-11-10 | Tullaghmore Lighthouse | "Bottom-end knock on no 2, dropped the sump and found 1 big-end shells scored." | `raw/logbooks/era2-keeperlog/KLOG2010.DAT#010874` |
| 2010-12-08 | Tullaghmore Lighthouse | "Bottom-end knock on no 2, dropped the sump and found 3 big-end shells scored." | `raw/logbooks/era2-keeperlog/KLOG2010.DAT#011871` |
| 2015-05-20 | Nevisbeg Skerry | "Bottom-end knock on NO.2, dropped the sump and found 1 big-end shells scored." | `raw/logbooks/era3-spreadsheets/station-logs-2014-2017.csv#12224` |

---

### Diesel engines · Pumps & fluids · Planned maintenance

`plant-maintenance` — **practised**

| | |
|---|---|
| Kinds of work | **10** |
| Occasions | 47 |
| Span | 2004–2026 · 16 separate years |
| Stations | 5 — Hurlaven Ness, Tullaghmore Lighthouse, Nevisbeg Skerry, Nuallanish Head, Ballaghmona Carrig |

**Why:** 47 work records describe this directly, across 16 separate years and 5 stations (2004–2026). That clears the stated threshold of 10 records, 5 years and 2 stations.

**Matched on:** `set the timing`, `overhaul`, `bottom-end`, `no 2 set`, `no 1 set`, `injector`, `no.1 set`, `no.2 set`

**The kinds of work:**

- 10× — "Set the timing on no.1 after the pump was refitted, ran it up and checked exhaust temps."
- 7× — "Overhauled the raw water side, impeller, seals and the heat exchanger stack cleaned."
- 7× — "Overhauled the foam installation and proved the induction rate on test."
- 6× — "Engine room fire in the no 2 set, hit it with foam and shut off the fuel. Out in minutes."
- 6× — "Injectors off no.2 and pop-tested, two were dribbling. Reconditioned and refitted."
- 4× — "Bottom-end knock on no 2, dropped the sump and found 3 big-end shells scored."
- 3× — "Bottom-end knock on No.1, dropped the sump and found 2 big-end shells scored."
- 2× — "Bottom-end knock on no 2, dropped the sump and found 1 big-end shells scored."
- 1× — "Started no 1 set and ran on load 4 hrs."
- 1× — "Ran No.1 set 2 hrs. Oil and water checked."

**Register holds:**

- `MPMC-B` Fluid transfer and pumped systems · 2016 · *lapsed by module date*
- `MPMC-C` Hydraulic power and control · 2018 · *lapsed by module date*
- `MPMC-D` Planned maintenance practice · 2022

**Not held:** `MPMC-A` Compression ignition prime movers · `MECS-2` Rotating plant and generator control

**Framework:** `NOSF-ENR-0536` — *"Configure and verify the automatic starting, synchronising and load-sharing arrangements of prime mover installations."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2004-01-03 | Hurlaven Ness | "Set the timing on no.1 after the pump was refitted, ran it up and checked exhaust temps." | `raw/logbooks/era2-keeperlog/KLOG2004.DAT#000098` |
| 2004-05-06 | Hurlaven Ness | "Overhauled the raw water side, impeller, seals and the heat exchanger stack cleaned." | `raw/logbooks/era2-keeperlog/KLOG2004.DAT#004526` |
| 2009-12-27 | Tullaghmore Lighthouse | "Set the timing on no.3 after the pump was refitted, ran it up and checked exhaust temps." | `raw/logbooks/era2-keeperlog/KLOG2009.DAT#013126` |

---

### Fault diagnosis

`electrical-fault-diagnosis` — **thin**

| | |
|---|---|
| Kinds of work | **3** |
| Occasions | 5 |
| Span | 2019–2025 · 6 separate years |
| Stations | 2 — Nevisbeg Skerry, Ballaghmona Carrig |
| Not counted | 0 custodial · 2 adjacent |

**Why:** 5 direct records across 6 years and 2 stations. Suggestive, but below the stated threshold of 10 records across 5 years at 2 stations, so no claim is made.

**Matched on:** `traced to `, `intermittent`, `found the fuse`

**The kinds of work:**

- 2× — "Alarm bell sounding, traced to a loose wire."
- 2× — "Intermittent fault on the gallery lights, watching it."
- 1× — "Lamp not lit, found the fuse gone. Renewed."

**Not held:** `MECS-1` Low voltage distribution and protection · `MECS-3` Diagnostic practice and instrumentation · `MECS-5` Electrical safe working

**Framework:** `NOSF-ENR-0538` — *"Determine the location and nature of departures from normal function in electrical installations by systematic diagnostic method."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2019-06-23 | Ballaghmona Carrig | "Alarm bell sounding, traced to a loose wire." | `raw/logbooks/era3-spreadsheets/station-logs-2018-2021.csv#19656` |
| 2019-11-02 | Ballaghmona Carrig | "Intermittent fault on the gallery lights, watching it." | `raw/logbooks/era3-spreadsheets/station-logs-2018-2021.csv#24434` |
| 2020-02-24 | Ballaghmona Carrig | "Alarm bell sounding, traced to a loose wire." | `raw/logbooks/era3-spreadsheets/station-logs-2018-2021.csv#28609` |

---

### Isolation & earthing

`hv-render-safe` — **adjacent**

| | |
|---|---|
| Kinds of work | **1** |
| Occasions | 1 |
| Span | 2024–2024 · 4 separate years |
| Stations | 1 — Ballaghmona Carrig |
| Not counted | 3 custodial · 0 adjacent |

**Why:** Of 4 matching records, 1 describes the work itself, 3 describe custody or administration of it. Most of these are not the thing the employer asked for, so they cannot be read as evidence of doing it.

**Matched on:** `removed earths`

**The kinds of work:**

- 1× — "Restored the HV after the contractor cleared, removed earths and de-isolated in sequence."

**Register holds:**

- `HVAP-01` Switching principles and system knowledge · 2026

**Not held:** `HVAP-02` Isolation, earthing and proving dead

**Framework:** `NOSF-ENR-0532` — *"Undertake operations to render high voltage apparatus safe from the system, including the application of protective conductive connections, within the limits of a written authorisation."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2024-10-09 | Ballaghmona Carrig | "Restored the HV after the contractor cleared, removed earths and de-isolated in sequence." | `raw/logbooks/era3-spreadsheets/station-logs-2022-2026.csv#36589` |

---

### Permit issue

`hv-safety-documentation` — **thin**

| | |
|---|---|
| Kinds of work | **4** |
| Occasions | 5 |
| Span | 2011–2025 · 5 separate years |
| Stations | 2 — Tullaghmore Lighthouse, Ballaghmona Carrig |

**Why:** 5 direct records across 5 years and 2 stations. Suggestive, but below the stated threshold of 10 records across 5 years at 2 stations, so no claim is made.

**Matched on:** `permit returned`, `keys signed back`, `ptw`, `contractor cleared`

**The kinds of work:**

- 2× — "HV room locked and keys signed back in."
- 1× — "Permit returned and cancelled at 0330."
- 1× — "Held the keys for the HV work, PTW 46 refers."
- 1× — "Restored the HV after the contractor cleared, removed earths and de-isolated in sequence."

**Register holds:**

- `HVAP-03` Safety documentation and permit issue · 2019 · *lapsed by module date*

**Framework:** `NOSF-ENR-0533` — *"Prepare, issue and cancel safety documentation governing access to high voltage apparatus."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2011-03-12 | Tullaghmore Lighthouse | "Permit returned and cancelled at 0330." | `raw/logbooks/era2-keeperlog/KLOG2011.DAT#002534` |
| 2021-11-14 | Ballaghmona Carrig | "HV room locked and keys signed back in." | `raw/logbooks/era3-spreadsheets/station-logs-2018-2021.csv#50972` |
| 2022-07-15 | Ballaghmona Carrig | "Held the keys for the HV work, PTW 46 refers." | `raw/logbooks/era3-spreadsheets/station-logs-2022-2026.csv#7189` |

---

### Instructing others

`instructing-others` — **practised**

| | |
|---|---|
| Kinds of work | **1** |
| Occasions | 17 |
| Span | 2004–2025 · 11 separate years |
| Stations | 5 — Hurlaven Ness, Tullaghmore Lighthouse, Nevisbeg Skerry, Nuallanish Head, Ballaghmona Carrig |

**Why:** 17 work records describe this directly, across 11 separate years and 5 stations (2004–2025). That clears the stated threshold of 10 records, 5 years and 2 stations.

**Matched on:** `wrote the method`

**The kinds of work:**

- 17× — "Wrote the method for the tower repaint and briefed the party before we started."

**Framework:** `NOSF-SAF-1506` — *"Prepare a method statement for work at height and communicate its provisions to those undertaking the work."*

**Cannot be read as:**

- Work records describe what somebody wrote down at the time, not everything that was done.

**Sample records:**

| Date | Station | Entry | Source |
|---|---|---|---|
| 2004-06-18 | Hurlaven Ness | "Wrote the method for the tower repaint and briefed the party before we started." | `raw/logbooks/era2-keeperlog/KLOG2004.DAT#006100` |
| 2004-11-02 | Hurlaven Ness | "Wrote the method for the tower repaint and briefed the party before we started." | `raw/logbooks/era2-keeperlog/KLOG2004.DAT#010962` |
| 2007-10-06 | Hurlaven Ness | "Wrote the method for the tower repaint and briefed the party before we started." | `raw/logbooks/era2-keeperlog/KLOG2007.DAT#009641` |

---

## Where the system declines to claim (2)

These have a chip in the vocabulary and no pill on the profile. Zero direct records — only neighbouring work — so claiming them would be the system asserting something it has nothing for.

### Tower rescue

`tower-rescue` — **adjacent** · 0 direct, 0 custodial, 1 adjacent

Of 1 matching record, 1 describes neighbouring work. That is not the thing the employer asked for, so it cannot be read as evidence of doing it.

- No WAHS record of any kind — no certification entry and no training record. Working at Height and Rope Access Scheme is the scheme that would formally evidence this, and this keeper has never been entered into it.
- WAHS-4 (Tower rescue and casualty recovery) is not held.
- Searched all 368 of this keeper’s logbook entries against 3 patterns for the work itself. No match. Absence of a written record is not evidence that the work was never done — roughly 70% of the raw logs were routine watchkeeping and were removed before this pack was produced.

### Boat handling

`vessel-transfer` — **adjacent** · 0 direct, 0 custodial, 43 adjacent

Of 43 matching records, 43 describe neighbouring work. Most of these are not the thing the employer asked for, so they cannot be read as evidence of doing it.

- No SMOC record of any kind — no certification entry and no training record. Small Craft and Marine Operations Certificate is the scheme that would formally evidence this, and this keeper has never been entered into it.
- SMOC-BH (Boat handling) is not held.
- SMOC-MO (Mooring and anchor work) is not held.
- Searched all 368 of this keeper’s logbook entries against 2 patterns for the work itself. No match. Absence of a written record is not evidence that the work was never done — roughly 70% of the raw logs were routine watchkeeping and were removed before this pack was produced.

---

## Skills no scheme will certify

The vocabulary is built from certification modules, so anything nobody certifies has no module to point at. Two of these are among the strongest things in his record.

| Skill | Evidence | Certification |
|---|---|---|
| Operational record-keeping | 368 logbook entries, 22 years, 6 stations | None exists. It is the Coastguard's own stated desirable criterion. |
| Instructing others | 17 occasions, one repeated entry | None exists in any of the 10 schemes. |
| Lone working | 8 years on rock stations as sole keeper | None exists. |
| Fault-finding without support | implied by the above | None exists. |

A vocabulary built only from sellable things can only describe people in the language of what can be sold to them. These stay in as dashed chips rather than being dropped.

---

## What this map cannot tell you

- **Absence is not proof.** Routine watch and weather lines — about 70% of the raw volume — were removed before this extract was produced. Entries from 2003–2014 were cut off at 120 characters by the system that exported them.
- **Writing frequency is not work done.** A keeper who wrote more generates more evidence. Nothing corrects for that.
- **The eras are not comparable.** 1985–2003 is OCR'd handwriting with roughly a one-in-three character error rate; 2003–2014 is truncated; 2014–2026 is intact. Bearach joined in 2004, so none of his record carries OCR damage — keepers who joined before 2000 average about half of theirs in scanned handwriting.
- **Nothing here was assessed at the time.** These are records of what happened, written by the person it happened to, for operational reasons.

## What was deliberately not looked at

- **date_of_birth** — No requirement of this role depends on age. The employer asks for medical fitness, which is a separate assessment, so date of birth has no bearing on any claim here and does not travel into the interface.
- **payroll_ref** — An internal finance identifier. It identifies a person without evidencing anything about their work.
- **contract_type · status · grade_history** — Employment terms and progression history. Grade follows length of service and the availability of a vacancy, and has never been tied to an assessment of anything — so showing it next to a competence claim would imply a relationship that does not exist.
- **appraisals · station manager notes** — Not used, and not copied into this repository. They contain illness, bereavement, domestic circumstances and a resolved disciplinary matter. None of it evidences whether somebody can maintain a turbine, and a redeployment screen that surfaced it would do real harm. The clean pack excludes them; this pipeline would exclude them anyway.

---

*40 keepers and 10,627 logbook entries examined · 11 competency mappings written by hand · synthetic data, no real people.*
