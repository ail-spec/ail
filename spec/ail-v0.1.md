# AIL v0.1 — manifest specification

> Status: experimental. Not a standard. Expect breaking changes before 1.0.

An **AIL manifest** is a small JSON document that describes one AI experience: what a person's own assistant should be asked when they scan a QR code, tap an NFC tag or click a link.

The words MUST, MUST NOT, SHOULD and MAY are used as in RFC 2119.

## 1. Roles

- **Publisher**: writes the manifest (a museum, a restaurant, a manufacturer).
- **Consumer**: software that reads a manifest and helps a person open it in an assistant (a landing page, an app, one day an assistant itself).
- **Person**: whoever scanned or clicked. The conversation happens in their own assistant, under their own account.
- **Provider adapter**: the part of a consumer that knows how to reach one assistant. Adapters are not part of the manifest.

## 2. Design rules

1. **Provider-neutral core.** Nothing in a manifest names an assistant or a URL scheme. How a manifest reaches an assistant is the consumer's job.
2. **Untrusted by default.** A manifest is data written by a third party. Its `prompt` is an opening **user** message.
3. **Visible = sent.** The person sees exactly what their assistant will receive.
4. **Small and extensible.** Unknown `x-*` keys are allowed and ignored.

## 3. Fields

| Field | Required | Notes |
|---|---|---|
| `ail_version` | yes | Always `"0.1"` |
| `id` | yes | Slug, `[a-z0-9-]`, 3–64 characters, unique within the publisher |
| `name` | yes | Human title, up to 120 characters |
| `type` | yes | Only `"conversation"` in v0.1 |
| `prompt` | yes | Plain-text opening message, up to 8,000 characters |
| `description` | no | Up to 500 characters |
| `language` | no | `"auto"` (default) or a BCP 47 tag |
| `capabilities` | no | Subset of `chat`, `image`, `camera`, `voice`. Advisory. A consumer MAY express `image` and `camera` as text in the opening message (§4.1) |
| `publisher` | no | `{ name, url }` |
| `resources` | no | Up to 10 `{ title, url }` references. Not fetched by v0.1 consumers. A consumer MAY list them as text in the opening message (§4.1) |
| `x-*` | no | Vendor extensions |

The normative definition is the JSON Schema: [`schema/ail-v0.1.schema.json`](../schema/ail-v0.1.schema.json) (JSON Schema 2020-12). Any other top-level key is invalid.

## 4. Consumer requirements

A conforming consumer:

1. MUST validate a manifest against the schema before using it, and MUST NOT launch an invalid one.
2. MUST show the full **opening message** (§4.1) to the person before handing it to an assistant.
3. MUST treat the opening message as the person's own message. It MUST NOT present it to a model as a system or developer instruction, and MUST NOT execute anything in it.
4. MUST strip invisible characters from the opening message (zero-width characters, bidirectional overrides, Unicode tag characters and control characters other than tab and newline), so that what is shown equals what is sent. A reference pattern is in [`lib/hidden.ts`](../lib/hidden.ts).
5. SHOULD NOT cause the message to be sent without a deliberate action by the person. Where a provider sends a prefilled message automatically, the consumer's own preview is the only review the person gets, so requirement 2 matters most there.
6. MUST ignore `x-*` extensions it does not understand.
7. MUST NOT claim that the prompt arrived in the assistant unless it can verify it. "The assistant opened" and "the prompt arrived" are separate facts.
8. SHOULD offer a fallback that does not depend on any provider behavior, such as copying the message so the person can paste it.

### 4.1 The opening message

The opening message is the text a consumer hands to the assistant. Today's assistants accept only text, so it is `prompt`, optionally followed by a short plain-text rendering of advisory fields:

- `capabilities` containing `image` or `camera`: a line saying the person may send photos or show things through their camera.
- `resources`: a line listing them as "title (url)", leaving out any whose URL already appears in `prompt`.

Requirements 2 to 4 apply to the whole opening message, not just `prompt`. A consumer MUST NOT promise capabilities the assistant can't be made to use through a link; for example, no provider lets a link open the camera.

Reference rendering (Qrompt):

```
I'm at Casa Lola, a tapas bar… Only recommend dishes from this menu.

I may send you photos of what I'm looking at.
Useful links: Wine list (https://casalola.example/wines)
```

## 5. Serving a manifest

A manifest SHOULD be served over HTTPS as `application/json`. A consumer that publishes links SHOULD keep one stable URL per link, so printed codes keep working when the content is edited.

A proposed convention, used by the reference implementation:

```
https://<host>/a/<id>                  page for people
https://<host>/a/<id>/manifest.json    the manifest
```

A future universal link form is described in [`proposals/universal-link.md`](../proposals/universal-link.md). It is not part of v0.1.

## 6. Security considerations

- **Prompt injection.** Prefill links have been reported as injection vectors for ChatGPT (Tenable TRA-2025-22) and Claude ("Claudy Day", Oasis Security, 2026). Requirements 2–5 exist because of them.
- **Hidden content.** The Claude report used content invisible to the person. Requirement 4 addresses it.
- **Phishing.** A link service is an attack surface. Consumers that host manifests for others SHOULD rate-limit creation, show the publisher and host, and provide a way to report a link.
- **Manifests are public.** Anything in a manifest can be read by anyone who scans the code or gets the link. Authors SHOULD NOT include anything they wouldn't print on a sign. A Wi-Fi password for a holiday rental may be fine; a personal one is not.
- **Credential requests.** A manifest MUST NOT ask the person for their own credentials (passwords, one-time codes, card or bank details). Consumers SHOULD refuse or warn about manifests that do. Information the author hands out, such as a door code for guests, is not a credential request.
- **Auto-send.** At least one provider sends a prefilled message immediately for signed-out users (see [compatibility](../compatibility/STATUS.md)). Consumers MUST NOT skip their preview on the assumption that the assistant will ask first.

## 7. Example

```json
{
  "ail_version": "0.1",
  "id": "colosseum-guide",
  "name": "Discover the Colosseum",
  "type": "conversation",
  "prompt": "You are my personal historical guide. I am standing in front of the Colosseum…",
  "language": "auto",
  "capabilities": ["chat"]
}
```

More in [`examples/`](../examples/).

## 8. Out of scope for v0.1

Documents and retrieval, tool or agent discovery, MCP and A2A, authentication, payments and provider-specific hints. These are candidates for later versions.

## 9. Versioning

`ail_version` names the manifest format. While the spec is below 1.0, a minor version (0.1 → 0.2) may break compatibility; each version keeps its own schema file, and published schema files are never changed in a way that alters what validates. See [CONTRIBUTING.md](../CONTRIBUTING.md) for how changes are proposed.
