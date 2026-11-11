import { describe, expect, it } from "vitest";
import { QR_MAX_BYTES_M, directQrOptions, getProvider, providers } from "../lib/providers/index.ts";

const special = "¿Qué es el Coliseo? & #1 — 100% \"real\"\nNueva línea + 東京";

describe("direct QR options", () => {
  it("offers every launch variant of every provider", () => {
    for (const p of providers) {
      const ids = directQrOptions(p, "hi").map((o) => o.id);
      expect(ids).toEqual(p.variants("hi").map((v) => v.id));
    }
  });

  it("keeps special characters intact in the encoded URL", () => {
    const o = directQrOptions(getProvider("chatgpt")!, special).find((x) => x.id === "chatgpt-web-q")!;
    expect(o.fits).toBe(true);
    expect(new URL(o.url).searchParams.get("q")).toBe(special);
  });

  it("marks prefill URLs that exceed the URL cap or QR capacity as not usable", () => {
    const long = "x".repeat(3000);
    for (const p of providers) {
      for (const o of directQrOptions(p, long)) {
        if (o.strategy === "url-prefill") expect(o.fits).toBe(false);
        if (o.fits) expect(o.url.length).toBeLessThanOrEqual(QR_MAX_BYTES_M);
      }
    }
  });

  it("flags dense QRs and never claims the prompt arrives", () => {
    const opts = providers.flatMap((p) => directQrOptions(p, "y".repeat(500)));
    expect(opts.some((o) => o.dense)).toBe(true);
    for (const o of opts) expect(o.caveat).not.toMatch(/will arrive|is delivered|arrives/i);
  });

  it("warns that a custom scheme has no web fallback", () => {
    const o = directQrOptions(getProvider("claude")!, "hi").find((x) => x.id === "claude-native-scheme")!;
    expect(o.url.startsWith("claude://")).toBe(true);
    expect(o.caveat).toMatch(/isn't installed/);
  });
});
