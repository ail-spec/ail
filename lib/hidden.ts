/**
 * Characters that render as nothing (or reorder text) but are still sent to the model.
 * Removing them keeps "what the person sees" equal to "what the assistant receives".
 * - C0/C1 controls except tab, LF, CR
 * - soft hyphen, zero-width chars, LRM/RLM, line/paragraph separators, bidi embeddings/overrides
 * - word joiner & invisible operators, bidi isolates, BOM
 * - Unicode tag characters (U+E0000-E007F), used for "ASCII smuggling"
 * Kept ASCII-only on purpose. Safe to import from client components.
 */
export const HIDDEN_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]|[\u{E0000}-\u{E007F}]/gu;

export function countHiddenCharacters(text: string): number {
  return (text.match(HIDDEN_CHARS) ?? []).length;
}
