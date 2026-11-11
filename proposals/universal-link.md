# Proposal: one universal AIL link, opened by the person's default assistant

> Status: **proposal, not implemented.** No phone, operating system or assistant supports this today. It describes where AIL should go; v0.1 consumers don't need any of it.

## Goal

One link, one QR code, every assistant. When someone scans an AIL link, their phone opens **the assistant they chose as their default**, the same way `https://` opens the default browser and `mailto:` the default mail app. The person sees the message and decides whether to send it.

## Why it doesn't work today

- **iOS** only lets people choose defaults for categories Apple defines (browser, mail and a few more). Any app can register a custom scheme such as `ail:`, but iOS gives the person no way to pick which app handles it.
- **Android** is closer: several apps can register for the same scheme or intent, and the person picks one (with "always" or "just once"). It still needs assistant apps to register for an AIL scheme.
- **Providers** don't document any way to receive a draft message by link. ChatGPT's and Claude's `?q=` work, but undocumented (device tests 2026-11-11).

So today the universal part has to be a web page: a landing page that shows the message and lets the person pick their assistant.

## Proposed shape

### 1. Canonical https form (works today)

```
https://<host>/a/<id>                  landing page (people)
https://<host>/a/<id>/manifest.json    the AIL manifest (machines)
```

Printed QR codes always use this form. Anyone can fetch the manifest; the landing page covers every phone today. The reference implementation already serves both.

### 2. Proposed `ail:` URI (future)

```
ail:https://<host>/a/<id>/manifest.json
```

By reference, not inline: the handler fetches the manifest. That keeps links short, lets the publisher edit the content without reprinting, and lets the handler show where the content comes from (the host). An inline form (`ail:?prompt=…`) is deliberately left out: it freezes content into the code and hides its origin.

### 3. What a handler must do

These rules come from the v0.1 design rules and the device tests:

1. **Show before send.** Show the full message and its source host. **Never send it automatically.** Signed-out ChatGPT sends a `?q=` prefill immediately (tests 2026-11-11), which is exactly the behavior this rule rules out.
2. Treat the prompt as the person's own message, never as a system instruction.
3. Strip invisible characters, so what's shown is what's sent.
4. If the manifest can't be fetched or fails validation, say so and open nothing.

### 4. Fallback path

Until handlers exist, the https form opens the landing page, which hands off to the chosen assistant. Once assistants register for `ail:`, the landing page can offer an "Open in your default assistant" button with the `ail:` link, alongside the per-assistant buttons. Pages can't reliably detect whether a handler is installed, so the per-assistant buttons stay.

## What would make it real

- Assistant apps register an `ail:` handler (Android first, where the person can already choose).
- Apple and Google add a "default AI assistant" category that link handling can use.
- Or providers document a draft-message launch URL with no auto-send. AIL adapters can use that meanwhile.

AIL's job is to be the neutral payload all of these could agree on.
