import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const perplexity: ProviderAdapter = {
  id: "perplexity",
  name: "Perplexity",
  homeUrl: "https://www.perplexity.ai/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://www.perplexity.ai/search?q={prompt}" },
  // Device tests 2026-11-16 (compatibility/results.csv): iPhone 13 (Chrome) and a MacBook Air
  // (Chrome), plus an Android phone (Chrome) on 2026-11-17. Not documented by Perplexity, so "observed"
  // at most.
  nativeAppLaunch: {
    // With the app installed (2026-11-17, iPhone and Android), the app opened with the exact
    // message, from a camera scan and from a landing page. Without it, the browser opens.
    ios: "observed",
    android: "observed",
    desktop: "unverified", // only the web app was tested
  },
  promptPrefill: {
    desktop: "observed", // exact, accents, €, emoji and line breaks included
    ios: "observed",
    android: "observed",
  },
  // Sent straight away in every test but one (desktop signed out). On the iPhone it then asks for an
  // account before answering; on Android it answered without one. The landing-page preview is the only review a person gets.
  autoSubmit: "observed",
  autoSubmitNote: "Runs the question as soon as it opens (device tests 2026-11-16 and 2026-11-17).",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "Varies: signed out, the iPhone sent the question and then asked to sign in, and after sign-in the message was gone (iPhone and desktop, 2026-11-16). Android answered signed out without asking (2026-11-17).",
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
  lastVerified: "2026-11-17",
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
        note: "Undocumented ?q= parameter (browser search-engine format). Device-tested: the exact message arrives and is sent at once; it opens the app when installed (iPhone, Android), the browser otherwise.",
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
