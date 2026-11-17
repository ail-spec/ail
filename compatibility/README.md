# Compatibility

How ChatGPT, Claude, Gemini, Perplexity and Mistral Vibe (Le Chat) behave when a link tries to open them with a prompt.

- **[STATUS.md](STATUS.md)**: the current status table, generated from the adapters in [`lib/providers/`](../lib/providers/).
- **[results.csv](results.csv)**: the raw device-test log.
- **[PROTOCOL.md](PROTOCOL.md)**: how to test your own device and contribute a result.

## Perplexity and Mistral: device results (2026-11-16, Android 2026-11-17)

One iPhone 13 (Chrome), one MacBook Air (Chrome) and one Android phone (Chrome, model not recorded), one tester. Neither provider documents a prefill URL, so everything here is *observed* at most.

| Flow | Perplexity `/search?q=` | Mistral `/chat?q=` |
|---|---|---|
| Opens, iPhone and Android | App when installed, with the message (camera scan and landing page); browser otherwise | Same |
| Opens, desktop | Web | Web |
| Message arrives | ✅ exact, accents, €, emoji, 東京, line breaks (all three devices) | ✅ exact (all three devices) |
| **Sent by itself** | **Yes, at once**; on the iPhone it then asks for an account before answering | **Yes, at once**, except signed out on Android (see below) |
| Signed out | iPhone, desktop: asks to sign in; after sign-in the message is gone. Android: answered without asking | Desktop and Android: asks to sign in, message kept and sent after. iPhone: message didn't appear (result contradictory, retest) |

What this means for consumers:

1. **Both send the message with no review.** A page that shows the message before launch, like the one ChatGPT needs for signed-out visitors, is the only review a person gets.
2. **The apps open when installed**, on iPhone and Android, with the message (tester report, 2026-11-17; not logged per test, and sign-in state and in-app auto-send weren't recorded). The earlier browser results were without the apps.
3. `perplexity.ai/?q=` behaves like `/search?q=`, so it stays an experimental alternative.

Desk research before the tests (2026-11-15): formats from third-party sources only (browser search-engine guides for Perplexity, the R package `searcher` for Mistral); Mistral's help center says Le Chat became Vibe on 2026-08-12 at the same address.

## Device results (2026-11-11)

One iPhone, one Android phone and one laptop, one tester, one day. That's enough to replace guesses with observations, not to promise behavior: everything here is still undocumented and can change. "Opened" and "message in the box" are separate columns on purpose.

| Flow | ChatGPT | Claude | Gemini |
|---|---|---|---|
| Landing page → tap, iPhone | App opens · message ✅ | App opens · message ✅ | App opens · paste needed |
| Landing page → tap, Android | App opens (asks app or Chrome once) · message ✅ | App opens when installed · message ✅ | Gemini app not installed: Chrome · paste needed |
| Landing page → click, desktop browser | Web · message ✅ | Web · message ✅ (with a "Use caution before running this prompt" warning) | Web · paste needed |
| Accents, €, line breaks | Exact on all three devices | Exact on all three devices | n/a |
| **Sent by itself** | **Signed in: no. Signed out: yes**, immediately (desktop incognito, Android private tab) | Never | Never |
| Signed out | Message sent with no review | Desktop: message kept through sign-in. Android: lost at the login page | n/a |
| Direct QR (camera → provider URL) | App opens · message ✅ (iPhone, Android) | `https`: iPhone app opens **without** the message; Android ✅. `claude://`: ✅ on both | App opens (iPhone); browser (Android, no app) |
| From WhatsApp | iPhone: app · message ✅; no in-app-browser warning shown. Android: not tested | — | — |

What changed versus the desk research:

1. **Prefill works in the native apps.** ChatGPT `?q=` and Claude `/new?q=` both survived the hand-off to the iOS and Android apps. Claude moves from *conflicting* to *observed*.
2. **ChatGPT's auto-submit depends on sign-in.** That explains the conflicting reports: Tenable saw a signed-out session. For a signed-out person, a landing page that shows the message is the only place they see the message before it is sent.
3. **Claude never auto-submits** and adds its own warning on desktop.
4. **A direct QR is only safe to consider for ChatGPT** (signed-in users) and for Claude via `claude://` (app required). It skips the preview that point 2 depends on, so consumers should not use it by default.
5. **Gemini stays copy-and-open.** Its `?q=` / `?query=` variants were not device-tested.

Open questions: which browser the iPhone tests used (the log says Chrome; notes mention Safari prompts), test `android-02` (opened in the browser but the message arrived; app installed or not?), the Android WhatsApp test (skipped), and the Android model/OS (not recorded).


## Desk research (2026-11-10)

This came before the device tests. Where the two disagree, the device results above win.

### Headline findings

1. **None of the three providers officially documents a URL parameter that pre-fills a prompt.** Every prefill mechanism below is undocumented behavior that third parties reported. It can change or disappear without notice.
2. **Opening a link ≠ transferring the prompt.** These are reported separately everywhere in this repo.
3. **Security pressure works against prefill.** Both ChatGPT `?q=` (Tenable TRA-2025-22) and Claude `/new?q=` ("Claudy Day", Oasis Security, Mar 2026) were reported as prompt-injection vectors. Providers have reason to restrict these parameters (no auto-submit, confirmation steps) or remove them.
4. **Gemini has no reliable prefill.** Several browser extensions exist only to add `?q=` / `?prompt=` to Gemini, which strongly suggests it isn't native. One generator site claims otherwise. The reference adapters default Gemini to copy-and-open.
5. **Native apps are unverified for every provider.** Opening the app from an `https://` link depends on each domain's universal-link (iOS) / App Links (Android) files covering that path. Run `npm run check:applinks` to see which paths are covered.


### References

- Tenable TRA-2025-22 — ChatGPT prompt injection via `?q=`: https://www.tenable.com/security/research/tra-2025-22
- OpenAI community — query parameters (`?q=`, `hints=search`, `temporary-chat`): https://community.openai.com/t/query-parameters-in-chatgpt/1027747
- OpenAI community — request for an official Custom GPT deep link (none exists): https://community.openai.com/t/deep-linking-for-custom-gpts-with-url-parameters-launch-context/1370871
- Oasis Security — Claudy Day (`claude.ai/new?q=`): https://www.oasis.security/blog/claude-ai-prompt-injection-data-exfiltration-vulnerability
- starlight-llm-actions — provider strategies (claims Claude `?q=` broke Oct 2025): https://holdenhewett.github.io/starlight-llm-actions/getting-started/concepts/
- Drafts directory — `claude://` scheme action: https://directory.getdrafts.com/a/25n
- Google Help — Gemini learning tools (no URL prefill documented): https://support.google.com/gemini/answer/16448384
- gemini-url-prompt extension (adds prefill Gemini lacks): https://github.com/elliot79313/gemini-url-prompt
- u2l.ai — claims Gemini `?q=` works natively: https://u2l.ai/tools/gemini-prompt-link-generator
