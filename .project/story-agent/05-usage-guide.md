# Story Agent usage guide

## Setup

Use a local ignored `.env`; never commit keys. Configure API baseline values (`NODE_ENV`, `API_HOST`, `API_PORT`, `WEB_ORIGIN`, `LOG_LEVEL`), `MONGODB_URI`, and one complete provider.

```dotenv
LLM_PROVIDERS=groq
LLM_GROQ_BASE_URL=https://provider.example.com/v1
LLM_GROQ_API_KEY=your-key-here
LLM_GROQ_MODEL=your-model-here
LLM_PROFILE_FAST=groq
LLM_PROFILE_GENERATE=groq
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000
```

MongoDB must permit creation of `story_agent_runs` and `story_agent_drafts` collections/indexes.

## Commands

```bash
pnpm run dev
pnpm run check
pnpm run lint
pnpm test
pnpm run scan
pnpm --dir servers/api exec tsx --test features/story-agent/tests/*.test.ts
pnpm --dir servers/api exec tsx features/story-agent/story-agent.eval.ts
```

The focused `tsx --test` command is the offline, repeatable Story Agent quality gate. It uses fake provider responses and no MongoDB, credentials, or network access. It proves pipeline contracts such as validation, bounded repair/no-partial output, budgets, failover, circuit cooldown, duplicate-title handling, and prompt-data delimiters. It does not measure a provider's current quality or availability.

The evaluator is a separate live-provider command. The generation and repair prompts include the complete required Story schema and an example; this improves compliance but cannot guarantee every free-tier model will follow it. The injection fixture accepts either a valid draft or an explicit, controlled refusal during clarification only when no partial stories are returned. Other malformed outputs remain quality failures. Each fixture is classified as:

- `passed`: expected status and output contract were met.
- `quality_failed`: a provider responded but the expected behavior or output contract was not met.
- `inconclusive`: provider capacity/configuration prevented a meaningful judgment, including `providers_unavailable`/queued runs.

The evaluator exits `0` only when every fixture passes, `1` when one or more quality failures occur, and `2` when there are inconclusive fixtures but no quality failures. Inconclusive fixtures are never counted as passes. Its diagnostics are sanitized and omit raw model output, credentials, and prompt data. Run it only with configured provider access; it is not part of `pnpm test`.

The widget is the bottom-right sparkle button; Ctrl+J focuses it. Enter sends, Shift+Enter adds a newline. History lists saved runs; queued runs poll every 10 seconds.

## API

```bash
curl -X POST http://127.0.0.1:4000/story-agent/runs \
  -H "content-type: application/json" \
  -d '{"requirement":"As a content manager, I want a post editor with title, body, and publish action so that I can publish articles."}'
curl http://127.0.0.1:4000/story-agent/runs/REPLACE_WITH_RUN_ID
```

Draft/questions return `200`; queued returns `202`; failed returns `500`; validation errors return `400`; a full queue returns `503`. `queued` is not a draft—wait for worker retry and query the run again.

## Troubleshooting

| Symptom | Action |
|---|---|
| API routes 404 | Configure `MONGODB_URI` and restart; routes compose only with persistence. |
| Provider unavailable/queued | Check complete provider vars, profile names, quota, and cooldown. |
| Empty history | Check Mongo reachability and `NEXT_PUBLIC_API_BASE_URL`. |
| Input rejected | Requirement is 1–4000 chars; API context max is 8000. |
| Eval queues later fixtures | Provider quota/circuit cooldown; wait or configure independent capacity. |
