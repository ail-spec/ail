import { describe, expect, it } from "vitest";
import { defaultVariant, getProvider, providers } from "../lib/providers/index.ts";

const special = "¿Qué es el Coliseo? & #1 — 100% \"real\"\nNueva línea + 東京";

describe("provider adapters", () => {
  it("define every required field", () => {
    for (const p of providers) {
      expect(p.name).toBeTruthy();
      expect(p.homeUrl).toMatch(/^https:\/\//);
      expect(Object.keys(p.nativeAppLaunch).sort()).toEqual(["android", "desktop", "ios"]);
      expect(Object.keys(p.promptPrefill).sort()).toEqual(["android", "desktop", "ios"]);
      expect(p.docs.length).toBeGreaterThan(0);
      expect(p.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.fallback).toBeTruthy();
    }
  });

  it("round-trips special characters through the prefill URL", () => {
    for (const id of ["chatgpt", "claude"]) {
      const v = defaultVariant(getProvider(id)!, special);
      expect(v.strategy).toBe("url-prefill");
      expect(new URL(v.url).searchParams.get("q")).toBe(special);
    }
  });

  it("never uses an experimental variant by default", () => {
    for (const p of providers) expect(defaultVariant(p, "hello").experimental).toBe(false);
  });

  it("defaults Gemini to copy-and-open (no documented prefill)", () => {
    const v = defaultVariant(getProvider("gemini")!, "hello");
    expect(v.strategy).toBe("copy-and-open");
    expect(v.url).toBe("https://gemini.google.com/app");
  });

  it("defaults Perplexity and Mistral to copy-and-open until a device test", () => {
    for (const [id, home] of [["perplexity", "https://www.perplexity.ai/"], ["mistral", "https://chat.mistral.ai/"]]) {
      const p = getProvider(id)!;
      const v = defaultVariant(p, "hello");
      expect(v.strategy).toBe("copy-and-open");
      expect(v.url).toBe(home);
      // Nothing is better than "unverified" without provider docs or a device test.
      for (const x of p.variants("hello")) if (x.strategy === "url-prefill") {
        expect(x.experimental).toBe(true);
        expect(x.evidence).toBe("unverified");
      }
    }
  });

  it("round-trips special characters through the experimental Perplexity and Mistral URLs", () => {
    for (const id of ["perplexity", "mistral"]) {
      for (const v of getProvider(id)!.variants(special)) {
        if (v.strategy === "url-prefill") expect(new URL(v.url).searchParams.get("q")).toBe(special);
      }
    }
  });

  it("falls back to copy-and-open when the prefill URL would be too long", () => {
    const long = "x".repeat(3000);
    for (const p of providers) {
      const v = defaultVariant(p, long);
      expect(v.strategy).toBe("copy-and-open");
      expect(v.url.length).toBeLessThan(100);
    }
  });

  it("never puts a custom app scheme in the default path", () => {
    for (const p of providers) expect(defaultVariant(p, "hi").url.startsWith("https://")).toBe(true);
  });
});
