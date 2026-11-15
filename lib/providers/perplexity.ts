import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const perplexity: ProviderAdapter = {
  id: "perplexity",
  name: "Perplexity",
  homeUrl: "https://www.perplexity.ai/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://www.perplexity.ai/search?q={prompt}" },
  // Desk research 2026-11-15. No device test yet, and Perplexity documents no prefill URL.
  nativeAppLaunch: {
    // The iOS app's universal links (apple-app-site-association) cover /search and /search/*,
    // so /search?q= may open the app. "/" is covered only with ?s=m&uuid=…, so the home page
    // and /?q= most likely stay in the browser. Not tested.
    ios: "unverified",
    // assetlinks.json delegates to ai.perplexity.app.android; which paths the app claims is
    // set in its manifest, which we haven't checked. Not tested.
    android: "unverified",
    desktop: "unverified",
  },
  promptPrefill: {
    // Only third-party browser search-engine guides report ?q=, and they disagree on the path
    // (/search?q= vs /?q=). Search-engine use means "runs the query", not "fills the box".
    desktop: "unverified",
    ios: "unverified",
    android: "unverified",
  },
  // Search-engine guides and one link generator say the query runs as soon as the page loads.
  // If so, a signed-out or signed-in person gets no review, exactly like signed-out ChatGPT.
  autoSubmit: "unverified",
  autoSubmitNote: "Reported to run the query as soon as the page loads (search-engine use). Not device-tested.",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "Reportedly no for the web: signed-out searches are allowed. Not device-tested. The app may ask for an account.",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open perplexity.ai. This is the default until a device test.",
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
  lastVerified: "2026-11-15",
  verificationMethod: "desk-research",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      // Default is copy-and-open: the prefill is unverified and likely runs immediately, so a
      // consumer must not send people there by default before a device test.
      copyAndOpen(perplexity),
      {
        id: "perplexity-web-search-q",
        label: "Perplexity /search?q= (test)",
        url: `https://www.perplexity.ai/search?q=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "unverified",
        note: "Browser search-engine format (third-party guides). Likely runs the query at once. The server redirects to /search/new?q= (seen 2026-11-15; whether the message arrives was not checked). Covered by the iOS universal-link paths.",
      },
      {
        id: "perplexity-web-root-q",
        label: "Perplexity /?q= (test)",
        url: `https://www.perplexity.ai/?q=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "unverified",
        note: "Alternative path from one guide. Not covered by the iOS universal-link paths, so it likely stays in the browser.",
      },
    ];
  },
};
