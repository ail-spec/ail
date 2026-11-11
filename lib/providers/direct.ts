import type { LaunchVariant, ProviderAdapter } from "./types.ts";

/**
 * "Direct QR": the QR encodes a provider launch URL itself, skipping the landing page.
 *
 * Lab-only experiment. Skipping the landing page means: one provider only, no preview of the
 * message before launch, no clipboard fallback, and the content is frozen into the printed code
 * (it can't be edited later). It exists to answer one Phase 4 question: does scanning straight
 * into a provider URL open the native app with the prompt, and is that better than the landing page?
 */

/** Byte capacity of the largest QR code (version 40) at error-correction level M. */
export const QR_MAX_BYTES_M = 2331;

/** Above this many characters a printed QR gets dense and slow to scan with a phone camera. */
export const QR_COMFORTABLE_CHARS = 300;

export interface DirectQrOption extends LaunchVariant {
  providerId: ProviderAdapter["id"];
  providerName: string;
  /** False when the URL is too long to use (provider URL cap or QR capacity). */
  fits: boolean;
  /** True when the QR will be dense enough to be hard to scan from print. */
  dense: boolean;
  /** What this direct QR can and cannot test. Never claims the prompt arrives. */
  caveat: string;
}

export function directQrOptions(adapter: ProviderAdapter, prompt: string): DirectQrOption[] {
  return adapter.variants(prompt).map((v) => {
    // Launch URLs are percent-encoded ASCII, so characters == bytes.
    const fits = v.url.length <= adapter.safeUrlLength && v.url.length <= QR_MAX_BYTES_M;
    const caveat =
      v.strategy === "copy-and-open"
        ? "Opens the assistant only. No message is transferred and there's no page to copy it from."
        : v.url.startsWith("https://")
          ? "Tests whether the camera hands this https link to the installed app, and whether the message survives."
          : "Custom app scheme. Fails if the app isn't installed; there is no web fallback.";
    return {
      ...v,
      providerId: adapter.id,
      providerName: adapter.name,
      fits,
      dense: v.url.length > QR_COMFORTABLE_CHARS,
      caveat,
    };
  });
}
