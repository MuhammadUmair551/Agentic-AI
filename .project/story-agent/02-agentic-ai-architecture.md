# Story Agent: Architecture (draft v0.3)

Owner: Umair. Self-contained feature inside the new Squid codebase.
Repo rules win over this doc: `AGENTS.md`, `CLAUDE.md`, `architecture.yaml`, `.agent/*`. If anything here conflicts with them, the coding agent must report the conflict, not choose silently.
The old Squid docs are used only as a story-format reference and sample data.

## 1. Purpose and scope

Input: a requirement (plus optional context). Output: either clarifying questions, or a draft set of stories (thin vertical slices, acceptance criteria, size), saved as a draft and visible in a UI.

**V1 in scope:** requirement -> clarify -> stories/slices/AC -> validate/repair -> save draft + run log (MongoDB Atlas) -> API -> UI with history.
**V1 out of scope:** tasks and test-case generation, accept/reject workflow, tool calling, multi-agent, RAG, Redis, Docker, streaming, training anything. Quality bar: working.

## 2. Repo rules that shape it

| Rule (AGENTS.md / CLAUDE.md) | Consequence |
|---|---|
| Feature-first, flat server feature files | `story-agent.route.ts / .controller.ts / .service.ts / .repository.ts / .validation.ts / .model.ts / .integration.ts`. No `domain/`. |
| Functional style, explicit dependencies, no classes/DI/global state | Stages are `(input, deps) => result`. Model client and clock passed in. |
| External systems behind `.integration.ts` | LLM provider only there. |
| Contracts local until reused | Story schema stays in the feature (zod). |
| Application work != foundation work | Never edit `codebase/`, `architecture.yaml`, `.agent/`, `AGENTS.md`, `CLAUDE.md`, `pnpm-workspace.yaml`. |
| New dependency only with reason | Agent must ask first. |
| pnpm; `pnpm run check/typecheck/lint/test/scan` | Each step ends with the smallest useful command. |

## 3. Decisions (made; change only with a reason)

| ID | Decision | Choice | Why |
|---|---|---|---|
| D1 | Where | Server feature `story-agent` + web page, in the existing server and web units (found by recon) | Feature-first rule; no new units unless recon shows none exist |
| D2 | Model access | One **OpenAI-compatible chat-completions client**, configured only by env: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` | Many free providers and gateways speak this format; switching = changing env, not code. [Likely] |
| D3 | Loop | Hand-written **repair loop**: generate -> validate in code -> send errors back -> retry max 2. No framework, no tool calling in V1 | Free models are weak at tool calling and JSON; code-side validation works with any model. [Likely] |
| D4 | Storage | MongoDB Atlas: `story_agent_runs`, `story_agent_drafts`, via the repo's existing Mongo access pattern | Stated requirement; no Redis/Docker |
| D5 | Quality bar | Working: valid draft or clear `questions`/`failed` status; eval prints valid-output rate on 5 samples | Stated requirement |

## 4. Context

```
Person -> [Web page] -> [Story Agent API] -> Model provider (OpenAI-compatible, free)
                               |-> MongoDB Atlas (runs, drafts)
Person <- [Web page] <- questions | draft stories | failed + reason
```

## 5. Pipeline (workflow + repair loop)

| # | Stage | Kind | Does |
|---|---|---|---|
| 1 | Intake | code | Validate, length limits, run id |
| 2 | Gather context | code | Optional context text + a limited list of existing story titles for duplicate check |
| 3 | Clarify | model (JSON) | Blocking ambiguity -> status `questions`, stop. Else assumptions list |
| 4 | Generate | model (JSON) | Stories: thin vertical slices, AC, size S/M/L, openQuestions, sliceRationale |
| 5 | Validate | code | zod, >=1 AC, size, unique titles, no duplicates vs existing, max stories |
| 6 | Repair loop | model | On failure send errors back, max 2 retries, else `failed`; never partial output |
| 7 | Finalize | code | Save run + draft to Atlas, return result |

Budget per run: max model calls (~6), max total tokens, overall timeout. Exceeded -> `failed` (`over_budget`).
Stretch (later): tool calling for context, critic pass, accept/reject.

## 6. Contracts (shapes only)

**Story:** `title ("A <role> <does> <outcome>") · intent · epic · size S|M|L · acceptanceCriteria[] · states[] · dependsOn[] · openQuestions[] · sliceRationale`

**API** (follow the repo's route, auth, error conventions; paths below are indicative):
- `POST /story-agent/runs` `{requirement, context?}` -> `{runId, status: questions|draft|failed, questions? | stories? | error?, usage}`
- `GET /story-agent/runs` (newest first, paginated, requirement preview)
- `GET /story-agent/runs/:id` (run + draft)

**Collections:**
- `story_agent_runs`: runId, requirement, context, status, model, promptVersions, attempts, usage{inputTokens, outputTokens, calls}, durationMs, validationErrors, error, createdAt
- `story_agent_drafts`: runId, stories[], reviewStatus (`draft` only in V1), createdAt
- Indexes: runId unique, createdAt desc

**Env:** `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, optional `LLM_TIMEOUT_MS`; Mongo URI already exists in the repo. Names go in `.env.example`, values never in git.

## 7. UI (V1)

One page: requirement + optional context, Generate button; loading state (calls can take up to ~60 s); error state; result as question list or story cards (title, intent, size badge, AC, slice rationale, open questions); run info (model, tokens, duration, attempts); history list and opening a past run; empty state. Layout is proposed by the coding agent and approved by Umair before building. Follows `.agent/instructions/ui-composition.md` (shadcn, Tailwind).

## 8. Rubric (what a good story is)

One actor, one outcome. Demonstrable on its own (vertical, not "build the table"). Testable AC. Size fits. No duplicates. No invented requirements: unknowns become assumptions/open questions.

## 9. Failure branches

| Failure | Behaviour |
|---|---|
| Ambiguous requirement | Status `questions`, no stories |
| Invalid output after 2 repairs | `failed`, reason, nothing partial |
| Over budget / timeout | `failed` (`over_budget`) |
| Provider 429/5xx | Bounded retry with backoff, then `failed`; run still saved |
| Oversized/empty input | Rejected at intake |

## 10. Security

Requirement and context are data, never instructions: delimit in prompts. Keys only from env; never logged or committed (`pnpm run scan` checks). Output validated before it is saved or returned. No stack traces in errors.

## 11. Risks

1. Free-tier limits/outages (429s) -> bounded retry, model swap by env.
2. Weak JSON from free models -> extract + zod + repair loop.
3. Coding agent drifting outside scope -> scope guard in every prompt, review the diff.
4. Scope creep -> V1 stops at draft + UI.
5. Repo reality differs from this doc -> recon prompt first.
