import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const perplexity: ProviderAdapter = {
  id: "perplexity",
  name: "Perplexity",
  homeUrl: "https://www.perplexity.ai/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://www.perplexity.ai/search?q={prompt}" },
  // Device tests 2026-11-16 (compatibility/results.csv): iPhone 13 (Chrome) and a MacBook Air
  // (Chrome). Android was not tested. Not documented by Perplexity, so "observed" at most.
  nativeAppLaunch: {
    // Every iPhone test opened the browser, camera scans of /search?q= included, although the iOS
    // app's universal links cover /search. Whether the app was installed wasn't recorded.
    ios: "unverified",
    android: "unverified", // not tested
    desktop: "unverified", // only the web app was tested
  },
  promptPrefill: {
    desktop: "observed", // exact, accents, €, emoji and line breaks included
    ios: "observed",
    android: "unverified", // not tested
  },
  // Sent straight away in every signed-in test and on the iPhone signed out; it then asks for an
  // account before answering. The landing-page preview is the only review a person gets.
  autoSubmit: "observed",
  autoSubmitNote: "Runs the question as soon as it opens (device tests 2026-11-16).",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "Yes, to get an answer: signed out, the iPhone sent the question and then asked to sign in; after sign-in the message was gone, on the iPhone and on desktop (2026-11-16).",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open perplexity.ai.",
  docs: [
    {
      title: "Perplexity — apple-app-site-association (iOS universal links)",
      url: "https://www.perplexity.ai/.well-known/apple-app-site-association",
      kind: "official",
      note: "Provider-published file, read 2026-11-15. Lists /search and /search/* for the iOS app; documents no URL parameters.",
    },
    {
      title: "SSW Rules — Make Perplexity your default search engine",
      url: "https://www.ssw.com.au/rules-beta/make-perplexity-your-default-search-engine",
      kind: "third-party",
      note: "Uses https://www.perplexity.ai/search?q=%s as a browser search engine.",
    },
    {
      title: "Alphr — Set Perplexity as default search engine",
      url: "https://www.alphr.com/set-perplexity-as-default-search-engine/",
      kind: "third-party",
      note: "Uses https://www.perplexity.ai/?q=%s instead. Disagrees with the path above.",
    },
    {
      title: "u2l.ai — Perplexity prompt link generator",
      url: "https://u2l.ai/tools/perplexity-prompt-link-generator",
      kind: "third-party",
      note: "Claims /search/?q= pre-loads the query and runs it on page load. Unverified.",
    },
  ],
  lastVerified: "2026-11-16",
  verificationMethod: "device-tested",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      // Runs the question at once, so a consumer should show the message before launch (as for
      // signed-out ChatGPT).
      {
        id: "perplexity-web-search-q",
        label: "Open Perplexity with prompt",
        url: `https://www.perplexity.ai/search?q=${q}`,
        strategy: "url-prefill",
        experimental: false,
        evidence: "observed",
        note: "Undocumented ?q= parameter (browser search-engine format). Device-tested: the exact message arrives and is sent at once; it opened in the browser, not the app, on iPhone.",
      },
      {
        id: "perplexity-web-root-q",
        label: "Perplexity /?q= (test)",
        url: `https://www.perplexity.ai/?q=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "observed",
        note: "Alternative path from one guide. Device-tested: behaves like /search?q= (message arrives, sent at once, browser).",
      },
      copyAndOpen(perplexity),
    ];
  },
};
