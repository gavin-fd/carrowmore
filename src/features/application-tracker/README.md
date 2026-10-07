# Application tracker

`/application-tracker` groups presentation cards by application stage. Each View popover offers **Your application** (`/application-tracker/wind-turbine-technician`) and **Job details** (`/openings/wind-turbine-technician`). The latter preserves active All Openings navigation. Move is intentionally inactive.

The stages and card counts are static demonstration fixtures, not employer decisions. Both tracker screens reuse the shared app shell, breadcrumbs, employer mark, buttons and chips. Popovers support keyboard navigation, outside-click dismissal, Escape and focus return.

The submitted profile combines the public source projection with the completed prototype pathway. It includes the simulated medical, OSSC and WAHS outcomes; scheme names and renewal periods come from the supplied data pack. Newly completed training replaces older occurrences in the recent-training display, and completed WAHS-4 adds tower rescue. Historical service remains unchanged. A directly opened tracker fixture assumes a completed application; a submitted session uses its saved snapshot.

`scripts/application-profile.ts`, included in `npm run derive`, generates the historical profile projection against its Zod contract. Date of birth, payroll references, contract type, status, appraisals and private notes are excluded from the client payload. The source data is immutable, and the completed credentials are prototype outcomes rather than real awards.
