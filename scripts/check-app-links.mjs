#!/usr/bin/env node
// Fetch each provider's published universal-link (iOS) and App Links (Android) files.
// They show which URL paths can open the native app at all — a hard prerequisite for
// "open the app with a prompt" via an https link. Run from a machine with internet access.
//   node scripts/check-app-links.mjs

const hosts = ["chatgpt.com", "claude.ai", "gemini.google.com"];
const files = [".well-known/apple-app-site-association", ".well-known/assetlinks.json"];

for (const host of hosts) {
  console.log(`\n=== ${host} ===`);
  for (const f of files) {
    const url = `https://${host}/${f}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const text = await res.text();
      console.log(`\n${url} → HTTP ${res.status}`);
      if (!res.ok) continue;
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.log("  (not JSON)");
        continue;
      }
      if (json.applinks) {
        for (const d of json.applinks.details ?? []) {
          const ids = d.appIDs ?? (d.appID ? [d.appID] : []);
          console.log(`  appIDs: ${ids.join(", ")}`);
          for (const p of d.paths ?? []) console.log(`    path: ${p}`);
          for (const c of d.components ?? []) console.log(`    component: ${JSON.stringify(c)}`);
        }
      } else if (Array.isArray(json)) {
        for (const s of json) {
          if (s.target?.package_name) console.log(`  package: ${s.target.package_name} (${(s.relation ?? []).join(", ")})`);
        }
      } else {
        console.log(`  ${text.slice(0, 400)}`);
      }
    } catch (e) {
      console.log(`\n${url} → error: ${e.message}`);
    }
  }
}
console.log("\nCheck: is '/' (ChatGPT) or '/new' (Claude) or '/app' (Gemini) covered, and are query strings excluded?");
