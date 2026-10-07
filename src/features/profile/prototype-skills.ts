import { useSyncExternalStore } from 'react';
import * as z from 'zod/mini';
import { view } from '@/data/view';

const KEY = `carrowmore:${view.keeper.keeper_code}:removed-skills:v1`;
const idsSchema = z.array(z.string());
const skillIds = new Set(view.skills.map((skill) => skill.id));
const listeners = new Set<() => void>();
const empty: readonly string[] = [];
let snapshot: readonly string[] | undefined;

function read() {
  if (snapshot) return snapshot;
  try {
    const parsed = idsSchema.safeParse(JSON.parse(sessionStorage.getItem(KEY) ?? '[]'));
    if (parsed.success) {
      snapshot = [...new Set(parsed.data.filter((id) => skillIds.has(id)))];
      return snapshot;
    }
  } catch {
    // Retain an in-memory profile when browser storage is unavailable.
  }
  snapshot = empty;
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function removeSkill(id: string) {
  const current = read();
  if (!skillIds.has(id) || current.includes(id)) return;
  snapshot = [...current, id];
  try {
    sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // Navigation still preserves the in-memory choice.
  }
  listeners.forEach((listener) => listener());
}

/** Keeper choices last for this tab's session; the source evidence stays intact. */
export function usePrototypeSkills() {
  const removedIds = useSyncExternalStore(subscribe, read, () => empty);
  return { removedIds, removeSkill };
}
