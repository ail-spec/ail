import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const gemini: ProviderAdapter = {
  id: "gemini",
  name: "Gemini",
  homeUrl: "https://gemini.google.com/app",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://gemini.google.com/app" },
  // Device tests 2026-11-11 covered only the default copy-and-open path (gemini.google.com/app).
  // The experimental ?q= / ?query= variants were not tested, so prefill evidence is unchanged.
  nativeAppLaunch: {
    ios: "observed", // the Gemini app opened from the landing page and from a camera scan
    // Not tested with the Gemini app installed. Without it, Android offered "Google" (did
    // nothing) or Chrome (opened the web app).
    android: "unverified",
    desktop: "unsupported",
  },
  promptPrefill: {
    // Many browser extensions exist solely to add ?q=/?prompt= support, which strongly suggests
    // the web app does not do it natively. One generator site claims it does. → conflicting.
    desktop: "conflicting",
    ios: "conflicting",
    android: "conflicting",
  },
  autoSubmit: "unverified",
  autoSubmitNote: "No prefill by default, so nothing to send.",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin: "Yes — Google account required.",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open gemini.google.com/app. This is the default for Gemini.",
  docs: [
    {
      title: "Google Help — Use learning tools in Gemini Apps",
      url: "https://support.google.com/gemini/answer/16448384",
      kind: "official",
      note: "Official docs describe typing the prompt; no URL prefill is documented.",
    },
    {
      title: "gemini-url-prompt (Chrome extension adding ?prompt= / ?q=)",
      url: "https://github.com/elliot79313/gemini-url-prompt",
      kind: "third-party",
      note: "Exists because Gemini has no built-in URL prefill.",
    },
    {
      title: "u2l.ai — Gemini prompt link generator",
      url: "https://u2l.ai/tools/gemini-prompt-link-generator",
      kind: "third-party",
      note: "Claims ?q= works natively. Contradicts the above; unverified.",
    },
  ],
  lastVerified: "2026-11-11",
  verificationMethod: "device-tested",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      // Default for Gemini is copy-and-open: no documented or consistently reported prefill.
      copyAndOpen(gemini),
      {
        id: "gemini-web-q",
        label: "Gemini ?q= (test)",
        url: `https://gemini.google.com/app?q=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "conflicting",
        note: "Claimed by one generator site; most reports say it needs an extension.",
      },
      {
        id: "gemini-guided-learning-query",
        label: "Gemini Guided Learning ?query= (test)",
        url: `https://gemini.google.com/guided-learning?query=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "unverified",
        note: "Reported by an education blog (Dec 2025). Changes Gemini's mode.",
      },
    ];
  },
};
