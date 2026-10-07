import { viewSchema } from '@/domain/schema';
import generated from './generated/bearach-offshore-omt.json';

/**
 * Bearach's evidence view, as derived by scripts/derive.ts. Nothing is inferred
 * in the browser: this module only checks the file against the contract and
 * hands it on. A hand-edited or stale file fails here, loudly, at load.
 */
export const view = viewSchema.parse(generated);
