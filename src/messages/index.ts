import en from './en.json';

/**
 * UI strings live in a catalogue, never hard-coded in components
 * (docs/PROJECT.md §2, ADR-010). `ur` is added when the Urdu version starts.
 */
export const messages = en;
export type Messages = typeof en;
