# Contributing to AIL

Thanks for helping. AIL is young, so small, concrete contributions matter most.

## Ways to contribute

### 1. Report a device test (most useful)

Provider behavior changes without notice. Follow [`compatibility/PROTOCOL.md`](compatibility/PROTOCOL.md) and open a **Compatibility report** issue, or send a pull request that adds rows to [`compatibility/results.csv`](compatibility/results.csv).

### 2. Fix or add a provider adapter

Adapters live in [`lib/providers/`](lib/providers/), one file per assistant. They are the single source of truth for every compatibility claim.

- Use the evidence levels honestly: **documented** only when the provider's own docs say so; **observed** for device tests or several independent reports; **conflicting**, **unverified** and **unsupported** as defined in [`lib/providers/types.ts`](lib/providers/types.ts).
- Add a reference in `docs` for each claim, and update `lastVerified`.
- Default variants must be `https` and non-experimental.
- Run `npm run status` and commit the regenerated `compatibility/STATUS.md` and `site/status.json`.

### 3. Propose a change to the format

Open an issue before writing a pull request. Describe the problem, not just the field you want. Larger ideas go in [`proposals/`](proposals/) as a short document first.

## Before you open a pull request

```bash
npm install
npm run check   # validate examples, type-check, tests, status up to date
```

## Rules the project keeps

- A manifest never names a provider or a URL scheme.
- Never present an undocumented URL parameter as supported.
- Report "the assistant opened" and "the prompt arrived" separately.
- Manifest content is untrusted user-level text. Nothing in the spec or library may treat it as a system instruction.
- `lib/hidden.ts` stays ASCII-only, so the invisible characters it removes are visible in review.

## Versioning and decisions

- The spec is below 1.0. A new minor version may break compatibility and gets its own schema file. A published schema file is never changed in a way that alters what validates.
- For now the maintainers decide by consensus in issues and pull requests. This will be written down in more detail as more people join.

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
