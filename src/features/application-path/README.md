# Application path

`/application-path` presents the remaining requirements for the Wind Turbine Technician role using the shared app shell, buttons, expandable rows and dialogs.

The five-step plan in `src/data/application-path.ts` covers:

1. A current offshore medical declaration, required before offshore safety training.
2. An OSSC refresher for sea survival, fire, helicopter/boat transfer and confined spaces. The source records contain conflicting training and certificate dates; the refresher resolves that gap in the prototype.
3. First aid and casualty handling, completing the five-module OSSC requirement.
4. Assessment of WAHS-1/2. Half-day is the supplied prototype duration.
5. Training and assessment of WAHS-3/4 for rope access and tower rescue, which the historical records do not establish.

Each primary action simulates successful completion, closes that row, animates its completed state and opens the next unfinished step. Rows can also be opened independently. Progress is stored in `sessionStorage` by keeper and role, and the first unfinished step opens on return.

The interview action appears only after all five steps are complete. It records a prototype submission snapshot, opens the shared confirmation dialog and links to `/application-tracker`. Record-check requests use the existing update flow and do not complete a course or assessment.

The original evidence view and source data stay unchanged. No external booking, medical decision, submission or qualification is issued. Shared components provide keyboard controls, focus return, Escape handling and reduced-motion transitions.
