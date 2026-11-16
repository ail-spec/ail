# AIL — AI Link

**An open, provider-neutral format for links that open a person's own AI assistant with a predefined prompt.**

Scan a QR code at a museum, tap an NFC tag on a product, click a link in an email: your own assistant (ChatGPT, Claude, Gemini…) opens with the right question ready. AIL describes that experience in a small JSON file, so any tool can create or read it.

> Status: experimental, v0.1. Not a standard. Expect breaking changes before 1.0.

```json
{
  "ail_version": "0.1",
  "id": "colosseum-guide",
  "name": "Discover the Colosseum",
  "type": "conversation",
  "prompt": "You are my personal historical guide. I am standing in front of the Colosseum…"
}
```

## Motivation

### The problem

People now have their own AI assistant, the way they have their own browser and their own email. A museum, a restaurant or a manufacturer would like to say "ask your assistant about this" and hand over the right question. Today they can't do it reliably:

- **Every assistant is reached differently.** ChatGPT, Claude and Gemini each have their own link behavior, and none of it is documented. What works today can stop working tomorrow.
- **A printed code can only point to one place.** A brand has to pick one assistant and leave everyone else out, or build its own page to route people.
- **Nothing protects the person.** A link can carry a prompt they never see, and at least one assistant sends it immediately when they are signed out.

The alternative brands use today is to build their own chatbot. That costs money, and the person has to trust and learn a new assistant instead of using the one they already have.

### The idea

One link that means **"open my assistant with this prompt"**, whichever assistant that is.

The web has solved this kind of problem before. An `https://` link opens whichever browser you chose. A `mailto:` link opens your mail app. A contact card opens in any address book. None of these belong to one company: they work because everyone agreed on a small, open format. AI assistants have no equivalent yet.

AIL is a proposal for that missing piece. It has two parts:

1. **A manifest**: a small JSON file that describes the experience (a title, the opening message, the language, the publisher). It never names an assistant.
2. **Rules for whoever opens it**: show the full message first, treat it as the person's own words, strip anything invisible, and never send it without the person choosing to.

### The objective

For AIL, or something like it, to become a shared standard that brands can print and that assistants and phones understand natively: you scan a code, your phone hands it to your default assistant, and the assistant shows you the message and waits.

That needs assistant makers and operating systems to adopt it, which no single project can make happen. What an open project can do is make adoption easy:

- a format small enough to implement in an afternoon,
- safety rules that answer the security concerns providers already have about prefill links,
- public evidence of what works today, so nobody has to guess,
- a working path in the meantime, so brands can use it now.

### How it works today, and where it's going

| | What reads the manifest | How the assistant opens |
|---|---|---|
| **Today** | A landing page (an *AIL consumer*) | The page shows the message, the person picks their assistant, and a provider adapter builds that assistant's link. The assistant never sees the manifest. |
| **Next** | The same, with less guesswork | Providers document a "draft message" link with no auto-send. Adapters become reliable. |
| **Goal** | The assistant itself | One universal link. The phone opens the person's default assistant, which reads the manifest and shows the message. See the [universal link proposal](proposals/universal-link.md). |

Today the manifest mostly keeps links portable: any tool can create or read the same link, so a brand's links aren't locked into one vendor. Its real purpose is the last row.

## What's here

| | |
|---|---|
| [`spec/ail-v0.1.md`](spec/ail-v0.1.md) | The specification: fields and what a consumer must do |
| [`schema/`](schema/) | JSON Schema for validating manifests |
| [`examples/`](examples/) | Example manifests |
| [`compatibility/`](compatibility/) | **What works today** on each assistant and platform, with device-test results |
| [`lib/`](lib/) | Reference library (TypeScript): validation, hidden-character stripping, provider adapters |
| [`proposals/`](proposals/) | Ideas for future versions, such as one universal link opened by the default assistant |

## Does it work today?

Partly, and only through undocumented behavior. Device tests on 2026-11-11:

| Assistant | App opens (iOS / Android) | Prompt arrives | Sends by itself |
|---|---|---|---|
| ChatGPT | 🟢 / 🟢 | 🟢 observed | Only when signed out |
| Claude | 🟢 / 🟢 | 🟢 observed | Never observed |
| Gemini | 🟢 / ⚪ | Copy and paste | — |
| Perplexity | ⚪ browser / ⚪ | 🟢 observed (iOS, desktop) | Always, at once |
| Mistral | ⚪ browser / ⚪ | 🟢 observed (iOS, desktop) | Always, at once |

Perplexity and Mistral were device-tested on 2026-11-16 (iPhone and desktop; Android not yet). **No provider documents a prefill URL.** Full table, launch URLs and sources: [`compatibility/STATUS.md`](compatibility/STATUS.md). Results come from one device per platform, so [more device reports](compatibility/PROTOCOL.md) are very welcome.

## Principles

1. **Provider-neutral.** A manifest never names an assistant. Adapters do that.
2. **The person stays in control.** They see the full message before it goes anywhere, and they send it.
3. **Untrusted by default.** A manifest is third-party text: a user message, never a system instruction.
4. **Honest about evidence.** Every compatibility claim is marked documented, observed, conflicting, unverified or unsupported.

## Use it

```bash
npm install
npm run validate                 # validate examples/*.json
npm run validate -- my-link.json # validate your own manifest
npm test                         # library tests
npm run status                   # rebuild the compatibility table from the adapters
```

Requires Node 22.18 or newer.

```ts
import { validateManifest, sanitizePrompt, providers, defaultVariant } from "./lib/index.ts";

const check = validateManifest(manifest);           // { ok: true } or { ok: false, errors }
const prompt = sanitizePrompt(manifest.prompt);     // strips invisible characters
for (const p of providers) console.log(p.name, defaultVariant(p, prompt).url);
```

### From another project

The library ships as TypeScript source, with no build step. Install it from GitHub, pinned to a commit:

```bash
npm install https://codeload.github.com/ail-spec/ail/tar.gz/<commit>
```

```ts
import { validateManifest, providers } from "ail-spec";
import schema from "ail-spec/schema";
```

In browser code, import only what you need (`ail-spec/providers`, `ail-spec/hidden`), so the schema validator stays out of the bundle.

Your bundler has to compile it (for Next.js, `transpilePackages: ["ail-spec"]`), and TypeScript needs `allowImportingTsExtensions`.

## Implementations

- [Qrompt](https://qrompt.app), the reference implementation: it turns a manifest into a link and a QR code, and shows the message on a landing page before opening the person's assistant.

Built something that reads or writes AIL? Open a pull request to add it here.

## Contribute

- **Test your phone** and [report what happened](compatibility/PROTOCOL.md). This is the most useful contribution.
- **Add an assistant**: one adapter file in [`lib/providers/`](lib/providers/).
- **Propose a change** to the format: open an issue first.

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## Related work

- IETF draft [`draft-boone-prompt-uri-scheme`](https://datatracker.ietf.org/doc/draft-boone-prompt-uri-scheme/): a URI scheme for prompts.
- Security research on prefill links: [Tenable TRA-2025-22](https://www.tenable.com/security/research/tra-2025-22) (ChatGPT) and [Oasis Security, "Claudy Day"](https://www.oasis.security/blog/claude-ai-prompt-injection-data-exfiltration-vulnerability) (Claude).

## License

[Apache-2.0](LICENSE).
