export type Platform = "ios" | "android" | "desktop";

/**
 * How we know a behaviour works.
 * - documented:   the provider's own docs describe it
 * - observed:     third parties report it; not in provider docs (may break any day)
 * - conflicting:  sources disagree; must be device-tested
 * - unverified:   plausible, no reliable report either way
 * - unsupported:  known not to work / no mechanism exists
 */
export type Evidence = "documented" | "observed" | "conflicting" | "unverified" | "unsupported";

export interface DocRef {
  title: string;
  url: string;
  kind: "official" | "third-party" | "security-advisory";
  note?: string;
}

export type LaunchStrategy =
  /** Open a URL that is believed to prefill the composer. Prompt is also offered for copy. */
  | "url-prefill"
  /** Just open the assistant; the person pastes the prompt. */
  | "copy-and-open";

export interface LaunchVariant {
  id: string;
  label: string;
  url: string;
  strategy: LaunchStrategy;
  /** Experimental variants are hidden unless lab mode is on. */
  experimental: boolean;
  evidence: Evidence;
  note: string;
}

export interface ProviderAdapter {
  id: "chatgpt" | "claude" | "gemini";
  name: string;
  /** Plain entry point that is safe to open with no parameters. */
  homeUrl: string;
  platforms: Platform[];
  urlSchemes: { web: string; native?: string };
  nativeAppLaunch: Record<Platform, Evidence>;
  promptPrefill: Record<Platform, Evidence>;
  autoSubmit: Evidence;
  /** One line on when the prompt is (or isn't) sent without the person tapping send. */
  autoSubmitNote: string;
  /**
   * Max known prompt length the prefill URL accepts. null = unknown.
   * We cap at `safeUrlLength` total URL characters regardless.
   */
  maxPromptLength: number | null;
  safeUrlLength: number;
  requiresLogin: string;
  requiresInstall: string;
  fallback: string;
  docs: DocRef[];
  /** Date of the last desk research / device verification (ISO). */
  lastVerified: string;
  verificationMethod: "desk-research" | "device-tested";
  /** All ways we know to launch this provider with a prompt, most reliable first. */
  variants(prompt: string): LaunchVariant[];
}

/** The variant a consumer should use by default (first non-experimental variant that fits). */
export function defaultVariant(adapter: ProviderAdapter, prompt: string): LaunchVariant {
  const v = adapter.variants(prompt).filter((x) => !x.experimental);
  const fit = v.find((x) => x.url.length <= adapter.safeUrlLength);
  return fit ?? copyAndOpen(adapter);
}

export function copyAndOpen(adapter: ProviderAdapter): LaunchVariant {
  return {
    id: `${adapter.id}-open`,
    label: `Open ${adapter.name} (paste the prompt)`,
    url: adapter.homeUrl,
    strategy: "copy-and-open",
    experimental: false,
    evidence: "documented",
    note: "Opens the provider's normal entry point. No prompt is transferred; the person pastes it.",
  };
}
