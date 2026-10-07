# Carrowmore

**[Figma design](https://www.figma.com/design/qLgNrSalE6KPHeLjS2WueH/Carrowmore?node-id=0-1)** · **Loom walkthrough:** link to be added

A career-transition prototype for the fictional Carrowmore Light Authority, where 340 lighthouse keepers face automation.

The prototype follows **Bearach Ormlaithe (K0184)** as he considers a **Wind Turbine Technician** role at Carrowmore Array Offshore Wind Farm.

I focused on one question:

> How do you take decades of somebody’s working life, make it legible to a new employer, and still be honest about what the records do and do not prove?

That became the centre of the prototype.

A skill such as **Diesel engines** is not presented as a mysterious system judgement. Bearach can open it, see the work records behind it, add missing experience, or challenge something that does not look right.

The application path then deals with a different problem: the gap between having relevant experience and holding the formal certification or authorisation an employer still requires.

## Run locally

Requires **Node.js 24 or later**, npm and access to this private repository.

Clone using GitHub Desktop, or select **Code → Download ZIP** on GitHub and extract it.

Open a terminal in the project folder and run:

`npm ci`

`npm run dev`

Open the URL printed by Vite. The default port is `5173`.

All required data is included. No environment variables, API keys or separate data-pack download are needed.

## What I built

The prototype covers a single keeper-facing journey:

- explore a role that appears to be a good fit
- understand why it has been suggested
- inspect the evidence behind a skill
- add or challenge missing experience
- see what formal requirements are still unresolved
- complete a simulated application path
- request an interview through the redeployment team
- track the application
- view the role-specific profile created for that employer

The submitted profile is not meant to be a complete personnel record.

It is a comparison between what the job asks for and what Bearach can credibly show through his skills, experience, training and certifications.

## Why I chose this part of the problem

The part of the brief I cared most about was the lighthouse keeper’s dignity.

These people have spent decades doing difficult, practical work. The problem is not that they have no experience. The problem is that their experience is trapped inside records that were never written to help them move into another career.

I wanted the product to help make that work visible without flattening it into a score or pretending the system knows more than it does.

That is why I focused on:

- showing why a role has been suggested
- making inferred skills inspectable
- giving the keeper ownership over what appears on their profile
- keeping skills separate from formal certification
- turning missing requirements into a clear route forward

I did not build the redeployment-team interface.

That side of the product would need to help a small team review hundreds of keepers, handle record-update requests, compare candidates and decide who should be put forward to employers.

That is also why I focused so heavily on the **skill-inference layer**.

In a real product, I would develop this into a tightly scoped inference service, potentially using a small language model such as GPT-4o mini, to translate historical work records into a consistent skill vocabulary.

The important part is not the model itself. It is the shared vocabulary it creates.

The lighthouse keeper, the redeployment team and the employer should all be able to talk about the same skill in the same language.

That makes skills a kind of **shared currency across the product**:

- inferred from evidence
- inspectable by the keeper
- useful for comparing people with roles
- understandable to employers

For the keeper, it makes decades of work easier to understand and own.

For the redeployment team, it creates a consistent way to review people across hundreds of records and opportunities.

For employers, it translates lighthouse work into language that can be compared with the requirements of a role.

I would keep that inference transparent and challengeable. The service could propose and maintain the mapping, but the underlying evidence would remain visible and the keeper would retain the ability to correct or supplement their record.

I also did not build the full keeper home screen.

In a fuller product, that screen would likely bring together:

- suggested roles
- the keeper’s complete skill profile
- missing or suggested skills
- recommended training and certifications
- actions to confirm, reject or supplement inferred skills

I stopped at the point where the keeper-facing flow answered the part of the brief I felt was most important.

## Skills and certifications

### Skills

- inferred from historical work
- visible to the keeper
- inspectable down to source records
- accepted, rejected, supplemented, or corrected by the keeper

### Certifications

- separately recorded formal credentials
- required by some employers
- can be missing, expired, or unverified
- can be obtained through the application path

This distinction is important.

A keeper may have years of evidence showing they have done a type of work and still not hold the formal credential an employer requires.

The product should be able to say both things at once.

## Skill inference

The browser does not infer skills.

The supplied data is processed ahead of time using curated mappings.

The current flow is:

LOGBOOK ENTRIES  
↓  
matched work records  
↓  
grouped kinds of work  
↓  
evidence threshold  
↓  
skill claimed, or deliberately not claimed

The mappings distinguish between:

- **direct evidence**: the record describes the keeper doing the work
- **custodial evidence**: the keeper was responsible for access or oversight, but somebody else may have carried out the work
- **adjacent evidence**: related work using similar language, but not the skill itself

Only direct evidence contributes to a claim.

Repetition alone is not enough. The derivation also considers diversity of work, years and stations rather than treating repeated versions of the same routine entry as independent demonstrations of competence.

The full reasoning is documented in `SKILL-MAP.md`.

The current mappings are intentionally provisional. They exist to make the prototype testable, not to pretend that skill inference has been solved.

## Tools Used

- **Claude:** interrogating the data pack during discovery, understanding how the records related to one another, exploring low-fidelity wireframes, and implementing the finished designs in high fidelity.
- **Mobbin:** researching interface patterns in adjacent applications and adapting useful components and interactions into a cohesive experience for this brief.
- **Figma:** research, design and component creation. Figma AI helped populate components and tables I had designed with data-pack content, using screenshots of Claude’s wireframes as a reference.
- **Codex:** reviewing the code produced during implementation.
- **GitHub and GitHub Desktop:** hosting and sharing the repository through GitHub, and managing new commits and version history through GitHub Desktop.

## Where AI helped, and where I took the work back

I used ChatGPT and Claude mainly to help interrogate the data pack, understand its structure, explore possible directions and accelerate implementation.

The early design output was not where I wanted the product to go.

One recurring problem was that the models wanted to describe inferred competence through long, verbose evidence summaries. The result felt more like an audit report than something a lighthouse keeper could understand or own.

I took that work back and reduced those descriptions into a compact skill vocabulary.

Instead of showing a paragraph about engine maintenance, the product can simply show:

**Diesel engines**

That label can then be used consistently across:

- the keeper’s profile
- job requirements
- the application path
- the redeployment team
- the employer-facing profile

The important part is that the label is never a black box. The keeper can always open it and inspect the records behind it.

That decision is also what led to the idea of skills as the shared currency between the three audiences.

I also rejected confidence percentages and generic match scores. The historical records were written for operational purposes, not competence assessment, so assigning an apparently precise score would overstate what the data can support.

Once the product direction was clear, I designed the flow in Figma and used Claude again to help implement those designs in React.

## What I would change in a real product

The first thing I would validate is the skill-inference model.

The current `SKILL-MAP.md` is a transparent, deterministic prototype of that idea. I would test it with keepers, the redeployment team and employers before trusting it at scale.

I would want to know:

- whether keepers recognise the skills as fair descriptions of their work
- whether employers find those same labels useful
- whether the redeployment team can use the vocabulary to compare people and opportunities consistently
- whether important transferable skills are missing
- whether the current thresholds behave fairly
- whether somebody who wrote more detailed logs appears stronger than somebody who recorded less

In a real product, I would likely replace the hand-curated mapping layer with a tightly scoped inference service using a small language model.

That service would have one narrow job:

> Read relevant historical work records and propose a structured mapping into the shared skill vocabulary.

It would not silently rewrite a keeper’s profile.

Its outputs would remain visible, inspectable and challengeable.

I would also expect the skill vocabulary itself to evolve. It would need continued validation with keepers and employers so that it stayed useful at both ends of the transition rather than becoming an internal taxonomy that only made sense to the system.

The implementation may change completely, but I would keep the idea of one shared language connecting the keeper, redeployment team and employer.

## What I would keep

I would keep these principles even if the implementation changed completely:

- the keeper can see where a skill came from
- the keeper can challenge or supplement their own record
- skills provide a shared language across keepers, redeployment teams and employers
- historical experience and formal credentials stay separate
- “no record found” does not become “you do not have this”
- only information relevant to a role travels into the employer-facing profile
- the application path turns uncertainty into something actionable

## Data choices

I used the supplied clean subset as the primary working data.

That kept the exercise focused on the product problem rather than ingestion.

I also used the raw data pack selectively to sanity-check the inference model and understand where the clean data had been normalised or reduced.

The clean subset still contains the core problem: there is no authoritative field saying what somebody is competent at. That has to be inferred from records created for another purpose.

The prototype deliberately excludes unrelated personal and employment information from the client-facing data.

## Prototype boundaries

All records are synthetic.

Courses, assessments, certificate awards, record updates and interview requests are simulated.

There is no authentication, database or backend API.

Skill removals and application-path progress are kept for the current browser-tab session. The underlying source records remain unchanged.

The prototype is designed to demonstrate the product logic and interaction model rather than reproduce the operational systems that would sit behind it.

## Time spent

Approximately **6–6.5 hours** in total.

Roughly:

- **~90 minutes** reading the brief, exploring the data and deciding which part of the problem to focus on
- **~2 hours** designing and refining the keeper journey in Figma
- **~1.5 hours** implementing and iterating on the prototype and testing
- the remaining time on the skill map, copy, interaction polish, validation and repository preparation

I went beyond the suggested four-hour window because I wanted the central evidence interaction and the keeper-facing flow to feel resolved.

## Libraries and tooling

| Library | Purpose |
| --- | --- |
| React 19 / React DOM | Components and interaction state |
| React Router 8 | Client-side navigation and browser history |
| TypeScript 7 | Application and data-pipeline types |
| Vite 8 | Development server and static production build |
| Tailwind CSS 4 | Styling and shared tokens |
| Motion 14 | Dialog, drawer and completion transitions |
| Radix UI | Dialog, popover and tooltip behaviour |
| Zod 4 | Data contracts and form validation |
| class-variance-authority / `cn` | Component variants and class composition |

Shared UI components live in `src/components/ui/`.

Journeys are organised in `src/features/`.

Typography uses Inter. Icons use Google Material Symbols Outlined.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check application and pipeline types |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run derive` | Regenerate view models and the skill-map document |

For static hosting, publish `dist/` and configure application routes to fall back to `index.html`.
