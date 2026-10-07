import { useEffect, useState } from 'react';
import * as z from 'zod/mini';
import { applicationPathSteps } from '@/data/application-path';

const KEY = 'carrowmore:K0184:offshore-omt:pathway:v2';
const snapshotSchema = z.object({ completed: z.array(z.string()), submittedYear: z.nullable(z.int()) });
type Snapshot = z.infer<typeof snapshotSchema>;
const stepIds = applicationPathSteps.map((step) => step.id);

function read(): Snapshot {
  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(sessionStorage.getItem(KEY) ?? 'null'));
    if (parsed.success)
      return { ...parsed.data, completed: parsed.data.completed.filter((id) => stepIds.includes(id)) };
  } catch {
    /* A disabled or stale browser store leaves the prototype usable. */
  }
  return { completed: [], submittedYear: null };
}
function save(snapshot: Snapshot) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* Keep the current visit usable. */
  }
}

/** Session-only simulation, distinct from the immutable source evidence. */
export function usePrototypeApplication() {
  const [snapshot, setSnapshot] = useState(read);
  useEffect(() => {
    save(snapshot);
  }, [snapshot]);
  return {
    completed: snapshot.completed,
    complete(id: string) {
      if (!stepIds.includes(id)) return;
      setSnapshot((current) =>
        current.completed.includes(id)
          ? current
          : { ...current, completed: [...current.completed, id], submittedYear: null },
      );
    },
    submit() {
      if (!stepIds.every((id) => snapshot.completed.includes(id))) return;
      const next = { ...snapshot, submittedYear: new Date().getFullYear() };
      // Make the submitted snapshot available before the tracker route reads it.
      save(next);
      setSnapshot(next);
    },
  };
}

/** All tracker cards are submitted Figma fixtures: their prerequisite pathway is complete. */
export function submittedApplication() {
  const snapshot = read();
  const submitted = snapshot.submittedYear !== null && stepIds.every((id) => snapshot.completed.includes(id));
  return {
    completed: submitted ? snapshot.completed : stepIds,
    awardedYear: submitted ? snapshot.submittedYear! : 2026,
  };
}
