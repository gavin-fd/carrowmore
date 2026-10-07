# Carrowmore

A career transition prototype for the fictional Carrowmore Light Authority. As its lighthouse network is automated, keepers need to understand how their experience transfers to new roles and what remains to become interview ready.

The current journey follows **Bearach Ormlaithe (K0184)** applying for **Wind Turbine Technician** at Carrowmore Array Offshore Wind Farm. Historical work evidence supports skill claims; formal certifications and authorisations remain separate requirements.

## User journeys

- **Explore a role:** read the job description, requirements, relevant skills and existing certifications. The suggested-role view and opening detail preserve their navigation context.
- **Inspect skill evidence:** open a skill, review grouped kinds of work, expand individual dated logbook records and explore related skills.
- **Request a record update:** select Skill, Experience, Qualification or Certification; describe the work, period, location and supporting information; optionally select evidence files. Keeper and skill context are attached to the request.
- **Complete an application path:** resolve five requirements covering offshore medical fitness, an offshore safety refresher, first aid, height assessment, and rope access/tower rescue. Steps expand independently; completion advances to the next unresolved step.
- **Request and track an interview:** complete the pathway, open the interview-request confirmation, then visit the application tracker. Each card's View menu opens the submitted application profile or job description.

## Prototype scope

All keeper, employer and operational records are synthetic fixtures. Assessments, courses, certificate awards, record-update submissions and interview requests are simulated; no bookings, files or requests are sent to an external service. The submitted application profile combines historical records with the simulated pathway outcome.

Pathway progress persists in `sessionStorage` for the current tab and role. Tracker stages and repeated cards are presentation fixtures; Move and the evidence dialog's “I haven’t done this” control are inactive. Other sidebar destinations are placeholders. There is no authentication, database or backend API.

## Libraries and tooling

| Library | Purpose |
| --- | --- |
| React 19 / React DOM | Components and local interaction state |
| TypeScript 7 | Application and data-pipeline types |
| Vite 8 | Development server and static production build |
| Tailwind CSS 4 | Styling and shared design tokens |
| Motion 14 | Dialog, drawer, pill and completion transitions, respecting reduced motion |
| Radix UI | Accessible dialog, popover and tooltip behaviour |
| Zod 4 | Generated-data contracts and form validation |
| class-variance-authority / cn | Component variants and class composition |

Shared UI primitives are maintained locally in `src/components/ui/`. Typography uses Inter; icons use Google Material Symbols Outlined. Both fonts load through Google Fonts.

## Run locally

Requires **Node.js 24 or later** and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The default port is 5173; Vite selects the next available port if needed.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check the application and pipeline types |
| `npm run build` | Type-check and create the static build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run derive` | Regenerate the evidence, application-profile data and `SKILL-MAP.md` |

Routes: `/` (suggested role), `/openings/wind-turbine-technician`, `/application-path`, `/application-tracker` and `/application-tracker/wind-turbine-technician`.

## Data and structure

```text
data/source/          Original clean fixtures and certification schemes
scripts/              Deterministic derivation and hand-curated mappings
src/data/generated/   Committed, validated view models
src/domain/           Types and Zod schemas
src/components/       Shared layout and UI primitives
src/features/         Role, evidence, record update, pathway and tracker
src/index.css         Tokens, typography and base styles
```

The browser renders derived static data; it does not infer skills. `scripts/mappings.ts` defines the curated evidence rules. Direct evidence counts towards a claim; custodial and adjacent evidence do not. Diversity of work matters alongside repetition. `SKILL-MAP.md` documents the resulting claims and limitations. Unrelated personal and employment fields are excluded from client data, and update requests never overwrite source records.

For static deployment, run `npm run build`, publish `dist/`, and configure the host to serve `index.html` for application routes so direct links and refreshes work.
