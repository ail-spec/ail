import { copyAndOpen, type ProviderAdapter } from "./types.ts";

// Mistral renamed Le Chat to Vibe on 2026-08-12 (Mistral Help Center). Same URL and login:
// chat.mistral.ai. The display name is just "Mistral", which covers both.
export const mistral: ProviderAdapter = {
  id: "mistral",
  name: "Mistral",
  homeUrl: "https://chat.mistral.ai/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://chat.mistral.ai/chat?q={prompt}" },
  // Device tests 2026-11-16 (compatibility/results.csv): iPhone 13 (Chrome) and a MacBook Air
  // (Chrome), plus an Android phone (Chrome) on 2026-11-17. Not documented by Mistral, so "observed"
  // at most.
  nativeAppLaunch: {
    // Every iPhone test opened the browser, /chat/?q= (covered by the app's universal links)
    // included. Whether the app was installed wasn't recorded.
    ios: "unverified",
    // Android: every test opened the browser (app not installed where recorded). The tester noted
    // that it opens in the app when installed, but no test logged that.
    android: "unverified",
    desktop: "unverified", // only the web app was tested
  },
  promptPrefill: {
    desktop: "observed", // exact, accents, €, emoji and line breaks included
    ios: "observed",
    android: "observed",
  },
  // Sent straight away in every test but one: signed out on Android it asked to sign in first and
  // kept the message.
  autoSubmit: "observed",
  autoSubmitNote: "Sends the message as soon as it opens (device tests 2026-11-16 and 2026-11-17).",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "Signed out it asks to sign in. Desktop (2026-11-16) and Android (2026-11-17) kept the message through sign-in; on the iPhone the message didn't appear (2026-11-16, to retest).",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open chat.mistral.ai.",
  docs: [
    {
      title: "Mistral Help Center — Le Chat is now Vibe",
      url: "https://help.mistral.ai/en/articles/682992-le-chat-is-now-vibe",
      kind: "official",
      note: "Renamed 2026-08-12; same URL (chat.mistral.ai) and login. Mentions no URL parameters.",
    },
    {
      title: "Mistral — apple-app-site-association (iOS universal links)",
      url: "https://chat.mistral.ai/.well-known/apple-app-site-association",
      kind: "official",
      note: "Provider-published file, read 2026-11-15. Covers /chat/* but not bare /chat; documents no URL parameters.",
    },
    {
      title: "searcher (R package) — ask_mistral",
      url: "https://r-pkg.thecoatlessprofessor.com/searcher/reference/ask_mistral.html",
      kind: "third-party",
      note: "Builds chat.mistral.ai/chat?q= links. Says nothing about auto-send or sign-in.",
    },
  ],
  lastVerified: "2026-11-17",
  verificationMethod: "device-tested",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      // Sends at once, so a consumer should show the message before launch.
      {
        id: "mistral-web-chat-q",
        label: "Open Mistral with prompt",
        url: `https://chat.mistral.ai/chat?q=${q}`,
        strategy: "url-prefill",
        experimental: false,
        evidence: "observed",
        note: "Undocumented ?q= parameter. Device-tested: the exact message arrives and is sent at once; it opened in the browser on iPhone and Android, as did /chat/?q=.",
      },
      copyAndOpen(mistral),
    ];
  },
};
