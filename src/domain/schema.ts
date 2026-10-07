import * as z from 'zod/mini';

/**
 * The slice of the generated view model that the interface reads, checked at
 * the boundary. Two places run the same parse:
 *
 *   - scripts/derive.ts, before it writes, so a file that would not render can
 *     never be produced;
 *   - src/data/view.ts, on load, so a hand-edited file fails loudly instead of
 *     quietly rendering a claim that nothing derived.
 *
 * Unknown keys are stripped rather than rejected — the generated file carries
 * more than any one screen needs. This grows as screens arrive. (zod/mini: the
 * same validation, tree-shaken to what the schema uses.)
 */
export const viewSchema = z.object({
  keeper: z.object({ keeper_code: z.string(), name: z.string() }),
  skills: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      claim: z.nullable(z.string()),
      onProfile: z.boolean(),
    }),
  ),
  skillIndex: z.array(z.object({ id: z.string(), label: z.string(), source: z.string() })),
  relevantModules: z.array(
    z.object({
      label: z.string(),
      scheme: z.string(),
      module: z.string(),
      moduleName: z.string(),
      year: z.int(),
    }),
  ),
  route: z.array(
    z.object({
      order: z.int(),
      action: z.string(),
      kind: z.enum(['assessment', 'course']),
      scheme: z.string(),
      module: z.optional(z.string()),
      module_name: z.optional(z.string()),
    }),
  ),
  claims: z.array(
    z.object({
      id: z.string(),
      discrepancies: z.array(
        z.object({
          scheme: z.string(),
          certificateRegisterSays: z.string(),
          trainingRegisterSays: z.string(),
        }),
      ),
      kinds: z.array(z.object({ label: z.string(), entryIds: z.array(z.string()) })),
      summary: z.object({
        kinds: z.int(),
        occasions: z.int(),
        firstYear: z.nullable(z.int()),
        lastYear: z.nullable(z.int()),
        stations: z.int(),
      }),
      entries: z.array(
        z.object({
          entry_id: z.string(),
          date: z.string(),
          station: z.string(),
          station_class: z.enum(['rock', 'island', 'shore']),
          source_era: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          source_record: z.string(),
          text: z.string(),
          signal: z.enum(['direct', 'custodial', 'adjacent']),
        }),
      ),
    }),
  ),
});

export type View = z.infer<typeof viewSchema>;

/** Public records required by the newly requested application profile; never a raw keeper record. */
export const applicationProfileSchema = z.object({
  keeper: z.object({
    keeper_code: z.string(),
    name: z.string(),
    current_grade: z.string(),
    date_joined: z.string(),
    years_of_service: z.int(),
    postings: z.array(
      z.object({
        station_code: z.string(),
        station: z.string(),
        station_class: z.enum(['rock', 'island', 'shore']),
        from_year: z.int(),
        to_year: z.int(),
      }),
    ),
  }),
  pathwaySchemes: z.array(
    z.object({
      code: z.string(),
      renewal_years: z.int(),
      modules: z.array(z.object({ code: z.string(), name: z.string() })),
    }),
  ),
  // Only the grade/year annotations explicitly displayed by the application-profile design.
  gradeHistory: z.array(z.object({ from_year: z.int(), grade: z.string() })),
  recentTraining: z.array(
    z.object({
      scheme: z.string(),
      module: z.string(),
      module_name: z.string(),
      year: z.int(),
      outcome: z.enum(['completed', 'attended']),
    }),
  ),
  certifications: z.array(
    z.object({
      scheme: z.string(),
      modules_held: z.array(z.string()),
      complete: z.boolean(),
      valid_2026: z.boolean(),
    }),
  ),
});
export type ApplicationProfile = z.infer<typeof applicationProfileSchema>;
