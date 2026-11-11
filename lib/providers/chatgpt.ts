import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const chatgpt: ProviderAdapter = {
  id: "chatgpt",
  name: "ChatGPT",
  homeUrl: "https://chatgpt.com/",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: { web: "https://chatgpt.com/?q={prompt}" },
  // Device tests 2026-11-11 (tests/compatibility/results.csv): iPhone 13 and Android, app
  // installed and signed in. Not documented by OpenAI, so "observed" at most.
  nativeAppLaunch: {
    ios: "observed", // https link opened the app, from the landing page and from a camera scan
    android: "observed", // Android asks once whether to open in the app or Chrome
    desktop: "unverified", // only the web app was tested
  },
  promptPrefill: {
    desktop: "observed",
    ios: "observed", // in the app, including a direct camera scan of the ?q= link
    android: "observed",
  },
  // Depends on sign-in (device tests 2026-11-11): signed in, q= only fills the composer; signed
  // out (incognito on desktop Chrome, private tab on Android Chrome) it was sent immediately.
  // This matches Tenable TRA-2025-22. The landing-page preview is the only review a signed-out
  // person gets.
  autoSubmit: "observed",
  autoSubmitNote: "Signed in: fills the composer only. Signed out: sent immediately.",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "No for the web: signed out, the message is sent immediately (observed 2026-11-11). The app requires an account.",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open chatgpt.com.",
  docs: [
    {
      title: "Tenable TRA-2025-22 — ChatGPT prompt injection via ?q=",
      url: "https://www.tenable.com/security/research/tra-2025-22",
      kind: "security-advisory",
      note: "Confirms q= is read by the web UI and (at the time) auto-submitted.",
    },
    {
      title: "OpenAI community — Query parameters in ChatGPT",
      url: "https://community.openai.com/t/query-parameters-in-chatgpt/1027747",
      kind: "third-party",
      note: "Reports ?q=, &hints=search, &temporary-chat=true.",
    },
    {
      title: "OpenAI community — Deep linking for Custom GPTs (feature request)",
      url: "https://community.openai.com/t/deep-linking-for-custom-gpts-with-url-parameters-launch-context/1370871",
      kind: "third-party",
      note: "Shows there is no official, stable deep-link mechanism.",
    },
  ],
  lastVerified: "2026-11-11",
  verificationMethod: "device-tested",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      {
        id: "chatgpt-web-q",
        label: "Open ChatGPT with prompt",
        url: `https://chatgpt.com/?q=${q}`,
        strategy: "url-prefill",
        experimental: false,
        evidence: "observed",
        note: "Undocumented ?q= parameter. Device-tested: fills the composer when signed in; sends immediately when signed out.",
      },
      {
        id: "chatgpt-web-q-temporary",
        label: "ChatGPT, temporary chat",
        url: `https://chatgpt.com/?q=${q}&temporary-chat=true`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "observed",
        note: "Community-reported flag; keeps the chat out of history.",
      },
      copyAndOpen(chatgpt),
    ];
  },
};
