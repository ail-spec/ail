#!/usr/bin/env node
// Prints an empty device-test log (CSV): one row per platform x provider x variant x case.
// Usage: node compatibility/generate-matrix.mjs > my-results.csv
// Fill in the result columns on real devices, following compatibility/PROTOCOL.md.

const platforms = ["ios", "android", "macos", "windows"]; // browser goes in the device column
const variants = {
  chatgpt: ["chatgpt-web-q", "chatgpt-web-q-temporary", "chatgpt-open"],
  claude: ["claude-web-q", "claude-native-scheme", "claude-open"],
  gemini: ["gemini-open", "gemini-web-q", "gemini-guided-learning-query"],
  perplexity: ["perplexity-open", "perplexity-web-search-q", "perplexity-web-root-q"],
  mistral: ["mistral-open", "mistral-web-chat-q"],
};
const cases = [
  "app-installed+logged-in",
  "app-installed+logged-out",
  "app-not-installed+logged-in(web)",
  "app-not-installed+logged-out(web)",
  "short-prompt",
  "long-prompt(~1800 chars)",
  "special-chars+non-English",
  "opened-from-QR-camera",
  "direct-QR-camera(no landing page)",
  "opened-from-WhatsApp",
];
const mobileOnly = new Set(["app-installed+logged-in", "app-installed+logged-out", "opened-from-QR-camera", "direct-QR-camera(no landing page)"]);

const cols = [
  "platform", "provider", "variant", "case",
  "native_app_opened(y/n)", "prompt_preloaded(y/n)", "prompt_submitted(y/n)",
  "user_actions(count)", "error_or_fallback", "evidence(documented|observed)",
  "doc_source", "date", "device+os+browser+app_version", "tester", "notes",
];
const esc = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

console.log(cols.join(","));
for (const platform of platforms) {
  const desktop = platform.includes("macos") || platform.includes("windows");
  for (const [provider, vs] of Object.entries(variants)) {
    for (const variant of vs) {
      for (const c of cases) {
        if (desktop && mobileOnly.has(c)) continue;
        const row = [platform, provider, variant, c, ...Array(cols.length - 4).fill("")];
        console.log(row.map(esc).join(","));
      }
    }
  }
}
