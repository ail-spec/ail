import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { HIDDEN_CHARS, countHiddenCharacters } from "./hidden.ts";
import schema from "../schema/ail-v0.1.schema.json" with { type: "json" };

export interface AILManifest {
  ail_version: "0.1";
  id: string;
  name: string;
  description?: string;
  type: "conversation";
  prompt: string;
  language?: string;
  capabilities?: ("chat" | "image" | "camera" | "voice")[];
  publisher?: { name?: string; url?: string };
  resources?: { title?: string; url: string }[];
  [ext: `x-${string}`]: unknown;
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateFn = ajv.compile(schema);

export function validateManifest(data: unknown): { ok: true } | { ok: false; errors: string[] } {
  if (validateFn(data)) return { ok: true };
  return {
    ok: false,
    errors: (validateFn.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`),
  };
}


export const findHiddenCharacters = countHiddenCharacters;

export function sanitizePrompt(text: string): string {
  return text.normalize("NFC").replace(HIDDEN_CHARS, "").replace(/\r\n?/g, "\n").trim();
}

export function slugify(name: string): string {
  const s = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : `ail-${s || "link"}`.slice(0, 60);
}

export interface ManifestInput {
  name: string;
  prompt: string;
  description?: string;
  language?: string;
}

export function buildManifest(input: ManifestInput, id?: string): AILManifest {
  const m: AILManifest = {
    ail_version: "0.1",
    id: id ?? slugify(input.name),
    name: input.name.trim(),
    type: "conversation",
    prompt: sanitizePrompt(input.prompt),
    language: input.language?.trim() || "auto",
    capabilities: ["chat"],
  };
  const d = input.description?.trim();
  if (d) m.description = d;
  return m;
}
