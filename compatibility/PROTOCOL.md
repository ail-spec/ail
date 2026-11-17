# Testing a device

Provider behavior changes without notice, so fresh device results are the most useful contribution to AIL. One phone and ten minutes is enough.

## What you need

- A phone or computer, with the assistant apps you normally use.
- A way to open test links. Either:
  - build them from the URL patterns in [STATUS.md](STATUS.md#launch-variants), replacing `{prompt}` with a URL-encoded message, or
  - use any AIL consumer that exposes its launch variants for testing.
- For the "camera" cases: show the link as a QR code on another screen and scan it with the phone's built-in camera app.

## What to record

One row per **variant × case** in a copy of the log (`npm run matrix > my-results.csv`), or just describe it in a [compatibility report](../../../issues/new?template=compatibility-report.yml).

| Column | Meaning |
|---|---|
| `native_app_opened` | The provider's installed app came to the front (not a web page inside another app). |
| `prompt_preloaded` | The exact message is in the chat box, accents and line breaks intact. |
| `prompt_submitted` | The message was sent **without** you tapping send. |
| `user_actions` | Taps from opening the link to a sent message, counting paste and send. |
| `error_or_fallback` | What happened instead, if it didn't work. |
| `device+os+browser+app_version` | As exact as you can. App versions matter. |

Always report "the assistant opened" and "the message arrived" separately. They fail independently.

## Cases worth testing

- App installed and signed in / signed out / not installed.
- A short message, a long one (about 1,800 characters), and one with accents, emoji and line breaks.
- Link tapped in a browser, scanned by the camera, and opened from a messaging app such as WhatsApp.
- A private or incognito window. Signed-out behavior can differ a lot: ChatGPT sent the message immediately when signed out.

## Evidence rules

- What you see on a device is **observed**.
- Only the provider's own documentation justifies **documented**.
- If your result contradicts the current status, say so. A change from *observed* to *conflicting* is useful information.

## New assistants

Perplexity and Mistral were tested on an iPhone, a desktop browser (2026-11-16) and an Android phone (2026-11-17). With the apps installed, both opened in the app with the message on iPhone and Android. Most wanted now: whether the apps send the message at once, signed in and out, and Mistral signed out on an iPhone in the browser (that result was contradictory).

## Minimum useful pass

One phone × the default variant of each assistant × {app installed and signed in, special characters, scanned by camera}. That's about 9 rows.
