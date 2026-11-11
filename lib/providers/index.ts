import { chatgpt } from "./chatgpt.ts";
import { claude } from "./claude.ts";
import { gemini } from "./gemini.ts";
import type { ProviderAdapter } from "./types.ts";

export const providers: ProviderAdapter[] = [chatgpt, claude, gemini];

export function getProvider(id: string): ProviderAdapter | undefined {
  return providers.find((p) => p.id === id);
}

export * from "./types.ts";
export * from "./direct.ts";
