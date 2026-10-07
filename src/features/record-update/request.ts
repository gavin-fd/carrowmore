import * as z from 'zod/mini';

/** What a keeper can ask to have changed. The redeployment team decides; nothing here edits a record. */
export const UPDATE_TYPES = ['Skill', 'Experience', 'Qualification', 'Certification'] as const;

const answered = z.string().check(z.trim(), z.minLength(1));

/**
 * Ready to send: a kind of update — and for a skill, which skill — and enough
 * for the team to find the record: what it should say, when and where.
 * Verification details help but are not required; a keeper may not have any.
 */
export const recordUpdateDraft = z
  .object({
    type: z.enum(UPDATE_TYPES),
    /** Skill ids; only sent with a "Skill" update. */
    skills: z.array(z.string()),
    says: answered,
    when: answered,
    where: answered,
    verify: z.string().check(z.trim()),
  })
  .check(z.refine((d) => d.type !== 'Skill' || d.skills.length > 0, { message: 'Choose at least one skill' }));

export type UpdateType = (typeof UPDATE_TYPES)[number];

export interface RecordUpdateRequest extends z.output<typeof recordUpdateDraft> {
  /** Attached automatically: who is asking, and what they were looking at. */
  keeper: { keeper_code: string; name: string };
  about: { skillId: string; skill: string; claim: string | null };
  /** File names only. The prototype keeps no files. */
  attachments: string[];
}

/**
 * Where a sent request goes in the prototype: held in memory for the
 * redeployment team, and gone on reload. A real build would post it.
 */
const outbox: RecordUpdateRequest[] = [];

export function send(request: RecordUpdateRequest) {
  outbox.push(request);
}
