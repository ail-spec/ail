import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildManifest, findHiddenCharacters, sanitizePrompt, slugify, validateManifest } from "../lib/manifest.ts";

const examplesDir = join(__dirname, "../examples");

describe("AIL schema", () => {
  for (const f of readdirSync(examplesDir).filter((x) => x.endsWith(".json"))) {
    it(`accepts example ${f}`, () => {
      expect(validateManifest(JSON.parse(readFileSync(join(examplesDir, f), "utf8")))).toEqual({ ok: true });
    });
  }

  it("rejects a wrong version and missing prompt", () => {
    const r = validateManifest({ ail_version: "0.2", id: "abc", name: "x", type: "conversation" });
    expect(r.ok).toBe(false);
  });

  it("rejects provider-specific top-level keys but allows x- extensions", () => {
    const base = buildManifest({ name: "Test link", prompt: "Hello" });
    expect(validateManifest({ ...base, chatgpt_url: "https://chatgpt.com" }).ok).toBe(false);
    expect(validateManifest({ ...base, "x-acme": { theme: "dark" } }).ok).toBe(true);
  });
});

describe("prompt sanitising", () => {
  it("removes zero-width, bidi and Unicode tag characters", () => {
    const sneaky = "Hello​ world‮!" + "\u{E0049}\u{E0047}\u{E004E}";
    expect(findHiddenCharacters(sneaky)).toBe(5);
    expect(sanitizePrompt(sneaky)).toBe("Hello world!");
  });

  it("keeps newlines, accents, emoji and non-Latin scripts", () => {
    const text = "Línea 1\nCafé ☕ — 東京 — مرحبا";
    expect(sanitizePrompt(text)).toBe(text);
  });
});

describe("slugify", () => {
  it("produces schema-valid ids", () => {
    for (const name of ["Discover the Colosseum", "Café Olé!", "東京", "a"]) {
      const m = buildManifest({ name, prompt: "hi" });
      expect(validateManifest(m)).toEqual({ ok: true });
    }
    expect(slugify("Café Olé!")).toBe("cafe-ole");
  });
});
