import { copyAndOpen, type ProviderAdapter } from "./types.ts";

// Mistral renamed Le Chat to Vibe on 2026-08-12 (Mistral Help Center). Same URL and login:
// chat.mistral.ai. The display name is just "Mistral", which covers both.
export const mistral: ProviderAdapter = {
  id: "mistral",
  name: "Mistral",
  homeUrl: "https://chat.mistral.ai/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://chat.mistral.ai/chat?q={prompt}" },
  // Desk research 2026-11-15. No device test yet, and Mistral documents no prefill URL.
  nativeAppLaunch: {
    // The iOS app's universal links cover /chat/* (with the slash), /incognito, /work and /code,
    // but not bare /chat or "/", so /chat?q= and the home page most likely stay in the browser.
    // Not tested.
    ios: "unverified",
    // assetlinks.json delegates to ai.mistral.chat; the claimed paths live in the app manifest,
    // which we haven't checked. Not tested.
    android: "unverified",
    desktop: "unverified",
  },
  promptPrefill: {
    // One third-party source (R package `searcher`, ask_mistral) builds /chat?q= links.
    desktop: "unverified",
    ios: "unverified",
    android: "unverified",
  },
  autoSubmit: "unverified",
  autoSubmitNote: "Unknown whether ?q= fills the box or sends. Not device-tested.",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin: "Unverified. Signed-out behavior of the web app and of ?q= has not been tested.",
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
  lastVerified: "2026-11-15",
  verificationMethod: "desk-research",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      // Default since 2026-11-16, before any device test. Evidence stays "unverified" until one.
      {
        id: "mistral-web-chat-q",
        label: "Open Mistral with prompt",
        url: `https://chat.mistral.ai/chat?q=${q}`,
        strategy: "url-prefill",
        experimental: false,
        evidence: "unverified",
        note: "Used by one third-party tool. Fill vs. send and signed-out behavior unknown. Not covered by the iOS universal-link paths, so it likely stays in the browser.",
      },
      copyAndOpen(mistral),
    ];
  },
};
