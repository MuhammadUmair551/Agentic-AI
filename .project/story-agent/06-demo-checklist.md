# Story Agent four-path demo

Prerequisites: API/web running, Mongo configured, provider quota available. Never record real keys.

## Questions

Submit `Build it.` in widget or POST body. Expect `200 status:"questions"` with question strings. GET by ID should show `run.status="questions"` and `draft:null`. Existing evidence: service test `stops after blocking clarification questions`.

## Draft

Submit: `As a content manager, I want to create a blog post with title, body, and publish button so that I can publish articles on the website.` Expect `200 status:"draft"`, non-empty stories, usage. GET by ID must show `draft.stories`; confirm matching Mongo run/draft records. In UI, expand AC on a card. Observed live evidence: clear fixture drafted in all three 2026-10-17 runs; real output remains quota dependent.

## Failed / over-budget (safe fake)

Do not exhaust paid quota. Run:

```bash
pnpm --dir servers/api exec tsx --test features/story-agent/tests/story-agent.service.test.ts
```

The case `fails when model-call budget is exceeded` asserts `failed` with `over_budget`. This is fake-router evidence, not real-provider E2E.

## Invalid then repaired (safe fake)

Run the same service test. `repairs invalid generated stories` uses fake invalid output then repaired output and asserts a three-call draft. Live eval cannot reproducibly force invalid model output without code/provider changes.

Only mark a path passed after performing its listed verification. If Mongo/provider credentials are unavailable, paths 1–2 are manual environment-dependent checks; paths 3–4 still run deterministically.
