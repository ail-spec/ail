import { copyAndOpen, type ProviderAdapter } from "./types.ts";

export const claude: ProviderAdapter = {
  id: "claude",
  name: "Claude",
  homeUrl: "https://claude.ai/new",
  platforms: ["ios", "android", "desktop"],
  urlSchemes: {
    web: "https://claude.ai/new?q={prompt}",
    native: "claude://claude.ai/new?q={prompt}",
  },
  // Device tests 2026-11-11 (tests/compatibility/results.csv): iPhone 13 and Android, app
  // installed and signed in. Not documented by Anthropic, so "observed" at most.
  nativeAppLaunch: {
    ios: "observed", // https link and claude:// both opened the app
    android: "observed", // when the app is installed; without it, the browser's sign-in page
    desktop: "unverified", // only the web app was tested
  },
  promptPrefill: {
    desktop: "observed", // claude.ai shows a "Use caution before running this prompt" warning
    // Worked when tapped from the landing page. A direct camera scan of the https link opened
    // the app WITHOUT the message on iOS (it worked on Android); claude:// kept it on both.
    ios: "observed",
    android: "observed",
  },
  // Never sent by itself in any device test (signed in or signed out).
  autoSubmit: "unsupported",
  autoSubmitNote: "Never sent by itself in device tests, signed in or out.",
  maxPromptLength: null,
  safeUrlLength: 2000,
  requiresLogin:
    "Yes. Signed out, desktop Chrome kept the message through sign-in; Android Chrome lost it at the login page (2026-11-11). The clipboard copy covers that case.",
  requiresInstall: "No (web). App optional.",
  fallback: "Copy prompt, then open claude.ai/new.",
  docs: [
    {
      title: "Oasis Security — Claudy Day (claude.ai/new?q= prompt injection)",
      url: "https://www.oasis.security/blog/claude-ai-prompt-injection-data-exfiltration-vulnerability",
      kind: "security-advisory",
      note: "Describes /new?q= as pre-filling the chat box; hidden-HTML injection was fixed.",
    },
    {
      title: "starlight-llm-actions — provider strategies",
      url: "https://holdenhewett.github.io/starlight-llm-actions/getting-started/concepts/",
      kind: "third-party",
      note: "Claims ?q= broke in Oct 2025 (unsourced). Uses clipboard-open for Claude.",
    },
    {
      title: "Drafts directory — claude:// URL scheme action",
      url: "https://directory.getdrafts.com/a/25n",
      kind: "third-party",
      note: "Reports claude://claude.ai/new?q= opening the desktop and mobile apps.",
    },
  ],
  lastVerified: "2026-11-11",
  verificationMethod: "device-tested",
  variants(prompt) {
    const q = encodeURIComponent(prompt);
    return [
      {
        id: "claude-web-q",
        label: "Open Claude with prompt",
        url: `https://claude.ai/new?q=${q}`,
        strategy: "url-prefill",
        experimental: false,
        evidence: "observed",
        note: "Undocumented ?q= parameter. Device-tested: fills the composer, never sends. A direct camera scan on iOS lost the message.",
      },
      {
        id: "claude-native-scheme",
        label: "Claude app (claude://)",
        url: `claude://claude.ai/new?q=${q}`,
        strategy: "url-prefill",
        experimental: true,
        evidence: "observed",
        note: "Custom scheme. Opened the app with the message on iOS and Android. Fails if the app is not installed, so it should never be a default.",
      },
      copyAndOpen(claude),
    ];
  },
};
